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

2. Push the application

   ```
   bx cf push
   ```

3. After a short while, the application is available on a random route. The route name can either be retrieved from the Cloud Foundry deployment log messages or with using the command `cf routes`.

### Test the Cloud Foundry application

To compute the Fibonacci number after *n* iterations, use the `iteration` parameter of the API:

   ```
   curl -v http://fibonacci-service-<random-string>.mybluemix.net/fibonacci?iteration=1000
   ```

To let the computation run for *t* milliseconds, use the `duration` parameter:

   ```
   curl -v http://fibonacci-service-<random-string>.mybluemix.net/fibonacci?duration=5000
   ```

To simulate a crash of the service, use the API with the `crash` parameter:

   ```
   curl -v -X POST http://fibonacci-service-<random-string>.mybluemix.net/fibonacci?crash=true
   ```

This last call will exit the node.js application, simulating an error of the API.

## Deploy the service as a container in Kubernetes

### Build the Docker image

1. Start the Docker engine on your local computer

   See the [Docker installation instructions](https://docs.docker.com/engine/installation/) if you don't yet have the Docker engine installed locally or need help in starting it.

2. Log the local Docker client in to IBM Bluemix Container Registry:

   ```
   bx cr login
   ```

   This will configure your local Docker client with the right credentials to be able to push images to the Bluemix Container Registry.

3. Retrieve the name of the namespace you are going to use to push your Docker images:

   ```
   bx cr namespace-list
   ```

   > If you don't have a namespace, you can create one with `bx cr namespace-create fibonacci` as example.

4. Change to the **service** directory.

   ```
   cd multiple-deployment-options/service
   ```

5. Build the Docker image of the service

   In the following steps, make sure to replace `<namespace>` with your namespace name.

   ```
   docker build -t registry.ng.bluemix.net/<namespace>/fibonacci:latest .
   ```

6. Push the image to the registry

   ```
   docker push registry.ng.bluemix.net/<namespace>/fibonacci:latest
   ```

### Create a Kubernetes cluster

1. Create a Kubernetes cluster in Bluemix

   ```
   bx cs cluster-create --name fibonacci-cluster
   ```

   > Note that you can also use an existing cluster

2. Wait for your cluster to be deployed. This step can take a while, you can check the status of your cluster(s) by using:

   ```
   bx cs clusters
   ```

   Your cluster should be in the state *normal*.

3. Ensure that the cluster workers are ready too:

   ```
   bx cs workers fibonacci-cluster
   ```

   The workers should appear as *Ready*.

### Deploy the service

1. Retrieve the cluster configuration

   ```
   bx cs cluster-config fibonacci-cluster
   ```

   The output will look like:

   ```
   Downloading cluster config for fibonacci-cluster
   OK
   The configuration for fibonacci-cluster was downloaded successfully. Export environment variables to start using Kubernetes.

   export KUBECONFIG=/Users/john/.bluemix/plugins/container-service/clusters/fibonacci-cluster/kube-xxx-fibonacci-cluster.yml
   ```

2. Copy and paste the `export KUBECONFIG=...` line into your shell.

3. Confirm the configuration worked by retrieving the cluster nodes:

   ```
   kubectl get nodes
   ```

4. Modify the fibonacci-deployment.yml under the *service* directory to point to the image in the Bluemix Container Registry by replacing the *namespace* value.

5. Deploy the Fibonacci service in the cluster

    ```
    kubectl create -f fibonacci-deployment.yml
    ```

### Test the Kubernetes service

Retrieve the public IP address for your Kubernetes workers:

   ```
   bx cs workers fibonacci-cluster
   ```

To compute the Fibonacci number after *n* iterations use the API such as:

   ```
   curl -v http://<cluster-public-ip>:30080/fibonacci?iteration=1000
   ```

To let the computation run for *t* milliseconds use the API such as:

   ```
   curl -v http://<cluster-public-ip>:30080/fibonacci?duration=5000
   ```

To simulate a crash of the service, use the API such as:

   ```
   curl -v -X POST http://<cluster-public-ip>:30080/fibonacci?crash=true
   ```

This call will exit the underlying node.js app running in the container, simulating an error of the API.

## Deploy the service as an OpenWhisk action

1. Ensure your OpenWhisk command line interface is property configured with:

   ```
   wsk list
   ```

   This command will show the packages, actions, triggers and rules currently deployed in your OpenWhisk namespace.

2. Change to the **service** directory.

   ```
   cd multiple-deployment-options/service
   ```

3. Install the required dependencies

   ```
   npm install
   ```

4. Deploy the OpenWhisk action

   ```
   node deploy.js --install
   ```

### Test the OpenWhisk action

Retrieve your OpenWhisk namespace. You can find it by running `wsk namespace list`.

To compute the Fibonacci number after *n* iterations, pass the *iteration* parameter to the action:

   ```
   curl -v https://openwhisk.ng.bluemix.net/api/v1/web/<namespace>/default/fibonacci?iteration=1000
   ```

To let the computation run for *t* milliseconds, pass the *duration* parameter to the action:

   ```
   curl -v https://openwhisk.ng.bluemix.net/api/v1/web/<namespace>/default/fibonacci?duration=5000
   ```

To simulate a crash of the service, pass the *crash* parameter to the action:

   ```
   curl -v -X POST https://openwhisk.ng.bluemix.net/api/v1/web/<namespace>/default/fibonacci?crash=true
   ```

This call will exit the underlying action invoker, simulating an error of the API.
