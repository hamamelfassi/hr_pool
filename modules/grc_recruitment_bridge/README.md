# Recruitment Governance Bridge

This module is the XML-only recruitment governance bridge for Marsellia.

It owns reusable recruitment and onboarding template families, controlled references, signer-routing profiles, and the applicant-side runtime definition layer for negotiated recruitment cases.
Its Arabic dashboard label is `إجراءات التوظيف`.

## First-wave scope

- role / job description templates
- interview evaluation templates
- pre-employment document checklist templates
- onboarding continuation packs
- declaration packs
- signature profiles
- baseline vacancy references on `hr.job`
- applicant-side negotiated runtime records and generated PDFs
- canonical task templates are owned by `grc_backbone`, not by this module

## Rule of use

- keep canonical governance data in `grc_backbone`
- keep live intake records in `hr_pool`
- keep negotiated recruitment runtime records on `hr.applicant`
- keep baseline vacancy records on `hr.job`
- keep generated PDFs and source forms outside the shipped addon zip
