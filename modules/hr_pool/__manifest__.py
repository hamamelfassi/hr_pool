{
    "name": "HR Pool",
    "depends": [
        "base",
        "contacts",
        "hr_recruitment",
        "mail",
        "documents"
    ],
    "category": "Human Resources",
    "installable": True,
    "auto_install": False,
    "data": [
        "security/groups.xml",
        "models/01_models.xml",

        "security/ir.model.access.csv",

        "models/02_fields_main.xml",
        "models/03_fields_child_and_helper.xml",
        "models/04_fields_documents.xml",

        "data/01_selection_values.xml",
        "data/02_seed_helper_data.xml",
        "data/03_sequence.xml",
        "report/01_paperformat.xml",
        "report/02_hr_pool_report_templates.xml",
        "report/03_hr_pool_report_actions.xml",

        "views/01_main_views.xml",
        "views/02_helper_views.xml",

        "actions/01_actions.xml",
        "data/04_server_actions.xml",
        "menus/01_menus.xml"
    ]
}
