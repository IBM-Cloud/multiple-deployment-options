# Deploy the service with Toolchain in Bluemix

The toolchain is setup to deploy the service to the Cloud Foundry, OpenWhisk and Kubernetes. 
Automatically deployment is setup to Cloud Foundry and OpenWhisk. The Kubernetes requires some additional manual steps.  

**Kubernetes manual steps.**
1. Assuming that latest version of the Bluemix CLI is installed and configured to run Kubectl commands. [Click for instructions on installing and configuring the CLI to run Kubectl commands](https://console.ng.bluemix.net/docs/containers/cs_cli_install.html#cs_cli_install)
1. Verify that you have the *container-registry* and the *container-service* plugins installed by using  `bluemix plugin list`   
    
1. Create a Kubernetes cluster in Bluemix
   ```
   bx cs cluster-create --name fibonacci-cluster
   ```
    > Note: It takes approximately 15 minutes for the cluster to be fully provisioned and ready to accept the sample pods.   
    > You can also use an existing cluster if you have one already.

1. Use `bx cs clusters` to view defined clusters  
1. Use `bx cs workers fibonacci-cluster` to view provisioned workers.
   > Note: The state of your cluster should be in a **Ready** state.

TODO - add steps to build and push the docker image...

-----


1. Ensure your organization has enough quota for one web application using 256MB of memory, one Kubernetes cluster, and one OpenWhisk action.

1. Click ***Create toolchain*** to start the Bluemix DevOps wizard:

   [![Deploy To Bluemix](https://console.ng.bluemix.net/devops/graphics/create_toolchain_button.png)](https://console.ng.bluemix.net/devops/setup/deploy/?repository=https://github.com/IBM-Bluemix/multiple-deployment-options&branch=dev)

1. Select the **GitHub** box.

1. Decide whether you want to clone or fork the repository.

1. If you decide to Clone, set a name for your GitHub repository.

1. Select the **Delivery Pipeline** box.

1. Select the region, organization and space where you want to deploy the web application.

   :warning: Make sure the organization and the space have no space in their names.

   :warning: Only the US South region is currently supported.

1. Set the name of the Cloud Foundry application. You can keep the default. A random route will be created for the application.

1. Optionally set the Bluemix API key. If you don't set the key, the Kubernetes service will NOT be deployed and you will need to use the manual instructions.

   > Create a Bluemix API key using `bx iam api-key-create for-toolchain my-new-key`

1. Optionally set the name of an existing Kubernetes cluster if you have one, if you don NOT have an existing cluster then the ToolChain will create one by default.  

1. Add your docker image namespace. 
   > Obtain the docker image namespace using `bx cr namespace-list`

1. Click **Create**.

1. Select the Delivery Pipeline.

1. Wait for the DEPLOY stage to complete.

1. The services are ready. Review the [Service API](#Service_API) to call the services.
