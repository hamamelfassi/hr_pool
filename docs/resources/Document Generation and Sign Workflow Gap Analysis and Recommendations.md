							

# Document Generation and Sign Workflow Gap Analysis and Recommendations

Hamam, the core issue is clear: **you already have a good document-generation pattern, but not yet a unified document/signature lifecycle.** Right now, TOR and Interview Evaluation are behaving like separate successful experiments rather than two instances of one recruitment document architecture.

## **1\. Current architecture posture**

Your documentation structure is correct: architecture docs, module docs, n8n/resources, and separate module folders are intentionally separated from uploadable SaaS modules. That is the right discipline for Odoo SaaS work.

Stage 1 is also correctly treated as intake/provenance. The Fillout/Zite mapping already shows the intake record is ID-first, snapshot-heavy, and designed to pass structured candidate data into Odoo rather than relying on fragile label matching.

The Stage 2 spec I fetched from Drive says `hr_recruitment_custom` owns:

* applicant-side printable identity fields  
* negotiated TOR  
* interview evaluation artifacts  
* signed declarations  
* applicant-side document attachment/retrieval  
* native Sign/Documents hooks

That is the correct ownership boundary. The mistake would be to let each document invent its own lifecycle.

## **2\. What is currently working**

### **TOR generation**

This is the strongest pattern and should be preserved.

The good parts:

* QWeb-generated PDF from `hr.applicant`  
* applicant-side printable snapshot fields  
* explicit reseeding before PDF generation  
* generated PDF attached back to the applicant record  
* chatter logging  
* Arabic-first PDF rendering  
* legacy Marsellia PDF used as visual reference, not as the data engine

This is architecturally right.

### **Interview evaluation generation**

This is also mostly right.

The implementation now has a structured interview parent model, child question lines, scoring, computed grade/percent/stars, readiness gating, PDF generation, and attachment back to the applicant. That means the interview form is not just a PDF; it is structured operational data plus a generated artifact. That is the right Odoo pattern.

### **Manual Sign flow**

Your manual Sign flow is not “bad.” It was the correct first stabilization step.

