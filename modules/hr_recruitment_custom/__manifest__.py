{
    "name": "HR Recruitment Custom",
    "depends": [
        "base",
        "mail",
        "hr",
        "hr_recruitment",
        "grc_backbone"
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "data": [
        "models/01_fields.xml",
        "views/01_recruitment_views.xml"
    ]
}
