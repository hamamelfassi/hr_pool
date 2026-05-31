# Pass 19 — Leave Request F-0016 Implementation Plan

## 1. Scope boundary

### In scope

- Implement Marsellia official leave request workflow as a custom process family:
  - `x_hr.employee_leave_type_policy`
  - `x_hr.employee_leave_request`
- Link Marsellia leave policies to native Odoo Time Off configuration through `hr.work.entry.type`.
- Build the employee `Leave` tab using the same process-record pattern accepted in Passes 15-18.
- Capture manual HR balance data needed for the official form:
  - current balance;
  - used balance;
  - requested days;
  - remaining balance;
  - HR balance allowed;
  - balance verification metadata.
- Generate the official Marsellia leave request PDF, expected as F-0016 unless the uploaded form says otherwise.
- Implement native Odoo Sign lifecycle after the PDF layout is accepted.
- Preserve future bridge fields for creating a native `hr.leave` record after the custom request is signed.
- Keep employee chatter/files as the mobile-safe artifact access layer.
- Keep XML labels English and deliver Arabic UI through exported PO anchors.

### Out of scope

- Directly extending `hr.leave` as the primary Pass 19 form/process record.
- Automatic balance computation from Odoo allocations/accruals.
- Automatic Friday/Saturday weekend exclusion engine.
- Automatic public-holiday exclusion engine.
- Automatic payroll, work-entry, accounting, deduction, or settlement effects.
- Automatic native `hr.leave` creation unless explicitly scoped in a later implementation slice.
- Automatic validation/approval of native `hr.leave`.
- Full legal entitlement engine for all Libyan leave scenarios.
- GRC decision-instance integration.
- `approval.request` integration.

## 2. Preconditions

Required prior state:

- Pass 15 employee declarations are installed and accepted.
- Pass 16 custody lifecycle is installed and accepted.
- Pass 17 training commitment lifecycle is installed and accepted.
- Pass 18 administrative permissions lifecycle is installed and accepted.
- `hr_employment_custom` has the standard artifact fields and Sign pattern proven on custom process models.
- Native Odoo Time Off / `hr.leave` app is installed in the database.
- Native `hr.work.entry.type` records exist in the database.
- At least one employee exists for testing.
- The official leave form source is uploaded before QWeb layout work begins.

Required data/configuration:

- Existing native work-entry/time-off types should be inspected before any seed mapping.
- Initial Marsellia policy records should map to existing native external IDs where safe:
  - annual leave -> Paid Time Off / `hr_work_entry.generic_work_entry_type_legal_leave`
  - sick leave -> Sick Time Off / `hr_work_entry.generic_work_entry_type_sick_leave`
  - unpaid leave -> Unpaid / `hr_work_entry.generic_work_entry_type_unpaid_leave`
  - compensatory leave -> Compensatory Time Off / `hr_work_entry.generic_work_entry_type_compensatory`, only if needed.
- Emergency leave may remain unmapped in the first pass if no clean native type exists.

Required test record:

- One employee with:
  - department;
  - job title;
  - manager/direct supervisor where possible;
  - HR responsible user where possible;
  - work email/contact partner for Sign testing.

## 3. Ownership and module boundary

Primary module:

```text
hr_employment_custom
```

Secondary module touchpoints, if any:

```text
hr — employee source data and employee form tab
hr_holidays / Time Off — future native `hr.leave` bridge target only
hr_work_entry — native `hr.work.entry.type` mapping target only
sign — dynamic Odoo Sign send/sync
mail — chatter/files artifact posting
```

No other module should be patched unless the pass plan is explicitly amended.

## 4. Files likely touched

Expected files:

