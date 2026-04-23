# GRC HR Bridge Module Specification

## 1. Purpose

`grc_hr_bridge` is the HR-domain bridge between canonical governance data in `grc_backbone` and operational records in `hr_pool` and `hr_recruitment`.

It exists to turn governed taxonomy into usable HR templates and controlled reference points.

It does not own live people-process records.

## 2. Dashboard identity

- Technical module name: `grc_hr_bridge`
- English app label: `HR Governance Bridge`
- Arabic app label: `جسر حوكمة الموارد البشرية`
- Category: `Human Resources`
- Module type: XML-only importable addon for Odoo SaaS

## 3. Module responsibility

### 3.1 Owns

The module owns HR governance composition artifacts:

- role / job description templates
- interview evaluation templates
- pre-employment document checklist templates
- declaration packs
- contract / offer packs
- template versioning fields
- template approval state fields
- bridge fields on HR operational models
- inherited views and actions that expose the bridge state to HR users

### 3.2 Does not own

The module does not own the live workflow records themselves:

- candidate intake submissions
- pooled candidate records
- applicant records
- actual interview sessions and responses
- actual contract acceptance records
- actual uploaded PII documents
- final signed PDFs for a specific person

Those belong in `hr_pool` or `hr_recruitment`.

## 4. Exact model names

### 4.1 Template models

- `x_grc.hr_role_template`
- `x_grc.hr_role_template_line`
- `x_grc.hr_interview_template`
- `x_grc.hr_interview_template_line`
- `x_grc.hr_document_checklist_template`
- `x_grc.hr_document_checklist_template_line`
- `x_grc.hr_declaration_pack`
- `x_grc.hr_declaration_pack_line`
- `x_grc.hr_contract_pack`
- `x_grc.hr_contract_pack_line`

### 4.2 Shared bridge fields and common metadata

Each template parent should carry the same operational metadata pattern:

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

### 4.3 Recommended line-level link fields

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

Declaration pack line:

- `x_clause_id` -> `x_grc.clause`
- `x_applicant_must_sign`
- `x_hr_must_sign`
- `x_sequence`
- `x_internal_notes`

Contract pack line:

- `x_clause_id` -> `x_grc.clause`
- `x_is_optional`
- `x_sequence`
- `x_internal_notes`

## 5. Exact menus

### 5.1 Root menu

- English: `HR Governance Bridge`
- Arabic: `جسر حوكمة الموارد البشرية`

### 5.2 Suggested submenu structure

- `Templates`
  - `Role / Job Description Templates`
  - `Interview Evaluation Templates`
  - `Document Checklist Templates`
  - `Declaration Packs`
  - `Contract / Offer Packs`
- `Approvals`
  - `Template Review Queue`
  - `Published Templates`
- `References`
  - `Linked Functional Areas`
  - `Linked Functions`

## 6. Exact actions

The module should expose one `ir.actions.act_window` action per template model, plus filtered approval views.

Recommended action names:

- `action_hr_role_template`
- `action_hr_interview_template`
- `action_hr_document_checklist_template`
- `action_hr_declaration_pack`
- `action_hr_contract_pack`
- `action_hr_template_review_queue`
- `action_hr_template_published`

## 7. Exact views

Each template model should have:

- list view
- search view
- form view

### 7.1 Role template form pages

- Overview
- GRC Mapping
- Composition Lines
- Version / Approval

### 7.2 Interview template form pages

- Overview
- Questions / Criteria
- Scoring
- Version / Approval

### 7.3 Document checklist template form pages

- Overview
- Required Documents
- Renewal / Expiry Logic
- Version / Approval

### 7.4 Declaration pack form pages

- Overview
- Clauses
- Sign-off Rules
- Version / Approval

### 7.5 Contract pack form pages

- Overview
- Clauses
- Signature Routing
- Version / Approval

### 7.6 Inherited operational views

The bridge module should also add inherited views to:

- `hr.job`
- `x_hr.pool`
- `hr.applicant` if the recruitment workflow needs direct visibility in the applicant form

These inherited views should expose:

- selected role template
- selected interview template
- selected document checklist template
- selected declaration pack
- selected contract pack
- linked functional area
- linked governed function

## 8. Ownership split against other modules

### 8.1 Belongs in `grc_backbone`

- functional areas
- governed functions
- SOPs
- clauses
- contract template primitives
- risk and compliance taxonomy
- compliance governance vocabulary

### 8.2 Belongs in `grc_hr_bridge`

- HR-specific template assembly
- checklist and evaluation template composition
- bridge fields to operational HR models
- approval state for templates
- published template selection

### 8.3 Belongs in `hr_pool`

- intake candidate records
- source metadata
- intake-stage approval / conversion workflow
- intake PDF snapshots
- intake-specific operational records and child lines

### 8.4 Belongs in `hr_recruitment`

- applicant records
- interviews
- evaluation submissions
- offers
- contract execution
- onboarding and document instances

## 9. Document-to-model mapping

The existing HR forms should be treated as template inputs for this bridge layer.

Likely mapping:

- `MCEP-HR-F-0002` -> `x_grc.hr_document_checklist_template`
- `MCEP-HR-F-0003` -> `x_grc.hr_interview_template`
- role/job description forms -> `x_grc.hr_role_template`

The completed, signed, or person-specific instances belong in the operational modules, not in the bridge module.

## 10. Packaging rule

This module must remain separately zippable.

Only installable module files should be packaged.

Documentation, PDFs, mapping notes, and generated outputs stay outside the module archive in `docs/` or `resources/`.
