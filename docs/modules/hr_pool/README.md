# HR Pool Module Docs

Documentation for the `hr_pool` module lives here.

Suggested contents:

- model and field references
- workflow notes
- n8n payload contracts
- deployment and upgrade notes
- generated form/PDF specifications

## Pass 4 intake simplification

The Stage 1 public Fillout/Zite intake is now a lightweight Arabic-first candidate application.

Current intake posture:

- collects Arabic name parts, including father and grandfather names;
- keeps English name parts optional;
- uses municipality-level residence selection;
- uses municipality-level preferred work location multi-selection;
- no longer collects education, employment history, skills, or language lines in the first form;
- no longer requires typed consent name;
- keeps accuracy and privacy declarations as boolean confirmations.

Deferred enrichment remains possible through manual Odoo entry or a later prefilled enrichment form.