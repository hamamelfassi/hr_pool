
# Pass 20 — F-0017 Employee Work Assignment Implementation Plan

## 1. Scope boundary

### In scope

- Implement Marsellia F-0017 Employee Work Assignment as a governed custom HR document/sign workflow.
- Use one operational custom model only:

      x_hr.employee_work_assignment

- Capture only the manual form data required by F-0017:
  - employee;
  - assignment location;
  - assignment from date;
  - assignment to date;
  - assignment description / purpose;
  - optional employee notes / internal notes if useful.
- Derive/default standard metadata:
  - record label;
  - reference code;
  - document reference;
  - direct manager user from `hr.employee.parent_id.user_id` where available;
  - HR user from `hr.employee.hr_responsible_id` where available;
  - responsible user from current user;
  - general manager user manually selected unless a reliable source is later scoped.
- Generate the official F-0017 QWeb/PDF form from the custom record.
- Store generated PDF, signed PDF, and Sign certificate artifacts on the custom record.
- Post generated and signed artifacts to employee chatter/files.
- Use native Odoo Sign with four roles after PDF calibration:
  - Employee;
  - Direct Manager;
  - HR Responsible;
  - General Manager.
- Add an employee `Assignments` tab following the accepted Permissions/Leave UI pattern:
  - info alert;
  - New Assignment button;
  - embedded list;
  - controlled modal form;
  - standalone list/form action;
  - statusbar;
  - workflow/artifact controls;
  - download controls through `/web/content`.
- Complete Arabic UI/QWeb translation using exported-anchor PO workflow.
- Close the pass with documentation, lessons learned, deferred backlog, and final acceptance notes.

### Out of scope

- No typed/helper assignment type model in Pass 20.
- No native Planning integration.
- No Project/task integration.
- No Timesheet integration.
- No Attendance integration.
- No Work Entry integration.
- No Payroll/overtime/allowance/deduction effects.
- No Fleet, site logistics, asset dispatch, or operational deployment integration.
- No `approval.request` workflow.
- No GRC decision instances.
- No automatic computation of assignment entitlement, overtime, per diem, or payroll impacts.
- No automatic creation of downstream native operational records.
- No amendments/cancellations governance beyond the existing document lifecycle and manual metadata.

## 2. Preconditions

Required prior state:

- Pass 19 is accepted and closed:
  - F-0016 Leave Request custom process model;
  - QWeb/PDF generation;
  - four-role Sign lifecycle;
  - Arabic UI/QWeb translation lock;
  - native leave bridge deferred.
- Accepted common report assets/header/paperformat exist and are stable.
- Accepted artifact download pattern uses `/web/content/<attachment_id>?download=true`.
- Accepted employee tab/modal/list/form UX pattern exists from Permissions and Leave.
- Odoo Sign app is installed and proven.
- `hr.employee.parent_id.user_id` and `hr.employee.hr_responsible_id` are available for defaulting where configured.
- At least one employee test record exists with:
  - work contact/email for Sign;
  - parent/direct manager user with email;
  - HR responsible user with email;
  - manually selected general manager user with email.

## 3. Ownership and module boundary

Primary module:

    hr_employment_custom

Secondary module touchpoints:

    hr.employee — employee tab and one2many inverse only
    sign       — native Sign request/template/item/signature lifecycle only
    mail       — employee chatter/files posting only

No other module should be patched unless the pass plan is explicitly amended.

## 4. Files likely touched

Expected new files:

    modules/hr_employment_custom/models/07_employee_work_assignment.xml
    modules/hr_employment_custom/views/07_employee_work_assignment_views.xml
    modules/hr_employment_custom/data/23_employee_work_assignment_automation.xml
    modules/hr_employment_custom/data/24_employee_work_assignment_generate_actions.xml
    modules/hr_employment_custom/data/25_employee_work_assignment_sign_actions.xml
    modules/hr_employment_custom/report/16_employee_work_assignment_templates.xml
    modules/hr_employment_custom/report/17_employee_work_assignment_report_actions.xml

Expected patched files:

    modules/hr_employment_custom/__manifest__.py
    modules/hr_employment_custom/security/ir.model.access.csv
    modules/hr_employment_custom/i18n/ar_001.po
    docs/modules/hr_employment_custom/pass20_execution_plan.md
    docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md
    docs/modules/hr_employment_custom/02_document_artifact_and_signing_pattern.md
    docs/modules/hr_employment_custom/03_employee_form_tabs_and_ui_doctrine.md
    docs/modules/hr_employment_custom/04_mobile_artifacts_chatter_and_activities.md
    docs/modules/hr_employment_custom/05_pass_15_plus_roadmap.md
    docs/modules/hr_employment_custom/README.md, if present
    modules/hr_employment_custom/README.md, if present

