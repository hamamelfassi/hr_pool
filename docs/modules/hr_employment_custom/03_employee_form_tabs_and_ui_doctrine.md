# Employee Form Tabs and UI Doctrine

## Purpose

This document defines the `hr.employee` UI extension doctrine for `hr_employment_custom`.

The employee form must remain a native Odoo employee form enhanced with Marsellia process tabs, not a replacement cockpit.

---

## Native tabs to preserve

Preserve and enrich native Odoo tabs:

```text
Work
Resume
Personal
Payroll
Salary Adjustments
Settings
```

Do not duplicate native Odoo fields into custom tabs unless a Marsellia workflow requires a distinct process surface.

---

## Custom tabs to add

Add these custom tabs to `hr.employee`:

```text
الهوية
الإقرارات
العهد والممتلكات
التدريب والشهادات
التكليفات
الإجازات
الأذونات
تقييم الأداء
إنهاء الخدمة
إخلاء الطرف
```

### Tab ownership

| Tab | Purpose |
|---|---|
| `الهوية` | Typed employee identification documents: ID card, passport, driving license, and company ID card |
| `الإقرارات` | Employee declarations and HSE undertakings |
| `العهد والممتلكات` | Custody items, ID cards, PPE, tools, vehicles, radios, laptops |
| `التدريب والشهادات` | Training commitments, certification evidence, resume/skill integration |
| `التكليفات` | Work assignments, future overtime/project/planning hooks |
| `الإجازات` | Native `hr.leave` overlay and official Marsellia leave form |
| `الأذونات` | Typed administrative permission requests |
| `تقييم الأداء` | Native `hr.appraisal` overlay and scoring lines |
| `إنهاء الخدمة` | Separation/resignation/non-renewal requests |
| `إخلاء الطرف` | Final clearance, custody closure, IT/finance/HR/stores clearances |

---

## Identification tab doctrine

The `الهوية` tab stores reusable employee identification data for downstream employment lifecycle forms.

Model:

```text
x_hr.employee_identification_document
```

Allowed first document types:

```text
id_card
passport
driving_license
company_id_card
```

Use one typed model, not four separate models.

The tab may display four visually separated sections for the four document types, but each section should write to the same model.

The standard fields are intentionally limited:

```text
document type
number
issued by
issue place
issue date
expiry date
attachment
notes
```

Declaration and other process forms should select a specific employee identification line when a form needs a typed ID value.

---

## One2many tab pattern

Each custom tab should show process records in a one2many/list surface.

Inline/list rows should show:

```text
reference
type
date
state badge
responsible user
generated/signed status
next action if useful
```

Open the record for the full workflow form.

Do not overload the employee main form header with workflow-specific buttons.

---

## Process form pattern

Each opened process form should use this structure:

```text
header/statusbar
artifact icon controls if safe
workflow action row below header/statusbar
business data sections
generated/signed/certificate attachment fields
manual decision metadata where applicable
notes
chatter
```

### Button placement rule

Workflow buttons belong in a clear workflow action row below the statusbar/header or within the relevant tab.

Do not place workflow buttons between artifact icons.

Do not place process-specific workflow buttons in the global employee header.

---

## Header and artifact controls

Header may include:

```text
statusbar/state
download/open generated icon
download/open signed icon
download/open certificate icon
```

Only if visually clean.

If the header becomes crowded, artifact controls should move into an artifact group inside the sheet.

---

## State decoration rule

All process state fields should use native Odoo statusbar/badge decoration where practical.

Typical mapping:

| State | Decoration |
|---|---|
| draft | muted / secondary |
| generated | info |
| submitted | info |
| signature_requested | warning |
| manager_review / hr_review / gm_approval | warning |
| approved / signed / complete / cleared | success |
| rejected / cancelled / blocked | danger |
| superseded / archived | muted |

Use consistent colors across process lists and forms.

---

## Readonly doctrine

Fields written by workflow actions should be readonly in the normal UI.

Readonly/action-written examples:

```text
x_reference_code
x_document_reference
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_sign_request_res_id
x_sign_request_state
x_generated_on
x_sent_on
x_signed_on
computed total score fields
source handover fields
```

Editable business-input fields should remain editable only while the process is in the appropriate early state.

Example:

