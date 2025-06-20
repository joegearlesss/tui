import { describe, test, expect } from 'bun:test';
import { Result } from '../../src/utils/result';
import { BorderValidation } from '../../src/border/validation';
import { validateListConfigSafe } from '../../src/components/list/validation';
import { TreeValidation } from '../../src/components/tree/validation';
import { CanvasValidation } from '../../src/canvas/validation';
import { List } from '../../src/components/list/operations';
import type { BorderConfig } from '../../src/border/types';
import type { ListConfig } from '../../src/components/list/types';

/**
 * Integration tests for Result-based validation workflows
 * Tests complex validation chains and error handling patterns across components
 */
describe('Result-Based Validation Integration', () => {
  describe('Validation Chain Workflows', () => {
    test('chains multiple validation steps with Result.chain()', () => {
      const borderData = {
        type: 'normal' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        sides: [true, true, true, true],
      };

      // Chain validation with business logic
      const result = Result.chain(
        BorderValidation.validateBorderConfigSafe(borderData),
        (border) => {
          // Additional business rule: must have all sides enabled for "complete" borders
          const hasAllSides = border.sides.every(side => side);
          return hasAllSides 
            ? Result.ok({ ...border, isComplete: true })
            : Result.err(new Error('Border must have all sides enabled for complete borders'));
        }
      );

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.isComplete).toBe(true);
        expect(result.value.chars.top).toBe('─');
      }
    });

    test('validates complex data structures with Result.all()', () => {
      // Validate multiple components simultaneously
      const borderData = {
        type: 'double' as const,
        chars: {
          top: '═', right: '║', bottom: '═', left: '║',
          topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
        },
        sides: [true, true, true, true],
      };

      const listData = {
        items: ['Item 1', 'Item 2', 'Item 3'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };

      const treeData = {
        root: { value: 'Root', children: [], expanded: true },
        enumerator: () => '├─',
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      // Validate all components
      const validations = [
        BorderValidation.validateBorderConfigSafe(borderData),
        validateListConfigSafe(listData),
        TreeValidation.validateTreeConfigSafe(treeData),
      ];

      const allResults = Result.all(validations);

      expect(Result.isOk(allResults)).toBe(true);
      if (Result.isOk(allResults)) {
        const [border, list, tree] = allResults.value;
        expect(border.chars.top).toBe('═');
        expect(list.items).toHaveLength(3);
        expect(tree.root?.value).toBe('Root');
      }
    });

    test('handles validation failure gracefully with fallbacks', () => {
      const invalidBorderData = {
        chars: {
          top: '', // Invalid: empty string
          right: '│',
          // Missing required fields
        },
      };

      const defaultBorder: BorderConfig = {
        type: 'normal',
        chars: {
          top: '─', right: '│', bottom: '─', left: '│',
          topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
        },
        sides: [true, true, true, true],
      };

      // Validate with fallback
      const result = BorderValidation.validateBorderConfigSafe(invalidBorderData);
      const finalBorder = Result.unwrapOrElse(result, (error) => {
        // Log the error in a real application
        expect(error.issues).toBeDefined();
        return defaultBorder;
      });

      expect(finalBorder).toEqual(defaultBorder);
      expect(finalBorder.chars.top).toBe('─');
    });
  });

  describe('Complex Validation Workflows', () => {
    test('validates and processes form-like data structure', () => {
      interface ComponentForm {
        border: BorderConfig;
        list: ListConfig;
        canvas: {
          layers: unknown[];
        };
      }

      const formData = {
        border: {
          type: 'normal' as const,
          chars: {
            top: '─', right: '│', bottom: '─', left: '│',
            topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
          },
          sides: [true, false, true, false], // Only top and bottom
        },
        list: {
          items: ['Form Item 1', 'Form Item 2'],
          enumerator: () => '→',
          hidden: false,
          indentLevel: 1,
        },
        canvas: {
          layers: ['layer1', 'layer2'],
        },
      };

      // Validate each section
      const borderValidation = BorderValidation.validateBorderConfigSafe(formData.border);
      const listValidation = validateListConfigSafe(formData.list);
      const canvasValidation = CanvasValidation.validateCanvasConfigSafe(formData.canvas);

      // Combine validations
      const formValidation = Result.chain(
        Result.all([borderValidation, listValidation, canvasValidation]),
        ([border, list, canvas]) => {
          // Business logic: list items must match border sides pattern
          const enabledSides = border.sides.filter(Boolean).length;
          const itemCount = list.items.length;
          
          if (enabledSides === itemCount) {
            return Result.ok({ border, list, canvas, isValid: true });
          } else {
            return Result.err(new Error(`Enabled sides (${enabledSides}) must match item count (${itemCount})`));
          }
        }
      );

      expect(Result.isOk(formValidation)).toBe(true);
      if (Result.isOk(formValidation)) {
        expect(formValidation.value.isValid).toBe(true);
        expect(formValidation.value.border.sides.filter(Boolean)).toHaveLength(2);
        expect(formValidation.value.list.items).toHaveLength(2);
      }
    });

    test('creates validation pipeline with error accumulation', () => {
      interface ValidationErrors {
        borderErrors: string[];
        listErrors: string[];
        treeErrors: string[];
      }

      // Invalid data
      const invalidData = {
        border: { invalid: 'data' },
        list: { items: 'not-an-array' },
        tree: { root: null, enumerator: 'not-a-function' },
      };

      // Collect all errors instead of failing fast
      const borderResult = BorderValidation.validateBorderConfigSafe(invalidData.border);
      const listResult = validateListConfigSafe(invalidData.list);
      const treeResult = TreeValidation.validateTreeConfigSafe(invalidData.tree);

      const errors: ValidationErrors = {
        borderErrors: Result.isErr(borderResult) 
          ? borderResult.error.issues.map(issue => issue.message)
          : [],
        listErrors: Result.isErr(listResult)
          ? listResult.error.issues.map(issue => issue.message)
          : [],
        treeErrors: Result.isErr(treeResult)
          ? treeResult.error.issues.map(issue => issue.message)
          : [],
      };

      // All should have errors
      expect(errors.borderErrors.length).toBeGreaterThan(0);
      expect(errors.listErrors.length).toBeGreaterThan(0);
      expect(errors.treeErrors.length).toBeGreaterThan(0);

      // Should contain meaningful error messages
      expect(errors.borderErrors.some(err => err.includes('Required'))).toBe(true);
      expect(errors.listErrors.some(err => err.includes('array'))).toBe(true);
      expect(errors.treeErrors.some(err => err.includes('function'))).toBe(true);
    });
  });

  describe('Functional Composition Patterns', () => {
    test('creates reusable validation combinators', () => {
      // Create a validator that ensures list has items and valid border
      const validateListWithBorder = (data: { list: unknown; border: unknown }) => {
        return Result.chain(
          Result.all([
            validateListConfigSafe(data.list),
            BorderValidation.validateBorderConfigSafe(data.border),
          ]),
          ([list, border]) => {
            // Ensure list has items
            if (list.items.length === 0) {
              return Result.err(new Error('List must have at least one item'));
            }
            
            // Ensure border is complete
            if (!border.sides.every(Boolean)) {
              return Result.err(new Error('Border must have all sides enabled'));
            }

            return Result.ok({ list, border });
          }
        );
      };

      // Test with valid data
      const validData = {
        list: {
          items: ['Item 1', 'Item 2'],
          enumerator: () => '•',
          hidden: false,
          indentLevel: 0,
        },
        border: {
          type: 'normal' as const,
          chars: {
            top: '─', right: '│', bottom: '─', left: '│',
            topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
          },
          sides: [true, true, true, true],
        },
      };

      const result = validateListWithBorder(validData);
      expect(Result.isOk(result)).toBe(true);

      // Test with empty list
      const emptyListData = {
        ...validData,
        list: { ...validData.list, items: [] },
      };

      const emptyResult = validateListWithBorder(emptyListData);
      expect(Result.isErr(emptyResult)).toBe(true);
      if (Result.isErr(emptyResult)) {
        expect(emptyResult.error.message).toContain('must have at least one item');
      }
    });

    test('creates validation middleware pattern', () => {
      // Middleware that logs validation attempts
      const withLogging = <T, E>(
        validator: (data: unknown) => Result<T, E>,
        label: string
      ) => {
        return (data: unknown): Result<T, E> => {
          const result = validator(data);
          
          // In a real app, this would use proper logging
          if (Result.isOk(result)) {
            console.log(`✓ ${label} validation passed`);
          } else {
            console.log(`✗ ${label} validation failed`);
          }
          
          return result;
        };
      };

      // Middleware that adds timestamps
      const withTimestamp = <T, E>(
        validator: (data: unknown) => Result<T, E>
      ) => {
        return (data: unknown): Result<T & { validatedAt: number }, E> => {
          const result = validator(data);
          return Result.map(result, (value) => ({
            ...value,
            validatedAt: Date.now(),
          }));
        };
      };

      // Create enhanced validators
      const enhancedBorderValidator = withTimestamp(
        withLogging(BorderValidation.validateBorderConfigSafe, 'Border')
      );

      const validBorderData = {
        type: 'normal' as const,
        chars: {
          top: '─', right: '│', bottom: '─', left: '│',
          topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
        },
        sides: [true, true, true, true],
      };

      const result = enhancedBorderValidator(validBorderData);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.validatedAt).toBeGreaterThan(0);
        expect(result.value.chars.top).toBe('─');
      }
    });
  });

  describe('Error Recovery Patterns', () => {
    test('implements retry pattern with validation', () => {
      let attempts = 0;
      
      // Simulate a validation that fails first few times
      const flakyValidator = (data: unknown): Result<{ value: string }, Error> => {
        attempts++;
        if (attempts < 3) {
          return Result.err(new Error(`Attempt ${attempts} failed`));
        }
        return Result.ok({ value: 'Success!' });
      };

      // Retry utility
      const withRetry = <T, E>(
        validator: (data: unknown) => Result<T, E>,
        maxAttempts: number
      ) => {
        return (data: unknown): Result<T, E> => {
          let lastError: E | undefined;
          
          for (let i = 0; i < maxAttempts; i++) {
            const result = validator(data);
            if (Result.isOk(result)) {
              return result;
            }
            lastError = result.error;
          }
          
          return Result.err(lastError!);
        };
      };

      const retryValidator = withRetry(flakyValidator, 5);
      const result = retryValidator({});

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.value).toBe('Success!');
      }
      expect(attempts).toBe(3); // Should succeed on 3rd attempt
    });

    test('implements circuit breaker pattern for validation', () => {
      let failures = 0;
      let isOpen = false;

      // Circuit breaker utility
      const withCircuitBreaker = <T, E>(
        validator: (data: unknown) => Result<T, E>,
        threshold: number
      ) => {
        return (data: unknown): Result<T, E> => {
          if (isOpen) {
            return Result.err(new Error('Circuit breaker is open') as E);
          }

          const result = validator(data);
          
          if (Result.isErr(result)) {
            failures++;
            if (failures >= threshold) {
              isOpen = true;
            }
          } else {
            failures = 0; // Reset on success
          }

          return result;
        };
      };

      const failingValidator = (): Result<string, Error> => {
        return Result.err(new Error('Always fails'));
      };

      const protectedValidator = withCircuitBreaker(failingValidator, 3);

      // First 3 calls should fail normally
      expect(Result.isErr(protectedValidator({}))).toBe(true);
      expect(Result.isErr(protectedValidator({}))).toBe(true);
      expect(Result.isErr(protectedValidator({}))).toBe(true);

      // 4th call should be circuit breaker error
      const circuitBreakerResult = protectedValidator({});
      expect(Result.isErr(circuitBreakerResult)).toBe(true);
      if (Result.isErr(circuitBreakerResult)) {
        expect(circuitBreakerResult.error.message).toContain('Circuit breaker is open');
      }
    });
  });

  describe('Real-World Application Patterns', () => {
    test('validates user configuration with comprehensive error handling', () => {
      interface UserConfig {
        ui: {
          border: BorderConfig;
          list: ListConfig;
        };
        display: {
          canvas: { layers: unknown[] };
        };
      }

      const userConfigData = {
        ui: {
          border: {
            type: 'normal' as const,
            chars: {
              top: '─', right: '│', bottom: '─', left: '│',
              topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
            },
            sides: [true, true, true, true],
          },
          list: {
            items: ['Home', 'Settings', 'Help'],
            enumerator: List.Enumerator.ARABIC,
            hidden: false,
            indentLevel: 0,
          },
        },
        display: {
          canvas: { layers: [] },
        },
      };

      // Create comprehensive validator
      const validateUserConfig = (data: unknown): Result<UserConfig, Error> => {
        if (typeof data !== 'object' || data === null) {
          return Result.err(new Error('Config must be an object'));
        }

        const config = data as any;

        return Result.chain(
          Result.all([
            BorderValidation.validateBorderConfigSafe(config.ui?.border),
            validateListConfigSafe(config.ui?.list),
            CanvasValidation.validateCanvasConfigSafe(config.display?.canvas),
          ]),
          ([border, list, canvas]) => {
            // Additional business rules
            if (list.items.length === 0) {
              return Result.err(new Error('UI list must have navigation items'));
            }

            return Result.ok({
              ui: { border, list },
              display: { canvas },
            });
          }
        );
      };

      const result = validateUserConfig(userConfigData);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.ui.list.items).toContain('Home');
        expect(result.value.ui.border.sides).toEqual([true, true, true, true]);
        expect(result.value.display.canvas.layers).toEqual([]);
      }
    });
  });
});