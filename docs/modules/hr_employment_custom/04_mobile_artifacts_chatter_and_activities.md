# Mobile Artifacts, Chatter, Activities, and Approvals

## Mobile artifact problem

Direct `/web/content/<attachment_id>?download=true` actions can work on desktop but fail or behave inconsistently inside Odoo's native mobile app.

Chatter/files attachments have proven more reliable for mobile access.

## Locked artifact rule

For every generated/signed/certificate artifact:

1. store the attachment on the source process record;
2. copy signed and certificate artifacts to `hr.employee` chatter/files;
3. keep icon buttons as desktop convenience controls;
4. do not rely on URL buttons as the only artifact access method;
5. use chatter messages to identify artifact type and lifecycle event.

A process is not mobile-safe unless the user can open the final signed artifact from the employee record's chatter/files in the mobile app.

## Chatter

Chatter is the durable audit stream.

Post messages for:

- record creation;
- PDF generation;
- send for signature;
- signature sync;
- approval/rejection;
- manual decision attachment;
- state transition;
- handover/offboarding completion.

## Activities

Activities drive the next human action.

Examples:

- manager approval;
- HR review;
- certificate submission;
- custody return;
- IT account deactivation;
- finance final settlement;
- stores/transport clearance.

Activities do not replace the workflow state. The source record state remains the source of truth.

## Odoo Approvals app

Use Odoo Approvals selectively.

Good candidates:

- administrative permissions;
- training funding;
- special work assignment;
- exceptional custody issuance;
- overtime authorization.

Do not make `approval.request` the source of truth for native HR objects such as `hr.leave` or `hr.appraisal`.

Rule:

```text
Approval authorizes the action.
Sign evidences the official document.
Chatter records the history.
Activities drive the next human step.
```
