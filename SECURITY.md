# Security Policy

## Supported Scope

Please report vulnerabilities related to:

- authentication
- cloud sync
- token exchange
- secret handling
- dependency risks with a clear reproduction

## Reporting a Vulnerability

Please report security issues privately to the maintainer before opening a public issue or pull request.

Include:

- a short summary
- impact
- reproduction steps
- affected files or routes
- suggested remediation, if you have one

## Secret Handling

- Never commit real `.env` files.
- Never share `SUPABASE_SERVICE_ROLE_KEY` publicly.
- Rotate any secret immediately if you suspect exposure.

## Disclosure

After a fix is available, public documentation or release notes can be added as appropriate.
