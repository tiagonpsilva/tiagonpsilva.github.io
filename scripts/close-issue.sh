#!/bin/bash

# Script para fechar GitHub Issues com resolução detalhada seguindo CLAUDE.md
# Uso: ./scripts/close-issue.sh <issue_number>

if [ $# -eq 0 ]; then
    echo "❌ Erro: Número da issue é obrigatório"
    echo "📖 Uso: $0 <issue_number>"
    echo "💡 Exemplo: $0 5"
    exit 1
fi

ISSUE_NUMBER="$1"

# Verificar se a issue existe
if ! gh issue view "$ISSUE_NUMBER" >/dev/null 2>&1; then
    echo "❌ Erro: Issue #$ISSUE_NUMBER não encontrada"
    exit 1
fi

echo "🔍 Issue #$ISSUE_NUMBER encontrada"
echo "📝 Por favor, forneça os detalhes da resolução:"
echo ""

# Coletar informações da resolução
echo "🔧 Descreva a solução implementada:"
read -p "> " SOLUTION

echo ""
echo "✅ Como a correção foi verificada:"
read -p "> " VERIFICATION

echo ""
echo "📁 Arquivos/componentes modificados (opcional):"
read -p "> " FILES

echo ""
echo "🔗 Commits relacionados (opcional, ex: abc123, def456):"
read -p "> " COMMITS

# Construir comentário de resolução
RESOLUTION_COMMENT="## Resolution Completed ✅

**Solution Implemented:**
$SOLUTION

**Verification:**
$VERIFICATION"

if [ -n "$FILES" ]; then
    RESOLUTION_COMMENT="$RESOLUTION_COMMENT

**Files/Components Modified:**
$FILES"
fi

if [ -n "$COMMITS" ]; then
    RESOLUTION_COMMENT="$RESOLUTION_COMMENT

**Related Commits:**
$COMMITS"
fi

RESOLUTION_COMMENT="$RESOLUTION_COMMENT

---
📋 **Issue closed following CLAUDE.md Issue Management Protocol**
🕒 **Resolved on:** $(date '+%Y-%m-%d %H:%M:%S')
"

echo ""
echo "📤 Fechando issue com resolução..."

# Fechar issue
if gh issue close "$ISSUE_NUMBER" --comment "$RESOLUTION_COMMENT" >/dev/null 2>&1; then
    echo "✅ Issue #$ISSUE_NUMBER fechada com sucesso!"
    echo "🔗 Detalhes: $(gh issue view "$ISSUE_NUMBER" --web 2>/dev/null || echo "Visualize no GitHub")"
else
    echo "❌ Erro ao fechar issue. Verifique permissões e conectividade."
fi