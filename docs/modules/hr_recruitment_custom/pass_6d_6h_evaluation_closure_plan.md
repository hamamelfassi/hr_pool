# Pass 6D–6H — Evaluation Stage Closure Plan

**Module:** `hr_recruitment_custom`  
**Environment:** Odoo.com Enterprise SaaS 19.2  
**Scope owner:** MCEP Marsellia recruitment-to-employment IMS stream  
**Patch posture:** surgical repo patches only; no assistant-generated module zips unless explicitly requested

---

## 1. Purpose

This document records the corrected Pass 6D–6H scope.

The original Pass 6D idea was document storage governance, attachment classification, and applicant folder strategy. That work is now deferred because Odoo Documents already provides enough vanilla centralization and search for the current phase.

The current priority is to close the Evaluation / Interviews stage before Pass 7 begins.

The Evaluation stage is complete only when the following registry artifacts are signed:

1. F-0002 Interview Evaluation;
2. F-0003 Required Documents Checklist;
3. F-0004 Legal Documents Validity Declaration.

Only then may the applicant move to Contract Proposal / Preboarding.

---

## 2. Scope correction

### 2.1 Deferred Documents governance

Deferred until after the two-stage recruitment-to-employment cycle is complete:

- Documents folder strategy;
- applicant-specific folder automation;
- tag governance;
- retention policy;
- access group / confidentiality matrix;
- applicant-to-employee file transition;
- custom Documents indexing automation.

Odoo Documents remains available as a native filing/search surface, but it is not the authority for recruitment lifecycle state.

### 2.2 Current authority

The authoritative lifecycle registry remains:

`x_hr.recruitment_document`

The operational evidence model remains:

`x_hr.applicant_required_document_submission`

The F-0003 checklist model controls F-0003 readiness and generation.

The Evaluation gate reads registry state only.

---

## 3. Locked patterns reused

### 3.1 QWeb PDF pattern

All generated Evaluation-stage forms use the locked QWeb report pattern:

- stored snapshot values where legally relevant;
- explicit normalization before rendering;
- Arabic-first layout;
- stable font/logo/header/footer pattern;
- fixed signature geometry;
- generated PDF attachment linked to source and registry.

### 3.2 Native Odoo Sign pattern

F-0003 proved the native Sign flow:

```text
Generated QWeb PDF
→ dynamic sign.template
→ sign.document from generated PDF attachment
→ sign.item with calibrated coordinates
→ sign.send.request + signer row
→ send_request()
→ linked sign.request stored on registry
→ signer completes native Odoo Sign
→ manual Sync Signed Result
→ signed PDF/certificate copied to applicant
→ source record and registry marked signed
```

This pattern is reused for F-0002 and F-0004.

### **3.3 Explicit sync rule**

Native Sign completion does not automatically close the recruitment registry.

HR uses Sync Signed Result.

The registry closes only when the full `sign.request` is signed.

---

## **4\. F-0003 geometry recalibration**

The previous F-0003 reviewer signature coordinates were proven against an earlier generated PDF layout.

Because the required document taxonomy, template, and CSS changed, those coordinates are historical only.

Before F-0003 Sign placement is locked again:

1. regenerate F-0003 from the updated checklist;  
2. inspect the generated PDF;  
3. manually place the reviewer signature in Odoo Sign;  
4. record updated page/posX/posY/width/height;  
5. patch the native Sign send action;  
6. update the Sign workflow wiki.

Lifecycle pattern is locked. Coordinate profile is pending recalibration.

---

## **5\. Pass 6D — UI/UX polish \+ translations**

### **Objective**

Clean up the Documents/Submissions user experience and close Pass 5/6 translation debt before implementing the remaining Evaluation-stage generation/signing work.

### **Scope**

* Documents tab polish;  
* Submissions tab polish;  
* Submission Request form polish;  
* Request Line form polish;  
* controlled download buttons where missing;  
* attachment fields hardened with readonly/no-open/no-create options where lifecycle-locked;  
* Arabic translations for Pass 5/6 fields, buttons, reports, states, and server-action messages.

