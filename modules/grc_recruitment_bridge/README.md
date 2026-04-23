# Recruitment Governance Bridge

This module is the XML-only recruitment governance bridge for Marsellia.

It owns reusable recruitment and onboarding template families, controlled references, and signer-routing profiles.
Its Arabic dashboard label is `إجراءات التوظيف`.

## First-wave scope

- role / job description templates
- interview evaluation templates
- pre-employment document checklist templates
- onboarding continuation packs
- declaration packs
- signature profiles
- bridge-facing recruitment job references
- canonical task templates are owned by `grc_backbone`, not by this module

## Rule of use

- keep canonical governance data in `grc_backbone`
- keep live candidate and applicant records in `hr_pool` and `hr_recruitment`
- keep generated PDFs and source forms outside the shipped addon zip
