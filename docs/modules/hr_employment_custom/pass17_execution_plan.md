# Pass 17 — Training and Certifications Implementation Plan

Status: closed — implementation accepted; residual selection-value translation polish deferred
Primary module: `hr_employment_custom`  
Environment: Odoo.com SaaS 19.2  
Build command: `./scripts/build_module_zip.sh hr_employment_custom`  
Primary form: `MCEP-HR-F-0008` — Training Commitment Undertaking

## 1. Scope boundary

### In scope

Pass 17 implements the training commitment foundation around F-0008.

The accepted target is not a deep certification/LMS subsystem. It is a bounded training commitment and participation spine that can later integrate with certification records, skills, payroll recovery, termination workflows, GRC controls, and external training/provider workflows.

In scope:

- Add a top-level training requirement/type model: `x_hr.training`.
- Add a training course/session model: `x_hr.training_course`.
- Add an employee-specific training commitment/participation model: `x_hr.employee_training_commitment`.
- Add employee `Training` tab.
- Generate the employee-specific F-0008 training commitment undertaking as one full A4 page.
- Send F-0008 through native Odoo Sign.
- Sync signed PDF and Sign certificate back to the employee training commitment.
- Copy/post generated PDF, signed PDF, and Sign certificate to employee chatter/files.
- Track training participation state manually in Pass 17.
- Track commitment state manually or semi-automatically in Pass 17:
  - default Applied;
  - automatically Committed after signed;
  - Breached/Fulfilled/Cancelled through simple controls.
- Track training/course cost and recovery metadata as record fields only.
- Keep future reimbursement, payroll, settlement, and breach automation as backlog.

### Out of scope

Pass 17 must not implement:

- native resume line integration;
- native skills/certification integration;
- training certificate model deepening;
- certificate upload/approval lifecycle;
- payroll deduction;
- accounting entries;
- employee receivables/payables;
- final settlement recovery automation;
- contract termination breach automation;
- Approvals app workflow;
- LMS/training calendar integration;
- external training provider portal;
- automatic leave/attendance/work-entry effects;
- GRC decision instances;
- Documents app governance;
- hard dependency on `hr_skills`, `hr_resume`, `approvals`, `account`, `hr_payroll`, `project`, `planning`, or any unverified model.

Explicitly omitted from Pass 17:

```text
x_resume_line_id
x_resume_line_res_id
x_skill_id
x_skill_res_id
x_skill_level_id
x_skill_level_res_id
x_certificate_required
x_certificate_status
x_certificate_attachment_id
x_certificate_received_on
x_certificate_notes
```

## 2. Source form doctrine — F-0008

The actual form reference is:

```text
MCEP-HR-F-0008
```

F-0008 is an employee training commitment undertaking.

The generated form must fit on one full A4 page.

The source form contains:

- employee information:
  - full name;
  - employee ID;
  - job title;
  - department;
- training course details:
  - course title;
  - training provider;
- training cost;
- cost in words;
- undertaking statement;
- employee signature block;
- employee date line;
- thumbprint placeholder.

QWeb constraints:

- one A4 page;
- no second-page overflow;
- compact but readable bilingual Arabic/English text;
- table rows for employee/course/cost sections;
- undertaking text condensed enough to fit one page;
- employee signature/date section at bottom;
- thumbprint box retained visually but not automated through Odoo Sign in Pass 17;
- use accepted common A4/header assets where possible;
- do not introduce duplicate base64 font/logo payloads unless technically necessary.

Sign expectation:

- first-pass signer: employee only;
- signature item: employee signature area only;
- no Odoo Sign date item is used in Pass 17 because the F-0008 date is already printed/generated on the form;
- no thumbprint item, thumbprint workflow, thumbprint field, or manual thumbprint upload workflow is implemented; the thumbprint box remains a visual/manual placeholder outside the system.

## 3. Preconditions

Required prior state:

- Pass 15 is closed and accepted.
- Pass 16 is closed and accepted.
- `hr_employment_custom` is installed and accepted.
- `hr.employee` has:
  - Identification tab;
  - Declarations tab;
  - Custody and Assets tab.
