# Master Architecture and Program Plan

## 1. Purpose

This document is the shared architectural compass for all Marsellia Odoo modules in this repository.

It keeps the program aligned across:

- HR intake and public candidate pooling
- GRC backbone and constitutional governance
- Recruitment handoff and applicant lifecycle
- future operational and commercial extensions
- integration layers such as n8n, Fillout, Zite, and document generation

## 2. Architectural posture

Marsellia is building a governed enterprise stack on Odoo SaaS, with a hybrid of:

- custom XML-only importable modules
- Studio where low-risk refinement is useful
- n8n for orchestration and public integration edges
- external form/database surfaces for non-Odoo users

The system should be organized as a controlled monorepo with separately zippable modules.

## 3. Canonical module boundaries

### 3.1 `grc_backbone`

The constitutional master-data layer.

Owns:

- frameworks
- policies
- provisions / rules
- decisions
- functional areas
- granular functions
- SOPs
- risks
- controls
- compliance checks
- incidents
- tender / contract / clause governance

### 3.2 `hr_pool`

The governed intake and pool layer.

Owns:

- public and internal intake
- chairman-gated prescreening
- reviewer recommendations
- conversion requests
- pool approval / hold / reject
- linkage to functional area taxonomy
- applicant backlink and provenance

### 3.3 `hr_recruitment`

The formal job-bound applicant layer.

Owns:

- actual applicants
- job-bound recruitment flow
- interviews and evaluations
- offer progression
- formal application enrichment
- document completion

## 3.4 Bridge-domain rule

Bridge logic is not the same thing as canonical governance.

Bridge layers exist where governed vocabulary must be exposed into a live operational domain. In practice:

- canonical governance stays in `grc_backbone`
- operational process ownership stays in the domain module that runs the work
- bridge fields, inherited views, and light mapping helpers live with the module that needs the governed extension, unless a separate shared bridge is genuinely required later

This means the project should stay domain-coherent rather than forcing every bridge concern into a separate generic bridge addon.

Examples:

- `hr_pool` can own its own GRC-facing intake extension points if those extensions are only relevant to intake/pooling
- `hr_recruitment` can own recruitment-stage extensions if they are only relevant to recruitment
- a shared bridge addon is only justified when multiple operational modules need the same governed adapter

## 4. Program phases

### Phase 1 - Constitutional and intake foundation

Status:
- HR intake is operational
- n8n ingestion is operational
- GRC backbone exists as an importable XML module and needs integration discipline

Work:
- split canonical GRC data from domain-coherent bridge logic
- stabilize helper taxonomy
- harden permissions and workflow overlays

### Phase 2 - Controlled recruitment handoff

Work:
- conversion request model/action
- chairman approval or rejection of conversion
- applicant creation
- back-linking to intake
- freeze or semi-freeze intake after conversion

### Phase 3 - Phase 2 recruitment enrichment

Work:
- interview evaluation
- document checklist
- negotiated TOR / job description generation
- applicant-side completion surface
- contract and signature flow

### Phase 4 - Operational governance expansion

Work:
- operational module bridges
- HSE enforcement
- fleet / maintenance / project / finance consumption of GRC taxonomy

## 5. Repository strategy

The repository is organized to support:

- a shared architecture narrative
- multiple installable Odoo module directories
- module-specific docs and resources
- generated outputs that stay outside the shipped zip

### Suggested tree

- `modules/hr_pool/`
- `modules/grc_backbone/`
- `docs/architecture/`
- `docs/modules/hr_pool/`
- `docs/modules/grc_backbone/`
- `docs/resources/n8n/`
- `resources/hr_pool/`
- `resources/grc_backbone/`

### Boundary map companion

The detailed module boundary map is maintained in:

- `docs/architecture/01_module_boundary_map.md`

## 6. Packaging rules

Each installable module must be zipped from its own directory only.

Do not ship:

- `docs/`
- `resources/`
- `scripts/`
- local exports
- integration payload samples

## 7. Current implementation order

1. split canonical GRC data from bridge logic
2. normalize shared taxonomy and model ownership
3. finish the HR Pool conversion boundary
4. add phase-1 PDF snapshotting
5. design phase-2 enrichment and document completion
6. extend into operational consumption modules

## 8. Working rule

When code and docs disagree, the installed module and current repository code take priority over the document text.
