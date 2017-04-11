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

app.get('/iteration/:number', (req, res) => {
  logger.info(`GET /iteration/${req.params.number}`);
  fibonacci.compute(req.params.number, (result) => {
    logger.info(`Completed /iteration/${req.params.number} ${result.ms}ms`);
    res.send(result);
  });
});

app.get('/duration/:number', (req, res) => {
  logger.info(`GET /duration/${req.params.number}`);
  fibonacci.computeFor(req.params.number, (result) => {
    logger.info(`Completed /duration/${req.params.number} ${result.ms}ms`);
    res.send(result);
  });
});

app.post('/crash', () => {
  logger.info('GET /crash');
  process.exit(1);
});

app.get('/', (req, res) => {
  logger.info('GET /');
  res.send('OK');
});

app.listen(process.env.PORT || 8080, () => {
  logger.info('App is listening on port 8080.');
});
