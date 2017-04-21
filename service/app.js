/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const winston = require('winston');
const express = require('express');
const cors = require('cors');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => new Date(),
      formatter: options =>
        // Return string will be passed to logger.
        options.timestamp().toISOString() + ' ' + // eslint-disable-line
          options.level.toUpperCase() + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ?
            '\n\t' + JSON.stringify(options.meta) : '') // eslint-disable-line
    })
  ]
});

const app = express();
const fibonacci = require('./lib/fibonacci')();

app.use(cors());
app.disable('etag');

app.get('/fibonacci', (req, res) => {
  if (req.query.iteration) {
    logger.info(`GET iteration=${req.query.iteration}`);
    fibonacci.compute(req.query.iteration, (result) => {
      logger.info(`Completed iteration=${req.query.iteration} ${result.ms}ms`);
      res.send(result);
    });
  } else if (req.query.duration) {
    logger.info(`GET duration=${req.query.duration}`);
    fibonacci.computeFor(req.query.duration, (result) => {
      logger.info(`Completed duration=${req.query.duration} ${result.ms}ms`);
      res.send(result);
    });
  } else {
    res.status(500).send('Unknown operation');
  }
});

app.post('/fibonacci', (req, res) => {
  if (req.query.crash === 'true') {
    logger.info('POST crash');
    process.exit(1);
  } else {
    res.status(500).send('Unknown operation');
  }
});

app.get('/', (req, res) => {
  logger.info('GET /');

  const name = process.env.VCAP_SERVICES ? 'One Instance' : 'One replica';
  const icon = process.env.VCAP_SERVICES ? '/images/cloudfoundry.png' : '/images/kubernetes.svg';

  const pingEndpoint = `${req.protocol}://${req.headers.host}/fibonacci?iteration=500`;
  const crashEndpoint = `${req.protocol}://${req.headers.host}/fibonacci?crash=true`;

  const addEnpoint = 'http://deployment-options-tester.mybluemix.net/?action=add' +
    `&name=${encodeURIComponent(name)}` +
    `&icon=${encodeURIComponent(icon)}` +
    `&iterate=${encodeURIComponent(pingEndpoint)}` +
    `&crash=${encodeURIComponent(crashEndpoint)}`;

  res.send(`<html><body><a href="${addEnpoint}">Add this service to the web tester</a></body></html>`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  logger.info(`App is listening on port ${port}.`);
});
