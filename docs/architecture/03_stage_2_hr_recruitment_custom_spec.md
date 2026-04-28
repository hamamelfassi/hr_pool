# Stage 2 Spec: `hr_recruitment_custom`

## 1. Purpose

`hr_recruitment_custom` is a thin technical extension for native Odoo Recruitment.

It exists to connect the governed intake stage to the native applicant stage and to enrich the applicant record without building a parallel recruitment app.

## 2. Ownership split

### `hr.job`

Baseline vacancy configuration and baseline Job Description authoring.

Owns:

- baseline functional area
- baseline function composition
- job-description template composition
- vacancy-level recruitment configuration

### `hr.applicant`

Applicant-specific runtime record.

Owns:

- negotiated job description / ToR
- negotiated applicant functions
- interview evaluation artifacts
- signature and declaration records
- final applicant-side PDF outputs

## 3. Handover contract

The handover from stage 1 should work like this:

1. a conversion request is created from `x_hr.pool`
2. the request references a target `hr.job`
3. the request carries `in_progress / approved / rejected` state
4. a manager or chairman can create the request
5. chairman approval creates the `hr.applicant`
6. the new applicant is linked back to the originating intake record
7. chairman rejection keeps the intake record in stage 1, returns it to `pooling`, and preserves chairman approval on the pool record

The conversion request itself should be auditable and visible, but the actual applicant creation belongs to stage 2 because it touches native recruitment records.

## 4. Module scope

This module should:

- remain `application = False`
- avoid dashboard app behavior
- avoid a separate recruitment menu tree
- inherit native `hr.job` and `hr.applicant` views
- keep the bridge logic minimal and explicit

## 5. Enrichment scope

The first useful enrichment set is:

- negotiated job description / ToR support
- baseline job-description composition on `hr.job`
- negotiated applicant function lines on `hr.applicant`
- interview evaluation capture
- signed declarations
- applicant-side document attachment and retrieval

## 6. Native Odoo features to use

Use these native features as the main path:

- chatter and activities for communication and review trail
- Sign for declaration forms and signature workflows
- Documents for storage and filing
- QWeb reports for generated PDFs
- Recruitment stages for applicant progression

The module should add only the missing linkage and the applicant/job-specific fields.

## 7. First-pass technical additions

The stage-2 first pass should stay narrow:

- one read-only backlink from `hr.applicant` to the originating pool record
- one baseline Job Description block on `hr.job`
- one negotiated ToR line model on `hr.applicant`
- one conversion action that consumes an approved request
- optional smart buttons only if they materially improve usability

## 8. Dynamic ToR / Job Description first slice

### `hr.job` authoring surface

The `hr.job` form should gain a `Job Description` tab.

The first slice should add:

- one `many2one` field from `hr.job` to `x_grc.functional_areas`
- one `many2many` field from `hr.job` to `x_grc.functions`

Behavior:

- choosing the functional area should overwrite the `hr.job` function selection with the functions belonging to that area
- the overwrite is a quick-populate helper
- users may still manually add more functions afterward
- the job belongs to one principal functional area but may ultimately reference functions from multiple areas

This makes the job-level Job Description a governed baseline template rather than a fully negotiated final role definition.

### `hr.applicant` authoring surface

The `hr.applicant` form should gain a `Role and Duties` tab.

The first slice should add a child line model for negotiated applicant functions.

Each applicant-function line should support:

- one functional area field
- one function field filtered by the selected functional area

Future-safe placeholders should be left in the design so the line can later hold:

- comments
- task-template or granular-duty lookups
- additional evaluation or governance metadata

### Inheritance behavior

When an applicant is created from a linked `hr.job`:

- the applicant function lines should inherit from the job's selected baseline functions
- the inherited lines should remain editable for recruiter-side negotiation
- if the linked job has no configured functional area or functions, applicant creation must still succeed with zero inherited lines

### Out of scope for this slice

This first slice should not yet implement:

- QWeb ToR or Job Description rendering
- Sign routing
- document lifecycle automation
- contract or employee downstream automation

Those belong to later stage-2 increments after the schema and UI composition are stable.

## 9. Recommended implementation order

1. add baseline Job Description fields and UI on `hr.job`
2. add the negotiated applicant function line model
3. add `hr.applicant` inheritance logic from linked `hr.job`
4. add the `Role and Duties` authoring surface on `hr.applicant`
5. verify conversion still creates a native applicant cleanly
6. only then add interview/evaluation and document/sign flows

## 10. Translation delivery

For every stage-2 release:

- add or update Arabic PO files in the module
- translate all new field labels, view strings, action names, and report strings
- keep the translation files inside the uploadable module zip

## 11. Install/test checklist

Before stage-2 install:

- stage-1 intake is already installed and working
- `hr_recruitment` is installed
- `grc_backbone` is installed
- translation files are present

After stage-2 install:

- `hr.job` form shows the `Job Description` tab
- functional area overwrite correctly quick-populates baseline functions
- `hr.applicant` form shows the `Role and Duties` tab
- applicant function lines inherit from the linked job when available
- applicant creation still succeeds when the linked job has zero configured functions
- conversion creates a real applicant
- applicant points back to the pool record
- native chatter and activities remain intact
