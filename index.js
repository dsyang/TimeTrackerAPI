const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const validator = require('validator');
const db = require('./db.js');

const app = express();
app.use(cors())
app.use(bodyParser.json())

db.create().then(() => console.log("Created DB"));

function runAsync (callback) {
  return function (req, res, next) {
    callback(req, res, next)
      .catch(next)
  }
}

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
      timestamp_seconds: <time client reported>,
      activity: <name of activity>,
      device_agent: <device that reported>,
      notes: <optional notes>
    }
  `
  res.send(`<pre>${validator.escape(documentation)}</pre>`);
}));

app.get('/getall', runAsync(async (req, res, next) => {
  let activities = await db.all();

  res.send(JSON.stringify(activities));
}));

app.get('/see', runAsync(async (req, res, next) => {
  let activities = await db.all();
  console.log(activities)
  res.send(`
<table>
  <tr>
  <th>Reported On</th>
  <th>Activity</th>
  <th>Notes</th>
  </tr>
  ${activities.map(genRow).join('')}
</table>  
  `)
}))

function genRow(activity) {
  let date = new Date(parseInt(activity.timestamp_seconds) * 1000).toLocaleString()
  return `
  <tr>
    <td>${date}</td>
    <td>${activity.activity}</td>
    <td>${activity.notes}</td>
  </tr>
  `
}

app.post('/report', runAsync(async (req, res, next) => {
  console.log(req.body)
  let insert = {
    timestamp_seconds: parseInt(new Date().getTime() / 1000),
    notes: ""
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


  let result = await db.insert(insert);
  res.send(JSON.stringify(insert));

}))

app.post('/create', runAsync( async (req, res, next) => {
  await db.create();
  res.send("db.create called");
}));


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