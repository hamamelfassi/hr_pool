
# Pass 21 — F-0018 Employee Performance Evaluation Implementation Plan

## 1. Scope boundary

### In scope

- Implement Marsellia F-0018 Employee Performance Evaluation as a governed custom HR document/sign workflow.
- Use one parent custom model and one line custom model:

      x_hr.employee_performance_evaluation
      x_hr.employee_performance_evaluation_line

- Seed or generate the 12 fixed evaluation line items required by F-0018.
- Capture only the manual form data needed for the official form:
  - employee;
  - evaluation period from date;
  - evaluation period to date;
  - 12 evaluation item scores, each from 1 to 5;
  - direct manager recommendation;
  - HR manager recommendation;
  - optional employee/internal notes if useful.
- Compute/normalize:
  - total score out of 60;
  - score percentage;
  - grade;
  - star rating / score visual;
  - generated label / `x_name`;
  - reference code `MCEP-HR-F-0018`;
  - document reference without `-EMP-`.
- Validate score values and block invalid values:
  - no score lower than 1;
  - no score higher than 5;
  - no missing line score at PDF generation time;
  - line count must be 12 before PDF generation.
- Derive/default users:
  - direct manager user strictly from `hr.employee.parent_id.user_id` where available;
  - HR manager/user from `hr.employee.hr_responsible_id` where available;
  - responsible user from current user;
  - do not silently substitute the current user as direct manager.
- Generate the official F-0018 QWeb/PDF form from the custom record.
- Render the 12 evaluation items using a 5/4/3/2/1 checkbox matrix.
- Render the final score and grade using the accepted checkbox style from the F-0002 interview evaluation pattern, updated to modern shared report assets.
- Store generated PDF, signed PDF, and Sign certificate artifacts on the source record.
- Post generated and signed artifacts to employee chatter/files.
- Use native Odoo Sign with two roles:
  - Direct Manager;
  - HR Manager.
- Add an employee `Evaluations` tab following the accepted Permissions/Leave/Assignments UI pattern:
  - info alert;
  - New Evaluation button;
  - embedded list;
  - controlled modal form;
  - standalone list/form action;
  - statusbar;
  - workflow/artifact controls;
  - download controls through `/web/content`;
  - editable score line table;
  - total score / grade / star rating visible.
- Complete Arabic UI/QWeb translation using exported-anchor PO workflow.
- Close the pass with documentation, lessons learned, deferred backlog, and final acceptance notes.

### Out of scope

- No Odoo Appraisals bridge in Pass 21.
- No Payroll, salary adjustment, allowance, bonus, deduction, or promotion/demotion effect.
- No contract renewal/termination effect.
- No disciplinary action integration.
- No Planning, Project, Timesheet, Attendance, Work Entry, Fleet, or GRC decision integration.
- No `approval.request` workflow.
- No configurable evaluation template library/helper model in Pass 21.
- No employee self-review or 360-review workflow.
- No automated general manager Sign role unless explicitly added later.
- No amendments/cancellations governance beyond the existing document lifecycle and manual metadata.

## 2. Preconditions

Required prior state:

- Pass 20 is accepted and closed:
  - F-0017 Work Assignment Authorization custom process model;
  - QWeb/PDF generation;
  - four-role Sign lifecycle;
  - Arabic UI/QWeb translation lock;
  - native operational integrations deferred.
- Accepted common report assets/header/paperformat exist and are stable.
- Accepted artifact download pattern uses `/web/content/<attachment_id>?download=true`.
- Accepted employee tab/modal/list/form UX pattern exists from Permissions, Leave, and Assignments.
- Odoo Sign app is installed and proven.
- At least one employee test record exists with:
  - direct manager employee set in `hr.employee.parent_id`;
  - parent employee linked to a user with email through `parent_id.user_id`;
  - HR responsible user set in `hr.employee.hr_responsible_id` with email;
  - employee department/job data for PDF rendering.
