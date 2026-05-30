# Pass 16 — Custody and Assets Implementation Plan

Status: closed and accepted  
Primary module: `hr_employment_custom`  
Environment: Odoo.com SaaS 19.2  
Build command: `./scripts/build_module_zip.sh hr_employment_custom`

## 1. Scope boundary

### In scope

Pass 16 implements the first custody and assets foundation after the accepted Pass 15 employee declaration lifecycle.

In scope:

- Add Marsellia custody process records under native `hr.employee`.
- Add `x_hr.employee_custody_type`.
- Add `x_hr.employee_custody_item`.
- Add an employee `العهد والممتلكات / Custody and Assets` tab.
- Implement the first custody flow for company ID card custody/receipt.
- Use the existing employee identification document model as the source of company ID card details.
- Generate a company ID card custody receipt PDF.
- Send the ID card custody receipt through native Odoo Sign.
- Sync signed PDF and Sign certificate back to the custody item.
- Copy/post generated, signed, and certificate artifacts to employee chatter/files.
- Hide raw `ir.attachment` links and expose artifact download buttons.
- Add return/lost/damaged lifecycle fields sufficient for future clearance/offboarding.
- Add only lightweight future linkage posture for other custody categories such as computers, PPE, vehicles, phones, tools, access cards, and radios.

### Out of scope

Pass 16 must not implement:

- full clearance/offboarding workflow;
- leave, permissions, training, assignment, appraisal, payroll, work entries, or final settlement logic;
- Odoo Documents app governance;
- GRC decision instances;
- hard dependencies on Odoo Fleet, Inventory, Accounting, or Asset modules;
- direct `fleet.vehicle`, `account.asset`, stock, inventory, or fixed-asset links unless a later technical preflight proves those models are available and safe in the SaaS database;
- broad DRY refactor of Pass 15 Sign actions;
- old recruitment Sign smart-button anchoring fix.

## 2. Preconditions

Required prior state:

- Pass 15 is closed and committed.
- `hr_employment_custom` is installed and accepted.
- `hr.employee` has:
  - `x_identification_document_ids`;
  - `x_employee_declaration_ids`;
  - Identification tab;
  - Declarations tab.
- `x_hr.employee_identification_document` exists.
- The identification document type `company_id_card` is available or can be selected/represented in the existing identification document model.
- At least one employee can have a company ID card identity record with:
  - document number;
  - issuing authority;
  - issue place;
  - issue date;
  - expiry date;
  - document image or attachment where available.
- Pass 15 artifact pattern is accepted:
  - generated/signed/certificate artifacts are stored on the source process record;
  - artifacts are copied/posted to employee chatter/files;
  - user-facing download uses `/web/content/<attachment_id>?download=true`;
  - raw `ir.attachment` fields are hidden from the operational form.

## 3. Ownership and module boundary

Primary module:

    hr_employment_custom

Primary native anchor:

    hr.employee

Custom process model family:

    x_hr.employee_custody_type
    x_hr.employee_custody_item

Boundary rules:

- Native `hr.employee` remains the operational employee source of truth.
- Custody items are process records, not employee master-data fields.
- Company ID card custody uses the existing `x_hr.employee_identification_document` record where `x_document_type` is `company_id_card`.
- The ID card custody PDF must read company card values from the selected identification document rather than duplicating broad snapshot fields.
- Other custody categories are deliberately designed for future linkage to native Odoo rosters, but Pass 16 must not hard-depend on those rosters.
- If Fleet/Assets/Inventory are needed later, they require a separate preflight and dependency decision.

## 4. Model doctrine

### 4.1 Custody type

Model:

    x_hr.employee_custody_type

Purpose:

- define custody category/type behavior;
- drive default labels and QWeb/report behavior;
- keep later asset/fleet linkage configurable without creating hard dependencies now.

Recommended fields:

- `x_name`
- `x_code`
- `x_category`
- `x_active`
- `x_requires_return`
- `x_requires_signature`
- `x_requires_identifier`
- `x_uses_company_id_document`
- `x_default_validity_months`
- `x_replacement_fee_amount`
- `x_replacement_fee_currency_label`
- `x_future_native_link_model`
- `x_notes`

Initial category values:

- `company_id_card`
- `computer_equipment`
- `ppe`
- `vehicle`
- `phone`
- `tool`
- `access_card`
- `radio`
- `other`

