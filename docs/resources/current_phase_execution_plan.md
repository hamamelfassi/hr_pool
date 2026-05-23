# Current Phase Execution Plan — Pass 7 GRC Governance Reference and Decision Engine Foundation

## Active phase override

The current phase is:

`Pass 8A/8B — Appointment Decision tab shell and bridge fields`

Pass 7 is closed and accepted.

Pass 8 consumes the GRC generated-decision engine from `hr_recruitment_custom` through a dedicated applicant tab named:

`قرار التعيين`

Current implementation scope:

1. 8A — documentation lock and applicant tab shell.
2. 8B — bridge fields between `hr.applicant` and `x_grc.decision_instance`.

This slice intentionally does not implement decision creation, PDF generation, Odoo Sign, registry writeback, or stamped-copy upload workflow.

Locked Pass 8 UX split:

```text
hr.applicant / قرار التعيين
= compact operational summary and manual instantiation inputs

HR-specific generated-decision cockpit
= generated decision snapshots, PDF, Sign, and artifact lifecycle

GRC generated-decision form
= generic governance detail surface
```

Locked applicant-tab manual inputs:

- decision number — required later by action validation;
- HR letter registration number — optional;
- HR letter date — optional.

Locked derived variables:

- subject from template;
- honorific from applicant gender;
- full name from applicant partner name;
- job title from applicant job;
- department from applicant department;
- start date from applicant availability;
- decision year and issue date from creation/issue datetime.


## Authority

Read with:

1. `docs/architecture/00_master_architecture_and_program_plan.md`
2. `docs/architecture/01_two_stage_recruitment_program_plan.md`
3. `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
4. `docs/architecture/04_translation_delivery_plan.md`
5. `docs/modules/hr_recruitment_custom/pass_5e_f0003_native_sign_lifecycle_plan.md`
6. `docs/modules/hr_recruitment_custom/native_odoo_sign_workflow_wiki.md`
7. `docs/modules/hr_recruitment_custom/report_generation_wiki.md`
8. `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`
9. `docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md`
10. `docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md`
11. `docs/modules/hr_recruitment_custom/pass_6d_6h_evaluation_closure_plan.md`

## Scope correction

The originally planned “Pass 6D — Documents Governance + Final Hardening” is deferred.

Odoo Documents is already centralizing recruitment attachments sufficiently for this phase. The full governance layer for folders, tags, security classes, access groups, retention, applicant-to-employee filing, and long-term Documents automation is deferred until after the full recruitment-to-employment cycle is implemented.

The current Pass 6D–6H goal is Evaluation-stage closure.

## Pass 6D–6H goal

Before Pass 7 begins, the Evaluation / Interviews stage must be operationally complete:

```text
F-0002 Interview Evaluation generated + signed + registry signed
F-0003 Required Documents Checklist generated + signed + registry signed
F-0004 Legal Documents Validity Declaration generated + signed + registry signed
→ Evaluation gate validates registry
→ applicant moves to Contract Proposal / Preboarding
```

The authoritative gate is the recruitment document registry, not tab appearance or manual stage movement.

## **Pass 6 slices**

### **6A — Internal Required Document Submissions Foundation**

Complete.

### **6B — Submission Request / Continuation Link Foundation**

Complete.

### **6C — Public Fillout/n8n Writeback Probe**

Complete.

### **6D — UI/UX polish \+ Pass 5/6 translation catch-up**

Scope:

* Polish Documents tab checklist UI.  
* Polish Submissions tab list/form views.  
* Polish Submission Request form view.  
* Polish Request Line form view.  
* Add controlled download buttons where missing.  
* Reduce workflow clutter and clarify primary actions.  
* Harden attachment fields with readonly/no-open/no-create patterns where lifecycle-locked.  
* Update Arabic translations for Pass 5 and Pass 6 labels, states, buttons, tabs, reports, and server-action messages.  
* Do not add Odoo Documents folder/tag automation.

Acceptance:

* Documents tab remains focused on F-0003 checklist control.  
* Submissions tab remains focused on submitted evidence and HR review.  
* Submission request/request-line forms are easier to inspect.  
* Evidence attachments are downloadable without opening editable attachment records.  
* Arabic UI labels are materially improved across Pass 5/6 surfaces.  
* No regression to Fillout/n8n writeback or F-0003 readiness validation.

### **6E — F-0002 native Sign retrofit**

Scope:

* Reuse the proven F-0003 one-signer native Odoo Sign pattern for F-0002.  
* Keep F-0002 signer as interviewer only.  
* Generate Sign template/document/item from the generated F-0002 PDF attachment.  
* Store linked Sign request on `x_hr.recruitment_document`.  
* Sync signed result from native Odoo Sign.  
* Copy signed PDF and certificate to applicant attachments.  
* Mark source interview record signed.  
* Mark registry row signed.  
* Prevent duplicate sends.  
* Keep manual signed-attachment fallback where present.  
* Calibrate F-0002 signature coordinates from the current locked generated PDF.

Acceptance:

* F-0002 generated PDF exists.  
* F-0002 Sign request is sent to the expected interviewer.  
* F-0002 signer receives email and signs.  
* Sync action closes source record and registry only after full request signed.  
* Signed PDF and certificate are linked.  
* Duplicate send is blocked cleanly.  
* Manual fallback remains available.

### **6F — F-0004 declaration generation \+ native Sign**

Scope:

* Add F-0004 declaration source surface in the Declarations tab.  
* Generate F-0004 QWeb PDF using the locked report pattern.  
* Track generated and signed artifacts in `x_hr.recruitment_document`.  
* Use native Odoo Sign one-signer flow for Pass 6 closure.  
* Primary signer for Pass 6F: applicant.  
* HR/recruitment review fields may remain stored/printed, but two-signer native Sign execution is deferred unless explicitly re-scoped.

Acceptance:

* F-0004 source record can be created/prepared for the applicant.  
* F-0004 PDF is generated cleanly.  
* F-0004 registry row is created/updated.  
* F-0004 is sent through native Odoo Sign.  
* Applicant signs.  
* Sync action links signed PDF/certificate and marks source/registry signed.  
* F-0007 and F-0009 remain out of scope until Pass 11\.

### **6G — Evaluation gate action**

Scope:

* Add guarded applicant action to complete Evaluation and move to Contract Proposal / Preboarding.  
* Gate reads latest active `x_hr.recruitment_document` rows only.  
* Required signed artifacts:  
  * `interview_evaluation`  
  * `required_documents_checklist`  
  * `legal_documents_validity_declaration`  
* If all are signed, find Contract Proposal / Preboarding stage safely and move the applicant.  
* If blocked, show a clear toast listing missing unsigned artifacts.  
* Post chatter on success and blocked attempts.  
* Do not modify native Odoo recruitment stage schema.

Acceptance:

* Gate blocks if F-0002 is missing/unsigned.  
* Gate blocks if F-0003 is missing/unsigned.  
* Gate blocks if F-0004 is missing/unsigned.  
* Gate succeeds when all three are signed.  
* Applicant moves to Contract Proposal / Preboarding.  
* Native stage structures remain untouched.

### **6H — End-to-end regression and lock**

Scope:

* Test one applicant through the full Evaluation-stage closure path.  
* Confirm F-0002 generation/sign/sync.  
* Confirm F-0003 submission review/readiness/generation/sign/sync.  
* Confirm F-0004 generation/sign/sync.  
* Confirm Evaluation gate.  
* Confirm applicant reaches Contract Proposal / Preboarding.  
* Confirm Arabic translations render.  
* Confirm no regression to Pass 6C public writeback.  
* Commit and lock.

Acceptance:

* Full Evaluation-stage flow passes on Odoo SaaS without traceback.  
* All three registry artifacts are signed.  
* Evaluation gate works.  
* No generated PDFs, screenshots, dist zips, or temporary files are committed.

## **Locked Pass 6C rules retained**

### **Routing rule**

```
urlParameters = authoritative for request/routing metadata
questions = authoritative for applicant-filled values and file uploads
```

### **Odoo review rule**

n8n creates Odoo submissions in `submitted` state only.

HR review remains in Odoo:

```
Submissions tab
→ Accept / Reject
→ checklist line writeback
→ readiness validation
```

### **Attachment rule**

Most public sections require an attachment.

Exceptions:

```
bank_information = structured data only, no attachment required
passport_photos = not public, manual HR hardcopy review
```

### **Writeback rule**

n8n creates:

```
ir.attachment
x_hr.applicant_required_document_submission
```

n8n updates:

```
x_hr.applicant_required_document_submission_request_line
x_hr.applicant_required_document_submission_request
```

n8n does not update:

```
F-0003 checklist line accepted state
F-0003 readiness
F-0003 PDF/sign lifecycle
```

Those remain Odoo HR workflow actions.

## **F-0003 geometry recalibration note**

The previous F-0003 reviewer signature coordinates were proven against an earlier F-0003 PDF layout.

Because the required document taxonomy, report template, and CSS have since been updated, the old coordinates must not be treated as final.

Before the next F-0003 Sign request is considered locked:

1. regenerate F-0003 from the updated checklist;  
2. confirm the PDF layout and signature block;  
3. manually place/test the reviewer signature field in Odoo Sign;  
4. record the new page/posX/posY/width/height values;  
5. update the native Sign profile documentation and implementation.

### **Pass 6E closure note — F-0002 native Sign lifecycle**

Pass 6E is accepted as the F-0002 native Odoo Sign retrofit and hardening slice.

Accepted behavior:

* F-0002 PDF generation works from the interview record.  
* Native Odoo Sign send works for the interviewer.  
* Signed PDF and certificate are received through Odoo Sign.  
* Sync closes both the source interview record and the recruitment document registry row.  
* Generated, sent, and signed dates are populated chronologically on fresh records.  
* Generate and Send buttons are hidden after the lifecycle advances.  
* Download helpers are available for generated and signed artifacts.  
* Interview input/scoring fields are readonly after generation.  
* Regeneration over an existing generated or signed F-0002 artifact is blocked.

Important rule:

Corrected evaluations should be handled by creating a new interview evaluation record, not by regenerating over an already generated or signed evidence artifact.

Temporary repair actions created for fake test records are not part of the production workflow and should not remain in module data unless deliberately required for a real migration.

### **Pass 6E implementation lesson**

Pass 6E reinforced the project rule that Rapid Scripted Patch Mode must be used only with strong guardrails.

For future complex workflow patches:

* inspect the current module files first;  
* identify the exact proven reusable pattern;  
* separate lifecycle logic from view logic;  
* avoid broad replacements against generic field names;  
* compile embedded server-action Python before build;  
* validate XML before build;  
* run one fresh end-to-end acceptance test;  
* document the lesson before moving to the next pass.

Pass 6F should use Hybrid Mode:

1. Manual explanatory design first.  
2. Confirm which F-0002/F-0003 Sign pattern elements are reused.  
3. Confirm which F-0004-specific elements differ.  
4. Apply segmented guarded patches only after the design is accepted.

### **Pass 6G — Evaluation gate to Contract Proposal / Preboarding**

Status: design clarified before implementation.

The Evaluation gate closes the Evaluation band and moves the applicant to Odoo’s native Contract Proposal stage.

Accepted target:

* Stage model: `hr.recruitment.stage`  
* Stage name: Contract Proposal / مقترح العقد  
* Stage ID: `5`

Accepted applicant header label:

تهيئة التعاقد

Button placement:

* applicant header;  
* recruitment document registry bound action;  
* not inside the Contract tab.

Gate authority:

* `x_hr.recruitment_document` is the source of truth;  
* visual tab state is not enough;  
* Documents folder/tag state is not enough.

Required signed artifacts:

* F-0002 / `interview_evaluation`;  
* F-0003 / `required_documents_checklist`;  
* F-0004 / `legal_documents_validity_declaration`.

Each must be the latest active row for that document type, with:

* `x_state = signed`;  
* `x_signed_attachment_id` populated.

Cancelled and superseded rows are ignored.

A newer unsigned active artifact blocks the gate even if an older signed artifact exists.

On success:

* write applicant `stage_id = 5`;  
* post chatter;  
* show success toast;  
* unlock future Contract Proposal / Preboarding work by stage position, not by creating downstream documents in 6G.

On block:

* show a sticky warning listing missing/unsigned artifacts;  
* post chatter;  
* do not move the applicant.

Non-scope for 6G:

* no board decision generation;  
* no contract generation;  
* no TOR generation;  
* no F-0007/F-0009 generation;  
* no employee creation;  
* no payroll handoff;  
* no stage persistence automation unless separately scoped.

## **Deferred scope**

The following are explicitly deferred:

* full Odoo Documents folder/tag governance;  
* applicant-to-employee document filing automation;  
* access group/security matrix hardening;  
* automatic Sign completion sync;  
* F-0007/F-0009 generation;  
* board decision generation;  
* official employment contract workflow;  
* TOR reposition/signing;  
* employee handover.

## **Future pass map**

### **Pass 7 — GRC governance reference and decision engine foundation**

Build the reusable GRC foundation before recruitment consumes the board decision workflow.

Pass 7 slices:

- 7A-4 — Unified governance library foundation;
- 7A-5 — Decision template authoring UX;
- 7A-6 — Retire old scaffold surfaces/data;
- 7C — Recruitment decision template seed/setup;
- 7B — Decision instances;
- 7D — Documentation lock.

Core primitives:

- Governance Reference;
- Governance Reference Relation;
- Governance Provision;
- Variable Dictionary;
- Governance Text Pattern;
- Decision Profile;
- Decision Template;
- Decision Instance.

### **7A-5A — Simplify template child-line UX**

Decision Template tabs should become guided setup surfaces, not raw technical tables.

Basis lines list should show mainly:

```
#
صيغة الربط
مرجع حوكمة
بند / حكم
نمط نص
نص مثبت
```

Article lines list should show mainly:

```
#
نمط النص
بند / حكم
رقم المادة
عنوان عربي
يستخدم متغيرات؟
```

Variable rows list should show mainly:

```
المتغير
إلزامي؟
قيمة افتراضية
نموذج المصدر
حقل المصدر
```

Technical/copy fields remain available in popup/detail forms only where useful.

### **7A-5B — Add parent refresh action**

Button label:

```
تحديث القالب
```

English action name:

```
Refresh Template
```

The button runs on `x_grc.decision_template`.

It refreshes:

```
basis lines
article lines
variable bindings
```

No onchange assumption. No per-line buttons. No auto-on-save recursion.

### **7A-5C — Basis line refresh rules**

User selects:

```
صيغة الربط
مرجع حوكمة
بند / حكم optional
نمط نص optional
```

Action fills:

```
x_name
x_basis_type
x_relationship_phrase_ar
x_relationship_phrase_en
x_reference_text_ar
x_reference_text_en
x_snapshot_text_ar
x_snapshot_text_en
```

`x_name` rule:

```
[صيغة الربط] + " " + [best Arabic substance]
```

Best Arabic substance priority:

```
provision.title_ar
pattern.title_ar
reference.name / reference.summary_ar
manual reference_text_ar
```

Use code only as last fallback.

Basis type derivation:

```
If provision selected → provision.reference.reference_type
Else if reference selected → reference.reference_type
Else if pattern has provision/reference → derive from that
Else → free_text / other
```

### **7A-5D — Article line refresh rules**

User selects:

```
نمط النص
بند / حكم optional
```

Action fills:

```
x_name
x_article_number
x_title_ar
x_title_en
x_body_ar
x_body_en
x_uses_variables
```

`x_name` priority:

```
pattern.title_ar
pattern.name
provision.title_ar
manual title/body summary
```

Code is last fallback only.

### **7A-5E — Variable binding refresh rules**

User selects:

```
المتغير
```

User may manually set:

```
إلزامي؟
قيمة افتراضية
نموذج المصدر
حقل المصدر
```

Action fills snapshot fields:

```
x_name
x_key
x_label_ar
x_label_en
x_value_type
```

`x_name` priority:

```
variable.x_name
variable.x_label_ar
variable.x_key as last fallback
```

### **7A-5F — Source-record UX refresh actions**

Apply the same low-risk UX pattern where useful.

For `x_grc.variable`:

```
تحديث المتغير
```

Rules:

```
If x_name empty → fill from x_label_ar, then x_key as last fallback.
If x_label_ar empty → fill from x_name.
Never modify x_key automatically.
```

For `x_grc.governance_provision`:

```
تحديث البند
```

Rules:

```
If x_name empty → fill from x_title_ar, then x_body_ar summary, then x_code as last fallback.
Do not infer body/title from parent reference.
```

For `x_grc.governance_text_pattern`:

```
تحديث النمط
```

Rules:

```
If x_name empty → fill from x_title_ar, then x_body_ar summary, then x_code as last fallback.
If provision selected and title/body empty → copy provision title/body.
If reference selected and title/body empty → copy reference summary/name.
```

### **7A-5G — Placeholder validation via toast**

`تحديث القالب` scans placeholders in:

```
subject template
basis snapshot/reference text
article body text
```

It checks that each `{key}` exists in the template variable bindings.

If missing keys exist, use a SaaS-safe toast/display notification pattern, not UserError.

Expected behavior:

```
Template is not silently accepted.
User receives a clear notification listing missing keys.
No broken template is treated as ready.
```

## **Updated 7A-6 scope — GRC control-centre navigation and legacy scaffold retirement**

Purpose: refactor active GRC navigation around the new unified governance-reference doctrine and retire old scaffold surfaces from active architecture.

7A-6 is split into:

### **7A-6A — Docs-only lock**

Scope:

```
Update GRC architecture docs before code.
Lock Governance Reference Type helper model.
Lock current vs future menu doctrine.
Lock default landing on Decision Templates.
Lock retirement policy for old scaffold surfaces/data.
```

### **7A-6B — Governance Reference Type helper model**

Scope:

```
Add x_grc.governance_reference_type.
Add x_reference_type_id to x_grc.governance_reference.
Seed law/regulation/framework/standard/policy/procedure/decision/letter/memo/meeting_minutes/contract/free_text/other.
Expose x_reference_type_id in Governance Reference views.
Hide/de-emphasize legacy x_reference_type.
Update refresh logic to use helper type first.
```

Canonical Arabic labels:

```
procedure = دليل إجراءات التشغيل
letter = مراسلة
contract = العقود
```

### **7A-6C — GRC control-centre navigation shell**

Current backed menus:

```
القواعد الحاكمة
    القوانين
    اللوائح
    الأطر
    السياسات
    دليل إجراءات التشغيل