- Reference F-0002 interview evaluation files are used only for scoring/checklist inspiration. Pass 21 must not copy the older inline CSS/sign flow style.

## 3. Ownership and module boundary

Primary module:

    hr_employment_custom

Secondary module touchpoints:

    hr.employee — employee tab and one2many inverse only
    sign        — native Sign request/template/item/signature lifecycle only
    mail        — employee chatter/files posting only

No other module should be patched unless the pass plan is explicitly amended.

## 4. Files likely touched

Expected new files:

    modules/hr_employment_custom/models/08_employee_performance_evaluation.xml
    modules/hr_employment_custom/views/08_employee_performance_evaluation_views.xml
    modules/hr_employment_custom/data/26_employee_performance_evaluation_automation.xml
    modules/hr_employment_custom/data/27_employee_performance_evaluation_generate_actions.xml
    modules/hr_employment_custom/data/28_employee_performance_evaluation_sign_actions.xml
    modules/hr_employment_custom/report/18_employee_performance_evaluation_templates.xml
    modules/hr_employment_custom/report/19_employee_performance_evaluation_report_actions.xml

Expected patched files:

    modules/hr_employment_custom/__manifest__.py
    modules/hr_employment_custom/security/ir.model.access.csv
    modules/hr_employment_custom/i18n/ar_001.po
    docs/modules/hr_employment_custom/pass21_execution_plan.md
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

### 21A — Documentation and execution-plan lock

Goal:

- Lock the F-0018 architecture before implementation.

Expected changes:

- Create this execution plan.
- Update lifecycle, artifact/sign, UI, chatter/files, roadmap, and README docs.
- Record the custom parent + line model posture.
- Record validation/score/grade/star doctrine.
- Record the explicit non-integration posture.

Sanity checks:

- `pass21_execution_plan.md` exists.
- Docs contain the F-0018 model/posture markers.
- No module runtime files are touched.

Odoo acceptance:

- Not required. Documentation-only slice.

### 21B — Parent model, line model, access, employee tab, and standalone views

Goal:

- Scaffold the custom evaluation models and user surfaces only.

Expected changes:

- Add `x_hr.employee_performance_evaluation` parent model.
- Add `x_hr.employee_performance_evaluation_line` line model.
- Add `hr.employee.x_performance_evaluation_ids` inverse field.
- Add one2many from parent to lines.
- Add access CSV rows.
- Add employee `Evaluations` tab.
- Add embedded list and modal form.
- Add standalone list/form action.
- Add editable line table for scores.
- Add no QWeb, no Sign, and no native integrations.

Sanity checks:

- XML parses cleanly.
- Access CSV has clean row endings and eight columns.
- Parent model exists.
- Line model exists.
- One2many loads after inverse many2one exists.
- Manifest load order is safe.
- No Appraisals/Payroll/GRC/native integration markers exist.

Odoo acceptance:

- Module upgrades cleanly.
- `Evaluations` tab appears on employee.
- New Evaluation opens modal form.
- Evaluation can be saved with parent fields.
- Score line table appears but may not yet auto-seed.
- No PDF/Sign buttons appear yet.
- No native integration side effects occur.

### 21C — Line seeding, normalization, scoring, grade, star rating, and validation guards

Goal:

- Make the evaluation record operational before PDF generation.

Expected changes:

- Create/write normalization server actions.
- Generate default 12 evaluation lines for each new parent record.
- Generate reference code/document reference/label.
- Derive direct manager user strictly from `employee.parent_id.user_id`.
- Derive HR user from `employee.hr_responsible_id`.
- Compute total score, percentage, grade, and star rating.
- Validate line score range 1–5.
- Block/notify when score is lower than 1 or higher than 5.
- Do not silently coerce invalid score values unless explicitly agreed.
- Post employee chatter note on evaluation creation.

Default 12 evaluation lines:

