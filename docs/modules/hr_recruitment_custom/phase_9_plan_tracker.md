# Pass 9 Plan — Official Employment Contract QWeb Overlay

## 1. Locked rendering doctrine

Pass 9 implements the official Libyan government employment contract as a **QWeb background PNG overlay**, not as a recreated textual QWeb form and not as an Odoo Sign-driven contract by default.

The official contract pages are treated as immutable visual template backgrounds. QWeb overlays only dynamic values from the contract snapshot.

Locked principles:

- Use the seven official PNG pages as full-page A4 backgrounds.
- Do not recreate or alter the government contract source text.
- Do not use Sultan font for Pass 9 overlay values.
- Use the existing Al Yamama / Arabic report font pattern already proven in recruitment reports and board decision PDFs.
- Store generated PDFs as Odoo attachments.
- Track generated, signed-uploaded, and ministry-accredited copies through the recruitment document lifecycle registry.
- Keep native Odoo `hr.contract` creation deferred to a later handover pass.
- No Odoo Sign requirement for the government labor contract unless later explicitly scoped.

## 2. Target artifact

Official employment contract:

- Template code: `MCEP-HR-F-0005`
- Template approach: static PNG background pages + dynamic QWeb overlays
- Expected page count: 7 pages
- Primary lifecycle: generated draft PDF → manual print/sign → signed upload → Ministry of Labour accredited upload
- Source of truth: frozen contract snapshot record, not live joins during rendering

## 3. Module ownership

Primary module:

- `hr_recruitment_custom`

Related modules consumed as data sources:

- `hr_pool`
- `grc_backbone`

Primary applicant surface:

- `hr.applicant`

Primary contract snapshot model to be introduced:

- `x_hr.applicant_employment_contract`

Primary lifecycle registry model:

- `x_hr.recruitment_document`

## 4. Applicant Contract tab UX

The main applicant `العقد` tab must follow the same organising style as the completed `قرار التعيين` tab.

The applicant tab is a compact control and summary surface, not the full contract data-entry surface.

### 4.1 Applicant tab top action row

Buttons:

- `إنشاء العقد`
- `تحديث بيانات العقد`
- `فتح بيانات العقد`
- `توليد مسودة العقد`
- `فتح المسودة`
- `تنزيل المسودة`
- `رفع النسخة الموقعة`
- `رفع النسخة المعتمدة`

Expected visibility:

- `إنشاء العقد`: visible when no contract snapshot exists.
- `تحديث بيانات العقد`: visible after contract exists and before final lock/accreditation.
- `فتح بيانات العقد`: visible after contract exists.
- `توليد مسودة العقد`: visible when contract data is ready or when regeneration is permitted.
- `فتح المسودة` / `تنزيل المسودة`: visible when generated PDF exists.
- `رفع النسخة الموقعة`: visible after draft PDF exists and before signed copy upload.
- `رفع النسخة المعتمدة`: visible after signed copy upload.

### 4.2 Applicant tab header sections

#### بيانات العقد

Fields:

- حالة العقد
- رقم العقد
- تاريخ العقد
- تاريخ بداية العقد
- تاريخ نهاية العقد
- مدة العقد
- الأجر الشهري
- المنصب الوظيفي
- الوحدة الإدارية

#### روابط وسجل العقد

Fields:

- سجل بيانات العقد
- سجل مستند التوظيف
- المستند المولد
- تاريخ توليد المستند
- النسخة الموقعة
- تاريخ رفع النسخة الموقعة
- النسخة المعتمدة من وزارة العمل
- تاريخ الاعتماد
- قرار التعيين المرتبط

#### العقود المرتبطة

Compact one-row list for the active `x_hr.applicant_employment_contract`.

Columns:

- اسم العقد
- رقم العقد
- الحالة
- المستند المولد
- الموقع
- المعتمد
- فتح

Badge guidance:

- `مسودة بيانات`: muted
- `جاهز للتوليد`: info
- `مسودة مولدة`: primary/info
- `مطبوع / قيد التوقيع اليدوي`: warning/muted
- `موقع ومرفوع`: success
- `معتمد من وزارة العمل`: success
- `ملغى`: danger

## 5. Standalone contract cockpit UX

The standalone contract detail view must follow the same sectioning and button style as the customised `x_grc.decision_instance` cockpit.

Button from applicant tab:

- `فتح بيانات العقد`

Target model:

- `x_hr.applicant_employment_contract`

The standalone view is the detailed data, rendering, upload, and handover-readiness surface.

### 5.1 Lifecycle states

