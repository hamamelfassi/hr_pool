
# Employment Lifecycle Process Catalogue

## Process groups

| Process | Anchor | Custom model | Signed artifact |
|---|---|---|---|
| Employment handover | `hr.employee`, `hr.contract`, `res.partner.bank` | minimal extension fields | no new signature |
| Employee declarations | `hr.employee` | `x_hr.employee_declaration` | yes |
| Custody/assets | `hr.employee` | `x_hr.employee_custody_type`, `x_hr.employee_custody_item` | yes for custody receipt |
| Training | `hr.employee`, resume/skills | `x_hr.employee_training_commitment` | yes |
| Leave | `hr.leave` | native extension fields | optional official form |
| Administrative permission | employee/attendance later | `x_hr.employee_permission_type`, `x_hr.employee_permission_request` | optional/yes |
| Work assignment | employee/planning/project later | `x_hr.employee_work_assignment` | yes |
| Appraisal | `hr.appraisal` | `x_hr.appraisal_evaluation_line` | yes |
| Separation | employee/departure later | `x_hr.employee_separation_request` | yes |
| Clearance | employee/departure/custody/finance/IT | `x_hr.employee_clearance`, `x_hr.employee_clearance_line` | final clearance PDF/sign |

## Form-to-process normalized names

Reference numbers should remain technical metadata. User-facing names should be normalized:

- Training Undertaking;
- Exclusive Work Declaration;
- ID Card Receipt / Custody Acknowledgment;
- Occupational Safety Acknowledgment;
- Administrative Permission;
- Leave Request;
- Work Assignment;
- Performance Evaluation;
- Separation Request;
- Final Clearance;
- Human Waste Handling Undertaking;
- Human Waste Storage Supervisor Undertaking.
