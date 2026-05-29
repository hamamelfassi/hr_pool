# Pass 16 — Custody and Assets Implementation Plan

Status: scoped, not implemented  
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
  - uses company ID document: true.
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
  - issue date;
  - replacement value if available;
  - notes.

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

    not started

### 16B implementation log

Status:

    not started

### 16C implementation log

Status:

    not started

### 16D implementation log

Status:

    not started

### 16E implementation log

Status:

    not started

### 16F implementation log

Status:

    not started

### 16G implementation log

Status:

    not started

### 16H implementation log

Status:

    not started

### 16I implementation log

Status:

    not started

## 8. Final Pass 16 acceptance gate

Pass 16 can close only when:

- Company ID card custody type exists.
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
