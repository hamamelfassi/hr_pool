{
    "name": "GRC Backbone",
    "depends": [
        "base",
        "uom"
    ],
    "installable": True,
    "auto_install": False,
    "data": [
        "security/groups.xml",
        "models/01_models.xml",
        "models/02_fields_core_base.xml",
        "models/03_fields_core_o2m.xml",
        "models/04_fields_task_templates_base.xml",
        "models/05_fields_task_templates_o2m.xml",
        "data/01_selection_values.xml",
        "data/02_sequences.xml",
        "data/03_seed_functional_taxonomy.xml",
        "data/04_seed_task_templates.xml",
        "actions/01_actions.xml",
        "actions/02_actions_task_templates.xml",
        "views/01_governance_views.xml",
        "views/02_taxonomy_views.xml",
        "views/03_risk_compliance_views.xml",
        "views/04_commercial_views.xml",
        "views/05_task_templates_views.xml",
        "security/ir.model.access.csv"
    ]
}
