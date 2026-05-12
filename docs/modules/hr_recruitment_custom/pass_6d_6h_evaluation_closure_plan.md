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

## **8\. Pass 6G — Evaluation gate action**

### **Objective**

Add the authoritative guarded action that moves an applicant to Contract Proposal / Preboarding only after Evaluation-stage documents are signed.

### **Gate condition**

Latest active registry artifacts must be signed:

```
interview_evaluation
required_documents_checklist
legal_documents_validity_declaration
```

### **Scope**

* guarded applicant action;  
* safe search for Contract Proposal / Preboarding stage;  
* clean toast if blocked;  
* chatter on success or blocked attempt;  
* no native stage schema changes.

### **Acceptance**

* gate blocks if any required artifact is unsigned;  
* gate succeeds only when all three are signed;  
* applicant moves to Contract Proposal / Preboarding;  
* gate does not depend on Documents folders, tags, or visual tab state.

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

### **Pass 7**

GRC decision-template foundation.

### **Pass 8**

Contract tab and board decision.

### **Pass 9**

Official employment contract workflow and manual/static PDF signing pattern.

### **Pass 10**

TOR / F-0006 reposition and two-signer QWeb Sign pattern.

### **Pass 11**

F-0007 and F-0009 final declarations.

### **Pass 12**

Onboard now handover.

### **Pass 13**

Employment lifecycle architecture.

### **Pass 14**

Documents governance and access framework.