1. Compliance with Working Hours
2. Quality of Work
3. Compliance with Company Policies, Systems, and Internal Regulations
4. Ability to Understand Work Rules and Methods
5. Teamwork
6. Completion of Work Procedures and Methods
7. Completion of Work Within the Specified Timeframes
8. Commitment to Developing and Improving Work Performance
9. Care for and Protection of Company Property
10. Respect for Others
11. Personal Appearance
12. General Responsibilities Within the Workplace

Recommended grade formula:

    Excellent   = 51–60
    Very Good   = 41–50
    Good        = 31–40
    Acceptable  = 12–30

Sanity checks:

- XML parses cleanly.
- Server-action code contains all 12 line definitions.
- Server-action code contains score range guards.
- Server-action code contains total/percentage/grade/star calculation markers.
- Direct manager derivation uses `employee.parent_id.user_id`.
- No fallback to `env.user` for direct manager.
- No native integration markers exist.

Odoo acceptance:

- New evaluation auto-creates 12 lines.
- Updating scores recomputes total score.
- Invalid score lower than 1 is blocked cleanly.
- Invalid score higher than 5 is blocked cleanly.
- Missing direct manager user is visible before Sign/PDF dependencies.
- Employee chatter gets creation note.
- No native integration side effects occur.

### 21D — F-0018 QWeb/PDF generation

Goal:

- Generate the official performance evaluation form.

Expected changes:

- Add F-0018 QWeb template using shared employee report assets.
- Add report action.
- Add Generate PDF server action.
- Add generated/signed/certificate download actions.
- Add workflow/artifact controls to modal and standalone forms.
- Render the 12 scoring rows with 5/4/3/2/1 checkbox matrix.
- Render total score out of 60.
- Render grade checkboxes.
- Render star rating visual.
- Render direct manager and HR manager recommendation sections.
- Render signature blocks for direct manager and HR manager.
- Keep any GM approval text/static row only if needed by the physical form, without creating a Sign role.

Sanity checks:

- XML parses cleanly.
- QWeb contains all 12 evaluation item labels.
- QWeb contains checkbox matrix markers.
- Generate action checks line count, scores, period dates, manager/HR users, and recommendation fields as required.
- Manifest load order is safe.
- No Sign or native integration markers exist in generate actions.

Odoo acceptance:

- Generate PDF blocks cleanly on missing period/scores/required users.
- Generate PDF blocks invalid score values.
- Generated PDF succeeds after required fields are completed.
- State becomes Generated.
- Generated PDF is linked and downloadable.
- Employee chatter/files receives the PDF.
- PDF displays personal info, period, 12 item scores, total/60, grade, stars, recommendations, and signature blocks.
- No Sign buttons appear yet.
- No native integration side effects occur.

### 21E — Two-role Odoo Sign lifecycle

Goal:

- Add the accepted native Odoo Sign send/sync lifecycle.

Expected changes:

- Add dynamic Sign template/item generation.
- Calibrate Sign item coordinates from the accepted F-0018 generated PDF.
- Use two Sign roles:
  1. Direct Manager
  2. HR Manager
- Block Send if direct manager user is not derived from `employee.parent_id.user_id` or has no email.
- Block Send if HR user is missing or has no email.
- Duplicate active request guard.
- Sync pre-completion state.
- Sync signed PDF and certificate to employee chatter/files.

Sanity checks:

- XML parses cleanly.
- Sign action contains two-role sequence only.
- Direct manager user source is `employee.parent_id.user_id`.
- No employee self-signer unless explicitly added later.
- No general manager signer unless explicitly added later.
- No native integration markers exist.

Odoo acceptance:

- Send to Sign appears only in Generated state.
- Send creates one Sign request with Direct Manager then HR Manager.
- Sign fields land on accepted PDF cells.
- Duplicate send is blocked.
- Sync before completion updates Sign state.
- Sync after completion sets state to Signed, links signed PDF/certificate, and posts artifacts to employee chatter/files.

### 21F — Arabic UI/QWeb translation and UI polish