Pass 16 should seed at least:

    Company ID Card / بطاقة الشركة

Future types can be added later without changing the custody process model.

### 4.2 Custody item

Model:

    x_hr.employee_custody_item

Purpose:

- represent one custody issuance/receipt/return obligation for one employee;
- own lifecycle truth and document artifacts;
- provide future clearance/offboarding visibility.

Recommended core fields:

- `x_name`
- `x_employee_id`
- `x_custody_type_id`
- `x_state`
- `x_reference_code`
- `x_document_reference`
- `x_issued_on`
- `x_expected_return_on`
- `x_returned_on`
- `x_quantity`
- `x_condition_on_issue`
- `x_condition_on_return`
- `x_item_description`
- `x_item_identifier`
- `x_serial_number`
- `x_replacement_value`
- `x_responsible_user_id`
- `x_notes`

Company ID card source fields:

- `x_company_id_document_id`
- `x_company_id_document_number_display` if needed for UI only;
- `x_company_id_expiry_display` if needed for UI only.

Artifact/sign fields, reusing the accepted Pass 15 field family:

- `x_pdf_attachment_id`
- `x_signed_attachment_id`
- `x_sign_certificate_attachment_id`
- `x_sign_request_res_id`
- `x_sign_request_state`
- `x_sign_request_reference`
- `x_sign_request_url`
- `x_generated_on`
- `x_sent_on`
- `x_signed_on`

Manual decision/exception fields:

- `x_manual_decision_number`
- `x_manual_decision_date`
- `x_manual_decision_attachment_id`

Clearance/offboarding hook fields:

- `x_clearance_required`
- `x_clearance_status`
- `x_clearance_notes`

State doctrine:

    draft
    generated
    signature_requested
    signed
    returned
    lost
    damaged
    cancelled
    superseded

Do not implement final offboarding closure in Pass 16. Only make open custody visible and queryable for Pass 23 clearance.

### 4.3 F-0011 company ID card custody receipt mapping

The first Pass 16 custody form is:

    MCEP-HR-F-0011 — Company ID Card Receipt / استلام البطاقة التعريفية

The form should remain thin and should read source values from existing records wherever possible.

Employee information mapping:

| F-0011 field | Source |
| --- | --- |
| Full Name / الاسم الكامل | `hr.employee.name` |
| Employee ID / الرقم الوظيفي | `hr.employee.id` for the first implementation unless a verified employee-number field is later confirmed |
| Job Title / المسمى الوظيفي | `hr.employee.job_title` |
| Department / القسم / الإدارة | `hr.employee.department_id.name` |
| Date / التاريخ | `x_hr.employee_custody_item.x_issued_on` |

Company ID card source mapping:

| F-0011 value | Source |
| --- | --- |
| company card document number | `x_company_id_document_id.x_document_number` |
| issuing authority | `x_company_id_document_id.x_issued_by` |
| issue place | `x_company_id_document_id.x_issue_place` |
| issue date | `x_company_id_document_id.x_issue_date` |
| expiry date | `x_company_id_document_id.x_expiry_date` |
| document image/attachment | `x_company_id_document_id.x_document_image` or linked attachment field where available |

Custody type defaults for the company ID card type:

| Value | Default |
| --- | --- |
| validity months | `6` |
| replacement fee amount | `25` |
| replacement fee currency label | `LYD` / `دينار ليبي` |

Implementation notes:

- Do not duplicate company ID card document fields on the custody item except where a small UI display/helper is necessary.
- Do not create a new employee-number field in Pass 16A/16B. Use `hr.employee.id` for the first F-0011 implementation unless a verified native/custom employee number field is confirmed later.
- Do not add accounting/currency dependencies for the replacement fee in Pass 16. A plain amount plus label is sufficient for the form text.
- If `x_company_id_document_id` is missing, PDF generation should block with a clear user message rather than fabricating ID card values.

## 5. Files likely touched

Expected new/changed module files:

    modules/hr_employment_custom/__manifest__.py
    modules/hr_employment_custom/models/03_employee_custody.xml
    modules/hr_employment_custom/views/03_employee_custody_views.xml
    modules/hr_employment_custom/data/07_employee_custody_type_data.xml
    modules/hr_employment_custom/data/08_employee_custody_actions.xml
    modules/hr_employment_custom/report/08_employee_custody_id_card_templates.xml
    modules/hr_employment_custom/report/09_employee_custody_report_actions.xml
    modules/hr_employment_custom/security/ir.model.access.csv
    modules/hr_employment_custom/i18n/ar_001.po

