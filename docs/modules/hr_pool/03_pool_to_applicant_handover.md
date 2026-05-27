# Pool to Applicant Handover

## Purpose

This document defines the Stage 1 to Stage 2 handover owned by `hr_pool`.

`hr_pool` owns the public-intake record and its controlled conversion into `hr.applicant`.

It does not own the later applicant-to-employee handover. That handover is owned by `hr_recruitment_custom`, because the action starts from the ready `hr.applicant`.

## Scope

The `hr_pool` handover must carry validated candidate intake data into `hr.applicant`, including:

- candidate identity and contact details;
- source intake traceability;
- education, employment, skills, languages, and commitments where already implemented;
- profile photo;
- candidate consent and declaration markers;
- any validated source attachments needed in Stage 2 recruitment.

## Photo handover

Canonical source field token:

```text
x_hr.pool.x_profile_photo
```

Documentation shorthand token:

```text
hr_pool.x_profile_photo
```

Canonical flow:

```text
x_hr.pool.x_profile_photo
→ hr.applicant applicant photo field
```

If `hr.applicant` has no suitable image field, the implementation must add one before the final applicant-to-employee handover is attempted.

## Formlet / Fillout / Zite implication

The public intake payload must continue to provide the candidate photo as a binary/image-capable source.

Current external intake may be Fillout + Zite + n8n. Future intake may move to Marsellia-owned formlets.

Regardless of intake surface, Odoo remains the source of truth after writeback.

## Traceability

The conversion should preserve:

- source pool record;
- source system;
- submission ID or record ID;
- conversion request/approval metadata;
- chatter note on pool record and applicant record.

## Boundary

This document stops at:

```text
x_hr.pool → hr.applicant
```

The next handover is:

```text
hr.applicant → hr.employee / hr.contract / res.partner.bank
```

and is owned by:

```text
docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md
```
