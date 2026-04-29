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

## 6. Second stage-2 slice: TOR document generation and applicant signature

After the schema and UI composition slice is stable, the next slice should formalize the negotiated ToR as a document workflow on `hr.applicant`.

### Canonical document strategy

The negotiated ToR should be generated as a `QWeb` PDF that is visually equivalent to Marsellia form `MCEP-HR-F-0006`.

The original PDF form is the visual reference, but the system-of-record output should be a QWeb-generated document because:

- negotiated duties are dynamic
- duties should be grouped by functional area
- Arabic-first layout control matters
- the generated PDF should remain reproducible from live applicant data
- the generated PDF can then be routed into native Odoo Sign

### Applicant as printable source of truth

The ToR should be generated from `hr.applicant`, and key printable identity fields should be normalized onto the applicant record so the generated document does not depend on brittle runtime joins.

For this first document slice:

- `partner_name` is the applicant full name source
- `job_id` provides job title and department
- `hr.pool` remains only an upstream source where applicant normalization is still incomplete

### First-pass field rules

For the initial generated ToR:

- `Recipient Name`: applicant full name from `partner_name`
- `Employee ID`: blank
- `Department`: linked job department
- `Job Title`: linked job title
- `Direct Supervisor`: blank
- `Date of Receipt`: blank in the generated PDF
- `Duties`: negotiated applicant duties grouped by functional area

### First signing workflow

The first operational workflow should be:

1. recruiter finalizes the negotiated duty lines on `hr.applicant`
2. recruiter clicks a TOR-generation button on the applicant form
3. the generated PDF is attached to the applicant record
4. recruiter opens the generated TOR PDF from the applicant record
5. recruiter uploads that exact PDF into Odoo Sign as a one-off document
6. recruiter places the applicant signature field manually on the final rendered page and assigns the signer email from `hr.applicant.email_from`
7. applicant receives the Odoo Sign email and signs digitally
8. recruiter links or uploads the signed copy back to the applicant record
9. recruiter or HR later countersigns and backfills any missing values manually outside the automation scope for now

### Next signing slice after the guided-manual workflow

The next TOR signing increment should not try to automate the current variable-length PDF directly.

Instead, the canonical next slice should modify the QWeb TOR so that it always ends with a dedicated final signature page containing:

- the applicant printed name
- a fixed applicant signature block
- a fixed applicant date block
- the responsible-manager printed/signature/date placeholders

This is required because Odoo Sign field placement is page-coordinate based. A variable-length duties table makes applicant-signature coordinates unstable unless the signature area is moved to a fixed final page.

Once that fixed signature page exists, the follow-on signing slice should automate:

1. Sign request creation from the applicant form
2. applicant signer routing from `hr.applicant.email_from`
3. fixed applicant signature placement on the dedicated final page
4. signed-document return and attachment to `hr.applicant`

### Deliberate deferrals

This slice should not yet automate:

- manager routing
- direct-supervisor inference
- employee ID population
- final employee handoff gating
- automatic counter-sign flow
- broader HR form generation

## 7. Delivery rule

Each stage must be delivered as:

- spec
- code
- install
- test
- translation update
- only then the next stage

This prevents drift between documentation, module code, and the installed database.