```text
draft: business fields editable
generated: business fields mostly readonly
signature_requested: business fields readonly
signed: fully locked except notes where policy allows
```

---

## Derived field doctrine

Derived/inherited/snapshot fields must be labelled clearly and normally readonly.

Examples:

```text
employee name snapshot
department snapshot
job title snapshot
manager snapshot
contract/payroll snapshot
bank-source snapshot
```

Do not allow casual edits to derived fields that are meant to preserve legal/signature context.

For employee declarations, avoid broad duplicate snapshot fields for values already held on `hr.employee`. Read employee name, department, job title, manager, national ID, and start-date source values directly during QWeb generation. The generated PDF attachment is the frozen evidence snapshot.

---

## Mobile UI rule

If an artifact button works on desktop but fails on mobile, the workflow is still acceptable only if the artifact is accessible through employee chatter/files.

For mobile-safe process design:

```text
post signed PDF to employee chatter/files
post certificate to employee chatter/files where available
write clear chatter body naming the artifact type
do not rely only on /web/content act_url buttons
```

---

## Employee smart button preservation

Do not break or replace native smart buttons such as:

```text
Documents
Appraisals
Goals
Time Off
Payslips
Monthly Hours
Contacts
History
Sign Requests
```

Custom process records should anchor/link to native models so native smart buttons remain useful.

---

## Employee photo/avatar UI doctrine

Employee photo display should rely on native `hr.employee.image_1920` as the canonical image target after handover.

Do not manually populate derivative avatar fields unless actual field metadata proves a safe need.

---

## Arabic UI naming rule

Use normalized Arabic process names in the UI.

Reference numbers remain technical metadata.

Examples:

| UI name | Technical reference |
|---|---|
| إقرار العمل الحصري وعدم الازدواج | F-0010 |
| استلام البطاقة التعريفية | F-0011 |
| إقرار السلامة المهنية | F-0013 |
| طلب إجازة | F-0016 |
| تكليف عمل | F-0017 |
| تقييم الأداء | F-0018 |
| طلب إنهاء خدمة | F-0019 |
| إخلاء الطرف | F-0020 |

---

## Acceptance checklist for a process UI

A process UI is acceptable only when:

- custom buttons are inside the correct tab or process form;
- the employee global header remains clean;
- state is visually decorated;
- action-written fields are readonly;
- generated/signed/certificate artifacts are visible;
- desktop icon controls work where present;
- mobile-safe chatter/files access exists;
- chatter records lifecycle events;
- activities identify next owners where needed.

## Pass 15B locked UI lesson — Identification tab

The employee `الهوية / Identification` tab uses a single typed list of employee identification documents.

Do not render the same one2many field multiple times with different domains for ID Card, Passport, Driving License, and Company ID Card. That pattern caused mirrored transient rows because Odoo shares the one2many cache across repeated renderings of the same field.

Locked pattern:

```text
hr.employee
  x_identification_document_ids
    x_document_type
    x_document_number
    x_issued_by
    x_issue_place
    x_issue_date
    x_expiry_date
    x_expiry_status
    x_document_image
    x_source_attachment_id
```

UI pattern:

- one controlled list;
- one `Add Identification / إضافة هوية` action;
- modal create/edit form;
- document type badge;
- expiry status badge;
- binary image upload/preview for document scan/photo;
- controlled source attachment download button;
- no free `ir.attachment` selector as the primary upload surface.

Naming pattern:

```text
Employee Name - Document Type - Document Number
```

Translation note:

Short selection labels may use bilingual source labels when Odoo SaaS does not expose reliable selection PO anchors. For longer or operationally complex labels, use helper records instead of inline selection values.

## Pass 17 tab addition — Training and Certifications

Pass 17 adds the employee `Training and Certifications` tab.

Recommended Arabic label:

```text
التدريب والشهادات
```

The tab should follow the same process-record pattern used by declarations and custody:

- one2many list on `hr.employee`;
- controlled create/edit modal for `x_hr.employee_training_commitment`;
- compact artifact icon buttons in the record header;
- workflow buttons kept readable and separate from artifact downloads;
- chatter/files copy on generated, signed, and certificate artifacts.

Translation reminder:

- tab/action/source labels should be English in XML;
- Arabic UI should be delivered through exported PO anchors;
- selection states must not use bilingual source labels.
