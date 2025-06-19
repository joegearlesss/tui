# TUI Project Context

## Build/Test/Lint Commands
- **Test all**: `bun test`
- **Test single file**: `bun test user-service.test.ts`
- **Test by type**: `bun test "**/*.test.ts"` (unit), `bun test "**/*.performance.test.ts"` (perf), `bun test "**/integration/*.test.ts"` (integration), `bun test "**/e2e/*.test.ts"` (e2e)
- **Lint**: `bun run biome check`
- **Format**: `bun run biome format --write`
- **Typecheck**: `bunx tsc --noEmit`
- **Full check**: `bun run check` (lint + test)

## Technology Stack
- **Runtime**: Bun (not Node.js)
- **Testing**: Bun test framework
- **Linting/Formatting**: Biome
- **Validation**: Zod schemas with `.describe()` calls
- **Package Manager**: Bun workspace

## Code Style Guidelines
- **NO CLASSES**: Use namespaces and functional programming only
- **Imports**: No file extensions, prefer package-based imports (`@tui/styling/color`) over relative paths
- **Types**: Use union types (`'light' | 'dark'`) instead of generic strings, prefer `undefined` over `null`
- **Functions**: Pure functions in namespaces, immutable operations, max 20 lines
- **Formatting**: 2 spaces, single quotes, semicolons, 100 char line width
- **Naming**: kebab-case files, PascalCase namespaces, camelCase functions, UPPER_CASE constants
- **FORBIDDEN**: Classes, `!` operator, `any` type, `null` (use `undefined`), file extensions in imports

## Project Structure
- Monorepo with packages in `packages/` (currently only `styling`)
- Test files co-located with source: `.test.ts`, `.performance.test.ts`
- Integration/E2E tests in separate `tests/` folders
- Each package has `OVERVIEW.md` and implementation tracking files

## Error Handling & Validation
- Use Zod schemas with descriptive `.describe()` calls for all validation
- Return `Result<T, E>` types or `T | undefined` instead of throwing
- Handle `undefined` explicitly, avoid `any` type
- Use type guards and proper error boundaries