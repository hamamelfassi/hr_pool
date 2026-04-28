# Master Architecture and Program Plan

## 1. Purpose

This document is the shared architectural compass for all Marsellia Odoo modules in this repository.

It keeps the program aligned across:

- HR intake and public candidate pooling
- GRC backbone and constitutional governance
- recruitment handoff and applicant lifecycle
- canonical task-template governance for repeatable operational work
- future operational and commercial extensions
- integration layers such as n8n, Fillout, Zite, documents, Sign, and report generation

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
- task templates and task template lines
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
- conversion request initiation
- pool approval / hold / reject
- linkage to functional area taxonomy
- applicant backlink and provenance
- intake-side audit trail and report snapshotting

### 3.3 `hr_recruitment_custom`

The thin technical recruitment extension layer.

Owns:

- governed `hr.job` baseline fields
- baseline job-description composition on `hr.job`
- governed `hr.applicant` negotiated-role fields
- negotiated ToR composition on `hr.applicant`
- conversion execution from intake to applicant
- applicant backlink creation and read-only references
- interview / evaluation enrichment helpers
- document and Sign orchestration hooks where native Odoo needs extension

### 3.4 `hr_recruitment`

The formal job-bound applicant layer.

Owns:

- actual applicants
- job-bound recruitment flow
- interviews and evaluations
- offer progression
- formal application enrichment
- document completion

## 4. Program phases

### Phase 1 - Constitutional and intake foundation

Status:
- HR intake is operational
- n8n ingestion is operational
- GRC backbone exists as an importable XML module and needs integration discipline

Work:
- split canonical GRC data from bridge logic
- stabilize helper taxonomy
- seed and extend task templates as canonical GRC primitives
- harden permissions and workflow overlays

### Phase 2 - Controlled recruitment handoff

Work:
- conversion request child model with its own state/stage
- convert button on `hr_pool` to create the request from an intake record
- chairman approval or rejection of the request
- applicant creation in native `hr.applicant`
- read-only back-linking to intake
- freeze or semi-freeze intake after conversion
- keep stage-2 enrichment on native recruitment, not on intake
- extend `hr.job` with baseline functional area and function composition
- extend `hr.applicant` with negotiated ToR function lines inherited from `hr.job`
- keep the first stage-2 slice to schema and UI composition only, not document generation
- normalize printable ToR identity and role fields onto `hr.applicant`
- generate negotiated ToR PDFs from `hr.applicant` through QWeb
- keep Marsellia form `0006` as the visual reference while allowing dynamic grouped-duty rendering
- route the generated ToR PDF into native Odoo Sign for applicant signature
- keep first-pass signature workflow simple: applicant digital signature first, manual recruiter / manager follow-up later

### Phase 3 - Phase 2 recruitment enrichment

Work:
- interview evaluation
- document checklist
- applicant-side completion surface
- contract and signature flow
- Sign / Documents / chatter-native applicant workflows

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
3. lock the HR Pool stage-1 conversion boundary
4. define the stage-2 recruitment extension contract
5. seed canonical task templates
6. add phase-1 PDF snapshotting
7. design phase-2 enrichment, document completion, and signature flows
8. extend into operational consumption modules

## 8. Working rule

When code and docs disagree, the installed module and current repository code take priority over the document text.

## 9. Native-first extension rule

Stage 2 should extend native Odoo Recruitment, HR, Documents, Sign, and contract flows rather than recreate them in custom parallel models.

Custom modules should primarily provide:

- governed taxonomy linkage
- controlled composition fields and child lines
- bridge logic from intake into native recruitment
- automation hooks where native workflow needs augmentation

The first dynamic ToR / Job Description slice is therefore a structured extension of native `hr.job` and `hr.applicant`, not a separate document app.
