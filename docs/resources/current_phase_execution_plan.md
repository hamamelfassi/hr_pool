# Current Phase Execution Plan — Pass 6A

## Status

Pass 5E is complete.

Locked:
- F-0003 checklist model/view/action flow.
- F-0003 QWeb PDF generation.
- Native Odoo Sign send probe.
- Native Odoo Sign completion sync.
- Duplicate prevention, readonly/no-open artifact guards, controlled downloads.
- Native Sign workflow wiki.

## Current next pass

Pass 6A — Public Continuation + Required Document Submissions Foundation.

## Authority

This document supersedes older `current_phase_2_execution_plan.md` material for current execution.

Older resource/gap-analysis docs are historical unless they align with:
1. current repo code;
2. `pass_5e_f0003_native_sign_lifecycle_plan.md`;
3. `native_odoo_sign_workflow_wiki.md`;
4. `report_generation_wiki.md`;
5. architecture/spec docs.

## Pass 6A goal

Create the internal Odoo foundation for applicant required-document submissions before public Fillout/n8n writeback.

## Pass 6A scope

- Add submitted-document model.
- Add Submissions tab/surface on `hr.applicant`.
- Link submissions to applicant, checklist, checklist line, and required document type.
- Allow internal/manual submission creation first.
- Accept/reject/resubmission actions.
- Accepted submission updates checklist line.
- Readiness validation reads accepted submissions.
- Keep tokenized Fillout/n8n public writeback for Pass 6B unless explicitly approved as a small probe.

## Pass 6A non-scope

- No F-0004.
- No F-0002 native Sign reuse.
- No n8n production flow yet.
- No public token security finalization yet.
- No broad applicant cockpit redesign.
- No QWeb/PDF/report changes unless readiness logic requires minor text update.

## Pass 6B target

- Token generation.
- Prefilled Fillout URL.
- n8n writeback.
- Candidate upload.
- Resubmission loop.