### **Non-scope**

* no Documents app folder/tag automation;  
* no security/access matrix;  
* no F-0004 generation;  
* no F-0002 Sign retrofit;  
* no Evaluation gate action.

### **Acceptance**

* Existing F-0003 checklist and submissions remain functional.  
* UI is clearer for HR review.  
* Attachments are safer to view/download.  
* Arabic labels materially improve across Evaluation-stage surfaces.  
* No Fillout/n8n writeback regression.

---

## **6\. Pass 6E — F-0002 native Sign retrofit**

### **Objective**

Bring F-0002 to the same native Sign lifecycle standard proven by F-0003.

### **Scope**

* send generated F-0002 PDF through native Odoo Sign;  
* one signer: interviewer;  
* dynamic Sign template/document/item;  
* calibrated interviewer signature coordinates;  
* linked `sign.request` stored on registry;  
* manual Sync Signed Result;  
* signed PDF and certificate copied to applicant;  
* source interview record and registry marked signed;  
* duplicate send prevention;  
* manual fallback preserved where present.

### **Acceptance**

* F-0002 Sign request is created and sent.  
* Correct interviewer receives the request.  
* Signed result sync closes both source and registry.  
* Certificate is copied when available.  
* Duplicate send is blocked.  
* F-0002 registry state can be trusted by the Evaluation gate.

---

## **7\. Pass 6F — F-0004 declaration generation \+ native Sign**

### **Objective**

Implement F-0004 Legal Documents Validity Declaration in the Declarations tab and close it through the one-signer native Sign pattern.

### **Scope**

* F-0004 source surface in Declarations tab;  
* generated QWeb PDF;  
* registry document type `legal_documents_validity_declaration`;  
* one native Sign signer for Pass 6F: applicant;  
* HR/recruitment review fields stored/printed where needed;  
* Sync Signed Result closes source and registry.

### **Non-scope**

* no F-0007;  
* no F-0009;  
* no two-signer native Sign flow unless explicitly re-scoped.

### **Acceptance**

* F-0004 source record can be prepared.  
* F-0004 generated PDF is stable.  
* Applicant can sign via native Odoo Sign.  
* Sync closes source and registry.  
* F-0004 can be read by the Evaluation gate.

---

### **8\. Pass 6G — Evaluation gate action**

### **Objective**

Add the authoritative guarded action that closes the Evaluation band and moves an applicant to Odoo’s native Contract Proposal stage.

Operational Arabic label:

تهيئة التعاقد

This label maps to Odoo’s Contract Proposal stage while also carrying the intended preboarding meaning.

### **Evaluation band**

The following Odoo recruitment stages are treated as the flexible Evaluation band:

* Qualification / التأهيل  
* First Interview / المقابلة الأولى  
* Second Interview / المقابلة الثانية

Users may move applicants within this band according to operational reality.

The registry, not the stage alone, remains the authority for documentary completion.

### **Target stage**

The Evaluation gate moves the applicant to:

* Odoo model: `hr.recruitment.stage`  
* Target stage: Contract Proposal / مقترح العقد  
* Confirmed stage ID: `5`

Implementation should use the confirmed stage ID first.

Do not fuzzy-match arbitrary stages such as “contract” or “preboard” unless explicitly re-scoped.

### **Gate condition**

The latest active registry artifacts must be signed:

* `interview_evaluation`  
* `required_documents_checklist`  
* `legal_documents_validity_declaration`

Each required artifact must satisfy:

* latest active registry row exists;  
* `x_state = signed`;  
* `x_signed_attachment_id` exists.

A newer generated, signature-requested, or otherwise unsigned active artifact blocks the gate even if an older signed version exists.

Cancelled and superseded rows are ignored.

### **Button placement**

The gate action appears in two places:

1. `hr.applicant` header, labelled:

تهيئة التعاقد

2. Bound action on `x_hr.recruitment_document`, allowing authorized users to trigger the same gate from the recruitment document registry for the selected document’s applicant.

The gate button must not be placed inside the Contract tab.

