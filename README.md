# Marsellia HR / GRC Monorepo

This repository is the shared working tree for Marsellia's Odoo SaaS custom modules, supporting documents, integration scripts, and exported artifacts.

## Current module layout

- `modules/hr_pool/` - governed HR intake / pooling module
- `modules/grc_backbone/` - governance, risk, compliance backbone module scaffold
- `modules/hr_recruitment_custom/` - technical recruitment extension module

## Supporting structure

- `docs/` - canonical architecture, plans, field maps, and module-specific documentation
- `resources/` - non-installable assets, exported PDFs, templates, and operational files
- `docs/resources/n8n/` - n8n code-node scripts and payload mapping helpers
- `scripts/` - local build helpers, including Odoo zip packaging

## Packaging rule

Only the contents of an individual module directory should be zipped for Odoo SaaS import.
Do not include `docs/`, `resources/`, or `scripts/` in an installable module archive.

## Build

```bash
./scripts/build_odoo_zip.sh
```

That currently builds the `hr_pool` module archive from `modules/hr_pool/`.
To build any other module later, use:

```bash
./scripts/build_module_zip.sh <module_name>
```

## Working model

This repository is intentionally organized as an integrated program workspace:

- shared architecture and governance live once in `docs/`
- each module keeps its own code, views, data, and packaging boundary
- each module gets its own documentation and resource subtrees
- cross-module bridges can live in separate helper modules or bridge docs, but not inside the installable docs tree
