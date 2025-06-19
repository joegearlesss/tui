#!/bin/bash

# Visual Comparison Test Script
# Compares Go lipgloss output with TypeScript @tui/styling output

set -e

LIPGLOSS_PATH="/Users/alexeypolitov/LocalProjects/GitHub/lipgloss"
TUI_PATH="/Users/alexeypolitov/LocalProjects/GitHub/tui/packages/styling"
TEST_OUTPUT_DIR="$TUI_PATH/test-outputs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create output directory
mkdir -p "$TEST_OUTPUT_DIR"

echo "🧪 Visual Comparison Test Suite"
echo "==============================="

# Function to run a single test comparison
run_test() {
    local test_name="$1"
    local go_path="$2"
    local ts_path="$3"
    local description="$4"
    
    echo -e "\n📋 Testing: ${YELLOW}$test_name${NC}"
    echo "Description: $description"
    
    # Create test-specific output directory
    local test_dir="$TEST_OUTPUT_DIR/$test_name"
    mkdir -p "$test_dir"
    
    # Run Go version
    echo "  🟡 Running Go version..."
    if cd "$LIPGLOSS_PATH/$go_path" && go run main.go > "$test_dir/go_output.txt" 2>&1; then
        echo "  ✅ Go version completed"
    else
        echo -e "  ${RED}❌ Go version failed${NC}"
        return 1
    fi
    
    # Run TypeScript version
    echo "  🟡 Running TypeScript version..."
    if cd "$TUI_PATH/$ts_path" && bun run main.ts > "$test_dir/ts_output.txt" 2>&1; then
        echo "  ✅ TypeScript version completed"
    else
        echo -e "  ${RED}❌ TypeScript version failed${NC}"
        return 1
    fi
    
    # Compare outputs
    if diff -u "$test_dir/go_output.txt" "$test_dir/ts_output.txt" > "$test_dir/diff.txt"; then
        echo -e "  ${GREEN}✅ PASS: Outputs match exactly${NC}"
        rm "$test_dir/diff.txt"
        return 0
    else
        echo -e "  ${RED}❌ FAIL: Outputs differ${NC}"
        echo "  📄 Diff saved to: $test_dir/diff.txt"
        echo "  📄 Go output: $test_dir/go_output.txt"
        echo "  📄 TS output: $test_dir/ts_output.txt"
        return 1
    fi
}

# Function to display test results
show_results() {
    local passed=$1
    local failed=$2
    local total=$((passed + failed))
    
    echo -e "\n📊 Test Results"
    echo "==============="
    echo -e "Total tests: $total"
    echo -e "${GREEN}Passed: $passed${NC}"
    echo -e "${RED}Failed: $failed${NC}"
    
    if [ $failed -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED - 0 VISUAL REGRESSIONS!${NC}"
        return 0
    else
        echo -e "\n${RED}💥 $failed VISUAL REGRESSIONS DETECTED${NC}"
        return 1
    fi
}

# Test counters
PASSED=0
FAILED=0

# Test 1: Color Standalone
if run_test "color-standalone" "examples/color/standalone" "examples/color/standalone" "Basic color and styling test"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 2: Layout (most comprehensive)
if run_test "layout" "examples/layout" "examples/layout" "Complex layout with all components"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 3: Table - Chess
if run_test "table-chess" "examples/table/chess" "examples/table/chess" "Chess board table layout"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 4: Table - Languages
if run_test "table-languages" "examples/table/languages" "examples/table/languages" "Multi-column data table"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 5: List - Simple
if run_test "list-simple" "examples/list/simple" "examples/list/simple" "Basic list rendering"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 6: Tree - Simple
if run_test "tree-simple" "examples/tree/simple" "examples/tree/simple" "Basic tree structure"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Show final results
show_results $PASSED $FAILED