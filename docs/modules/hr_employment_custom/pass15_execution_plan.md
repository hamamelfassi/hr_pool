# Pass 15 — Employment Lifecycle Foundation and Employee Declarations Implementation Plan

## 1. Scope boundary

### In scope

- Correct the `hr_employment_custom` dependency posture after the Pass 13 SaaS finding that `hr.contract` is not a safe assumed dependency/target.
- Scaffold `hr_employment_custom` as an extension of native `hr.employee`, not a separate app.
- Add the employee Identification tab and `x_hr.employee_identification_document` model.
- Add a controlled recruitment handover identity-sync slice, `Pass 13J`, in `hr_recruitment_custom`.
- Keep identity sync as a separate action first, then optionally wire it into the proven `بدء التوظيف` action after it passes.
- Build employee declaration lifecycle after the identity foundation is stable:
  - F-0010 Exclusive Employment Declaration.
  - F-0013 Occupational Safety Acknowledgment.
  - F-0021 Human Waste Handling Employee Undertaking.
  - F-0022 Human Waste Storage Supervisor Undertaking.
- Use `hr.employee` native values and selected employee identity records as declaration QWeb sources.
- Use source process records as artifact lifecycle truth: generated PDF, signed PDF, certificate, Sign request linkage, chatter, and mobile-safe employee files.

### Out of scope

- `hr.contract` creation or hard dependency.
- Payslips, pay runs, work entries, attendance effects, leave records, custody records, training records, appraisal records, separation, clearance, or payroll/accounting effects.
- Documents app governance.
- GRC decision instances.
- Reworking the accepted recruitment handover flow except the bounded `13J` identity sync touchpoint.
- Replacing `x_document_type` / `x_expiry_status` selection fields with helper models during 15B. This is deferred unless longer labels become operationally important.

## 2. Preconditions

Required prior state:

- Pass 13I is committed and accepted.
- `hr_recruitment_custom` owns the accepted applicant-to-employee `بدء التوظيف` / On-board Now action.
- `hr_employment_custom` owns only post-employee lifecycle records.
- `hr_employment_custom` 15B is installed and confirms:
  - `x_hr.employee_identification_document` exists.
  - `hr.employee.x_identification_document_ids` exists.
  - employee form has the `الهوية / Identification` tab.
  - identity line create/edit modal works.
  - `x_name` is normalized to `employee name - document number`.
  - employee chatter receives a clean identity update note.
- The recruitment required-document submission model contains accepted identity submissions with:
  - `x_document_code`.
  - `x_document_number`.
  - `x_issuing_authority`.
  - `x_place_of_issue`.
  - `x_issue_date`.
  - `x_expiry_date`.
  - `x_attachment_id`.

## 3. Ownership and module boundary

Primary module for Pass 15B and 15C+:

```text
hr_employment_custom
```

Secondary module touchpoint for Pass 13J:

```text
hr_recruitment_custom — owns applicant-to-employee handover and reads accepted recruitment identity submissions.
```

Boundary rules:

- `hr_employment_custom` must not depend on `hr_recruitment_custom`.
- `hr_recruitment_custom` must not hard-depend on `hr_employment_custom`.
- `Pass 13J` must soft-detect `x_hr.employee_identification_document` using model availability before writing identity lines.
- Identity lines are linked by writing `x_employee_id` on each line; no manual one2many command is needed on `hr.employee`.

## 4. Files likely touched

Expected files:

```text
docs/modules/hr_employment_custom/pass15_execution_plan.md
docs/modules/hr_employment_custom/00_module_architecture.md
docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md
docs/modules/hr_employment_custom/03_employee_form_tabs_and_ui_doctrine.md
docs/modules/hr_employment_custom/05_pass_15_plus_roadmap.md

modules/hr_employment_custom/__manifest__.py
modules/hr_employment_custom/models/01_employee_identification.xml
modules/hr_employment_custom/views/01_employee_identification_views.xml
modules/hr_employment_custom/data/01_employee_identification_automation.xml
modules/hr_employment_custom/security/ir.model.access.csv
modules/hr_employment_custom/i18n/ar_001.po

modules/hr_recruitment_custom/__manifest__.py
modules/hr_recruitment_custom/models/01_fields.xml
modules/hr_recruitment_custom/views/01_recruitment_views.xml
modules/hr_recruitment_custom/data/30_applicant_identity_handover_actions.xml
```

