# Native Odoo Sign Workflow Wiki

**Proposed repo path:** `docs/modules/hr_recruitment_custom/native_odoo_sign_workflow_wiki.md`

**Module:** `hr_recruitment_custom`  
**Environment:** Odoo.com Enterprise SaaS 19.2  
**Status:** Pattern proven on F-0003 Required Documents Checklist  
**Primary purpose:** Reusable implementation guide for automated send/sign/sync flows across F-0002, F-0003, F-0004, declarations, decisions, contracts, TORs, and future controlled HR artifacts.

---

## 1. Purpose

This wiki locks the proven native Odoo Sign pattern used successfully for F-0003.

It exists so future document/signature workflows do not rediscover or reimplement the flow from scratch. The pattern should be reused wherever a controlled generated PDF must be signed and then written back to the recruitment document lifecycle registry.

The proven lifecycle is:

Generated controlled QWeb PDF
→ dynamic Odoo Sign template
→ Sign document from generated PDF attachment
→ Sign item(s) with fixed PDF coordinates
→ sign.send.request wizard/orchestration record
→ send_request()
→ generated sign.request located
→ recruitment registry stores Sign linkage
→ signer completes native Odoo Sign flow
→ manual sync imports signed result
→ signed PDF/certificate copied to applicant attachments
→ recruitment registry and source record close as signed

---

## 2. Design principles

### 2.1 Registry is the lifecycle authority

The central lifecycle authority is:

`x_hr.recruitment_document`

Source records such as F-0002 interview evaluations, F-0003 checklists, F-0004 declarations, TORs, contracts, and board decisions may generate or receive artifacts, but they do not independently define final lifecycle truth.

The registry stores:

- document type
- applicant
- version
- generated artifact
- signed artifact
- lifecycle state
- native Sign request linkage
- native Sign request state
- signed/certificate artifacts
- source model/source record

### 2.2 Generated PDF is the controlled legal snapshot

The PDF must be generated from the current source record and linked as an immutable lifecycle artifact.

The Sign workflow should not recreate the document content using Odoo Sign fields unless a document is deliberately designed as a static Sign template.

For F-0003 and similar evidence/legal snapshots, the canonical path is:

`QWeb-generated PDF → Sign overlay fields`

not:

`blank reusable PDF → many read-only Sign fields replacing QWeb values`

### 2.3 Native Sign is canonical; manual attachment remains fallback

Native Odoo Sign is the target lifecycle.

Manual signed-attachment closure remains an explicit fallback for cases where:

- Sign module flow is unavailable
- Sign request could not be created
- external signing is legally/operationally required
- signed artifact must be manually linked

Manual fallback must never be allowed to overwrite or corrupt an already signed native lifecycle record.

### 2.4 Explicit sync is preferred over brittle automation

Native Odoo Sign updates its own records and artifacts. The custom recruitment registry is updated by an explicit sync action.

This avoids risky automation on native `sign.request` internals and gives HR a deliberate control point:

`Signer completed native Sign → HR clicks Sync Signed Result → registry closes`

Later scheduled or automatic sync may be considered only after F-0002 and F-0004 prove the pattern across one-signer and two-signer documents.

---

## 3. Proven F-0003 implementation summary

The F-0003 implementation proved the following:

1. Dynamic Sign templates can be created from server actions on Odoo.com SaaS.
2. A `sign.document` can be created from the generated F-0003 PDF `ir.attachment`.
3. A `sign.item` can be created directly using stored coordinate fields.
4. The `Reviewer` Sign role can be used as a generic role.
5. `sign.send.request` is the correct orchestration layer.
6. `send_request()` successfully creates and sends the native Odoo Sign request.
7. The generated `sign.request` can be found and linked back to `x_hr.recruitment_document`.
8. Native Odoo Sign sends email, opens signer flow, accepts signature, and generates signed artifacts/certificate.
9. A sync action can read the linked `sign.request`, copy final artifacts to the applicant, and close the registry and source F-0003 checklist.
10. Duplicate sends can be blocked cleanly.
11. Lifecycle artifacts can be guarded in views with readonly/no-open UI controls while keeping controlled download buttons.

---

## 4. Relevant Odoo Sign model roles

### 4.1 `sign.template`

Dynamic container for the signable document.

Used fields:

`name`
`user_id`
`signature_request_validity`

