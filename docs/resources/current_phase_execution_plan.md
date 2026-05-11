# Current Phase Execution Plan — Pass 6B

## Status

Pass 6A is complete, committed, and pushed.

Locked:
- Required document submission model.
- Applicant Submissions tab.
- Submission/checklist identity normalization.
- Internal manual submission creation.
- Accept/reject actions.
- Resubmission requested state.
- Checklist line writeback from accepted submissions.
- Readiness validation reads accepted submissions as source of truth.
- SaaS-safe toast guard pattern for server actions.

## Current next pass

Pass 6B — Submission Request / Continuation Link Foundation.

## Authority

This document supersedes older current-phase notes for active execution.

Read with:

1. `docs/architecture/00_master_architecture_and_program_plan.md`
2. `docs/architecture/01_two_stage_recruitment_program_plan.md`
3. `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
4. `docs/modules/hr_recruitment_custom/pass_5e_f0003_native_sign_lifecycle_plan.md`
5. `docs/modules/hr_recruitment_custom/native_odoo_sign_workflow_wiki.md`
6. `docs/modules/hr_recruitment_custom/report_generation_wiki.md`
7. `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`
8. `docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md`

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

## Pass 6 slices

### 6A — Internal Required Document Submissions Foundation

Complete.

### 6B — Submission Request / Continuation Link Foundation

Current slice.

Sub-slices:

1. 6B-0 — Fillout payload contract documentation.  
2. 6B-1 — F-0003 taxonomy/report alignment.  
3. 6B-2 — Structured submission/checklist fields.  
4. 6B-3 — Request/request-line models.  
5. 6B-4 — Generate request lines and Fillout URL params.  
6. 6B-5 — Applicant UI request surface.  
7. 6B-6 — Send/copy request URL and F-0003 smoke test.

### 6C — Public Fillout/n8n Writeback Probe

Future.

Scope:

* consume Fillout payload;  
* validate request/token;  
* download files;  
* create Odoo attachments;  
* create `x_hr.applicant_required_document_submission` records;  
* update request lines;  
* leave HR accept/reject review in Odoo.

### 6D — Documents Governance \+ Final Hardening

Future.

Scope:

* Odoo Documents folder strategy;  
* applicant document organization;  
* artifact classification;  
* token expiry hardening;  
* duplicate public submission handling;  
* retry/audit improvements if needed.

## Pass 6B locked rules

### F-0003 PDF rule

F-0003 is a checklist/control sheet, not an evidence data report.

The PDF must not print:

* document numbers;  
* bank account;  
* IBAN;  
* issuing authority/place;  
* issue/expiry dates;  
* birth/family/qualification/health evidence data.

The PDF renders all canonical checklist lines with minimal required/accepted indicators.

### Canonical F-0003 document rows

The canonical row set is:

1. CV  
2. Qualification  
3. Birth Certificate  
4. Family Status  
5. Residence Certificate  
6. National ID  
7. Criminal Record  
8. Health Certificate  
9. Passport  
10. ID Card  
11. Driving License  
12. Eight Passport-Size Photos  
13. Non-Duplication Certificate  
14. Bank Information

### Attachment exceptions

`passport_photos`:

* public request disabled;  
* attachment not required;  
* manual HR review expected.

`bank_information`:

* public request enabled;  
* attachment not required;  
* structured data required.

### Fillout/n8n contract

The active payload contract is documented in:

* `docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md`

Routing rule:

```
urlParameters = authoritative for request/routing metadata
questions = authoritative for applicant-filled values and file uploads
```

## Pass 6B non-scope

* No production n8n writeback until 6C.  
* No final Documents app folder governance until 6D.  
* No F-0004 generation.  
* No contract generation.  
* No employee handoff.  
* No applicant cockpit redesign beyond the request UI needed for 6B.

