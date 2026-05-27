
# Bank and Payroll Readiness Doctrine

## Native bank model

Employee payroll banking must use native `res.partner.bank`.

Do not use only custom text fields on applicant or contract records.

## Source data

Recruitment currently collects bank data through applicant required-document submissions and/or applicant employment contract fields, including:

- bank name;
- bank branch;
- bank account number;
- IBAN custom field where available;
- source bank attachment/submission;
- `x_partner_bank_id` where already created.

## Required handover behavior

Pass 13 must create or find a full native bank account record and link it to the employee:

```text
Applicant bank submission / Applicant Employment Contract
→ res.partner.bank
→ hr.employee.bank_account_ids
```

## IBAN rule

If Marsellia has collected an IBAN custom field during applicant/preboarding, the handover must write it to the native bank account record as well.

Implementation rule:

1. If `res.partner.bank.x_iban` or the actual exported custom IBAN field exists, write the applicant IBAN value to that field.
2. If no IBAN field exists on `res.partner.bank`, add a custom `x_iban` field on `res.partner.bank` in the employment module.
3. Keep `res.partner.bank.acc_number` populated with the account number used by Odoo as the operational bank account number.
4. Do not collapse IBAN, branch, and account number into one text note.

## Partner/holder rule

The bank account should be attached to the correct account holder partner.

Preferred order:

1. employee private/contact partner if available and safe;
2. employee home/private address partner if that is Odoo's configured holder;
3. a created/linked partner representing the employee if no suitable partner exists.

Do not attach employee payroll bank accounts to the company partner unless intentionally modeling a company-owned account.

## Employee link

Link the created/found bank account to:

```text
hr.employee.bank_account_ids
```

Let Odoo compute/handle:

- primary bank account;
- multiple bank account status;
- salary distribution behavior;
- trusted bank account status.

## Payroll readiness vs payment readiness

Payroll-ready means:

- employee exists;
- contract exists;
- contract wage/schedule/pay structure fields are configured where available;
- at least one native bank account is linked if bank data was collected.

Payment-ready is stronger and should require finance/payroll validation of the bank account trust/payment status.

Pass 13 should make the employee payroll-ready, not automatically payment-trusted.

## Chatter/artifact rule

Copy the source bank proof attachment to employee chatter/files during handover.