Pattern:

Create one applicant/document-specific dynamic template per generated PDF signing instance.

Do not reuse dynamic templates across applicants unless a future profile registry explicitly supports this.

### 4.2 `sign.document`

Links the PDF attachment to the template.

Required/used fields:

`template_id`
`attachment_id`
`name`
`sequence`

Pattern:

`sign.document.attachment_id = generated PDF attachment`

### 4.3 `sign.item`

Stores actual Sign field placement.

Used fields:

`document_id`
`type_id`
`responsible_id`
`page`
`posX`
`posY`
`width`
`height`
`required`
`name`
`alignment`
`constant`

Important rule:

**Use document_id, not template_id, when creating sign.item records in this SaaS schema.**

### 4.4 `sign.item.type`

Signature field type is resolved by XML ID:

`sign.sign_item_type_signature`

Pattern:

```python
signature_type = env.ref('sign.sign_item_type_signature', raise_if_not_found=False)
```

### 4.5 `sign.item.role`

Sign role defines who is responsible for each Sign field.

F-0003 proven role:

`Reviewer`

Pattern:

```python
reviewer_role = env['sign.item.role'].sudo().search([('name', '=', 'Reviewer')], limit=1)
```

Do not hardcode role IDs.

### 4.6 `sign.send.request`

This is the send wizard/orchestrator.

Used fields:

`template_id`
`signer_id`
`subject`
`body`
`validity`
`certificate_reference`
`reminder_enabled`
`model`
`res_ids`

Pattern:

```python
send_request = env['sign.send.request'].sudo().create({...})
send_request.send_request()
```

**Ignore the return value of `send_request()`.**

### 4.7 `sign.send.request.signer`

Maps template role(s) to signer partner(s).

Used fields:

`sign_send_request_id`
`role_id`
`partner_id`
`mail_sent_order`

For a one-signer document:

`one role → one signer row`

For multi-signer documents:

`each Sign role must have exactly one signer row before send_request()`

### 4.8 `sign.request`

The resulting native Sign workflow record.

Used fields:

`template_id`
`state`
`reference`
`request_item_ids`
`completed_document_attachment_ids`
`completed_document_ids`
`write_date`
`completion_date`

Pattern:

**Do not create sign.request directly.**
Find it after send_request() and store its ID in the recruitment registry.

### 4.9 `sign.request.item`

Per-signer request item.

Useful fields:

`partner_id`
`role_id`
`state`
`signing_date`
`write_date`

Important rule:

**Do not close the registry just because one request item is completed.**
**Close only when the full sign.request state is signed.**

This is critical for F-0004 and other future multi-signer documents.

---

## 5. Required registry fields

The proven generic native Sign linkage fields on `x_hr.recruitment_document` are:

`x_signature_mode`
`x_sign_request_model`
`x_sign_request_res_id`
`x_sign_request_reference`
`x_sign_request_state`
`x_sign_request_url`
`x_sign_completed_on`
`x_sign_completed_attachment_id`
`x_sign_certificate_attachment_id`

Recommended semantics:

`x_signature_mode = native_sign or manual_attachment`
`x_sign_request_model = sign.request`
`x_sign_request_res_id = linked native sign.request ID`
`x_sign_request_state = latest copied state from sign.request`
`x_sign_completed_attachment_id = copied signed PDF artifact on applicant`
`x_sign_certificate_attachment_id = copied certificate artifact on applicant`

---

## 6. Send action pattern

### 6.1 Precondition checks

Before creating native Sign records, validate:

- source record is in the correct generated state
- generated PDF attachment exists
- applicant exists
- signer source exists
- signer partner exists
- signer email exists
- signature field type exists
- Sign role exists
- registry row exists or can be recovered safely
- no active linked Sign request already exists
- source/registry record is not already signed

### 6.2 Clean safe-eval warnings

Do not rely on `raise Warning(...)` in SaaS server actions.

In this database/context, `Warning` was not available in the server action safe-eval context. Prefer returning a notification action:

```python
action = {
    'type': 'ir.actions.client',
    'tag': 'display_notification',
    'params': {
        'title': 'Title',
        'message': 'Message',
        'type': 'warning',
        'sticky': False,
    }
}
continue
```

Reserve hard exceptions only for cases where a traceback is useful during development. Production actions should prefer clean notifications.

