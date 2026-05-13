# MCEP Odoo Patch Methodology and Reusable UI/Translation Patterns

Status: Working doctrine for the Marsellia / MCEP Odoo SaaS IMS project  
Applies to: `hr_recruitment_custom`, `hr_pool`, `grc_backbone`, and future SaaS-safe XML/data modules  
Primary environment: Odoo.com Enterprise SaaS 19.2

## 1. Purpose

This document defines two approved implementation modes for the project:

1. **Manual Surgical Patch Mode**
2. **Rapid Scripted Patch Mode**

Both are valid. The mode must be chosen deliberately before a pass or sub-pass begins.

The goal is to keep development fast without losing architectural clarity, review discipline, or Odoo SaaS safety.

## 2. Core Rules That Always Apply

These rules apply in both modes.

- The current repo tree is the source of truth.
- Do not patch from temporary extracted zips as the source of truth.
- Do not generate patched module zips unless explicitly requested.
- Existing files are patched surgically, not broadly rewritten.
- New files may be generated fully only when their scope is accepted.
- Every XML, report, view, and server-action change needs sanity checks before build.
- Build locally using:

```bash
./scripts/build_module_zip.sh <module_name>
```

- Generated PDFs, screenshots, exported zips, and temporary files are not committed.
- Odoo.com SaaS constraints govern the implementation: no custom Python addon hooks, no server filesystem assumptions, no unsafe database assumptions.
- Failed install attempts must be diagnosed before adding more changes.

## 3. Manual Surgical Patch Mode

### 3.1 When to Use

Use Manual Surgical Patch Mode when:

- The workflow is new or not yet proven.
- The file contains complex XML, QWeb, or server-action logic that needs human review.
- The patch changes business logic, security logic, gates, lifecycle state, or registry semantics.
- The implementation involves a new model, new report, new Sign pattern, new n8n/Fillout mapping, or new gate.
- The user needs to learn the implementation pattern by going through the motions.
- Prior attempts caused traceback loops or visual regressions.
- The risk of a “Frankenstein” patch is high.

### 3.2 Output Format

Manual patches should be given as:

```text
File:
modules/<module_name>/<path>/<file>.xml

Find:
<exact existing block>

Replace with:
<exact replacement block>
```

or:

```text
File:
...

Add after:
<exact anchor block>

Insert:
<new block>
```

or:

```text
File:
...

Delete:
<exact block>
```

### 3.3 Required Steps

1. State the pass/sub-pass scope.
2. List the exact files touched.
3. Explain the purpose of each change.
4. Give find/add/delete/replace steps with placement anchors.
5. Provide XML/server-action sanity checks.
6. Build locally.
7. Upgrade on Odoo SaaS.
8. Test one narrow acceptance path.
9. Fix traceback loop if needed.
10. Commit only after acceptance.

### 3.4 Strengths

- Best for learning.
- Best for careful review.
- Best for high-risk logic.
- Easier to diagnose when something breaks.
- Prevents hidden churn.

### 3.5 Weaknesses

- Slower.
- More manual copy/paste.
- Easy to miss repeated patterns across multiple files.

## 4. Rapid Scripted Patch Mode

### 4.1 When to Use

Use Rapid Scripted Patch Mode when:

- The pattern is already proven in the project.
- The change is repetitive across files.
- The target blocks are known and stable.
- The change is mostly mechanical: labels, translations, repeated button blocks, safe display-name normalization, simple server-action refactors.
- The script includes guardrails that fail if the expected block is not found.
- The user has already received and understood the implementation explanation or mini-wiki.

Good examples:

- Applying known Arabic UI label rules across many views.
- Reusing a proven Odoo Sign send/sync pattern after the pattern is documented.
- Renaming generated display names using accepted policy.
- Repairing known bad calls such as `line.message_post` on models without chatter.
- Running sanity checks across a known set of XML files.

### 4.2 Required Pre-Script Explanation

Before running rapid scripted patches, provide a short explanatory wiki covering:

- What the patch changes.
- Why it is safe enough to script.
- Which files it touches.
- Which workflow pattern it reuses.
- Which parts remain uncertain or require calibration.
- What the rollback/inspection points are.

