#!/bin/bash

echo "🧪 Starting Validation Tests..."
echo ""

# Backup config
cp ~/.dproc/config.yml ~/.dproc/config.yml.backup 2>/dev/null

# Test 1: Invalid provider
echo "Test 1: Invalid Provider"
cat > ~/.dproc/config.yml << EOF
llm:
  provider: anthropic
  model: test
  temperature: 0.7
defaultOutputDir: ./output
EOF
dproc config validate 2>&1 | grep -q "Invalid enum" && echo "✅ PASS" || echo "❌ FAIL"
echo ""

# Test 2: Temperature out of range
echo "Test 2: Temperature Out of Range"
cat > ~/.dproc/config.yml << EOF
llm:
  provider: gemini
  model: test
  temperature: 5
defaultOutputDir: ./output
EOF
dproc config validate 2>&1 | grep -q "less than or equal to 2" && echo "✅ PASS" || echo "❌ FAIL"
echo ""

# Test 3: Invalid report style
echo "Test 3: Invalid Report Style"
cat > ~/.dproc/config.yml << EOF
llm:
  provider: gemini
  model: test
  temperature: 0.7
defaultOutputDir: ./output
reports:
  defaultStyle: invalid
EOF
dproc config validate 2>&1 | grep -q "Invalid enum" && echo "✅ PASS" || echo "❌ FAIL"
echo ""

# Restore config
mv ~/.dproc/config.yml.backup ~/.dproc/config.yml 2>/dev/null

echo "🎉 Validation tests complete!"
