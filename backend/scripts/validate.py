#!/usr/bin/env python3
"""
BRSR Validation Engine
Reads data/db.json, runs a set of data-quality/reconciliation checks over
the BRSR disclosure entries, and prints a JSON array of validation results
to stdout. Node.js (server.js) invokes this script and stores the result.
"""
import json
import os
import sys
from datetime import datetime

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "db.json")


def is_blank(v):
    return v is None or v == ""


def to_number(v):
    try:
        if isinstance(v, bool):
            return None
        return float(v)
    except (TypeError, ValueError):
        return None


def entity_label(entity_path, plants_index):
    plant_id = entity_path.get("plantId")
    if not plant_id:
        return "Group"
    p = plants_index.get(plant_id)
    return f"{p['subsidiaryName']} / {p['plantName']}" if p else "Group"


def build_plants_index(org):
    idx = {}
    for sub in org["subsidiaries"]:
        for bu in sub["businessUnits"]:
            for plant in bu["plants"]:
                idx[plant["id"]] = {
                    "subsidiaryName": sub["name"],
                    "businessUnitName": bu["name"],
                    "plantName": plant["name"]
                }
    return idx


def run_validations(db):
    entries = db["entries"]
    plants_index = build_plants_index(db["org"])
    by_id = {e["id"]: e for e in entries}
    results = []
    rid = 1

    def add(entry, severity, check_type, message):
        nonlocal rid
        results.append({
            "id": f"V{rid:04d}",
            "entryId": entry["id"],
            "indicatorId": entry["indicatorId"],
            "indicator": entry["indicator"],
            "entity": entity_label(entry["entityPath"], plants_index),
            "severity": severity,
            "checkType": check_type,
            "message": message,
            "coreKpi": entry.get("coreKpi", False)
        })
        rid += 1

    
    for e in entries:
        if e["type"] == "essential" and e["unit"] not in ("text",) and is_blank(e["currentFY"]):
            add(e, "Critical", "Mandatory Field Missing",
                f"Essential indicator '{e['indicator']}' has no current FY value recorded.")

    
    for e in entries:
        if e["unit"] == "%":
            num = to_number(e["currentFY"])
            if num is not None and (num < 0 or num > 100):
                add(e, "Critical", "Percentage Out of Range",
                    f"Value {num}% for '{e['indicator']}' is outside the valid 0-100% range.")

    # 3. Improbable or negative values (for non-percentage numeric fields that cannot be negative)
    negative_ok_units = set()  # none of our numeric units may be negative
    for e in entries:
        if e["unit"] in ("count", "INR Lakhs", "GJ", "KL", "MT", "tCO2e", "rate"):
            num = to_number(e["currentFY"])
            if num is not None and num < 0:
                add(e, "Critical", "Improbable/Negative Value",
                    f"Value {num} {e['unit']} for '{e['indicator']}' is negative, which is not physically possible.")

    # 4. Year-on-year variance above threshold (40%)
    THRESHOLD = 0.40
    for e in entries:
        cur = to_number(e["currentFY"])
        prev = to_number(e["previousFY"])
        if cur is not None and prev is not None and prev != 0:
            variance = abs(cur - prev) / abs(prev)
            if variance > THRESHOLD:
                add(e, "Warning", "Year-on-Year Variance",
                    f"'{e['indicator']}' changed by {variance*100:.0f}% vs previous FY "
                    f"({prev} -> {cur}), exceeding the {int(THRESHOLD*100)}% threshold.")

    # 5. Unit mismatch (recorded unit override differs from catalog-defined unit)
    for e in entries:
        override = e.get("remarksUnitOverride")
        if override and override != e["unit"]:
            add(e, "Warning", "Unit Mismatch",
                f"'{e['indicator']}' recorded in '{override}' but catalog expects unit '{e['unit']}'.")

    # 6. Total energy should equal renewable + non-renewable (per plant)
    energy_groups = {}
    for e in entries:
        if "energy consumption" in e["indicator"]:
            key = e["entityPath"].get("plantId") or "GROUP"
            energy_groups.setdefault(key, {})
            if "renewable)" in e["indicator"] and "non-renewable" not in e["indicator"]:
                energy_groups[key]["renewable"] = e
            elif "non-renewable" in e["indicator"]:
                energy_groups[key]["non_renewable"] = e
            elif "overall" in e["indicator"]:
                energy_groups[key]["total"] = e
    for key, grp in energy_groups.items():
        if "renewable" in grp and "non_renewable" in grp and "total" in grp:
            r = to_number(grp["renewable"]["currentFY"])
            n = to_number(grp["non_renewable"]["currentFY"])
            t = to_number(grp["total"]["currentFY"])
            if r is not None and n is not None and t is not None and abs((r + n) - t) > 0.01:
                add(grp["total"], "Critical", "Internal Reconciliation Mismatch",
                    f"Total energy ({t} GJ) does not equal renewable + non-renewable ({r} + {n} = {r+n} GJ).")

    # 7. Pending complaints should not exceed filed complaints (per plant)
    complaint_groups = {}
    for e in entries:
        if "Complaints filed by stakeholders" in e["indicator"] or "Complaints pending resolution" in e["indicator"]:
            key = e["entityPath"].get("plantId") or "GROUP"
            complaint_groups.setdefault(key, {})
            if "filed" in e["indicator"]:
                complaint_groups[key]["filed"] = e
            else:
                complaint_groups[key]["pending"] = e
    for key, grp in complaint_groups.items():
        if "filed" in grp and "pending" in grp:
            f = to_number(grp["filed"]["currentFY"])
            p = to_number(grp["pending"]["currentFY"])
            if f is not None and p is not None and p > f:
                add(grp["pending"], "Critical", "Internal Reconciliation Mismatch",
                    f"Pending complaints ({p}) exceed total complaints filed ({f}) for the same period.")

    # 8. Female wages should not exceed total wages (per plant)
    wage_groups = {}
    for e in entries:
        if "Total employee wages paid" in e["indicator"] or "Wages paid to female employees" in e["indicator"]:
            key = e["entityPath"].get("plantId") or "GROUP"
            wage_groups.setdefault(key, {})
            if "Total employee wages paid" in e["indicator"]:
                wage_groups[key]["total"] = e
            else:
                wage_groups[key]["female"] = e
    for key, grp in wage_groups.items():
        if "total" in grp and "female" in grp:
            t = to_number(grp["total"]["currentFY"])
            f = to_number(grp["female"]["currentFY"])
            if t is not None and f is not None and f > t:
                add(grp["female"], "Critical", "Internal Reconciliation Mismatch",
                    f"Female wages ({f} INR Lakhs) exceed total employee wages ({t} INR Lakhs).")

    # 9. Missing evidence for BRSR Core KPIs
    for e in entries:
        if e.get("coreKpi") and e.get("evidenceRequired") and not e.get("evidenceId"):
            add(e, "Warning", "Missing Evidence for Core KPI",
                f"'{e['indicator']}' is a BRSR Core KPI but has no linked evidence.")

    # 10. Info-level: fields still not started close to due date
    today = datetime.utcnow().date()
    for e in entries:
        if e["status"] == "Not Started":
            try:
                due = datetime.strptime(e["dueDate"], "%Y-%m-%d").date()
                days_left = (due - today).days
                if days_left <= 7:
                    add(e, "Info", "Approaching Deadline",
                        f"'{e['indicator']}' is still Not Started with {days_left} day(s) until due date.")
            except ValueError:
                pass

    return results


def main():
    if not os.path.exists(DATA_PATH):
        print(json.dumps({"error": "data/db.json not found. Run npm run seed first."}))
        sys.exit(1)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)

    results = run_validations(db)
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
