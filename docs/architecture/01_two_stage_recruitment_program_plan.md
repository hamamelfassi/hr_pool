# Two-Stage Recruitment Program Plan

## 1. Goal

Marsellia recruitment is split into two stages:

- Stage 1: public candidate intake, pooling, prescreening, and chairman control in `hr_pool`;
- Stage 2: formal Odoo-native recruitment, document gates, contract/preboarding, and employment handover in `hr_recruitment_custom` on top of native `hr_recruitment`.

The goal is to keep public intake lean and auditable while letting formal recruitment use Odoo native `hr.applicant`, `hr.job`, Sign, Documents, chatter, activities, employee, contract, and payroll-adjacent structures.

## 2. Stage 1 — `hr_pool`

Stage 1 owns the public and internal intake record.

It covers:

- Fillout/Zite public application intake;
- n8n ingestion into Odoo;
- candidate pool management;
- prescreening;
- reviewer recommendations;
- chairman decision;
- conversion request initiation;
- intake provenance and source metadata;
- source candidate data needed for later applicant creation.

The Stage 1 workflow is locked.

Future Stage 1 changes are additive only and are allowed when needed to support Stage 2 handover. Examples include:

- expanded Arabic name parts;
- gender;
- canonical location reference;
- municipality/city/district/region references derived from `grc_backbone`;
- minimal identity or residence fields required for contract and handover.

Stage 1 consent/declaration fields remain intake permissions and acknowledgements for storing and processing candidate data. They are separate from formal Stage 2 signed lifecycle declarations.

## 3. Stage 1 to Stage 2 handover

The handover from `hr_pool` to `hr.applicant` must be explicit and auditable.

Recommended control flow:

1. a conversion request is created from an `hr_pool` record;
2. the request references a target `hr.job`;
3. the request carries its own state;
4. chairman approval creates the native `hr.applicant`;
5. the applicant stores a read-only backlink to the originating pool record;
6. applicant core fields are populated from the pool record;
7. the applicant is linked to the selected `hr.job`;
8. the applicant stage is set to Qualification / Initial Qualification;
9. rejection returns the intake record to pooling or preserves it in Stage 1 according to existing workflow rules.

No formal recruitment documents are generated at Qualification.

## 4. Stage 2 native applicant lifecycle

Stage 2 maps Marsellia recruitment onto native `hr.applicant` stages.

The conceptual lifecycle is:

| Marsellia lifecycle block           | Native Odoo stage concept                                        | Purpose                                                      |
| ----------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| Qualification                       | Qualification / Initial Qualification                            | pool-to-applicant handover and normalization                 |
| Evaluation / Interviews             | First Interview / Second Interview or a unified Evaluation stage | assessment, document collection, legal-validity declaration  |
| Preboarding / Contract Proposal     | Contract Proposal                                                | board decision, employment contract, TOR, final declarations |
| Contract Signed / Handover Complete | Contract Signed                                                  | employee/contract/bank/payroll-relevant handover completed   |

If native First Interview and Second Interview create unnecessary ambiguity, the Marsellia process should treat them as one operational Evaluation / Interviews block. Manual movement between First and Second Interview may remain for convenience, but formal progression beyond Evaluation must be governed by document-gate completion.

## 5. Stage gate doctrine

Stage movement should not depend only on users manually dragging applicant cards.

Manual movement may remain available where it helps usability, but the authoritative gates are document lifecycle states in `x_hr.recruitment_document`.

The preferred pattern is:

- operational tabs create/generate/review/sign artifacts;
- `x_hr.recruitment_document` stores the artifact state;
- server actions or guarded actions move stages when required artifacts are signed;
- later-stage actions remain hidden, disabled, or operationally blocked until prerequisites are complete.

## 6. Evaluation / Interviews gate

The Evaluation / Interviews block begins when the first interview evaluation record is created or when the applicant is moved into the interview stage.

The block is complete only when these artifacts are signed:

| Artifact                             | Form   | Source / surface | Signer                                       |
| ------------------------------------ | ------ | ---------------- | -------------------------------------------- |
| Interview Evaluation                 | F-0002 | Evaluation tab   | interviewer only                             |
| Required Documents Checklist         | F-0003 | Documents tab    | HR/recruitment manager or authorized manager |
| Legal Documents Validity Declaration | F-0004 | Declarations tab | applicant + HR/recruitment manager           |

Only after all three are signed may the applicant move to Contract Proposal / Preboarding.

### 6.1 Implementation sequencing note

The Evaluation gate still requires signed F-0002, F-0003, and F-0004 before Contract Proposal.

However, after Pass 5E, F-0003 has proven the reusable QWeb/native Sign/registry pattern. The next implementation slice is Pass 6A, because the required-document submission/writeback loop is now the most important unproven reusable pattern.

F-0004 remains required for the Evaluation gate, but its implementation is intentionally deferred until the required-document submission foundation is proven.

## 7. Preboarding / Contract Proposal gate

Contract Proposal is the Marsellia preboarding contract package stage.