Generated files that must not be committed:

```text
dist/*.zip
generated PDFs
screenshots
temporary exports
temporary extracted module directories
```

## 5. Slice plan

### 15A — Documentation/dependency correction

Goal:

- Align `hr_employment_custom` docs with Pass 13 SaaS findings.
- Remove `hr_contract`, `hr_payroll`, `hr_payroll_account`, and `account` from starting dependency posture.
- Record the thin declaration model doctrine.
- Add employee identification model/tab doctrine.

Expected changes:

- Documentation only.

Sanity checks:

- Confirm docs still mention `hr_contract` only as unsafe/deferred, not as active dependency.
- Confirm roadmap includes 15A, 15B, 13J, and 15C+ sequencing.

Odoo acceptance:

- Not applicable; docs-only pass.

Status:

```text
passed and committed
```

### 15B — Employment module scaffold + employee Identification tab/model

Goal:

- Create `hr_employment_custom` with minimum dependencies.
- Add `x_hr.employee_identification_document`.
- Add `hr.employee.x_identification_document_ids`.
- Add a single Identification tab/list on native employee.
- Keep the UI source English with Arabic in `i18n/ar_001.po`.

Expected changes:

- New module scaffold.
- Employee Identification tab.
- Identity line modal create/edit.
- Clean employee chatter update.
- Binary image upload/preview field.
- Bilingual source labels for short selection values as a temporary compromise.

Sanity checks:

- Manifest excludes `hr_contract`, `hr_payroll`, `hr_payroll_account`, `account`, and `hr_recruitment_custom`.
- XML parses cleanly.
- `x_attachment_id` is not exposed in the UI as a free attachment picker.
- `x_document_image` is shown with image widget.
- `x_name` and `x_employee_id` are readonly in modal form.
- Chatter automation contains only simple Arabic-first identity update text.

Odoo acceptance:

- Install/upgrade succeeds.
- Employee Identification tab renders.
- Add Identification opens modal.
- Create and edit identity records work.
- Type and expiry badges display.
- Chatter shows: `تم تحديث بيانات الهوية: <employee name> - <document number>`.
- Arabic labels load for exported anchors.
- Short selection-label translation compromise is acceptable for 15B.

Status:

```text
passed; commit pending/expected
```

### 13J-A — Applicant Employment / الترحيل tab surface

Goal:

- Move employment handover metadata out of the Contract tab into a dedicated final applicant tab.
- Provide a cleaner place for `بدء التوظيف` and `ترحيل الهوية`.
- Reduce risk by not changing the accepted On-board Now logic in this slice.

Expected changes:

- Add final applicant tab:
  - Arabic label: `الترحيل`.
  - Working English meaning: `Employment`.
- Move, not duplicate, the following blocks from the current Contract tab:
  - `بوابة ما قبل التوظيف`.
  - `إعدادات الرواتب الافتراضية`.
  - `بدء التوظيف`.
  - `العقود المرتبطة`.
  - relevant handover notes.
- Add action row at the top of the tab:
  - `تحديث جاهزية التوظيف`.
  - `بدء التوظيف`.
  - `ترحيل الهوية`.
- Remove `بدء التوظيف` from the global applicant header once the tab button exists.

Sanity checks:

- XML parses cleanly.
- Contract tab still contains contract-generation lifecycle fields.
- Employment tab contains preboarding/handover/payroll/bank/artifact/identity metadata.
- No duplicated `x_employment_contract_ids` surface remains.
- Header is not overloaded.

Odoo acceptance:

- Applicant form opens.
- New `الترحيل` tab appears.
- Existing employment handover metadata is visible there.
- `بدء التوظيف` still runs successfully from the tab.
- No regression in Contract tab document workflows.

### 13J-B — Applicant identity handover fields and standalone action

Goal:

- Add standalone `ترحيل الهوية` action after employee has been created/linked.
- Soft-detect `x_hr.employee_identification_document`.
- Sync accepted recruitment identity submissions into employee identification lines.

Expected changes:

- Applicant metadata fields:
  - `x_employment_identity_ready`.
  - `x_employment_identity_count`.
  - `x_employment_identity_checked_on`.
  - `x_employment_identity_checked_by_user_id`.
  - `x_employment_identity_notes`.
- Server action:
  - `action_hr_applicant_sync_employee_identity_documents`.