Technical values and Arabic labels:

- `draft_data` — `مسودة بيانات`
- `ready_to_render` — `جاهز للتوليد`
- `generated` — `مسودة مولدة`
- `printed` — `مطبوع / قيد التوقيع اليدوي`
- `signed_uploaded` — `موقع ومرفوع`
- `ministry_accredited` — `معتمد من وزارة العمل`
- `handover_ready` — `جاهز للترحيل`
- `cancelled` — `ملغى`

### 5.2 Standalone form tabs

#### بيانات العقد

Fields:

- `x_name`
- `x_applicant_id`
- `x_pool_id`
- `x_contract_number`
- `x_contract_date`
- `x_state`
- `x_template_code`
- `x_template_version`
- `x_field_map_version`
- `x_board_decision_instance_id`
- `x_recruitment_document_id`
- `x_generated_attachment_id`
- `x_signed_attachment_id`
- `x_ministry_accredited_attachment_id`

Defaults:

- `x_template_code = MCEP-HR-F-0005`
- `x_template_version = V.0.0.2015`

#### الطرف الأول

Fields:

- company name Arabic
- company registration / national number where needed
- company address Arabic
- representative name Arabic
- representative title Arabic
- representative nationality Arabic

Initial Marsellia defaults may be fixed/configured.

#### الطرف الثاني

Fields:

- full name Arabic
- first name Arabic
- father name Arabic
- grandfather name Arabic
- surname Arabic
- date of birth
- gender
- marital status
- nationality
- national ID
- email
- phone
- mobile 1
- mobile 2

#### الهوية والإقامة

Fields:

- identity document source
- identity document number
- identity document issue place
- identity document issue date
- residence region
- residence district
- residence municipality
- residence location
- residence address text
- home phone

Identity document source selection:

- `id_card` — بطاقة شخصية
- `passport` — جواز سفر
- `driving_license` — رخصة قيادة

Default priority:

1. بطاقة شخصية
2. جواز سفر
3. رخصة قيادة

#### المصرف والمؤهلات والصحة

Fields:

- bank name
- bank branch
- bank account number
- IBAN
- qualification type
- qualification subject / specialization
- family paper number
- family reference number
- next of kin name
- next of kin phone
- blood type

#### الوظيفة والمدة

Fields:

- job
- job title Arabic
- department
- department name Arabic
- contract start date
- contract end date
- contract duration value
- contract duration unit
- renewal duration value
- renewal duration unit
- work location

#### الأجر والمزايا

Fields:

- monthly wage amount
- monthly wage text Arabic
- allowances Arabic text
- benefits Arabic text
- annual leave days
- compensation notes

#### المستندات والطباعة

Fields:

- generated attachment
- generated on
- generated by
- signed attachment
- signed uploaded on
- signed uploaded by
- ministry accredited attachment
- ministry accredited on
- ministry accredited by
- render status
- render error

Buttons:

- `توليد مسودة العقد`
- `فتح المسودة`
- `تنزيل المسودة`
- `رفع النسخة الموقعة`
- `رفع النسخة المعتمدة`

#### الترحيل للموظف

Readonly handover readiness surface for later employment handoff.

Fields:

- handover state
- employee
- HR contract
- partner bank
- handover ready
- handover blocking notes

No `hr.employee`, `hr.contract`, payroll, or bank creation in Pass 9.

#### ملاحظات

Fields:

- free notes
- implementation/audit comments

## 6. Data source hierarchy

Each contract value resolves in this order:

1. Manual value already stored on `x_hr.applicant_employment_contract`
2. `hr.applicant`
3. linked `hr_pool` candidate record
4. accepted required-document submission / checklist structured data
5. fixed Marsellia/company default
6. blank with validation warning

Rendering must use frozen snapshot values on the contract record. It must not render from fragile live joins.

## 7. Consolidated data mapping

### 7.1 Core identity

| Contract value | Primary source | Fallback |
|---|---|---|
| Full Arabic name | composed structured name parts | `hr.applicant.partner_name`, linked pool name parts |
| First name | `hr.applicant.x_first_name_ar` | `hr_pool.x_first_name_ar` |
| Father name | `hr.applicant.x_father_name_ar` | `hr_pool.x_father_name_ar` |
| Grandfather name | `hr.applicant.x_grandfather_name_ar` | `hr_pool.x_grandfather_name_ar` |
| Surname | `hr.applicant.x_surname_ar` | `hr_pool.x_surname_ar` |
| National ID | `hr.applicant.x_national_id` | `hr_pool.x_national_id`, accepted national ID submission |
| Gender | `hr.applicant.x_gender` | `hr_pool.x_gender` |
| Date of birth | applicant field if present | `hr_pool.x_date_of_birth`, birth certificate submission |
| Marital status | applicant field if present | `hr_pool.x_marital_status`, family-status submission |
| Nationality | applicant field if present | `hr_pool.x_nationality_id`, manual snapshot |

