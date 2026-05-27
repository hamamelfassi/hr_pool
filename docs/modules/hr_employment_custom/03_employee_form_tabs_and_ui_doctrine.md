# Employee Form Tabs and UI Doctrine

## Native tabs to preserve

The employee form should remain native and familiar.

Preserve and enrich:

- Work;
- Resume;
- Personal;
- Payroll;
- Salary Adjustments;
- Settings.

Do not duplicate native fields into custom tabs unless a Marsellia workflow requires a distinct process surface.

## Custom tabs

Add these custom tabs to `hr.employee`:

1. `الإقرارات`
2. `العهد والممتلكات`
3. `التدريب والشهادات`
4. `التكليفات`
5. `الإجازات`
6. `الأذونات`
7. `تقييم الأداء`
8. `إنهاء الخدمة`
9. `إخلاء الطرف`

## Process view pattern

Each custom tab should show one2many process records.

The opened process form should include:

- statusbar/state at the top;
- icon-only artifact controls in header where practical;
- workflow action row below the statusbar/header, not between icons;
- grouped business fields;
- readonly derived/action-written fields;
- badge/state decoration in list/inline rows;
- generated/signed/certificate attachment fields;
- notes;
- chatter.

## State decoration rule

All process states should use Odoo-native statusbar and badge decoration signals where possible.

Typical mapping:

- draft: muted/secondary;
- generated: info;
- signature requested/submitted: warning;
- approved/signed/complete: success;
- rejected/cancelled/blocked: danger;
- superseded/archived: muted.

## Button placement rule

Workflow buttons must not be placed between artifact icon controls.

Use this order:

1. header/statusbar;
2. icon-only artifact controls where appropriate;
3. separate workflow action row;
4. business fields;
5. notes/chatter.