- The accepted artifact pattern exists:
  - generated PDF;
  - signed PDF;
  - Sign certificate;
  - Sign request linkage;
  - generated/signed/certificate download icons;
  - employee chatter/files copy.
- The F-0008 markdown source is available and reviewed.
- Employee has a work email or linked partner email for Odoo Sign testing.
- `grc_backbone` model names for functional areas/functions are verified before relational GRC fields are imported.

## 4. Training model family

### 4.1 `x_hr.training`

Purpose:

Top-level training framework/type model. It represents the reusable training requirement/type. It is not an individual training session and not an employee participation record.

Fields:

```text
x_name
x_functional_area_id
x_training_course_ids
```

Field details:

| Field | Type | Notes |
|---|---|---|
| `x_name` | char | Name of the specific training requirement/type. |
| `x_functional_area_id` | many2one | Target: `x_grc.functional_area`. Verify exact model/XML ID in 17A. |
| `x_training_course_ids` | one2many | Target: `x_hr.training_course`, inverse `x_course_training_type_id`. |

Accepted limitation:

- This model is deliberately thin in Pass 17.
- Later passes can add governance requirements, mandatory role mapping, recurrence, validity, refresher cycles, compliance frameworks, and risk controls.

### 4.2 `x_hr.training_course`

Purpose:

Training course/session model. It holds a concrete course instance under a training type and is reused by employee-specific training commitments.

Fields:

```text
x_course_name
x_course_training_type_id
x_function_ids
x_training_provider_id
x_training_location
x_training_start_date
x_training_end_date
x_participant_ids
x_participant_commitment_ids
x_seat_cost_amount
x_seat_cost_amount_words
x_participant_seats
x_total_cost
x_currency_label
x_recovery_required_if_breached
x_notes
```

Field details:

| Field | Type | Notes |
|---|---|---|
| `x_course_name` | char | Course title/name. |
| `x_course_training_type_id` | many2one | Target: `x_hr.training`. Source label can be `Training Type`. |
| `x_function_ids` | many2many | Target: GRC function model. Verify whether actual model is `x_grc.function`, `x_grc.functions`, or another existing GRC model before implementation. |
| `x_training_provider_id` | many2one | Target: `res.partner`. Use many2one, not a selection, because providers are partner records. |
| `x_training_location` | char | Training location. |
| `x_training_start_date` | date | ISO display/storage through Odoo date field. |
| `x_training_end_date` | date | ISO display/storage through Odoo date field. |
| `x_participant_ids` | many2many or deferred convenience field | Do not make this the source of truth if it creates risk. Source of truth should be employee training commitment records. |
| `x_participant_commitment_ids` | one2many | Target: `x_hr.employee_training_commitment`, inverse `x_training_course_id`. |
| `x_seat_cost_amount` | float/monetary-like | Two decimals. Use SaaS-safe field type; if true monetary requires unsupported currency plumbing, use float with two decimals and `x_currency_label`. |
| `x_seat_cost_amount_words` | char | Cost in words for F-0008. |
| `x_participant_seats` | integer | Manual for now; later can be computed. |
| `x_total_cost` | float/monetary-like | Two decimals. Manual or simple calculated later. |
| `x_currency_label` | char | Example: LYD, USD, EUR, or Arabic currency label. |
| `x_recovery_required_if_breached` | boolean | Course-level default copied/read by employee commitments. |
| `x_notes` | text | Internal course notes. |

Design decision:

- Course participation is represented by `x_hr.employee_training_commitment`.
- `x_participant_ids` should not be a many2one. A course can have many employees.
- For Pass 17, either omit `x_participant_ids` or implement it as a convenience many2many only if safe. Do not rely on it as the operational source of truth.

### 4.3 `x_hr.employee_training_commitment`

Purpose:

Employee-specific participation and commitment instance for a given course. This model generates the employee-specific F-0008 undertaking and owns the form/sign/artifact lifecycle.

Technical naming:

```text
x_hr.employee_training_commitment
```

Do not use `committment` in the technical model name unless explicitly reconfirmed before 17B.

Fields:

