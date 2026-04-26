# HR Document Generation and Signature Workflow

This document defines the practical path for turning Marsellia HR templates into signed PDFs and linked operational records.

See also:

- `docs/architecture/05_hr_native_first_decision_matrix.md`
- `docs/architecture/06_hr_native_first_workflow_playbook.md`
- `docs/architecture/07_native_document_schema_implementation.md`

The rule is:

- the template source belongs in docs/resources or Google Docs
- the generated PDF belongs on the runtime record in Odoo
- the signing route belongs to a signature profile, not to hardcoded flow logic

## 1. Default generation stack

The recommended stack for the current SaaS constraints is:

- Google Docs for bilingual template authoring and layout control
- n8n for orchestration, data binding, and export steps
- Google Drive / Docs export for PDF generation
- Odoo Documents or attachments for storage and linkage
- Odoo Sign for formal external signatures

This is the pragmatic choice because the program is:

- XML-only on Odoo SaaS
- integration-heavy
- bilingual
- template-driven
- externally signed by non-Odoo users

## 2. Template lifecycle

### 2.1 Template source

A template is authored once as a governed master document.

The source can be:

- a Google Docs template used by n8n
- a markdown reference in `resources/forms/`
- a bridge template record in Odoo that carries version and approval state

The source of truth for the layout is the template family, not the generated record.

### 2.2 Runtime instance

A runtime instance is created when a specific candidate, applicant, employee, or supervisor needs a form generated.

It contains:

- the current person-specific data
- the template version used
- the generated PDF
- the signing status
- the operational record linkage

### 2.3 Signed artifact

The final signed PDF is stored with the operational record, not as a replacement for the template source.

The template remains reusable; the signed PDF is evidence.

## 3. Recommended generation flow

1. Read the operational record from Odoo.
2. Resolve the correct template family and version.
3. If the flow is external-facing, create a short-lived one-time continuation token.
4. Copy the Google Docs template.
5. Replace placeholders and repeaters with data from Odoo.
6. Export the filled document to PDF.
7. Upload the PDF to Odoo Documents or as an attachment.
8. If signatures are required, create the signature workflow using the signature profile.
9. Store the completed signed PDF back on the runtime record.

## 4. Signature profile model

A signature profile is a structured routing table that says who signs, in what order, and through which backend.

It is not a one-off if/else block in n8n.

### 4.1 Why a profile is better than hardcoded routing

Without a profile, every form flow needs custom logic.

With a profile, the form family defines the routing once and the runtime flow simply reads it.

That gives you:

- consistent signer order
- versioned approval rules
- simpler n8n flows
- easier module maintenance
- easier future reuse across the same HR domain

### 4.2 Typical signature profile fields

A signature profile should carry fields such as:

- document family code
- template version
- signer role
- signer order
- required or optional status
- signing backend
- target model
- target state
- countersign rule
- internal notes

### 4.3 Example signer roles

Typical Marsellia HR signer roles include:

- applicant
- employee
- interviewer
- HR manager
- chairman
- direct manager
- department manager
- HSE reviewer
- supervisor

## 5. Odoo Sign versus Fillout

### 5.1 Odoo Sign

Use Odoo Sign for the formal signature path.

This is the default because:

- external signers do not need to be Odoo users
- signing is auditable
- the signed artifact is stored in Odoo
- the flow is naturally linked to the operational record

### 5.2 Fillout

Use Fillout only for intake, continuation, and lightweight acknowledgement capture.

Do not treat Fillout as the canonical legal signing engine for the formal HR documents.

### 5.3 Practical rule

- Fillout = form entry and continuation surface
- n8n = orchestration and PDF generation
- Odoo Sign = formal signature capture
- Odoo = record ownership and evidence storage

## 6. Document family handling

The main bridge families currently in scope are:

- `0002` interview evaluation
- `0003` pre-employment checklist
- `0004` truthfulness / validity declaration
- `0007` policy acknowledgment
- `0008` training commitment
- `0009` confidentiality declaration
- `0010` exclusivity declaration
- `0013` safety / HSE acknowledgment used in HR onboarding
- the continuation sections of `0001`

These families should be treated as reusable template families with profile-driven routing.

## 7. Future extension path

Later, the same pattern can be reused for:

- employee admin and leave forms
- offboarding and clearance
- ops / HSE declarations
- contract and offer packs

The document-generation rule does not change; only the owning runtime module changes.
