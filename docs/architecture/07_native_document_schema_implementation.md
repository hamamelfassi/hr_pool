# Native Document Schema Implementation

This document records the concrete schema needed for the native-first HR document posture.

It complements:

- `05_hr_native_first_decision_matrix.md`
- `06_hr_native_first_workflow_playbook.md`
- `08_recruitment_runtime_ui_and_schema_map.md`

The rule is:

- `Documents` is the default DMS
- `Sign` is the external signature engine
- `QWeb` is the PDF renderer for dynamic / multi-line forms
- `Chatter` and `Activities` are the operational traceability layer

## 1. Corrected ownership model

### 1.1 `grc_backbone`

Owns:

- provisions
- SOPs
- functional areas
- governed functions
- canonical task templates
- clause libraries

### 1.2 `grc_recruitment_bridge`

Owns:

- role / job description template families
- interview rubric template families
- document checklist template families
- onboarding continuation packs
- declaration packs
- recruitment document type catalog
- signature routing profiles
- report layout definitions

Does not own:

- live applicant instances
- live interview records
- live checklist instances
- live document submission instances

### 1.3 Recruitment runtime surface

Lives in the recruitment domain and is split across the baseline vacancy record (`hr.job`) and the negotiated runtime case (`hr.applicant`).

The runtime surface owns:

- the vacancy baseline TOR and template mapping on `hr.job`
- the negotiated applicant-specific composition on `hr.applicant`
- the actual applicant-specific interview evaluation record
- the actual applicant-specific document checklist record
- the actual document submission records, one per uploaded document
- generated PDFs for a specific runtime case
- signed PDFs for that same case
- chatter
- activities
- Documents attachment pointers

### 1.4 `hr_pool`

Owns:

- intake snapshot records
- prescreening workflow
- chairman gating
- intake attachments
- intake PDF snapshot

## 2. Recruitment runtime records

Recommended target runtime model names:

- `x_hr.recruitment_interview_evaluation`
- `x_hr.recruitment_interview_evaluation_line`
- `x_hr.recruitment_document_checklist`
- `x_hr.recruitment_document_checklist_line`
- `x_hr.recruitment_document_submission`

These are recruitment-side runtime objects, not bridge-owned definitions.

## 3. Bridge-defined template and type records

The bridge should define the reusable template families and type catalogs that the runtime records consume.

Recommended bridge model names:

- `x_grc.hr_role_template`
- `x_grc.hr_role_template_line`
- `x_grc.hr_interview_template`
- `x_grc.hr_interview_template_line`
- `x_grc.hr_document_checklist_template`
- `x_grc.hr_document_checklist_template_line`
- `x_grc.hr_onboarding_pack`
- `x_grc.hr_onboarding_pack_line`
- `x_grc.hr_declaration_pack`
- `x_grc.hr_declaration_pack_line`
- `x_grc.hr_signature_profile`
- `x_grc.hr_signature_profile_line`
- `x_grc.hr_document_type`

## 4. Runtime hooks on operational models

### 4.1 `hr.job`

`hr.job` remains the baseline vacancy record and should hold:

- link to the chosen role / job template
- link to the chosen interview template
- link to the chosen checklist template
- link to the chosen onboarding pack
- link to the chosen declaration pack
- link to the chosen signature profile
- documents folder pointer
- baseline TOR PDF attachment pointer
- signed baseline TOR attachment pointer
- baseline provenance / source metadata

It should not own applicant-specific negotiation state.

### 4.2 `hr.applicant`

`hr.applicant` remains the negotiated runtime applicant record and should hold:

- documents folder pointer
- interview evaluation pointer
- document checklist pointer
- declaration envelope pointer
- negotiated TOR / role composition pointer
- signature profile pointer
- generated PDF attachment pointer
- signed PDF attachment pointer
- comparison / delta metadata against the baseline vacancy
- chatter
- activities

## 5. Runtime document model responsibilities

### 5.1 Interview evaluation

The runtime interview evaluation record should carry:

- applicant reference
- job reference
- interviewer user
- state
- scoring lines
- notes
- generated PDF attachment pointer
- signed PDF attachment pointer
- signature profile pointer
- documents folder pointer
- chatter
- activities

### 5.2 Document checklist

The runtime checklist record should carry:

- applicant reference
- job reference
- state
- checklist lines
- documents folder pointer
- generated PDF attachment pointer
- signed PDF attachment pointer
- signature profile pointer
- chatter
- activities

Each checklist line should carry:

- a document type reference from `x_grc.hr_document_type`
- a required/optional flag
- an uploaded-file / submission pointer
- an expiry / renewal policy if relevant
- a review / sign-off status

### 5.3 Document submission

Each uploaded document should be represented by a separate runtime submission record.

That record should carry:

- applicant reference
- checklist line reference
- document type reference
- attachment pointer
- upload timestamp
- reviewer / approver
- sign-off state

This is the structural answer to “one submission per document”.

## 6. Report actions

### 6.1 HR Pool intake snapshot

The intake snapshot report belongs to `hr_pool`.

It is used to preserve the intake snapshot and provenance.

### 6.2 Job TOR / job description

The baseline TOR / job description report belongs on `hr.job`.

It renders the governed role template lines, job template links, and approved baseline composition metadata.

The negotiated final TOR / contracted duties report belongs on `hr.applicant`.

It renders the applicant-specific delta against the baseline vacancy and the final accepted composition.

### 6.3 Interview evaluation

The interview evaluation report belongs on the recruitment runtime evaluation record.

It renders the scoring lines and reviewer notes as a paper-like PDF.

### 6.4 Document checklist

The document checklist report belongs on the recruitment runtime checklist record.

It renders the required document types, submission status, expiry state, and reviewer sign-off state.

## 7. Storage rules

1. The runtime record owns the workflow state.
2. `Documents` owns the file lifecycle and searchable DMS storage.
3. The runtime record keeps attachment pointers to the current PDF and signed PDF.
4. Sign completion must leave a signed artifact back on the runtime record.
5. Template source stays separate from generated evidence.

## 8. Operational sequence

### 8.1 Intake

1. Fillout/Zite/n8n creates or updates `x_hr.pool`.
2. The intake snapshot report can be generated from the record.
3. The PDF is stored in Documents and attached to `x_hr.pool`.

### 8.2 Recruitment evaluation

1. The applicant exists in `hr.applicant`.
2. The bridge defines the evaluation rubric.
3. Recruitment creates the runtime evaluation record.
4. QWeb renders the evaluation PDF.
5. The PDF is stored in Documents and attached to the runtime record.
6. Sign is triggered if a signature profile requires it.

### 8.3 Document checklist

1. The bridge defines the checklist template and the document type catalog.
2. Recruitment creates the runtime checklist record.
3. Each required document becomes one runtime checklist line.
4. Each upload becomes one runtime submission record.
5. QWeb renders the checklist PDF.
6. The PDF and signed artifact are stored in Documents and attached to the runtime record.

### 8.4 Job TOR

1. `hr.job` carries the governed template links.
2. QWeb renders the TOR / job description PDF.
3. The PDF is attached to the job record and filed in Documents.
4. The same artifact can then be routed to Sign if the workflow requires approval or countersignature.

## 9. Current correction to keep in mind

If any current scaffold still places a live interview evaluation or document runtime record inside the bridge package, that is transitional and should be realigned before the next install cycle.

The target remains:

- bridge = definitions
- recruitment runtime = live records