- Action reads accepted submissions for:
  - `id_card` / `national_id` → employee document type `id_card`.
  - `passport` → employee document type `passport`.
  - `driving_license` → employee document type `driving_license`.
- Action creates/updates one `x_hr.employee_identification_document` record per type.
- Each identity line is created separately with `x_employee_id = employee.id`.
- Existing line matching same employee + document type is updated rather than duplicated.
- Action writes source trace:
  - `x_source_model = x_hr.applicant_required_document_submission`.
  - `x_source_res_id = submission.id`.
  - `x_source_attachment_id = submission.x_attachment_id`.
- Action writes applicant status fields and applicant chatter summary.
- Employee chatter is handled by the `hr_employment_custom` identity automation.

Sanity checks:

- XML parses.
- Server action Python compiles.
- No hard reference to `hr_employment_custom` in manifest dependency.
- Action has a guard for missing employment module/model.
- Action has a guard for no linked employee.
- Action has a guard for no accepted identity submissions.
- Action is idempotent.

Odoo acceptance:

- Before `بدء التوظيف`, clicking `ترحيل الهوية` gives a clear warning that no linked employee exists.
- After `بدء التوظيف`, clicking `ترحيل الهوية` creates/updates identity lines on the linked employee.
- Re-running the action updates existing lines instead of duplicating.
- Applicant identity status fields update.
- Employee chatter receives clean identity update notes.

### 13J-C — Optional integration into On-board Now

Goal:

- After standalone identity sync passes, call the same identity sync logic from the accepted `بدء التوظيف` flow.

Expected changes:

- Extend `data/29_applicant_onboard_now_actions.xml` carefully.
- Call identity sync after employee create/link and before final closure note.
- Identity sync failure should not destroy employee creation if core handover succeeded; it should mark identity status blocked/warning and surface in handover notes.

Sanity checks:

- Existing On-board Now Python still compiles.
- Existing payroll/bank/artifact/finalization flow remains intact.
- Identity sync is called only if `x_hr.employee_identification_document` exists.
- No circular module dependency introduced.

Odoo acceptance:

- On-board Now still passes on already accepted test applicant.
- Employee is created/linked as before.
- Identity lines are created/updated automatically when employment module is installed.
- If employment module is absent, On-board Now still works.

Status:

```text
defer implementation until 13J-B standalone path passes
```

### 15C — Employee declaration model and thin employee tab

Goal:

- Add `x_hr.employee_declaration` and declarations tab.
- Keep declaration records thin and source values from `hr.employee` + selected identification record.

Expected changes:

- Employee Declarations tab.
- Declaration model fields for lifecycle/artifacts/sign only.
- Selected identification document field.
- No duplicated employee name/department/job/manager/national ID snapshots unless a specific PDF proves a legal need.

Sanity checks:

- XML parses.
- Model access exists.
- Declaration fields remain thin.
- No custody/training/leave/payroll models introduced.

Odoo acceptance:

- Declaration records can be created from employee.
- Selected identity document is constrained to the same employee.
- No generated PDF yet.

### 15D+ — Employee declaration QWeb/Sign lifecycle

Goal:

- Implement F-0010, F-0013, F-0021, F-0022 generation, Sign send, sync, artifact copy, and mobile-safe employee chatter/files.

Expected changes:

- QWeb templates/actions.
- Generate PDF action.
- Native Odoo Sign send/sync actions.
- Signed PDF and certificate copy to employee chatter/files.
- Arabic/English translation updates per slice.

Sanity checks:

- Report XML parses.
- Report actions use exact single-line `report_name` and `report_file`.
- Paperformat is defined.
- Server action Python compiles.
- Sign anchoring uses source process model and record ID.

Odoo acceptance:

- Generate/send/sync works per declaration type.
- Signed artifacts appear in source process record and employee chatter/files.
- Mobile-safe artifact access is verified.

## 6. Slice implementation log

Append to this section as slices are implemented.

### 15A implementation log

#### 15A1 — Documentation posture correction

Patch/script applied:

```text
Pass 15A documentation posture patch pack.
```

Sanity result:

```text
Passed after confirming hr_contract appears only in deferred/unsafe context.
```

Odoo result:

```text
Not applicable.
```

Lessons learned:

