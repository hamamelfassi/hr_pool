# Two-Stage Recruitment Program Plan

## 1. Goal

This program is split into two deliberately separate stages:

- Stage 1: public candidate intake and pool management in `hr_pool`
- Stage 2: native Odoo Recruitment enrichment in `hr_recruitment_custom` on top of `hr_recruitment`

The goal is to keep intake lean, auditable, and externally ingestible, while letting the actual applicant lifecycle use Odoo's native recruitment features where they already exist.

## 2. Stage ownership

### Stage 1 - `hr_pool`

Owns:

- public form intake
- candidate prescreening
- chairman/reviewer decisions
- intake-phase control
- conversion request initiation
- intake provenance and snapshot reporting

### Stage 2 - `hr_recruitment_custom`

Owns:

- governed `hr.job` extensions
- applicant-specific `hr.applicant` extensions
- conversion execution from pool to applicant
- negotiated job description / ToR support
- interview and evaluation enrichment
- native Sign and Documents hooks

## 3. Handover rule

The handover from stage 1 to stage 2 must be explicit and reviewable.

Recommended control flow:

1. a conversion request is created from an `hr_pool` record
2. the request references a target `hr.job`
3. the request carries its own `Pending / Approved / Rejected` state
4. the intake record moves to `Conversion` while the request is pending
5. the request is approved or rejected by chairman control
6. approval creates the native `hr.applicant`
7. the applicant stores a read-only backlink to the originating intake record
8. rejection returns the intake record to `Pooling`

## 4. Native-feature policy

Use native Odoo features first when they already solve the problem:

- chatter and activities for audit trail and communication
- Documents for file storage and routing
- Sign for declaration and signature flows
- QWeb reports for generated PDFs
- Recruitment stages for applicant progression

Only add custom code when the native app does not provide the needed control or data shape.

## 5. Delivery rule

Each stage must be delivered as:

- spec
- code
- install
- test
- translation update
- only then the next stage

This prevents drift between documentation, module code, and the installed database.
