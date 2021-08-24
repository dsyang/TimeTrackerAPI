const postgres = require('postgres')
console.log(process.env['DB_URL'])
const sql = postgres(process.env['DB_URL'])
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


module.exports = {
  insert: async function(json) {
    console.log(`inserting ${JSON.stringify(json)}`)

    return await sql`
INSERT INTO activities (
  timestamp_seconds, 
  client_timestamp_seconds,
  activity,
  device_agent,
  notes
) VALUES (
  ${json.timestamp_seconds},
  ${json.client_timestamp_seconds},
  ${json.activity},
  ${json.device_agent},
  ${json.notes}
);
`
  },
  all: async function() {
    return await sql`
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
},
  create: async function() {
    console.log("Create in postgres")

    
    return await sql`
CREATE TABLE IF NOT EXISTS activities (
  rowid  SERIAL PRIMARY KEY,
	timestamp_seconds INTEGER NOT NULL,
  client_timestamp_seconds INTEGER NOT NULL,
 	activity TEXT NOT NULL,
  device_agent TEXT NOT NULL,
	notes TEXT
);
`
  }
}