- Sanity checks must distinguish active dependencies from deferred warnings.
- Pass 13 SaaS finding governs the employment module dependency posture.

Status:

```text
passed
```

### 15B implementation log

#### 15B1 — Initial scaffold and Identification tab

Patch/script applied:

```text
Created hr_employment_custom with employee identification model and tab.
```

Sanity result:

```text
XML/build passed.
```

Odoo result:

```text
Install initially failed due to brittle Studio positional XPath. Corrected by appending tab to notebook instead of inserting after Personal tab.
```

Lessons learned:

- Existing Studio views can use positional notebook XPath; inserting a page in the middle can break unrelated inherited views.
- Append custom employee tabs at the end unless current inherited view chain is safe.

Status:

```text
passed after fix
```

#### 15B2 — Single-list identity UI and chatter/image hardening

Patch/script applied:

```text
Replaced repeated filtered one2many sections with a single list and Add Identification modal.
Added expiry status, image upload, x_name normalization, and chatter automation.
```

Sanity result:

```text
XML/build passed.
```

Odoo result:

```text
Identity line create/edit works. Badges display. Image upload/preview works. Chatter simplified after refinement.
```

Lessons learned:

- Repeating one one2many field four times causes shared-cache/UI confusion.
- Use one list and a typed document type field.
- For image upload/preview, use a binary image field rather than exposing a free ir.attachment picker.

Status:

```text
passed
```

#### 15B3 — Translation refinement

Patch/script applied:

```text
Moved XML labels to English and Arabic to ar_001.po. Used bilingual source labels for short selection labels after Odoo export did not expose selection anchors.
```

Sanity result:

```text
Passed.
```

Odoo result:

```text
Exported PO anchors work for normal fields/view terms. Selection-value anchors were not consumed in this SaaS import path; bilingual source labels accepted for 15B.
```

Lessons learned:

- For future long labels, use helper records instead of inline selection labels if strong translation control is required.

Status:

```text
passed
```

## 7. Tracebacks and fixes

### Traceback 1 — Employee form inherited view `priority` field error

Error:

```text
Field `priority` does not exist
```

Root cause:

```text
A brittle existing Studio inherited employee view used positional notebook XPath. Inserting the Identification tab after Personal shifted page order, causing the Studio XPath to apply to the wrong field/model.
```

Fix applied:

```text
Append Identification tab at the end of the employee notebook.
```

Acceptance after fix:

```text
hr_employment_custom installed cleanly and the Identification tab appeared.
```

### Traceback 2 — Repeated identity sections mirrored the same line

Error:

```text
Adding a line in one identity section displayed the same transient line across all four sections.
```

Root cause:

```text
The same one2many field was rendered four times with different domains. Odoo’s one2many cache is shared across all four renderings.
```

Fix applied:

```text
Replaced four repeated one2many sections with one list and a typed Document Type field.
```

Acceptance after fix:

```text
One identity row is created/edited cleanly in one list.
```

## 8. Final acceptance gates

The pass cannot close until all gates pass:

- [x] XML parses cleanly.
- [x] server-action Python compiles where relevant.
- [x] module zip builds locally.
- [x] Odoo install/upgrade succeeds for 15B.
- [x] relevant UI surfaces render correctly for 15B.
- [x] happy path acceptance passes for identity line creation/editing.
- [x] chatter behavior is verified for identity update.
- [x] generated files are not committed.
- [x] 15B commit message recorded.
- [x] 13J standalone identity sync passes.
- [x] 15C+ declaration lifecycle passes.
- [x] Pass 15 employee declaration QWeb, Sign, sync, artifact, and translation polish accepted.

## 9. Commit log

Commit command used for 15B:

```bash
git commit -m "pass15b: scaffold employment module identification tab"   -m "Creates hr_employment_custom with minimal dependencies, adds the employee identification document model and Identification tab, and hardens the identity UI with a single typed list, image upload, normalized labels, chatter logging, and Arabic UI translations."
```

Commit hash:

```text
[paste hash after commit]
```

## 10. Closure notes

Locked:

- `hr_employment_custom` starts without `hr_contract`, payroll, account, or recruitment dependencies.
- Employee identity documents live on `x_hr.employee_identification_document`.
- Employee identity lines are the reusable source for future declaration/custody/assignment PDFs.
- Identity line source keys remain stable even when labels are bilingual.

Deferred:

