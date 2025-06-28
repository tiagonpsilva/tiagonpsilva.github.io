#!/bin/bash

# Script para criar GitHub Issues seguindo o protocolo do CLAUDE.md
# Uso: ./scripts/create-issue.sh "Título da Issue" "bug|enhancement|documentation"

if [ $# -eq 0 ]; then
    echo "❌ Erro: Título da issue é obrigatório"
    echo "📖 Uso: $0 \"Título da Issue\" [tipo]"
    echo "🏷️  Tipos disponíveis: bug, enhancement, documentation, infrastructure"
    exit 1
fi

TITLE="$1"
TYPE="${2:-bug}"

# Template de issue seguindo CLAUDE.md
ISSUE_BODY="## Problem Description
[Detailed description of the issue]

## Steps to Reproduce
1. [Step one]
2. [Step two]
3. [Result observed]

## Expected Behavior
[What should happen instead]

## Environment
- OS: $(uname -s)
- Browser: [If applicable]
- Node.js: $(node --version 2>/dev/null || echo 'N/A')
- Platform: [Development/Production]

## Investigation
[Analysis performed, logs, error messages]

## Solution Implemented
[Detailed steps taken to resolve - to be filled during resolution]

## Verification
[How the fix was tested and verified - to be filled during resolution]

## Related Files/Components
[List of modified files and components - to be filled during resolution]

---
📋 **Issue created following CLAUDE.md Issue Management Protocol**
🔗 **Template version:** $(date +%Y-%m-%d)
"

echo "🚀 Criando issue: $TITLE"
echo "🏷️  Tipo: $TYPE"

# Criar issue usando gh CLI
ISSUE_URL=$(gh issue create \
    --title "$TITLE" \
    --body "$ISSUE_BODY" \
    --label "$TYPE" \
    2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Issue criada com sucesso!"
    echo "🔗 URL: $ISSUE_URL"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Edite a issue para preencher os detalhes específicos"
    echo "   2. Durante a resolução, atualize as seções 'Solution Implemented' e 'Verification'"
    echo "   3. Use 'gh issue close X --comment \"Resolução...\"' para fechar com detalhes"
else
    echo "❌ Erro ao criar issue. Verifique se:"
    echo "   - gh CLI está autenticado: gh auth status"
    echo "   - Repositório tem permissões corretas"
    echo "   - Label '$TYPE' existe no repositório"
fi