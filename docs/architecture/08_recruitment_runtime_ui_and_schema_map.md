# Recruitment Runtime UI and Schema Map

This document pins the corrected target structure for Marsellia recruitment:

- `grc_backbone` owns governed primitives and canonical task templates
- `grc_recruitment_bridge` owns recruitment template families, document types, signer routing, and report layouts
- `hr_pool` owns frozen intake and prescreening
- `hr_recruitment` owns the live recruitment runtime records and the user-facing workflow around them

No extra conceptual runtime module is introduced. The live records stay in the recruitment domain.

## 1. Odoo recruitment baseline to preserve

Odoo Recruitment already provides the native surfaces we should keep and extend:

- Recruitment app dashboard with job positions shown as Kanban cards
- Job Position form and its applicant list
- Applications page per job position
- Applicant stages:
  - New
  - Initial qualification
  - First interview
  - Second interview
  - Contract Proposal
  - Contract Signed
  - Refuse applicant
- Applicant form sections:
  - Candidate
  - Notes
  - Details
  - Skills
- Native recruitment actions:
  - Send Interview
  - No Meeting smart button
  - Generate Offer
  - Review Contract & Sign
- Recruitment documents stored in the Documents app under the Recruitment folder
- Applicant chatter that captures files and stage log notes

These native surfaces are the base layer. Marsellia extensions should inherit them rather than replace them.

## 2. Corrected target structure

### 2.1 `grc_backbone`

Owns:

- functional areas
- governed functions
- provisions
- SOPs
- canonical task templates
- clause libraries
- compliance taxonomy

### 2.2 `grc_recruitment_bridge`

Owns:

- role / job description templates
- interview rubric templates
- document checklist template definitions
- onboarding continuation packs
- declaration packs
- recruitment document type catalog
- signature routing profiles
- report layout definitions
- bridge fields that point operational recruitment records at governed definitions

### 2.3 `hr_pool`

Owns:

- intake
- chairman gating
- conversion request scaffolding
- intake PDF snapshot
- intake attachments
- intake chatter and activities

### 2.4 `hr_recruitment`

Owns:

- live applicant records
- interview instances
- interview evaluation records
- document checklist runtime records
- document submission runtime records
- TOR / job description runtime output on `hr.job`
- document and signature state
- chatter and activities

## 3. Required runtime record models

The recruitment-side runtime records should use recruitment-domain names, not bridge-owned names.

Recommended target model set:

- `x_hr.recruitment_interview_evaluation`
- `x_hr.recruitment_interview_evaluation_line`
- `x_hr.recruitment_document_checklist`
- `x_hr.recruitment_document_checklist_line`
- `x_hr.recruitment_document_submission`

Existing operational records to extend:

- `hr.job`
- `hr.applicant`

## 4. Runtime record responsibilities

### 4.1 Interview evaluation

The runtime evaluation record belongs to the recruitment domain and should carry:

- applicant reference
- job reference
- interviewer user
- evaluation state
- scoring lines
- PDF attachment pointer
- signed PDF attachment pointer
- signature profile reference
- documents folder reference
- chatter
- activities

### 4.2 Document checklist

The runtime checklist record belongs to the recruitment domain and should carry:

- applicant reference
- job reference
- checklist state
- checklist lines
- one line per required document type
- uploaded-file references per line
- expiry / renewal tracking
- HR review state
- applicant sign-off state
- PDF attachment pointer
- signed PDF attachment pointer
- signature profile reference
- documents folder reference

### 4.3 Document submission

Each uploaded document should be a separate runtime submission record.

That record should carry:

- document type reference
- applicant reference
- checklist line reference
- attachment pointer
- upload timestamp
- reviewer / approver
- signature state if the document requires sign-off

This is the structural answer to “one submission per document”.

## 5. Menus and views that must exist

### 5.1 Existing Odoo menus to preserve

- Recruitment dashboard
- Job Positions
- Applications

### 5.2 Job Position form extensions

The job position form should include:

- governance/template links
- TOR/job-description generation controls
- documents folder and attachment hooks
- signature hooks
- smart buttons for generated TOR and signed TOR

Suggested notebook tabs:

- Overview
- Governance
- Documents
- Signatures

### 5.3 Applicant form extensions

The applicant form should include:

- documents and checklist overview
- interview evaluation smart button or tab
- document submission lines
- signature status
- Documents folder reference
- generated/signed attachment references

Suggested notebook tabs:

- Candidate
- Notes
- Details
- Skills
- Documents & Checklists
- Evaluations
- Signatures

### 5.4 Runtime menus for recruitment records

Add recruitment-side menus for:

- Interview Evaluations
- Document Checklists
- Document Submissions

These menus are for operational records, not for template definition.

### 5.5 Documents app views

The Documents app should remain the canonical file store.

Required pattern:

- recruitment folder at the top level or shared company level
- subfolders by runtime type or document family
- each runtime record stores a pointer to its folder
- signed PDFs and completion certificates are stored there as evidence

## 6. Bridge document type catalog

The recruitment bridge should define a document type catalog so checklist runtime lines can be typed.

Recommended model:

- `x_grc.hr_document_type`

Recommended fields:

- `x_code`
- `x_name`
- `x_category`
- `x_is_mandatory_default`
- `x_requires_expiry_default`
- `x_default_signoff_role`
- `x_description`

The document checklist template line and runtime checklist line should both reference this catalog.

## 7. How the forms should flow

### 7.1 Interview evaluation

1. The bridge defines the evaluation rubric.
2. Recruitment creates the live evaluation record for a specific applicant.
3. The user enters scores and notes on the runtime record.
4. QWeb renders the evaluation PDF from the runtime record.
5. The PDF is stored in Documents and attached to the runtime record.
6. Odoo Sign is requested if policy requires signature.

### 7.2 Document checklist

1. The bridge defines the document checklist template and the typed document catalog.
2. Recruitment creates the runtime checklist record for a specific applicant.
3. Each required document becomes one runtime checklist line.
4. Each uploaded file becomes one runtime submission record.
5. The checklist is rendered to PDF.
6. The PDF and signed artifact are stored in Documents and attached to the runtime record.

### 7.3 TOR / job description

1. The bridge defines the role template and routing profile.
2. `hr.job` acts as the runtime job record.
3. QWeb renders the TOR / job description from `hr.job` plus the linked template lines.
4. The PDF is filed in Documents and attached to the job record.
5. Odoo Sign can be triggered for approval or countersignature.

## 8. Structural rule

The bridge owns definitions, not live cases.

The recruitment domain owns live cases, not the bridge.

This is the correction that prevents architectural drift.

