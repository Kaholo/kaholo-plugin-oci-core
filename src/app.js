const { getComputeClient, getVirtualNetworkClient, setPromiseResult, getCoreWaiter, getIdentityClient, sleep } = require('./helpers');
const {Instance} = require("oci-core").models;
const parsers = require('./parsers');

async function launceInstance(action, settings) {
  const computeClient = getComputeClient(settings);
  const compartmentId = parsers.autocomplete(action.params.compartment || settings.tenancyId);
  const availabilityDomain = parsers.autocomplete(action.params.availabilityDomain);
  let shapeConfig = undefined, preemptibleInstanceConfig = undefined;
  if (action.params.shapeOcpu && action.params.shapeMemSize){
    shapeConfig = {
      memoryInGBs: parsers.number(action.params.shapeMemSize),
      ocpus: parsers.number(action.params.shapeOcpu)
    }
  }
  if (action.params.preemptible){
    preemptibleInstanceConfig = {
      preemptionAction: {
        type: "TERMINATE",
        preserveBootVolume: parsers.boolean(action.params.preserveBootVolume)
      }
    }
  }
  const name = parsers.string(action.params.name);
  if (action.params.userData){ // Translate user data to base 64
    action.params.userData = Buffer.from(action.params.userData).toString("base64");
  }
  result = await computeClient.launchInstance({
    launchInstanceDetails: {
      compartmentId,
      availabilityDomain,
      shape: parsers.autocomplete(action.params.shape),
      displayName: name,
      capacityReservationId: parsers.autocomplete(action.params.capacityReservation),
      dedicatedVmHostId: parsers.autocomplete(action.params.dedicatedVmHost),
      faultDomain: parsers.autocomplete(action.params.faultDomain),
      sourceDetails: {
        imageId: parsers.autocomplete(action.params.image),
        sourceType: "image",
        bootVolumeSizeInGBs: parsers.number(action.params.bootSize)
      },
      createVnicDetails: {
        assignPublicIp: parsers.boolean(action.params.assignPublicIp),
        subnetId: parsers.autocomplete(action.params.subnet)
      },
      metadata: {
        ssh_authorized_keys: parsers.string(action.params.sshKeys),
        user_data: parsers.string(action.params.userData),
      },
      shapeConfig,
      preemptibleInstanceConfig,
      isPvEncryptionInTransitEnabled: parsers.boolean(action.params.inTransitEncryption),
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
  const computeClient = getComputeClient(settings);
  let result = await computeClient.instanceAction({
    instanceId: parsers.autocomplete(action.params.instance),
    action: action.params.action
  });
  if (action.params.waitFor){
    const waiters = getCoreWaiter(settings);
    result = await waiters.forInstance(
      {instanceId: result.instance.id},
      ["START", "RESET"].includes(action.params.action) ? Instance.LifecycleState.Running : Instance.LifecycleState.Stopped);
  }
  return result;
}

// currenly can only update instance shape, but it's easy to add other params
async function updateInstance(action, settings) {
  const computeClient = getComputeClient(settings);
  return computeClient.updateInstance({
    instanceId: parsers.autocomplete(action.params.instance),
    updateInstanceDetails: {
      shape: parsers.autocomplete(action.params.shape),
      displayName: parsers.string(action.params.name)
    }
  })
}

async function createVCN(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  const useDns = action.params.useDnsHostnames;
  const vcnName = parsers.string(action.params.name);
  const fixedName = vcnName.replace(/ /g, ""); // remove all spaces
  const result = {
    createVcn: await networkClient.createVcn({
      createVcnDetails: {
        cidrBlock: parsers.string(action.params.cidrBlock) || "10.0.0.0/16",
        compartmentId: parsers.autocomplete(action.params.compartment) || settings.tenancyId,
        displayName: vcnName,
        dnsLabel: useDns ? fixedName.substring(0, 10) : undefined
      }
    })
  };
  action.params.dhcpOptions = result.createVcn.vcn.defaultDhcpOptionsId;
  action.params.routeTable = result.createVcn.vcn.defaultRouteTableId;
  action.params.securityList = result.createVcn.vcn.defaultSecurityListId;
  const vcnId = result.createVcn.vcn.id;
  action.params.vcn = vcnId;
  const shortId = vcnId.substring(vcnId.length - 4);
  const publicCidr = action.params.publicSubCidrBlock;
  const privateCidr = action.params.privateSubCidrBlock;
  if (action.params.createRelated){
    // create internet gateway
    action.params.name = `Internet Gateway VCN${shortId}`;
    await setPromiseResult(result, "createInternetGateway", createInternetGateway(action, settings));
    // add route rule to route tavle
    action.params.destinations = ["0.0.0.0/0"];
    action.params.networkEntityIds = [result.createInternetGateway.internetGateway.id];
    action.params.description = "Default Route To Interenet";
    await setPromiseResult(result, "addRouteRules", addRouteRules(action, settings));
  }
  if (publicCidr){
    // create subnet
    action.params.cidrBlock = publicCidr;
    action.params.name = `Public Subnet ${shortId}`;
    action.params.isPrivate = false;
    await setPromiseResult(result, "createPublicSubnet", createSubnet(action, settings));
  }
  if (privateCidr){
    // create subnet
    action.params.cidrBlock = privateCidr;
    action.params.name = `Private Subnet ${shortId}`;
    action.params.isPrivate = true;
    action.params.createRelated = true;
    await setPromiseResult(result, "createPrivateSubnet", createSubnet(action, settings));
  }

  return result;
}

async function createSubnet(action, settings) {
  const compartmentId = parsers.autocomplete(action.params.compartment || settings.tenancyId);
  const networkClient = getVirtualNetworkClient(settings);
  const subnetName = parsers.string(action.params.name);
  const dnsLabel = action.params.useDnsHostnames ? subnetName.toLowerCase().replace(/ /g, "") : undefined;
  const result = {};
  if (action.params.createRelated && action.params.isPrivate){
    // create nat gateway
    action.params.name = `${subnetName} NAT Gateway`;
    await setPromiseResult(result, "createNatGateway", createNatGateway(action, settings));
    // create route table for subnet
    action.params.networkEntityIds = [result.createNatGateway.natGateway.id];
    action.params.destinations = ["0.0.0.0/0"];
    action.params.name = `${subnetName} Private Route Table`;
    action.params.description = `Default Nat Gateway Route`;
    await setPromiseResult(result, "createPrivateRouteTable", createRouteTable(action, settings));
    action.params.routeTableId = result.createPrivateRouteTable.routeTable.id;
    // create service gateway
    action.params.name = `${subnetName} Service Gateway`;
    action.params.service = (await networkClient.listServices({})).items[0]; // set default service
    await setPromiseResult(result, "createServiceGateway", createServiceGateway(action, settings));
    // add route rule for service gateway
    action.params.routeTable = action.params.routeTableId;
    action.params.networkEntityIds = [result.createServiceGateway.serviceGateway.id];
    action.params.destinations = [action.params.service.cidrBlock];
    action.params.destinationType = "SERVICE_CIDR_BLOCK";
    action.params.description = `Default Service Gateway Route`;
    await setPromiseResult(result, "addServiceRouteRule", addRouteRules(action, settings));
  }
  return networkClient.createSubnet({
    createSubnetDetails: {
      cidrBlock: parsers.string(action.params.cidrBlock),
      compartmentId,
      displayName: subnetName,
      vcnId: parsers.autocomplete(action.params.vcn),
      availabilityDomain: parsers.autocomplete(action.params.availabilityDomain),
      routeTableId: parsers.autocomplete(action.params.routeTable),
      securityListIds: [parsers.autocomplete(action.params.securityList)],
      dhcpOptionsId: parsers.autocomplete(action.params.dhcpOptions),
      prohibitPublicIpOnVnic: parsers.boolean(action.params.isPrivate),
      dnsLabel: dnsLabel
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

async function createNatGateway(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createNatGateway({
    createNatGatewayDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      vcnId: parsers.autocomplete(action.params.vcn),
      displayName: parsers.string(action.params.name)
    }
  });
}

async function createServiceGateway(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  return networkClient.createServiceGateway({
    createServiceGatewayDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      vcnId: parsers.autocomplete(action.params.vcn),
      displayName: parsers.string(action.params.name),
      services: [{
        serviceId: parsers.autocomplete(action.params.service)
      }]
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
  return networkClient.createRouteTable({
    createRouteTableDetails: {
      compartmentId: parsers.autocomplete(action.params.compartment || settings.tenancyId),
      vcnId: parsers.autocomplete(action.params.vcn),
      displayName: parsers.string(action.params.name),
      routeRules: destinations.length == 0 ? undefined : destinations.map((destination, index) => ({
        destination,
        destinationType: action.params.destinationType || "CIDR_BLOCK",
        networkEntityId: networkEntityIds[index],
        description: parsers.string(action.params.description),
      }))
    }
  });
}

async function addRouteRules(action, settings) {
  const networkClient = getVirtualNetworkClient(settings);
  const destinations = parsers.array(action.params.destinations);
  const networkEntityIds = parsers.array(action.params.networkEntityIds);
  if (destinations.length !== networkEntityIds.length){
    throw "Destinations and Network Entity IDs must be the same length";
  }
  if (destinations.length === 0){
    throw "Must specify at least one destination and network entity ID";
  }
  const rtId = parsers.autocomplete(action.params.routeTable);
  return networkClient.updateRouteTable({
    rtId,
    updateRouteTableDetails: {
      routeRules: (await networkClient.getRouteTable({rtId})).routeTable.routeRules.map(rule => {
        const {destination, description, destinationType, networkEntityId} = rule;
        return {destination, description, destinationType, networkEntityId};
      }).concat(destinations.map((destination, index) => ({
        destination,
        destinationType: action.params.destinationType || "CIDR_BLOCK",
        networkEntityId: networkEntityIds[index],
        description: parsers.string(action.params.description)
      })))
    }
  });
}


async function createCompartment(action, settings) {
  const identityClient = getIdentityClient(settings);
  const result = await identityClient.createCompartment({createCompartmentDetails: {
    compartmentId: parsers.autocomplete(action.params.parentCompartment) || settings.tenancyId,
    name: parsers.string(action.params.name),
    description: parsers.string(action.params.description)
  }});
  if (action.params.waitFor){
    let timesTried = 0;
    const waiters = identityClient.createWaiters();
    while (timesTried++ < 10){
      try{
        const waitResult = await waiters.forCompartment({compartmentId: result.compartment.id}, "ACTIVE");
        return waitResult;
      }
      catch(err){}
      await sleep(500);
    }
    throw "Couldn't Create Compartment";
  }
  return result
}

async function deleteCompartment(action, settings) {
  const identityClient = getIdentityClient(settings);
  return identityClient.deleteCompartment({
    compartmentId: parsers.autocomplete(action.params.compartment)
  })
}

module.exports = {
  launceInstance,
  updateInstance,
  instanceAction,
  createVCN,
  deleteVCN,
  createSubnet,
  deleteSubnet,
  createSecurityList,
  createInternetGateway,
  createNatGateway,
  createServiceGateway,
  createRouteTable,
  addRouteRules,
  createCompartment,
  deleteCompartment,
  //autocomplete
  ...require('./autocomplete')
}

