const core = require("oci-core")
const identity = require("oci-identity");
const { getProvider } = require('./helpers');

// auto complete helper methods

function mapAutoParams(autoParams){
  const params = {};
  autoParams.foreach(param => {
    params[param.id] = param.value.id ? param.value.id : param.value;
  });
  return params;
}

function handleResult(result, query, firstKey, secondKey){
  let items = result.items;
  if (items.length === 0) throw result;
  if (!firstKey) {
    firstKey = "id", secondKey = "name";
  }
  else if (!secondKey) {
    secondKey = firstKey;
  }
  items = items.map(item => ({
    id: item[firstKey], 
    value: item[secondKey] ? item[secondKey] : item[firstKey]
  }));

  if (!query) return items;
  return items.filter(item => item.value.toLowerCase().includes(query.toLowerCase()));
}
 
// main auto complete methods

async function listCompartments(query, pluginSettings) {
  const settings = mapAutoParams(pluginSettings);
  const tenancyId = settings.tenancyId;
  const provider = getProvider(settings);
  const identityClient = await new identity.IdentityClient({
    authenticationDetailsProvider: provider
  });
  const request = { compartmentId: tenancyId };
  const result = await identityClient.listCompartments(request);
  return handleResult(result, query);
}

async function listAvailabilityDomains(query, pluginSettings) {
    /**
     * This method will return all availability domains
     */
     const settings = mapSettings(pluginSettings);
     const tenancyId = settings.tenancyId;
     const provider = getProvider(settings);
     const identityClient = await new identity.IdentityClient({
       authenticationDetailsProvider: provider
     });

    const request = { compartmentId: tenancyId };
    const result = await identityClient.listAvailabilityDomains(request);
    return handleResult(result, query);
}

async function listShapes(query, pluginSettings, pluginActionParams) {
  
    /**
     * This method will return all shapes domains
     * Must have compartmentId,availabilityDomain before
     */
     const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
     const compartmentId = params.compartment || settings.tenancyId;
     const availabilityDomain = params.availabilityDomain;
     const provider = getProvider(settings);

    const computeClient = new core.ComputeClient({
      authenticationDetailsProvider: provider
    });
    
    const request = {availabilityDomain, compartmentId};
    const result = await computeClient.listShapes(request);
    return handleResult(result, query, "shape");
}

async function listImages(query, pluginSettings, pluginActionParams) {
    /**
     * This method will return all shapes domains
     * Must have compartmentId,availabilityDomain before
     */
    const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
    const compartmentId = params.compartment || settings.tenancyId;
    const shape = params.shapes;
    const provider = getProvider(settings);
    const computeClient = new core.ComputeClient({
      authenticationDetailsProvider: provider
    });

    const request = {compartmentId, shape};
    const result = await computeClient.listImages(request);
    return handleResult(result, query, "id", "displayName");
}

async function listVCN(query, pluginSettings, pluginActionParams) {
    /**
     * This method will return all VCN
     */
    const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
    const compartmentId = params.compartment || settings.tenancyId;
    const provider = getProvider(settings);
    const virtualNetworkClient = new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
 
    const request = {compartmentId};
    const result = await virtualNetworkClient.listVcns(request);
    return handleResult(result, query, "id", "displayName");
}

async function listSubnets(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const provider = getProvider(settings);
  const virtualNetworkClient = new core.VirtualNetworkClient({
    authenticationDetailsProvider: provider
  });

  const request = {compartmentId};
  const result = await virtualNetworkClient.listSubnets(request);
  return handleResult(result, query, "id", "displayName");
}

async function listInstances(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const provider = getProvider(settings);
  const computeClient = new core.ComputeClient({
    authenticationDetailsProvider: provider
  });

  const request = {compartmentId};
  const result = await computeClient.listInstances(request);
  return handleResult(result, query, "id", "displayName");
}

module.exports = {
  listAvailabilityDomains,
  listShapes,
  listImages,
  listCompartments,
  listVCN,
  listSubnets,
  listInstances
}