- Fully translatable long document/status labels through helper models.
- Automatic identity sync inside On-board Now until standalone `ترحيل الهوية` passes.
- Employee declarations QWeb/Sign lifecycle.

Carried forward:

- `13J` must use the typed accepted recruitment document submission fields already proven by the F-0005 employment contract snapshot flow.
- `15C+` declarations must read from `hr.employee` and selected employee identity records instead of duplicating large snapshot fields.

## 11. Progress update — Pass 15B and 13J-B locked

### 15B accepted state

Pass 15B is functionally accepted and committed.

Locked outcomes:

- `hr_employment_custom` installs cleanly with no `hr_contract`, payroll, account, or recruitment hard dependency.
- `x_hr.employee_identification_document` is installed as the reusable employee identity source model.
- `hr.employee.x_identification_document_ids` renders in the employee `الهوية / Identification` tab.
- The employee identity UI uses one controlled typed list, not four repeated one2many sections.
- `Add Identification / إضافة هوية` opens a create/edit modal.
- `x_document_image` provides an image upload/preview surface.
- `x_source_attachment_id` keeps the recruitment/source attachment link.
- A controlled download action opens/downloads source attachment content instead of the `ir.attachment` metadata form.
- `x_name` is normalized as:

```text
Employee Name - Document Type - Document Number
```

- Employee chatter receives clean Arabic-first update notes.
- Short document type/status selection labels use bilingual source labels as a temporary compromise.

Deferred from 15B:

- Fully translatable long document/status labels through helper records.
- Automatic handover sync from `بدء التوظيف`.

### 13J-A accepted state

Pass 13J-A is functionally accepted and committed.

Locked outcomes:

- Applicant form now has a dedicated final tab:

```text
الترحيل
```

- The employment handover surface was moved out of the Contract tab into the `الترحيل` tab.
- Contract tab is now cleaner and remains focused on contract lifecycle and artifacts.
- `بدء التوظيف` remains operational from the `الترحيل` tab.
- `ترحيل الهوية` placeholder was added and then replaced by the real 13J-B action.

### 13J-B accepted state

Pass 13J-B is functionally accepted and committed.

Locked outcomes:

- `ترحيل الهوية` is a standalone applicant action.
- It soft-detects `x_hr.employee_identification_document`.
- It requires a linked employee created by the accepted `بدء التوظيف` flow.
- It reads accepted recruitment submitted identity documents from `x_hr.applicant_required_document_submission`.
- It syncs the following document families into employee identity lines:

```text
id_card / national_id -> id_card
passport -> passport
driving_license -> driving_license
```

- It creates or updates one employee identity line per source submission/type.
- It does not overwrite manually created same-type employee identity records unless the record matches the same source trace or same document number.
- It copies recruitment source attachments onto the linked `hr.employee`.
- It writes the employee-anchored copy to `x_source_attachment_id`.
- Employee chatter/files receive the copied source attachments through the `hr_employment_custom` identity automation.
- Re-running the action is idempotent for synced source records.

Deferred from 13J-B:

- Calling identity sync automatically inside `بدء التوظيف`.
- This should be treated as a later cleanup/hardening slice after more manual runs pass.

### Lessons learned

- Do not insert new employee tabs in the middle of the native notebook unless existing Studio inherited views are checked. A positional Studio XPath can break unrelated pages.
- Do not render the same one2many field four times with different domains. Odoo’s one2many cache is shared and will mirror transient lines.
- For reusable typed identity records, use one list with a type badge and controlled modal form.
- For scan/photo uploads, use a binary image field. Do not expose a free `ir.attachment` many2one as the primary upload UX.
- For source evidence from recruitment, copy the source attachment onto `hr.employee` and keep the copied attachment linked to the identity line.
- Do not overwrite manually created employee identity records with a same-type imported record unless the source trace or document number proves it is the same logical document.
- Odoo SaaS did not consume our manually guessed selection PO anchors for these custom selection values. For short values, bilingual source labels are acceptable. For long future labels, use helper records.
- Keep successful, large handover actions stable. Add risky additions as standalone actions first, then integrate later only after acceptance.

### Backlog

- Add optional `13J-C` cleanup: call the identity sync logic from `بدء التوظيف` after a safe standalone identity sync path has passed on more real applicants.
- Replace inline document/status selection labels with helper records if longer labels or strict translation control become necessary.
- Consider a future employee Documents/Files hardening pass for broader document governance, but do not block Pass 15 declarations on it.

