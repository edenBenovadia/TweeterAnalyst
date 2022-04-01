import express from 'express';
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// for BE/FE comunication on localhost (not secured connection)
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Pass to next layer of middleware
  next();
});

app.get('/', async (req, res) => {
  let dataToSend = '';
  const { ticker, from_date, until_date } = req.query;
  const argsv = [ticker, from_date, until_date];
  const python: any = spawn('python3', ['./backend_interface.py', ...argsv]);

  python.stdout.on('data', (data: any) => {
    dataToSend += data.toString('utf8');
  });

  python.stderr.on("data", (data) => {
    console.error(data)
  });

  python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    responseMemory = dataToSend;
    res.send(JSON.parse(dataToSend));
  });
});

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});