### 4.3 Script Requirements

Rapid patch scripts must:

- Use exact block replacement where possible.
- Fail loudly if the expected block is not found.
- Avoid broad regex rewrites unless the target is tightly bounded.
- Print the files patched.
- Preserve UTF-8.
- Avoid generated zips, screenshots, PDFs, and temporary files.
- Include a follow-up sanity check.

Preferred pattern:

```python
from pathlib import Path

p = Path("modules/example/file.xml")
s = p.read_text(encoding="utf-8")

old = """exact block"""
new = """replacement block"""

if old not in s:
    raise SystemExit("Expected block not found; stop and inspect manually.")

s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("patched", p)
```

### 4.4 Required Steps

1. Explain the patch logic in plain language.
2. Confirm it is reusing a proven pattern.
3. Run the script.
4. Run sanity checks.
5. Build locally.
6. Upgrade on Odoo SaaS.
7. Test the narrow acceptance path.
8. If traceback occurs, stop and diagnose before adding scope.
9. If visual calibration is needed, patch only the calibrated values.
10. Commit after acceptance.

### 4.5 Strengths

- Fast.
- Good for repeated mechanical changes.
- Reduces copy/paste mistakes.
- Strong for applying a standardized pattern.

### 4.6 Weaknesses

- Can hide complexity.
- Can cause multi-file churn.
- Can produce mixed logic if used before the pattern is mature.
- Can reduce learning if used without explanation.

### 4.7 Additional Guardrails Learned from Pass 6E

Pass 6E confirmed that Rapid Scripted Patch Mode is useful, but only when the target is tightly bounded and the reusable pattern has been inspected against the actual current module files.

Rapid scripted patches must not rely on broad replacements against generic field names.

Avoid global replacements such as:

* `<field name="x_line_ids">`  
* `<field name="x_name">`  
* `<field name="x_state">`  
* `message_post`  
* `x_signed_on`  
* `x_generated_on`

These names may appear in multiple models, embedded views, child lines, or unrelated lifecycle surfaces.

Correct approach:

* Identify the exact file.  
* Identify the exact server action, view, tab, or embedded model.  
* Use a distinctive anchor from the local context.  
* Patch only that bounded block.  
* Run XML validation.  
* Compile embedded server-action Python code.  
* Upgrade and test one narrow lifecycle path.

Example of safe targeting:

* Patch the interview scoring line block only if the surrounding block contains both `x_question_label_ar` and `x_actual_score`.  
* Do not patch every `x_line_ids` field in the applicant view.

### 4.8 Date and Lifecycle Repair Guardrails

Date repair actions are high-risk and should not be added casually.

Do not create generic repair actions for test records in a fresh database unless there is a deliberate production migration need.

Lifecycle dates must come from the correct event source:

* Generated On \= report generation or generated attachment creation event.  
* Sent On \= Odoo Sign request creation or actual send timestamp.  
* Signed On \= completed signer item timestamp or final Odoo Sign completion timestamp.

Never derive Sent On from Generated On when a linked Odoo Sign request exists.

Never derive Signed On from the time a later repair action was run unless there is no better source and the action is explicitly labelled as a repair.

Temporary repair tools created only to fix fake test records should be removed before locking the pass.

### 4.9 Segmented Rapid Patch Standard

For complex workflows, Rapid Scripted Patch Mode must be segmented.

Preferred sequence:

1. Preflight check.  
2. One model or server-action concern.  
3. One view concern.  
4. One helper or button concern.  
5. Embedded Python compilation check.  
6. XML parse check.  
7. Build.  
8. Upgrade.  
9. Narrow acceptance test.  
10. Documentation update.

Do not combine lifecycle logic, view layout, field readonly rules, date repair, status transitions, and translation changes in one large patch script unless the pattern is already fully proven and the replacements are strictly bounded.

### 4.10 Recovery After Rapid Patch Error

If a rapid patch introduces a traceback or lifecycle inconsistency:

1. Stop adding new scope.  
2. Inspect the exact generated file.  
3. Identify whether the issue is XML syntax, embedded Python syntax, view validation, access inconsistency, or business lifecycle logic.  
4. Patch the smallest possible corrective block.  
5. Add the failed pattern to this methodology document if it is a reusable lesson.  
6. Do not proceed to the next pass until the affected workflow has passed a fresh acceptance test.