Goal:

- Lock Arabic UI/QWeb translation and modal/full-form parity.

Expected changes:

- Export/patch exact PO anchors for:
  - model labels;
  - field labels;
  - line model labels;
  - view section labels;
  - action/report labels;
  - employee tab labels;
  - selection values;
  - grade values;
  - workflow buttons;
  - alert text.
- QWeb dynamic Arabic labels for grade/state where needed.
- Fix modal button alignment or visibility if needed.

Sanity checks:

- PO contains exact exported anchors.
- Selection translations use exact `ir.model.fields.selection` anchors.
- XML parses cleanly.
- QWeb still renders.

Odoo acceptance:

- Employee tab label translates.
- Field labels translate.
- Section labels translate.
- State values translate.
- Grade values translate.
- Workflow buttons translate.
- QWeb output remains stable.
- Sign lifecycle remains unchanged.

### 21G — Documentation closure

Goal:

- Close Pass 21 with accepted implementation records.

Expected changes:

- Update execution plan with final closure notes.
- Update lifecycle/process docs.
- Update artifact/sign docs.
- Update UI doctrine docs.
- Update chatter/files docs.
- Update roadmap/readme.
- Record deferred Appraisals/Payroll/GRC bridge backlog.
- Record direct-manager derivation technical-debt audit item for earlier forms.

Sanity checks:

- Docs contain final F-0018 markers.
- No module runtime files are touched.

Odoo acceptance:

- Not required. Documentation-only slice.

## 6. Slice implementation log

Append to this section as slices are implemented.

### 21A implementation log

#### 21A1 — Documentation and execution-plan lock

Patch/script applied:

    pass21a_performance_evaluation_execution_plan_pypatch.md

Sanity result:

    pending

Odoo result:

    not required

Lessons learned:

- The performance evaluation pass is closer to the earlier F-0002 interview evaluation scoring/checklist pattern than to leave/work-assignment flat forms, but it must use the modern Pass 19/20 QWeb and Sign doctrine.
- Score validation must be built earlier than PDF generation to avoid invalid appraisal records.
- Direct manager derivation must use `hr.employee.parent_id.user_id`, not the current user.

Status:

    pending

### 21B implementation log

    pending

### 21C implementation log

    pending

### 21D implementation log

    pending

### 21E implementation log

    pending

### 21F implementation log

    pending

### 21G implementation log

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
- [ ] Server-action Python compiles where relevant.
- [ ] Module zip builds locally.
- [ ] Odoo install/upgrade succeeds.
- [ ] Employee Evaluations tab renders correctly.
- [ ] Parent/line model relation works.
- [ ] 12 default evaluation lines are created.
- [ ] Score validation blocks values below 1.
- [ ] Score validation blocks values above 5.
- [ ] Total score, percentage, grade, and star rating compute correctly.
- [ ] F-0018 PDF renders correctly.
- [ ] F-0018 checkbox matrix reflects selected scores.
- [ ] F-0018 grade checkboxes reflect computed grade.
- [ ] Generated PDF posts to employee chatter/files.
- [ ] Sign request sends to Direct Manager then HR Manager.
- [ ] Direct manager source is verified from `employee.parent_id.user_id`.
- [ ] Signed PDF/certificate syncs to employee chatter/files.
- [ ] Arabic UI/selection translations are accepted.
- [ ] No Appraisals, Payroll, Planning, Project, Attendance, Work Entry, Approval, Fleet, or GRC side effects occur.
- [ ] Generated files are not committed.
- [ ] Commit message recorded.

## 9. Commit log

Commit command used:

    git commit -m "pass21a: lock performance evaluation execution plan"       -m "Documents the F-0018 performance evaluation architecture using a custom parent and line model, validated 1–5 scoring, computed total/grade/star output, checkbox-matrix QWeb, two-role Sign, Arabic translation workflow, and deferred Appraisals/Payroll/GRC/native integration posture."
