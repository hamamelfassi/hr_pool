#!/usr/bin/env python3
from pathlib import Path
import ast
import re
import sys

MODULE = Path("modules/grc_backbone")

RETIRED_MODELS = [
    "x_grc.framework",
    "x_grc.policy",
    "x_grc.provision",
    "x_grc.decision",
    "x_grc.sop",
    "x_grc.task_template",
    "x_grc.task_template_line",
    "x_grc.risk",
    "x_grc.risk_assessment",
    "x_grc.control",
    "x_grc.compliance_check",
    "x_grc.incident",
    "x_grc.contract_template",
    "x_grc.tender",
    "x_grc.clause",
]

ALLOWED_ACTIVE_FILES = {
    # Safe cleanup file may mention only the SaaS boundary and temporary action names,
    # but should not contain retired model names.
}

def exact_model_hit(text: str, model: str) -> bool:
    return re.search(r"(?<![A-Za-z0-9_\.])" + re.escape(model) + r"(?![A-Za-z0-9_])", text) is not None

def main() -> int:
    manifest_path = MODULE / "__manifest__.py"
    if not manifest_path.exists():
        print("Missing manifest:", manifest_path)
        return 1

    manifest = ast.literal_eval(manifest_path.read_text(encoding="utf-8"))
    data_files = manifest.get("data", [])

    bad = []

    for rel in data_files:
        if rel in ALLOWED_ACTIVE_FILES:
            continue

        p = MODULE / rel
        if not p.exists() or p.suffix not in {".xml", ".csv"}:
            continue

        text = p.read_text(encoding="utf-8", errors="replace")
        for model in RETIRED_MODELS:
            if exact_model_hit(text, model):
                bad.append((rel, model))

    if bad:
        print("STOP: active GRC manifest-loaded files reference retired scaffold models:")
        for rel, model in bad:
            print(f"- {rel}: {model}")
        return 1

    print("GRC retired scaffold reference check passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
