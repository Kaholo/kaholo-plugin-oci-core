
// JavaScript
const core = require("oci-core")
const common = require("oci-common");
const identity = require("oci-identity");
const wr = require("oci-workrequests");
const { listCompartments, listAvailabilityDomains, listShapes, listImages, listVCN, listSubnet,listRegions } = require('./autocomplete');
const { createOci, createPem, createProvider } = require('./helpers');
async function launceInstance(action, settings) {
  return new Promise(async (resolve, reject) => {
    const privateKey = settings.PRIVATE_KEY;
    const userId = settings.USER_ID;
    const tenancyId = settings.TENANCY_ID;
    const fingerPrint = settings.FINGERPRINT;
    const region = settings.REGION;
    const compartmentId = action.params.COMPARTMENT_ID.id ? action.params.COMPARTMENT_ID.id : action.params.COMPARTMENT_ID;
    const displayName = action.params.DISPLAY_NAME;
    const availabilityDomains = action.params.AVAILABILITY_DOMAIN.value ? action.params.AVAILABILITY_DOMAIN.value : action.params.AVAILABILITY_DOMAIN;
    const actionShape = action.params.SHAPES.value ? action.params.SHAPES.value : action.params.SHAPES;
    const actionImage = action.params.IMAGES.id ? action.params.IMAGES.id : action.params.IMAGES;
    const subnet = action.params.SUBNET.id ? action.params.SUBNET.id : action.params.SUBNET;
    await createOci(userId, tenancyId, fingerPrint, region);
    await createPem(privateKey);
    const provider = await createProvider();
    const computeClient = new core.ComputeClient({
      authenticationDetailsProvider: provider
    });
    const sourceDetails = {
      imageId: actionImage,
      sourceType: "image"
    };
    const launchInstanceDetails = {
      compartmentId: compartmentId,
      availabilityDomain: availabilityDomains,
      shape: actionShape,
      displayName: displayName,
      sourceDetails: sourceDetails,
      createVnicDetails: {
        subnetId: subnet
      }
    };
    const launchInstanceRequest = {
      launchInstanceDetails: launchInstanceDetails
    };
    let launchInstanceResponse;
    try {
      launchInstanceResponse = await computeClient.launchInstance(launchInstanceRequest);
    } catch (error) {
      return reject(`exec error: ${error}`);
    }
    return resolve(launchInstanceResponse);
  });
}

async function createVCN(action, settings) {
  return new Promise(async (resolve, reject) => {
    const privateKey = settings.PRIVATE_KEY;
    const userId = settings.USER_ID;
    const tenancyId = settings.TENANCY_ID;
    const fingerPrint = settings.FINGERPRINT;
    const region = settings.REGION;
    await createOci(userId, tenancyId, fingerPrint, region);
    await createPem(privateKey)
    const provider = await createProvider();
    const cidrBlock = action.params.CIDR_BLOCK;
    const compartmentId = action.params.COMPARTMENT_ID.id ? action.params.COMPARTMENT_ID.id : action.params.COMPARTMENT_ID;

    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });

    const vcnName = action.params.VCN_NAME;
    const createVcnDetails = {
      cidrBlock: cidrBlock,
      compartmentId: compartmentId,
      displayName: vcnName
    };
    const createVcnRequest = {
      createVcnDetails: createVcnDetails
    };
    let createVcnResponse;
    try {
      createVcnResponse = await virtualNetworkClient.createVcn(createVcnRequest);
    } catch (error) {
      return reject(`exec error: ${error}`);
    }
    return resolve(createVcnResponse);
  });
}

async function createSubNet(action, settings) {
  return new Promise(async (resolve, reject) => {
    const privateKey = settings.PRIVATE_KEY;
    const userId = settings.USER_ID;
    const tenancyId = settings.TENANCY_ID;
    const fingerPrint = settings.FINGERPRINT;
    const region = settings.REGION;
    await createOci(userId, tenancyId, fingerPrint, region);
    await createPem(privateKey)
    const provider = await createProvider();
    const cidrBlock = action.params.CIDR_BLOCK;
    const displayName = action.params.DISPLAY_NAME;
    const compartmentId = action.params.COMPARTMENT_ID.id ? action.params.COMPARTMENT_ID.id : action.params.COMPARTMENT_ID;
    const VCNId = action.params.VCN_ID.id ? action.params.VCN_ID.id : action.params.VCN_ID;
    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
    const createSubnetRequest = {
      createSubnetDetails: {
        cidrBlock: cidrBlock,
        compartmentId: compartmentId,
        displayName: displayName,
        vcnId: VCNId
      }
    }
    let createSubnetResponse;
    try {
      createSubnetResponse = await virtualNetworkClient.createSubnet(createSubnetRequest);
    } catch (error) {
      return reject(`exec error ${error}`);
    }
    return resolve(createSubnetResponse);

  });
}

async function deleteVCN(action, settings) {
  /** 
   * This method deletes VCN.
   */
  return new Promise(async (resolve, reject) => {
    const vcnID = action.params.VCN.id ? action.params.VCN.id : action.params.VCN;
    const privateKey = settings.PRIVATE_KEY;
    const userId = settings.USER_ID;
    const tenancyId = settings.TENANCY_ID;
    const fingerPrint = settings.FINGERPRINT;
    const region = settings.REGION;
    await createOci(userId, tenancyId, fingerPrint, region);
    await createPem(privateKey);
    const provider = await createProvider();
    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
    const deleteVCNRequest = {
      vcnId: vcnID
    }
    let deleteVCNRespose;
    try {
      deleteVCNRespose = await virtualNetworkClient.deleteVcn(deleteVCNRequest);
    } catch (error) {
      return reject(`exec error: ${error}`);
    }
    return resolve(deleteVCNRespose);
  });

}

async function deleteSubNet(action, settings) {
  return new Promise(async (resolve, reject) => {
    const subnetId = action.params.SUBNET.id ? action.params.SUBNET.id : action.params.SUBNET;
    const privateKey = settings.PRIVATE_KEY;
    const userId = settings.USER_ID;
    const tenancyId = settings.TENANCY_ID;
    const fingerPrint = settings.FINGERPRINT;
    const region = settings.REGION;
    await createOci(userId, tenancyId, fingerPrint, region);
    await createPem(privateKey);
    const provider = await createProvider();
    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
    const deleteSubnetRequest = {
      subnetId: subnetId
    }
    let deleteSubnetRespose;
    try {
      deleteSubnetRespose = await virtualNetworkClient.deleteSubnet(deleteSubnetRequest);
    } catch (error) {
      return reject(`exec error: ${error}`);
    }
    return resolve(deleteSubnetRespose);
  });
}


module.exports = {
  LAUNCH_INSTANCE: launceInstance,
  CREATE_VCN: createVCN,
  DELETE_VCN: deleteVCN,
  CREATE_SUBNET: createSubNet,
  DELETE_SUBNET: deleteSubNet,
  //autocomplete
  listAvailabilityDomains,
  listCompartments,
  listShapes,
  listImages,
  listVCN,
  listSubnet,
  listRegions
}

