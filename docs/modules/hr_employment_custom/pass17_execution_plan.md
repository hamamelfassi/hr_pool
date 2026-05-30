# Pass 17 — Training and Certifications Implementation Plan

Status: scoped, not implemented  
Primary module: `hr_employment_custom`  
Environment: Odoo.com SaaS 19.2  
Build command: `./scripts/build_module_zip.sh hr_employment_custom`

## 1. Scope boundary

### In scope

Pass 17 implements the first training and certifications foundation after the accepted Pass 16 custody lifecycle.

In scope:

- Add Marsellia training/certification process records under native `hr.employee`.
- Add `x_hr.employee_training_commitment`.
- Add an employee `Training and Certifications` tab.
- Generate the training undertaking PDF after the source form/template is locked.
- Send the training undertaking through native Odoo Sign.
- Sync signed PDF and Sign certificate back to the training commitment.
- Copy/post generated, signed, certificate, and submitted training-certificate artifacts to employee chatter/files.
- Track certificate submission:
  - certificate required;
  - certificate attachment;
  - certificate received date;
  - certificate status.
- Add light training cost/commitment metadata:
  - provider;
  - course title;
  - location;
  - start/end dates;
  - cost amount;
  - cost in words;
  - service commitment period;
  - commitment end date;
  - recovery required flag;
  - recovery amount.
- Add optional `hr.resume.line` integration after model availability is verified.
- Add optional skill/certification mapping fields only after model availability is verified.
- Preserve future payroll/finance recovery hooks as metadata only.

### Out of scope

Pass 17 must not implement:

- payroll deduction;
- accounting entries;
- employee receivables/payables;
- final settlement recovery automation;
- Approvals app workflow;
- LMS/training calendar integration;
- external training provider portal;
- automatic leave/attendance/work-entry effects;
- GRC decision instances;
- Documents app governance;
- hard dependency on `hr_skills`, `hr_resume`, `approvals`, `account`, `hr_payroll`, `project`, `planning`, or any unverified model;
- broad refactor of Pass 15/16 PDF or Sign actions.

## 2. Preconditions

Required prior state:

- Pass 15 is closed and accepted.
- Pass 16 is closed and accepted.
- `hr_employment_custom` is installed and accepted.
- `hr.employee` has:
  - Identification tab;
  - Declarations tab;
  - Custody and Assets tab.
- The accepted artifact pattern exists:
  - `x_pdf_attachment_id`;
  - `x_signed_attachment_id`;
  - `x_sign_certificate_attachment_id`;
  - Sign request linkage;
  - generated/signed/certificate download icons;
  - employee chatter/files copy.
- The source training undertaking form/template is available in markdown/PDF and has been reviewed.
- If the form code is F-0012, this must be confirmed in 17A before QWeb generation.
- Employee has a work email or linked partner email for Odoo Sign testing.

## 3. Ownership and module boundary

Primary module:

```text
hr_employment_custom
```

Primary native anchor:

```text
hr.employee
```

Custom process model family:

```text
x_hr.employee_training_commitment
```

Boundary rules:

- Native `hr.employee` remains the employee source of truth.
- Training commitments are process records, not employee master-data fields.
- The training commitment owns its own generated PDF, Sign request, signed PDF, Sign certificate, and certificate-submission artifact.
- `hr.resume.line` is an integration target, not the lifecycle source of truth.
- Skills/certifications are integration targets, not required for the first working training commitment.
- No payroll or accounting consequence is created in Pass 17.

## 4. Model doctrine

### 4.1 Training commitment model

Model:

```text
x_hr.employee_training_commitment
```

Purpose:

- record an employee training/certification commitment;
- generate and sign the training undertaking;
- track certificate submission;
- optionally create/update resume/skill records after completion;
- preserve future payroll/finance recovery metadata without executing recovery.

Recommended fields:

