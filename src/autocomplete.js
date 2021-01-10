const core = require("oci-core")
const common = require("oci-common");
const identity = require("oci-identity");
const {createOci,createPem, createProvider} = require('./helpers');
async function listAvailabilityDomains(query, pluginSettings, pluginActionParams) {
    /**
     * This method will return all availability domains
     */
    await createConfigForLogin(pluginSettings);
    const provider = await createProvider();
    const tenancyId = pluginSettings.filter((settings) => {
      if (settings.name == "TENANCY_ID"){
        return settings;
      }    
    })[0].value;
    const identityClient = new identity.IdentityClient({
        authenticationDetailsProvider: provider
    });

    const request = {
        compartmentId: tenancyId
    };
    const response = await identityClient.listAvailabilityDomains(request);
    if (!response.items.length < 0) {
        throw response
    }
    let options = response.items.map((item) => ({ id: item.id, value: item.name}));
    if (!query) {
        return options;
    }
    const filteredList = options.filter(val => val.value.includes(query))
    return filteredList;
}

async function listShapes(query, pluginSettings, pluginActionParams) {
    /**
     * This method will return all shapes domains
     * Must have compartmentId,availabilityDomain before
     */
    await createConfigForLogin(pluginSettings);
    const provider = await createProvider();
    const compartmentId = pluginActionParams.filter((params) => {
      if (params.name == "COMPARTMENT_ID"){
        return params;
      }    
    })[0].value;
    const actionAvailabilityDomain = pluginActionParams.filter((params) => {
      if (params.name == "AVAILABILITY_DOMAIN"){
        return params;
      }    
    })[0].value.value;
    
    const computeClient = new core.ComputeClient({
      authenticationDetailsProvider: provider
    });
    
    const request = {
      availabilityDomain: actionAvailabilityDomain,
      compartmentId: compartmentId
    };
  
    const response = await computeClient.listShapes(request);
    if (!response.items.length <= 0) {
        throw response
    }
    let options = response.items.map((item) => ({ id: item.shape, value: item.shape}));
    if (!query) {
        return options;
    }
    const filteredList = options.filter(val => val.value.includes(query))
    return filteredList;
}

async function listImages(query, pluginSettings, pluginActionParams,) {
    /**
     * This method will return all shapes domains
     * Must have compartmentId,availabilityDomain before
     */
    await createConfigForLogin(pluginSettings);
    const provider = await createProvider();
    const computeClient = new core.ComputeClient({
      authenticationDetailsProvider: provider
    });
    
    const compartmentId = pluginActionParams.filter((params) => {
      if (params.name == "COMPARTMENT_ID"){
        return params;
      }    
    })[0].value;
    const shape = pluginActionParams.filter((params) => {
      if (params.name == "SHAPES"){
        return params;
      }    
    })[0].value.value;
    const operatingSystem = pluginActionParams.filter((params) => {
      if (params.name == "OS"){
        return params;
      }    
    })[0].value;
    const request = {
      compartmentId: compartmentId,
      shape: shape,
      operatingSystem: operatingSystem
    };
  
    const response = await computeClient.listImages(request);
    if (!response.items.length <= 0) {
      throw response
    }
    let options = response.items.map((item) => ({ id: item.id, value: item.displayName}));
    if (!query) {
      return options;
    }
    const filteredList = options.filter(val => val.value.includes(query))
    return filteredList;
}

async function listCompartments(query, pluginSettings) {
    /**
     * This method will return all Compartments
     */
    await createConfigForLogin(pluginSettings);
    const rootCompartment = pluginSettings.filter((settings) => {
      if (settings.name == "ROOT_COMPARTMENT"){
        return settings;
      }    
    })[0].value;
    
    const provider = await createProvider();
    const identityClient = await new identity.IdentityClient({
      authenticationDetailsProvider: provider
    });
    const request = {
      compartmentId: rootCompartment
    };
    const response = await identityClient.listCompartments(request);
    let options = response.items.map((item) => ({ id: item.id, value: item.name}));
    if (!query) {
        return options;
    }
    const filteredList = options.filter(val => val.value.includes(query))
    return filteredList;
}

async function listVCN(query, pluginSettings) {
    /**
     * This method will return all VCN
     */
    const rootCompartment = pluginSettings.filter((settings) => {
      if (settings.name == "ROOT_COMPARTMENT"){
        return settings;
      }    
    })[0].value;
    await createConfigForLogin(pluginSettings);
    const provider = await createProvider();
    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
    const request = {
      compartmentId: rootCompartment
    };

    const response = await virtualNetworkClient.listVcns(request);
    let options = response.items.map((item) => ({ id: item.id, value: item.displayName}));
    if (!query) {
        return options;
    }
    const filteredList = options.filter(val => val.value.includes(query))
    return filteredList;
}

async function listSubnet(query, pluginSettings) {
  const rootCompartment = pluginSettings.filter((settings) => {
    if (settings.name == "ROOT_COMPARTMENT"){
      return settings;
    }    
    })[0].value;
    await createConfigForLogin(pluginSettings);
    const provider = await createProvider();
    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
    const request = {
      compartmentId: rootCompartment
    };

    const response = await virtualNetworkClient.listSubnets(request)
    let options = response.items.map((item) => ({ id: item.id, value: item.displayName}));
    if (!query) {
        return options;
    }
    const filteredList = options.filter(val => val.value.includes(query))
    return filteredList;

}

async function listRegions(query, pluginSettings) {
  await createConfigForLogin(pluginSettings);
  const tenancyId = pluginSettings.filter((settings) => {
    if (settings.name == "TENANCY_ID"){
      return settings;
    }    
  })[0].value;
  const provider = await createProvider();
  const identityClient = new identity.IdentityClient({
    authenticationDetailsProvider: provider
  });
  const request = {
    compartmentId: tenancyId
  };
  const response = await identityClient.listRegions(request);
  let options = response.items.map((item) => ({ id: item.key, value: item.name }));
  if (!query) {
    return options;
  }
  const filteredList = options.filter(val => val.value.includes(query))
  return filteredList;
}

/////////// HELPERS ////////////
async function createConfigForLogin(pluginSettings) {
  const path = __dirname;
  const privateKey = pluginSettings.filter((settings) => {
        if (settings.name == "PRIVATE_KEY"){
          return settings;
        }    
      })[0].value;
    const userId = pluginSettings.filter((settings) => {
        if (settings.name == "USER_ID"){
          return settings;
        }    
      })[0].value;
    const tenancyId = pluginSettings.filter((settings) => {
        if (settings.name == "TENANCY_ID"){
          return settings;
        }    
      })[0].value;
    const fingerPrint = pluginSettings.filter((settings) => {
        if (settings.name == "FINGERPRINT"){
          return settings;
        }    
      })[0].value;
    const region = pluginSettings.filter((settings) => {
        if (settings.name == "REGION"){
          return settings;
        }    
      })[0].value;
      await createPem(privateKey,path)
      await createOci(userId, tenancyId, fingerPrint, region,path);
}

module.exports = {
    listAvailabilityDomains,
    listShapes,
    listImages,
    listCompartments,
    listVCN,
    listSubnet,
    listRegions
}
