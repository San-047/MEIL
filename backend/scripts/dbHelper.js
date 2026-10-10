const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "db.json");

function readDB() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(db) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
}

function entityLabel(entityPath, org) {
  if (!entityPath || !entityPath.plantId) return "Group";
  for (const sub of org.subsidiaries) {
    for (const bu of sub.businessUnits) {
      for (const plant of bu.plants) {
        if (plant.id === entityPath.plantId) {
          return `${sub.name} / ${plant.name}`;
        }
      }
    }
  }
  return "Group";
}

module.exports = { readDB, writeDB, entityLabel, DATA_PATH };