Decisions / القرارات
    القرارات
    قوالب القرارات
    نماذج القرارات

الدليل الجغرافي

الإعدادات
    Functional Taxonomy
        Functional Areas
        Functions
    Governance Taxonomy
        Governance Families
        Governance Types
        Governance Reference Types
        Governance Relations
    Governance Library
        Provisions
        Patterns
        Variables
        References
```

Default landing:

```
Decision Templates / قوالب القرارات
```

Future documented but not yet exposed as dead menus:

```
Procedures
Letters
Contracts
Organisational Structures
Risk
Compliance
```

### **7A-6D — Retire old scaffold surfaces/data**

Scope:

```
Retire old framework/policy/provision/decision/SOP surfaces from active UI.
Retire risk/control/compliance/incident placeholder surfaces if still exposed.
Retire commercial/tender/contract/clause placeholder surfaces if still exposed.
Delete/neutralize old task template and task-template-line seed data.
Remove old task-template/task-line active menus/views/actions where safe.
Keep functional taxonomy and locations intact.
Do not physically delete installed ir.model/ir.model.fields unless safely detached and explicitly scoped.
```

Doctrine:

```
Old framework/policy/SOP/decision/provision concepts are now represented by:
x_grc.governance_reference
x_grc.governance_reference_type
x_grc.governance_reference_relation
x_grc.governance_provision
x_grc.governance_text_pattern
```

Acceptance:

```
GRC navigation is cleaner.
Opening GRC lands on Decision Templates, not old Frameworks.
Typed reference menus work.
Old scaffold menus no longer compete with the new governance library.
No old SOP/task-template seed examples remain active.
Functional Areas, Functions, and Locations remain working.
No traceback.
```

## **Updated 7C scope — User-assisted recruitment decision template setup**

7C is **not** a programmatic seed pass.

It is a guided manual setup workflow using the improved 7A-5 UX.

Scope:

```
Use Governance References already created or create missing ones.
Create/verify needed Governance Provisions if useful.
Create reusable Governance Text Patterns for:
- appointment article
- execution article
- any reusable basis wording if needed
Create/verify Variable Dictionary records.
Complete the existing recruitment decision template:
- subject
- basis lines
- article lines
- variable bindings
Run تحديث القالب.
Resolve any toast warnings for missing placeholders.
Confirm template is ready for instance generation.
```

Target template:

```
قالب قرار مجلس الإدارة بشأن تعيين موظف
```

7C acceptance:

```
Template has clean basis lines.
Template has clean article lines.
Template variables are bound.
No raw/manual duplicate labels are required.
Refresh action populates fields correctly.
No PDF yet.
No instance yet.
```

## **Updated 7B scope — Generic Decision Instance foundation**

7B implements the generic GRC decision runtime. It does not implement recruitment-specific generation.

Core doctrine:

```text
Governance Reference = authority/source
Decision Template = reusable controlled assembly
Decision Instance = case-specific generated decision draft/runtime artifact
```

Do not create:

```text
x_grc.governance_reference_instance
```

Do not store generated runtime decisions directly as:

```text
x_grc.governance_reference
```

A signed issued decision may later be linked or promoted into a Governance Reference of type `decision`, but that is a later archival/governance feature, not the 7B runtime model.

### 7B-0 — Governance Reference usability polish

Scope:

```text
Improve x_grc.governance_reference usability before instance implementation.
```

Recommended additions if technically safe:

```text
Tabs:
- البنود / الأحكام
- العلاقات
- المرفقات والمصدر
- ملاحظات
```

Allowed lightweight fields:

```text
x_source_attachment_id
x_source_url
```

Allowed one2many surfaces if inverse fields already exist or can be added cleanly:

```text
x_provision_ids
x_outgoing_relation_ids
x_incoming_relation_ids
```

Non-scope:

```text
No full Odoo Documents folder/tag governance.
No Documents automation.
No lifecycle authority through attachments.
No chatter dependency unless explicitly scoped.
```

### 7B-1 — Decision Instance models

Add:

```text
x_grc.decision_instance
x_grc.decision_instance_basis_line
x_grc.decision_instance_article_line
x_grc.decision_instance_variable_value
```

### 7B-2 — Main instance fields

Minimum fields:

```text
x_name
x_template_id
x_profile_id
x_family_id
x_type_id
x_state
x_source_model
x_source_res_id
x_title_ar
x_title_en
x_subject_ar
x_subject_en
x_issue_date
x_decision_number
x_decision_year
x_rendered_text_ar
x_rendered_text_en
x_notes
x_active
```

States:

```text
draft
prepared
locked
cancelled
```

### 7B-3 — Instance child lines

Basis snapshot lines:

```text
x_instance_id
x_template_line_id
x_sequence
x_phrase_id
x_relationship_phrase_ar
x_relationship_phrase_en
x_reference_id
x_governance_provision_id
x_pattern_id
x_snapshot_text_ar
x_snapshot_text_en
x_rendered_text_ar
x_rendered_text_en
x_notes
```

Article snapshot lines:

```text
x_instance_id
x_template_line_id
x_sequence
x_article_number
x_title_ar
x_title_en
x_body_ar
x_body_en
x_rendered_body_ar
x_rendered_body_en
x_uses_variables
x_notes
```

Variable value lines:

```text
x_instance_id
x_template_variable_id
x_variable_id
x_key
x_label_ar
x_label_en
x_value_type
x_required
x_default_value_text
x_value_text
x_value_date
x_value_number
x_value_boolean
x_source_model_hint
x_source_field_hint
x_resolved_display_value
x_notes
```

### 7B-4 — Generic actions

On `x_grc.decision_template`:

```text
إنشاء نسخة قرار
```

Creates a draft `x_grc.decision_instance` from the selected template.

On `x_grc.decision_instance`:

```text
تحديث من القالب
تحديث المعاينة
تجهيز القرار
قفل القرار
إلغاء القرار
```

Rules:

```text
تحديث من القالب only works in draft/prepared.
تحديث المعاينة replaces {key} placeholders from variable-value rows.
Missing required values produce display-notification toasts.
قفل القرار is light metadata locking only; strict immutability is deferred.
```

### 7B-5 — 7B acceptance

Acceptance:

```text
Decision Instances menu opens.
A draft instance can be created from the recruitment board decision template.
Instance copies template profile/family/type/title/subject.
Instance copies basis snapshots.
Instance copies article snapshots.
Instance creates variable-value rows.
Manual variable values can be entered.
Preview can be rendered from variable values.
Missing required values produce a clear toast.
No PDF generation exists.
No Odoo Sign exists.
No hr.applicant button exists.
No recruitment document registry row is created.
```


## **Future order remains locked**

```
7A-5: Refresh Template UX
7A-6: Retire old scaffold surfaces/data
7C: Guided manual template setup
7B: Decision instances / instantiate from template
7D: Documentation lock
```

### **Pass 8 — Contract tab + Board Decision consumption**

`hr_recruitment_custom` consumes the GRC decision instance foundation:

```text
Contract tab
→ instantiate board decision for applicant
→ populate applicant/job variable values
→ generate board decision PDF
→ Chairman signs
→ registry document = board_decision signed
→ unlock employment contract preparation
```

### **Pass 9 — Official employment contract workflow**

Implement static/manual employment contract template lifecycle and signing.

### **Pass 10 — TOR / F-0006 reposition and two-signer QWeb pattern**

Gate TOR generation after signed employment contract and implement applicant \+ HR/recruitment manager signing.

### **Pass 11 — Final declarations**

Generate/sign F-0007 and F-0009 using one-signer applicant flow.

### **Pass 12 — Onboard now handover**

Create/link employee, contract, bank, employee ID, and signed artifact history.

### **Pass 13 — Employment lifecycle architecture**

Separate post-recruitment employment lifecycle design.

### **Pass 14 — Documents governance and access framework**

Revisit full Odoo Documents governance, folder/tag policy, filing automation, retention, and access controls after the two-stage recruitment cycle is operational.

## Procedure / SOP terminology lock

For governance reference type `procedure`, use these labels consistently:

- reference type code: `procedure`
- parent/menu heading: دليل إجراءات التشغيل
- filtered view/list label: إجراءات التشغيل
- singular record label: إجراء تشغيل

Do not use دليل إجراءات التشغيل as the singular record label. It is the parent/menu heading for the SOP/procedure library surface.

## Pass 9 — Official Employment Contract QWeb Overlay

Pass 9 is scoped to generate the official employment contract as a recruitment legal artifact using QWeb background PNG overlay.

Locked scope:

- The official government contract pages are used as PNG backgrounds.
- QWeb overlays only dynamic contract values.
- The source government text/layout is not recreated manually.
- Odoo Sign is not part of the default F-0005 contract flow.
- The real-world flow is generated draft PDF → manual print/sign → signed upload → Ministry of Labour accreditation upload.
- The main applicant `العقد` tab follows the organising style of the completed `قرار التعيين` tab.
- The standalone contract cockpit follows the sectioning/button style of the customised decision instance cockpit.
- Native `hr.employee`, `hr.contract`, payroll, and bank handover are prepared for but not executed in Pass 9.

Canonical tracker:

- `docs/modules/hr_recruitment_custom/phase_9_plan_tracker.md`

## Current phase update — Pass 9 locked

Date: 2026-05-23

Pass 9 is now functionally locked.

Completed:

- F-0005 contract snapshot model and applicant contract tab.
- Full seven-page official contract QWeb overlay rendering.
- Manual print/sign/upload lifecycle.
- Signed-copy confirmation.
- Ministry-accredited-copy confirmation.
- Existing recruitment document registry sync without registry schema extension.
- Applicant-level preboarding gate scaffold.
- Arabic translation/UI hardening sufficient for Pass 9 closure.

Explicitly deferred:

- TOR/F-0006 completion.
- F-0007 generation/signing.
- F-0009 generation/signing.
- Native `hr.employee` / `hr.contract` / payroll / bank handover.

Next implementation focus:

```text
Resume preboarding package completion:
1. TOR / F-0006
2. F-0007
3. F-0009
4. Native handover only after the package gate is complete
```
