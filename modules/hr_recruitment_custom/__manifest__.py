{
    "name": "HR Recruitment Custom",
    "depends": [
        "base",
        "base_automation",
        "mail",
        "hr",
        "hr_recruitment",
        "grc_backbone"
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "data": [
        "models/00_models.xml",
        "models/01_fields.xml",
        "security/ir.model.access.csv",
        "data/01_role_definition_automation.xml",
        "views/01_recruitment_views.xml"
    ]
}
