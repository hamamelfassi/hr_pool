
# Employee Form Tabs and View Architecture

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
   - work exclusivity declaration;
   - occupational safety declaration;
   - HSE/human-waste employee undertaking;
   - HSE/human-waste supervisor undertaking.

2. `العهد والممتلكات`
   - ID card;
   - PPE;
   - uniforms;
   - access cards;
   - vehicles;
   - laptops;
   - radios;
   - future inventory/fleet integration.

3. `التدريب والشهادات`
   - training commitments;
   - certificate tracking;
   - resume line integration;
   - skills/certifications integration.

4. `التكليفات`
   - work assignment records;
   - future overtime/payroll/planning/project hooks.

5. `الإجازات`
   - native `hr.leave` overlay;
   - Marsellia leave form;
   - official PDF/signing if required.

6. `الأذونات`
   - typed administrative permission requests.

7. `تقييم الأداء`
   - native `hr.appraisal` extension;
   - scoring/evaluation lines;
   - QWeb/sign workflow.

8. `إنهاء الخدمة`
   - separation/resignation/non-renewal request.

9. `إخلاء الطرف`
   - final clearance workflow;
   - custody closure;
   - IT/finance/stores/HR clearances.

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
