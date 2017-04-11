# Deploy the service manually in Bluemix

## Get the code

* Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/multiple-deployment-options.git
  ```

* or Download and extract the source code from [this archive](https://github.com/IBM-Bluemix/multiple-deployment-options/archive/master.zip)

## Deploy the service as a Cloud Foundry application

1. Change to the **service** directory.

  ```
  cd multiple-deployment-options/service
  ```

1. Push the application

  ```
  cf push
  ```

1. After a short while, the application is available at a random route.

### Test the Cloud Foundry application

To compute the Fibonacci number after *n* iterations use the *GET /iteration/:n* API such as:

  ```
  curl -v http://fibonacci-service-<random-string>.mybluemix.net/iteration/1000
  ```

To let the computation run for *t* milliseconds use the *GET /duration/:t* API such as:

  ```
  curl -v http://fibonacci-service-<random-string>.mybluemix.net/duration/5000
  ```

To simulate a crash of the service, use the *POST /crash* API such as:

  ```
  curl -v -X POST http://fibonacci-service-<random-string>.mybluemix.net/crash
  ```

This call will exit the underlying node.js app, simulating an error of the API.
