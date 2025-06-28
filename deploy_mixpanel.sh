#!/bin/bash

# Script para deploy do Mixpanel
echo "🚀 Iniciando deploy do Mixpanel..."

# 1. Verificar status atual
echo "📋 Status atual:"
git status
echo ""

# 2. Adicionar arquivos modificados (incluindo novos arquivos do Mixpanel)
echo "➕ Adicionando arquivos..."
git add .

# 3. Commit das mudanças do Mixpanel
echo "💾 Fazendo commit..."
git commit -m "$(cat <<'EOF'
feat: implementar analytics completo com Mixpanel

- Adicionar MixpanelContext com hooks personalizados
- Implementar rastreamento automático de page views
- Adicionar tracking de interações (navegação, projetos, contato)
- Configurar ambiente dev/prod com tokens separados
- Criar debug tools e troubleshooting guides
- Integrar analytics em todos os componentes principais

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 4. Verificar se estamos na branch correta
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

# 5. Fazer checkout para main se necessário
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Mudando para main..."
    git checkout main
    
    # 6. Merge da feature branch
    echo "🔀 Fazendo merge da branch $CURRENT_BRANCH..."
    git merge $CURRENT_BRANCH --no-ff -m "feat: merge Mixpanel analytics implementation

Merge da implementação completa do Mixpanel analytics incluindo:
- Context e hooks personalizados
- Rastreamento automático e manual
- Configuração de ambiente dev/prod
- Debug tools e documentação

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# 7. Push para main (ativa deploy automático no Vercel)
echo "🚀 Fazendo push para main..."
git push origin main

# 8. Verificar status final
echo "✅ Deploy iniciado! Status final:"
git status
echo ""
echo "🌐 O Vercel fará o deploy automático em alguns minutos."
echo "📊 Mixpanel estará ativo em: https://tiagopintoio.vercel.app"
echo ""
echo "🔧 Para verificar se funcionou:"
echo "1. Acesse: https://tiagopintoio.vercel.app"
echo "2. Abra o console do browser (F12)"
echo "3. Procure por: '🎯 Mixpanel initialized successfully'"
echo "4. Debug tool: https://tiagopintoio.vercel.app/api/mixpanel-debug"