## 5. Mode Selection Rule

Use this decision rule:

```text
New or risky workflow?          → Manual Surgical Patch Mode
Proven reusable pattern?        → Rapid Scripted Patch Mode
Need to learn/review deeply?    → Manual Surgical Patch Mode
Repeated known mechanical work? → Rapid Scripted Patch Mode
Traceback loop active?          → Manual Surgical Patch Mode until stable
Visual calibration only?        → Small scripted patch or manual one-line patch
```

## 6. Hybrid Mode

Hybrid mode is allowed and often preferred.

Example:

```text
Manual:
- Explain the lifecycle.
- Inspect existing action.
- Define exact intended behavior.

Scripted:
- Apply the known repeated pattern.
- Run sanity checks.

Manual:
- Test visually.
- Calibrate coordinates/layout.
- Review final diff.
```

This is the preferred mode for reused QWeb/Sign flows.

## 7. Reusable Arabic Translation and UI Patterns

### 7.1 Arabic-First Operational UI

For Marsellia operational users, Arabic is the primary UI language.

Use Arabic-first labels for:

- form titles;
- button labels;
- status labels;
- helper text;
- tab labels;
- generated display names;
- toast messages;
- chatter messages where the target user is internal Arabic-speaking staff.

English may remain in:

- technical field names;
- XML IDs;
- model names;
- code comments;
- report/template reference codes;
- formal bilingual documents where English is part of the source artifact;
- documentation where English improves developer clarity.

### 7.2 Avoid Technical Jargon in UI Labels

UI labels should describe the user action, not the implementation.

Prefer:

```text
إنشاء المستند
إرسال للتوقيع
مزامنة نتيجة التوقيع
تنزيل
فتح
رفع مستند
اعتماد التقديم
رفض التقديم
```

Avoid user-facing labels like:

```text
Registry
Source Model
Server Action
Technical Reference
Writeback
Foreign Key
Res ID
Attachment ID
```

Technical terms can remain in:

- field technical names;
- documentation;
- developer-only notes;
- hidden fields;
- reference sequences.

### 7.3 Keep Formal References Where Needed

Document/form references should remain exact and stable:

```text
F-0002
F-0003
MCEP-HR-F-0003-00004
```

Do not over-translate formal codes.

Acceptable labels:

```text
إنشاء ملف F-0003
تنزيل ملف F-0003 الموقّع
إرسال F-0002 عبر توقيع أودو
```

### 7.4 Generated Display Names

Generated operational names should be Arabic-first.

Preferred patterns:

```text
قائمة #1
طلب #1
السيرة الذاتية / تقديم #1
طلب #1 / السيرة الذاتية
تقييم المقابلة - <اسم المتقدم> - v1
```

For document labels, use Arabic first:

```python
document_label = (
    line.x_document_name_ar
    or line.x_document_name_en
    or document_type.x_name_ar
    or document_type.x_name_en
    or document_type.x_name
    or 'المستند المطلوب'
)
```

### 7.5 Helper Text

Helper text should be short, practical, and visible as text content, not fake attributes.

Use:

```xml
<div class="alert alert-info">
    احفظ تغييرات بنود القائمة قبل التحديث. تصبح القائمة جاهزة فقط عندما تكون جميع البنود المطلوبة مقبولة.
</div>
```

Avoid:

```xml
<span string="..."/>
```

because it can render as an empty element and create a blank banner.

### 7.6 Buttons

Primary workflow buttons should use clear Arabic labels.

Examples:

```xml
<button string="إنشاء المستند" .../>
<button string="إرسال للتوقيع" .../>
<button string="مزامنة نتيجة التوقيع" .../>
<button string="اعتماد التقديم" .../>
<button string="رفض التقديم" .../>
```

For object/icon helper buttons inside rows, use icon-only helpers with tooltips.

Examples:

```xml
<button type="object" name="..." icon="fa-upload" title="رفع مستند"/>
<button type="object" name="..." icon="fa-external-link" title="فتح"/>
<button type="object" name="..." icon="fa-download" title="تنزيل"/>
```