```text
x_name
x_employee_id
x_training_course_id
x_training_type_id

x_state
x_commitment_state
x_is_breached
x_participation_state

x_reference_code
x_document_reference

x_service_commitment_months
x_commitment_start_date
x_commitment_end_date

x_recovery_amount
x_recovery_amount_words
x_recovery_notes

x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_sign_request_res_id
x_sign_request_state
x_sign_request_reference
x_sign_request_url
x_generated_on
x_sent_on
x_signed_on

x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
x_responsible_user_id
x_notes
```

Field details:

| Field | Type | Notes |
|---|---|---|
| `x_name` | char readonly | Normalized by automation/server action: employee name + course name + state. |
| `x_employee_id` | many2one | Target: `hr.employee`. Required. |
| `x_training_course_id` | many2one | Target: `x_hr.training_course`. Required. |
| `x_training_type_id` | many2one or readonly copied field | Target: `x_hr.training`; copied/derived from course where safe. |
| `x_state` | selection readonly | Form lifecycle: Draft, Generated, Signature Requested, Signed. |
| `x_commitment_state` | selection readonly/action-controlled | Higher commitment lifecycle: Applied, Committed, Breached, Fulfilled, Cancelled. |
| `x_is_breached` | boolean | Simple boolean for Pass 17 to mark breach. Can drive `x_commitment_state = breached`. |
| `x_participation_state` | selection | Manual in Pass 17: Allocated, In Training, Training Complete, Training Incomplete. No consequence yet. |
| `x_reference_code` | char readonly/default | `HR-F-0008`. |
| `x_document_reference` | char readonly | `HR-F-0008-EMP-<employee_id>-COURSE-<training_course_id>` or equivalent compact sequence. |
| `x_service_commitment_months` | integer | Default 24, because F-0008 states two calendar years. |
| `x_commitment_start_date` | date | Manual in Pass 17. Can default from course end date if accepted. |
| `x_commitment_end_date` | date readonly | Computed/normalized by automation: start date + service commitment months. |
| `x_recovery_amount` | float/monetary-like readonly | Lookup/copy from course `x_seat_cost_amount`. |
| `x_recovery_amount_words` | char readonly | Lookup/copy from course `x_seat_cost_amount_words`. |
| `x_recovery_notes` | text | Manual notes only; no payroll/accounting action. |
| artifact/sign fields | many2one/integer/url/datetime | Same accepted artifact pattern from declarations and custody. |
| manual decision fields | char/date/attachment | Optional governance/manual reference metadata. |
| `x_responsible_user_id` | many2one | Target: `res.users`. |
| `x_notes` | text | Internal notes. |

Implementation note:

- "Computed" in Pass 17 means normalized by SaaS-safe automation/server actions, not Python `@api.depends`.
- Read-only fields should be read-only in views and written only by controlled actions/automations.

## 5. Three-layer state doctrine

### 5.1 Form lifecycle layer — `x_state`

Purpose:

Immediate F-0008 document/artifact lifecycle.

Values:

```text
draft
generated
signature_requested
signed
```

Source labels:

```text
Draft
Generated
Signature Requested
Signed
```

Rules:

- default: Draft;
- Generate PDF moves Draft → Generated;
- Send to Sign moves Generated → Signature Requested;
- Sync moves Signature Requested → Signed when Odoo Sign is complete;
- Sync must not silently reopen future terminal/exception states once those are added.

### 5.2 Commitment layer — `x_commitment_state`

Purpose:

Higher employee obligation lifecycle.

Values:

```text
applied
committed
breached
fulfilled
cancelled
```

Source labels:

```text
Applied
Committed
Breached
Fulfilled
Cancelled
```

Rules for Pass 17:

- default: Applied;
- automatically set to Committed when `x_state = signed`;
- Breached can be set by a simple boolean/action;
- Fulfilled can be set by a simple button;
- Cancelled can be set by a simple button;
- no payroll/accounting/termination consequence in Pass 17.

Future use:

- trigger reimbursement/recovery flows;
- link to contract end/termination workflows;
- nullify obligations through governed cancellation flows;
- integrate with clearance/final settlement.

### 5.3 Participation layer — `x_participation_state`

Purpose:

Employee participation/attendance progression in the specific course.

Values:

```text
allocated
in_training
training_complete
training_incomplete
```

Source labels:

