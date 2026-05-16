# Master Architecture and Program Plan

## 1. Purpose

This document is the top-level architectural compass for the Marsellia / MCEP Odoo SaaS program.

It defines the stable module boundaries, native-first extension posture, documentation authority rules, and the locked sequential pass plan for the recruitment-to-employment program.

Detailed implementation rules belong in the stage-specific specs and pass execution plans.

## 2. Operating posture

Marsellia is building a governed enterprise management system on Odoo SaaS.

The operating constraints are:

- use Odoo native applications wherever they already provide the workflow engine;
- use custom importable modules only for missing data structures, controlled linkages, QWeb reports, and safe server-action automation;
- avoid Odoo.sh / custom Python addon assumptions unless explicitly re-scoped later;
- keep modules separately zippable and installable;
- keep external integration resources outside shipped module zips;
- use n8n, Fillout/Zite, and Google/Office tooling as integration edges, not as replacement systems of record.

## 3. Canonical module boundaries

### 3.1 `grc_backbone`

`grc_backbone` is the reusable governance, reference, taxonomy, and decision-engine foundation for the Marsellia / MCEP Odoo SaaS IMS program.

It must not become an operational recruitment app. It provides governed reference data, reusable patterns, variables, provisions, decision templates, and cross-module governance primitives that can be consumed by HR, recruitment, HSE, operations, compliance, finance, contracts, and future Odoo-native workflows.

The active target doctrine is now unified and strongly typed:

- `x_grc.governance_reference` is the canonical authority/source record. It covers laws, regulations, frameworks, standards, policies, procedures/SOPs, decisions, letters, memos, meeting minutes, free-text references, and other authority sources through a type field, not through separate fragmented source models.
- `x_grc.governance_reference_relation` models hierarchy and relationships between references, such as implements, amends, supersedes, cites, interprets, depends on, derived from, and replaces.
- `x_grc.governance_provision` models granular clauses, articles, controls, requirements, and obligations under any governance reference.
- `x_grc.variable` is the global reusable variable dictionary for document generation, workflow texts, and future structured governance automation.
- `x_grc.governance_text_pattern` stores reusable text fragments such as subjects, basis lines, articles, clauses, footers, signature blocks, and general reusable wording.
- `x_grc.decision_family`, `x_grc.decision_type`, and `x_grc.decision_profile` define governed decision categories and authority defaults.
- `x_grc.decision_template` assembles controlled reusable decision documents from references, provisions, patterns, and variables.
- `x_grc.decision_instance` will represent actual case-specific generated decisions created from templates.
- `x_grc.functional_area`, `x_grc.function`, and `x_grc.location` remain reusable taxonomy primitives.

The core semantic rule is:

- Governance Reference = authority/source.
- Governance Provision = granular clause, article, control, requirement, or obligation.
- Governance Text Pattern = reusable wording.
- Variable = reusable data slot.
- Decision Template = controlled document assembly.
- Decision Instance = case-specific generated decision.

The previous fragmented scaffold models for frameworks, policies, provisions, decisions, SOPs, task templates, risks, controls, incidents, commercial clauses, tenders, and related early experimental governance objects are superseded as active architecture unless deliberately reintroduced later through the unified governance-reference/provision/pattern doctrine.

Task templates and task-template lines from the old SOP scaffold are retired from the active architecture and may be deleted/rebuilt later. Future task/action templates should be redesigned from governance references, provisions, workflows, controls, and evidence obligations.

### 3.2 `hr_pool`

`hr_pool` is the Stage 1 public/intake and candidate-pool layer.

It owns:

- public candidate intake;
- external Fillout/Zite/n8n ingestion;
- candidate pooling;
- prescreening;
- reviewer recommendations;
- chairman decisions;
- conversion request initiation;
- intake provenance;
- intake-side audit trail;
- intake identity and preference data needed for later conversion.

The Stage 1 workflow is locked and should remain stable.