Odoo 19 supports requesting signatures directly from an Odoo record, and completed signed documents/certificates are added back to the record chatter. It also supports one-off documents and templates from records. ([Odoo](https://www.odoo.com/documentation/19.0/applications/productivity/sign/request_signatures.html?utm_source=chatgpt.com))

So the platform direction is aligned with your architecture. The gap is that your custom module is not yet organizing those requests coherently around applicant document lifecycles.

## **3\. Main gap**

You are missing a **single recruitment document artifact layer**.

Right now, the applicant has:

* TOR generation logic  
* interview generation logic  
* signed TOR PDF field  
* signed interview PDF field  
* chatter attachments  
* maybe Sign request visibility through Odoo’s native actions

But there is no unified object saying:

“This applicant has these recruitment documents, these generated versions, these signature requests, these signers, these states, and these signed artifacts.”

That is why the UX feels scattered.

The answer is not a bigger governed bridge. The answer is a **small canonical document registry** inside `hr_recruitment_custom`.

## **4\. Recommended target architecture**

Create one lightweight model:

`x_hr.recruitment_document`

This becomes the unified registry for every generated/signable recruitment artifact.

Each record represents one document lifecycle for one applicant.

Suggested fields:

| Field | Purpose |
| ----- | ----- |
| `x_applicant_id` | parent `hr.applicant` |
| `x_document_type` | `tor`, `interview_evaluation`, `nda`, `declaration_accuracy`, `declaration_privacy`, etc. |
| `x_interview_id` | optional link when document belongs to an interview |
| `x_state` | `draft`, `generated`, `signature_requested`, `partially_signed`, `signed`, `cancelled`, `superseded` |
| `x_generated_attachment_id` | latest generated PDF |
| `x_signed_attachment_id` | final signed PDF |
| `x_sign_request_id` | native Odoo Sign request, if available |
| `x_template_mode` | `dynamic_qweb`, `static_sign_template`, `manual_upload` |
| `x_version` | integer version |
| `x_generated_on` | timestamp |
| `x_sent_on` | timestamp |
| `x_signed_on` | timestamp |
| `x_responsible_user_id` | recruiter/owner |
| `x_primary_signer_partner_id` | candidate/interviewer/manager |
| `x_notes` | operational notes |

Optional child model:

`x_hr.recruitment_document_signer`

Fields:

* document  
* signer role: applicant, interviewer, department manager, chairman, HR manager  
* partner/email  
* signing order  
* state  
* signed date

Do **not** overbuild this. It is a registry and UX spine, not a replacement for Odoo Sign.

## **5\. Applicant form UX target**

On `hr.applicant`, add one smart button:

### **`Signature Requests` / `Documents`**

This opens filtered `x_hr.recruitment_document` records for the applicant.

It should show all generated/signable artifacts:

* TOR  
* Interview Evaluation  
* NDA  
* declarations  
* future medical/HR forms

Inside the applicant form, keep the tabs operational:

### **`Role and Duties` tab**

Contains:

* negotiated duty lines  
* TOR header snapshot fields  
* button: `Generate TOR`  
* button: `Send TOR for Signature`  
* latest TOR status badge

### **`Evaluation` tab**

Contains:

* interview records  
* `Conduct Interview`  
* `Generate Interview PDF`  
* `Send Interview for Signature`  
* status per interview document

### **Future `Declarations` tab**

Contains:

* declaration checklist  
* generate/send buttons for standardized documents  
* signed artifact status

This gives you a clean rule:

Tabs are where documents are authored.  
The smart button is where document/signature lifecycle is tracked.

That is coherent and native-feeling.

## **6\. TOR-specific recommendation**

For TOR, do **not** jump directly to full automation until you add the fixed final signature page.

The Stage 2 spec already points to the right solution: dynamic duties can grow/shrink, but Odoo Sign placement depends on stable PDF page/coordinates. Odoo’s own Sign workflow expects users or templates to place fields on documents/templates before sending. ([Odoo](https://www.odoo.com/documentation/19.0/applications/productivity/sign/request_signatures.html?utm_source=chatgpt.com))

So the next TOR slice should be:

1. Keep current QWeb generation.  
2. Force a final dedicated signature page.  
3. Put applicant signature/date block in fixed coordinates.  
4. Put department manager signature/date block in fixed coordinates.  
5. Attach generated PDF to applicant.  
6. Create/update `x_hr.recruitment_document` row.  
7. Then add `Send TOR for Signature`.

Recommended TOR signer phases:

| Phase | Signers |
| ----- | ----- |
| Now | applicant only, manual field placement |
| Next | applicant only, fixed final page |
| Then | applicant \+ department manager |
| Later | signing order, countersign, employee handoff gating |

Do not mix manager routing into the next slice. That will reintroduce churn.

## **7\. Interview-specific recommendation**

Interview is simpler than TOR because it has only one signer: interviewer.

The interview report already has an interviewer-only signature block. That makes it the better candidate for the **first automated Sign request**.

Recommended next slice:

1. Generate Interview PDF.  
2. Create/update `x_hr.recruitment_document` with `document_type = interview_evaluation`.  
3. Button: `Send Interview for Signature`.  
4. Signer \= `x_interviewer_user_id.partner_id`.  
5. If automatic coordinate placement is unreliable, open the native Odoo Sign request flow from the record with the generated PDF already selected.  
6. On completion, signed PDF lands in chatter, then manually or automatically link it to `x_signed_attachment_id`.

This gives you a safe automation pilot before touching multi-signer TOR.

## **8\. Declaration/NDA strategy**

Declarations and NDAs should **not** use the same QWeb strategy as TOR/interview unless the content is dynamic.

Use this split:

| Document type | Best engine |
| ----- | ----- |
| TOR | QWeb dynamic PDF |
| Interview Evaluation | structured model \+ QWeb PDF |
| NDA | Odoo Sign template |
| Accuracy declaration | Odoo Sign template |
| Privacy declaration | Odoo Sign template |
| Required-doc acknowledgment | Odoo Sign template or simple generated checklist PDF |
| Job-specific custom declaration | QWeb if dynamic, Sign template if fixed |

This avoids overengineering.

Your Stage 1 intake already collects declaration booleans and typed consent-style data. The readiness checklist shows missing/required intake declarations like accuracy, privacy, and typed consent name, which should be treated as upstream consent/provenance, not necessarily final signed recruitment artifacts.

So separate these two concepts:

* **Intake consent**: checkbox \+ typed name from Fillout/Zite.  
* **Formal signed declaration**: Odoo Sign artifact during recruitment/onboarding.

Do not collapse them.

## **9\. Gap analysis**

### **Gap 1 — No unified document lifecycle model**

Current state: TOR and Interview each track their own artifacts.

Target: one `x_hr.recruitment_document` registry.

Priority: **critical**.

---

### **Gap 2 — Signature Requests button is conceptually native but not custom-filtered**

Current state: Odoo can request signatures from a record, and signed documents return to chatter. ([Odoo](https://www.odoo.com/documentation/19.0/applications/productivity/sign/request_signatures.html?utm_source=chatgpt.com))

Target: applicant smart button should show recruitment-specific document/signature rows, not only generic chatter noise.

Priority: **critical**.

---

### **Gap 3 — Generated PDF and Sign request are not strongly bound**

Current state: recruiter may generate a PDF, then manually upload/use it in Sign.

Target: generated attachment ID should be stored and used as the source for the Sign flow.

Priority: **high**.

---

### **Gap 4 — Signed artifact return is not normalized**

Current state: signed copy can be uploaded/linked manually.

Target: signed artifact always lands in `x_signed_attachment_id`, with chatter as visibility/audit, not the canonical field.

Priority: **high**.

---

### **Gap 5 — TOR signature geometry is not stable yet**

Current state: dynamic duties make signature placement unreliable.

Target: fixed final signature page.

Priority: **high before TOR automation**.

---

### **Gap 6 — Interview is ready for first automation before TOR**

Current state: guided-manual interviewer signature.

Target: one-signer Sign request pilot.

Priority: **high**.

---

### **Gap 7 — Declarations need a different pattern**

Current state: risk of forcing all docs into QWeb.

Target: standard declarations and NDA should be Odoo Sign templates, not generated QWeb unless dynamic.

Priority: **medium**.

---

### **Gap 8 — Applicant document dashboard/status is missing**

Current state: user must inspect tabs, chatter, attachment fields, maybe Sign app.

Target: applicant-level document table/status panel.

Priority: **medium**.

## **10\. Recommended implementation sequence**

Do this in this order:

### **Slice A — Document registry spine**

Add `x_hr.recruitment_document`.

No Sign automation yet.

Wire TOR and Interview generation to create/update registry rows.

Success condition:

* applicant has one clear document list  
* latest generated PDF visible  
* state visible  
* signed PDF field visible

### **Slice B — Applicant smart button**

Add applicant topbar smart button:

`Documents / Signature Requests`

It opens filtered recruitment document records.

Success condition:

* one click from applicant shows TOR/interview/declaration lifecycle rows.

### **Slice C — Interview Sign pilot**

Add `Send Interview for Signature`.

Start with native/manual-assisted Sign request if full API automation is brittle.

Success condition:

* interviewer signature process begins from the interview/applicant context  
* signed artifact returns to applicant chatter  
* registry state can be updated to signed

### **Slice D — TOR fixed final signature page**

Modify QWeb TOR to always end with fixed final signature page.

Success condition:

* signature block is stable regardless of duties length.

### **Slice E — TOR applicant Sign**

Add `Send TOR for Signature`.

Single signer first: applicant.

Success condition:

* applicant gets Odoo Sign request  
* signed TOR stored back against applicant/document registry.

### **Slice F — TOR department manager countersign**

Only after applicant-sign flow is stable.

Success condition:

* two signer roles  
* optional signing order  
* final signed artifact replaces/links cleanly.

### **Slice G — Declaration/NDA template flows**

Use Odoo Sign templates linked to applicant/recruitment model where possible. Odoo 19 supports selecting templates from a record, including templates linked to the current Odoo model or not linked to any model. ([Odoo](https://www.odoo.com/documentation/19.0/applications/productivity/sign/request_signatures.html?utm_source=chatgpt.com))

Success condition:

* fixed declarations no longer require custom QWeb code.

## **11\. My architectural recommendation**

Do **not** build a large governed document bridge.

Build this instead:

`hr.applicant` remains the recruitment source of truth.  
QWeb generates dynamic PDFs.  
Odoo Sign manages signing.  
Chatter stores audit visibility.  
`x_hr.recruitment_document` ties the lifecycle together.

That is the coherent middle path.

It is simple enough for Odoo SaaS, but structured enough to scale across TOR, interview evaluation, declarations, NDA, and future onboarding forms.

---

# Q\&A

## **1\. Should `x_hr.recruitment_document` records be created automatically?**

**Yes, but only for predictable required documents.**

Create expected document rows automatically when the `hr.applicant` is created or when the applicant reaches a relevant recruitment stage.

Example default rows:

| Document | Create when? | Why |
| ----- | ----- | ----- |
| TOR | applicant created / job assigned | always expected for formal recruitment |
| Interview Evaluation | when interview record is created | one applicant may have multiple interviews |
| NDA | when applicant enters formal stage | standardized document |
| Declarations | when applicant enters formal stage | standardized document |
| Required Documents Checklist | when checklist is initialized | depends on required-doc policy |

So:

* **TOR**: create one row automatically per applicant.  
* **Interview Evaluation**: create one row per interview, not automatically on applicant creation.  
* **Declarations/NDA**: create automatically if they are mandatory for all formal applicants.  
* **Document Checklist**: create when the required-document collection workflow begins.

The generated/signed attachment IDs should then be set by the operational buttons:

* `Generate TOR` writes `x_generated_attachment_id`.  
* `Send TOR for Signature` writes `x_sign_request_id` and state.  
* Signed return writes `x_signed_attachment_id`.  
* Regeneration creates a new version and marks the old row/version as `superseded`.

Do **not** pre-create empty records for every possible future document type. That creates noise.

## **2\. Smart button, tab, kanban, or child line?**

Use this hierarchy:

### **Best UX**

**Applicant form tabs \= operational work surfaces.**

**Smart button \= document/signature control center.**

So:

* `Role and Duties` tab: author TOR data, generate TOR, send TOR.  
* `Evaluation` tab: conduct interview, generate interview PDF, send for interviewer signature.  
* `Declarations` tab: manage declarations.  
* `Required Documents` tab: manage submitted document checklist.  
* Top smart button: opens all `x_hr.recruitment_document` records for this applicant.

Do **not** make the smart button open another version of `hr.applicant`. That becomes confusing.

Do **not** put the registry only as an inline child table inside the applicant form. It will become cramped and less useful.

Recommended smart button behavior:

`Recruitment Documents` / `Signature Requests`

Opens a filtered list/kanban of `x_hr.recruitment_document` where:

`x_applicant_id = current applicant`

Default view:

* kanban grouped by state, or  
* list view with status pills and buttons

I would start with **list view first**, not kanban. It is easier to debug, easier to audit, and better for Odoo SaaS incremental work.

Columns:

* document type  
* related record  
* state  
* generated PDF  
* sign request  
* signed PDF  
* version  
* generated date  
* sent date  
* signed date

Later you can add kanban grouped by state.

## **3\. How does native Odoo’s `Request Signature` button integrate?**

Your understanding is mostly correct, with nuance.

Odoo 19 supports requesting signatures directly from an Odoo record. When fully signed, the signed document and certificate are added to that record’s chatter. Templates can also be linked to a model, and when requesting from a record, templates linked to that model or unlinked templates can be selected.

But the native button is **generic**. It does not understand your recruitment document lifecycle.

So use native Odoo Sign as the signing engine, but do not rely on the native button as the only UX.

Recommended split:

| Layer | Responsibility |
| ----- | ----- |
| Native Odoo Sign | send request, collect signature, manage signer status, store signed result |
| `x_hr.recruitment_document` | recruitment-specific document lifecycle |
| Applicant tab buttons | generate/send the right document from the right workflow |
| Native chatter | audit visibility and file trail |

The native `Request Signature` action is still useful as a fallback/manual route. Your custom buttons should make the repeatable recruitment flows cleaner.

## **4\. Should operational tab buttons interfere with applicant state/chatter/actions?**

No. They will not interfere if designed properly.

The button placement in the tab is only UI. The server action can still:

* operate on the current `hr.applicant`  
* generate the correct PDF  
* create `ir.attachment`  
* post chatter  
* update `x_hr.recruitment_document`  
* update TOR/interview state fields  
* open the generated attachment or Sign request

So yes: move the buttons into the relevant operational surfaces.

For TOR, the button belongs inside the `Role and Duties / TOR` area, not floating awkwardly in a separate `TOR Header` tab.

## **5\. What to do with current `TOR Header` tab?**

Collapse it.

Right now it exists because you needed a practical testing surface for manual snapshot fields, supervisor, employee ID, and TOR state. That was fine for proving generation. But it should not remain as a standalone user-facing tab.

Recommended final structure:

### **`Role and Duties` tab**

Sections:

1. **Role / Job Context**  
   * job  
   * department  
   * functional area  
   * job title  
   * direct supervisor placeholder/source  
   * employee ID placeholder  
2. **Negotiated Duties**  
   * duty/function lines  
3. **TOR Document**  
   * document status  
   * latest generated PDF  
   * latest signed PDF  
   * version  
   * buttons:  
     * `Generate TOR`  
     * `Send TOR for Signature`  
     * `Mark Signed / Link Signed PDF` only if still manual  
4. **Technical / Advanced fields**  
   * hidden or manager-only  
   * snapshot/debug fields if still needed

The TOR lifecycle state should move to `x_hr.recruitment_document`, not remain as a separate TOR-only state on `hr.applicant`, except maybe a computed summary field.

So:

* applicant may show `x_tor_state` as a computed convenience field  
* registry owns the real lifecycle

## **6\. Should `x_hr.recruitment_document` be kanban filtered by applicant?**

Eventually yes. Initially no.

Start with list view.

Why:

* faster to implement  
* easier to inspect attachment links  
* easier to debug state transitions  
* less Studio/view complexity  
* less temptation to overdesign

Later, add kanban grouped by:

* `draft`  
* `generated`  
* `sent`  
* `signed`  
* `superseded`

But this should be second pass.

## **7\. Fixed signature block: first page or final page?**

Your proposal is better for the business forms.

I agree with this adjusted pattern:

Put the signature block on page 1 in a fixed location, and move variable-length details to page 2+ as annex/detail pages.

This is stronger than my previous “final signature page” idea for your specific forms because it preserves the form’s legal/HR logic:

* page 1 contains identity, core clauses, summary decision/result, and signature  
* page 2+ contains dynamic detail/annex content

### **TOR layout**

Page 1:

* applicant identity  
* job/department  
* key TOR clauses  
* acceptance/declaration block  
* applicant signature/date  
* manager signature/date

Page 2 onward:

* detailed duties annex  
* grouped functional areas/functions  
* extra role notes if needed

### **Interview layout**

Page 1:

* applicant identity  
* interview metadata  
* final score/result/recommendation  
* remarks summary if short  
* interviewer signature/date

Page 2 onward:

* question-by-question scoring table  
* detailed notes  
* additional evaluation sections

This gives Odoo Sign stable page-1 coordinates while preserving dynamic detail sections.

This should become the standard rule:

Signable HR forms should place the signature block on page 1\. Dynamic tables and annexes start on page 2\.

---

