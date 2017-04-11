# One micro-service, multiple deployment options

> :warning: WORK IN PROGRESS

This project contains one simple micro-service that can be deployed as a Cloud Foundry application, as a container in a Kubernetes cluster or as an OpenWhisk action.

## Requirements

* IBM Bluemix account. [Sign up][bluemix_signup_url] for Bluemix, or use an existing account.
* [Bluemix CLI](http://clis.ng.bluemix.net/)

## About the micro-service

The micro-service used in this project computes Fibonacci numbers.

From [Wikipedia](https://en.wikipedia.org/wiki/Fibonacci_number), *In mathematics, the Fibonacci numbers are the numbers in the following integer sequence, called the Fibonacci sequence, and characterized by the fact that every number after the first two is the sum of the two preceding ones:*

  ```
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
  ```

The implementation of the sequence is done in **[service/lib/fibonacci.js](service/lib/fibonacci.js)**. The same implementation is used across all deployment options.

## Deploying the service manually in Bluemix

Follow [these instructions](./DEPLOY_MANUALLY.md).

## Code Structure

### Cloud Foundry application

| File | Description |
| ---- | ----------- |
| [app.js](service/app.js) | Main application, start the express web server and expose the service API|
| [lib/fibonacci.js](service/lib/fibonacci.js) | The implementation of the Fibonacci sequence, shared by all deployment options|
| [package.json](service/package.json) | List the packages required by the application |
| [manifest.yml](service/manifest.yml) | Description of the application to be deployed |
| [.cfignore](service/.cfignore) | List files to ignore when deploying the application to Cloud Foundry |

## Contribute

Please create a pull request with your desired changes.

## Troubleshooting

### Cloud Foundry

  Use
  ```
  cf logs fibonacci-service
  ```
  to look at the live logs for the web application

## License

See [License.txt](License.txt) for license information.

[bluemix_signup_url]: https://console.ng.bluemix.net/?cm_mmc=GitHubReadMe
