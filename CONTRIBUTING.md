# Contributing to Hydroloop

Thanks for considering a contribution to Hydroloop.

## Getting Started

1. Fork the repository.
2. Clone your fork.
3. Install dependencies:

```bash
npm install
```

4. Copy the example env file:

```bash
cp .env.example .env
```

5. Start the app:

```bash
npm run dev
```

## Local Development Modes

Hydroloop supports two contributor-friendly modes:

- Local-first mode: no cloud setup required. The app runs with local storage, and auth/cloud sync features stay disabled.
- Cloud-enabled mode: add your own Supabase and optional Cloudinary credentials to test login, sync, and custom sound upload flows.

## Environment Variables

Required for cloud features:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional for custom sound uploads:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Deployment-only secret:

- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` is only for trusted server environments. Do not put a real service-role key in commits, screenshots, issues, or pull requests.

## Project Scope

- Web app: Next.js app in `app/`, `components/`, `hooks/`, and `lib/`
- CLI: package in `cli/`

## Contribution Workflow

- Create focused pull requests.
- Keep changes minimal and consistent with the existing style.
- Update docs when behavior or setup changes.
- Prefer fixing the root cause over patching symptoms.

## Before Opening a Pull Request

- Run the checks you can locally:

```bash
npm run lint
```

- Verify the changed flow manually.
- Make sure no secrets are included in changed files.

## Security

If you find a security issue, please do not open a public issue first. Follow the process in `SECURITY.md`.