Despite the native wording “proposal”, this is where the formal contractual package is prepared and signed.

The required sequence is:

1. Board Decision;
2. Employment Contract;
3. TOR / Role and Duties F-0006;
4. Policies and Procedures Compliance Declaration F-0007;
5. Non-Disclosure Agreement F-0009.

Each step unlocks the next.

### 7.1 Board Decision

The board decision is an internal authorization to employ the applicant.

It is signed by the Chairman.

It should eventually be generated from reusable decision-template primitives in `grc_backbone`, then tracked in the recruitment document registry.

Signed board decision unlocks employment contract preparation.

### 7.2 Employment Contract

The official labor contract is the government/labor-ministry PDF template.

It is not a QWeb-generated Marsellia form.

It is treated as an uploaded/configured/static PDF/template artifact whose lifecycle is still tracked by `x_hr.recruitment_document`.

It is signed by:

- first party / Chairman;
- second party / applicant.

Signed employment contract generates the internal employee ID used by TOR and employment handover.

The legal PDF contract and Odoo `hr.contract` are related but not the same object.

### 7.3 TOR / Role and Duties

The TOR can be authored earlier in the `Role and Duties` tab, but TOR PDF generation/signing is gated by the signed employment contract.

The TOR uses:

- page 1 fixed signature block;
- page 2+ dynamic duties annex;
- generated employee ID;
- applicant signature;
- HR/recruitment manager countersign.

### 7.4 Final declarations

F-0007 and F-0009 are QWeb-generated single-page declarations.

They are applicant-signed lifecycle documents tracked by the registry.

They are separate from Stage 1 intake consent/declaration fields.

## 8. Contract Signed / handover complete

The native Contract Signed stage means the recruitment-to-employment handover has completed successfully.

It does not merely mean the legal contract was signed.

The handover action should:

- create or link `hr.employee`;
- backfill the relationship between `hr.applicant` and `hr.employee`;
- create or link `hr.contract`;
- write payroll-relevant values where available;
- create or link `res.partner.bank`;
- write employee ID and core employee data;
- link or attach signed recruitment artifacts;
- move the applicant to Contract Signed after the handover completes.

## 9. Applicant operational cockpit

`hr.applicant` is the Stage 2 process cockpit.

Locked operational tabs:

1. `Role and Duties`
2. `Evaluation`
3. `Documents`
4. `Declarations`
5. `Contract`

The topbar smart button `Recruitment Documents` opens the filtered lifecycle registry for the current applicant.

Tabs are where work is performed.

The registry is where formal artifact lifecycle is tracked.

## 10. Recruitment document registry

`x_hr.recruitment_document` tracks every formal artifact.

Locked document types:

- `interview_evaluation` — F-0002
- `required_documents_checklist` — F-0003
- `legal_documents_validity_declaration` — F-0004
- `board_decision`
- `employment_contract`
- `tor` — F-0006
- `policies_compliance_declaration` — F-0007
- `non_disclosure_agreement` — F-0009
- `other`

The registry tracks:

- applicant;
- document type;
- state;
- version;
- generated/uploaded artifact;
- signed artifact;
- source model and record;
- responsible user;
- dates;
- Sign request reference where available.

## 11. Signature layout standard

Generated signable QWeb forms must use:

- page 1 fixed identity / summary / signature layout;
- dynamic detail tables on page 2+ where needed;
- Arabic-first visual style;
- fixed header/footer where appropriate;
- Google Al Yamama Arabic font where configured;
- stable geometry for Odoo Sign placement.

The old final-signature-page pattern is superseded.

## 12. Delivery discipline

Each pass should be:

1. documented;
2. patched;
3. installed/upgraded;
4. tested;
5. summarized;
6. committed before the next pass begins.

No parallel implementation tracks.

## Pass 9 implementation lock — Employment Contract / F-0005

Date: 2026-05-23

The Stage 2 employment contract pass is locked.

The F-0005 official labor contract is no longer treated as a future external/static-only artifact. It is now generated from the recruitment system using the official template page images as immutable QWeb backgrounds.

The applicant contract tab is the compact operational surface. The standalone `x_hr.applicant_employment_contract` form is the detailed contract cockpit.

F-0005 completion remains one part of the Contract Proposal / Preboarding package. It does not alone unlock native employment handover.

The required preboarding package remains:

```text
Board Decision
Employment Contract / F-0005
TOR / F-0006
F-0007
F-0009
```

Native handover remains deferred until the full package is complete.


## Handover endpoint to `hr_employment_custom`

The two-stage recruitment program ends when the applicant is ready for formal employment handover.

The handover is implemented by `hr_employment_custom` Pass 13 and creates/links:

- `hr.employee`;
- `hr.contract`;
- native `res.partner.bank` bank account;
- payroll-readiness fields;
- signed recruitment artifact history on the employee chatter/files.

The final recruitment gate requires Board Decision, F-0005, F-0006, F-0007, and F-0009 completion. Ministry accreditation is tracked but is not a handover blocker.
