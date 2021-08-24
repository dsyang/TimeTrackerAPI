const Database = require('better-sqlite3');

const DB_FILE = "dsyang.sqlite";
const CREATE_DATABASE_SQL = 
`
CREATE TABLE IF NOT EXISTS activities (
	timestamp_seconds INTEGER NOT NULL,
  client_timestamp_seconds INTEGER NOT NULL,
 	activity TEXT NOT NULL,
  device_agent TEXT NOT NULL,
	notes TEXT
);
`;

const INSERT_ITEM_SQL = 
`
INSERT INTO activities (
  timestamp_seconds, 
  client_timestamp_seconds,
  activity,
  device_agent,
  notes
) VALUES (
  @timestamp_seconds,
  @client_timestamp_seconds,
  @activity,
  @device_agent,
  @notes);
`;

const QUERY_ACTIVITIES_SQL = 
`
SELECT
   rowid,
   timestamp_seconds,
   client_timestamp_seconds,
   activity,
   device_agent,
   notes
FROM
   activities
ORDER BY 
	timestamp_seconds DESC;
`;

const db = new Database(DB_FILE, { verbose: console.log });
const dbCreate = db.prepare(CREATE_DATABASE_SQL);
dbCreate.run();
const dbInsert = db.prepare(INSERT_ITEM_SQL);
const dbQuery = db.prepare(QUERY_ACTIVITIES_SQL);


module.exports = {
  insert: async function(json) {
    return dbInsert.run(json);
  },

  all: async function() {
    return dbQuery.all();
  },

  create: async function() {
    return dbCreate.run();
  }
}
