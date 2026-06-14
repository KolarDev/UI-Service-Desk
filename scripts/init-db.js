const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../src/data');
const dbPath = path.join(dbDir, 'mock-db.json');

const initialData = {
  "units": [
    {
      "id": "unit-1",
      "name": "Fiber & Core Infrastructure Unit",
      "description": "Handles entire building network blackouts, damaged fiber optic cables, structural switch failures, and core backbone links."
    },
    {
      "id": "unit-2",
      "name": "Helpdesk & LAN Routing Unit",
      "description": "Handles office LAN port faults, wall jack replacements, single system IP configuration conflicts, and localized Wi-Fi router issues."
    },
    {
      "id": "unit-3",
      "name": "Network Operations Center (NOC)",
      "description": "Handles institutional email access locks, departmental sub-domain setups, firewall white-listing, and server access exceptions."
    }
  ],
  "tickets": []
};

function initDb() {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('Created database directory at:', dbDir);
    }

    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
      console.log('Seeded database successfully at:', dbPath);
    } else {
      console.log('Database already exists at:', dbPath);
      // Double check that the format matches
      try {
        const existingData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (!existingData.units || !existingData.tickets) {
          fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
          console.log('Database format was invalid. Re-initialized database.');
        }
      } catch (e) {
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
        console.log('Database file was corrupt. Re-initialized database.');
      }
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDb();
