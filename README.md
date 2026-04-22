# hr_pool

XML-only Odoo SaaS module for candidate pooling and recruitment intake.

## Repo Layout

- Module source stays at repo root so Odoo still sees a normal module.
- Supporting documentation lives under `docs/`.
- n8n assets live under `docs/resources/n8n/`.
- Generated upload archives go to `dist/` and are gitignored.

## Odoo Upload

Do not zip the whole repository directory manually.

Build a clean Odoo upload archive with:

```bash
./scripts/build_odoo_zip.sh
```

That script includes only the module files Odoo needs and excludes docs, helper scripts, git metadata, and local junk files.

## Current Scope

- Odoo module: `hr_pool`
- Integration flow: Fillout/Zite -> n8n -> Odoo
- SaaS constraint: keep non-module materials outside the shipped module archive