The Contract tab is reserved for downstream Contract Proposal / Preboarding document operations, including board decision, employment contract, TOR, and final declarations.

### **Scope**

* applicant header gate action;  
* recruitment document registry bound action;  
* exact target stage ID `5`;  
* registry-based validation;  
* clean toast if blocked;  
* chatter on blocked attempt;  
* stage write on success;  
* chatter on success;  
* no Documents app dependency;  
* no visual tab-state dependency;  
* no downstream contract/decision/TOR generation yet.

### **Non-scope**

* no board decision generation;  
* no contract generation;  
* no TOR generation;  
* no F-0007/F-0009 generation;  
* no employee creation;  
* no `hr.contract` creation;  
* no payroll handoff;  
* no stage persistence automation in 6G-2 unless separately scoped;  
* no change to native Odoo stage schema.

### **Acceptance**

* gate blocks if any required Evaluation artifact is missing, unsigned, or lacks a signed attachment;  
* gate succeeds only when F-0002, F-0003, and F-0004 are signed with signed attachments;  
* applicant moves to stage ID `5`;  
* applicant header button appears as “تهيئة التعاقد”;  
* same gate is available from the recruitment document registry;  
* Contract tab does not contain the Evaluation gate button;  
* chatter records blocked and successful attempts;  
* no Documents folder/tag dependency;  
* no Odoo traceback.

### **Future hardening**

Stage persistence / anti-manual-regression should be handled in a later sub-slice only after design confirmation.

Possible future fields:

* `x_evaluation_gate_closed`  
* `x_evaluation_gate_closed_on`  
* `x_evaluation_gate_closed_by_user_id`  
* `x_recruitment_lifecycle_phase`

Possible future behavior:

* if Evaluation gate is closed and a user manually moves the applicant back into the Evaluation band, a guarded automation can restore Contract Proposal or show a warning.

This should not be mixed into the first 6G implementation unless explicitly accepted.

---

## **8A. Contract Proposal / Preboarding doctrine**

Odoo’s native Contract Proposal stage is used as the project’s Preboarding operating stage.

This stage is not limited to generating a simple contract proposal. It is the controlled preboarding workspace where the company prepares and signs the remaining documents required before the applicant can become an employee.

### **Purpose**

Contract Proposal / Preboarding allows the Chairman, HR Manager, recruitment users, and authorized supervisors to complete the remaining signed documentary controls without forcing a rigid document order that does not match operational reality.

### **Registry authority**

The recruitment document registry remains the source of truth.

The stage shows where the applicant is in the lifecycle. The registry proves which documentary controls are complete.

### **Documents expected in Contract Proposal / Preboarding**

The following registry artifacts are expected downstream:

* `board_decision`  
* `employment_contract`  
* `tor`  
* `policies_compliance_declaration`  
* `non_disclosure_agreement`

Document codes / forms:

* Board Decision  
* Official employment contract government template  
* F-0006 TOR  
* F-0007 policies/internal regulations declaration  
* F-0009 confidentiality / non-disclosure declaration

### **Internal control gates**

Inside Contract Proposal / Preboarding, the process should be flexible but still controlled.

The first internal gate is Chairman control over the board decision:

* only the Chairman or authorized Chairman-equivalent role may generate/sign the board decision;  
* signed board decision unlocks official employment contract preparation/sending.

The second internal gate is completion of the employment contract signature flow:

* contract may involve Chairman/company representative and applicant;  
* contract completion is an internal control point;  
* final applicant handoff still waits for all required preboarding artifacts.

### **Flexible document ordering**

TOR and final declarations may be completed before or after the board decision and contract, depending on operational requirements.

This is intentional.

The lifecycle should support:

* TOR preparation during negotiation;  
* TOR preparation after contract drafting;  
* F-0007/F-0009 reading and acceptance before or after contract preparation;  
* structured use of applicant evidence already approved during Evaluation.

The registry controls final movement. It should not force unnecessary rigid ordering inside the Contract Proposal stage except where Chairman authority is required.

### **Final Preboarding gate**

Movement from Contract Proposal to Odoo’s native Contract Signed stage is governed by a later gate.

