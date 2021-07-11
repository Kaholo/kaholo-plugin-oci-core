const core = require("oci-core")
const identity = require("oci-identity");
const { getProvider, getIdentityClient, getVirtualNetworkClient, getComputeClient } = require('./helpers');
const parsers = require("./parsers")

// auto complete helper methods

function mapAutoParams(autoParams){
  const params = {};
  autoParams.forEach(param => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}


/***
 * @returns {[{id, value}]} filtered result items
 ***/
function handleResult(result, query, specialKey){
  let items = result.items;
  if (items.length === 0) return [];
  items = items.map(item => ({
    id: specialKey ? item[specialKey] : item.id,
    value:  specialKey ? item[specialKey] : 
            item.displayName ? item.displayName : 
            item.name ? item.name : item.id
  }));

  if (!query) return items;
  query = query.split(" ");
  return items.filter(item => query.every(qWord => 
    item.value.toLowerCase().includes(qWord.toLowerCase())
  ));
}

// main auto complete methods

async function listCompartments(query, pluginSettings) {
  const settings = mapAutoParams(pluginSettings);
  const tenancyId = settings.tenancyId;
  const identityClient = getIdentityClient(settings);
  const result = await identityClient.listCompartments({
    compartmentId: tenancyId,
    compartmentIdInSubtree: true,
    accessLevel: "ACCESSIBLE"
  });
  const compartments = handleResult(result, query);
  compartments.push({id: tenancyId, value: "Tenancy"});
  return compartments;
}

async function listAvailabilityDomains(query, pluginSettings) {
  /**
   * This method will return all availability domains
   */
  const settings = mapAutoParams(pluginSettings);
  const identityClient = getIdentityClient(settings);
  const result = await identityClient.listAvailabilityDomains({compartmentId: settings.tenancyId});
  return handleResult(result, query, "name");
}

async function listShapes(query, pluginSettings, pluginActionParams) {
  
  /**
   * This method will return all shapes domains
   * Must have compartmentId,availabilityDomain before
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const computeClient = getComputeClient(settings);
  
  const result = await computeClient.listShapes({
    compartmentId: params.compartment || settings.tenancyId,
    availabilityDomain: params.availabilityDomain
  })
  return handleResult(result, query, "shape");
}

async function listImages(query, pluginSettings, pluginActionParams) {
    /**
     * This method will return all shapes domains
     * Must have compartmentId,availabilityDomain before
     */
    const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
    const compartmentId = params.compartment || settings.tenancyId;
    const shape = params.shape;
    const computeClient = getComputeClient(settings);

    const request = {compartmentId, shape};
    const result = await computeClient.listImages(request);
    return handleResult(result, query);
}

async function listVCN(query, pluginSettings, pluginActionParams) {
    /**
     * This method will return all VCN
     */
    const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
    const compartmentId = params.compartment || settings.tenancyId;
    const virtualNetworkClient = getVirtualNetworkClient(settings);
 
    const request = {compartmentId};
    const result = await virtualNetworkClient.listVcns(request);
    return handleResult(result, query);
}

async function listSubnets(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const virtualNetworkClient = getVirtualNetworkClient(settings);
  const result = await virtualNetworkClient.listSubnets({
    compartmentId,
    vcnId: params.vcn
  });
  return handleResult(result, query);
}

async function listInstances(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const computeClient = getComputeClient(settings);

  const request = {compartmentId};
  const result = await computeClient.listInstances(request);
  return handleResult(result, query);
}

async function listRouteTables(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const virtualNetworkClient = getVirtualNetworkClient(settings);
  const result = await virtualNetworkClient.listRouteTables({
    compartmentId,
    vcnId: params.vcn
  });
  return handleResult(result, query);
}

async function listSecurityList(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const virtualNetworkClient = getVirtualNetworkClient(settings);
  const result = await virtualNetworkClient.listSecurityLists({
    compartmentId,
    vcnId: params.vcn
  });
  return handleResult(result, query);
}

async function listDhcpOptions(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const virtualNetworkClient = getVirtualNetworkClient(settings);
  const result = await virtualNetworkClient.listDhcpOptions({
    compartmentId,
    vcnId: params.vcn
  });
  return handleResult(result, query);
}

async function listServices(query, pluginSettings) {
  /**
   * This method will return all VCN
   */
  const settings = mapAutoParams(pluginSettings);
  const virtualNetworkClient = getVirtualNetworkClient(settings);
  const result = await virtualNetworkClient.listServices({});
  return handleResult(result, query);
}

async function listCapacityReservations(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all shapes domains
   * Must have compartmentId,availabilityDomain before
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const computeClient = getComputeClient(settings);

  const result = await computeClient.listComputeCapacityReservations({compartmentId});
  return handleResult(result, query);
}

async function listDedicatedVmHosts(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all shapes domains
   * Must have compartmentId,availabilityDomain before
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const computeClient = getComputeClient(settings);
  const result = await computeClient.listDedicatedVmHosts({compartmentId});
  return handleResult(result, query);
}

async function listFaultDomains(query, pluginSettings, pluginActionParams) {
  /**
   * This method will return all shapes domains
   * Must have compartmentId,availabilityDomain before
   */
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(pluginActionParams);
  const compartmentId = params.compartment || settings.tenancyId;
  const identityClient = getIdentityClient(settings);
  const result = await identityClient.listFaultDomains({
    compartmentId,
    availabilityDomain: params.availabilityDomain
  });
  return [{id: undefined, value: "Let Oracle choose"}].concat(handleResult(result, query));
}

module.exports = {
  listAvailabilityDomains,
  listShapes,
  listImages,
  listCompartments,
  listVCN,
  listSubnets,
  listInstances,
  listRouteTables,
  listSecurityList,
  listDhcpOptions,
  listServices,
  listCapacityReservations,
  listDedicatedVmHosts,
  listFaultDomains
}
