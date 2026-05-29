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
- [ ] 15B commit message recorded.
- [ ] 13J standalone identity sync passes.
- [ ] 15C+ declaration lifecycle passes.

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
