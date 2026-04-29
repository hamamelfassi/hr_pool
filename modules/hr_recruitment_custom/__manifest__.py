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
        "data/02_tor_selection_values.xml",
        "data/03_tor_normalization_automation.xml",
        "report/01_paperformat.xml",
        "report/02_tor_report_templates.xml",
        "report/03_tor_report_actions.xml",
        "data/04_tor_workflow_actions.xml",
        "views/01_recruitment_views.xml"
    ]
}
