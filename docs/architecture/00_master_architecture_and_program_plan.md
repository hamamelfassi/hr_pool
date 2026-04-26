# Master Architecture and Program Plan

## 1. Purpose

This document is the shared architectural compass for all Marsellia Odoo modules in this repository.

It keeps the program aligned across:

- HR intake and public candidate pooling
- GRC backbone and constitutional governance
- Recruitment handoff and applicant lifecycle
- Recruitment bridge template composition, document generation, and signature routing
- canonical task-template governance for repeatable operational work
- future operational and commercial extensions
- integration layers such as n8n, Fillout, Zite, and document generation
- native Odoo document/signature flows via Documents, Sign, QWeb, chatter, and activities

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
- task templates and task template lines
- risks
- controls
- compliance checks
- incidents
- tender / contract / clause governance

### 3.2 `hr_pool`

The frozen intake and pool layer for the public intake surface.

Owns:

- public and internal intake
- chairman-gated prescreening
- reviewer recommendations
- conversion requests
- pool approval / hold / reject
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
- bridge fields, inherited views, light mapping helpers, document-type catalogs, and template routing live with the domain module that needs the governed extension, unless a separate shared bridge is genuinely required later
- live recruitment runtime records, including interview evaluations, document checklists, document submissions, and signature-triggered record state, belong to the recruitment operational surface, not to the bridge itself

This means the project should stay domain-coherent rather than forcing every bridge concern into a separate generic bridge addon.

For HR, the bridge should cover the whole recruitment and onboarding lifecycle as one coherent domain, not as separate bridge modules per phase.

Current naming posture:

- technical bridge module: `grc_recruitment_bridge`
- English app label: `Recruitment Governance`
- Arabic app label: `إجراءات التوظيف`

Future adjacent bridge module:

- `grc_employee_bridge`
- English app label: `Employee Governance`
- Arabic app label: `ضابط شؤون الموظفين`

Examples:

- `hr_pool` remains standalone for intake in this reshuffle and does not consume GRC directly
- `hr_recruitment` can own recruitment-stage extensions if they are only relevant to recruitment
- `grc_recruitment_bridge` owns the governed template and routing layer that the recruitment runtime consumes

## 4. Program phases

### Phase 1 - Constitutional and intake foundation

Status:
- HR intake is operational and frozen as a compatibility contract
- n8n ingestion is operational
- GRC backbone is installed cleanly and now owns canonical task templates
- recruitment bridge is installed cleanly and visible once access groups are assigned
- Arabic translation coverage is still partial and needs normalization

Work:
- split canonical GRC data from domain-coherent bridge logic
- stabilize helper taxonomy and Arabic naming
- seed and extend task templates as canonical GRC primitives
- harden permissions and workflow overlays

### Phase 2 - Controlled recruitment handoff

Status:
- recruitment bridge template families are in place
- live intake continues to write to `hr_pool`
- the handoff is not yet implemented as a formal conversion workflow
- the live recruitment runtime objects still need to be aligned so interview evaluation, document checklist, and document submission records live on the recruitment side rather than inside the bridge

Work:
- conversion request model/action
- chairman approval or rejection of conversion
- applicant creation
- back-linking to intake
- freeze or semi-freeze intake after conversion

### Phase 3 - Phase 2 recruitment enrichment

Status:
- the form corpus is mapped to recruitment/onboarding families
- document generation posture is decided in favor of Odoo-native first
- external signing posture is decided in favor of Odoo Sign
- the native document schema is now partially implemented:
  - `x_hr.pool` has chatter, activity, Documents, intake PDF, and signed PDF hooks
  - `x_grc.hr_interview_evaluation` exists as a governed runtime record with chatter, activities, attachments, and QWeb reporting
  - `hr.job` now carries the baseline vacancy / TOR hooks for native report generation and storage
  - `hr.applicant` remains the runtime home for the negotiated case, document checklist, submissions, declarations, and signed artifacts
- the high-priority `hr.job` versus `hr.applicant` runtime pass is now under implementation in the source tree:
  - applicant-side negotiated role composition records are scaffolded
  - applicant-side declaration envelope records are scaffolded
  - the applicant notebook has been split into baseline vacancy, negotiated role, evaluations, documents/checklists, declarations, and signatures pages
  - baseline vacancy labels on `hr.job` have been tightened to distinguish them from negotiated runtime records
- the remaining work is the operational wiring:
  - conversion handoff
  - actual sign-request routing
  - document-folder provisioning
  - applicant-side continuation and prefill surface
  - baseline-vacancy versus applicant-negotiated runtime split on the recruitment UI
  - final contract bundle flow

Work:
- interview evaluation
- document checklist
- negotiated TOR / job description generation
- applicant-side continuation and prefill surface
- contract, declaration, and signature flow
- PDF generation and attachment handling
- native Odoo Documents storage and chatter/activity integration
- recruitment-side runtime record modeling for:
  - interview evaluations
  - document checklists
  - document submissions
  - negotiated TOR/job-description outputs on the applicant runtime record
  - baseline TOR/job-description outputs on the job vacancy record

Implementation note:

- Google Docs templates plus n8n are the default generation path for controlled bilingual forms
- HTML/CSS-to-PDF is preferred for forms with multi-line rows, repeated sections, or heavy tabular structure
- Odoo Sign is the default formal signing path for applicants, employees, managers, and chairman-level sign-offs where external signatures are needed
- the live signed PDF is attached to the operational record, while the template source remains in the bridge/resources layer
- the concrete schema map for this native-document pass is documented in `docs/architecture/07_native_document_schema_implementation.md`
- the recruitment runtime UI and schema map is pinned in `docs/architecture/08_recruitment_runtime_ui_and_schema_map.md`
- the strict `hr.job` versus `hr.applicant` gap matrix is pinned in `docs/architecture/09_hr_job_vs_hr_applicant_gap_matrix.md`

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
9. execute the strict `hr.job` versus `hr.applicant` high-priority implementation pass
10. execute the strict `hr.job` versus `hr.applicant` medium-priority implementation pass