Generated files that must not be committed:

    dist/*.zip
    generated PDFs
    signed PDFs downloaded from Odoo
    Sign certificates downloaded from Odoo
    screenshots
    temporary exports
    local traceback scratch files

## 5. Slice plan

### 20A — Documentation and execution-plan lock

Goal:

- Lock the F-0017 architecture before implementation.

Expected changes:

- Create this execution plan.
- Update lifecycle, artifact/sign, UI, chatter/files, roadmap, and README docs.
- Record the explicit non-integration posture.

Sanity checks:

- `pass20_execution_plan.md` exists.
- Docs contain the F-0017 model/posture markers.
- No module runtime files are touched.

Odoo acceptance:

- Not required. Documentation-only slice.

### 20B — Model, access, employee tab, and standalone views

Goal:

- Scaffold the custom operational model and user surfaces only.

Expected changes:

- Add `x_hr.employee_work_assignment` model.
- Add `hr.employee.x_work_assignment_ids` inverse field.
- Add access CSV row(s).
- Add employee `Assignments` tab.
- Add embedded list and modal form.
- Add standalone list/form action.
- Add no QWeb, no Sign, and no native integrations.

Sanity checks:

- XML parses cleanly.
- Access CSV has clean row endings and eight columns.
- Manifest load order is safe:
  - model before access;
  - actions before views where views reference actions.
- No Sign/PDF/native integration action markers appear.

Odoo acceptance:

- Module upgrades cleanly.
- Technical model exists.
- Employee `Assignments` tab appears.
- New Assignment opens controlled modal form.
- Standalone list/form action works.
- No Generate PDF / Send to Sign / Sync buttons appear yet.

### 20C — Normalization and defaulting

Goal:

- Add deterministic create/write normalization.

Expected changes:

- Default state to `draft`.
- Default reference code to `MCEP-HR-F-0017`.
- Generate document reference without `-EMP-`:

      MCEP-HR-F-0017-00004-00001

- Generate `x_name` using employee, form title, and document reference.
- Derive direct manager user from `employee.parent_id.user_id` where available.
- Derive HR user from `employee.hr_responsible_id` where available.
- Default responsible user to current user.
- Keep general manager user manually selected.
- Post a lightweight creation note to employee chatter, if consistent with the accepted pattern.

Sanity checks:

- XML parses cleanly.
- Server-action code compiles where practical.
- No PDF/Sign/native integration markers appear.

Odoo acceptance:

- New assignment gets label/reference/default state.
- Direct manager/HR user defaulting works where employee data supports it.
- Manual fields remain editable in Draft.
- No PDF/Sign/native integration side effects occur.

### 20D — F-0017 QWeb/PDF generation

Goal:

- Generate the official F-0017 PDF from the assignment record.

Expected changes:

- Add one QWeb template for F-0017.
- Add one report action.
- Add Generate PDF server action.
- Add generated/signed/certificate download actions.
- Add header artifact icons where clean.
- Add full-width workflow/artifact strip for modal parity.
- Store generated PDF on `x_pdf_attachment_id`.
- Post generated PDF to employee chatter/files.

Sanity checks:

- XML parses cleanly.
- Manifest order is safe.
- QWeb contains F-0017 markers.
- Generate action contains `_render_qweb_pdf` and no Sign/native integration markers.

Odoo acceptance:

- Generate PDF blocks if required manual fields are missing.
- Generated PDF succeeds once fields are filled.
- State becomes Generated.
- Download opens through `/web/content`.
- Employee chatter/files receives the generated PDF.
- PDF is one page, readable, aligned, and ready for Sign coordinate calibration.

### 20E — Four-role native Odoo Sign lifecycle

Goal:

- Send/sync F-0017 through native Odoo Sign.

Expected changes:

- Add Send to Sign action.
- Add Sync action.
- Create dynamic Sign template/document/items from generated PDF.
- Use four signer roles:
  - Employee;
  - Direct Manager;
  - HR Responsible;
  - General Manager.
- Lock coordinates after the accepted generated PDF is visually checked.
- Guard against duplicate active Sign requests.
- Sync signed PDF/certificate to employee chatter/files.

Sanity checks:

- XML parses cleanly.
- Sign action contains expected Sign model markers.
- No native Planning/Project/Timesheet/Attendance/Payroll/GRC integration markers appear.

Odoo acceptance:

- Send to Sign appears only in Generated state.
- Sync appears after sending.
- Missing-email cases block cleanly.
- Sign request has four roles.
- Signature/date widgets land in the correct cells.
- Duplicate send is blocked.
- Sync updates state before completion and closes to Signed after completion.
- Signed artifact/certificate are copied to employee chatter/files.

### 20F — Arabic translation and UI polish

Goal:

- Complete Arabic UI/QWeb translation and modal/standalone parity.

Expected changes:

- Patch `i18n/ar_001.po` with exact exported anchors.
- Translate field labels, tab label, actions, menus, section headers, selection values, and alert text.
- Translate QWeb state and dynamic labels where needed.
- Repair any modal/full-view layout divergence.

Sanity checks:

- PO contains exact model/field/view/menu/action/selection anchors.
- XML still parses.
- No runtime behavior changes.

Odoo acceptance:

- Employee tab and all form labels translate.
- Section headers translate.
- Selection states translate.
- QWeb renders Arabic lifecycle labels.
- Sign behavior remains unchanged.

### 20G — Documentation closure

Goal:

- Close Pass 20 and rebaseline the roadmap.

Expected changes:

- Update execution plan logs.
- Document final Sign geometry.
- Document lessons learned and deferred integrations.
- Update lifecycle/artifact/UI/chatter docs.
- Update README/roadmap.

Sanity checks:

- Documentation markers exist.
- No module runtime files touched.

Odoo acceptance:

- Not required. Documentation-only slice.

## 6. Slice implementation log

Append to this section as slices are implemented.

### 20A implementation log

#### 20A1 — Documentation posture lock

Patch/script applied:

    pass20a_work_assignment_execution_plan_pypatch.md

Sanity result:

    pending

Odoo result:

    not required

Lessons learned:

- Pass 20 is deliberately narrower than Leave: one model, no helper/type model, no native integration fields, no downstream operational bridges.
- F-0017 is sufficiently simple to implement as a governed form/sign record with manual assignment location, dates, and description/purpose only.

Status:

    pending

### 20B implementation log

#### 20B1 — Model and tab scaffold

Patch/script applied:

    pending

Sanity result:

    pending

Odoo result:

    pending

Lessons learned:

- pending

Status:

    pending

### 20C implementation log

#### 20C1 — Normalization and defaults

Patch/script applied:

    pending

Sanity result:

    pending

Odoo result:

    pending

Lessons learned:

- pending

Status:

    pending

### 20D implementation log

#### 20D1 — F-0017 QWeb/PDF generation

Patch/script applied:

    pending

Sanity result:

    pending

Odoo result:

    pending

Lessons learned:

- pending

Status:

    pending

### 20E implementation log

#### 20E1 — Four-role Sign lifecycle

Patch/script applied:

    pending

Sanity result:

    pending

Odoo result:

    pending

Lessons learned:

- pending

Status:

    pending

### 20F implementation log

#### 20F1 — Arabic UI/QWeb polish

Patch/script applied:

    pending

Sanity result:

    pending

Odoo result:

    pending

Lessons learned:

- pending

Status:

    pending

### 20G implementation log

#### 20G1 — Documentation closure

Patch/script applied:

    pending

Sanity result:

    pending

Odoo result:

    not required

Lessons learned:

- pending

Status:

    pending

## 7. Tracebacks and fixes

Append every traceback/fix pair.

### Traceback 1

Error:

    pending

Root cause:

    pending

Fix applied:

    pending

Acceptance after fix:

    pending

## 8. Final acceptance gates

The pass cannot close until all gates pass:

- [ ] XML parses cleanly.
- [ ] Access CSV is structurally clean.
- [ ] Server-action Python compiles where relevant.
- [ ] Module zip builds locally.
- [ ] Odoo install/upgrade succeeds.
- [ ] Employee Assignments tab renders correctly.
- [ ] Controlled modal and standalone form have parity.
- [ ] F-0017 generated PDF is accepted visually.
- [ ] Sign coordinates are locked from the accepted generated PDF.
- [ ] Four-role Sign lifecycle passes.
- [ ] Signed PDF/certificate sync to employee chatter/files passes.
- [ ] Arabic UI labels and selection values apply.
- [ ] No Planning/Project/Timesheet/Attendance/Work Entry/Payroll/Fleet/GRC side effects occur.
- [ ] Generated files are not committed.
- [ ] Commit message recorded.

## 9. Commit log

Commit command used:

    git commit -m "pass20: implement employee work assignments"       -m "Implements F-0017 Marsellia employee work assignment as a custom governed form/sign workflow with manual assignment data, generated PDF, four-role Odoo Sign lifecycle, employee chatter/files artifacts, and Arabic UI/QWeb translations without native Planning, Project, Timesheet, Attendance, Work Entry, Payroll, Fleet, approval.request, or GRC decision side effects."