```text
Allocated
In Training
Training Complete
Training Incomplete
```

Pass 17 decision:

- include this as a manual selection field with no downstream consequence.
- It is useful because the employee commitment also doubles as the course participation record.
- Certification/deeper completion logic remains deferred.

## 6. Translation doctrine

Source labels:

- English only in XML/model/view/action definitions.
- No bilingual state labels in source XML.

Arabic translation:

- Use `i18n/ar_001.po`.
- Use exported Odoo anchors.
- For selection values, do not invent anchors.
- If module PO export lacks selection anchors, export `ir.model.fields.selection` and use exact `__export__.ir_model_fields_selection_...` refs for the current SaaS database.

This is now a locked lesson from Pass 16.

## 7. Files likely touched

Expected new/changed module files:

```text
modules/hr_employment_custom/__manifest__.py
modules/hr_employment_custom/models/04_employee_training.xml
modules/hr_employment_custom/views/04_employee_training_views.xml
modules/hr_employment_custom/data/12_employee_training_automation.xml
modules/hr_employment_custom/data/13_employee_training_generate_actions.xml
modules/hr_employment_custom/data/14_employee_training_sign_actions.xml
modules/hr_employment_custom/data/15_employee_training_commitment_actions.xml
modules/hr_employment_custom/report/10_employee_training_templates.xml
modules/hr_employment_custom/report/11_employee_training_report_actions.xml
modules/hr_employment_custom/security/ir.model.access.csv
modules/hr_employment_custom/i18n/ar_001.po
```

Expected documentation files:

```text
docs/modules/hr_employment_custom/pass17_execution_plan.md
docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md
docs/modules/hr_employment_custom/02_document_artifact_and_signing_pattern.md
docs/modules/hr_employment_custom/03_employee_form_tabs_and_ui_doctrine.md
docs/modules/hr_employment_custom/04_mobile_artifacts_chatter_and_activities.md
docs/modules/hr_employment_custom/05_pass_15_plus_roadmap.md
docs/modules/hr_employment_custom/README.md
```

Generated files that must not be committed:

```text
dist/*.zip
generated PDFs
signed PDFs
Sign certificates downloaded for testing
screenshots
exported translation files in repo root unless deliberately used as patch input
temporary extracted module directories
```

## 8. Slice plan

### 17A — Refined scope lock and preflight

Goal:

- Lock this refined Pass 17 scope before code.
- Confirm F-0008 as source form.
- Confirm one-page A4 target.
- Confirm technical model spelling.
- Preflight GRC model names:
  - functional area model;
  - function model.
- Decide whether `x_participant_ids` is omitted or implemented as a convenience many2many.
- Decide whether money fields use true monetary fields or SaaS-safe float fields with two decimals and currency label.

Expected changes:

- Documentation only.
- No module code.

Sanity checks:

- `pass17_execution_plan.md` says F-0008, not F-0012.
- Plan includes three models:
  - `x_hr.training`;
  - `x_hr.training_course`;
  - `x_hr.employee_training_commitment`.
- Plan omits resume/skill/certificate deepening fields.
- Plan includes three-layer state doctrine.
- Plan states F-0008 must fit one A4 page.
- Plan states source labels stay English and Arabic translations use exported anchors.

Odoo acceptance:

- Not applicable.

Status:

    planned

### 17B — Training framework and course models

Goal:

- Add `x_hr.training`.
- Add `x_hr.training_course`.
- Add access rows.
- Add simple menus/actions only if needed for HR configuration.
- Do not touch employee form yet unless needed for testing.

Expected changes:

- New model field XML.
- Access CSV rows.
- Basic standalone list/form views.
- Optional configuration menu under Employees/Configuration or module settings area if safe.

Sanity checks:

- XML parses.
- Access CSV row endings are clean.
- GRC many2one/many2many target models are verified before import.
- No employee commitment model yet unless explicitly bundled.
- No PDF or Sign actions.

Odoo acceptance:

- Upgrade succeeds.
- HR user can create training type.
- HR user can create training course.
- Training provider links to `res.partner`.
- Course cost fields accept two decimals.
- No existing Pass 15/16 behavior changes.

Status:

    planned

