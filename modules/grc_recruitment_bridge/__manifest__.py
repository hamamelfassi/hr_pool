{
    "name": "Recruitment Governance",
    "summary": "Recruitment-domain governance bridge for Marsellia",
    "depends": [
        "base",
        "hr",
        "hr_recruitment",
        "hr_pool",
        "grc_backbone"
    ],
    "category": "Human Resources",
    "application": True,
    "data": [
        "security/groups.xml",
        "models/01_models.xml",
        "models/02_fields_templates.xml",
        "models/03_fields_bridge.xml",
        "data/01_selection_values.xml",
        "data/02_sequence.xml",
        "data/03_seed_templates.xml",
        "actions/01_actions.xml",
        "views/01_templates_views.xml",
        "views/02_bridge_views.xml",
        "menus/01_menus.xml",
        "security/ir.model.access.csv"
    ]
}
