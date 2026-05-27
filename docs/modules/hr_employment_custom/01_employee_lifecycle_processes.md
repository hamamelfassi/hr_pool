# Employee Lifecycle Processes

## Purpose

This document consolidates the Marsellia employee lifecycle process model architecture.

Reference numbers remain technical metadata. User-facing names should be normalized.

## Process groups

| Process | Anchor | Custom model | Signed artifact |
|---|---|---|---|
| Employee declarations | `hr.employee` | `x_hr.employee_declaration` | yes |
| Custody/assets | `hr.employee` | `x_hr.employee_custody_type`, `x_hr.employee_custody_item` | yes for custody receipt |
| Training | `hr.employee`, resume/skills | `x_hr.employee_training_commitment` | yes |
| Leave | `hr.leave` | native extension fields | optional official form |
| Administrative permission | employee/attendance later | `x_hr.employee_permission_type`, `x_hr.employee_permission_request` | optional/yes |
| Work assignment | employee/planning/project later | `x_hr.employee_work_assignment` | yes |
| Appraisal | `hr.appraisal` | `x_hr.appraisal_evaluation_line` | yes |
| Separation | employee/departure later | `x_hr.employee_separation_request` | yes |
| Clearance | employee/departure/custody/finance/IT | `x_hr.employee_clearance`, `x_hr.employee_clearance_line` | final clearance PDF/sign |

## Employee declarations

Model:

```text
x_hr.employee_declaration
```

Initial declaration types:

- exclusive work / no duplication declaration;
- occupational safety acknowledgment;
- human waste handling employee undertaking;
- human waste storage supervisor undertaking.

The model should allow reusable core fields while still supporting declaration-type-specific structured properties where needed.

## Custody and assets

Models:

```text
x_hr.employee_custody_type
x_hr.employee_custody_item
```

Start with ID card receipt, but design for:

- ID cards;
- PPE;
- uniforms;
- access cards;
- vehicles;
- laptops;
- radios;
- future inventory/fleet integration.

Each custody type may define structured properties relevant to the item type.

Offboarding clearance must read open custody lines and force return, settlement, charge, waiver, or manual override before closure.

## Training and certifications

Model:

```text
x_hr.employee_training_commitment
```

The training workflow must support:

- course name;
- provider;
- cost;
- certificate submission;
- service commitment;
- reimbursement/recovery metadata;
- future `hr.resume.line` and `hr.skill` linkage.

## Administrative permissions

Models:

```text
x_hr.employee_permission_type
x_hr.employee_permission_request
```

The permission type model defines configurable behavior:

- date required;
- from/to time required;
- reason required;
- attachment required;
- manager approval required;
- HR approval required;
- GM approval required;
- affects attendance;
- deducts leave balance;
- creates optional `approval.request`.

The source of truth remains `x_hr.employee_permission_request`.

## Leave

Anchor:

```text
hr.leave
```

Marsellia should extend native leave rather than replace it.

Potential fields:

- address during leave;
- contact during leave;
- acting employee;
- HR balance check;
- manual decision number/date/attachment;
- official generated/signed form fields where required.

## Work assignments

Model:

```text
x_hr.employee_work_assignment
```

Start as a controlled HR assignment approval and signed document workflow.

Future hooks:

- overtime;
- payroll;
- planning;
- project;
- timesheets;
- fleet/site assignment.

## Appraisal

Anchor:

```text
hr.appraisal
```

Extension model:

```text
x_hr.appraisal_evaluation_line
```

Use native appraisals for the parent record and extend with Marsellia scoring lines, QWeb report, and Sign workflow where required.

## Separation

Model:

```text
x_hr.employee_separation_request
```

The separation request starts the exit process but does not archive the employee directly.

Possible states:

```text
draft
submitted
manager_review
hr_review
gm_approval
approved
rejected
cancelled
```

## Clearance

Models:

```text
x_hr.employee_clearance
x_hr.employee_clearance_line
```

Clearance lines should be generated from:

- employee department;
- open custody lines;
- IT/system access checklist;
- finance/final settlement checklist;
- HR documents checklist;
- role-specific obligations.

Final native employee departure/archive only happens after clearance is complete.

## GRC hooks

Use GRC initially for role/function classification and future-proof hooks.

Do not implement full GRC decision instances in the first employment lifecycle passes.

Use manual decision metadata now and keep `decision_instance` as a future upgrade path.
