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
- baseline job-description composition on `hr.job`
- applicant-specific `hr.applicant` extensions
- negotiated ToR composition on `hr.applicant`
- conversion execution from pool to applicant
- interview and evaluation enrichment
- native Sign and Documents hooks

## 3. Handover rule

The handover from stage 1 to stage 2 must be explicit and reviewable.

Recommended control flow:

1. a conversion request is created from an `hr_pool` record
2. the request references a target `hr.job`
3. the request carries its own `In Progress / Approved / Rejected` state
4. the intake record moves to `Conversion` while the request is in progress
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

## 5. First stage-2 slice: Dynamic ToR and Job Description

The first stage-2 implementation slice should be limited to structured schema and UI composition on native recruitment models.

### `hr.job` baseline Job Description

`hr.job` is the primary authoring surface for the Job Description template.

It should be extended with:

- one `many2one` field to `x_grc.functional_areas`
- one `many2many` field to `x_grc.functions`

Behavior:

- selecting a functional area should overwrite the current selected job functions with the functions belonging to that area
- this overwrite is a quick-populate helper, not a permanent restriction
- users may then manually add more functions from other areas
- the job should still belong to one principal functional area even if its final function composition spans multiple areas

UI:

- the `hr.job` form should gain a `Job Description` tab
- that tab should contain the functional area field and the baseline job functions field

### `hr.applicant` negotiated ToR

`hr.applicant` is the primary authoring surface for the negotiated ToR.

It should be extended with:

- a child line model for negotiated applicant functions
- line-level ability to select one functional area
- line-level ability to select one function filtered by the chosen functional area

Behavior:

- when an applicant is created from a linked `hr.job`, the applicant function lines should inherit from the selected baseline job functions
- if the job has no baseline functions configured, applicant creation must still succeed with zero inherited lines
- recruiters may then add, remove, or adjust applicant function lines during negotiation

UI:

- the `hr.applicant` form should gain a `Role and Duties` tab
- that tab should expose the negotiated function lines for editing

### Extensibility rule

The applicant function line model should be designed for future enrichment, including:

- line-level comments
- granular task or template lookups
- additional governance or evaluation metadata

### Out of scope for the first slice

The first slice should not yet implement:

- document generation
- Sign workflows
- document routing
- final rendered ToR or Job Description outputs

## 6. Delivery rule

Each stage must be delivered as:

- spec
- code
- install
- test
- translation update
- only then the next stage

This prevents drift between documentation, module code, and the installed database.