### 17C — Employee training commitment model and employee tab

Goal:

- Add `x_hr.employee_training_commitment`.
- Add employee `Training` tab.
- Add three-layer state fields.
- Add normalization/actions for name/reference/document reference.
- Keep this slice without PDF and without Sign.

Expected changes:

- New model fields.
- `hr.employee.x_training_commitment_ids`.
- Employee tab/list/modal.
- Commitment create/edit form.
- State defaults:
  - `x_state = draft`;
  - `x_commitment_state = applied`;
  - `x_participation_state = allocated`.
- Copy/lookup course values:
  - recovery amount;
  - recovery amount words;
  - recovery required default;
  - service commitment months default 24.
- Compute/normalize commitment end date from start date + months.
- Add simple buttons:
  - Mark Breached;
  - Mark Fulfilled;
  - Mark Cancelled;
  - Set In Training;
  - Set Training Complete;
  - Set Training Incomplete.

Sanity checks:

- No resume/skill/certificate fields exist.
- No PDF/Sign action exists.
- Read-only fields are readonly in views.
- Chatter notes are simple and Arabic-first where practical.
- Existing declaration/custody tabs still render.

Odoo acceptance:

- Employee training tab renders.
- Add Training Commitment opens controlled modal/form.
- Commitment links to employee and course.
- Name/reference normalize correctly.
- State buttons work without downstream consequence.

Status:

    planned

### 17D — F-0008 QWeb/PDF generation

Goal:

- Generate one-page A4 F-0008 from employee + course + commitment values.

Expected changes:

- QWeb template.
- Report action.
- Generate PDF button/action.
- Store generated PDF in `x_pdf_attachment_id`.
- Write `x_generated_on`.
- Move `x_state` to Generated.
- Post/copy generated PDF to employee chatter/files.
- Add generated-PDF icon download.

QWeb source values:

- employee name from `hr.employee.name`;
- employee ID from employee record or accepted identifier;
- job title from `job_title`;
- department from `department_id.name`;
- course title from `x_training_course_id.x_course_name`;
- provider from `x_training_course_id.x_training_provider_id.name`;
- cost from `x_recovery_amount` or course seat cost;
- cost in words from `x_recovery_amount_words`;
- service commitment months default 24 / two calendar years;
- employee signature/date section.

Sanity checks:

- QWeb XML parses.
- Output is one A4 page.
- No second-page overflow.
- Uses accepted common assets.
- Generate blocks with a clear toast if employee/course/cost values are missing.
- Generated PDF download uses `/web/content/<attachment_id>?download=true`.

Odoo acceptance:

- Generate PDF works.
- PDF is one A4 page.
- PDF is readable and correctly populated.
- Generated PDF is stored on the commitment.
- Generated PDF appears in employee chatter/files.
- Existing declaration and custody PDF generation still works.

Status:

    planned

### 17E — F-0008 Odoo Sign send/sync

Goal:

- Add native Odoo Sign for F-0008.

Expected signer pattern:

- one signer: employee.
- one signature item.
- one date item if the date box placement works cleanly.
- no thumbprint automation.

Expected changes:

- Send to Sign button/action.
- Sync button/action.
- Anchor `sign.send.request` to:
  - `model = x_hr.employee_training_commitment`;
  - `res_ids = [training commitment id]`.
- Copy signed PDF and certificate to commitment and employee chatter/files.
- Add signed/certificate icon downloads.
- Set `x_state = signed` after successful sync.
- Set `x_commitment_state = committed` after successful sync/signature.

Sanity checks:

- Server-action code compiles.
- Duplicate active Sign request is blocked.
- Sync refreshes artifacts and Sign metadata.
- Sync must not silently reopen cancelled/fulfilled/breached commitments.
- Existing declaration and custody Sign flows still work.

Odoo acceptance:

- Send to Sign works.
- Employee can sign.
- Date item placement is acceptable if used.
- Sync moves form lifecycle to Signed.
- Sync moves commitment lifecycle to Committed.
- Signed PDF and certificate are linked and posted/copied to employee chatter/files.

Status:

    planned

### 17F — Commitment and participation polish

Goal:

- Make the two non-form state layers operational enough for internal HR use.

