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
