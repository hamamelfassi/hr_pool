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
| Role / job template | Defines template family, line rubric, provenance, defaulting rules | Selects the chosen template family for the vacancy | Inherits baseline template for negotiation and comparison | High | Template definitions exist; vacancy/runtime split still needs UI cleanup |
| Functional area / function composition | Defines governed composition lines | Stores baseline mapping only | Stores negotiated final composition and deltas | High | Current source still needs stricter header/line semantics and filtering rules |
| Baseline TOR / job description | Defines report layout and rendering rules | Owns the vacancy TOR snapshot and attachment | Owns the negotiated final TOR and signed version | High | Current `hr.job` TOR flow still needs baseline-only treatment and applicant-side finalization |
| Interview rubric | Defines questions, scoring criteria, weights, and routing profile | Links the vacancy to the rubric template | Creates and owns one or more live interview instances | High | Template exists; runtime UI/flow needs applicant-side final ownership |
| Interview evaluation record | Does not own the live case | May reference the vacancy baseline | Owns the live evaluation, scores, notes, PDF, signed PDF, chatter, and activities | High | Runtime model exists; applicant-side UI and sign actions still need completion |
| Document checklist template | Defines required document types and defaults | Links the vacancy to the checklist template | Creates and owns the applicant-specific checklist instance | High | Template exists; automatic runtime instantiation still needs wiring |
| Document checklist runtime | Defines document type catalog and line defaults | References baseline checklist policy | Owns the checklist header, lines, completion counter, and signed artifact | High | Runtime model exists; checklist completion and writeback flow still need completion |
| Document submission runtime | Defines the typed document catalog | May reference policy but does not own submission case | Owns one submission per uploaded document, with attachment and review state | High | Runtime model exists; external writeback flow from Fillout/Zite/n8n still needs wiring |
| Declaration pack | Defines declaration families and signer routing | Links the vacancy to the declaration pack | Owns the applicant-specific declaration envelope(s) and signed outputs | High | Definition exists; runtime envelope flow on applicant side still needs completion |
| Signature profile | Defines signer roles, order, and defaults | Selects the baseline profile for the vacancy | Applies the profile to the negotiated runtime envelope(s) | High | Definitions exist; record-level signature actions still need finishing |
| Documents foldering | Defines family-level folder intent | May hold the vacancy folder pointer | Owns the runtime folder pointer and filed evidence | Medium | Hooks exist; provisioning is still partly manual |
| Chatter / activities | Not owner | Can participate for baseline vacancy notes | Owns runtime traceability for the live case | Medium | Hooks exist but runtime UI wiring still needs completion |
| Arabic terminology | Defines canonical bridge vocabulary | Not owner | Not owner | Medium | Translation coverage is partial |
| Code / sequence / provenance fields | Defines governance metadata shape | May show baseline source metadata | May show negotiated trace metadata | Medium | `x_code` and provenance behavior still need cleanup |

## 2. High-priority next implementation pass

The next implementation pass must focus on these items first:

1. `hr.job` baseline-vacancy cleanup
2. `hr.applicant` negotiated-runtime UI and workflow surfaces
3. interview evaluation runtime ownership on the applicant side
4. document checklist runtime ownership on the applicant side
5. document submission writeback flow, one document per submission
6. baseline TOR versus negotiated TOR split
7. declaration envelope runtime ownership on the applicant side
8. sign request actions from runtime records

## 3. Medium-priority next implementation pass

The next implementation pass should also include:

1. Documents folder provisioning rules and standardization
2. chatter and activities on the runtime records
3. Arabic translation completion for the recruitment bridge and runtime labels
4. role template code sequencing and provenance cleanup
5. stricter functional area/function filtering on template lines
6. default template selection and fallback logic
7. PDF preview / inspector usability improvements

## 4. Structural notes

- The bridge defines governed baseline structures only.
- `hr.job` stores the vacancy baseline.
- `hr.applicant` stores the negotiated case.
- runtime document artifacts always belong to the live record and the Documents store.
- if a field or tab mixes baseline and negotiated behavior, it should be split before the next install cycle.

