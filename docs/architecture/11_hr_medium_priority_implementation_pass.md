# HR Medium Priority Implementation Pass

This pass follows the high-priority structural pass.

Canonical rule:

- `hr.job` is the baseline vacancy / position instance
- `hr.applicant` is the negotiated applicant-specific runtime instance
- `grc_recruitment_bridge` defines governed templates, rubrics, document types, signature profiles, and routing

## 1. Scope

### 1.1 Documents folder standardization

Implement predictable foldering rules:

- vacancy-level folder pointer on `hr.job`
- applicant-level folder pointer on `hr.applicant`
- runtime folder provisioning rules
- subfolder conventions for evaluations, checklists, declarations, and final signed artifacts

### 1.2 Chatter and activities refinement

Refine the runtime chatter and activity flow:

- activity defaults for reviewer and applicant follow-up
- clear chatter visibility on runtime records
- attachment logging for generated and signed PDFs

### 1.3 Arabic translation completion

Complete Arabic coverage for:

- menus
- actions
- field labels
- report labels
- template family names
- runtime record names
- document type names

Use the corpus terminology and the canonical app label:

- `إجراءات التوظيف`

### 1.4 Role template sequencing and provenance cleanup

Clean up the bridge template metadata:

- auto-sequence `x_code` where appropriate
- keep provenance fields explicit and stable
- clarify `x_source_form_code` and `x_source_form_title`
- make `x_is_default` resolution deterministic

### 1.5 Functional area / function filtering

Tighten the role-template composition model:

- keep the baseline functional area anchored at the template level where possible
- filter functions by functional area
- prevent unconstrained line-level drift

### 1.6 Default template selection logic

Implement deterministic fallback logic for:

- role templates
- interview templates
- checklist templates
- declaration packs
- signature profiles

### 1.7 PDF preview and inspector usability

Improve the runtime UI so users can:

- preview generated PDFs
- inspect checklist and evaluation documents quickly
- navigate attachments without leaving the record

## 2. Required UI surfaces

The medium pass may refine:

- applicant-side notebook layout
- job baseline notebook layout
- document preview affordances
- attachment inspector behavior

## 3. Exit criteria

This pass is complete when:

1. Documents foldering is standardized
2. chatter and activities are polished on runtime records
3. Arabic translations are materially complete
4. template metadata is deterministic and sequence-safe
5. functional area / function filtering is constrained
6. default template resolution is deterministic
7. PDF preview and attachment inspection are usable in the runtime flow

