#!/bin/bash

# Go Lipgloss Reference Output Generation Script
# Generates reference outputs from Go Lipgloss examples for visual parity testing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LIPGLOSS_DIR="$PROJECT_DIR/lipgloss"
REFERENCE_DIR="$PROJECT_DIR/test-references"
OUTPUT_DIR="$PROJECT_DIR/test-outputs"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Create necessary directories
mkdir -p "$REFERENCE_DIR"
mkdir -p "$OUTPUT_DIR"

# Examples to generate reference outputs for (format: "key:path")
EXAMPLES=(
    "color-standalone:color/standalone"
    "list-simple:list/simple"
    "list-grocery:list/grocery"
    "table-chess:table/chess"
    "table-languages:table/languages"
    "layout:layout"
    "tree-simple:tree/simple"
)

log_info "Starting Go Lipgloss reference generation..."

# Check if Lipgloss directory exists
if [[ ! -d "$LIPGLOSS_DIR" ]]; then
    log_error "Lipgloss directory not found at $LIPGLOSS_DIR"
    exit 1
fi

cd "$LIPGLOSS_DIR/examples"

# Ensure Go modules are initialized
if [[ ! -f "go.mod" ]]; then
    log_info "Initializing Go modules in examples directory..."
    go mod init lipgloss-examples
    go mod tidy
fi

log_info "Building and running Go examples..."

# Generate reference outputs
for example_entry in "${EXAMPLES[@]}"; do
    example_key="${example_entry%%:*}"
    example_path="${example_entry##*:}"
    reference_file="$REFERENCE_DIR/${example_key}-reference.txt"
    go_output_file="$OUTPUT_DIR/${example_key}/go_output.txt"
    
    log_info "Processing: $example_key ($example_path)"
    
    # Create output directory for comparison files
    mkdir -p "$OUTPUT_DIR/$example_key"
    
    # Check if Go example exists
    if [[ ! -f "$example_path/main.go" ]]; then
        log_warning "Go example not found: $example_path/main.go - skipping"
        continue
    fi
    
    # Build and run Go example
    if cd "$example_path" && go run main.go > "$reference_file" 2>/dev/null; then
        # Also save to output directory for comparison
        cp "$reference_file" "$go_output_file"
        log_success "Generated reference: $example_key"
        
        # Show preview of generated output
        echo -e "${BLUE}Preview of $example_key:${NC}"
        head -10 "$reference_file" | sed 's/^/  /'
        if [[ $(wc -l < "$reference_file") -gt 10 ]]; then
            echo "  ..."
        fi
        echo
    else
        log_error "Failed to generate reference for: $example_key"
        # Try to capture error output
        if ! go run main.go > /dev/null 2> "$OUTPUT_DIR/${example_key}/go_error.txt"; then
            log_error "Error details saved to: $OUTPUT_DIR/${example_key}/go_error.txt"
        fi
    fi
    
    # Return to examples directory
    cd "$LIPGLOSS_DIR/examples"
done

log_info "Reference generation complete!"

# Generate summary
reference_count=$(find "$REFERENCE_DIR" -name "*-reference.txt" | wc -l)
log_success "Generated $reference_count reference files in $REFERENCE_DIR"

# List generated files
if [[ $reference_count -gt 0 ]]; then
    echo -e "${BLUE}Generated reference files:${NC}"
    find "$REFERENCE_DIR" -name "*-reference.txt" -exec basename {} \; | sort | sed 's/^/  • /'
fi

echo
log_info "You can now run visual regression tests with:"
echo "  bun test tests/visual/visual-regression.test.ts"