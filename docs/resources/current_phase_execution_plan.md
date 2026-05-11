# Current Phase Execution Plan — Pass 6C

## Status

Pass 6A is complete, committed, and pushed.

Pass 6B is complete, committed, and pushed.

Locked from 6B:

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
- Generated URL no longer contains a self-referential `generated_url` parameter.

## Current next pass

Pass 6C — Public Fillout/n8n Writeback Probe.

## Authority

Read with:

1. `docs/architecture/00_master_architecture_and_program_plan.md`
2. `docs/architecture/01_two_stage_recruitment_program_plan.md`
3. `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
4. `docs/modules/hr_recruitment_custom/pass_5e_f0003_native_sign_lifecycle_plan.md`
5. `docs/modules/hr_recruitment_custom/native_odoo_sign_workflow_wiki.md`
6. `docs/modules/hr_recruitment_custom/report_generation_wiki.md`
7. `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`
8. `docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md`
9. `docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md`

## Pass 6 goal

Build the public required-document continuation foundation around the F-0003 checklist and the internal 6A submission workflow.

Target flow:

```text
F-0003 checklist
→ submission request
→ request lines for outstanding document slots
→ generated Fillout continuation URL
→ applicant submits files/data
→ n8n creates Odoo submission records
→ HR accept/reject review
→ accepted submissions update checklist lines
→ readiness validation
→ F-0003 PDF/sign
```

## **Pass 6 slices**

### **6A — Internal Required Document Submissions Foundation**

Complete.

### **6B — Submission Request / Continuation Link Foundation**

Complete.

### **6C — Public Fillout/n8n Writeback Probe**

Current slice.

Sub-slices:

1. 6C-0 — n8n writeback contract documentation.  
2. 6C-1 — Odoo-side writeback safety action.  
3. 6C-2 — n8n webhook parser skeleton.  
4. 6C-3 — Odoo lookup and request/token validation.  
5. 6C-4 — Single-section attachment \+ submission writeback probe.  
6. 6C-5 — Multi-section writeback, including bank information.  
7. 6C-6 — End-to-end request/submission/review/readiness test.

### **6D — Documents Governance \+ Final Hardening**

Future.

Scope:

* Odoo Documents folder strategy.  
* Applicant document organization.  
* Attachment classification.  
* Token expiry hardening.  
* Duplicate public submission handling.  
* Retry/audit improvements if needed.

## **Pass 6C locked rules**

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

Most sections require an attachment.

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

## **Pass 6C non-scope**

* No final Documents app folder governance.  
* No automatic HR acceptance.  
* No automatic F-0003 PDF generation.  
* No automatic Odoo Sign send.  
* No F-0004 generation.  
* No contract generation.  
* No employee handoff.