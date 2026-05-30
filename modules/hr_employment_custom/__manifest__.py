{
    "name": "MCEP HR Employment Custom",
    "summary": "Marsellia employee lifecycle extensions for native HR employees",
    "category": "Human Resources",
    "depends": [
        "base",
        "mail",
        "hr",
        "sign",
        "base_automation",
        "grc_backbone"
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "data": [
        "models/01_employee_identification.xml",
        "models/02_employee_declaration.xml",
        "models/03_employee_custody.xml",
        "security/ir.model.access.csv",
        "data/01_employee_identification_automation.xml",
        "data/02_employee_identification_actions.xml",
        "data/03_employee_declaration_automation.xml",
        "data/04_employee_declaration_generate_actions.xml",
        "data/05_employee_declaration_sign_actions.xml",
        "data/06_employee_declaration_artifact_actions.xml",
        "data/07_employee_custody_automation.xml",
        "views/01_employee_identification_views.xml",
        "views/02_employee_declaration_views.xml",
        "views/03_employee_custody_views.xml",
        "report/01_employee_declaration_paperformat.xml",
        "report/02_common_employee_report_assets.xml",
        "report/03_employee_declaration_f0010_templates.xml",
        "report/05_employee_declaration_f0013_templates.xml",
        "report/06_employee_declaration_f0021_templates.xml",
        "report/07_employee_declaration_f0022_templates.xml",
        "report/04_employee_declaration_report_actions.xml"
    ]
}