```text
modules/hr_employment_custom/models/06_employee_leave_request.xml
modules/hr_employment_custom/views/06_employee_leave_request_views.xml
modules/hr_employment_custom/data/19_employee_leave_policy_data.xml
modules/hr_employment_custom/data/20_employee_leave_request_automation.xml
modules/hr_employment_custom/data/21_employee_leave_generate_actions.xml
modules/hr_employment_custom/data/22_employee_leave_sign_actions.xml
modules/hr_employment_custom/report/14_employee_leave_request_templates.xml
modules/hr_employment_custom/report/15_employee_leave_request_report_actions.xml
modules/hr_employment_custom/security/ir.model.access.csv
modules/hr_employment_custom/i18n/ar_001.po
modules/hr_employment_custom/__manifest__.py
docs/modules/hr_employment_custom/pass19_execution_plan.md
docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md
docs/modules/hr_employment_custom/05_pass_15_plus_roadmap.md
docs/modules/hr_employment_custom/README.md
```

Generated files that must not be committed:

```text
dist/*.zip
generated PDFs
signed PDFs
screenshots
temporary exports
```

## 5. Slice plan

### 19A — Documentation posture and execution plan

Goal:

- Lock the revised leave architecture before implementation.
- Replace the older direct `hr.leave` thin-overlay posture with the custom Marsellia leave request process posture.

Expected changes:

- Update lifecycle docs, roadmap, README, artifact/signing doctrine, and UI doctrine.
- Create this `pass19_execution_plan.md`.

Sanity checks:

- Documentation files exist.
- The docs mention `x_hr.employee_leave_type_policy`.
- The docs mention `x_hr.employee_leave_request`.
- The docs state that native `hr.leave` is a future bridge target, not the primary first-pass process record.

Odoo acceptance:

- No Odoo build required.
- Git diff review only.

### 19B — Leave policy and request model scaffold

Goal:

- Add the custom leave policy helper and operational request model.

Expected changes:

- Create `x_hr.employee_leave_type_policy`.
- Create `x_hr.employee_leave_request`.
- Add access rows.
- Add employee one2many field.
- Add employee `Leave` tab with list and modal create/edit form.
- Add standalone list/form action.

Sanity checks:

- XML parses.
- Manifest load order is safe.
- Access CSV row endings are clean.
- One2many inverse exists before employee tab view loads.

Odoo acceptance:

- Module upgrades cleanly.
- Employee `Leave` tab appears.
- `New Leave Request` opens a modal.
- A draft leave request can be saved.
- No PDF, Sign, native `hr.leave`, payroll, or work-entry side effects occur.

### 19C — Policy seed and normalization/defaulting

Goal:

- Seed minimal Marsellia leave policies and default leave request fields.

Expected changes:

- Seed policy records for:
  - Annual Leave;
  - Emergency Leave;
  - Sick Leave, if required by the form/source scope;
  - Unpaid Leave, if required by the form/source scope.
- Link policies to native `hr.work.entry.type` external IDs where safe.
- Keep Emergency Leave unmapped unless a dedicated native type is created or explicitly selected.
- Normalize:
  - `x_name`;
  - `x_reference_code`;
  - `x_document_reference`;
  - `x_state`;
  - `x_responsible_user_id`;
  - manager/HR/GM user metadata where available.

Sanity checks:

- XML parses.
- Policy seed records exist.
- No native `hr.work.entry.type` records are created or modified.
- No native `hr.leave` records are created.

Odoo acceptance:

- Policy dropdown shows expected leave policies.
- Annual/Sick/Unpaid policies show native mapping where available.
- Saving a request generates name/reference/defaults.
- Emergency Leave can be saved without a native mapping if scoped that way.

### 19D — F-0016 QWeb/PDF generation

Goal:

- Generate the official Marsellia leave request form from `x_hr.employee_leave_request`.

Expected changes:

- Create one QWeb report template.
- Create one report action.
- Create generate PDF action.
- Store generated PDF on source record.
- Post generated PDF to employee chatter/files.
- Add desktop download controls through `/web/content`.

Sanity checks:

