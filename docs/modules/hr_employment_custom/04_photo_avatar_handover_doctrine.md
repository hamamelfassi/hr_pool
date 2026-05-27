
# Photo and Avatar Handover Doctrine

## Goal

The candidate photo collected during Stage 1 intake must become the formal employee profile photo.

## Canonical flow

```text
x_hr.pool.x_profile_photo
→ hr.applicant applicant photo field
→ hr.employee.image_1920
```

## Implementation rule

Write the best available original candidate photo to `hr.employee.image_1920`.

Do not manually write every avatar or resized image field unless field metadata proves that a specific field is writable and required.

Default assumption:

- `image_1920` is the canonical source image field;
- dependent display/avatar fields should be computed or derived by Odoo image/avatar mechanics.

## Pass 13 requirements

Pass 13 must:

1. inspect actual `hr.applicant` image/photo fields;
2. add an applicant photo field if missing;
3. update pool-to-applicant conversion so the photo is carried forward;
4. write the applicant photo to `hr.employee.image_1920` during On-board Now;
5. verify display behavior in employee kanban/list/form and mobile.

## Do not

- store photo only as a chatter attachment;
- write only a low-resolution avatar field;
- skip applicant-stage photo storage if employee handover depends on it.

## Canonical Pass 13 source token

The Stage 1 public-intake photo source is canonically referenced as:

```text
hr_pool.x_profile_photo
→ hr.applicant applicant photo field
→ hr.employee.image_1920
```

This is a documentation shorthand for the Stage 1 pool photo field and does not change the actual Odoo technical model naming.

