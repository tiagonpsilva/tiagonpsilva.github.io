# Comandos para Criar Issues via GitHub CLI

## Comando 1: Issue Mixpanel Analytics

```bash
gh issue create \
--title "Mixpanel Analytics Not Collecting Metrics in Production Environment" \
--body "## Problem Description
Mixpanel analytics is not collecting metrics in the production environment at https://tiagopinto.io and https://tiagopintoio.vercel.app.

## Steps to Reproduce
1. Visit production site: https://tiagopintoio.vercel.app
2. Navigate through different pages (should trigger page view events)
3. Interact with navigation, projects, contact methods
4. Wait for modal authentication to appear (30s or 3 page views)
5. Check Mixpanel dashboard for events
6. No events are recorded

## Expected Behavior
- Page view events should be tracked automatically
- Navigation interactions should be logged
- All events should appear in Mixpanel dashboard

## Environment
- Platform: Vercel Production
- URL: https://tiagopintoio.vercel.app
- Mixpanel Integration: MixpanelContext + custom hooks

## Investigation
Need to verify:
- VITE_MIXPANEL_TOKEN in Vercel Dashboard
- Environment detection logic
- Mixpanel initialization

## Files to Investigate
- /src/contexts/MixpanelContext.tsx
- /src/hooks/useRouteTracking.tsx
- /src/utils/mixpanelConfig.ts

## Priority
High - Analytics are critical for user behavior tracking" \
--label "bug,analytics,production,mixpanel"
```

## Comando 2: Issue LinkedIn Authentication

```bash
gh issue create \
--title "LinkedIn OAuth Authentication Errors: Blank Screen and Non-Responsive Button" \
--body "## Problem Description
Multiple issues with LinkedIn OAuth authentication in production:

1. Blank Screen After Login: After successful authentication, clicking auth button results in blank screen
2. Non-Responsive Login Button: Sometimes login button does not execute actions
3. Inconsistent Behavior: Authentication flow works intermittently

## Steps to Reproduce

**Issue 1: Blank Screen**
1. Visit https://tiagopintoio.vercel.app
2. Complete LinkedIn authentication successfully
3. Click the profile/auth button again
4. Result: Blank white screen appears

**Issue 2: Non-Responsive Button**
1. Visit production site
2. Wait for authentication modal
3. Click login button
4. Result: Sometimes nothing happens

## Expected Behavior
- After authentication: Should show user profile or options
- Login button: Should always trigger LinkedIn OAuth popup
- Consistent authentication flow

## Environment
- Platform: Vercel Production
- URL: https://tiagopintoio.vercel.app
- OAuth Provider: LinkedIn
- Callback: https://tiagopintoio.vercel.app/auth/linkedin/callback

## Potential Causes
- Popup communication issues (postMessage)
- State management conflicts
- Event handler problems
- LinkedIn session conflicts
- Browser popup blocking

## Files to Investigate
- /src/contexts/AuthContext.tsx
- /src/components/AuthButton.tsx
- /src/components/LinkedInCallback.tsx
- /api/auth/linkedin/*

## Priority
High - Authentication is core functionality" \
--label "bug,authentication,oauth,linkedin,production"
```

## Como Executar

1. Abra terminal no diretório do projeto
2. Execute os comandos acima um por vez
3. Verifique se as issues foram criadas em: https://github.com/tiagonpsilva/tiagonpsilva.github.io/issues

## Alternativa: Interface Web

Se os comandos não funcionarem, acesse:
https://github.com/tiagonpsilva/tiagonpsilva.github.io/issues/new

E copie o conteúdo dos arquivos:
- ISSUE_MIXPANEL_PRODUCTION.md
- ISSUE_LINKEDIN_AUTH_ERRORS.md