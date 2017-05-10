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
  * Called by OpenWhisk.
  *
  * It expects the following parameters as attributes of 'args'
  * - crash: true - it will exit the running process
  * - iteration: "123" - do 'n' iterations and return the computed number
  * - duration: "3500" in milliseconds - run for 't' milliseconds and return the computed number
  */
function main(args) {
  const fibonacci = require('./lib/fibonacci')();

  if (args.crash) {
    // this will effectively quits the container this action is running in
    process.exit(1);
  } else if (args.iteration) {
    return new Promise((resolve) => {
      const result = fibonacci.compute({ iteration: args.iteration }).do();
      resolve({
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: new Buffer(JSON.stringify(result)).toString('base64')
      });
    });
  } else if (args.duration) {
    return new Promise((resolve) => {
      const result = fibonacci.compute({ duration: args.duration }).do();
      resolve({
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: new Buffer(JSON.stringify(result)).toString('base64')
      });
    });
  } else {
    // return a simple text to register this endpoint in the tester
    const name = 'An Action';
    const icon = '/images/openwhisk.png';
    const pingEndpoint = `${process.env.__OW_API_HOST}/api/v1/web/${process.env.__OW_NAMESPACE}/default/fibonacci?iteration=500`;
    const crashEndpoint = `${process.env.__OW_API_HOST}/api/v1/web/${process.env.__OW_NAMESPACE}/default/fibonacci?crash=true`;
    return {
      body: fibonacci.addEnpointHtml(name, icon, pingEndpoint, crashEndpoint)
    };
  }
}

exports.main = main;