- XML parses.
- Report action model is `x_hr.employee_leave_request`.
- Generate action does not create `hr.leave`.
- Generate action blocks missing employee, leave policy, date range, requested days, and required manual balance fields.

Odoo acceptance:

- Generated PDF is one page or controlled multi-page as per source form.
- PDF contains employee data, leave type, dates, requested days, balance fields, address/contact, acting employee, reason, and approval/signature blocks.
- Generated PDF downloads.
- Generated PDF appears in employee chatter/files.
- State becomes `generated`.

### 19E — Native Odoo Sign lifecycle

Goal:

- Add Sign send/sync for the generated leave request PDF.

Expected changes:

- Dynamic `sign.template`.
- Dynamic `sign.document`.
- Calibrated `sign.item` signature/date fields after PDF acceptance.
- `sign.send.request`.
- Duplicate active request guard.
- Explicit Sync button.
- Signed PDF and certificate discovery/copy.
- Employee chatter/files posting.

Sanity checks:

- XML parses.
- Sign action contains no `hr.leave` creation.
- Sign item coordinates are documented after PDF acceptance.
- Duplicate send guard is present.

Odoo acceptance:

- Send to Sign creates a Sign request.
- Signers receive the request in the accepted order.
- Signature/date fields land in the accepted cells.
- Sync before completion only updates request state.
- Sync after completion sets source state to `signed`.
- Signed PDF and certificate, where available, are copied/posted to employee chatter/files.

### 19F — Native leave bridge scaffold / optional guarded action

Goal:

- Prepare but do not force the native `hr.leave` integration path.

Expected changes:

- Add or verify bridge fields:
  - `x_native_leave_id`;
  - `x_native_leave_sync_state`;
  - `x_native_leave_created_on`;
  - `x_native_leave_notes`.
- Optionally add a guarded `Create Native Time Off` server action only if explicitly accepted after 19E.
- The guarded action must create a native `hr.leave` only after the custom request is signed.

Sanity checks:

- If implemented, action requires `x_state == signed`.
- Action blocks if no native work-entry type mapping exists.
- Action blocks if a native leave already exists.
- Action does not auto-validate native leave in the first bridge slice.

Odoo acceptance:

- If action is deferred, no Odoo acceptance required.
- If action is implemented, native record is created safely in draft/confirmed posture only, with chatter linkage.

### 19G — Arabic PO and UI polish

Goal:

- Translate final Pass 19 UI labels and selection values using exported anchors.

Expected changes:

- Patch `i18n/ar_001.po` after Odoo exports the relevant anchors.
- Translate:
  - tab label;
  - actions;
  - fields;
  - states;
  - policy names if exported;
  - toast/server-action labels.
- Fix modal/standalone parity issues if they appear.

Sanity checks:

- PO contains expected anchors.
- XML source labels remain English.
- No bilingual source XML labels are introduced.

Odoo acceptance:

- Arabic UI labels apply.
- State values translate if exported selection anchors are available.
- Modal and standalone forms remain usable.

### 19H — Documentation closure

Goal:

- Close Pass 19 and record deferrals.

Expected changes:

- Update `pass19_execution_plan.md` implementation log.
- Update README and roadmap status.
- Log accepted bridge posture.
- Log deferred computational/native integrations.

Sanity checks:

- Docs mention closed slices.
- Deferrals are explicit.

Odoo acceptance:

- No Odoo build required unless closure follows a functional patch.

## 6. Slice implementation log

Append to this section as slices are implemented.

### 19A implementation log

#### 19A1 — Leave posture documentation lock

Patch/script applied:

```text
[pypatch/script reference]
```

Sanity result:

```text
[paste result]
```

Odoo result:

```text
No Odoo build required; documentation-only slice.
```

Lessons learned:

- Pass 19 should not directly use `hr.leave` as the first-pass form/process record.
- `hr.work.entry.type` should be a native bridge mapping target, not the Marsellia policy/process model.
- Manual HR balance fields are required in the first production pass.

Status:

```text
pending
```

