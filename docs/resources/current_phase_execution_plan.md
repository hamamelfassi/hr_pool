# Current Phase Execution Plan — Pass 7 GRC Governance Reference and Decision Engine Foundation

## Active phase override

Pass 6 Evaluation-stage closure has been accepted sufficiently to proceed to Pass 7.

The current phase is now:

`Pass 7 — GRC governance reference and decision engine foundation`

Immediate next slice:

`7A-4 — Unified governance library foundation`

Pass 7 is no longer a minimal recruitment-only decision-template pass. It is a structural GRC refoundation pass that establishes the reusable Governance Reference / Provision / Text Pattern / Variable / Decision Template architecture before recruitment consumes the board decision workflow.

## Status

Pass 6A is complete, committed, and pushed.

Pass 6B is complete, committed, and pushed.

Pass 6C is complete and functionally locked.

Locked from 6A–6C:

- F-0003 canonical document taxonomy.
- Structured submission/checklist fields.
- Conditional structured submission views by document code.
- Controlled standalone checklist and submission views.
- Submission request/request-line models.
- Request-line generation from outstanding public checklist lines.
- Fillout continuation URL generation.
- Refreshable candidate snapshot before send.
- Open URL action.
- Send request email action.
- Mark manually sent action.
- Public Fillout/n8n writeback probe.
- Multi-section writeback including structured data and bank-information exception.
- n8n creates submitted evidence only; Odoo HR review remains authoritative.

## Current next pass

## Current next pass

Pass 7A-4 — Unified governance library foundation in `grc_backbone`.

Scope:

- add governance reference relations;
- add governance provisions;
- add governance text patterns;
- extend decision basis/article lines to select references, provisions, and patterns;
- prepare the clean foundation for SaaS-safe template authoring.

No recruitment code changes in 7A-4.

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