### 6.3 Duplicate prevention

Send actions must block:

- source already signed
- registry already signed
- linked sign.request exists and state is not cancelled/canceled
- linked sign.request is signed but registry has not been synced yet

Clean message examples:

`This F-0003 checklist is already signed. No duplicate Odoo Sign request was created.`

`This document already has an active linked Odoo Sign request in state "sent". Ask the signer to complete it, or sync the signed result after completion.`

`The linked Odoo Sign request is already signed. Use Sync Signed Result instead of creating a duplicate request.`

---

## 7. Sign item coordinate profile

### 7.1 F-0003 profile

`document_type: required_documents_checklist`  
`source_model: x_hr.applicant_required_document_checklist`  
`generated_attachment_field: x_pdf_attachment_id`  
`signed_attachment_field: x_signed_attachment_id`  
`registry_document_type: required_documents_checklist`

`role_key: reviewer`  
`sign_role_name: Reviewer`  
`signer_source: x_reviewer_user_id.partner_id`  
`sequence: 1`  
`required: true`  
`alignment: left`

Historical proven coordinates:

`page: 1`  
`posX: 0.073`  
`posY: 0.591`  
`width: 0.565`  
`height: 0.075`

Important status:

These coordinates were proven against the earlier F-0003 generated PDF layout.

After the required-document taxonomy, F-0003 template, or report CSS changes, the coordinates must be recalibrated before reuse.

Current rule:

- regenerate the updated F-0003 PDF;
- manually place/test the reviewer signature in Odoo Sign;
- record the updated page/posX/posY/width/height values;
- then patch the server action coordinate profile.

Do not rely on the historical coordinates after report layout changes.


### 7.2 Future profile shape

Future reusable profile registry should eventually model:

`document_type`
`source_model`
`generated_attachment_field`
`signed_attachment_field`
`registry_document_type`
`roles`:
  - role_key
  - sign_role_name
  - signer_source
  - sequence
  - required
  - page
  - posX
  - posY
  - width
  - height
`signing_order`

Do not create full signature profile models until F-0002 one-signer reuse and F-0004 two-signer flow are proven.

---

## 8. Completion sync pattern

### 8.1 Sync action preconditions

Before closure:

- registry row exists
- registry has x_sign_request_res_id
- sign.request exists
- sign.request is accessible

### 8.2 Closure rule

Registry can close only when:

`sign.request.state == signed`

Do not close from:

`sign.request.item.state == completed`

unless the full parent request is also signed.

### 8.3 Artifact retrieval

Use:

`sign_request.completed_document_attachment_ids`

Classify:

`certificate attachment → filename includes certificate/completion/history`
`signed PDF attachment → first non-certificate completed attachment`

Copy native Sign attachments onto the applicant instead of moving them.

Pattern:

```python
signed_copy = signed_native.copy({
    'name': signed_native.name,
    'res_model': 'hr.applicant',
    'res_id': applicant.id,
})
```

This preserves native Sign evidence and gives the recruitment/applicant record its own controlled artifact.

### 8.4 Timestamp rule

Do not rely on `sign.request.item.signing_date` as primary signed datetime. In this SaaS schema it is date-only and can create midnight/timezone artifacts.

Preferred order:

1. sign.request.write_date when request is signed
2. latest completed sign.request.item.write_date
3. sign.request.completion_date only as fallback
4. datetime.datetime.now()

---

## 9. UI hardening pattern

Lifecycle attachment fields must be:

- readonly when lifecycle-locked
- no_open
- no_create
- no_create_edit
```

Example:

```xml
<field name="x_signed_attachment_id"
    readonly="x_state == 'signed'"
    options="{'no_open': True, 'no_create': True, 'no_create_edit': True}" />
```

Registry artifact fields should generally be readonly:

```xml
<field name="x_signed_attachment_id" readonly="1"
    options="{'no_open': True, 'no_create': True, 'no_create_edit': True}" />
