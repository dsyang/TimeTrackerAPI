const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const validator = require('validator');



const app = express();
app.use(cors())
app.use(bodyParser.json())

function runAsync (callback) {
  return function (req, res, next) {
    callback(req, res, next)
      .catch(next)
  }
}

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


/* GET home page. */
app.get('/', runAsync(async (req, res, next) => {
  const documentation = `
  API:

  GET /getall returns all activities ordered by timestamp_seconds. 
  JSON per activity:
    {
      id: <id>,
      timestamp_seconds: <time server inserted activity>,
      client_timestamp_seconds: <time client reported>,
      activity: <name of activity>,
      device_agent: <device that reported>,
      notes: <optional notes>
    }
  
  POST /report reports an activity. 
  JSON of request should be all strings:
    {
      timestamp_seconds: <time server inserted activity>,
      activity: <name of activity>,
      device_agent: <device that reported>,
      notes: <optional notes>
    }
  `
  res.send(`<pre>${validator.escape(documentation)}</pre>`);
}));

app.get('/getall', runAsync(async (req, res, next) => {
  let activities = dbQuery.all();

  res.send(JSON.stringify(activities));
}));

app.post('/report', runAsync(async (req, res, next) => {
  let insert = {
    timestamp_seconds: parseInt(new Date().getTime() / 1000)
  }
  if (!req.body.activity) {
    throw new Error(`No activity in request body.`);
  }
  if (!req.body.timestamp_seconds) {
    throw new Error(`No timestamp in request body.`);
  }
  if (!req.body.device_agent) {
    throw new Error(`No agent in request body.`);
  }


  if (req.body.notes) {
    insert.notes = 
      validator.escape(
      validator.trim(
        req.body.notes
      ));
  }

  insert.activity = 
  validator.escape(
  validator.trim(
    req.body.activity
  ));

  let client_timestamp_seconds = 
  validator.escape(
  validator.trim(
    req.body.timestamp_seconds
  ));

  if (validator.isNumeric(client_timestamp_seconds)) {
    insert.client_timestamp_seconds = client_timestamp_seconds;
  } else {
    throw new Error(`client_timestamp_seconds is not a numeric string.`);
  }

  insert.device_agent = 
  validator.escape(
  validator.trim(
    req.body.device_agent
  ));


  let result = dbInsert.run(insert);
  console.log(result)
  res.send(JSON.stringify(insert));

}))


app.use(function (err, req, res, next) {
  if (!err) {
    return;
  }

  console.error(err.stack)
  res.status(500).send(`
  <h1>${err.message}</h1>
  <pre>
  ${err.stack}
  </pre>
  `);
})

app.listen(3000, () => {
  console.log('server started');
});