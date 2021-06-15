const { listCompartments, listAvailabilityDomains, listShapes, listImages, listVCN, listSubnets, listInstances } = require('./autocomplete');
const { getComupteClient, getVirtualNetworkClient } = require('./helpers');
const parsers = require('./parsers');

async function launceInstance(action, settings) {
  const computeClient = getComupteClient(settings);
  return computeClient.launchInstance({
    compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
    availabilityDomain: parsers.autocomplete(action.params.availabilityDomain),
    shape: parsers.autocomplete(action.params.shape),
    displayName: parsers.string(action.params.name),
    sourceDetails: {
      imageId: parsers.autocomplete(action.params.image),
      sourceType: "image"
    },
    createVnicDetails: {
      subnetId: parsers.autocomplete(action.params.subnet)
    }
  });
}

async function createVCN(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createVcn({
    createVcnDetails: {
      cidrBlock: parsers.string(action.params.cidrBlock),
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      displayName: parsers.string(action.params.name)
    }
  });
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
      displayName: parsers.string(action.params.name)
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
      routeRules: destinations.forEach((destination, index) => ({
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
  //autocomplete
  listAvailabilityDomains,
  listCompartments,
  listShapes,
  listImages,
  listVCN,
  listSubnets, 
  listInstances
}

