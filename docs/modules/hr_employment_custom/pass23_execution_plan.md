
# Pass 23 — F-0020 Employee Clearance Request Execution Plan

## 1. Purpose

Pass 23 implements Marsellia's F-0020 Employee Clearance Request as the final governed-document pass in the current employee lifecycle form sequence.

Document identity:

    MCEP-HR-F-0020
    Arabic title: إخلاء طرف
    English title: Employee Clearance Request / Clearance Form

Pass 23 captures clearance before full separation. It is documentary and signature-driven only in this pass.

The pass must not trigger native offboarding, employee archive, contract closing, payroll final settlement, custody clearance, approval workflows, GRC decisions, fleet, project, planning, or automated termination effects.

## 2. Source form structure

The physical F-0020 form contains:

- employee information;
- last working day;
- reason for termination;
- clearance from assigned department;
- IT department clearance;
- stores and transport clearance;
- finance clearance;
- HR department clearance;
- final approval by HR Manager and General Manager.

The form rows are clearance/checklist rows with Yes/No verification boxes and notes. The implementation should preserve that visible form meaning while using a clean operational model family.

## 3. Locked architecture

Use a small custom model family:

    x_hr.employee_clearance_request
    x_hr.employee_clearance_line

No helper/type model is needed in Pass 23.

The parent request record owns:

- employee;
- form identity;
- lifecycle state;
- reason for termination;
- last working day;
- six section responsible employees;
- final HR responsible user;
- final General Manager user;
- generated/signed/certificate artifact fields;
- Sign request metadata;
- manual decision metadata;
- notes.

The child line model owns the section rows:

- clearance request;
- section code;
- sequence;
- item Arabic label;
- item English label;
- optional manual verification value;
- notes.

The child lines are primarily for QWeb rendering and audit/readability. In Pass 23, the signed PDF is the authority for section-row checkbox completion. Automatic write-back of Sign checkbox values into line records is deferred unless later proven safe and worthwhile.

## 4. Reason for termination

Use a selection field on the parent request:

    x_reason_for_termination

Accepted values from the physical form:

| Technical value | English label | Arabic label |
|---|---|---|
| resignation | Resignation | استقالة |
| company_termination | Termination by Company | إنهاء من الشركة |
| contract_end | Contract End | انتهاء العقد |
| other_reasons | Other Reasons | أسباب أخرى |

Use an optional text field for Other reason details:

    x_other_reason_description

This field is visible/required only when `x_reason_for_termination == 'other_reasons'`.

No bridge to the Pass 22 separation request is introduced in Pass 23.

## 5. Clearance sections and responsible employees

The pass uses five employee-linked clearance responsible persons. These must link to `hr.employee`, not `res.users`.

Parent fields:

    x_assigned_department_responsible_employee_id
    x_it_responsible_employee_id
    x_stores_inventory_responsible_employee_id
    x_transport_movement_responsible_employee_id
    x_finance_responsible_employee_id
    x_hr_clearance_responsible_employee_id

The QWeb template must print each responsible person's display name in the relevant section.

Defaulting posture:

- assigned department responsible defaults from `hr.employee.parent_id` where available;
- other section responsible employees are manually selected in this pass;
- HR clearance responsible employee may be manually selected and may later be defaulted from HR responsible mapping if reliable;
- all five section signer fields remain `hr.employee` fields.

Stores and Transport are treated as one combined clearance section in Pass 23 because the locked user direction specifies six clearance sections/positions. If a later production requirement requires separate Stores and Transportation signers, split the combined section in a future refinement pass.

## 6. Final approval signers

After the six employee-based clearance section signers, the final approval signers are:

    x_hr_user_id
    x_general_manager_user_id

These are `res.users` fields, following the accepted HR/GM final-approval pattern from prior passes.

Final signing sequence:

1. Assigned Department Responsible Employee
2. IT Responsible Employee
3. Stores / Inventory Responsible Employee
4. Transport / Movement Responsible Employee
5. Finance Responsible Employee
6. HR Clearance Responsible Employee
7. HR Responsible User
8. General Manager User

The final HR responsible user and general manager user sign and date after all six clearance sections have signed.

## 7. Sign checkbox doctrine

Pass 23 is the first pass where Odoo Sign checkbox items are intentionally used for checklist rows.

Use native Odoo Sign item type:

    sign.sign_item_type_checkbox

The Sign template should assign checklist checkbox items to the responsible role for that section. The practical implementation may render two checkbox items per row, one for Yes and one for No, to reflect the physical form's Yes/No layout.

