# HR Job vs HR Applicant Gap Matrix

This document is the strict ownership matrix for the corrected recruitment model.

Canonical rule:

- `hr.job` is the baseline vacancy / position instance
- `hr.applicant` is the negotiated applicant-specific runtime instance of that vacancy
- `grc_recruitment_bridge` defines governed templates, rubrics, document types, signature profiles, and report layouts
- `hr_pool` remains intake only

This matrix is the authority for the next implementation pass.

## 1. Ownership matrix

| Artifact / workflow | `grc_recruitment_bridge` | `hr.job` baseline vacancy | `hr.applicant` negotiated runtime | Priority | Gap status |
|---|---|---|---|---|---|
| Role / job template | Defines template family, line rubric, provenance, defaulting rules | Selects the chosen template family for the vacancy | Inherits baseline template for negotiation and comparison | High | Implemented in source; verify on install |
| Functional area / function composition | Defines governed composition lines | Stores baseline mapping only | Stores negotiated final composition and deltas | High | Implemented in source; verify header/line filtering and semantics on install |
| Baseline TOR / job description | Defines report layout and rendering rules | Owns the vacancy TOR snapshot and attachment | Owns the negotiated final TOR and signed version | High | Implemented in source; verify baseline-vacancy and applicant-side rendering on install |
| Interview rubric | Defines questions, scoring criteria, weights, and routing profile | Links the vacancy to the rubric template | Creates and owns one or more live interview instances | High | Implemented in source; verify applicant-side runtime ownership on install |
| Interview evaluation record | Does not own the live case | May reference the vacancy baseline | Owns the live evaluation, scores, notes, PDF, signed PDF, chatter, and activities | High | Implemented in source; verify native sign launch and chatter/activity on install |
| Document checklist template | Defines required document types and defaults | Links the vacancy to the checklist template | Creates and owns the applicant-specific checklist instance | High | Implemented in source; verify auto-instantiation on install |
| Document checklist runtime | Defines document type catalog and line defaults | References baseline checklist policy | Owns the checklist header, lines, completion counter, and signed artifact | High | Implemented in source; verify completion counters and writeback on install |
| Document submission runtime | Defines the typed document catalog | May reference policy but does not own submission case | Owns one submission per uploaded document, with attachment and review state | High | Implemented in source; verify one-submission-per-document writeback on install |
| Declaration pack | Defines declaration families and signer routing | Links the vacancy to the declaration pack | Owns the applicant-specific declaration envelope(s) and signed outputs | High | Implemented in source; verify applicant-side envelope generation on install |
| Signature profile | Defines signer roles, order, and defaults | Selects the baseline profile for the vacancy | Applies the profile to the negotiated runtime envelope(s) | High | Implemented in source; verify native record-sign path on install |
| Documents foldering | Defines family-level folder intent | May hold the vacancy folder pointer | Owns the runtime folder pointer and filed evidence | Medium | Hooks exist; provisioning is still partly manual |
| Chatter / activities | Not owner | Can participate for baseline vacancy notes | Owns runtime traceability for the live case | Medium | Implemented in source; verify runtime polish on install |
| Arabic terminology | Defines canonical bridge vocabulary | Not owner | Not owner | Medium | Translation coverage is expanded; verify in-app localization on install |
| Code / sequence / provenance fields | Defines governance metadata shape | May show baseline source metadata | May show negotiated trace metadata | Medium | `x_code` and provenance behavior still need cleanup |

## 2. High-priority next implementation pass

The next implementation pass must focus on these items first:

1. `hr.job` baseline-vacancy cleanup
2. install/upgrade verification of the negotiated runtime surfaces
3. document-folder provisioning rules and standardization
4. final contract bundle flow
5. native Odoo Sign request verification on runtime records

## 3. Medium-priority next implementation pass

The next implementation pass should also include:

1. role template code sequencing and provenance cleanup
2. stricter functional area/function filtering on template lines
3. default template selection and fallback logic
4. PDF preview / inspector usability improvements
5. install-time validation of the Arabic catalog and runtime labels

## 4. Structural notes

- The bridge defines governed baseline structures only.
- `hr.job` stores the vacancy baseline.
- `hr.applicant` stores the negotiated case.
- runtime document artifacts always belong to the live record and the Documents store.
- if a field or tab mixes baseline and negotiated behavior, it should be split before the next install cycle.