Expected changes:

- Confirm/patch buttons/actions:
  - Mark Breached;
  - Mark Fulfilled;
  - Mark Cancelled;
  - Set In Training;
  - Set Training Complete;
  - Set Training Incomplete.
- Add simple notes/chatter messages.
- Confirm no payroll/accounting/termination integration is triggered.
- Confirm course participant view/list shows commitments or participants acceptably.

Sanity checks:

- Breached/Fulfilled/Cancelled are manual/action-driven only.
- Participation changes have no certification/payroll consequence.
- Chatter messages are human-readable.
- No hidden native dependency is introduced.

Odoo acceptance:

- HR can track participation status.
- HR can mark commitment fulfilled/cancelled/breached.
- State displays correctly.
- No existing Pass 15/16 behavior changes.

Status:

    planned

### 17G — Arabic translation polish

Goal:

- Apply translations after functional training slices install cleanly.
- Use the accepted exported-anchor PO workflow.

Expected changes:

- Export Arabic translations from Odoo after install/upgrade.
- Rebase `modules/hr_employment_custom/i18n/ar_001.po` from exported anchors.
- Patch targeted training labels.
- For selection fields:
  - use exported selection anchors if Odoo exports them;
  - if not, export `ir.model.fields.selection` and use exact `__export__` IDs for the current SaaS database.

Sanity checks:

- PO is UTF-8 plain text.
- `msgid/msgstr` syntax is valid.
- No fake references are introduced.
- No duplicate selection rows are created.
- Source labels remain English-only.

Odoo acceptance:

- Training tab, fields, buttons, and states appear correctly in Arabic.
- Existing declaration/custody Arabic states remain clean.
- No combined English/Arabic state labels appear.

Status:

    planned

### 17H — Documentation closure

Goal:

- Close Pass 17 documentation before Pass 18.

Expected changes:

- Update `pass17_execution_plan.md` with implementation logs.
- Update lifecycle, artifact, mobile/chatter, UI doctrine, roadmap, and README docs.
- Record lessons learned from:
  - training type/course/commitment model split;
  - one-page F-0008 QWeb;
  - Odoo Sign placement;
  - three-layer state doctrine;
  - translation export.

Sanity checks:

- Documentation mentions what was implemented and what was deferred.
- Pass 18 is identified as the next pass.
- Generated artifacts and screenshots are not staged.

Odoo acceptance:

- Not applicable.

Status:

    planned

## 9. Implementation log

### 17A implementation log

Status:

    accepted and committed

Outcome:

- Refined Pass 17 around the actual F-0008 Training Commitment Undertaking form.
- Confirmed the three-model training family:
  - `x_hr.training`;
  - `x_hr.training_course`;
  - `x_hr.employee_training_commitment`.
- Confirmed the three-layer state doctrine:
  - form lifecycle;
  - commitment lifecycle;
  - participation lifecycle.
- Explicitly omitted resume, skills, native certification deepening, payroll/accounting recovery, and termination recovery automation.

### 17B implementation log

Status:

    accepted and committed

Outcome:

- Added `x_hr.training` as the training type/framework model.
- Added `x_hr.training_course` as the course/session model.
- Added basic HR configuration views/actions/menus.
- Re-anchored the Training configuration group so it sits at the same Employees Configuration level as Employee, Resume, and Recruitment instead of being buried under Employee.
- Created and validated sample training type and course records.

Lessons:

- In Odoo SaaS XML imports, one2many fields must be loaded after the inverse many2one field already exists.
- Menu anchors must be verified from exported `ir.ui.menu` records. `hr.menu_hr_configuration` was invalid in this SaaS database; the accepted anchor was the exported HR configuration menu path.

### 17C implementation log

Status:

    accepted and committed

Outcome:

- Added `x_hr.employee_training_commitment`.
- Added employee `Training` tab.
- Added course-to-commitment and employee-to-commitment one2many links.
- Added normalized label/reference/document-reference automation.
- Removed `COURSE` from F-0008 document reference format.
- Added recovery metadata copied from the course:
  - recovery amount;
  - amount in words;
  - recovery-required flag.