Future changes to `hr_pool` are additive field uplifts only, such as expanded Arabic name parts, gender, and canonical location references needed by Stage 2 and later employment handover.

### 3.3 `hr_recruitment_custom`

`hr_recruitment_custom` is the Stage 2 native recruitment extension layer.

It extends Odoo native Recruitment rather than replacing it.

It owns:

- governed `hr.job` extensions;
- governed `hr.applicant` extensions;
- applicant-side printable identity fields;
- negotiated role / TOR authoring;
- interview/evaluation enrichment;
- required-document collection and review workflow;
- declaration generation and signature routing;
- contract/preboarding authoring surfaces;
- recruitment document registry/lifecycle tracking;
- gated handover from `hr.applicant` to `hr.employee`, `hr.contract`, bank, and payroll-relevant structures.

### 3.4 Native Odoo HR modules

Native Odoo modules remain the operational backbone for:

- Recruitment applicant pipeline;
- employee records;
- contracts;
- payroll-relevant contracts and compensation data;
- chatter;
- activities;
- attachments;
- Documents;
- Sign.

Custom modules should add only the missing MCEP-specific structures and orchestration.

### 3.5 Future employment lifecycle extension

The post-handover employment lifecycle should be designed separately after recruitment handover is stable.

That future track may cover:

- employee onboarding;
- HSE declarations;
- training;
- company card receipt;
- asset and vehicle receipt;
- day-to-day HR administration;
- time management;
- payroll administration;
- employee-side document lifecycle.

It should not be mixed into the recruitment build before Stage 2 handover is stable.

## 4. Native-first extension rule

When Odoo already owns a workflow, Marsellia custom modules extend it instead of recreating it.

This means:

- `hr.applicant` remains the Stage 2 recruitment cockpit;
- `hr.employee` remains the employment master record after handover;
- `hr.contract` remains the payroll/contract engine record;
- Odoo Sign remains the signature execution engine;
- Odoo chatter and attachments remain the visible audit and file trail;
- QWeb is used for Marsellia-generated PDF forms where dynamic data, Arabic layout, and reproducible rendering matter.

Custom models are used where Odoo lacks the required MCEP-specific data shape or lifecycle registry.

## 5. Recruitment document lifecycle doctrine

Stage 2 uses a unified recruitment document lifecycle model:

`x_hr.recruitment_document`

This registry is the lifecycle spine for every formal recruitment artifact that is generated, uploaded, signed, superseded, or used as a gate.

It tracks:

- applicant;
- document type;
- source model / source record;
- generated or uploaded artifact;
- signed artifact;
- Sign request reference where available;
- signer roles where needed;
- state;
- version;
- generated/sent/signed dates.

It is not a replacement for Odoo Sign, Odoo Documents, or chatter.

It is the recruitment-specific artifact control layer that ties those native services together.

## 6. Stage 2 recruitment-to-employment doctrine

Stage 2 is a gated native `hr.applicant` lifecycle.

The controlling rule is:

> `hr.applicant` remains the operational cockpit. `x_hr.recruitment_document` tracks the lifecycle of every generated, uploaded, signed, or superseded recruitment artifact. Stage progression is unlocked by signed artifact completion. Final onboarding creates and links `hr.employee`, `hr.contract`, payroll-relevant data, bank details, and signed-document history.

The lifecycle is:

1. Qualification / pool-to-applicant handover.
2. Evaluation / Interviews.
3. Preboarding / Contract Proposal.
4. Contract Signed / employment handover complete.

## 7. Signature geometry rule

The old “fixed final signature page” doctrine is superseded.

The locked rule is:

> Signable generated HR forms use a fixed signature block on page 1. Dynamic tables and detail sections move to page 2+ as annex/detail content.

This applies especially to:

- F-0002 Interview Evaluation;
- F-0004 Legal Documents Validity Declaration;
- F-0006 TOR / Role and Duties;
- F-0007 Policies Compliance Declaration;
- F-0009 Non-Disclosure Agreement.

