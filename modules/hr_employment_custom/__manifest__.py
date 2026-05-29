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
        "security/ir.model.access.csv",
        "data/01_employee_identification_automation.xml",
        "data/02_employee_identification_actions.xml",
        "data/03_employee_declaration_automation.xml",
        "views/01_employee_identification_views.xml",
        "views/02_employee_declaration_views.xml"
    ]
}