The section responsible person signs and dates the section. With ordered signing enabled, the next role should receive the request only after the current role completes their section.

Do not block or validate checkbox business meaning inside Odoo model fields in Pass 23. The signed PDF is the documentary evidence.

## 8. Lifecycle

Visible lifecycle:

    Draft → Generated → Signature Requested → Signed

Hidden/deferred lifecycle values may remain available:

    Cancelled
    Superseded

Pass 23 must not add clearance-specific state explosions such as `it_cleared`, `finance_cleared`, etc. The ordered Sign sequence provides the operational progression in this pass.

## 9. Parent model expected fields

Core identity/lifecycle:

- `x_name`
- `x_employee_id`
- `x_reference_code`
- `x_document_reference`
- `x_state`
- `x_last_working_day`
- `x_reason_for_termination`
- `x_other_reason_description`
- `x_employee_notes`

Section responsible employees:

- `x_assigned_department_responsible_employee_id`
- `x_it_responsible_employee_id`
- `x_stores_inventory_responsible_employee_id`
- `x_transport_movement_responsible_employee_id`
- `x_finance_responsible_employee_id`
- `x_hr_clearance_responsible_employee_id`

Final signers and responsibility:

- `x_hr_user_id`
- `x_general_manager_user_id`
- `x_responsible_user_id`

Line inverse:

- `x_line_ids`

Artifacts:

- `x_pdf_attachment_id`
- `x_signed_attachment_id`
- `x_sign_certificate_attachment_id`

Sign metadata:

- `x_sign_request_res_id`
- `x_sign_request_state`
- `x_sign_request_reference`
- `x_sign_request_url`
- `x_generated_on`
- `x_sent_on`
- `x_signed_on`

Manual governance metadata:

- `x_manual_decision_number`
- `x_manual_decision_date`
- `x_manual_decision_attachment_id`
- `x_notes`

## 10. Child line expected fields

Model:

    x_hr.employee_clearance_line

Fields:

- `x_name`
- `x_clearance_id`
- `x_section_code`
- `x_sequence`
- `x_item_code`
- `x_item_label_ar`
- `x_item_label_en`
- `x_manual_status`
- `x_notes`

Accepted `x_section_code` values:

- `assigned_department`
- `it_department`
- `stores_inventory`
- `transport_movement`
- `finance`
- `hr_department`

Optional manual status values:

- `not_checked`
- `yes`
- `no`

Manual status is for internal draft visibility only. The signed PDF checkboxes remain the authoritative completion evidence in this pass.

## 11. Seeded clearance rows

Seed exactly the physical clearance rows into the child line model.

Assigned Department Clearance:

1. Handover of Work Tools — تسليم ادوات العمل
2. Handover of Assigned Duties — تسليم الأعمال المكلف بها

IT Department Clearance:

1. Laptop Returned — تسليم الأجهزة و الحواسب و الطابعات
2. Company Accounts Deactivation — تعطيل حسابات الشركة (إيميل / أنظمة)

Stores / Inventory Clearance:

1. Field Equipment Returned — استرجاع المعدات والادوات

Transport / Movement Clearance:

1. Vehicle / Transport Items Returned — تسليم السيارات

Finance Department Clearance:

1. Final Financial Settlement — تسوية المستحقات المالية
2. Loans & Advances Cleared — تصفية السلف أو القروض

HR Department Clearance:

1. ID Card Returned — تسليم البطاقة التعريفية
2. Employee Record Closure — اقفال بيانات الموظف
3. Handover of Personal Documents — تسليم المستندات الشخصية

## 12. UI/UX requirements

Add a new employee tab:

    Clearance

Arabic target:

    إخلاء الطرف

Accepted UI pattern:

- info alert;
- New Clearance Request button;
- embedded list;
- controlled modal form;
- standalone list/form action;
- statusbar;
- workflow/artifact controls;
- header download icons;
- parent request details;
- section responsible employee fields;
- full-width fixed clearance row table;
- lifecycle artifacts hidden section;
- manual decision section;
- notes section;
- Arabic labels via exported-anchor PO workflow.

The line table should avoid the one2many width bug seen in prior passes by using a full-width one-column group around the row table.

## 13. QWeb/PDF requirements

Generate one QWeb/PDF template for F-0020 using the accepted common employee report assets/header/paper format.

The QWeb must render:

- form code `MCEP-HR-F-0020`;
- document reference;
- employee information;
- last working day;
- reason for termination with checkboxes;
- six clearance sections;
- all seeded clearance rows;
- Yes/No checkbox placeholders per row;
- notes column;
- responsible employee name printed for each section;
- section signature/date zones;
- final HR and General Manager approval signature/date zones.

