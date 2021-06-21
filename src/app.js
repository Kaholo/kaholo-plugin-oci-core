const { getComupteClient, getVirtualNetworkClient, setPromiseResult, getCoreWaiter } = require('./helpers');
const {Instance} = require("oci-core").models;
const parsers = require('./parsers');

async function launceInstance(action, settings) {
  const computeClient = getComupteClient(settings);
  let result = await computeClient.launchInstance({
    launchInstanceDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      availabilityDomain: parsers.autocomplete(action.params.availabilityDomain),
      shape: parsers.autocomplete(action.params.shape),
      displayName: parsers.string(action.params.name),
      sourceDetails: {
        imageId: parsers.autocomplete(action.params.image),
        sourceType: "image",
      },
      createVnicDetails: {
        subnetId: parsers.autocomplete(action.params.subnet)
      },
      metadata: {
        ssh_authorized_keys: parsers.string(action.params.sshKeys),
        user_data: parsers.string(action.params.userData)
      }
    }
  });
  if (action.params.waitFor){
    const waiters = getCoreWaiter(settings);
    result = await waiters.forInstance(
      {instanceId: result.instance.id},
      Instance.LifecycleState.Running);
  }
  return result;
}

async function instanceAction(action, settings) {
  const computeClient = getComupteClient(settings);
  return computeClient.instanceAction({
    instanceId: parsers.autocomplete(action.params.instance),
    action: action.params.action
  });
}

async function createVCN(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  const result = {
    createVcn: await networkClient.createVcn({
      createVcnDetails: {
        cidrBlock: parsers.string(action.params.cidrBlock),
        compartmentId: parsers.autocomplete(action.params.compartment) || settings.tenancyId,
        displayName: parsers.string(action.params.name)
      }
    })
  };
  const vcnId = result.createVcn.vcn.id;
  action.params.vcn = vcnId;
  const shortId = vcnId.substring(vcnId.length - 4);
  if (action.params.subCidrBlock){
    action.params.cidrBlock = action.params.subCidrBlock;
    action.params.name = `default_subnet_${shortId}`;
    await setPromiseResult(result, "createSubnet", createSubnet(action, settings));
  }
  if (action.params.createInternetGateway){
    action.params.name = `main_internet_gateway_${shortId}`;
    await setPromiseResult(result, "createInternetGateway", createInternetGateway(action, settings));
    if (action.params.createRouteTable){
      action.params.name = `default_route_table_${shortId}`;
      action.params.destinations = ["0.0.0.0/0"];
      action.params.networkEntityIds = [result.createInternetGateway.internetGateway.id];
      action.params.description = "Default Route To Interenet";
      await setPromiseResult(result, "createRouteTable", createRouteTable(action, settings));
    }
  }
  else if (action.params.createRouteTable){
    throw "Can't create default route table with no internet gateway!";
  }
  return result;
}

async function createSubnet(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createSubnet({
    createSubnetDetails: {
      cidrBlock: parsers.string(action.params.cidrBlock),
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      displayName: parsers.string(action.params.name),
      vcnId: parsers.autocomplete(action.params.vcn)
    }
  });
}

async function deleteVCN(action, settings) {
  /** 
   * This method deletes a VCN.
   */
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.deleteVcn({
    vcnId: parsers.autocomplete(action.params.vcn)
  });
}

async function deleteSubnet(action, settings) {
  const subnetId = parsers.autocomplete(action.params.subnet);
  const networkClient = getVirtualNetworkClient(settings);
  const request = { subnetId }
  return networkClient.deleteSubnet(request);
}

async function createSubnet(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createSubnet({
    createSubnetDetails: {
      cidrBlock: parsers.string(action.params.cidrBlock),
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      displayName: parsers.string(action.params.name),
      vcnId: parsers.autocomplete(action.params.vcn)
    }
  })
}

async function createSecurityList(action, settings) {
  const defaultEgressRules = [{
    protocol: "all",
    destination: "0.0.0.0/0"
  }];
  const defaultIngressRules = [{
    protocol: "all",
    source: "0.0.0.0/0"
  }];
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createSecurityList({
    createSecurityListDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      vcnId: parsers.autocomplete(action.params.vcn),
      displayName: parsers.string(action.params.name),
      egressSecurityRules: parsers.array(action.params.egressSecurityRules) || defaultEgressRules,
      ingressSecurityRules: parsers.array(action.params.ingressSecurityRules) || defaultIngressRules
    }
  });
}

async function createInternetGateway(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createInternetGateway({
    createInternetGatewayDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      vcnId: parsers.autocomplete(action.params.vcn),
      displayName: parsers.string(action.params.name),
      isEnabled: true
    }
  });
}

async function createRouteTable(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  const destinations = parsers.array(action.params.destinations);
  const networkEntityIds = parsers.array(action.params.networkEntityIds);
  if (destinations.length !== networkEntityIds.length){
    throw "Destinations and Network Entity IDs must be the same length";
  }
  if (destinations.length === 0){
    throw "Must specify at least one destination and network entity ID";
  }
  return networkClient.createRouteTable({
    createRouteTableDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      vcnId: parsers.autocomplete(action.params.vcn),
      displayName: parsers.string(action.params.name),
      routeRules: destinations.map((destination, index) => ({
        destination,
        destinationType: action.params.destinationType || "CIDR_BLOCK",
        networkEntityId: networkEntityIds[index],
        description: parsers.string(action.params.description)
      }))
    }
  });
}

// currenly can only update instance shape, but it's easy to add other params
async function updateInstance(action, settings) {
  const computeClient = getComupteClient(settings);
  return computeClient.updateInstance({
    instanceId: parsers.autocomplete(action.params.instance),
    updateInstanceDetails: {
      shape: parsers.autocomplete(action.params.shape)
    }
  })
}

module.exports = {
  launceInstance,
  createVCN,
  deleteVCN,
  createSubnet,
  deleteSubnet,
  createSecurityList,
  createInternetGateway,
  createRouteTable,
  updateInstance,
  instanceAction,
  //autocomplete
  ...require('./autocomplete')
}

