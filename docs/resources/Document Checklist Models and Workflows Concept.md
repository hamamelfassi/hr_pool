> Historical/concept note:
> This concept document is retained for rationale.
>
> Pass 6A should use the current Stage 2 model names and implementation state:
> - `x_hr.recruitment_required_document_type`
> - `x_hr.applicant_required_document_checklist`
> - `x_hr.applicant_required_document_line`
> - `x_hr.applicant_required_document_submission`
>
> The checklist is the control sheet. The submission model is the evidence store.

## **Required documents submission/checklist model**

Your proposed model is broadly right. I would sharpen it like this.

Use four models:

### **A. `x_hr.required_document_type`**

Master data.

Examples:

* national ID (الرقم الوطني)
* opersonal ID (البطاقة الشخصية)
* birth certificate (شهادة الميلاد)
* family status  (الوضع العائلي)
* passport  (جواز السفر)
* driving license (رخصة قيادة) 
* qualification certificate  (المؤهل العلمي)
* CV  (السيرة الذاتية)
* Blood report (التحليل الثلاثي)
* medical certificate (شهادة صحية من المختبرالمرجعي)
* criminal record certificate  (شهادة الحالة الجنائية)
* residence certificate (شهادة الإقامة)  
* non-duplicate employment certificate (إفادة بعدم الإزدواجية)
* personal photo (8 صور شخصية)

Fields:

* name  
* code  
* required by default  
* applies to role/type/nationality if needed  
* allows multiple submissions  
* active

### **B. `x_hr.applicant_document_checklist`**

One checklist per applicant, or one per collection round.

Fields:

* applicant  
* state: `draft`, `requested`, `partially_received`, `received`, `under_review`, `complete`, `resubmission_requested`  
* request URL  
* requested date  
* completed date  
* reviewed by  
* PDF attachment  
* signed PDF attachment  
* recruitment document link

### **C. `x_hr.applicant_document_line`**

One line per required document type.

Fields:

* checklist  
* applicant  
* document type  
* required yes/no  
* status: `missing`, `submitted`, `accepted`, `rejected`, `resubmission_requested`  
* submitted count  
* latest attachment  
* reviewer note

### **D. `x_hr.applicant_submitted_document`**

One record per uploaded file.

Fields:

* applicant  
* checklist  
* document line  
* document type  
* attachment  
* source: Fillout/Zite/n8n/manual  
* submitted date  
* status: `submitted`, `accepted`, `rejected`  
* reviewer note  
* source submission ID

This is better than storing many attachments directly on the checklist line because you said applicants may submit once or multiple times, and some types may allow multiple documents. A separate submitted-document model handles that cleanly.

## **9\. How the Fillout submission flow should work**

Your idea is right:

1. HR clicks `Request Documents`.  
2. Odoo generates/checks the checklist and required lines.  
3. Odoo/n8n creates a prefilled Fillout URL.  
4. HR sends URL to applicant by email/chatter/activity.  
5. Applicant uploads documents.  
6. Fillout webhook sends payload to n8n.  
7. n8n writes uploaded documents into Odoo as `x_hr.applicant_submitted_document`.  
8. Odoo marks matching checklist lines as submitted.  
9. HR reviews each line.  
10. Once all required lines are accepted, HR clicks `Complete Checklist`.  
11. Odoo generates checklist PDF.  
12. Checklist PDF becomes a `x_hr.recruitment_document` artifact.  
13. HR/interviewer signs checklist through Sign.

That is coherent.

## **10\. How to prefill the Fillout URL**

Best approach:

Generate a URL with query parameters from Odoo and store it on the checklist.

Example conceptual URL:

```
https://forms.fillout.com/t/document-upload?
applicant_id=123
&checklist_id=456
&token=SECURETOKEN
&required_types=national_id,cv,certificate
```

But do **not** rely only on raw applicant ID/checklist ID.

Use a secure token.

Add field on checklist:

* `x_public_upload_token`  
* `x_upload_token_expires_on`  
* `x_fillout_prefill_url`

The token should map back to:

* applicant  
* checklist  
* allowed document types  
* expiry  
* whether resubmission is allowed

Since you are on Odoo SaaS and using n8n, the clean version is:

* Odoo stores the token/checklist.  
* Fillout submits token \+ uploaded files.  
* n8n validates token against Odoo before writing attachments.  
* n8n writes uploaded files to the right document type lines.

This prevents someone from changing `applicant_id=123` to `124`.

## **11\. How resubmission should work**

When HR rejects a document:

* submitted document status \= `rejected`  
* checklist line status \= `resubmission_requested`  
* reviewer note required  
* regenerate/resend the same Fillout URL or a narrowed URL

Better UX:

* Send one URL that can show all required types, but pre-highlight rejected/missing ones.  
* n8n accepts only document types that belong to the checklist.  
* New submission creates new `x_hr.applicant_submitted_document`; it does not overwrite the old one.

Old rejected files remain part of the audit trail.

## **12\. Where this connects to `x_hr.recruitment_document`**

The checklist itself is operational data.

The signed checklist PDF is a recruitment document artifact.

So:

* `x_hr.applicant_document_checklist` owns collection/review.  
* `x_hr.recruitment_document` owns the generated/signable PDF lifecycle.

When checklist is marked complete:

1. Generate checklist PDF.  
2. Create/update recruitment document:  
   * type \= `required_documents_checklist`  
   * source model \= checklist  
   * generated attachment \= checklist PDF  
3. Send to HR/interviewer for signature.  
4. Signed artifact returns to registry and applicant chatter.