## 8. Implementation journal

### 2026-04-23 - Recruitment bridge first implementation pass

Completed:

- scaffolded `modules/grc_recruitment_bridge/` as the recruitment-domain governance bridge

### 2026-04-26 - High-priority recruitment runtime pass started

Completed:

- implemented negotiated applicant-side runtime surfaces for role composition and declaration envelopes
- split the applicant notebook into baseline vacancy, negotiated role, evaluations, documents/checklists, declarations, and signatures pages
- tightened baseline vacancy vocabulary on `hr.job` and added applicant-side runtime reporting actions for the negotiated case
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

Open:

- add Arabic translations aligned to the form corpus and Libyan usage
- normalize recruitment terminology to `إجراءات التوظيف`
- formalize the canonical task-template layer in `grc_backbone`

Open next:

- validate the recruitment bridge scaffold against the install graph
- begin the controlled split between canonical GRC data and bridge-domain composition
- keep `hr_pool` additive-only until the replacement path is proven

### 2026-04-23 - Broader dependency reshuffle

Completed:

- removed HR runtime dependencies from `grc_backbone`
- moved recruitment-facing `hr.job` governance links into `grc_recruitment_bridge`
- removed the unused GRC functional-area field from `hr_pool`
- removed the `grc_backbone` dependency from `hr_pool`
- kept the live intake payload shape unchanged
- introduced canonical `task_template` / `task_template_line` governance in `grc_backbone`

Open next:

- validate the reshuffled dependency graph before any install/upgrade attempt
- keep `hr_pool` frozen while the recruitment bridge becomes the only governed adapter in this slice
- pruned stale backbone translations that still pointed at removed HR runtime fields
- confirmed only bridge-owned recruitment functional-area links remain in the live graph
- split bridge inverse `many2one` field creation into a preload XML so parent `one2many` fields can load cleanly in SaaS import order
- reuse legacy `hr.job` governance fields already present in upgraded databases instead of recreating duplicate `ir.model.fields` records during the bridge install path
- add Arabic terminology alignment and task-template translation coverage

### 2026-04-26 - Native document and signature strategy review

Open:

- define native record schemas for signable and reportable HR workflows
- decide which form families use static Sign templates versus QWeb PDFs
- define Documents foldering and attachment lifecycle rules
- decide where Survey is sufficient and where a custom governed record is required

References:

- `docs/architecture/05_hr_native_first_decision_matrix.md`
- `docs/architecture/06_hr_native_first_workflow_playbook.md`

### 2026-04-26 - Native document schema implementation

Completed:

- added `Documents` hooks to `hr_pool` intake records and recruitment template/runtime records
- added `QWeb` PDF actions for HR Pool intake snapshots, `hr.job` TOR outputs, and interview evaluation records
- added chatter/activity support to the HR Pool intake model and the interview evaluation runtime model
- added a governed interview evaluation runtime record with score lines, attachment pointers, and signature profile linkage
- documented the schema in `docs/architecture/07_native_document_schema_implementation.md`
- clarified the corrected target structure so the bridge owns definitions and the recruitment domain owns live runtime records
- pinned the recruitment runtime UI / document submission structure in `docs/architecture/08_recruitment_runtime_ui_and_schema_map.md`
- realigned the bridge code so the live interview evaluation, document checklist, and document submission records now use recruitment-side runtime model names and menu/view surfaces
- added the recruitment document type catalog and typed document checklist submission structure

Open:

- route QWeb-generated PDFs into the Documents DMS automatically
- add signature request actions and record buttons
- provision or standardize document folders for runtime records
- complete Arabic terminology and translation coverage for the new native-document fields
- realign any bridge-owned runtime records or fields so they live on the recruitment operational surface before the next install cycle

### 2026-04-26 - Recruitment job versus applicant gap matrix

Completed:

- pinned the strict `hr.job` versus `hr.applicant` ownership matrix in `docs/architecture/09_hr_job_vs_hr_applicant_gap_matrix.md`
- clarified that `hr.job` is the baseline vacancy record and `hr.applicant` is the negotiated runtime record
- updated the master plan, runtime schema doc, and related references to reflect the baseline-vacancy versus negotiated-runtime split

Open:

- implement the high-priority items in the matrix:
  - baseline job-vacancy cleanup
  - applicant-side runtime UI and workflow surfaces
  - interview runtime ownership on the applicant side
  - document checklist runtime ownership on the applicant side
  - document submission writeback flow
  - baseline TOR versus negotiated TOR split
  - declaration envelope runtime ownership on the applicant side
  - sign request actions from runtime records
- implement the medium-priority items in the matrix:
  - Documents folder provisioning rules
  - chatter and activities wiring
  - Arabic translation completion
  - role template code sequencing and provenance cleanup
  - stricter functional area/function filtering on template lines
  - default template selection and fallback logic
  - PDF preview / inspector improvements

### 2026-04-26 - Split implementation passes

Completed:

- split the remaining recruitment implementation work into two dedicated passes:
  - `docs/architecture/10_hr_high_priority_implementation_pass.md`
  - `docs/architecture/11_hr_medium_priority_implementation_pass.md`
- moved the high-priority structural work into the first pass
- moved the cleanup and usability work into the second pass

Open:

- execute the high-priority pass before the medium-priority pass
- keep the two passes separate so context and implementation scope do not drift

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