## 12. Progress update — Pass 15C through 15F F-0010 generation locked

### 15C accepted state — Employee declaration model and tab

Pass 15C is functionally accepted and committed.

Locked outcomes:

- `x_hr.employee_declaration` is installed as the thin employee declaration process model.
- `hr.employee.x_employee_declaration_ids` renders in the employee `Declarations / الإقرارات` tab.
- Declaration records own lifecycle/artifact/sign metadata.
- Declaration PDFs are designed to read from:
  - native `hr.employee` fields;
  - selected `x_hr.employee_identification_document`;
  - declaration lifecycle fields.
- Declaration records do not duplicate broad employee snapshot fields.
- No custody, training, leave, permissions, assignment, appraisal, separation, clearance, payroll, work-entry, or GRC decision-instance logic was added.

Traceback fixed:

- `ir.model.access.csv` initially failed because a new CSV row was glued to the previous boolean field through a literal escaped newline.
- Fix: normalize CSV line endings, remove literal `\n`, deduplicate rows, and keep each access rule as exactly eight CSV columns.

Translation lesson locked:

- Future translation patches must rebaseline from Odoo-exported `ar_001.po` anchors before filling `msgstr`.
- Do not rely on manually guessed PO anchors for new custom model/view terms.
- Correct sequence:
  1. implement functional slice;
  2. install/upgrade;
  3. export updated `ar_001.po` from Odoo;
  4. replace/rebaseline module PO from exported anchors;
  5. fill translations against exact exported `model`, `model_terms`, and field-description anchors.

### 15D accepted state — F-0010 signer behavior

Pass 15D is functionally accepted and committed.

Locked outcomes:

- F-0010 Exclusive Work Declaration has two signer roles:
  - employee;
  - HR responsible user.
- Added declaration fields:
  - `x_hr_responsible_id`;
  - `x_hr_responsible_job_title`.
- `x_hr_responsible_job_title` defaults to:

```text
مدير الموارد البشرية
```

- F-0010 Signers group is visible only for declaration type:

```text
exclusive_employment_declaration
```

- No QWeb/PDF/Sign lifecycle was added in 15D.

### 15E accepted state — shared report assets and F-0010 QWeb skeleton

Pass 15E installed cleanly.

Locked outcomes:

- Added reusable report files:
  - `report/01_employee_declaration_paperformat.xml`
  - `report/02_common_employee_report_assets.xml`
  - `report/03_employee_declaration_f0010_templates.xml`
  - `report/04_employee_declaration_report_actions.xml`
- Report asset pattern:
  - shared embedded font/style template;
  - shared embedded logo/header template;
  - report-specific body template.
- The paperformat is explicit A4.
- F-0010 is a fixed two-page report:
  - page 1: header, employee/source values, two signature blocks;
  - page 2: declaration text.
- Assets are centralized in the common QWeb asset/header template rather than duplicated inside every form body.

### 15F accepted state — F-0010 Generate PDF action and layout hardening

Pass 15F F-0010 generation is accepted in its current form.

Locked outcomes:

- Added server action/button:

```text
Generate PDF / توليد الإقرار
```

- Generate action:
  - renders the F-0010 QWeb PDF;
  - writes `x_pdf_attachment_id`;
  - writes `x_generated_on`;
  - moves state to `generated`;
  - posts the generated PDF to the linked employee chatter/files.
- Generated PDF field is populated.
- Employee chatter receives the generated PDF attachment.
- Generated report remains fixed two pages.

Accepted report layout state:

- Header is acceptable:
  - MCEP logo on top-left;
  - document metadata on top-right.
- Report uses explicit A4 sizing.
- Page 1 contains employee data and signature blocks.
- Page 2 contains declaration text.
- Static page labels are used:
  - `Page 1 / 2`
  - `Page 2 / 2`
- Footer position is accepted for now even though it could still be lower.

Footer lesson:

- Attempted body-level dynamic counters using:

```text
<span class="page"></span> / <span class="topage"></span>
```

- In this Odoo SaaS QWeb/wkhtml path, the counter rendered incorrectly as `Page /`, so it is not reliable inside this report body.
- Reverted to static per-page footer labels for fixed two-page governed forms.
- Further footer micro-positioning is deferred.

