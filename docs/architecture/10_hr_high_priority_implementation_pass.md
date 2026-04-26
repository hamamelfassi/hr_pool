# HR High Priority Implementation Pass

This pass is the next implementation step after the corrected `hr.job` versus `hr.applicant` ownership matrix.

Canonical rule:

- `hr.job` is the baseline vacancy / position instance
- `hr.applicant` is the negotiated applicant-specific runtime instance
- `grc_recruitment_bridge` defines governed templates, rubrics, document types, signature profiles, and routing

This pass should be implemented before any medium-priority cleanup.

## 1. Scope

### 1.1 `hr.job` baseline vacancy cleanup

Implement only the baseline vacancy responsibilities on `hr.job`:

- governed template selection
- baseline TOR / job description snapshot
- baseline Documents folder pointer
- baseline PDF attachment pointers
- baseline signature profile pointer
- baseline provenance / source metadata

Do not place applicant-specific negotiation on `hr.job`.

### 1.2 `hr.applicant` negotiated runtime surfaces

Implement the applicant-specific runtime surfaces on `hr.applicant`:

- negotiated TOR / role composition
- interview evaluation runtime
- document checklist runtime
- declaration envelope runtime
- document submission runtime links
- generated PDF attachment pointers
- signed PDF attachment pointers
- comparison / delta metadata against the baseline vacancy
- chatter and activities

### 1.3 Interview runtime

Implement the live interview evaluation workflow on `hr.applicant`:

- one or more interview instances per applicant
- scores and reviewer notes
- PDF generation from the runtime record
- Documents filing
- sign-request action from the runtime record

### 1.4 Document checklist runtime

Implement the checklist runtime on `hr.applicant`:

- one checklist header per applicant
- one checklist line per required document type
- one submission record per uploaded document
- completion counter / tracker for mandatory documents
- PDF generation from the runtime record
- Documents filing
- sign-request action from the runtime record

### 1.5 Negotiated TOR / role composition

Implement the applicant-specific negotiated TOR flow:

- inherit the baseline vacancy template mapping from `hr.job`
- allow negotiated additions/removals/adjustments on `hr.applicant`
- render the final negotiated TOR from the applicant runtime record
- keep a clear delta between baseline vacancy and final accepted composition

### 1.6 Declaration envelope runtime

Implement the applicant-specific declaration envelope:

- applicant-specific declaration pack instance
- static Sign or QWeb + Sign flow as appropriate
- Documents filing
- sign-request action from the runtime record

## 2. Required UI surfaces

### 2.1 `hr.job`

The job form should expose only:

- baseline template selection
- baseline TOR snapshot
- baseline Documents folder and attachment references
- baseline signature profile

### 2.2 `hr.applicant`

The applicant form should expose:

- negotiated role composition
- interview runtime
- document checklist runtime
- document submission lines
- declaration envelope
- Documents folder
- generated and signed artifacts
- delta versus baseline vacancy

## 3. Required behavior

### 3.1 Documents

- generated PDFs must be stored in Documents
- signed PDFs must be attached back to the runtime record
- runtime records must own the workflow state

### 3.2 Sign

- Sign requests must be launchable from the runtime record
- declaration flows should prefer Sign templates for static bodies
- multi-line forms should use QWeb first, then Sign where needed

### 3.3 Chatter and activities

- runtime records must expose chatter
- runtime records must expose activities
- follow-up and traceability belong to the live applicant case

## 4. Exit criteria

This pass is complete when:

1. `hr.job` is baseline-vacancy only
2. `hr.applicant` owns the negotiated runtime case
3. interview runtime records work on the applicant side
4. document checklist runtime records work on the applicant side
5. document submission writeback works one document at a time
6. negotiated TOR output renders from the applicant runtime record
7. declaration envelopes can be generated and signed from the applicant runtime record
8. Documents and Sign are wired to the runtime records

