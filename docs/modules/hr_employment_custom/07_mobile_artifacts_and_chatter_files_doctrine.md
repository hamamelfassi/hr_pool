
# Mobile Artifacts and Chatter/Files Doctrine

## Problem

Direct `/web/content/<attachment_id>?download=true` actions can work on desktop but fail or behave inconsistently inside Odoo's native mobile app.

Chatter/files attachments have proven more reliable for mobile access.

## Locked rule

For every generated/signed/certificate artifact:

1. store the attachment on the source process record;
2. copy signed and certificate artifacts to `hr.employee` chatter/files;
3. keep icon buttons as desktop convenience controls;
4. do not rely on URL buttons as the only artifact access method;
5. use chatter messages to identify artifact type and lifecycle event.

## Mobile-safe acceptance

A process is not mobile-safe unless the user can open the final signed artifact from the employee record's chatter/files in the mobile app.

## Documents app

Odoo Documents may become the formal archive layer later.

Do not make Documents integration a blocker for Pass 13.