Use icon-only helpers for inline/in-row/in-form utilities when the meaning is simple and repeated.

### 7.7 Status Badges

All important state/status fields should display as colored badges wherever practical.

Use badge decoration patterns in list/tree views and inline one2many rows.

Typical mapping:

```xml
decoration-success="x_state in ('accepted', 'signed', 'completed')"
decoration-warning="x_state in ('submitted', 'prepared', 'sent', 'signature_requested', 'in_review')"
decoration-danger="x_state in ('rejected', 'cancelled', 'expired')"
decoration-muted="x_state in ('draft', 'missing', 'superseded')"
```

For checklist line statuses:

```text
مقبول       → success
مقدم        → warning
مرفوض       → danger
ناقص        → muted/danger depending on context
مستبدل      → muted
غير منطبق   → muted
```

For document lifecycle states:

```text
مسودة               → muted
قيد المراجعة         → warning
جاهز لإنشاء المستند  → info/warning
منشأ                → info
تم طلب التوقيع       → warning
موقّع               → success
ملغى                → danger/muted
```

### 7.8 Attachments and Download/Open/Upload Helpers

Attachment fields should be controlled:

- readonly when lifecycle-locked;
- `no_open` where accidental opening is confusing;
- `no_create` / `no_create_edit` for controlled relations;
- explicit icon helper buttons for open/download/upload.

Preferred user-facing pattern:

```text
main attachment field: visible but controlled
download button: icon-only
open button: icon-only
manual upload button: icon-only
```

### 7.9 Chatter Messages

Chatter messages should be concise and business-readable.

Prefer:

```text
تم إنشاء تقديم يدوي للمستند المطلوب: السيرة الذاتية.
تم إرسال F-0003 للتوقيع عبر أودو.
تمت مزامنة نتيجة التوقيع وربط المستند الموقّع بالسجل.
```

Avoid exposing implementation internals unless debugging:

```text
source_res_id updated
registry writeback complete
server action executed
```

### 7.10 Translation File Strategy

Use the live Odoo-exported PO as the base when translation refs are uncertain.

Preferred translation loop:

1. Install/upgrade module.
2. Export Arabic translations from Odoo.
3. Patch the exported PO.
4. Replace module `i18n/ar_001.po` only after preserving UTF-8 plain text.
5. Rebuild and upgrade.
6. Verify UI.
7. Avoid creating duplicate `ir.model.fields.selection` rows.

Do not generate fake references such as:

```text
#: pass6d_translation_recovery
```

Do not create explicit `ir.model.fields.selection` rows for existing field/value pairs unless binding to existing rows is proven safe.

## 8. QWeb and Odoo Sign Reuse Rule

For QWeb/Sign workflows, distinguish between:

```text
Structural pattern reuse
```

and:

```text
visual coordinate/layout calibration
```

A Sign lifecycle can be reused from a proven pattern, but signature coordinates must be calibrated against the actual generated PDF.

Required note for every Sign reuse patch:

```text
The lifecycle pattern is reused.
The exact signature coordinates are a first-pass placement unless measured from the actual generated PDF or previously proven in Odoo Sign preview.
```

## 9. Commit Discipline

Each pass or sub-pass commit should be narrow.

Commit only source files.

Never commit:

- built module zips;
- screenshots;
- generated PDFs;
- downloaded signed documents;
- temporary scripts unless intentionally added as reusable tools;
- local export artifacts unless deliberately used as source material.

Recommended commit message format:

```bash
git commit -m "pass6e: retrofit F-0002 native sign lifecycle" \
  -m "Reuses the proven F-0003 native Sign send/sync pattern for F-0002 interview evaluation, with interviewer-only signing and registry synchronization."
```

## 10. Invocation Phrases

Use these phrases to select the mode cleanly.

Manual:

```text
Use Manual Surgical Patch Mode for this pass.
Give me exact find/add/delete/replace instructions.
```

Rapid:

```text
Use Rapid Scripted Patch Mode.
First give me the explanatory wiki, then the guarded Python patch and sanity checks.
```

Hybrid:

```text
Use Hybrid Mode.
Explain the design manually, script the repetitive patch, then walk me through the calibration/review.
```
