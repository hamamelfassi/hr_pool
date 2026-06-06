# Current Phase Execution Plan

## Current locked phase

Pass 14 is the employment lifecycle documentation and implementation-readiness lock.

Pass 14 does not implement Odoo module code. It creates the documentation, ownership boundaries, execution controls, and Pass 13 implementation plan required before returning to code.

## Closed passes

- Pass 10 — F-0006 / الوصف الوظيفي native Odoo Sign lifecycle and UI cleanup.
- Pass 11 — F-0007 and F-0009 declaration lifecycle.
- Pass 12 — final employment readiness gate.
- Pass 14A — employment lifecycle documentation foundation.
- Pass 14B — Pass 13 handover mapping, bank/payroll readiness, IBAN doctrine.
- Pass 14C — documentation consolidation and module ownership correction.
- Pass 14D — consolidated employment lifecycle process specifications.
- Pass 14E — UI, artifact, Sign, activity, chatter, and mobile-safe doctrine.

## Final Pass 14 slice

Pass 14F closes the documentation phase by adding implementation execution controls.

Pass 14F deliverables:

1. update this current execution plan;
2. create a reusable pass execution plan template;
3. create the live Pass 13 implementation plan;
4. sanity check ownership and references;
5. commit and close Pass 14.

## Module ownership boundaries

### `hr_pool`

Owns Stage 1 public intake and pool-to-applicant handover.

Current handover doc:

```text
docs/modules/hr_pool/03_pool_to_applicant_handover.md
```

Scope:

- public intake source fields;
- Fillout/Zite/n8n/formlet payload implications;
- pool-to-applicant conversion;
- candidate photo propagation from `x_hr.pool.x_profile_photo` to the applicant photo field;
- Stage 1 traceability.

### `hr_recruitment_custom`

Owns Stage 2 recruitment/preboarding and applicant-to-employment handover.

Pass 13 implementation is owned here because the action starts from `hr.applicant`.

Current handover doc:

```text
docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md
```

Current implementation plan:

```text
docs/modules/hr_recruitment_custom/pass_13_implementation_plan.md
```

Scope:

- final readiness guard;
- On-board Now / بدء التوظيف action;
- applicant to `hr.employee`;
- applicant/F-0005 to `hr.contract`;
- applicant bank data to native `res.partner.bank`;
- IBAN field handling;
- employee bank account linking;
- signed recruitment/preboarding artifact handover to employee chatter/files;
- no payroll processing.

### `hr_employment_custom`

Owns employee lifecycle after the employee and payroll-ready contract footprint exist.

Current module docs:

```text
docs/modules/hr_employment_custom/
```

Scope:

- employee declarations;
- custody/assets;
- training/certifications;
- leave overlays;
- administrative permissions;
- work assignments;
- appraisals;
- separation;
- clearance/offboarding;
- lifecycle artifact/signing/activity/chatter/mobile-safe patterns.

It does not own the Pass 13 applicant exit action.

## Next implementation phase

After Pass 14 closes:

```text
Pass 13 — Recruitment to Employment Handover
```

Primary module:

```text
hr_recruitment_custom
```

Exception slice:

```text
13B — photo handover repair in hr_pool if applicant photo propagation from Stage 1 is missing
```

Target output:

- linked `hr.employee`;
- linked native `hr.contract`;
- native `res.partner.bank` linked to employee;
- IBAN written to the bank record where available;
- signed artifacts copied to employee chatter/files;
- applicant marked as onboarded/handed over;
- no payslips generated;
- no live employee lifecycle workflows created yet.

## Implementation method

Each implementation pass must use the live pass execution plan method:

1. define pass scope and slices before patching;
2. implement slices using small pypatch/script segments;
3. run repo sanity checks after each slice;
4. build the relevant module zip locally;
5. install/upgrade in Odoo;
6. record acceptance results and lessons learned by appending to the pass plan;
7. commit only after functional acceptance.

Reusable template:

```text
docs/resources/pass_execution_plan_template.md
```

## Immediate next action after Pass 14F

Begin Pass 13 by opening:

```text
docs/modules/hr_recruitment_custom/pass_13_implementation_plan.md
```

Then start with:

```text
13A — Preflight and dependency inspection
```

<!-- R10_CURRENT_REFINEMENT_PHASE_LOCK -->
## Current refinement phase — R1 to R10 documentation lock

The current active phase is the `hr_recruitment_custom` repair/refinement closure following the R1–R8 implementation sprint.

### Closed repair/refinement slices

- R1 — F-0003 checklist lifecycle repair.
- R2 — document checklist/submission request workflow and partial submission handling.
- R3 — evaluation tab UX and translation cleanup.
- R4 — responsibilities/TOR UX cleanup.
- R5 — declaration and late-stage gate visibility hardening.
- R6 — contract proposal gate and late-stage tab layout stabilization.
- R7 — translation, toast, helper alert, chatter, model/field translation lock.
- R8 — Sign request label and applicant anchoring hardening.

### Deferred slice

- R9 — canonical document reference, sequence, and filename normalization.

R9 is deferred to a later higher-level refinement pass because it affects record naming, generated/signed filenames, Sign request labels, registry references, and possible migration/backfill strategy.

### Current slice

- R10 — documentation lock.

R10 records the implemented repairs and the deferred backlog. It should not introduce new workflow logic.

### Post-R10 production-testing note

Before production deployment, run fresh Sign flow tests for:

- F-0002
- F-0003
- F-0006
- F-0004
- F-0007
- F-0009
- Board Decision

If native Sign smart-button leakage persists, use the approved fallback: a custom filtered recruitment Sign Requests surface driven by `x_hr.recruitment_document`, not further fragile native smart-button patching.
