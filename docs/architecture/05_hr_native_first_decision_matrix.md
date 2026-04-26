# HR Native-First Decision Matrix

This document defines the preferred Odoo-native path for Marsellia HR forms and signatures.

The rule is:

- `Documents` is the default DMS
- `Sign` is the default external signature engine
- `QWeb` is the default PDF renderer for dynamic / multi-line forms
- `Fillout`, `Zite`, and `n8n` remain the intake and continuation surface for non-Odoo users
- generated PDFs and signed artifacts always belong to the runtime record and the Documents store

## 1. Form-family matrix

| Form family | What it is | Runtime owner | Generate | Sign | Store | Default path |
|---|---|---|---|---|---|---|
| `0001` | Intake continuation after prescreening | `hr_pool` for intake, `hr.applicant` after conversion | Intake snapshot from `hr_pool`; negotiated continuation document in recruitment runtime | Sign only for post-approval confirmations or declarations | Documents folder on the intake/recruitment record | Split the legacy form; keep intake separate from post-conversion continuation |
| `0002` | Interview evaluation | `hr.job` baseline rubric link, `hr.applicant` runtime evaluation | QWeb PDF from the applicant runtime record and its line items | Optional sign-off by interviewer, chairman, or approver depending on policy | Documents folder on the evaluation record | Custom governed record + QWeb + optional Sign |
| `0003` | Pre-employment document checklist | `hr.job` baseline checklist link, `hr.applicant` runtime checklist | QWeb PDF from checklist lines and status fields | Applicant and HR sign-off if required by policy | Documents folder on the recruitment record | Custom record + QWeb + Sign where sign-off is mandatory |
| `0004` | Truthfulness / validity declaration | `hr.applicant` runtime declaration envelope | Static Sign template, or QWeb if branded composition is needed | Applicant signature required; HR countersign only if policy requires it | Documents folder on the recruitment/onboarding record | Static Sign template by default |
| `0007` | Internal regulations acknowledgment | `hr.applicant` runtime declaration envelope | Static Sign template | Applicant signature required; HR optional | Documents folder on the onboarding record | Static Sign template |
| `0008` | Training commitment | `hr.applicant` runtime declaration envelope | Static Sign template | Applicant signature required; HR sign-off if policy requires it | Documents folder on the onboarding record | Static Sign template |
| `0009` | Confidentiality declaration | `hr.applicant` runtime declaration envelope | Static Sign template | Applicant signature required; HR optional | Documents folder on the onboarding record | Static Sign template |
| `0010` | Exclusivity declaration | `hr.applicant` runtime declaration envelope | Static Sign template | Applicant signature required; HR optional | Documents folder on the onboarding record | Static Sign template |
| `0013` | Safety / HSE acknowledgment | `hr.applicant` first, later employee/HSE runtime | Static Sign template if the body is fixed; QWeb + Sign if the packet becomes multi-line | Applicant / employee signature required; HSE reviewer if policy requires it | Documents folder on the onboarding record | Start with Sign; move to QWeb + Sign if the form grows |
| `0006` | Task / equipment acceptance | Future employee/admin or ops module | QWeb or later operational form | Employee and supervisor sign-off if required | Documents folder on the operational record | Not recruitment core; useful evidence for the canonical task-template layer |

## 2. Default generation rules

### 2.1 Static Sign template

Use when:

- the body is fixed
- only signer data changes
- the legal meaning is in the wording, not the layout

Best for:

- declarations
- NDAs
- acknowledgements
- short commitments

### 2.2 QWeb PDF

Use when:

- the form needs repeated rows
- the output must closely resemble a paper form
- the form is data-heavy or table-heavy
- the result must be human-readable before signing

Best for:

- interview scoring sheets
- document checklists
- TOR / job description printouts
- any controlled form with multiple line items

### 2.3 Custom record + QWeb + Sign

Use when:

- the form should become a governed operational record
- the form needs chatter, activities, and state transitions
- the form produces evidence that must be traceable

Best for:

- interview evaluation
- pre-employment evidence packs
- eventual clearance and handoff records

## 3. Storage rules

- the operational record is the source of truth for the workflow
- the generated PDF belongs in `Documents`
- the signed PDF and certificate must be attached back to the operational record
- the template source remains reusable and versioned separately

## 4. Signature rules

- static declarations should go through `Sign`
- multi-line forms should usually be generated first with `QWeb`, then signed in `Sign`
- `Documents` stores both the unsigned and signed artifacts
- `Fillout` is not the canonical legal signing layer

## 5. Runtime ownership rule

- recruitment forms stay in `grc_recruitment_bridge`, `hr_pool`, and `hr_recruitment`
- task templates stay in `grc_backbone`
- employee admin and HSE forms move to future domain modules
