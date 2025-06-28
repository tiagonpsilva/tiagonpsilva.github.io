#!/bin/bash

# Script para criar as duas issues documentadas

echo "Criando Issue 1: Mixpanel Analytics..."
gh issue create \
  --title "Mixpanel Analytics Not Collecting Metrics in Production Environment" \
  --body-file ISSUE_MIXPANEL_PRODUCTION.md \
  --label "bug,analytics,production,mixpanel"

echo "Criando Issue 2: LinkedIn Authentication..."
gh issue create \
  --title "LinkedIn OAuth Authentication Errors: Blank Screen and Non-Responsive Button" \
  --body-file ISSUE_LINKEDIN_AUTH_ERRORS.md \
  --label "bug,authentication,oauth,linkedin,production"

echo "Issues criadas com sucesso!"
echo "Acesse: https://github.com/tiagonpsilva/tiagonpsilva.github.io/issues"