The official government labor contract is the exception. It is treated as a static PDF/template artifact, not a QWeb-generated Marsellia form.

## 8. Repository and packaging rules

The repository separates:

- installable module folders;
- architecture docs;
- module-specific docs;
- resources and integration assets;
- source forms and templates;
- generated output examples.

Each Odoo module zip should be created from its own module folder only.

Do not ship:

- `docs/`;
- `resources/`;
- local exports;
- payload samples;
- planning docs;
- external source templates unless explicitly required inside the module.

## 9. Documentation authority

Use this hierarchy:

1. Architecture docs define the durable target.
2. Stage/module specs define implementation contracts.
3. Current pass execution plans define one bounded implementation pass.
4. Resource/gap-analysis docs explain rationale and are not authoritative when they conflict with architecture specs.
5. Implementation summaries are historical records.

When code and docs disagree, inspect the installed module and current repository code before deciding. Then update the docs or code deliberately.

## 9.1 Implementation status override — Pass 5E

As of Pass 5E, the QWeb/native Odoo Sign lifecycle is proven on Marsellia Odoo SaaS 19.2.

The proven pattern is:

```text
Generated QWeb PDF
→ dynamic sign.template
→ sign.document from generated PDF attachment
→ sign.item with fixed geometry
→ sign.send.request + sign.send.request.signer
→ send_request()
→ linked sign.request
→ manual Sync Signed Result
→ signed PDF/certificate copied to applicant
→ x_hr.recruitment_document and source record close as signed
```

## 10. Locked sequential pass plan

No parallel tracks.

### Pass 0 — Documentation harmonisation

Rewrite and align architecture/spec/pass docs before code.

### Pass 1 — Recruitment document registry spine

Add `x_hr.recruitment_document`, applicant smart button, views, access rights, and minimal write-back hooks from current TOR/interview generation.

### Pass 2 — Applicant cockpit cleanup

Lock the applicant tabs and fold transitional TOR Header material into the correct surface.

### Pass 3 — GRC Libya location taxonomy

Add canonical reusable Libya location hierarchy to `grc_backbone`.

### Pass 4 — Stage 1 intake field uplift

Add only required intake fields and handover mapping updates to `hr_pool`, Fillout/Zite, and n8n.

### Pass 5 — Evaluation stage gate

Implement/align F-0002, F-0003, and F-0004 workflows and gate Contract Proposal on their signed completion.

### Pass 6 — Required document upload flow

Add tokenized Fillout upload links, submitted-document handling, review/resubmission, and supplemental applicant data capture.

### Pass 7 — GRC governance reference and decision engine foundation

Refound `grc_backbone` around the unified Governance Reference / Provision / Text Pattern / Variable / Decision Template doctrine.

Pass 7 implements the structural foundation before recruitment consumes it:

- 7A-4 — unified governance library foundation;
- 7A-5 — SaaS-safe decision template authoring UX;
- 7A-6 — retirement of old scaffold surfaces/data;
- 7C — recruitment board decision template seed/setup;
- 7B — decision instances and instantiate-from-template action;
- 7D — documentation lock.

The recruitment board decision is the first use case, but the primitives must remain reusable for HR, HSE, operations, compliance, finance, contracts, and future governance workflows.

### Pass 8 — Contract tab and Board Decision

Add Contract tab foundation and board decision generation/signing.

### Pass 9 — Employment contract workflow

Track the official labor contract PDF/template artifact, signature lifecycle, contract fields, and employee ID generation.

### Pass 10 — TOR reposition and update

Update F-0006 and gate TOR generation/signing after signed employment contract.

### Pass 11 — Final declarations

Generate/sign F-0007 and F-0009 through QWeb and the registry.

### Pass 12 — Onboard now handover

Create/link `hr.employee`, `hr.contract`, bank details, and signed artifact history.

### Pass 13 — Employment lifecycle architecture

Start a separate post-recruitment employment lifecycle architecture.