### Current implementation strategy

Proceed in this order:

```text
1. Finish QWeb/PDF generation for the declaration form group.
2. Then implement Odoo Sign flows for the declaration form group.
```

Reason:

- Keeping all declaration QWeb/PDF generation in one coding pattern reduces churn.
- Sign anchoring should be implemented only after all target generated PDFs and signature zones are stable.

### Next implementation slices

Next slices should stay within QWeb/PDF generation:

```text
15G — Add next declaration QWeb/PDF template and generation behavior
15H — Add third declaration QWeb/PDF template and generation behavior
15I — Add fourth declaration QWeb/PDF template and generation behavior, if retained in Pass 15 scope
15J — QWeb/PDF regression and generated artifact hardening for declaration group
15K — Odoo Sign send flow for declaration group
15L — Odoo Sign sync flow, signed PDF/certificate copy, and mobile-safe employee chatter/files
```

Scope guard:

- Do not begin Sign send/sync until the selected declaration QWeb/PDF templates are accepted.
- Do not add payroll, work-entry, custody, training, leave, clearance, or GRC decision-instance logic in these QWeb generation slices.

## 13. Progress update — Pass 15G through 15N declaration lifecycle locked

### 15G accepted state — F-0013 QWeb/PDF generation

Pass 15G is functionally accepted and committed.

Locked outcomes:

- Added F-0013 Occupational Safety Acknowledgment QWeb/PDF generation.
- F-0013 uses the shared declaration report asset/header pattern.
- F-0013 generates as a one-page PDF.
- Starting date is rendered in date-only format.
- Generated PDF is saved to `x_pdf_attachment_id`.
- Generated PDF is posted to the linked employee chatter/files.
- Bottom report footers were removed from the declaration report family after footer collision in QWeb/wkhtml output.
- Page labels now live in the shared header metadata area.

### 15H accepted state — F-0021 QWeb/PDF generation

Pass 15H is functionally accepted and committed.

Locked outcomes:

- Added F-0021 Human Waste Handling Employee Undertaking QWeb/PDF generation.
- F-0021 generates as a one-page PDF using the shared report header.
- The form includes employee information, Arabic declaration text, English summary, supervisor fingerprint/signature area, employee signature area, and employee date area.
- Generated PDF artifact and employee chatter/file copy follow the same pattern as F-0010 and F-0013.

### 15I accepted state — F-0022 QWeb/PDF generation

Pass 15I is functionally accepted and committed.

Locked outcomes:

- Added F-0022 Human Waste Storage Supervisor Undertaking QWeb/PDF generation.
- F-0022 generates as a one-page PDF using the shared report header.
- The form is supervisor-focused and includes supervisor information, Arabic declaration text, English summary, signature row, and date row.
- F-0022 body spacing was loosened while preserving personal information and signature table row spacing.

### 15J accepted state — F-0010 Odoo Sign send/sync

Pass 15J is functionally accepted and committed.

Locked outcomes:

- Added F-0010 `Send to Sign` and `Sync` buttons beside `Generate PDF`.
- F-0010 uses two signer roles:
  - employee;
  - HR responsible user.
- F-0010 creates four Sign items:
  - employee signature;
  - employee signing date;
  - HR responsible signature;
  - HR responsible signing date.
- F-0010 Sign request sends successfully.
- Signed PDF and Sign certificate sync successfully.
- Signed artifacts are copied/posted to employee chatter/files.
- Sync returns to the declaration form rather than navigating back to the employee form.
- Date Sign item calibration was refined and accepted.

### 15K accepted state — F-0013 Odoo Sign send/sync

Pass 15K is functionally accepted and committed.

Locked outcomes:

- Added F-0013 `Send to Sign` and `Sync` buttons.
- F-0013 uses one employee signer.
- F-0013 creates:
  - employee signature item;
  - employee signing date item.
- F-0013 send/sign/sync passed without geometry change.
- Signed PDF and certificate, when exposed by Odoo, are copied/posted to employee chatter/files.

### 15L accepted state — F-0021 Odoo Sign send/sync

Pass 15L is functionally accepted and committed.

Locked outcomes:

- Added F-0021 `Send to Sign` and `Sync` buttons.
- F-0021 uses two participants:
  - employee;
  - direct manager/supervisor.
- F-0021 creates:
  - supervisor fingerprint/signature item;
  - employee signature item;
  - employee signing date item.