- Added manual/action controls for:
  - breach;
  - fulfilment;
  - cancellation;
  - participation state.

Final naming/UI decisions:

- Employee tab label is `Training`, not `Training and Certifications`.
- Employee tab button is `New Training`, not `Add Training Commitment`.
- `x_hr.training_course` has `x_name` related to `x_course_name` so many2one dropdowns show the course name instead of the technical record string.

### 17D implementation log

Status:

    accepted and committed

Outcome:

- Added F-0008 QWeb/PDF generation.
- Generated PDF fits on one A4 page.
- Generated PDF uses employee, course, and commitment values.
- Generated PDF is linked to `x_pdf_attachment_id`.
- Generated PDF is posted to employee chatter/files.
- Added generated PDF download icon.
- Refined F-0008 section spacing/readability while preserving one-page output.

Lessons:

- Training form action buttons must not be injected into the parent `hr.employee` inherited view body when their visibility conditions reference fields on `x_hr.employee_training_commitment`.
- Operational buttons belong inside the commitment form body; artifact download icons belong in the header next to the statusbar.

### 17E implementation log

Status:

    accepted and committed

Outcome:

- Added native Odoo Sign send/sync for F-0008.
- Implemented one signer only:
  - employee.
- Implemented one Sign item only:
  - employee signature in the signature row.
- Did not implement Sign date item.
- Did not implement any thumbprint Sign item or thumbprint workflow.
- Signed PDF and Sign certificate, when available, are linked to the commitment and copied/posted to employee chatter/files.
- Sync moves:
  - `x_state` to Signed;
  - `x_commitment_state` to Committed.

Lessons:

- The thumbprint block remains outside the system by design. No fields, workflows, uploads, or lifecycle states should be added for thumbprinted PDFs unless a future governed pass explicitly scopes it.

### 17F implementation log

Status:

    accepted and committed

Outcome:

- Split training commitment buttons into three rows:
  - form lifecycle row: Generate PDF, Send to Sign, Sync;
  - commitment row: Mark Breached, Mark Fulfilled, Mark Cancelled;
  - participation row: Set In Training, Set Complete, Set Incomplete.
- Header remains reserved for:
  - statusbar;
  - generated PDF icon;
  - signed PDF icon;
  - Sign certificate icon.
- Rebased/patched Arabic PO entries for training UI labels and many view/action terms.
- Logged dynamic Arabic record-value PDF hardening as deferred backlog.

Known residual issue:

- Selection values for the training commitment state fields still show English in Arabic UI:
  - `x_state`: Draft, Generated, Signature Requested, Signed;
  - `x_commitment_state`: Applied, Committed, Breached, Fulfilled, Cancelled;
  - `x_participation_state`: Allocated, In Training, Training Complete, Training Incomplete.
- This is deferred because Odoo SaaS selection translations require exact exported `ir.model.fields.selection` anchors for the live database. Generic PO entries are not sufficient in this case.

### 17G implementation log

Status:

    accepted with deferred residual selection translation issue

Outcome:

- Arabic UI translations were improved for training tabs, action buttons, field labels, menus, and helper labels where exact anchors were available.
- Remaining state/selection translation issue was documented for future fixing rather than blocking the next pass.
- Future fix should use an exported `ir.model.fields.selection` spreadsheet/PO from the live database and patch exact exported selection IDs.

### 17H implementation log

Status:

    closed by documentation patch

Outcome:

- Pass 17 implementation state documented.
- Accepted deferrals recorded.
- Pass 17 closed for forward progress into the next employee lifecycle passes.

## 10. Final Pass 17 acceptance gate

Pass 17 closure result:

Pass 17 is closed and accepted for forward progress.

Accepted with one documented residual:
- training selection-state translations still require exact live-database `ir.model.fields.selection` anchors and remain deferred.

This residual does not block the functional training commitment lifecycle because:
- training type/course creation works;
- employee training commitment creation works;
- F-0008 PDF generation works;
- F-0008 Odoo Sign send/sync works;
- generated/signed/certificate artifacts are linked and posted correctly;
- commitment and participation controls work manually.


Pass 17 can close only when:

