#!/bin/bash

# DenGrow - Documentation Reorganization Script
# Purpose: Clean up temporary docs and organize permanent documentation
# Date: 2026-02-04

set -e  # Exit on error

echo "🔧 DenGrow Documentation Reorganization"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "docs" ]; then
    echo "❌ Error: Must run from dengrow root directory"
    exit 1
fi

echo "📁 Creating directory structure..."
mkdir -p docs/milestones

echo ""
echo "📝 Moving permanent documentation..."

# Move AGENTS.md to CONTRIBUTING.md (critical for contributors)
if [ -f "AGENTS.md" ]; then
    mv AGENTS.md CONTRIBUTING.md
    echo "  ✅ Moved AGENTS.md → CONTRIBUTING.md"
fi

# Move permanent docs to proper locations
if [ -f "SECURITY_REVIEW.md" ]; then
    mv SECURITY_REVIEW.md docs/SECURITY.md
    echo "  ✅ Moved SECURITY_REVIEW.md → docs/SECURITY.md"
fi

if [ -f "M1_COMPLETION_REPORT.md" ]; then
    mv M1_COMPLETION_REPORT.md docs/milestones/M1_COMPLETION.md
    echo "  ✅ Moved M1_COMPLETION_REPORT.md → docs/milestones/M1_COMPLETION.md"
fi

if [ -f "TESTNET_DEPLOYMENT_GUIDE.md" ]; then
    mv TESTNET_DEPLOYMENT_GUIDE.md docs/DEPLOYMENT.md
    echo "  ✅ Moved TESTNET_DEPLOYMENT_GUIDE.md → docs/DEPLOYMENT.md"
fi

echo ""
echo "🗑️  Removing temporary documentation..."

# Remove temporary files
temp_files=(
    "AUDIT_REPORT.md"
    "M1_CHECKLIST.md"
    "SECURITY_FIX_APPLIED.md"
    "CHANGES_FOR_TESTNET.md"
    "DOCS_CLASSIFICATION.md"  # This script's planning doc
    "DOCS_SUMMARY.md"         # This script's summary
)

for file in "${temp_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "  🗑️  Removed $file"
    fi
done

echo ""
echo "📋 Updating .gitignore..."

# Add patterns to .gitignore if not already present
if ! grep -q "# Temporary documentation" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# Temporary documentation
*_CHECKLIST.md
*_REPORT_TEMP.md
CHANGES_FOR_*.md
*_SNAPSHOT.md
EOF
    echo "  ✅ Added temporary doc patterns to .gitignore"
else
    echo "  ℹ️  .gitignore already configured"
fi

echo ""
echo "📚 Updating README.md..."

# Check if README already has Documentation section
if ! grep -q "## Documentation" README.md 2>/dev/null; then
    cat >> README.md << 'EOF'

## Documentation

Complete project documentation is available in the `docs/` directory:

- **[Product Requirements](docs/PRD.md)** - Product vision and requirements
- **[Master Plan](docs/MASTER_PLAN.md)** - Complete roadmap with milestones and DoD
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy contracts to testnet/mainnet
- **[Security Review](docs/SECURITY.md)** - Security considerations and audits
- **[Task Backlog](docs/TASKS.md)** - Current development tasks
- **[Roadmap](docs/ROADMAP.md)** - High-level project phases

### Milestones

- **[M1: Core On-Chain Gameplay](docs/milestones/M1_COMPLETION.md)** ✅ Completed

EOF
    echo "  ✅ Added Documentation section to README.md"
else
    echo "  ℹ️  README.md already has Documentation section"
fi

echo ""
echo "📊 Final structure:"
echo ""
tree -L 2 docs/ 2>/dev/null || {
    echo "docs/"
    ls -la docs/ | tail -n +4 | awk '{print "  "$NF}'
    if [ -d "docs/milestones" ]; then
        echo "  milestones/"
        ls -la docs/milestones/ | tail -n +4 | awk '{print "    "$NF}'
    fi
}

echo ""
echo "✅ Reorganization complete!"
echo ""
echo "📋 Git status:"
git status --short

echo ""
echo "🎯 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Stage files: git add docs/ .gitignore README.md"
echo "  3. Commit: git commit -m 'docs: reorganize documentation structure'"
echo ""
