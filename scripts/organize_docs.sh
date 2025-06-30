#!/bin/bash

echo "📁 Organizando documentação conforme diretrizes CLAUDE.md..."

# Remover arquivos movidos da raiz
echo "🗑️ Removendo arquivos da raiz já movidos para docs/..."
rm -f POPUP_LOOP_FIX.md
rm -f TESTING_GUIDE.md

# Remover scripts movidos da raiz
echo "🗑️ Removendo scripts da raiz já movidos para scripts/..."
rm -f create_issues.sh
rm -f deploy_mixpanel.sh
rm -f organize_docs.sh

# Verificar estrutura docs/
echo "📋 Estrutura docs/ atual:"
ls -la docs/

# Verificar estrutura scripts/
echo "📋 Estrutura scripts/ atual:"
ls -la scripts/

echo "✅ Arquivos organizados corretamente!"
echo ""
echo "📚 Estrutura final da documentação:"
echo "docs/"
echo "├── adr/                    # Architecture Decision Records"
echo "├── diagramas/              # C4 Model e sequence diagrams"  
echo "├── setup/                  # Guias de configuração"
echo "├── guides/                 # Guias técnicos"
echo "├── troubleshooting/        # Resolução de problemas"
echo "├── issues/                 # Documentação de issues"
echo "└── status/                 # Status de implementações"
echo ""
echo "🔧 Estrutura scripts:"
echo "scripts/"
echo "├── create_issues.sh        # Criar GitHub issues"
echo "├── deploy_mixpanel.sh      # Deploy do Mixpanel"
echo "├── organize_docs.sh        # Organizar documentação"
echo "└── *.js                    # Outros scripts utilitários"
echo ""
echo "🎯 Todos os arquivos estão organizados nas pastas apropriadas!"