### 7.2 Identity document

| Contract value | Source |
|---|---|
| Identity document source | manual dropdown |
| Document number | accepted submission for selected source |
| Issue place | accepted submission `x_place_of_issue` where available |
| Issue date | accepted submission issue date where available, otherwise manual |

### 7.3 Residence

| Contract value | Primary source | Fallback |
|---|---|---|
| Region | `hr.applicant.x_residence_region_id` | `hr_pool.x_residence_region_id` |
| District | `hr.applicant.x_residence_district_id` | `hr_pool.x_residence_district_id` |
| Municipality | `hr.applicant.x_residence_municipality_id` | `hr_pool.x_residence_municipality_id` |
| Locality/location | `hr.applicant.x_residence_location_id` | `hr_pool.x_residence_location_id` |
| Address text | applicant field if present | pool address / manual snapshot |

### 7.4 Bank

| Contract value | Source |
|---|---|
| Bank name | accepted bank-information submission |
| Branch | accepted bank-information submission |
| Account number | accepted bank-information submission |
| IBAN | accepted bank-information submission if present |

### 7.5 Qualification / family / health

| Contract value | Source |
|---|---|
| Qualification | accepted qualification submission |
| Specialization | accepted qualification submission |
| Family paper number | accepted family-status submission |
| Family registration number | accepted family-status submission |
| Next of kin name/phone | accepted family-status submission |
| Blood type | accepted health-certificate submission |

### 7.6 Job and contract terms

| Contract value | Source |
|---|---|
| Job | `hr.applicant.job_id` |
| Job title | `hr.applicant.job_id.name`, fallback TOR/job snapshot |
| Department | `hr.applicant.department_id`, fallback `job_id.department_id` |
| Start date | `hr.applicant.availability`, editable snapshot |
| End date | derived from start + duration, editable snapshot |
| Contract duration | manual snapshot |
| Renewal duration | manual snapshot |
| Monthly wage amount | manual snapshot |
| Monthly wage text Arabic | manual snapshot |
| Allowances / benefits | manual snapshot |
| Annual leave days | manual/default snapshot |

### 7.7 Handover readiness

Pass 9 must preserve enough data for later native handover to:

- `hr.employee`
- `hr.contract`
- `res.partner.bank`
- payroll/timesheet-adjacent native workflows if enabled later

No handover execution in Pass 9.

## 8. QWeb overlay field-map guidelines

Implementation files likely to be introduced later:

- `models/08_employment_contract.xml`
- `views/08_employment_contract_views.xml`
- `views/01_recruitment_views.xml`
- `report/12_employment_contract_overlay_templates.xml`
- `report/13_employment_contract_overlay_actions.xml`
- `data/24_employment_contract_actions.xml`
- `static/src/img/f0005/page-01.png`
- `static/src/img/f0005/page-02.png`
- `static/src/img/f0005/page-03.png`
- `static/src/img/f0005/page-04.png`
- `static/src/img/f0005/page-05.png`
- `static/src/img/f0005/page-06.png`
- `static/src/img/f0005/page-07.png`

QWeb rendering rules:

- Use seven fixed A4 page containers.
- Use full-page `<img>` elements for PNG page backgrounds.
- Use absolute-positioned overlay spans/divs for dynamic values.
- Use Al Yamama report font pattern already used by the module.
- Use LTR isolation for dates, national IDs, account numbers, and numeric values.
- Render from frozen contract fields / snapshot values only.
- Keep generated attachment filename clean and applicant-specific.
- Track artifact in `x_hr.recruitment_document`.

## 9. Pass slices

### 9A — Documentation + contract plan tracker

Create this document and lock the Pass 9 scope.

Acceptance:

- `phase_9_plan_tracker.md` exists.
- Plan and tracker headings exist.
- UX doctrine is locked.
- No code implementation yet.

### 9B — Contract model + applicant tab shell

Add:

- `x_hr.applicant_employment_contract`
- applicant `العقد` tab summary fields/buttons
- standalone contract form shell

Acceptance:

- applicant contract tab opens cleanly.
- can create/open contract data record.
- state badge works.
- no PDF generation yet.

