# HR Recruitment Custom

Technical extension module for native Odoo Recruitment.

Stage 2 only:

- governed `hr.job` baseline fields
- applicant-specific `hr.applicant` fields
- conversion execution from stage 1 to stage 2
- native chatter / activities / Sign / Documents hooks

Stage 2 specification lives in:

- `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
- `docs/architecture/01_two_stage_recruitment_program_plan.md`

First-pass scope:

- extend `hr.job` with baseline governed role fields
- extend `hr.applicant` with applicant-specific negotiated role fields
- reuse native chatter and activities
- avoid introducing a separate dashboard app or bridge layer
