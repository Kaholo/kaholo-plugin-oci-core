const common = require("oci-common");
const core = require("oci-core");
const wr = require("oci-workrequests");

/***
 * @returns {common.SimpleAuthenticationDetailsProvider} OCI Auth Details Provider
 ***/
 function getProvider(settings){
    return new common.SimpleAuthenticationDetailsProvider(
        settings.tenancyId,     settings.userId,
        settings.fingerprint,   settings.privateKey,
        null,                   settings.region
    );
}

/***
 * @returns {core.ComputeClient} OCI Compute Client
 ***/
function getComupteClient(settings){
    const provider = getProvider(settings);
    return new core.ComputeClient({
      authenticationDetailsProvider: provider
    });
}

/***
 * @returns {core.VirtualNetworkClient} OCI Virtual Network Client
 ***/
function getVirtualNetworkClient(settings){
    const provider = getProvider(settings);
    return new core.VirtualNetworkClient({
      authenticationDetailsProvider: provider
    });
}

/***
 * @returns {core.ComputeWaiter} OCI Virtual Network Waiter
 ***/
 function getCoreWaiter(settings){
    const provider = getProvider(settings);
    const computeClient = getComupteClient(settings);
    const wrClient =  new wr.WorkRequestClient({
      authenticationDetailsProvider: provider
    });
    return computeClient.createWaiters(wrClient);
}

async function setPromiseResult(result, key, prom){
    try {
        result[key] = await prom;
    }
    catch (err) {
        result[key] = err;
        throw result;
    }
}
  
module.exports = {
    getComupteClient,
    getProvider,
    getVirtualNetworkClient,
    setPromiseResult,
    getCoreWaiter
}