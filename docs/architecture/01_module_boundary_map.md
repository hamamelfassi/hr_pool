# Marsellia Module Boundary Map

This document is the concrete operating boundary reference for the monorepo.

It explains which layer owns which kind of responsibility.

## 1. Boundary model

### 1.1 Canonical governance layer

`grc_backbone`

Owns:

- governance vocabulary
- taxonomies
- frameworks
- policies
- provisions / rules
- decisions
- functional areas
- functions
- SOPs
- risks
- controls
- compliance checks
- incidents
- contract / clause / tender governance

The rule is simple:

- if it defines what Marsellia considers controlled, approved, standardized, or governable, it belongs here

### 1.2 Operational domain layer

Domain modules such as:

- `hr_pool`
- `hr_recruitment`
- future operational apps

Own:

- actual business records
- user workflows
- approvals
- transactional lifecycle steps
- generated outputs
- document bundles

The rule is simple:

- if it is the thing people do in the business, it belongs in the operational domain module

### 1.3 Bridge-domain layer

Bridge logic is the adapter layer between governance and work.

It owns:

- relation fields that connect an operational record to governed taxonomy
- inherited views that expose those fields
- lightweight mapping helpers
- governed template selection
- prefill / classification hooks

The rule is simple:

- if it connects governance into a live process, it belongs in the bridge-domain responsibility of that process

## 2. Domain-coherent bridge principle

Bridge logic should remain coherent with the domain it serves.

That means:

- HR-specific governance extensions can live in HR modules if they only serve HR
- recruitment-specific governance extensions can live in recruitment modules if they only serve recruitment
- a separate generic bridge addon is only needed when multiple domains truly share the same adapter logic

This avoids unnecessary module fragmentation while still keeping governance separate from process ownership.

## 3. Current Marsellia map

### 3.1 `grc_backbone`

Canonical backbone only.

Should contain:

- core GRC models
- taxonomy data
- GRC menus, actions, and views
- translations
- internal GRC relations

Should not contain:

- domain-specific operational process logic
- domain-specific bridge fields that only matter to one operational app

### 3.2 `hr_pool`

Governed intake and pooling.

Owns:

- candidate intake
- source metadata
- child-line capture for education, experience, skills, languages, commitments
- intake states and chairman workflow
- conversion request / approval scaffolding
- any HR-pool-specific bridge fields that are only relevant to intake/pooling

Consumes:

- GRC functional areas
- GRC functions where useful

### 3.3 `hr_recruitment`

Formal recruitment / applicant lifecycle.

Owns:

- applicant records
- interviews
- evaluations
- offers
- contract/onboarding progression
- recruitment-stage document completion

Consumes:

- GRC taxonomy
- intake handoff from `hr_pool`

## 4. Decision rules for future work

Use this test before placing a feature in a module:

1. Is it a governed vocabulary or standard? Put it in `grc_backbone`.
2. Is it an operational workflow step or business record? Put it in the domain module.
3. Is it a linkage between the two? Put it in the domain-coherent bridge responsibility of the domain module, unless multiple domains need the same adapter.

## 5. Practical examples

### Example A: job function taxonomy

- governed function definitions live in `grc_backbone`
- `hr.job` field links to that taxonomy live in the HR domain bridge responsibility

### Example B: recruitment interview forms

- the interview process lives in recruitment
- the criteria it consumes may come from GRC
- the resulting evaluation record still belongs to recruitment

### Example C: intake conversion requests

- the intake candidate record lives in `hr_pool`
- the conversion workflow lives in `hr_pool` or the recruitment handoff domain, depending on where the record is executed
- the chairman approval logic remains attached to the domain workflow, not the GRC backbone itself

## 6. Packaging rule

Every installable module must remain separately zippable.

Supporting docs and output artifacts stay in:

- `docs/`
- `resources/`

and do not ship inside module archives.
