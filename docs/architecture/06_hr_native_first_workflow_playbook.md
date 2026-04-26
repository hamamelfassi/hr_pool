# HR Native-First Workflow Playbook

This document turns the native-first decision matrix into a practical build sequence for Marsellia.

The objective is to use Odoo-native features wherever they exist in the current enterprise SaaS setup, and reserve n8n / Fillout / Zite for intake and continuation edges only.

## 1. System posture

- `Documents` is the default DMS
- `Sign` is the default external signature engine
- `QWeb` is the default renderer for dynamic PDF forms
- `Chatter` and `Activities` are the default traceability and follow-up mechanisms
- `WhatsApp` is a messaging and notification channel, not the canonical document engine
- `Fillout`, `Zite`, and `n8n` are external entry and continuation surfaces

## 2. Two-stage lifecycle

### Stage 1 - Intake and prescreening

1. Candidate submits public intake through Fillout / Zite.
2. n8n normalizes the payload and writes it to `hr_pool`.
3. `hr_pool` retains the intake snapshot and provenance.
4. Chairman / reviewer actions are tracked in Odoo.
5. If required, an intake PDF snapshot is attached to the record and stored in Documents.
6. If the intake is approved for progression, the workflow moves to recruitment / applicant handling.

### Stage 2 - Recruitment, enrichment, and offer completion

1. Recruitment runtime record is created or activated.
2. The bridge selects the correct template family and signature profile.
3. Dynamic multi-line forms are rendered with QWeb when needed.
4. Static legal declarations are prepared as Sign templates.
5. Generated PDFs are filed in Documents and attached to the runtime record.
6. Signature requests are sent through Odoo Sign.
7. Chatter and activities track reminders, approvals, and completion.
8. The final contract and declaration bundle are signed, archived, and linked to the record.

## 3. Recommended build order

### 3.1 Native record foundations first

For each operational record that will own a document workflow, make sure the model has:

- chatter support
- activity support
- responsible user / ownership fields
- document attachment fields
- state / stage fields
- a signature profile reference
- report/template references where needed

### 3.2 Documents app integration

Use Documents for:

- source PDFs
- generated PDFs
- signed PDFs
- completion certificates
- uploaded evidence

Recommended rule:

- create the document in the operational module
- store the artifact in Documents
- keep the link back to the runtime record

### 3.3 Sign integration

Use Sign for:

- declarations
- NDAs
- acknowledgements
- offer acceptance
- contract signature

Recommended rule:

- fixed bodies should be Sign templates
- signer data should auto-complete from Odoo records
- signature profiles should decide the signer order and backend

### 3.4 QWeb integration

Use QWeb for:

- interview evaluation PDFs
- checklist PDFs
- TOR / job description PDFs
- any paper-like multi-line form

Recommended rule:

- keep the report layout driven by data already on the operational record
- avoid report designs that require custom Python context if the SaaS module must remain XML-only

### 3.5 Chatter and activities

Use chatter for:

- notes
- attachments
- state changes
- signed-document logging

Use activities for:

- reviewer follow-up
- chairman approval reminders
- missing-document reminders
- signature chase-up

## 4. Survey versus custom record

Use Odoo Survey only when:

- the interviewer input is lightweight
- you want fast form capture
- the result does not need to become a strong governed business object

Use a custom operational record when:

- the interview evaluation must be auditable
- you need chatter and activities
- the evaluation will later feed report generation or signature routing

For Marsellia, the interview evaluation should be a custom governed record first, with QWeb and optional Sign layered on top.

## 5. WhatsApp usage rule

Use WhatsApp for:

- reminders
- follow-up prompts
- sending links to records or signing flows
- candidate communication

Do not use WhatsApp as the canonical document repository or legal signing source.

## 6. Studio rule

Studio can help with quick UI refinement, but it should not become the primary source of truth for the architecture.

If a feature is core to the lifecycle:

- keep it in the repository as a module-backed implementation
- use Studio only if it reduces effort and does not create a second unmanaged source of truth

## 7. Implementation principle

The safest native-first posture is:

- define the data model first
- define the template/signature profile second
- render PDFs third
- send signatures fourth
- store everything in Documents and chatter