### 19B implementation log

#### 19B1 — Model and employee tab scaffold

Patch/script applied:

```text
[pending]
```

Sanity result:

```text
[pending]
```

Odoo result:

```text
[pending]
```

Lessons learned:

- [pending]

Status:

```text
pending
```

## 7. Tracebacks and fixes

Append every traceback/fix pair.

### Traceback 1

Error:

```text
[paste traceback]
```

Root cause:

```text
[pending]
```

Fix applied:

```text
[pending]
```

Acceptance after fix:

```text
[pending]
```

## 8. Final acceptance gates

The pass cannot close until all gates pass:

- [ ] XML parses cleanly.
- [ ] Server-action Python compiles where relevant.
- [ ] Module zip builds locally.
- [ ] Odoo install/upgrade succeeds.
- [ ] Employee Leave tab renders correctly.
- [ ] Leave policy records are usable.
- [ ] Custom leave request records can be created from the employee tab.
- [ ] Generated PDF renders the accepted official form.
- [ ] Generated PDF is posted to employee chatter/files.
- [ ] Sign request creates with correct signer(s).
- [ ] Sync writes signed PDF and certificate where available.
- [ ] Signed artifacts are posted to employee chatter/files.
- [ ] Native `hr.leave` is not created automatically unless a later accepted bridge slice implements it.
- [ ] No payroll, work-entry, accounting, allocation, accrual, or balance-computation side effects occur in the first pass.
- [ ] Arabic UI labels are patched from exported PO anchors.
- [ ] Generated files are not committed.
- [ ] Commit message recorded.

## 9. Commit log

Commit command used:

```bash
git commit -m "pass19: [summary]" \
  -m "[details]"
```

Commit hash:

```text
[paste hash]
```

## 10. Closure notes

Locked:

- Pass 19 uses custom Marsellia leave request models:
  - `x_hr.employee_leave_type_policy`
  - `x_hr.employee_leave_request`
- Native `hr.leave` is the future operational bridge target.
- Native `hr.work.entry.type` is the native policy mapping target.
- Manual HR balance entry is accepted for the first production pass.

Deferred:

- Automatic balance calculation.
- Friday/Saturday exclusion engine.
- Public-holiday exclusion engine.
- Native `hr.leave` creation/validation.
- Native allocation/accrual integration.
- Payroll/work-entry/accounting effects.
- GRC decision-instance integration.
- `approval.request` integration.

Carried forward:

- Use exact exported PO anchors for state translations.
- Use employee chatter/files as the mobile-safe artifact layer.
- Calibrate Sign geometry only after PDF acceptance.

<!-- PASS19G_CLOSURE_START -->
## Pass 19G closure — accepted leave request baseline

Pass 19 is closed and accepted.

Accepted implementation summary:

- Pass 19A — documentation posture lock: Leave is implemented as a custom Marsellia official request process, not as a direct `hr.leave` overlay.
- Pass 19B — model and tab scaffold:
  - `x_hr.employee_leave_type_policy`
  - `x_hr.employee_leave_request`
  - employee `Leave` tab
  - controlled modal and standalone forms
  - future native bridge fields
- Pass 19C — leave policy seeds, normalization/defaulting, and configuration menus:
  - Annual Leave
  - Emergency Leave
  - Sick Leave
  - Unpaid Leave
  - Compensatory Leave
  - `hr.work.entry.type` is used only as a native Time Off mapping target.
  - Emergency Leave is deliberately unmapped to native Time Off until a clean native policy is scoped.
  - Leave configuration menus were moved to the root Employees / Configuration level.
- Pass 19D — F-0016 QWeb/PDF generation:
  - one accepted A4 one-page PDF layout
  - generated artifact stored on request
  - generated artifact posted to employee chatter/files
  - no native `hr.leave` creation
- Pass 19E — four-role Odoo Sign lifecycle:
  - Employee
  - Direct Manager
  - HR Responsible
  - General Manager
  - signed PDF/certificate sync to employee chatter/files
