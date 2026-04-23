{
    "name": "GRC Backbone",
    "summary": "Centralized Governance, Risk, and Compliance starter backbone for Marsellia",
    "depends": [
        "base",
        "uom",
        "hr",
        "hr_recruitment",
        "hr_pool"
    ],
    "category": "Human Resources",
    "application": True,
    "data": [
        "security/groups.xml",
        "models/01_models.xml",
        "models/02_fields_core_base.xml",
        "models/03_fields_core_o2m.xml",
        "models/04_fields_extensions_base.xml",
        "models/05_fields_extensions_o2m.xml",
        "data/01_selection_values.xml",
        "data/02_sequences.xml",
        "data/03_seed_functional_taxonomy.xml",
        "actions/01_actions.xml",
        "views/01_governance_views.xml",
        "views/02_taxonomy_views.xml",
        "views/03_risk_compliance_views.xml",
        "views/04_commercial_views.xml",
        "views/05_hr_extension_views.xml",
        "security/ir.model.access.csv"
    ]
}
