# Master Architecture and Program Plan

## 1. Purpose

This document is the shared architectural compass for all Marsellia Odoo modules in this repository.

It keeps the program aligned across:

- HR intake and public candidate pooling
- GRC backbone and constitutional governance
- Recruitment handoff and applicant lifecycle
- Recruitment bridge template composition, document generation, and signature routing
- future operational and commercial extensions
- integration layers such as n8n, Fillout, Zite, and document generation

## 2. Architectural posture

Marsellia is building a governed enterprise stack on Odoo SaaS, with a hybrid of:

- custom XML-only importable modules
- Studio where low-risk refinement is useful
- n8n for orchestration and public integration edges
- external form/database surfaces for non-Odoo users
- Google Docs / Drive for controlled template generation and PDF export
- Odoo Sign for formal external signature capture
- HTML-to-PDF renderers where multi-line, table-heavy, or repeatable-row forms are better handled outside Google Docs

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
- bridge fields, inherited views, light mapping helpers, and template routing live with the domain module that needs the governed extension, unless a separate shared bridge is genuinely required later

This means the project should stay domain-coherent rather than forcing every bridge concern into a separate generic bridge addon.

For HR, the bridge should cover the whole recruitment and onboarding lifecycle as one coherent domain, not as separate bridge modules per phase.

Current naming posture:

- technical bridge module: `grc_recruitment_bridge`
- English app label: `Recruitment Governance`
- Arabic app label: `ضابط التوظيف`

Future adjacent bridge module:

- `grc_employee_bridge`
- English app label: `Employee Governance`
- Arabic app label: `ضابط شؤون الموظفين`

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
- applicant-side continuation and prefill surface
- contract, declaration, and signature flow
- PDF generation and attachment handling

Implementation note:

- Google Docs templates plus n8n are the default generation path for controlled bilingual forms
- HTML/CSS-to-PDF is preferred for forms with multi-line rows, repeated sections, or heavy tabular structure
- Odoo Sign is the default formal signing path for applicants, employees, managers, and chairman-level sign-offs where external signatures are needed
- the live signed PDF is attached to the operational record, while the template source remains in the bridge/resources layer

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
- `modules/grc_recruitment_bridge/`
- `docs/architecture/`
- `docs/architecture/03_hr_form_family_inventory.md`
- `docs/architecture/04_hr_document_generation_and_signature_workflow.md`
- `docs/modules/hr_pool/`
- `docs/modules/grc_backbone/`
- `docs/modules/grc_recruitment_bridge/`
- `docs/resources/n8n/`
- `resources/forms/`
- `resources/hr_pool/`
- `resources/grc_backbone/`
- `resources/grc_recruitment_bridge/`

### Boundary map companion

The detailed module boundary map is maintained in:

- `docs/architecture/01_module_boundary_map.md`
- `docs/architecture/02_grc_recruitment_bridge_module_spec.md`

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
4. lock the HR form-family inventory and runtime ownership map
5. add phase-1 PDF snapshotting
6. design the HR document generation and signature workflow
7. design phase-2 enrichment and document completion
8. extend into operational consumption modules

## 8. Implementation journal

### 2026-04-23 - Recruitment bridge first implementation pass

Completed:

- scaffolded `modules/grc_recruitment_bridge/` as the recruitment-domain governance bridge
- added XML-only template models, fields, data, actions, menus, security, and views
- seeded the first-wave recruitment families:
  - `MCEP-HR-F-0001` continuation pack
  - `MCEP-HR-F-0002` interview evaluation
  - `MCEP-HR-F-0003` pre-employment document checklist
  - `MCEP-HR-F-0004`, `MCEP-HR-F-0007`, `MCEP-HR-F-0008`, `MCEP-HR-F-0009`, `MCEP-HR-F-0010`, `MCEP-HR-F-0013` declaration packs
- added bridge links onto `hr.job` for role templates, interview templates, document checklists, onboarding packs, declaration packs, and signature profiles
- kept the live `hr_pool` intake contract frozen and untouched
- aligned document guidance to the agreed posture:
  - HTML/CSS-to-PDF for multi-line / table-heavy forms
  - Google Docs as fallback for simpler bilingual templates
  - Odoo Sign as the default external signing path

Open next:

- validate the recruitment bridge scaffold against the install graph
- begin the controlled split between canonical GRC data and bridge-domain composition
- keep `hr_pool` additive-only until the replacement path is proven

## 9. Refactor safety rules

The live `hr_pool` intake pipeline is frozen as a compatibility contract until the new recruitment bridge is proven.

Safe changes first:

- add new optional fields only
- add new bridge views and actions only
- add new template and routing records only
- add new docs and resource references only

Unsafe changes until the replacement path is verified:

- renaming live `hr_pool` XML IDs
- changing existing field types
- removing working views or actions
- changing the payload contract used by the current Fillout/Zite/n8n path
- deleting existing helper records that Zite maps by Odoo ID

Rule of thumb:

- if the change can break the live intake workflow, do not do it in the first refactor pass
- if the change is purely additive or parallel, it is acceptable

## 10. Working rule

When code and docs disagree, the installed module and current repository code take priority over the document text.
