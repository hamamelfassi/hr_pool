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
- canonical applicant-side printable identity fields such as `x_gender` and `x_national_id`
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
- applicant-side printable identity normalization
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

For printable identity fields shared across later forms, `hr.applicant` should canonically own:

- `x_gender`
- `x_national_id`

`passport number` remains intentionally deferred until the later required-documents slice.

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

### Delivered QWeb pattern to preserve

The currently successful TOR generation pattern that should be preserved for future generated HR forms is:

- applicant-side printable snapshot fields on `hr.applicant`
- explicit reseeding of printable snapshot values immediately before PDF generation
- grouped duty-line snapshot text stored on child lines instead of relying on live translated relational display at render time
- Arabic-first QWeb output with embedded inline Arabic font data
- a visual-reference approach using the legacy Marsellia PDF as a layout guide rather than as the rendering engine
- generated PDF attachment back to the source applicant record with chatter logging and versioned replacements

Temporary diagnostic utilities such as font-probe reports should not remain exposed in the final recruiter UI once a stable rendering pattern has been confirmed.

### Applicant-side signing workflow

The first signing slice should stay deliberately simple:

1. recruiter finalizes negotiated duties on `hr.applicant`
2. recruiter clicks a visible applicant-form button to generate the ToR PDF
3. the generated PDF is attached to the applicant record
4. recruiter opens the generated PDF from the applicant record
5. recruiter uploads that exact rendered PDF into Odoo Sign as a one-off document
6. recruiter places the applicant signature field manually in the final rendered signature block
7. recruiter assigns the signer from `hr.applicant.email_from`
8. applicant signs digitally from the Odoo Sign email
9. recruiter links or uploads the signed copy back to the applicant record
10. recruiter or HR later prints and countersigns manually outside the automation scope for now

### Recruiter manual Sign steps

The expected recruiter-side manual workflow for the currently delivered slice is:

1. open the applicant record
2. confirm the `TOR Header` values are correct
3. click `Generate TOR PDF`
4. open the latest generated TOR attachment from applicant Files/Chatter
5. download that PDF if needed, or otherwise use it as the exact source document for Odoo Sign
6. create a new one-off Sign request in Odoo Sign using that generated TOR PDF
7. add one signer using the applicant email from `hr.applicant.email_from`
8. place the applicant signature field and applicant date field manually on the rendered signature block
9. send the Sign request
10. once the applicant signs, download or retrieve the signed PDF from Odoo Sign
11. upload that signed PDF back to the applicant record Files/Chatter
12. set the `Signed TOR PDF` field on the applicant so the ToR lifecycle can be marked as signed

This manual flow is intentional for the current slice because the ToR document length is dynamic and therefore the final signature area is not yet fixed enough for stable automated Sign field placement.

### Next signing slice: fixed final signature page

The next TOR signing slice should modify the generated QWeb document so that it always ends with a dedicated final signature page.

That final page should contain:

- the printed applicant name
- a fixed applicant signature block
- a fixed applicant date block
- the printed responsible-manager name placeholder
- a fixed responsible-manager signature block
- a fixed responsible-manager date block
- any final declaration text that must remain adjacent to signature acceptance

The applicant duties pages above this final page may continue to grow or shrink, but the final signature page itself must remain layout-stable.

### Why the fixed signature page is necessary

Odoo Sign places fields on a PDF by page and coordinates.

That means:

- a reusable Sign template is reliable only when the target signature area appears on a predictable page in a predictable location
- the current variable-length ToR body makes direct template-style field placement unreliable
- a dedicated fixed final signature page solves this by stabilizing the applicant signature geometry

### Target automated signing behavior after the fixed page slice

Once the fixed final signature page exists, the next automation slice should implement:

1. applicant-form action to create a Sign request directly from the latest generated TOR PDF
2. signer routing from `hr.applicant.email_from`
3. applicant signature field placement on the dedicated final signature page
4. applicant date field placement on the same fixed page
5. signed-document return and attachment to `hr.applicant`
6. ToR lifecycle update from `generated` or `sent` to `signed`

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

## 10. Interview evaluation slice

### Canonical form

The interview evaluation workflow should be modeled on Marsellia form `MCEP-HR-F-0002`.

This slice is now delivered as a structured + document workflow:

- parent interview record
- child question lines
- seeded helper questions
- computed total / percent / grade / stars
- applicant-side summary tab
- QWeb interview PDF rendering aligned to the TOR visual pattern
- interviewer-sign workflow initiated immediately after interview PDF generation

### Data model

Recommended parent model:

- `x_hr.applicant_mcep_interview`

Owns:

- `x_applicant_id`
- interviewer provenance
- interview datetime
- printable header snapshots
- question lines
- total score
- max score
- percent score
- final grade
- visual star rating
- ready-for-pdf gate
- career aspirations
- long-term employment expected
- recommendation for employment
- remarks
- chatter and activities

Recommended child model:

- `x_hr.applicant_mcep_interview_line`

Owns:

- parent interview reference
- sequence
- helper question
- max score
- actual score
- line note

Recommended helper model:

