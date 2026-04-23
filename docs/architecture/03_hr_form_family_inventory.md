# HR Form Family Inventory

This document maps the current Marsellia HR form corpus to its correct architectural owner.

The rule is:

- canonical governed wording lives in `grc_backbone`
- reusable recruitment composition lives in `grc_recruitment_bridge`
- live person-specific records live in `hr_pool` or `hr_recruitment`
- employee-admin and HSE forms should move to future operational modules

## 1. Inventory summary

| Form code | Short name | Family | Current runtime owner | Bridge ownership | Signer / reviewer roles | Notes |
|---|---|---|---|---|---|---|
| `0001` | Job Request / Intake | Intake + continuation | `hr_pool` for intake, `hr_recruitment` for post-approval continuation | `grc_recruitment_bridge` only for continuation pack reuse | Candidate, HR manager, chairman | Legacy form split in practice; omitted fields move after approval |
| `0002` | Candidate Interview Evaluation | Interview rubric | `hr_recruitment` | `grc_recruitment_bridge` | Interviewer, optional chairman review | First-wave bridge template family |
| `0003` | Required Pre-Employment Documents | Checklist / evidence pack | `hr_recruitment` | `grc_recruitment_bridge` | Applicant, HR manager | First-wave bridge template family |
| `0004` | Truthfulness / document validity declaration | Declaration pack | `hr_recruitment` | `grc_recruitment_bridge` | Applicant, HR manager | Reusable declaration wording comes from GRC provisions |
| `0005` | Missing from corpus | Gap | n/a | n/a | n/a | Track as a source inventory gap |
| `0006` | Task / equipment acceptance | Employee admin / task control | Future employee admin or ops module | Not core bridge | Employee, supervisor | Not recruitment-core |
| `0007` | Internal regulations acknowledgment | Declaration / acknowledgment | `hr_recruitment` / onboarding continuation | `grc_recruitment_bridge` | Applicant, HR manager | First-wave bridge template family |
| `0008` | Training commitment / reimbursement | Declaration / commitment | `hr_recruitment` / onboarding continuation | `grc_recruitment_bridge` | Applicant, HR manager | First-wave bridge template family |
| `0009` | Confidentiality declaration | Declaration pack | `hr_recruitment` / onboarding continuation | `grc_recruitment_bridge` | Applicant, HR manager | First-wave bridge template family |
| `0010` | Exclusivity declaration | Declaration pack | `hr_recruitment` / onboarding continuation | `grc_recruitment_bridge` | Applicant, HR manager | First-wave bridge template family |
| `0011` | ID card receipt | Employee admin | Future employee admin module | Optional bridge template only | Employee, HR admin | Not core recruitment bridge |
| `0012` | Missing from corpus | Gap | n/a | n/a | n/a | Track as a source inventory gap |
| `0013` | Safety / HSE acknowledgment | Recruitment-to-HSE onboarding | `hr_recruitment` initially, later ops/HSE runtime | `grc_recruitment_bridge` | Applicant, HR, HSE reviewer | Bridge can own the reusable clause pack |
| `0014` | Permission / absence request | Employee admin | Future employee admin module | Not core bridge | Employee, supervisor, HR | Post-hire workflow |
| `0015` | Leave request | Employee admin | Future employee admin module | Not core bridge | Employee, supervisor, HR | Post-hire workflow |
| `0016` | Assignment / secondment | Employee admin / ops | Future employee admin or ops module | Not core bridge | Employee, manager, HR | Post-hire workflow |
| `0017` | Resignation / termination request | Offboarding | Future offboarding module | Not core bridge | Employee, HR, manager | Post-hire workflow |
| `0018` | Human-waste handling declaration | Ops / HSE | Future ops/HSE module | Not core bridge | Worker, supervisor, HSE | Operational compliance form |
| `0019` | Human-waste storage supervisor declaration | Ops / HSE | Future ops/HSE module | Not core bridge | Supervisor, HSE | Operational compliance form |
| `0020` | Clearance / exit handoff checklist | Offboarding | Future offboarding module | Not core bridge | Employee, HR, departments | Post-hire workflow |
| `0021` | Human-waste handling declaration variant | Ops / HSE | Future ops/HSE module | Not core bridge | Worker, supervisor, HSE | Operational compliance form |
| `0022` | Human-waste supervisor declaration variant | Ops / HSE | Future ops/HSE module | Not core bridge | Supervisor, HSE | Operational compliance form |

## 2. Bridge-owned form families

These are the forms that justify `grc_recruitment_bridge` in the first implementation slice:

- interview evaluation (`0002`)
- pre-employment checklist (`0003`)
- truthfulness / validity declaration (`0004`)
- internal regulations acknowledgment (`0007`)
- training commitment (`0008`)
- confidentiality declaration (`0009`)
- exclusivity declaration (`0010`)
- safety / HSE acknowledgment used during onboarding (`0013`)
- the continuation sections of legacy intake (`0001`)

## 3. Future module families

These should be documented now, but implemented later in separate operational modules:

- employee admin / attendance / leave / offboarding:
  - `0011`, `0014`, `0015`, `0016`, `0017`, `0020`
- ops / HSE declarations:
  - `0018`, `0019`, `0021`, `0022`

## 4. Design rule for the bridge

The bridge should not mirror every PDF as a separate long-lived business object.

Instead:

- one reusable template family owns the structure
- one runtime module owns the live instance
- one signer profile owns the routing
- one PDF artifact is generated per runtime record

## 5. Practical consequence

This inventory is the reference point for future work when deciding whether a new form belongs in:

- `grc_backbone`
  - `grc_recruitment_bridge`
- `hr_pool`
- `hr_recruitment`
- a future employee admin module
- a future ops/HSE module
