# Translation Delivery Plan

## 1. Rule

Every installable stage must ship with its own translation files for all user-facing labels that the stage introduces.

That includes:

- field labels
- help text
- selection labels
- action names
- menu names
- report strings
- button labels
- page/tab titles

## 2. File placement

Keep module translations inside the module archive:

- `modules/hr_pool/i18n/ar.po`
- `modules/hr_pool/i18n/ar_001.po`
- `modules/hr_recruitment_custom/i18n/ar.po`
- `modules/hr_recruitment_custom/i18n/ar_001.po`

If a stage adds new labels, the module archive is not complete until the corresponding PO files are updated.

## 3. Style rule

Use operational Arabic wording that matches day-to-day HR use.

Avoid:

- overly literal machine translations
- speculative glossary terms that are not already used by the team
- duplicate alternative labels for the same field

## 4. Delivery rule

Translations are part of the implementation pass, not a cleanup pass.

The order should be:

1. spec
2. code
3. translation update
4. install
5. UI verification
6. only then move to the next stage

## 5. Validation rule

After install, validate that:

- menus render in Arabic where expected
- form and report labels are translated
- selection values are readable in Arabic
- no important stage-specific field is left in English unless intentionally technical