- F-0008 is locked as the source form.
- F-0008 generated PDF fits on one A4 page.
- `x_hr.training` exists and is usable.
- `x_hr.training_course` exists and is usable.
- `x_hr.employee_training_commitment` exists and is usable.
- Employee Training tab is installed and usable.
- Training commitment create/edit works.
- Training commitment links employee + training course.
- Three state layers are present:
  - form lifecycle;
  - commitment lifecycle;
  - participation lifecycle.
- F-0008 PDF generates using employee, course, and commitment values.
- Generated PDF is stored on the training commitment.
- Generated PDF is posted/copied to employee chatter/files.
- F-0008 Sign send/sync works.
- Signed PDF and Sign certificate, when exposed by Odoo, are stored on the training commitment and posted/copied to employee chatter/files.
- Signing moves commitment to Committed.
- Manual breach/fulfil/cancel controls work without payroll/accounting consequence.
- Participation status can be tracked manually.
- No resume/skill/certificate deepening fields are implemented.
- No payroll/accounting recovery is implemented.
- No hard dependency on unverified GRC/skill/resume/payroll/accounting/approvals models is introduced.
- Arabic translations have been patched through the exported-anchor PO method.
- Existing Pass 15 declarations still work.
- Existing Pass 16 custody still works.
- No generated PDFs, signed PDFs, screenshots, exported zips, exported root PO files, or temporary extracted folders are committed.

## 11. Deferred backlog from Pass 17

Additional deferred items locked at Pass 17 closure:

- Exact Arabic translation of training selection values:
  - `x_hr.employee_training_commitment.x_state`;
  - `x_hr.employee_training_commitment.x_commitment_state`;
  - `x_hr.employee_training_commitment.x_participation_state`.
- Future fix must use exact exported live-database selection anchors from Odoo, preferably from `ir.model.fields.selection`, rather than guessed PO references.
- Dynamic Arabic rendering of record-derived PDF values:
  - training type;
  - course name;
  - provider;
  - location;
  - currency label;
  - amount in words.
- Future hardening should force Arabic report render context and block generation with a specific toast when a required Arabic translation is missing.
- No thumbprint workflow is to be added for F-0008 unless a future governed pass explicitly scopes it.
- No resume, skills, certificate, payroll, accounting, termination, or final-settlement automation is introduced by Pass 17.


Deferred for later employment lifecycle passes:

- native resume line integration;
- native skill/certification integration;
- certificate submission/acceptance lifecycle;
- certificate expiry/renewal;
- training provider portal;
- training attendance automation;
- training calendar/LMS integration;
- payroll/accounting recovery;
- final settlement recovery integration;
- contract expiry/termination breach automation;
- GRC governed decision/cancellation/amendment flow;
- Documents app governance and retention policy.

## 12. Commit discipline

Each accepted slice should be committed separately.

Recommended commit messages:

17A:

```text
docs: refine pass17 f0008 training commitment architecture
```

17B:

```text
pass17b: add training framework and course models
```

17C:

```text
pass17c: add employee training commitment model and tab
```

17D:

```text
pass17d: add f0008 training commitment pdf generation
```

17E:

```text
pass17e: add f0008 training commitment sign send and sync
```

17F:

```text
pass17f: add training commitment and participation controls
```

17G:

```text
pass17g: polish training translations
```

17H:

```text
docs: close pass17 training commitment lifecycle
```

## Pass 17F backlog note — dynamic record-value Arabic translation hardening

F-0008 currently uses a bilingual QWeb layout for static form labels and undertaking text. This is acceptable for the current demonstrator slice, but it does not fully solve Arabic rendering for dynamic values read from records, such as Training Type, Course Name, Provider, Location, Currency Label, and Amount in Words.

Future hardening requirement:
- Render official Arabic-first PDFs with explicit Arabic context, not by relying on the UI language of the user pressing the button.
- For every required dynamic record value shown on the PDF, validate that an Arabic translated value exists when the source value is not already Arabic.
- If a required Arabic translation is missing, block PDF generation with a clear toast naming the exact model, field, and record that needs translation.
- Allow the translation to be fixed through the exported PO workflow or, for emergency correction only, through Studio/translation UI.
- Do not implement this as part of 17F; schedule it as a later translation-governance hardening slice.