- Pass 19F — Arabic UI/QWeb translation lock:
  - leave selection values translated from exact exported `ir.model.fields.selection` IDs
  - leave tab/menu/action/field labels patched through exact PO anchors
  - form section headers patched through exact view anchors
  - QWeb state and leave category labels render in Arabic
- Pass 19G — documentation closure.

Accepted operational models:

    x_hr.employee_leave_type_policy
    x_hr.employee_leave_request

Accepted native integration posture:

    x_hr.employee_leave_type_policy.x_work_entry_type_id -> hr.work.entry.type
    x_hr.employee_leave_request.x_native_leave_id        -> future hr.leave bridge target only

`hr.work.entry.type` is not the Marsellia process model. It is a mapping target for future native Time Off creation.

`hr.leave` is not created in Pass 19. It remains a later bridge target after the official Marsellia signed-document flow is stable.

Accepted document form:

    MCEP-HR-F-0016 — Leave Request

Accepted document reference pattern:

    MCEP-HR-F-0016-00004-00001

Accepted document lifecycle:

    draft -> generated -> signature_requested -> signed

Accepted native leave bridge lifecycle field:

    not_created -> ready -> created -> blocked -> error

In Pass 19, this field remains at `not_created` unless manually changed in future bridge work. No bridge action is implemented yet.

Accepted Sign sequence:

    1. Employee
    2. Direct Manager
    3. HR Responsible
    4. General Manager

Accepted F-0016 Sign geometry after PDF calibration:

| Role | Signature posX | Signature posY | Width | Height | Date posX | Date posY |
|---|---:|---:|---:|---:|---:|---:|
| Employee | `0.515` | `0.790` | `0.220` | `0.028` | `0.555` | `0.817` |
| Direct Manager | `0.080` | `0.790` | `0.220` | `0.028` | `0.115` | `0.817` |
| HR Responsible | `0.515` | `0.888` | `0.220` | `0.028` | `0.555` | `0.914` |
| General Manager | `0.080` | `0.888` | `0.220` | `0.028` | `0.115` | `0.914` |

Accepted policy seed posture:

| Marsellia policy | Native mapping posture |
|---|---|
| Annual Leave | mapped to Odoo Paid Time Off |
| Emergency Leave | deliberately unmapped in Pass 19 |
| Sick Leave | mapped to Odoo Sick Time Off |
| Unpaid Leave | mapped to Odoo Unpaid |
| Compensatory Leave | mapped to Odoo Compensatory Time Off |

Accepted side-effect boundary:

- No native `hr.leave` records are created.
- No allocations are created.
- No accrual plans are created.
- No payroll records are created.
- No work entries are created.
- No attendance records are created.
- No `approval.request` records are created.
- No GRC decision instances are created.

Accepted UI/UX baseline:

- Employee `Leave` tab.
- `New Leave Request` button.
- Embedded list.
- Controlled modal create/edit form.
- Standalone list/form actions under Employees / Configuration / Leave.
- Statusbar at top.
- Header artifact icons where clean.
- Full-width in-sheet `Workflow and Artifacts` strip for modal parity.
- Generated/Signed/Certificate download controls through `/web/content`.
- Manual HR balance verification fields are visible and explicit.
- Native Time Off bridge fields are visible as deferred bridge metadata, not active integration behavior.

Accepted translation baseline:

- Source XML labels remain English.
- Arabic UI is delivered through `i18n/ar_001.po` anchors.
- Leave selection values use exact exported `ir.model.fields.selection` IDs.
- Leave tab label is `الإجازات`.
- Root configuration Leave section label is `الإجازات`.
- Section headers translate in the leave form.
- QWeb renders Arabic state and leave category labels.
- Employee/user names render from master data as stored; Arabic legal-name enrichment is deferred unless separately scoped.
<!-- PASS19G_CLOSURE_END -->
