# 🔧 Mixpanel Troubleshooting Guide

## 🚨 Problem: Mixpanel Not Collecting Metrics in Production

### Quick Diagnosis

Access production site and check browser console:
```javascript
// In browser console at https://tiagopintoio.vercel.app
console.log('Mixpanel Debug:', {
  hasMixpanel: !!window.mixpanel,
  config: window.mixpanel?.get_config?.() || 'No config',
  envVars: {
    token: import.meta?.env?.VITE_MIXPANEL_TOKEN?.substring(0, 8) + '...',
    tokenProd: import.meta?.env?.VITE_MIXPANEL_TOKEN_PROD?.substring(0, 8) + '...',
    enabled: import.meta?.env?.VITE_ANALYTICS_ENABLED
  }
});
```

### Possible Causes & Solutions

#### 1. Environment Variables Missing in Vercel

**Check Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Verify these variables exist:

**Option A: Separate Tokens (Recommended)**
```
VITE_MIXPANEL_TOKEN_PROD=your_production_token
VITE_MIXPANEL_TOKEN_DEV=your_development_token
```

**Option B: Single Token**
```
VITE_MIXPANEL_TOKEN=your_token
VITE_ANALYTICS_ENABLED=true
```

#### 2. Environment Variables Not Applied

**Solution: Redeploy**
1. After adding environment variables in Vercel
2. Go to Deployments → Redeploy
3. Wait for deployment to complete
4. Test again

#### 3. Mixpanel Token Invalid

**Verify Token:**
1. Go to Mixpanel Dashboard: https://mixpanel.com/settings/project
2. Copy Project Token
3. Verify token format (should be ~32 characters)
4. Test token in Mixpanel's debug mode

#### 4. Build Process Issue

**Check Build Logs:**
1. Vercel Dashboard → Deployments → View Function Logs
2. Look for Mixpanel-related errors
3. Verify environment variables are available during build

### Step-by-Step Fix

#### Step 1: Add Environment Variables
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Add one of these strategies:

# Strategy 1: Separate tokens
VITE_MIXPANEL_TOKEN_PROD=abc123...
VITE_MIXPANEL_TOKEN_DEV=def456...

# Strategy 2: Single token  
VITE_MIXPANEL_TOKEN=abc123...
VITE_ANALYTICS_ENABLED=true
```

#### Step 2: Redeploy
1. Vercel Dashboard → Deployments
2. Click "..." → Redeploy
3. Wait for completion

#### Step 3: Test
```javascript
// Browser console test:
fetch('/api/mixpanel-debug').then(r => r.text()).then(console.log);

// Or manual check:
console.log('🔧 Mixpanel Check:', {
  library: !!window.mixpanel,
  initialized: !!window.mixpanel?.track,
  config: window.mixpanel?.get_config?.()
});

// Test tracking:
if (window.mixpanel?.track) {
  window.mixpanel.track('Manual Test Event', { test: true });
  console.log('✅ Test event sent');
}
```

#### Step 4: Verify in Mixpanel
1. Go to Mixpanel Dashboard
2. Live View → Events
3. Look for events from your site
4. Check for "Manual Test Event" if you ran the test

### Console Output Expected

**Working Configuration:**
```
🔧 Mixpanel Configuration: {
  environment: "production",
  enabled: true,
  hasToken: true,
  tokenPreview: "abc12345...",
  envCheck: {
    VITE_MIXPANEL_TOKEN_PROD: "abc12345..."
  }
}
🎯 Mixpanel: Using production token - Analytics ENABLED
🎯 Mixpanel initialized successfully (production)
👤 User identified: user_123... (anonymous)
```

**Broken Configuration:**
```
🔧 Mixpanel Configuration: {
  environment: "production", 
  enabled: false,
  hasToken: false,
  tokenPreview: "none",
  envCheck: {
    VITE_MIXPANEL_TOKEN_PROD: "missing"
  }
}
⚠️ No Mixpanel token found! Check environment variables
⚠️ Mixpanel analytics disabled for this environment
```

### Production URLs to Test

After fixing:
- Site: https://tiagopintoio.vercel.app
- Debug tool: https://tiagopintoio.vercel.app/api/mixpanel-debug
- Test different pages to trigger page view events

### Common Mistakes

1. **Wrong Variable Names**: Must use `VITE_` prefix
2. **Scope Issues**: Set for Production, Preview, AND Development
3. **Missing Redeploy**: Changes require redeploy to take effect
4. **Token Format**: Ensure token is valid Mixpanel project token
5. **Strategy Confusion**: Pick ONE strategy and stick to it

### Verification Commands

```bash
# Check if environment variables are set (in Vercel CLI)
vercel env ls

# Force redeploy
vercel --prod

# Check deployment logs
vercel logs [deployment-url]
```

---

## Next Steps After Fix

1. ✅ Verify console shows "Analytics ENABLED"
2. ✅ Test manual event tracking
3. ✅ Check Mixpanel Live View for events
4. ✅ Navigate site to trigger page views
5. ✅ Verify user interactions are tracked
6. ✅ Update GitHub issue with resolution