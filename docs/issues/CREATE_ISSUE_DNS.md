# GitHub Issue: DNS Configuration Problem

## Issue Title
DNS Configuration: tiagopinto.io showing Invalid Configuration on Vercel

## Labels
- bug
- infrastructure  
- dns

## Description

### Problem Description
The domain `tiagopinto.io` is showing "Invalid Configuration" status in Vercel Dashboard after DNS records were updated to point to Vercel infrastructure. This prevents the domain from properly serving the site with OAuth LinkedIn functionality.

### Steps to Reproduce
1. Configure DNS records in Hostinger:
   - A Record: `@` → `76.76.19.61` 
   - CNAME: `www` → `cname.vercel-dns.com`
2. Wait for DNS propagation
3. Check Vercel Dashboard → Domains section
4. Observe status: `tiagopinto.io` shows "Invalid Configuration"

### Expected Behavior
- `tiagopinto.io` should show "Valid Configuration" status
- Domain should serve the site with full OAuth LinkedIn functionality
- APIs should be accessible at `https://tiagopinto.io/api/*`

### Environment
- Platform: Vercel (Production)
- DNS Provider: Hostinger
- Domain: tiagopinto.io
- Previous setup: GitHub Pages
- Current working URL: https://tiagopintoio.vercel.app

### Investigation

**Current Configuration (Hostinger):**
- ✅ CNAME `www` → `cname.vercel-dns.com` (Valid)
- ✅ A Record `@` → `76.76.19.61` (Added)
- ❌ Old GitHub Pages A Records removed

**Vercel Dashboard Status:**
- ❌ `tiagopinto.io` - Invalid Configuration
- ✅ `www.tiagopinto.io` - Valid Configuration  
- ✅ `tiagopintoio.vercel.app` - Valid Configuration

**Root Cause Analysis:**
The "Invalid Configuration" status typically occurs when:
1. DNS records haven't fully propagated yet (15min - 24h)
2. A Record pointing to wrong IP
3. Vercel needs time to verify domain ownership

### Solution Implemented
1. **DNS Records Updated**: Configured correct A and CNAME records in Hostinger
2. **Removed Conflicting Records**: Removed old GitHub Pages A records
3. **Waiting for Propagation**: DNS changes can take up to 24 hours to propagate globally

### Verification Steps
**Pending:**
- [ ] Monitor Vercel Dashboard for status change to "Valid Configuration"
- [ ] Test `https://tiagopinto.io` loads correctly
- [ ] Verify APIs accessible at `https://tiagopinto.io/api/test`
- [ ] Test OAuth LinkedIn functionality on custom domain
- [ ] Check DNS propagation status using online tools

**DNS Propagation Check:**
```bash
# Command line verification
nslookup tiagopinto.io
dig tiagopinto.io

# Online tools
https://www.whatsmydns.net/
https://dnschecker.org/
```

### Related Files/Components
- `/vercel.json` - Vercel configuration
- `/api/auth/linkedin/*` - OAuth backend functions
- DNS records in Hostinger control panel
- LinkedIn Developer Console callback URLs

### Next Actions
1. Monitor DNS propagation (15min - 24h)
2. Update LinkedIn OAuth callback URLs when domain validates
3. Test full OAuth flow on custom domain
4. Document final working configuration

### Timeline
- **DNS Updated**: Current
- **Expected Resolution**: Within 24 hours
- **Status Check**: Monitor Vercel Dashboard periodically

---

**Related Documentation:**
- DNS_MIGRATION_GUIDE.md
- VERCEL_MIGRATION_GUIDE.md
- TROUBLESHOOTING_PRODUCTION_OAUTH.md

## Commands to Create Issue

```bash
# Via GitHub CLI
gh issue create --title "DNS Configuration: tiagopinto.io showing Invalid Configuration on Vercel" --body-file CREATE_ISSUE_DNS.md --label "bug,infrastructure,dns"

# Or manually via GitHub web interface:
# https://github.com/tiagonpsilva/tiagonpsilva.github.io/issues/new
```