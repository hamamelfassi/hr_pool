
# Employment Lifecycle Program Plan

## Purpose

This document defines the post-recruitment employment lifecycle for Marsellia/MCEP inside Odoo.

It starts after Stage 2 recruitment has produced a handover-ready applicant and continues through employee creation, contract/payroll readiness, employee declarations, custody, training, leave, permissions, assignments, appraisals, separation, and clearance.

## Module boundary

Implementation module:

```text
hr_employment_custom
```

## Program sequence

1. Pass 14 — documentation/spec lock.
2. Pass 13 — recruitment to employment handover.
3. Pass 15 — employee declarations.
4. Pass 16 — custody and assets.
5. Pass 17 — training and certifications.
6. Pass 18 — leave.
7. Pass 19 — administrative permissions.
8. Pass 20 — work assignments.
9. Pass 21 — performance evaluation.
10. Pass 22 — separation.
11. Pass 23 — clearance/offboarding.
12. Pass 24 — native smart-button/mobile artifact hardening.
13. Pass 25 — payroll/attendance/work-entry integration.
14. Pass 26 — GRC decision engine upgrade.

## Doctrine

- Native Odoo HR models remain operational source of truth.
- Marsellia-specific workflows are implemented as thin controlled process layers.
- QWeb + Odoo Sign provide official documentary evidence.
- Chatter/files provide durable and mobile-safe artifact access.
- Activities drive next human action.
- Manual decision metadata is used now; GRC decision instances are future upgrade.
