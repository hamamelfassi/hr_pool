{
    "name": "HR Recruitment Custom",
    "version": "19.0.1.0.0",
    "summary": "Thin technical extensions for native Odoo Recruitment",
    "depends": [
        "base",
        "mail",
        "hr",
        "hr_recruitment",
        "grc_backbone"
    ],
    "category": "Human Resources",
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "LGPL-3",
    "data": [
        "models/01_fields.xml",
        "views/01_recruitment_views.xml"
    ]
}

