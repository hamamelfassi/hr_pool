# Recruitment Governance Bridge Module Specification

## 1. Purpose

`grc_recruitment_bridge` is the recruitment-domain bridge between canonical governance data in `grc_backbone` and operational records in `hr_pool` and `hr_recruitment`.

It turns governed taxonomy into reusable recruitment and onboarding template families, controlled references, and signer-routing profiles.

It does not own live people-process records.

## 2. Dashboard identity

- Technical module name: `grc_recruitment_bridge`
- English app label: `Recruitment Governance`
- Arabic app label: `ضابط التوظيف`
- Category: `Human Resources`
- Module type: XML-only importable addon for Odoo SaaS

## 3. Module scope

### 3.1 Owns

The module owns governance composition artifacts for the recruitment lifecycle and the immediate post-intake continuation stage:

- role / job description templates
- interview evaluation templates
- pre-employment document checklist templates
- onboarding continuation packs for the post-intake phase
- declaration packs
- signer-routing / signature profiles
- bridge fields on recruitment operational models
- inherited views and actions that expose governed recruitment template selection

### 3.2 Does not own

The module does not own the live workflow records themselves:

- candidate intake submissions
- pooled candidate records
- applicant records
- actual interview sessions and responses
- actual document submissions
- actual contract acceptance records
- final signed PDFs for a specific person
- employee admin or HSE runtime forms

Those belong in `hr_pool`, `hr_recruitment`, or a future domain module.

## 4. In-scope form families

The bridge should be built around reusable form families, not one model per PDF.

### 4.1 First-wave bridge families

- `MCEP-HR-F-0001` post-intake continuation sections
- `MCEP-HR-F-0002` interview evaluation
- `MCEP-HR-F-0003` pre-employment document checklist
- `MCEP-HR-F-0004` truthfulness / document validity declaration
- `MCEP-HR-F-0007` policy acknowledgment
- `MCEP-HR-F-0008` training commitment
- `MCEP-HR-F-0009` confidentiality declaration
- `MCEP-HR-F-0010` exclusivity / outside-work declaration
- `MCEP-HR-F-0013` safety / HSE acknowledgment tied to recruitment onboarding

### 4.2 Future operational families outside this bridge

These are real forms, but they should move to later operational modules rather than widening the recruitment bridge:

- `MCEP-HR-F-0011` ID card receipt / custody acknowledgement
- `MCEP-HR-F-0014` permission / absence request
- `MCEP-HR-F-0015` leave request
- `MCEP-HR-F-0016` assignment / secondment
- `MCEP-HR-F-0017` resignation / termination request
- `MCEP-HR-F-0018` human-waste handling declaration
- `MCEP-HR-F-0019` human-waste storage supervisor declaration
- `MCEP-HR-F-0020` clearance / exit handoff checklist
- `MCEP-HR-F-0021` human-waste handling declaration variant
- `MCEP-HR-F-0022` human-waste supervisor declaration variant

### 4.3 Inventory gaps

- `MCEP-HR-F-0005` is missing from the source corpus
- `MCEP-HR-F-0012` is missing from the source corpus

See `docs/architecture/03_hr_form_family_inventory.md` for the runtime ownership map.

## 5. Exact model names

### 5.1 Core template models

- `x_grc.hr_role_template`
- `x_grc.hr_role_template_line`
- `x_grc.hr_interview_template`
- `x_grc.hr_interview_template_line`
- `x_grc.hr_document_checklist_template`
- `x_grc.hr_document_checklist_template_line`
- `x_grc.hr_onboarding_pack`
- `x_grc.hr_onboarding_pack_line`
- `x_grc.hr_declaration_pack`
- `x_grc.hr_declaration_pack_line`
- `x_grc.hr_signature_profile`
- `x_grc.hr_signature_profile_line`

### 5.2 Optional future extension

- `x_grc.hr_contract_pack`
- `x_grc.hr_contract_pack_line`

The contract pack is useful later, but it is not required for the first bridge slice.

### 5.3 Shared bridge metadata pattern

Each template parent should carry:

- `x_code`
- `x_name`
- `x_description`
- `x_state`
- `x_version`
- `x_effective_date`
- `x_retired_date`
- `x_is_default`
- `x_notes`

Each line model should carry:

- `x_sequence`
- `x_state`
- `x_description`
- `x_required`
- `x_weight`
- `x_notes`

### 5.4 Recommended line-level link fields

Role template line:

- `x_functional_area_id` -> `x_grc.functional_area`
- `x_function_id` -> `x_grc.function`
- `x_minimum_requirement`
- `x_expected_output`
- `x_internal_notes`

Interview template line:

- `x_question`
- `x_scoring_criterion`
- `x_max_score`
- `x_weight`
- `x_answer_type`
- `x_internal_notes`

Document checklist line:

- `x_document_type`
- `x_is_mandatory`
- `x_requires_expiry`
- `x_renewal_period_months`
- `x_signoff_role`
- `x_internal_notes`

Onboarding pack line:

- `x_pack_section`
- `x_is_required`
- `x_signoff_role`
- `x_internal_notes`

Declaration pack line:

