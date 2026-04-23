# Marsellia HR / GRC Monorepo

This repository is the shared working tree for Marsellia's Odoo SaaS custom modules, supporting documents, integration scripts, and exported artifacts.

## Current module layout

- `modules/hr_pool/` - governed HR intake / pooling module
- `modules/grc_backbone/` - governance, risk, compliance backbone module scaffold

## Supporting structure

- `docs/` - canonical architecture, plans, field maps, and module-specific documentation
- `resources/` - non-installable assets, exported PDFs, templates, and operational files
- `docs/resources/n8n/` - n8n code-node scripts and payload mapping helpers
- `scripts/` - local build helpers, including Odoo zip packaging

Key architecture references:

- `docs/architecture/00_master_architecture_and_program_plan.md`
- `docs/architecture/01_module_boundary_map.md`

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
- bridge logic stays domain-coherent and usually lives with the operational module it serves
- shared bridge addons are only needed when multiple domains truly need the same adapter