- F-0021 send/sign/sync passed.
- Signed PDF and certificate sync to employee chatter/files.
- A small follow-up calibration reduced signature item size and shifted signature items slightly lower/right.

### 15M accepted state — F-0022 Odoo Sign send/sync

Pass 15M is functionally accepted and committed.

Locked outcomes:

- Added F-0022 `Send to Sign` and `Sync` buttons.
- F-0022 uses one supervisor signer.
- F-0022 creates:
  - supervisor signature item;
  - supervisor signing date item.
- F-0022 send/sign/sync passed.
- Signed PDF and certificate sync to employee chatter/files.
- Initial placement worked functionally; final geometry calibration was folded into 15N.

### 15N accepted state — cleanup, artifact downloads, translations, F-0022 calibration

Pass 15N is functionally accepted and committed.

Locked outcomes:

- F-0022 signature/date Sign item geometry was recalibrated upward/right.
- Raw `ir.attachment` many2one fields are no longer exposed as clickable attachment metadata links in the declaration form.
- Artifact fields remain stored/invisible for lifecycle truth:
  - `x_pdf_attachment_id`;
  - `x_signed_attachment_id`;
  - `x_sign_certificate_attachment_id`.
- User-facing download buttons were added:
  - `Download Generated PDF`;
  - `Download Signed PDF`;
  - `Download Sign Certificate`.
- Download buttons use `/web/content/<attachment_id>?download=true`.
- Arabic translation polish was rebaselined from the Odoo-exported `ar_001.po` and then patched using exported anchors.
- All acceptance tests passed.

### Declaration lifecycle state at Pass 15 closure

The following declaration forms are generated, sent to Sign, signed, synced, and artifact-copied successfully:

```text
F-0010 Exclusive Work Declaration
F-0013 Occupational Safety Acknowledgment
F-0021 Human Waste Handling Employee Undertaking
F-0022 Human Waste Storage Supervisor Undertaking
```

The accepted lifecycle pattern is:

```text
draft -> generated -> signature_requested -> signed
```

Lifecycle truth remains on:

```text
x_hr.employee_declaration
```

Employee mobile-safe artifact access is achieved by posting/copying generated/signed/certificate artifacts to the linked `hr.employee` chatter/files.

### Locked technical lessons

#### Report/QWeb lessons

- Keep embedded fonts/logo/header assets centralized in the shared report asset/header template.
- The report `paperformat` controls geometry only; it does not carry reusable header/logo/font content.
- Avoid bottom footers for these declaration templates because QWeb/wkhtml output can collide with body content.
- Put fixed page labels in the shared header metadata area.
- Do not rely on body-level `.page/.topage` counters in this Odoo SaaS QWeb path; they rendered unreliably in this pass.
- Validate report layout from generated PDFs, not only XML parse checks.

#### Sign lessons

- Create Sign fields only after generated PDF layout is stable.
- Use small Sign/date fields centered inside the intended target area rather than trying to fill the entire printed box.
- Store Sign request linkage on the source process record.
- Sync must return to the declaration form.
- Signed PDF/certificate must be copied or posted to employee chatter/files.
- Geometry calibration should be isolated to `posX`, `posY`, `width`, and `height` values only when lifecycle behavior already passes.

#### Artifact lessons

- Raw `ir.attachment` many2one fields navigate to the attachment metadata form and should not be the user-facing artifact surface.
- Keep attachment fields as hidden lifecycle truth.
- Expose download actions/buttons for user-facing artifacts.
- Employee chatter/files remains the mobile-safe artifact layer.

#### Translation lessons

- Do not guess PO anchors.
- Functional slice first, install/upgrade second, export Odoo PO third, then patch `msgstr` against exported anchors.
- For short selection labels, bilingual source labels are acceptable as a temporary compromise.
- For future long labels requiring strong translation control, prefer helper records over hard-coded selection labels.

### Deferred after Pass 15

Do not block Pass 16 on these items:

- `13J-C`: automatically call identity sync inside the accepted `بدء التوظيف` action.
- DRY refactor of repeated declaration Sign send/sync server-action code.
- Replacement of bilingual selection labels with helper records.
- Stronger lifecycle guards/security overlays.
- Old recruitment Sign smart-button anchoring fix.
- Broader Documents app governance.
- GRC decision-instance integration.
