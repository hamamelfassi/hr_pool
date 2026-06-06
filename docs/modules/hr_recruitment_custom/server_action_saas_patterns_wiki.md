# Odoo SaaS Server Action Patterns Wiki

This wiki records safe implementation patterns for Odoo.com SaaS 19.2 server actions used by `hr_recruitment_custom`.

The module relies heavily on XML-defined models, views, reports, and server actions because this project targets Odoo.com SaaS, not Odoo.sh or a self-hosted custom Python addon runtime.

## 1. Do not use `raise Warning(...)`

On Odoo.com SaaS 19.2, `Warning` is not available inside server-action safe-eval context.

This pattern fails:

```python
raise Warning("Human-readable validation message.")
```

Observed failure:

```text
NameError: name 'Warning' is not defined
```

Do not use this in new server actions.

## 2. Prefer toast guards for recoverable business validation

For user-correctable validation cases, use `display_notification`.

Example:

```python
action = {
    'type': 'ir.actions.client',
    'tag': 'display_notification',
    'params': {
        'title': 'Submitted attachment missing',
        'message': 'Cannot accept this submission because no submitted attachment is linked.',
        'type': 'warning',
        'sticky': False,
    }
}
continue
```

Use this for guard cases such as:

* missing attachment;
* missing reviewer note;
* missing selected checklist;
* invalid lifecycle state;
* duplicate-prevention notices;
* action blocked because another artifact already exists.

## 3. Preserve toast actions; do not overwrite them with reload

If a server action sets a toast notification and later unconditionally sets reload, the toast is lost.

Bad pattern:

```python
action = {
    'type': 'ir.actions.client',
    'tag': 'display_notification',
    'params': {
        'title': 'Validation',
        'message': 'Something is missing.',
        'type': 'warning',
        'sticky': False,
    }
}
continue

action = {'type': 'ir.actions.client', 'tag': 'reload'}
```

Correct pattern:

```python
action = False

for rec in records.sudo():
    if not rec.x_attachment_id:
        action = {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Submitted attachment missing',
                'message': 'Cannot accept this submission because no submitted attachment is linked.',
                'type': 'warning',
                'sticky': False,
            }
        }
        continue

    # normal write logic here

if not action:
    action = {'type': 'ir.actions.client', 'tag': 'reload'}
```

This preserves validation toasts while still refreshing after successful actions.

## 4. Sticky vs non-sticky notifications

Use `sticky: False` for simple user-correctable omissions:

```python
'sticky': False
```

Examples:

* missing submitted attachment;
* missing reviewer note;
* missing optional step before proceeding.

Use `sticky: True` for structural or unexpected linkage problems:

```python
'sticky': True
```

Examples:

* applicant missing;
* checklist missing;
* checklist line missing;
* source document not linked;
* generated artifact unavailable.

## 5. Success reload pattern

For successful state-changing server actions, use reload:

```python
action = {'type': 'ir.actions.client', 'tag': 'reload'}
```

This is appropriate after:

* accepting a document submission;
* rejecting a document submission;
* syncing a signed artifact;
* normalizing record names;
* validating readiness;
* generating controlled records.

## 6. Server action guard template

Use this template for new guarded server actions:

```python
action = False

for rec in records.sudo():
    if not rec:
        action = {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Missing record',
                'message': 'The action could not run because no record was selected.',
                'type': 'warning',
                'sticky': True,
            }
        }
        continue

    # validation guard
    if not rec.x_required_field_id:
        action = {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Required field missing',
                'message': 'Please complete the required field before running this action.',
                'type': 'warning',
                'sticky': False,
            }
        }
        continue

    # successful write logic
    rec.sudo().write({
        'x_state': 'done',
    })

if not action:
    action = {'type': 'ir.actions.client', 'tag': 'reload'}
```

## 7. Chatter messages

Use chatter for audit trail, not for immediate validation.

Good use cases:

```python
rec.message_post(body="Required document submission accepted.")
applicant.message_post(body="F-0003 checklist evidence accepted.")
```

Do not rely on chatter alone for action-blocking feedback. Use toast notifications for immediate user feedback.

## 8. Pass 6A-3 confirmed pattern

Pass 6A-3 uses this pattern for required document submission review:

* Accept without attachment:

  * shows toast warning;
  * does not crash;
  * does not change state.
* Reject without reviewer note:

  * shows toast warning;
  * does not crash;
  * does not change state.
* Accept with attachment:

  * submission becomes `accepted`;
  * previous accepted submission for the same checklist line becomes `superseded`;
  * checklist line becomes `accepted`;
  * latest accepted submission and attachment are written to the checklist line.
* Reject with reviewer note:

  * submission becomes `rejected`;
  * checklist line becomes `resubmission_requested` if no accepted submission exists.
* Validate Readiness:

  * reads accepted submissions as the source of truth;
  * manual checklist statuses are normalized back to real evidence state.

## 9. Related files

Implementation examples:

* `modules/hr_recruitment_custom/data/12_required_document_checklist_pdf_actions.xml`
* `modules/hr_recruitment_custom/data/15_required_document_submission_review_actions.xml`
* `modules/hr_recruitment_custom/data/11_required_document_checklist_actions.xml`

Related documentation:

* `docs/modules/hr_recruitment_custom/native_odoo_sign_workflow_wiki.md`
* `docs/modules/hr_recruitment_custom/report_generation_wiki.md`

````

<!-- R10_RUNTIME_TRANSLATION_DOCTRINE -->
## R10 runtime translation doctrine for server actions

Server-action user messages have two categories:

- display_notification / toast messages
- future chatter messages

### Toast / display_notification messages

For server-action notifications, use a local helper pattern such as:

```python
UI_TEXT_AR = {
    "English source message": "Arabic translated message",
}

def ui_text(text):
    try:
        lang = env.user.lang or ''
    except Exception:
        lang = ''

    if lang.startswith('ar') and text in UI_TEXT_AR:
        return UI_TEXT_AR[text]

    return text
```

Then wrap notification payloads:

```python
'params': {
    'title': ui_text(title),
    'message': ui_text(message),
    'type': kind,
    'sticky': sticky,
}
```

or direct literals:

```python
'title': ui_text('English source title')
'message': ui_text('English source message')
```

The source key should be English. Arabic literals should not be used as the source key in new server-action notifications.

### Future chatter messages

For future chatter, use `chatter_text(...)`:

```python
message_post(body=chatter_text('English source message'))
```

Important boundary:

R7F affects future chatter only. Existing chatter already posted on old test records is not backfilled.

### Pattern with dynamic values

Dynamic messages should use stable `%s` source templates:

```python
message_post(body=chatter_text('F-0003 checklist sent through native Odoo Sign. Request ID: %s.' % request_id))
```

The helper may pattern-match the rendered text to translate the dynamic value.

### Do not mix runtime translations with PO-only view translations

Use PO files for:

- views
- menus
- actions
- field labels
- selection labels
- inline helper alerts in XML

Use `ui_text()` / `chatter_text()` for:

- server-action display_notification payloads
- server-action toast helpers
- future message_post bodies