- `x_clause_id` -> `x_grc.clause`
- `x_applicant_must_sign`
- `x_hr_must_sign`
- `x_sequence`
- `x_internal_notes`

Signature profile line:

- `x_signer_role`
- `x_signer_order`
- `x_signing_backend`
- `x_required`
- `x_target_model`
- `x_target_state`
- `x_internal_notes`

## 6. Exact menus

### 6.1 Root menu

- English: `Recruitment Governance`
- Arabic: `ضابط التوظيف`

### 6.2 Suggested submenu structure

- `Templates`
  - `Role / Job Description Templates`
  - `Interview Evaluation Templates`
  - `Document Checklist Templates`
  - `Onboarding Packs`
  - `Declaration Packs`
  - `Signature Profiles`
- `Approvals`
  - `Template Review Queue`
  - `Published Templates`
- `References`
  - `Linked Functional Areas`
  - `Linked Functions`
  - `Linked Clauses`

## 7. Exact actions

The module should expose one `ir.actions.act_window` action per template model, plus filtered approval views.

Recommended action names:

- `action_hr_role_template`
- `action_hr_interview_template`
- `action_hr_document_checklist_template`
- `action_hr_onboarding_pack`
- `action_hr_declaration_pack`
- `action_hr_signature_profile`
- `action_hr_template_review_queue`
- `action_hr_template_published`
- `action_hr_contract_pack` if the optional pack is later activated

## 8. Exact views

Each template model should have:

- list view
- search view
- form view

### 8.1 Role template form pages

- Overview
- GRC Mapping
- Composition Lines
- Version / Approval

### 8.2 Interview template form pages

- Overview
- Questions / Criteria
- Scoring
- Version / Approval

### 8.3 Document checklist template form pages

- Overview
- Required Documents
- Renewal / Expiry Logic
- Version / Approval

### 8.4 Onboarding pack form pages

- Overview
- Continuation Sections
- Sign-off Rules
- Version / Approval

### 8.5 Declaration pack form pages

- Overview
- Clauses
- Sign-off Rules
- Version / Approval

### 8.6 Signature profile form pages

- Overview
- Signers / Roles
- Routing Order
- Backend Selection
- Version / Approval

### 8.7 Inherited operational views

The bridge module should also add inherited views to:

- `hr.job`
- `x_hr.pool`
- `hr.recruitment` or `hr.applicant` if the recruitment workflow needs direct visibility in the applicant form

These inherited views should expose:

- selected role template
- selected interview template
- selected document checklist template
- selected onboarding pack
- selected declaration pack
- selected signature profile
- linked functional area
- linked governed function

## 9. Document generation and signing workflow

### 9.1 Generation

The intended generation path is:

- templates are authored in Google Docs for controlled bilingual layout when the form is mostly fixed-layout
- HTML/CSS templates rendered through n8n are preferred when the form contains multi-line rows, repeaters, or table-heavy sections
- n8n fills the selected template from Odoo data
- n8n exports PDF output
- the PDF is uploaded to Odoo Documents or stored as an attachment on the operational record
- the template source stays in the bridge/resources layer, not in the shipped addon zip

### 9.2 Signing

The formal signing path is:

- Odoo Sign is the default signing engine for external signers
- applicants, employees, managers, and chairman-level signers do not need to be Odoo users to sign
- the signature profile determines who signs, in what order, and whether the signature is mandatory or conditional
- the signed PDF is stored on the operational record, not as a template artifact

### 9.3 Routing principle

Routing means the system chooses the right signer sequence from the profile, instead of hardcoding one-off logic in the flow.

A signature profile is a structured routing table that defines:

- document family
- signer role
- signer order
- required or optional status
- signing backend
- target record linkage
- approval or countersign rules

### 9.4 Fillout continuation

Fillout remains a continuation and prefill surface only.

It should not be the canonical signing engine for formal recruitment documents.

## 10. Ownership split against other modules

### 10.1 Belongs in `grc_backbone`

- functional areas
- governed functions
- SOPs
- clauses
- contract template primitives
- risk and compliance taxonomy
- compliance governance vocabulary
- governed provisions and declaration wording

### 10.2 Belongs in `grc_recruitment_bridge`

- recruitment-specific template assembly
- interview / checklist / onboarding / declaration composition
- signer-routing profiles
- bridge fields to operational recruitment models
- approval state for templates
- published template selection

### 10.3 Belongs in `hr_pool`

- intake candidate records
- source metadata
- intake-stage approval / conversion workflow
- intake PDF snapshots
- intake-specific operational records and child lines
- the approved intake snapshot that feeds the next HR stage

### 10.4 Belongs in `hr_recruitment`

- applicant records
- interviews
- evaluation submissions
- offer progression
- post-conversion onboarding continuation
- live declaration instances
- signed document instances for the specific person

### 10.5 Future domain modules

- employee admin / attendance / leave / offboarding
- HSE / field operations / human-waste declarations

These should consume the same governance patterns, but they should not be forced into the recruitment bridge.

## 11. Source corpus note

The current markdown form corpus lives in `resources/forms/`.

That directory is the source inventory, not the installable addon package.
