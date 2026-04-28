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

## 9. TOR PDF and signing slice

### Business purpose

The negotiated ToR for an applicant must become a formal document that:

- is generated from `hr.applicant`
- is prefilled as much as possible from live recruitment data
- is sent to the applicant for digital signature before employee handoff
- returns as a signed artifact attached to the applicant record

This ToR is not just a job description printout.

It is a bilingual role-acceptance, duties-acknowledgement, and accountability form aligned to Marsellia form `MCEP-HR-F-0006`.

### Canonical generation approach

The canonical source document should be a `QWeb`-generated PDF, not a direct fill-in of a legacy static PDF.

Reasons:

- the negotiated duties table is dynamic
- duties should be grouped by functional area
- Arabic-first rendering needs layout control
- the generated output should remain reproducible from applicant data
- the same generated PDF can then be routed into native Odoo Sign

The original PDF form remains the visual reference, not the primary data-rendering engine.

### Source-of-truth rule

The ToR PDF must be generated from `hr.applicant` as the self-contained source of truth.

That means key identity and role fields required by the form should be normalized onto `hr.applicant` before or during document generation, rather than being rendered through fragile cross-model lookups at print time.

`hr.job` and `hr_pool` remain upstream sources, but the applicant record should hold the final printable state.

### Form mapping for first implementation

For the first implementation slice, the form should be prefilled like this:

- `Recipient Name`: `hr.applicant.partner_name`
- `Employee ID`: blank
- `Department`: linked `hr.job.department_id`
- `Job Title`: linked `hr.job.name`
- `Direct Supervisor`: blank
- `Date of Receipt`: blank in the generated PDF, completed through signing or manual follow-up
- `Duties Table`: negotiated applicant duty lines from `x_role_and_duty_line_ids`
- `Responsible Manager`: blank for now
- `Employee Name / Signature / Date`: applicant sign flow

### Duties rendering rule

The negotiated duties table should:

- render from `hr.applicant.x_role_and_duty_line_ids`
- group rows by functional area
- print the negotiated function titles under each area
- remain visually clean even when sections expand

Future versions may extend each line with comments, granular task-template detail, or richer grouped formatting, but the first document slice should print grouped function titles only.

### Visual standard

The generated PDF should be:

- Arabic-first
- visually equivalent to form `0006`
- close to the original layout, style, and declaration text
- flexible enough to render dynamic duty rows cleanly

Exact pixel-perfect replication is not required.

The fixed declaration text should stay very close to the original bilingual form, while dynamic data regions may be adjusted where needed for readability and variable-length values.

### Applicant-side signing workflow

The first signing slice should stay deliberately simple:

1. recruiter finalizes negotiated duties on `hr.applicant`
2. recruiter clicks a visible applicant-form button to generate the ToR PDF
3. the generated PDF is attached to the applicant record
4. recruiter sends the generated document to the applicant through Odoo Sign
5. applicant signs digitally
6. the signed copy is returned and attached to the applicant record
7. recruiter or HR later prints and countersigns manually outside the automation scope for now

### Button and UX expectations

The applicant form should eventually expose a minimal operational workflow such as:

- `Generate TOR PDF`
- `Send TOR for Signature`
- access to the latest generated and signed copies from the applicant record

Whether the second button directly scaffolds a Sign request in code or is initially supported by precise manual Sign setup guidance may depend on native Odoo limitations, but the user workflow should remain short and repeatable.

### Explicit deferrals

The first TOR document slice should not yet automate:

- manager signature routing
- department-manager inference as the authoritative direct supervisor
- employee ID backfill
- final `hr.employee` handoff gating
- automatic counter-signing
- broader declaration-form automation

These belong to the next document/sign workflow increments.

## 10. Recommended implementation order

1. add baseline Job Description fields and UI on `hr.job`
2. add the negotiated applicant function line model
3. add `hr.applicant` inheritance logic from linked `hr.job`
4. add the `Role and Duties` authoring surface on `hr.applicant`
5. verify conversion still creates a native applicant cleanly
6. normalize printable ToR fields onto `hr.applicant`
7. add the QWeb-generated TOR PDF
8. add the applicant-form document generation button
9. wire the first applicant-side Sign workflow
10. only then add interview/evaluation and broader document/sign flows

## 11. Translation delivery

For every stage-2 release:

- add or update Arabic PO files in the module
- translate all new field labels, view strings, action names, and report strings
- keep the translation files inside the uploadable module zip

## 12. Install/test checklist

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

After the TOR document slice is installed:

- applicant form exposes a clear TOR generation action
- generated PDF is attached to the applicant
- generated PDF is visually close to form `0006`
- department and job title prefill correctly
- employee ID and direct supervisor remain blank by design
- duties render grouped by functional area
- applicant can be sent a Sign request from the generated TOR
- signed document returns to and remains visible from the applicant record