Expected documentation files:

    docs/modules/hr_employment_custom/pass16_execution_plan.md
    docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md
    docs/modules/hr_employment_custom/02_document_artifact_and_signing_pattern.md
    docs/modules/hr_employment_custom/03_employee_form_tabs_and_ui_doctrine.md
    docs/modules/hr_employment_custom/04_mobile_artifacts_chatter_and_activities.md
    docs/modules/hr_employment_custom/05_pass_15_plus_roadmap.md
    docs/modules/hr_employment_custom/README.md

Generated files that must not be committed:

    dist/*.zip
    generated PDFs
    signed PDFs
    Sign certificates downloaded for testing
    screenshots
    exported translation files in repo root unless deliberately used as a source patch input
    temporary extracted module directories

## 6. Slice plan

### 16A — Custody preflight and documentation lock

Status: accepted

Goal:

- Lock Pass 16 boundaries before code.
- Confirm current module structure and Pass 15 artifacts remain stable.
- Confirm the existing employee identification document model can represent company ID cards.

Expected changes:

- Documentation only or very small doc corrections.
- No model/view/report code.

Sanity checks:

- `pass16_execution_plan.md` exists.
- Plan states that Fleet/Assets/Inventory links are deferred until preflight.
- Plan states that company ID card custody reads from `x_hr.employee_identification_document`.
- No dependency change is proposed in 16A.

Odoo acceptance:

- Not applicable.

Status:

    planned

### 16B — Custody model family and employee tab

Goal:

- Add the custody model family.
- Add the employee `العهد والممتلكات / Custody and Assets` tab.
- Keep this slice UI/model-only, without reports or Sign.

Expected changes:

- Add `x_hr.employee_custody_type`.
- Add `x_hr.employee_custody_item`.
- Add `hr.employee.x_custody_item_ids`.
- Add custody tab with list and modal/form.
- Add access rules.
- Add display name normalization for custody items.
- Add simple Arabic-first chatter note when a custody item is created/updated if chatter is available.

Sanity checks:

- XML parses.
- Access CSV is valid and has clean row endings.
- No report or Sign action is added yet.
- No dependency on Fleet, Assets, Inventory, Accounting, or Documents.
- Employee form still opens.
- Existing Identification and Declarations tabs remain visible.

Odoo acceptance:

- Install/upgrade succeeds.
- Employee custody tab renders.
- Custody item create/edit works.
- Custody item links to the correct employee.
- No generated PDF yet.

Status:

    planned

### 16C — Custody type seed and company ID card source mapping

Goal:

- Seed the first custody type: company ID card.
- Add source mapping from custody item to employee company ID identification document.

Expected changes:

- Seed `x_hr.employee_custody_type` record:
  - code: `company_id_card`;
  - category: `company_id_card`;
  - name: `Company ID Card / بطاقة الشركة`;
  - requires return: true;
  - requires signature: true;
  - uses company ID document: true;
  - default validity months: `6`;
  - replacement fee amount: `25`;
  - replacement fee currency label: `LYD / دينار ليبي`.
- Add `x_company_id_document_id` to custody item.
- Domain should restrict selectable ID document records to the same employee and preferably company ID card document type.
- If the company ID card identification document is absent, show a clear warning or leave the field empty. Do not fabricate card values.

Sanity checks:

- Seed XML parses.
- `x_company_id_document_id` references `x_hr.employee_identification_document`.
- No duplicate company ID card document details are introduced as broad custody snapshot fields.
- Company ID document details are read from the selected identification document.

Odoo acceptance:

- Company ID custody type exists.
- Custody item can select an employee company ID document.
- If the employee has no company ID document, the user can still create a draft custody item but cannot generate the ID card receipt until a source document is selected.
- Existing declaration workflows still open.

Status:

    planned

### 16D — ID card custody receipt QWeb/PDF generation

Goal:

- Generate the first custody PDF: company ID card receipt/acknowledgment.
- Reuse the Pass 15 report/header/artifact pattern where safe.

Expected changes:

- Add QWeb template for company ID card custody receipt.
- Add report action.
- Add `Generate PDF` action/button for custody item.
- Store generated PDF in `x_pdf_attachment_id`.
- Write `x_generated_on`.
- Move state to `generated`.
- Post/copy generated PDF to employee chatter/files.
- Add download button for generated PDF.

QWeb source values:

- Employee:
  - name;
  - department;
  - job title;
  - manager where relevant.
- Company ID document from `x_company_id_document_id`:
  - card/document number;
  - issued by;
  - issue place;
  - issue date;
  - expiry date;
  - document image/attachment where useful.
- Custody item:
  - document reference;
  - issue date / receipt date;
  - selected company ID document;
  - notes.
- Custody type:
  - validity months;
  - replacement fee amount;
  - replacement fee currency label.

Sanity checks:

- Report XML parses.
- Report action has exact one-line `report_name` and `report_file`.
- No bottom footer pattern is reintroduced.
- Header page label pattern follows Pass 15.
- Generate action Python compiles.
- Raw `ir.attachment` fields stay hidden from user-facing form.

Odoo acceptance:

- Generate PDF works for a custody item with selected company ID document.
- Generated PDF opens/downloads.
- Generated PDF is saved on the custody item.
- Employee chatter/files receives the generated PDF.
- The PDF uses the selected company ID document details, not manually duplicated text.

Status:

    planned

### 16E — ID card custody receipt Sign send/sync

Goal:

- Add native Odoo Sign flow for the company ID card custody receipt.

Default signer posture:

- employee recipient signs and dates receipt;
- responsible issuer/custodian signs and dates if the final PDF includes a responsible issuer block.

Implementation rule:

- Generate and accept the QWeb PDF first.
- Then add Sign fields.
- Calibrate only `posX`, `posY`, `width`, and `height`.

Expected changes:

- Add `Send to Sign` button beside `Generate PDF`.
- Add `Sync` button.
- Create dynamic Odoo Sign template from the generated PDF.
- Create Sign items according to accepted PDF signature zones.
- Store Sign request linkage on `x_hr.employee_custody_item`.
- Sync state and signed artifacts.
- Copy/post signed PDF and certificate to employee chatter/files.

Sanity checks:

- Server action Python compiles.
- Source model anchoring uses:
  - model = `x_hr.employee_custody_item`;
  - res_ids = `[custody_item.id]`.
- Sign lifecycle truth remains on the custody item.
- Sync returns to the custody item form.
- Signed artifact and certificate use download buttons.

Odoo acceptance:

- Send to Sign works.
- Sign item placement is visible in Odoo Sign preview.
- Employee and responsible signer, if used, can complete signing.
- Sync moves state to `signed`.
- Signed PDF and certificate are linked on the custody item and posted to employee chatter/files.
- Existing declaration Sign flows still work.

Status:

    planned

### 16F — Custody return, lost, damaged, and clearance hook foundation

Goal:

- Add enough lifecycle and fields for custody return/exception tracking and later clearance.
- Do not implement full clearance workflow.

Expected changes:

- Add return/lost/damaged action buttons or server actions after signed issuance.
- Add return fields:
  - returned on;
  - condition on return;
  - return notes;
  - received by/responsible user.
- Add exception fields:
  - lost/damaged reason;
  - manual decision number/date/attachment;
  - replacement value or settlement note.
- Add clearance hook fields:
  - clearance required;
  - clearance status;
  - clearance notes.
- Make open custody items easy to list/filter later for Pass 23 clearance.

Sanity checks:

- No `x_hr.employee_clearance` model is introduced.
- No archive/departure effect is implemented.
- No payroll/settlement deduction is implemented.
- Actions do not silently delete custody records.
- Returned/lost/damaged transitions are explicit and chatter-noted.

Odoo acceptance:

- Signed custody item can be marked returned.
- Signed custody item can be marked lost/damaged with notes.
- Open custody lines remain visible on employee.
- Returned items remain visible but are clearly state-marked.
- Future clearance can query non-returned custody items.

Status:

    planned

### 16G — Future native asset/fleet linkage posture

Goal:

- Prepare the custody design for later native roster linkage without adding unsafe dependencies now.

Expected changes:

- Documentation and optional lightweight fields only.
- If fields are added, they should be safe text/config fields, not hard many2one references to unverified models.
- Examples:
  - `x_future_native_link_model` on custody type;
  - `x_external_reference` or `x_roster_reference` on custody item;
  - notes explaining future link to Fleet, Assets, Inventory, or Equipment after preflight.

Sanity checks:

- Manifest still does not add `fleet`, `account`, `stock`, `maintenance`, or asset modules.
- No many2one to unverified native roster models.
- Future linkage is documented as a later pass.

Odoo acceptance:

- Not required beyond install/upgrade and view sanity.

Status:

    planned

### 16H — Arabic translation polish

Goal:

- Apply translation updates after the functional custody slices install cleanly.
- Use the accepted exported-anchor PO workflow.

Expected changes:

- Export Arabic translations from Odoo after install/upgrade.
- Replace/rebaseline `modules/hr_employment_custom/i18n/ar_001.po` from exported anchors.
- Fill targeted custody translations.
- Avoid guessed PO anchors.

Sanity checks:

- PO is UTF-8 plain text.
- `msgid/msgstr` syntax is valid.
- No fake references are introduced.
- No duplicate selection rows are created.

Odoo acceptance:

- Custody tab, buttons, states, fields, and helper labels appear correctly in Arabic.
- English source labels remain clean.

Status:

    planned

### 16I — Documentation closure

Goal:

- Close Pass 16 documentation before Pass 17.

Expected changes:

- Update `pass16_execution_plan.md` with implementation log.
- Update lifecycle, artifact, mobile/chatter, and roadmap docs.
- Record lessons learned from custody model, ID card source mapping, QWeb generation, Sign calibration, artifact downloads, and return/clearance hook design.

Sanity checks:

- Documentation mentions what was implemented and what was deferred.
- Pass 17 is identified as the next pass.
- Generated artifacts and screenshots are not staged.

Odoo acceptance:

- Not applicable.

Status:

    planned

## 7. Implementation log

Append implementation notes here as slices are accepted.

### 16A implementation log

Status:

    accepted

Preflight findings:

- The latest `hr_employment_custom` baseline contains only the accepted Pass 15 model families:
  - `x_hr.employee_identification_document`;
  - `x_hr.employee_declaration`.
- The current manifest dependency posture remains safe for Pass 16:
  - `base`;
  - `mail`;
  - `hr`;
  - `sign`;
  - `base_automation`;
  - `grc_backbone`.
- No dependency on Fleet, Inventory, Accounting, Assets, Maintenance, Documents, Payroll, or Contracts is needed for 16B/16C.
- The existing identification model already supports the `company_id_card` document type.
- The existing employee identification one2many field is available as `hr.employee.x_identification_document_ids`.
- The existing declaration artifact pattern is available for reuse:
  - hidden lifecycle attachment fields;
  - user-facing download actions;
  - generated/signed/certificate copies to employee chatter/files.
- F-0011 requires the first custody type to carry type-level defaults for:
  - six-month company ID validity;
  - replacement fee amount `25`;
  - replacement fee label `LYD / دينار ليبي`.
- F-0011 should read company ID document values from `x_company_id_document_id`, linked to `x_hr.employee_identification_document`, rather than duplicating card fields on the custody item.
- Future custody types such as computers, PPE, vehicles, phones, tools, access cards, and radios remain future-linkable but must not introduce hard many2one references to unverified native rosters in Pass 16.

16A conclusion:

- Proceed to 16B with no dependency change.
- Implement custody models and employee tab first.
- Keep reports, Sign, return/lost/damaged transitions, and translation polish for later slices.

### 16B implementation log

Status:

    accepted

Accepted outcomes:

- Added `x_hr.employee_custody_type`.
- Added `x_hr.employee_custody_item`.
- Added `hr.employee.x_custody_item_ids`.
- Added employee `Custody and Assets` tab.
- Added basic create/edit modal/form behavior.
- Added access rows.
- Added normalization/chatter automation.
- No PDF, Sign, return/lost/damaged, clearance, Fleet, Assets, Inventory, or translation polish was implemented in this slice.

### 16C implementation log

Status:

    accepted

Accepted outcomes:

- Seeded the first custody type: `Company ID Card`.
- Added `x_company_id_document_id` on `x_hr.employee_custody_item`.
- Restricted selectable source identity documents to the same employee and `company_id_card`.
- Normalization can populate the item identifier from the selected company ID document number.
- Kept source labels English-only and deferred Arabic polish to exported PO workflow.
- No report, Sign, return/lost/damaged, or native roster linkage was implemented in this slice.

### 16D implementation log

Status:

    accepted

Accepted outcomes:

- Added F-0011 company ID card custody receipt QWeb/PDF generation.
- Generated PDF reads employee and selected company ID document values from source records.
- Generated PDF is stored on the custody item.
- Generated PDF is posted/copied to employee chatter/files.
- User-facing generated PDF download uses `/web/content/<attachment_id>?download=true`.
- Generation blocks when a company ID document is missing or invalid.
- No Sign flow was implemented in this slice.

### 16E implementation log

Status:

    accepted

Accepted outcomes:

- Added F-0011 Odoo Sign send/sync.
- F-0011 uses one signer: employee.
- F-0011 uses one Sign item only: employee signature.
- No date Sign item is used because the date is generated directly into the PDF.
- Signed PDF and certificate, when exposed by Odoo, are copied/posted to employee chatter/files.
- Sync returns to the custody item form.
- Signature placement was functionally accepted but final fine calibration remains deferred if later test PDFs show a mismatch.

### 16F implementation log

Status:

    accepted

Accepted outcomes:

- Added explicit custody lifecycle actions:
  - Mark Returned;
  - Mark Lost;
  - Mark Damaged.
- Returned custody sets clearance status to `cleared`.
- Lost and damaged custody set clearance status to `blocked`.
- Employee chatter receives Arabic lifecycle notes.
- Artifact icon buttons were cleaned up for custody and declaration forms.
- Long artifact download labels were replaced with compact header icons.
- No full clearance workflow, payroll/deduction, final settlement, archive/departure, Fleet, Assets, Inventory, or Documents app governance was implemented.

Deferred hardening discovered after acceptance:

- Pressing `Sync` on a blocked/lost/damaged custody item can set the state back to `signed` because the linked Odoo Sign request is already signed.
- This can reopen the path for `Mark Returned`.
- The issue is deferred intentionally.
- Future hardening should make Sign sync preserve terminal/exception states such as `returned`, `lost`, `damaged`, `cancelled`, and `superseded`.
- Sync should refresh artifacts and Sign metadata without downgrading or reopening exception lifecycle states.

### 16G implementation log

Status:

    accepted

Accepted outcomes:

- Future native roster linkage remains documentation/configuration-only.
- No hard many2one link was added to Fleet, Inventory, Accounting, Asset, Maintenance, or Documents models.
- Computers, PPE, vehicles, phones, tools, access cards, radios, and other future custody types remain future-linkable after a later technical preflight.
- The accepted Pass 16 custody type field `x_future_native_link_model` remains a hint/configuration field only, not an enforced dependency.

### 16H implementation log

Status:

    patch applied; pending Odoo UI acceptance

Patch scope:

- Rebased `modules/hr_employment_custom/i18n/ar_001.po` from the exported Odoo Arabic PO file.
- Filled targeted custody translations against exported PO anchors.
- Kept XML/source labels English-only where practical.
- Did not rewrite bilingual selection labels in this slice; helper-record cleanup remains a future polish item if needed.

### 16I implementation log

Status:

    accepted

Accepted outcomes:

- Pass 16 was closed in documentation.
- Accepted custody, F-0011 PDF/Sign, artifact, lifecycle, and translation outcomes were recorded.
- Deferred hardening backlog was preserved for later lifecycle/governance passes.
- Pass 17 was identified as the next implementation pass.

## 8. Final Pass 16 acceptance gate

Pass 16 can close only when:

- Company ID card custody type exists.
- Company ID card custody type stores validity months `6` and replacement fee `25 LYD / دينار ليبي` for F-0011 text.
- Employee custody tab is installed and usable.
- Custody item can link to the employee company ID document from `x_hr.employee_identification_document`.
- ID card custody receipt PDF generates using the selected company ID details.
- Generated PDF is stored on the custody item.
- Generated PDF is posted/copied to employee chatter/files.
- ID card custody receipt Sign send/sync works.
- Signed PDF and Sign certificate, when exposed by Odoo, are stored on the custody item and posted/copied to employee chatter/files.
- Artifact download buttons download files rather than opening `ir.attachment` metadata forms.
- Return/lost/damaged lifecycle foundation is present without implementing full clearance.
- Future asset/fleet/native roster linkage is documented but not hard-dependent.
- Arabic translations have been patched through the exported-anchor PO method.
- No generated PDFs, signed PDFs, screenshots, exported zips, or temporary extracted folders are committed.

## 9. Commit discipline

Each accepted slice should be committed separately.

Recommended commit messages:

16A:

    docs: scope pass16 custody assets implementation

16B:

    pass16b: add employee custody model and tab

16C:

    pass16c: add company id custody type mapping

16D:

    pass16d: add id card custody receipt pdf generation

16E:

    pass16e: add id card custody sign send and sync

16F:

    pass16f: add custody return and clearance hook foundation

16H:

    pass16h: polish custody translations

16I:

    docs: close pass16 custody assets lifecycle

## 10. Deferred hardening backlog from Pass 16

The following items are known and intentionally deferred beyond the current custody foundation.

### 10.1 Sign sync must not reopen exception lifecycle states

Observed behavior:

- A custody item can be marked `lost` or `damaged`, making its clearance status `blocked`.
- If the linked Odoo Sign request is already signed, pressing `Sync` can set the custody state back to `signed`.
- This then makes `Mark Returned` available again.

Required future hardening:

- Sign sync should refresh:
  - Sign request state;
  - signed PDF;
  - Sign certificate;
  - artifact copies;
  - timestamps;
  - metadata.
- Sign sync should not overwrite terminal/exception custody states:
  - `returned`;
  - `lost`;
  - `damaged`;
  - `cancelled`;
  - `superseded`.
- State reopening must be explicit, governed, and traceable, not a side effect of sync.

Decision:

- Do not patch this inside 16F/16H.
- Carry it to a later lifecycle hardening pass or Pass 24/26 governance hardening.

### 10.2 Signature geometry final calibration

F-0011 signature placement was functionally accepted enough to proceed, but final calibration may still be adjusted if later signed PDFs show misalignment.

### 10.3 Translation/source-label cleanup

Short bilingual selection values remain a known compromise inherited from earlier slices. Future cleanup can move longer labels and state/type displays into helper records or cleaner translation-backed values where required.

## 11. Pass 16 closure

Status:

    closed and accepted

Closed scope:

- Added employee custody foundation under native `hr.employee`.
- Added `x_hr.employee_custody_type`.
- Added `x_hr.employee_custody_item`.
- Added employee `Custody and Assets` tab.
- Seeded and accepted company ID card custody.
- Linked company ID custody to the employee company ID record from `x_hr.employee_identification_document`.
- Generated F-0011 company ID card custody receipt PDF from source records.
- Stored generated PDF on the custody item.
- Copied/posted generated PDF to employee chatter/files.
- Added one-signer native Odoo Sign flow for F-0011.
- Synced signed PDF and certificate, where exposed by Odoo, back to custody item and employee chatter/files.
- Replaced long artifact download buttons with compact icon buttons for custody and declaration records.
- Added returned/lost/damaged lifecycle actions as a foundation for later clearance.
- Kept full clearance, payroll, accounting, settlement, Fleet, Inventory, Assets, and Documents governance out of Pass 16.
- Completed Arabic translation cleanup for custody/declaration state selection values using exported Odoo selection IDs.

Accepted deferred backlog:

- F-0011 signature geometry can still receive a later micro-calibration if a later signed PDF shows drift.
- Sign sync currently can reopen blocked/exception custody states if the underlying Odoo Sign request is signed. Later hardening must preserve terminal/exception states while still refreshing artifacts.
- Future custody categories remain future-linkable only. No hard Fleet/Inventory/Asset references were introduced.
- The `__export__` selection ID translation technique is database-specific to the current SaaS database and should be treated as a controlled operational patch, not a portable seed doctrine.

Translation lesson locked:

- Field/view/action labels should remain clean English source labels in XML.
- Arabic UI should be delivered through `i18n/ar_001.po` using exported Odoo anchors.
- Do not use bilingual source labels except as a temporary emergency compromise.
- For selection fields, do not invent PO anchors.
- Do not create duplicate `ir.model.fields.selection` rows for existing field/value pairs. Odoo already owns those rows and enforces uniqueness on field/value.
- If exported module PO lacks selection anchors, export `ir.model.fields.selection` records from Odoo and bind PO entries to the exported `__export__.ir_model_fields_selection_...` references.
- Do not manually edit selection source names in Studio as the primary solution. If manual translation/import is required, use Odoo's translation import path rather than changing the source name.

Pass 17 handoff:

- Proceed to Pass 17 — Training and Certifications.
- Pass 17 should use the accepted document artifact pattern, native Sign source-record anchoring, employee chatter/files copy, and exported-anchor translation workflow.