```text
x_name
x_employee_id
x_state
x_reference_code
x_document_reference

x_course_name
x_training_provider
x_training_location
x_training_start_date
x_training_end_date
x_cost_amount
x_cost_amount_words
x_currency_label

x_certificate_required
x_certificate_status
x_certificate_attachment_id
x_certificate_received_on
x_certificate_notes

x_service_commitment_months
x_commitment_start_date
x_commitment_end_date
x_recovery_required_if_breached
x_recovery_amount
x_recovery_notes

x_resume_line_id
x_resume_line_res_id
x_skill_id
x_skill_res_id
x_skill_level_id
x_skill_level_res_id

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

Implementation note:

- Use real many2one fields for `hr.resume.line`, skill, or skill-level only if their model/XML IDs are verified in the current Odoo SaaS database during 17A.
- If not verified, use integer/text placeholders such as `x_resume_line_res_id` and defer hard linking.

### 4.2 Lifecycle states

Recommended first-pass states:

```text
draft
generated
signature_requested
signed
certificate_pending
certificate_received
closed
cancelled
superseded
```

State doctrine:

- `draft`: editable training commitment.
- `generated`: undertaking PDF generated.
- `signature_requested`: Odoo Sign request sent.
- `signed`: undertaking signed.
- `certificate_pending`: certificate still required.
- `certificate_received`: certificate attachment received.
- `closed`: HR has accepted certificate/training closure.
- `cancelled`: cancelled before completion.
- `superseded`: replaced by a later training commitment.

### 4.3 Certificate submission

Certificate submission should be owned by the training commitment itself.

Initial fields:

```text
x_certificate_required
x_certificate_status
x_certificate_attachment_id
x_certificate_received_on
x_certificate_notes
```

Initial status values:

```text
not_required
pending
received
accepted
rejected
```

Keep source labels English-only. Translate through exported PO anchors after installation.

### 4.4 Resume/skill integration

Pass 17 should treat native resume/skill integration as guarded integration.

Possible integration:

```text
x_hr.employee_training_commitment
→ hr.resume.line
→ future skill/certification mapping
```

Rules:

- Do not hard-link to native resume/skill models until 17A verifies model availability.
- If `hr.resume.line` is available, certificate receipt can create/update one resume line.
- If native skill/certification models are unavailable or unclear, store intended mapping metadata only and defer hard linkage.

## 5. Files likely touched

Expected new/changed module files:

```text
modules/hr_employment_custom/__manifest__.py
modules/hr_employment_custom/models/04_employee_training.xml
modules/hr_employment_custom/views/04_employee_training_views.xml
modules/hr_employment_custom/data/12_employee_training_automation.xml
modules/hr_employment_custom/data/13_employee_training_generate_actions.xml
modules/hr_employment_custom/data/14_employee_training_sign_actions.xml
modules/hr_employment_custom/data/15_employee_training_certificate_actions.xml
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
training certificate test files
screenshots
exported translation files in repo root unless deliberately used as patch input
temporary extracted module directories
```

## 6. Slice plan

### 17A — Training preflight and documentation lock

Goal:

- Lock Pass 17 boundaries before code.
- Confirm training form source/template.
- Confirm whether the form code is F-0012.
- Confirm native model availability for:
  - `hr.resume.line`;
  - skill/certification models if present;
  - activity types if needed.

Expected changes:

- Documentation only.
- No model/view/report code.

Sanity checks:

- `pass17_execution_plan.md` exists.
- Plan states payroll/accounting recovery is metadata-only.
- Plan states resume/skill integration is guarded by preflight.
- Plan states source labels must remain English and translations use exported PO anchors.
- No dependency change is proposed in 17A.

Odoo acceptance:

- Not applicable.

Status:

    planned

### 17B — Training model and employee tab

Goal:

- Add `x_hr.employee_training_commitment`.
- Add employee `Training and Certifications` tab.
- Keep this slice UI/model-only, without PDF or Sign.

Expected changes:

- Add model and fields.
- Add `hr.employee.x_training_commitment_ids`.
- Add access rule.
- Add employee tab/list and controlled modal/form.
- Add name normalization and simple chatter note on create/update.
- Add artifact fields hidden from normal operational editing.
- Add certificate fields but no certificate workflow button yet.

Sanity checks:

- XML parses.
- Access CSV row endings are clean.
- Manifest load order is model → security → data/actions → views → reports.
- No QWeb report/action is added yet.
- No Sign action is added yet.
- No hard dependency is added.
- Employee form still opens.
- Existing Identification, Declarations, and Custody tabs remain visible.

Odoo acceptance:

- Install/upgrade succeeds.
- Training tab renders.
- Training commitment create/edit works.
- Record links to correct employee.
- English UI labels are clean.
- Arabic labels are deferred until export/PO slice.

Status:

    planned

### 17C — Training commitment defaults, states, and certificate tracking

Goal:

- Make the model operational before report generation.

Expected changes:

- Add or finalize:
  - training date validation where safe;
  - commitment date helpers where safe;
  - certificate status fields;
  - certificate attachment/file field behavior;
  - responsible user field;
  - manual decision metadata.
- Add buttons/actions:
  - mark certificate received;
  - mark certificate accepted;
  - mark certificate rejected;
  - close training commitment.
- Add HR activity after signed training commitment if certificate is required.

Sanity checks:

- No payroll/accounting action exists.
- Certificate receipt does not create resume/skill rows yet unless explicitly deferred to 17F.
- Chatter notes are simple and Arabic-first where practical.
- Sync-like actions must not reopen closed/cancelled/superseded states.

Odoo acceptance:

- Certificate can be uploaded.
- Certificate received date can be set.
- Certificate status changes are visible.
- Chatter records certificate lifecycle.
- Closed records remain visible.

Status:

    planned

### 17D — Training undertaking QWeb/PDF generation

Goal:

- Generate the training undertaking PDF from the training commitment.

Expected changes:

- Add QWeb template.
- Add report action.
- Add Generate PDF action/button.
- Store generated PDF in `x_pdf_attachment_id`.
- Write `x_generated_on`.
- Move state to `generated`.
- Post/copy generated PDF to employee chatter/files.
- Add generated-PDF icon download.

QWeb source values:

- employee name from `hr.employee.name`;
- department from `department_id.name` where needed;
- job title from `job_title`;
- manager from `parent_id.name` where needed;
- course/provider/location/dates from training commitment;
- cost amount and words from training commitment;
- commitment/recovery text from training commitment;
- manual decision fields only if required by the source form.

Sanity checks:

- QWeb XML parses.
- A4 paper/header pattern reuses accepted common assets.
- No duplicate base64 assets are introduced unless technically necessary.
- Generation blocks with a clear toast if required training values are missing.
- Generated PDF uses `/web/content/<attachment_id>?download=true` for user-facing download.

Odoo acceptance:

- Generate PDF works.
- Generated PDF is readable and correctly populated.
- Generated PDF is stored on the training commitment.
- Generated PDF appears in employee chatter/files.
- Existing declaration and custody PDF generation still works.

Status:

    planned

### 17E — Training undertaking Odoo Sign send/sync

Goal:

- Add native Odoo Sign flow for the training undertaking.

Expected signer pattern:

- First-pass default: one signer, the employee.
- If the locked source form explicitly requires HR/GM countersignature, 17A must rescope this before 17E.

Expected changes:

- Add Send to Sign action/button.
- Add Sync action/button.
- Anchor `sign.send.request` to:
  - `model = x_hr.employee_training_commitment`;
  - `res_ids = [training commitment id]`.
- Create signature item(s) according to the locked PDF geometry.
- No date Sign item unless the source form requires a manually placed Sign date. Prefer generated date text where acceptable.
- Copy signed PDF and certificate to training commitment and employee chatter/files.
- Add signed/certificate icon downloads.

Sanity checks:

- Server-action code compiles.
- Duplicate active Sign request is blocked.
- Sync refreshes artifacts and Sign metadata.
- Sync must not silently reopen `closed`, `cancelled`, or `superseded` records.
- Existing declaration and custody Sign flows still work.

Odoo acceptance:

- Send to Sign works.
- Sign item placement is visible in Odoo Sign preview.
- Employee can complete signing.
- Sync moves state to `signed`.
- If certificate is required, state can move to `certificate_pending`.
- Signed PDF and certificate are linked and posted/copied to employee chatter/files.

Status:

    planned

### 17F — Certificate receipt and guarded resume integration

Goal:

- Close the loop after training/certification evidence is received.

Expected changes:

- Add certificate receipt/acceptance actions if not completed in 17C.
- Add guarded resume integration:
  - if `hr.resume.line` is available, create/update a resume line;
  - if not available, store intended resume metadata and show a clear note/toast.
- Store resume line reference only if the target model is verified.
- Optional skill mapping remains metadata unless native skill models are verified.

Sanity checks:

- No hard dependency is added.
- If `hr.resume.line` is unavailable, action fails gracefully.
- No payroll/accounting record is created.
- Certificate accepted/closed state cannot be silently reopened by Sign sync.

Odoo acceptance:

- Certificate can be accepted.
- Training commitment can close.
- Resume line is created/updated only where technically safe.
- Employee chatter records closure.
- Existing declaration/custody workflows still work.

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
- Record lessons learned from training model, QWeb generation, Sign calibration, certificate tracking, resume integration, and translation export.

Sanity checks:

- Documentation mentions what was implemented and what was deferred.
- Pass 18 is identified as the next pass.
- Generated artifacts and screenshots are not staged.

Odoo acceptance:

- Not applicable.

Status:

    planned

## 7. Implementation log

Append implementation notes here as slices are accepted.

### 17A implementation log

Status:

    not started

### 17B implementation log

Status:

    not started

### 17C implementation log

Status:

    not started

### 17D implementation log

Status:

    not started

### 17E implementation log

Status:

    not started

### 17F implementation log

Status:

    not started

### 17G implementation log

Status:

    not started

### 17H implementation log

Status:

    not started

## 8. Final Pass 17 acceptance gate

Pass 17 can close only when:

- Training commitment model exists.
- Employee Training and Certifications tab is installed and usable.
- Training commitment create/edit works.
- Training undertaking source form is locked.
- Training undertaking PDF generates using employee and training commitment values.
- Generated PDF is stored on the training commitment.
- Generated PDF is posted/copied to employee chatter/files.
- Training undertaking Sign send/sync works.
- Signed PDF and Sign certificate, when exposed by Odoo, are stored on the training commitment and posted/copied to employee chatter/files.
- Certificate submission tracking works.
- Certificate attachment is stored on the training commitment and posted/copied to employee chatter/files.
- Resume integration is either accepted as working or explicitly deferred after preflight.
- No payroll/accounting recovery is implemented.
- No hard dependency on unverified skill/resume/payroll/accounting/approvals models is introduced.
- Arabic translations have been patched through the exported-anchor PO method.
- Existing Pass 15 declarations still work.
- Existing Pass 16 custody still works.
- No generated PDFs, signed PDFs, screenshots, exported zips, exported root PO files, or temporary extracted folders are committed.

## 9. Commit discipline

Each accepted slice should be committed separately.

Recommended commit messages:

17A:

```text
docs: scope pass17 training certifications implementation
```

17B:

```text
pass17b: add employee training commitment model and tab
```

17C:

```text
pass17c: add training certificate tracking lifecycle
```

17D:

```text
pass17d: add training undertaking pdf generation
```

17E:

```text
pass17e: add training undertaking sign send and sync
```

17F:

```text
pass17f: add training certificate closure and resume hook
```

17G:

```text
pass17g: polish training translations
```

17H:

```text
docs: close pass17 training certifications lifecycle
```