- `x_mcep.interview_question`

It should seed the 10 fixed questions from form `0002`, each with Arabic and English labels and a default max score of `5`.

### Printable interview snapshots

The interview record should normalize printable header values when it is created so future report generation does not rely on fragile live joins.

Snapshot fields should include:

- applicant full name
- gender
- national ID
- employee number
- position applied for

Prefill rules:

- full name from `hr.applicant.partner_name`
- gender from `hr.applicant.x_gender`
- national ID from `hr.applicant.x_national_id`
- employee number blank for now
- position applied for from linked `job_id.name`

`passport number` remains intentionally omitted and deferred to the later required-documents slice.

### Applicant UX and access

`hr.applicant` should gain:

- an `Evaluation` page/tab
- a `Conduct Interview` action

The `Evaluation` tab should show all interview records for the applicant with at least:

- interview date
- interviewer
- total score
- percent
- final grade
- recommendation

The `Conduct Interview` action should:

- open a new interview record linked to the current applicant
- open directly in edit mode so recruiter can save scoring changes immediately
- prefill interviewer provenance and printable header snapshots
- auto-generate the 10 evaluation question lines

Access policy:

- selected native `interviewer_ids` should be the primary allowed conductors
- HR manager and system admin override should remain available
- server-side validation must enforce eligibility even if UI visibility is imperfect

### Scoring and grading

The interview form is scored across 10 questions, each with a maximum score of `5`, for a total maximum of `50`.

The parent interview record should compute:

- `x_total_score`
- `x_max_score`
- `x_percent_score`

The official Marsellia grade should be stored in a dedicated selection field:

- `excellent`
- `very_good`
- `good`
- `acceptable`
- `not_acceptable`

Suggested percent mapping:

- `excellent`: 90% to 100%
- `very_good`: 80% to less than 90%
- `good`: 70% to less than 80%
- `acceptable`: 50% to less than 70%
- `not_acceptable`: less than 50%

The visual result should be stored separately as a dedicated star value, ideally on a 0 to 5 scale:

- 0 stars: less than 25%
- 1 star: 25% to less than 40%
- 2 stars: 40% to less than 55%
- 3 stars: 55% to less than 70%
- 4 stars: 70% to less than 85%
- 5 stars: 85% to 100%

This official interview result should not rely on the native applicant `priority` field as its canonical store, even if a later mirror into native stars is added for convenience.

The interview star field in applicant inline summaries is read-only and only updated by aggregate score computation.

Question score entry is strictly validated to allow only integers from `1` to `5` inclusive. Any value outside this range is rejected.

`x_ready_for_pdf` becomes true only when all interview lines have valid `1..5` scores and is used to control PDF-generation button visibility.

### Auxiliary parent fields

The parent interview record should also store:

- `career_aspirations`:
  - `unclear`
  - `reasonable`
  - `unrealistic`
- `long_term_employment_expected`:
  - yes / no
- `recommend_for_employment`:
  - yes / no
- `remarks`

### Interview PDF and signature behavior (current implementation)

Interview PDF generation follows the TOR artifact pattern:

- recruiter triggers generation from the interview row/form once `x_ready_for_pdf` is true
- the generated interview PDF is attached to the parent `hr.applicant` record so it appears in applicant Files and chatter
- interview lifecycle timestamps and state are updated on the interview record
- chatter logs are posted on both the interview and applicant records

Signature workflow for this slice is intentionally guided-manual:

- generation marks the document as ready/sent for interviewer signature
- recruiter uses the generated applicant attachment as the source PDF in Odoo Sign
- recruiter assigns the interviewer signer and completes placement manually
- signed PDF is linked back through `Signed Interview PDF`, which marks the interview as signed

## 11. Recommended implementation order

1. add baseline Job Description fields and UI on `hr.job`
2. add the negotiated applicant function line model
3. add `hr.applicant` inheritance logic from linked `hr.job`
4. add the `Role and Duties` authoring surface on `hr.applicant`
5. verify conversion still creates a native applicant cleanly
6. normalize printable ToR fields onto `hr.applicant`
7. add the QWeb-generated TOR PDF
8. add the applicant-form document generation button
9. wire the current guided-manual applicant-side Sign workflow
10. add the fixed final signature page for stable applicant-signature geometry
11. add applicant-side canonical printable identity fields such as `x_gender` and `x_national_id`
12. add the structured interview evaluation workflow and applicant `Evaluation` tab (now delivered)
13. only then automate Sign request creation and signed-document return for later forms
14. only then add broader document/sign flows

## 12. Translation delivery

For every stage-2 release:

- add or update Arabic PO files in the module
- translate all new field labels, view strings, action names, and report strings
- keep the translation files inside the uploadable module zip

## 13. Install/test checklist

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
- recruiter can execute the guided-manual Sign flow from the generated TOR
- signed document can be returned to and remains visible from the applicant record

After the fixed-signature-page slice is installed:

- the TOR always ends with a dedicated final signature page
- applicant signature placement becomes stable enough for automation
- Sign request creation can be triggered from the applicant form
- signed-document return can be automated back to the applicant record
