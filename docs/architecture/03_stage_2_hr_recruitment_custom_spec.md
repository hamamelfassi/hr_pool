# Stage 2 Spec: `hr_recruitment_custom`

## 1. Purpose

`hr_recruitment_custom` is a thin technical extension for native Odoo Recruitment.

It exists to connect the governed intake stage to the native applicant stage and to enrich the applicant record without building a parallel recruitment app.

## 2. Ownership split

### `hr.job`

Baseline vacancy configuration only.

Owns:

- baseline functional area
- baseline function composition
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
3. the request carries `pending / approved / rejected` state
4. a manager or chairman can create the request
5. chairman approval creates the `hr.applicant`
6. the new applicant is linked back to the originating intake record
7. chairman rejection keeps the intake record in stage 1 and returns it to `pooling`

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

- interview evaluation capture
- negotiated job description / ToR support
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
- one negotiated-role field block on `hr.applicant`
- one baseline field block on `hr.job`
- one conversion action that consumes an approved request
- optional smart buttons only if they materially improve usability

## 8. Recommended implementation order

1. create the conversion request model or request action contract
2. create the approved conversion action that writes `hr.applicant`
3. add read-only backlinks on the applicant and intake records
4. add negotiated applicant fields on `hr.applicant`
5. add baseline fields on `hr.job`
6. add interview/evaluation and document/sign flows

## 9. Translation delivery

For every stage-2 release:

- add or update Arabic PO files in the module
- translate all new field labels, view strings, action names, and report strings
- keep the translation files inside the uploadable module zip

## 10. Install/test checklist

Before stage-2 install:

- stage-1 intake is already installed and working
- `hr_recruitment` is installed
- `grc_backbone` is installed
- translation files are present

After stage-2 install:

- `hr.job` form shows only the minimal governed baseline fields
- `hr.applicant` form shows negotiated role fields
- conversion creates a real applicant
- applicant points back to the pool record
- native chatter and activities remain intact
