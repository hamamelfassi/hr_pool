# Marsellia Recruitment Required Document Submission — n8n Runbook

Status: Pass 6C locked.

Workflow name:

```text
Marsellia | Recruitment | Required Document Submission
```

Primary purpose:

```
Receive Fillout/Zite required-document submissions, validate the Odoo request/token/checklist envelope, create Odoo attachments, create required-document submission records, update request lines, and close the parent request.
```

## **Locked runtime path**

```
Receive Fillout Submission
→ Parse Fillout Payload
→ Wait
→ Lookup Odoo Request
→ Wait
→ Lookup Odoo Request Lines
→ Validate Odoo Envelope
→ Build Writeback Items
→ Loop Over Writeback Items
  → Wait Before Duplicate Check
  → Check Existing Submission Count
  → Normalize Duplicate Count
  → IF Not Duplicate
     false → Duplicate Skipped Result → Loop Over Writeback Items
     true  → Download Submitted File
           → Build Attachment Payload
           → Wait Before Create Attachment
           → Create Odoo Attachment
           → Build Submission Payload
           → Wait Before Create Submission
           → Create Odoo Submission
           → Build Request Line Update
           → Wait Before Update Request Line
           → Update Request Line
           → Writeback Created Result
           → Loop Over Writeback Items
→ Summarize Loop Result
→ Build Parent Request Update
→ Wait Before Update Parent Request
→ Update Parent Request
→ Build Final Webhook Response
→ Respond to Webhook
```

## **Locked behavior**

```
n8n creates submitted evidence only.
n8n does not accept or reject evidence.
HR review remains inside Odoo.
F-0003 checklist line acceptance is updated only by Odoo accept/reject actions.
```

## **Duplicate rule**

```
same Fillout submissionId + same request line = duplicate retry, skip
new Fillout submissionId + same request line = allowed new evidence submission
```

## **Expected first successful live submission**

For a request containing 11 public active requested sections:

```
Build Writeback Items = 11
Duplicate Skipped Result = 0
Writeback Created Result = 11
Summarize Loop Result createdCount = 11
failedCount = 0
Parent request update = true
```

If one section was already processed earlier:

```
Build Writeback Items = 11
Duplicate Skipped Result = 1
Writeback Created Result = 10
failedCount = 0
Parent request update = true
```

If rerunning the exact same Fillout submission after all request lines were processed:

```
Build Writeback Items = 11
Duplicate Skipped Result = 11
Writeback Created Result = 0
failedCount = 0
Parent request update = true
```

## **Odoo request closure rule**

The parent request is marked completed only when all loop return items are successful outcomes:

```
writeback_created
skip_duplicate_retry
```

The workflow writes:

```
x_last_response_at = Fillout submitted timestamp when available
x_state = completed when failedCount = 0
```

## **Rate limiting rule**

Keep the wait nodes in place.

Minimum current spacing:

```
2 seconds before request lookup
2 seconds before request-line lookup
2 seconds before duplicate checks
2 seconds before attachment creation
2 seconds before submission creation
2 seconds before request-line update
2 seconds before parent request update
```

Do not remove these waits unless the Odoo SaaS rate-limit behavior is re-tested.

## **Source-controlled code modules**

```
required_document_writeback_parse_payload.js
required_document_writeback_validate_envelope.js
required_document_writeback_build_section_items.js
required_document_writeback_normalize_duplicate_count.js
required_document_writeback_duplicate_skipped_result.js
required_document_writeback_would_writeback_result.js
required_document_writeback_build_attachment_payload.js
required_document_writeback_build_submission_payload.js
required_document_writeback_build_request_line_update.js
required_document_writeback_created_result.js
required_document_writeback_summarize_loop_result.js
required_document_writeback_build_parent_request_update.js
required_document_writeback_final_response.js
```

## **Do not commit**

```
n8n execution dumps
screenshots
downloaded Fillout files
base64 payload logs
credentials
API keys
Bearer tokens
temporary test exports with secrets
```

## **6D handoff notes**

Pass 6D should handle:

```
document storage governance
applicant folder strategy
attachment naming and clutter reduction
download-only attachment UI
read-only submitted evidence polish
manual hardcopy-only lines such as passport_photos
PDF regeneration after evidence acceptance
operational reviewer guidance
```