The final preboarding gate condition is expected to require signed registry artifacts for:

* board decision;  
* employment contract;  
* TOR / F-0006;  
* F-0007;  
* F-0009.

This final gate will later trigger the employee/contract/payroll/onboarding handoff.

The final handoff is out of scope until the full recruitment-to-employment pass sequence is complete.

---

## **9\. Pass 6H — Regression and lock**

### **Objective**

Run the end-to-end Evaluation closure test and lock Pass 6\.

### **Test flow**

1. Create/select applicant.  
2. Conduct/generate F-0002.  
3. Send F-0002 via native Sign.  
4. Sign and sync F-0002.  
5. Review/accept required document submissions.  
6. Validate F-0003 readiness.  
7. Regenerate F-0003 from updated template.  
8. Recalibrate F-0003 signature geometry if needed.  
9. Send F-0003 via native Sign.  
10. Sign and sync F-0003.  
11. Generate F-0004.  
12. Send F-0004 via native Sign.  
13. Sign and sync F-0004.  
14. Run Evaluation gate.  
15. Confirm applicant reaches Contract Proposal / Preboarding.

### **Acceptance**

* no Odoo traceback;  
* all three Evaluation-stage registry artifacts are signed;  
* gate succeeds;  
* no regression to public writeback;  
* Arabic UI is acceptable for current stage;  
* generated PDFs, screenshots, dist zips, and temporary files are not committed.

---

## **10\. Future pass continuity**

After 6H lock:

### **Pass 7 — GRC decision-template foundation**

Build reusable decision-template primitives in `grc_backbone`.

This should include template structure, basis/preamble, article lines, variables, and recruitment board decision seed data.

The board decision should not be hacked directly into recruitment without reusable GRC primitives.

### **Pass 8 — Contract Proposal / Preboarding surface**

Build the Contract Proposal operational workspace inside `hr_recruitment_custom`.

This pass should expose the downstream preboarding registry artifacts and tab structure, but only implement a tightly scoped first artifact if accepted.

Expected artifact families:

* board decision;  
* employment contract;  
* TOR / F-0006;  
* F-0007;  
* F-0009.

The Contract tab becomes the working surface for this stage.

### **Pass 9 — Board decision control gate**

Implement board decision generation/signing using the GRC decision-template foundation.

Chairman signing of the board decision acts as the first internal control gate inside Contract Proposal / Preboarding.

Signed board decision unlocks official employment contract preparation/sending.

### **Pass 10 — Official employment contract workflow**

Implement the official employment contract workflow using the government template/manual-static PDF pattern.

Expected registry artifact:

* `employment_contract`

Expected control principle:

* contract completion is required before final preboarding handoff;  
* Chairman/company representative signature remains an internal authority gate.

### **Pass 11 — TOR / F-0006 and final declarations**

Implement TOR / F-0006 and the final declarations:

* F-0006 TOR;  
* F-0007 policies/internal regulations declaration;  
* F-0009 confidentiality / non-disclosure declaration.

The exact order may remain flexible inside Contract Proposal / Preboarding, but all must be signed before movement to Contract Signed.

### **Pass 12 — Final Preboarding gate and handover**

Add the final gate from Contract Proposal to Contract Signed.

Expected gate condition:

* board decision signed;  
* employment contract signed;  
* TOR / F-0006 signed;  
* F-0007 signed;  
* F-0009 signed.

Expected effect:

* move applicant to Contract Signed;  
* trigger employee / contract / payroll / onboarding handoff design;  
* link or create `hr.employee`;  
* link or create `hr.contract`;  
* preserve signed artifact history.

### **Pass 13 — Employment lifecycle architecture**

Separate employment lifecycle track after recruitment-to-employment handoff.

Do not mix this into recruitment gate work.

### **Pass 14 — Documents governance and access framework**

Move the deferred Documents governance work here:

* folder/tag policy;  
* applicant/employee document transition;  
* confidentiality classes;  
* access groups;  
* management access framework;  
* Documents automation;  
* retention rules.

This belongs after the full two-stage cycle exists.
