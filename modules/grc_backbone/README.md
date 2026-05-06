# grc_backbone

`grc_backbone` is the reusable governance, risk, compliance, taxonomy, and master-data backbone for the Marsellia / MCEP Odoo SaaS IMS program.

It is an installable Odoo SaaS custom module. Keep this folder limited to files that belong inside the uploadable Odoo module zip.

## Current purpose

The module provides reusable governance primitives and reference libraries for other custom and native Odoo workflows.

Current implemented areas include:

- governance frameworks
- policies
- provisions / rules
- functional areas
- governed functions
- SOP/task-template structures
- risk and compliance primitives
- commercial/tender governance primitives
- Libya location taxonomy

## Libya location taxonomy

The module now owns the canonical location taxonomy model:

`x_grc.location`

The hierarchy is:

```text
region → district → municipality → locality
```