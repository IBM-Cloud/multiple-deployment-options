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

/**
 * Script to deploy/undeploy the OpenWhisk action.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const openwhisk = require('openwhisk');
const async = require('async');

const argv = require('yargs')
  .command('install', 'Install OpenWhisk actions')
  .command('uninstall', 'Uninstall OpenWhisk actions')
  .command('update', 'Update action code')
  .option('apihost', {
    alias: 'a',
    describe: 'OpenWhisk API host',
    type: 'string'
  })
  .option('auth', {
    alias: 'u',
    describe: 'OpenWhisk authorization key',
    type: 'string'
  })
  .count('verbose')
  .alias('v', 'verbose')
  .help()
  .alias('h', 'help')
  .alias('', 'help')
  .argv;

const VERBOSE_LEVEL = argv.verbose;
function WARN(...args) { VERBOSE_LEVEL >= 0 && console.log.apply(console, args); } // eslint-disable-line
function INFO(...args) { VERBOSE_LEVEL >= 1 && console.log.apply(console, args); } // eslint-disable-line
function DEBUG(...args) { VERBOSE_LEVEL >= 2 && console.log.apply(console, args); } // eslint-disable-line

if (!argv.install &&
  !argv.uninstall &&
  !argv.update) {
  WARN('No command specified.');
  process.exit(1);
}

// load OpenWhisk CLI configuration if it exists
const wskCliPropsPath = path.join(os.homedir(), '.wskprops');
if (fs.existsSync(wskCliPropsPath)) {
  require('dotenv').config({ path: wskCliPropsPath });
  WARN('Initialized OpenWhisk host and key from', wskCliPropsPath);
}

if (argv.apihost) {
  WARN('OpenWhisk host is set on command line.');
}

if (argv.auth) {
  WARN('OpenWhisk authorization key is set on command line.');
}

// load wskprops if any
const openwhiskOptions = {
  apihost: argv.apihost || process.env.APIHOST,
  api_key: argv.auth || process.env.AUTH
};

const openwhiskClient = openwhisk(openwhiskOptions);

if (argv.install) {
  install(openwhiskClient);
} else if (argv.uninstall) {
  uninstall(openwhiskClient);
} else if (argv.update) {
  update(openwhiskClient);
}

function install(ow) {
  WARN('Installing artifacts...');
  waterfall([
    makeActionTask(ow, true),
  ]);
}

function uninstall(ow) {
  WARN('Uninstalling artifacts...');
  waterfall([
    callback => call(ow, 'action', 'delete', 'fibonacci', callback),
  ]);
}

function update(ow) {
  WARN('Updating action code...');
  waterfall([
    makeActionTask(ow, false),
  ]);
}

function makeActionTask(ow, isCreate) {
  return (callback) => {
    const files = {
      'package.json': 'action/package.json',
      'handler.js': 'action/handler.js',
      'lib/fibonacci.js': 'lib/fibonacci.js',
      'lib/bn.js': 'node_modules/bn.js/lib/bn.js',
    };
    const actionCode = buildZip(files);

    call(ow, 'action', isCreate ? 'create' : 'update', {
      actionName: 'fibonacci',
      action: {
        exec: {
          kind: 'nodejs:6',
          code: actionCode,
          binary: true
        },
        limits: {
          timeout: 300000
        },
        annotations: [{
          key: 'web-export',
          value: true
        },
        {
          key: 'final',
          value: true
        }]
      }
    }, callback);
  };
}

// call the OpenWhisk client API dynamically
function call(ow, resource, verb, callOptions, callback) {
  let params = callOptions;
  if (typeof callOptions === 'string') {
    params = {};
    params[`${resource}Name`] = callOptions;
  }

  DEBUG(`[${resource} ${verb} ${params[`${resource}Name`]}]`);

  ow[`${resource}s`][verb](params).then(() => {
    WARN(`${resource} ${verb} ${params[`${resource}Name`]} [OK]`);
    callback(null);
  }).catch((err) => {
    WARN(`${resource} ${verb} ${params[`${resource}Name`]} [KO]`, err.message);
    DEBUG(`${resource} ${verb} ${params[`${resource}Name`]} [KO]`, err);
    callback(null);
  });
}

function waterfall(tasks) {
  async.waterfall(tasks, (err) => {
    if (err) {
      DEBUG('Failed', err);
    } else {
      WARN('Done');
    }
  });
}

function buildZip(files) {
  const actionZip = require('node-zip')();
  Object.keys(files).forEach((filename) => {
    actionZip.file(filename, fs.readFileSync(files[filename]));
  });
  return actionZip.generate({ base64: true, compression: 'DEFLATE' });
}
