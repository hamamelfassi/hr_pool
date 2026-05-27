
# Current Phase Execution Plan

## Current posture

Pass 12 is closed.

The recruitment-to-employment preboarding gate is functionally complete. The next phase is documentation/spec lock before implementing the employment handover and employment lifecycle.

## Next execution order

1. Pass 14 — documentation/spec lock for `hr_employment_custom`.
2. Pass 13 — recruitment to employment handover.
3. Pass 15+ — employment lifecycle domain passes.

## Pass 14 — Documentation/spec lock

- 14A module architecture document.
- 14B handover field mapping spec.
- 14C employee form/tab architecture spec.
- 14D reusable document artifact pattern.
- 14E mobile artifact/download doctrine.
- 14F implementation roadmap lock.

## Pass 13 — Recruitment to employment handover

- scaffold `hr_employment_custom`;
- repair photo flow from `hr_pool` to `hr.applicant`;
- create/link `hr.employee`;
- create/link `hr.contract`;
- create/link native `res.partner.bank` including IBAN custom field;
- prepare payroll-ready footprint;
- copy signed recruitment artifacts to employee chatter/files;
- block duplicates and unsafe overwrites.

## Pass 15+

See:

```text
docs/modules/hr_employment_custom/08_pass_15_plus_implementation_roadmap.md
```
