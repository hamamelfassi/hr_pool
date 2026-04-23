{
    "name": "HR Pool",
    "depends": [
        "base",
        "contacts",
        "hr_recruitment"
    ],
    "category": "Human Resources",
    "application": True,
    "data": [
        "security/groups.xml",
        "models/01_models.xml",

        "security/ir.model.access.csv",

        "models/02_fields_main.xml",
        "models/03_fields_child_and_helper.xml",

        "data/01_selection_values.xml",
        "data/02_seed_helper_data.xml",
        "data/03_sequence.xml",

        "views/01_main_views.xml",
        "views/02_helper_views.xml",

        "actions/01_actions.xml",
        "data/04_server_actions.xml",
        "menus/01_menus.xml"
    ]
}