### 9C — Contract snapshot resolver

Implement:

- `تحديث بيانات العقد`

Resolver pulls from:

- `hr.applicant`
- linked `hr_pool`
- accepted submissions/checklist
- fixed company defaults
- manual snapshot fields

Acceptance:

- core identity, job, residence, bank, qualification, family, and health fields populate where available.
- missing values remain visible for manual completion.
- no rendering yet.

### 9D — QWeb overlay proof, pages 1–2 only

Add first two PNG pages as static backgrounds.

Overlay proof fields:

- company name
- national ID
- name parts
- date of birth
- gender checkbox
- marital status
- phone/email
- residence

Acceptance:

- PDF renders.
- backgrounds appear.
- overlay alignment is close enough to calibrate.
- Arabic values render.
- dates/numbers direction is correct.

### 9E — Full seven-page QWeb overlay

Add all seven pages and all required field positions.

Acceptance:

- full contract PDF renders.
- all required dynamic fields appear.
- generated PDF links to contract and applicant.
- registry row is created/updated as employment contract artifact.

### 9F — Manual signature/accreditation lifecycle

Add:

- `رفع النسخة الموقعة`
- `رفع النسخة المعتمدة`

Track:

- generated
- printed
- signed uploaded
- ministry accredited

Acceptance:

- generated contract can be downloaded.
- signed physical scan can be uploaded.
- ministry-accredited copy can be uploaded.
- registry closes the employment contract artifact when accepted.

### 9G — Handover readiness scaffold

Add readonly handover readiness tab/fields.

Acceptance:

- readiness values are visible.
- blocking missing values are visible.
- no employee, contract, payroll, or bank records are created.

### 9H — Docs/translations/final lock

Update:

- `phase_9_plan_tracker.md`
- `docs/resources/current_phase_execution_plan.md`
- `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md` if needed
- `docs/modules/hr_recruitment_custom/README.md` if needed
- Arabic translations

Acceptance:

- Pass 9 locked.
- no temporary/debug artifacts.
- generated contract lifecycle works.
- no Odoo Sign dependency for F-0005.
- no native HR handover yet.

# Pass 9 Tracker

## 9A-0 — Plan created

Date: TBD

Status: Planned

Files touched:

- `docs/modules/hr_recruitment_custom/phase_9_plan_tracker.md`

What changed:

- Created the locked Pass 9 plan for official employment contract generation using QWeb PNG background overlay.
- Locked the applicant `العقد` tab style to follow the `قرار التعيين` tab.
- Locked the standalone contract cockpit style to follow the customised `x_grc.decision_instance` cockpit.
- Confirmed that Odoo Sign is not required for F-0005 unless later explicitly scoped.

Acceptance result:

- Pending.

Issues / tracebacks:

- None.

Lessons learned:

- Background PNG overlay is preferred over full QWeb text recreation for official government template fidelity.
- Generated contract is a recruitment legal artifact; native `hr.contract` creation remains deferred.

Next step:

- 9B contract model + applicant tab shell.

## 9B-1 — Contract model and applicant tab shell

Date: 2026-05-21

Status: Patch generated; Odoo acceptance pending.

Files touched:

- `modules/hr_recruitment_custom/__manifest__.py`
- `modules/hr_recruitment_custom/models/08_employment_contract.xml`
- `modules/hr_recruitment_custom/security/ir.model.access.csv`
- `modules/hr_recruitment_custom/data/24_employment_contract_actions.xml`
- `modules/hr_recruitment_custom/views/08_employment_contract_views.xml`
- `modules/hr_recruitment_custom/views/01_recruitment_views.xml`

What changed:

- Added `x_hr.applicant_employment_contract` as the official employment contract snapshot/cockpit model.
- Added applicant bridge and mirror fields for the main `العقد` tab.
- Added create/open/update-placeholder server actions.
- Replaced the old placeholder Contract tab with a structured Arabic contract tab aligned with the completed decision tab style.
- Added the standalone contract cockpit view with sectioned tabs aligned with the customised decision instance cockpit style.

Acceptance result:

- Pending Odoo SaaS install/upgrade and UI review.

Issues / tracebacks:

- None at patch generation stage.

Lessons learned:

- Pass 9 shell must stay separate from rendering; QWeb overlay and PNG coordinate calibration remain deferred to 9D/9E.
- Applicant tab should remain compact; detailed field completion belongs in the standalone contract cockpit.

Next step:

- Install/upgrade `hr_recruitment_custom`, verify the contract tab and standalone cockpit, then proceed to 9C snapshot resolver.
