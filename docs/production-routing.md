# Production Edge Guardrails

This file records the Vercel project-level routes and firewall rule that are
active on production. They are managed outside normal code deployments, so they
can protect the live site even when the daily deployment quota is exhausted.

Last verified: 2026-06-17

## Active Routes

The production project currently has four enabled project-level routes:

1. `Block Untrusted Origin Public APIs`
   - Source: `^/api/(send-email|analytics)$`
   - Action: `403`
   - Condition: `Origin` exists and does not match `https://suiyuecare.com` or `https://www.suiyuecare.com`

2. `Block Missing Origin Public APIs`
   - Source: `^/api/(send-email|analytics)$`
   - Action: `403`
   - Condition: missing `Origin`

3. `Sensitive Paths Noindex No-store`
   - Source: `^/(admin|portal|api)(/.*)?$|^/assets/backups(/.*)?$`
   - Headers:
     - `X-Robots-Tag: noindex, nofollow`
     - `Cache-Control: no-store`

4. `Security Headers Baseline`
   - Source: `^/.*$`
   - Headers:
     - `Content-Security-Policy: object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests`
     - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
     - `X-Frame-Options: SAMEORIGIN`

## Active Firewall Rules

The production project currently has one enabled custom firewall rule:

1. `Public API Rate Limit`
   - ID: `rule_public_api_rate_limit_6GuG3F`
   - Conditions:
     - Path matches regex `^/api/(send-email|analytics)$`
     - Method equals `POST`
   - Action: rate limit
   - Algorithm: `fixed_window`
   - Window: `60s`
   - Limit: `120` requests
   - Key: `ip`
   - If exceeded: `deny`

## Export

Current export from `vercel routes export`:

```json
{
  "routes": [
    {
      "src": "^/api/(send-email|analytics)$",
      "status": 403,
      "has": [
        {
          "type": "header",
          "key": "origin",
          "value": "^(?!https://(www\\.)?suiyuecare\\.com$).+"
        }
      ]
    },
    {
      "src": "^/api/(send-email|analytics)$",
      "status": 403,
      "missing": [
        {
          "type": "header",
          "key": "origin"
        }
      ]
    },
    {
      "src": "^/(admin|portal|api)(/.*)?$|^/assets/backups(/.*)?$",
      "headers": {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store"
      }
    },
    {
      "src": "^/.*$",
      "headers": {
        "Content-Security-Policy": "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "X-Frame-Options": "SAMEORIGIN"
      }
    }
  ]
}
```

## Verification

Run these checks after editing routes:

```bash
pnpm dlx vercel routes list
pnpm dlx vercel firewall rules list
pnpm dlx vercel firewall diff
curl -fsSI https://www.suiyuecare.com/ | sed -n '1,80p'
curl -fsSI https://www.suiyuecare.com/admin | sed -n '1,100p'
curl -sS -D - -o /tmp/send-email-bad-origin.txt \
  -X POST https://www.suiyuecare.com/api/send-email \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://evil.example' \
  --data '{}'
curl -sS -D - -o /tmp/send-email-allowed-origin.txt \
  -X POST https://www.suiyuecare.com/api/send-email \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://www.suiyuecare.com' \
  --data '{}'
```

Expected results:

- Homepage includes the baseline security headers.
- `/admin`, `/portal`, `/api`, and `/assets/backups` include `no-store` and `noindex`.
- Bad or missing `Origin` on `/api/send-email` and `/api/analytics` returns `403`.
- Allowed origins still reach the API function and return the normal validation response.
- `Public API Rate Limit` is enabled and has no unpublished firewall draft changes.

## Notes

These edge guardrails are production-level defense-in-depth. They do not replace
the server-side validation in `api/send-email.js` or `api/analytics.js`; the
code-level guards still need to be deployed when Vercel deployment quota is
available again.