```

### Controlled downloads

Since `no_open` blocks the editable attachment form, add controlled download actions using:

`/web/content/<attachment_id>?download=true`

Server action pattern:

```python
action = {
    'type': 'ir.actions.act_url',
    'url': '/web/content/%s?download=true' % attachment.id,
    'target': 'self',
}
```

For layout stability, prefer icon-only or short download buttons near artifact fields.

### Related SaaS server-action guard pattern

Native Sign lifecycle actions and required-document review actions use SaaS-safe server-action guards.

For reusable validation, toast notification, and reload patterns, see:

- `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`

Important rule: do not use `raise Warning(...)` in Odoo.com SaaS 19.2 server actions. Use `display_notification` for recoverable validation guards.

---

## 10. Button and label conventions

Recommended labels:

`Send via Odoo Sign`
`Sync Signed Result`
`Download Generated PDF`
`Download Signed PDF`
`Download Certificate`

For compact forms, use icon-only buttons with `icon="fa-download"` and a short or empty string where Odoo permits.

Help text pattern:

**Generate the controlled PDF, send it through Odoo Sign, then sync the signed result once all required signers complete the request.**

---

## 11. Extension to F-0002

F-0002 reuses the proven one-signer native Sign pattern after F-0003.

Expected F-0002 profile:

`document_type: interview_evaluation`  
`source_model: x_hr.applicant_interview_evaluation`  
`generated_attachment_field: x_pdf_attachment_id`  
`signed_attachment_field: x_signed_attachment_id`  
`registry_document_type: interview_evaluation`

Role:

`role_key: interviewer`  
`sign_role_name: Reviewer or Interviewer, depending on available Sign roles`  
`signer_source: x_interviewer_user_id.partner_id`  
`sequence: 1`  
`required: true`

Coordinate rule:

- coordinates must be calibrated from the current locked F-0002 PDF;
- the interviewer signature block is the placement target;
- do not use F-0003 coordinates for F-0002.

Lifecycle rule:

- generated PDF creates/updates the registry row;
- Send via Odoo Sign creates dynamic template/document/item/send request;
- linked `sign.request` is stored on the registry;
- sync closes only after full `sign.request.state == signed`;
- signed PDF and certificate are copied to applicant attachments;
- source interview record and registry both become signed;
- duplicate send is blocked;
- manual signed-attachment fallback may remain available.

---

## 12. Extension to F-0004

F-0004 belongs to the Evaluation-stage closure flow and is tracked as:

`registry_document_type: legal_documents_validity_declaration`

Expected Pass 6F profile:

`document_type: legal_documents_validity_declaration`  
`source_model: x_hr.applicant_legal_document_validity_declaration` or the final implemented F-0004 source model name  
`generated_attachment_field: x_pdf_attachment_id`  
`signed_attachment_field: x_signed_attachment_id`  
`registry_document_type: legal_documents_validity_declaration`

Pass 6F signer rule:

`role_key: applicant`  
`sign_role_name: Applicant`  
`signer_source: applicant partner/email resolved from hr.applicant`  
`sequence: 1`  
`required: true`

Pass 6F implementation scope:

- one native Sign signer only, using the same proven one-signer pattern;
- applicant is the signer;
- HR/recruitment review fields may remain stored and printed;
- full two-signer native Sign execution is deferred unless explicitly re-scoped.

Future two-signer note:

If F-0004 is later promoted to two-signer native Sign, required roles become:

- Applicant;
- HR Manager / Reviewer.

At that point:

- each role must have exactly one signer row;
- registry must wait for full `sign.request.state == signed`;
- one completed signer item is not enough;
- signing order should remain optional unless business/legal process requires it.


## **Pass 6E — F-0002 Native Odoo Sign Retrofit Lessons**

Pass 6E reused the proven F-0003 native Odoo Sign lifecycle pattern for F-0002 Interview Evaluation.

The F-0002 flow is now:

1. Interview record is completed.  
2. F-0002 PDF is generated.  
3. Generated PDF is linked to the interview record and recruitment document registry.  
4. A dynamic Odoo Sign request is created for the interviewer.  
5. The interviewer signs the document.  
6. Sync copies the signed PDF and certificate where available.  
7. The interview record becomes Signed.  
8. The recruitment document registry row becomes Signed.  
9. Generated and signed download helpers remain available.  
10. The interview evidence record becomes readonly after generation.

### **Confirmed reusable pattern**

F-0002 can reuse the same lifecycle architecture as F-0003:

* dynamic `sign.template`;  
* generated `sign.document`;  
* one required `sign.item`;  
* `sign.send.request`;  
* linked `sign.request`;  
* registry metadata writeback;  
* signed PDF copy;  
* completion certificate copy;  
* source record state closure;  
* recruitment registry state closure;  
* duplicate-send prevention.

### **F-0002-specific differences from F-0003**

F-0002 uses the interviewer as the signer.

F-0002 is a scored evaluation artifact. Once generated, it should not be silently edited or regenerated. If a correction is needed, create a new interview evaluation record rather than overwriting the signed evidence artifact.

F-0002 signature coordinates are not reusable from F-0003 because the PDF layout is different. Only the lifecycle pattern is reusable. Signature placement must be calibrated from the actual F-0002 PDF preview or signed PDF output.

### **Required lifecycle rules**

F-0002 generation must be blocked after the first generated artifact exists.

Generation must not reset:

* signed attachment;  
* sent date;  
* signed date;  
* registry state;  
* Odoo Sign request metadata;  
* certificate metadata.

After generation, interview scoring and source fields become readonly.

After signing, the normal form surface should not show Generate or Send buttons. It should show only controlled download helpers and immutable evidence metadata.

### **Date source rules**

Use these date sources:

* `x_generated_on` \= F-0002 PDF generation event.  
* `x_sent_on` \= native Odoo Sign request creation or send event.  
* `x_signed_on` \= completed signer event or Odoo Sign completion timestamp.

Do not derive `x_sent_on` from `x_generated_on` when a linked `sign.request` exists.

Do not leave temporary repair actions in module data when they were only created to fix fake test records in a fresh database.

### **Sync action rule**

The sync action exists to close the MCEP lifecycle from the linked Odoo Sign request.

It should:

* read the linked `sign.request`;  
* confirm it is signed;  
* copy the completed signed PDF;  
* copy the certificate if available;  
* write the signed attachment to the source interview record;  
* write the signed attachment to the recruitment document registry;  
* mark both the source record and registry row as Signed;  
* preserve generated and sent metadata.

It should not regenerate the PDF and should not alter interview scoring values.

### **Rapid patch lesson from Pass 6E**

The F-0002 retrofit showed that rapid scripted reuse is acceptable only after inspecting the exact current files.

The F-0003 pattern was reusable, but not blindly. F-0002 required separate handling for:

* coordinates;  
* source model;  
* signer;  
* readonly evidence behavior;  
* regeneration blocking;  
* source/registry synchronization;  
* date chronology.

Future Sign reuse should follow Hybrid Mode:

1. Explain the intended lifecycle.  
2. Inspect the actual existing source pattern.  
3. Identify exact reusable parts.  
4. Identify model-specific differences.  
5. Apply segmented guarded patches.  
6. Test a fresh lifecycle record.  
7. Remove temporary test-only repair tooling before lock.

---

## 13. Later native Sign smart button integration

The current registry linkage does not automatically make custom Sign requests appear in Odoo’s native applicant Signature Requests smart button/counter.

That is deferred.

Future desired behavior:

**Native applicant Signature Requests counter and kanban include requests created through our custom registry-driven send flow.**

Do not block the registry lifecycle on this native UI integration.

---

## 14. Later recruitment documents counters

Future applicant smart button enhancement:

Recruitment Documents button exposes:
- unsigned / not closed count
- signed count

This should be handled after F-0004 and the evaluation gate are stable.

---

## 15. Acceptance checklist for future reuse

A future document’s native Sign implementation is not locked until all are true:

- Generated PDF exists and is stable.
- Signature geometry is calibrated on the actual generated PDF.
- Dynamic sign.template is created.
- sign.document uses generated PDF attachment.
- sign.item fields land correctly.
- sign.send.request sends successfully.
- Email is received by signer(s).
- sign.request ID is stored on x_hr.recruitment_document.
- Duplicate send is blocked.
- Signer completes native Odoo Sign flow.
- Sync reads full request state signed.
- Signed artifact is copied to applicant.
- Certificate is copied when available.
- Registry becomes signed.
- Source record becomes signed.
- Manual fallback remains available where designed.
- Artifact fields are guarded with readonly/no_open.
- Controlled download exists.

---

## 16. Known non-goals

This pattern does not currently:

- automatically sync when Sign request completes
- modify native Sign signer-side routes
- submit signatures programmatically
- alter native Sign smart button counters
- make ir.attachment globally immutable
- provide full signature profile models
- provide public continuation/submission writeback

Those are separate future passes.