PDF readability must be calibrated after actual rendering. Sign geometry must be locked only after the final accepted PDF sizing/layout is accepted.

## 14. Odoo Sign requirements

Implement Sign only after QWeb/PDF output is accepted.

Use native Odoo Sign dynamic template generation and dynamic sign item placement.

Eight-role sequence:

1. Assigned Department Responsible
2. IT Responsible
3. Stores & Transport Responsible
4. Finance Responsible
5. HR Clearance Responsible
6. HR Responsible
7. General Manager

Use employee/contact-based signer resolution for the first six section signers:

- `work_contact_id` if available;
- linked employee user partner if available;
- `work_email` partner lookup/create as fallback.

Use user/partner-based signer resolution for final HR and General Manager users.

Each section role gets:

- checkbox item(s) for that section's rows;
- section signature item;
- section date item.

Final HR/GM roles get signature and date items.

Duplicate active Sign requests must be blocked. Sync remains required to copy signed PDF/certificate and set the source record to Signed.

## 15. Arabic translation requirements

Source XML labels remain English only.

Arabic translations are applied through `i18n/ar_001.po` using exact exported anchors after fields/views/selections exist.

Selection values needing exported anchors:

- state values;
- reason for termination values;
- line section/status values, if exposed in UI.

If selection translations do not apply, use exact exported `ir.model.fields.selection` IDs. Do not block core functional acceptance only on fragile selection translations unless the slice explicitly targets translation closure.

## 16. Explicit deferrals

Pass 23 must not implement:

- integration with Pass 16 custody records;
- automatic custody item generation/checking;
- automatic custody return/lost/damaged reconciliation;
- integration with Pass 22 separation request records;
- employee archive/deactivation;
- contract closing;
- payroll final settlement;
- leave balance settlement;
- native offboarding checklist;
- approval.request;
- GRC decision instances;
- fleet/project/planning side effects;
- automated access revocation;
- automatic writeback of Sign checkbox values into clearance line status;
- access/visibility partitioning by clearance department beyond basic HR user access.

These may be considered in a later bridge/hardening pass.

## 17. Slice plan

### 23A — Documentation and execution-plan lock

- Create/update this execution plan.
- Update lifecycle, artifact/sign, UI doctrine, roadmap, and README docs.
- No module build required.

### 23B — Model, access, and employee tab scaffold

- Add parent model `x_hr.employee_clearance_request`.
- Add child line model `x_hr.employee_clearance_line`.
- Add one2many on `hr.employee`.
- Add access rows.
- Add Clearance tab and standalone action/views.
- No automation/PDF/Sign yet.

### 23C — Normalization, seeded rows, and defaulting

- Generate references and labels.
- Default state/reference/responsible user.
- Derive assigned department responsible from employee parent.
- Seed the 11 clearance lines.
- Add creation chatter.
- Keep other responsible employees manual.
- No PDF/Sign yet.

### 23D — F-0020 QWeb/PDF generation

- Add QWeb template/report action.
- Add Generate PDF/download actions.
- Validate required reason/last working day/responsible persons before generation.
- Render responsible names and clearance rows.
- Post generated PDF to employee chatter/files.
- Calibrate readability and one-page/two-page posture as needed.

### 23E — Seven-role Odoo Sign lifecycle with checkbox items

- Add dynamic Sign template generation.
- Use `sign.sign_item_type_checkbox` for section row checkboxes.
- Use ordered role flow: six section employees → HR responsible user → General Manager user.
- Add section signatures/dates and final HR/GM signatures/dates.
- Add Sync, duplicate-send protection, signed PDF/certificate copy.

### 23F — Arabic translation and UI polish

- Patch `i18n/ar_001.po` using exported anchors.
- Translate tab labels, fields, sections, buttons, state values, reason values, line section/status values.
- Polish modal/full-form UI as needed.

### 23G — Documentation closure

- Record accepted implementation.
- Lock Sign geometry and checkbox lessons.
- Record deferred bridge/hardening tasks.

## 18. Acceptance boundary

Pass 23 is accepted when:

- F-0020 request records can be created from employee Clearance tab;
- all 11 clearance rows seed correctly;
- section responsible employees are `hr.employee` links;
- generated PDF renders accepted F-0020 form layout;
- dynamic Sign request includes checkbox items, section signatures/dates, final HR/GM signatures/dates;
- completed Sign request syncs signed PDF/certificate to employee chatter/files;
- Arabic UI and selection translations are accepted;
- no deferred native bridge side effects occur.
