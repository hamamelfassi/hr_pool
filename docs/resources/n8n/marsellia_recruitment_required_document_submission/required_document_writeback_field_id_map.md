# Required Document Writeback — Fillout Field ID Map

This document locks the Fillout question ID to canonical integration field name map used by the n8n parser.

Routing values come from `submission.urlParameters`.

Applicant-filled values and uploaded files come from `submission.questions`, using stable Fillout question IDs instead of Arabic visible labels.

## Rules

- Do not depend on Arabic question labels for writeback.
- Use Fillout question `id` as the stable mapping key.
- Keep visible Arabic labels free to change.
- Document numbers and identifiers must stay as text/ShortAnswer in Fillout.
- `generated_url` is ignored by n8n if present in old hidden fields or old URLs.
- `jpNf` is overall form notes.
- `7jUn` is bank-specific notes.

## Mapping

| Fillout ID | Canonical field                               |
| ---------- | --------------------------------------------- |
| 4qDA       | form_base_url                                 |
| 9jDc       | request_reference                             |
| jU4d       | token_reference                               |
| 11E1       | state                                         |
| m3pV       | candidate_name                                |
| ukoR       | candidate_email                               |
| hgtH       | odoo_request_id                               |
| 6h4X       | odoo_applicant_id                             |
| rKQf       | odoo_checklist_id                             |
| e538       | odoo_request_id                               |
| qamX       | expires_at                                    |
| ioYz       | sent_at                                       |
| 12mB       | last_response_at                              |
| iEoh       | cv_file_upload                                |
| 66uF       | cv_notes                                      |
| jzWb       | qualification_file_upload                     |
| rfRH       | qualification_document_number                 |
| dvmD       | qualification_subject                         |
| pnZ3       | qualification_type                            |
| jSpv       | qualification_issuing_authority               |
| wXi5       | qualification_place_of_issue                  |
| 5UjP       | qualification_date_of_issue                   |
| sDDB       | qualification_date_of_expiry                  |
| ewg6       | qualification_notes                           |
| c7Fa       | birth_certificate_file_upload                 |
| eXE9       | date_of_birth                                 |
| jman       | place_of_birth                                |
| tdTT       | country_of_birth                              |
| kzKV       | birth_certificate_document_number             |
| gNr5       | birth_certificate_issuing_authority           |
| e4ef       | birth_certificate_place_of_issue              |
| uxFt       | birth_certificate_date_of_issue               |
| jUCa       | birth_certificate_date_of_expiry              |
| mz3F       | birth_certificate_notes                       |
| 1KXp       | family_status_file_upload                     |
| c8Jz       | family_reference_number                       |
| gLB5       | family_paper_number                           |
| c1hW       | next_of_kin_phone                             |
| epgD       | next_of_kin_name                              |
| qDRY       | family_status_document_number                 |
| 9vz5       | family_status_issuing_authority               |
| 4JR6       | family_status_place_of_issue                  |
| 22QV       | family_status_date_of_issue                   |
| vxXB       | family_status_date_of_expiry                  |
| tjsQ       | family_status_notes                           |
| hyYw       | residence_certificate_file_upload             |
| ksVL       | residence_certificate_document_number         |
| ifcA       | residence_certificate_issuing_authority       |
| u1dZ       | residence_certificate_place_of_issue          |
| 1QHD       | residence_certificate_date_of_issue           |
| pC8G       | residence_certificate_date_of_expiry          |
| 4ny8       | residence_certificate_notes                   |
| poLi       | national_id_file_upload                       |
| xuPR       | national_id_document_number                   |
| 2enp       | national_id_issuing_authority                 |
| uPi7       | national_id_place_of_issue                    |
| cdaF       | national_id_date_of_issue                     |
| bzXp       | national_id_date_of_expiry                    |
| tXhc       | national_id_notes                             |
| tyRF       | criminal_record_file_upload                   |
| 4432       | criminal_record_document_number               |
| iTuG       | criminal_record_issuing_authority             |
| 6XRN       | criminal_record_place_of_issue                |
| gU6k       | criminal_record_date_of_issue                 |
| 1WFQ       | criminal_record_date_of_expiry                |
| 82VC       | criminal_record_notes                         |
| 9QRg       | health_certificate_file_upload                |
| jqxu       | blood_type                                    |
| oeaH       | health_certificate_document_number            |
| qire       | health_certificate_issuing_authority          |
| m6sx       | health_certificate_place_of_issue             |
| mTnb       | health_certificate_date_of_issue              |
| rLtb       | health_certificate_date_of_expiry             |
| 6Lxr       | health_certificate_notes                      |
| couc       | passport_file_upload                          |
| 8P7s       | passport_document_number                      |
| nuRr       | passport_issuing_authority                    |
| 2A52       | passport_place_of_issue                       |
| 4Jsq       | passport_date_of_issue                        |
| gho6       | passport_date_of_expiry                       |
| s1Xy       | passport_notes                                |
| fmfU       | id_card_file_upload                           |
| 9HJb       | id_card_document_number                       |
| xjzj       | id_card_issuing_authority                     |
| gdEy       | id_card_place_of_issue                        |
| ssVb       | id_card_date_of_issue                         |
| iqUf       | id_card_date_of_expiry                        |
| aakM       | id_card_notes                                 |
| iMXW       | driving_license_file_upload                   |
| vfQj       | driving_license_document_number               |
| mGdT       | driving_license_issuing_authority             |
| bMYb       | driving_license_place_of_issue                |
| uKdZ       | driving_license_date_of_issue                 |
| cCiZ       | driving_license_date_of_expiry                |
| 9Rzj       | driving_license_notes                         |
| c7Z2       | non_duplication_certificate_file_upload       |
| 18YW       | non_duplication_certificate_document_number   |
| jDfS       | non_duplication_certificate_issuing_authority |
| qFjp       | non_duplication_certificate_place_of_issue    |
| jsEL       | non_duplication_certificate_date_of_issue     |
| miDH       | non_duplication_certificate_date_of_expiry    |
| gwFN       | non_duplication_certificate_notes             |
| 5U3s       | account_number                                |
| 32uF       | bank_branch                                   |
| tJF4       | bank_name                                     |
| pvXT       | iban                                          |
| 7jUn       | bank_notes                                    |
| jpNf       | form_notes                                    |