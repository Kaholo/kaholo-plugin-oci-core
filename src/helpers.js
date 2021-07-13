const common = require("oci-common");
const core = require("oci-core");
const wr = require("oci-workrequests");
const identity = require("oci-identity");

/***
 * @returns {common.SimpleAuthenticationDetailsProvider} OCI Auth Details Provider
 ***/
 function getProvider(settings){
    return new common.SimpleAuthenticationDetailsProvider(
        settings.tenancyId,     settings.userId,
        settings.fingerprint,   settings.privateKey,
        null,                   common.Region.fromRegionId(settings.region)
    );
}

/***
 * @returns {core.ComputeClient} OCI Compute Client
 ***/
function getComputeClient(settings){
    const provider = getProvider(settings);
    return new core.ComputeClient({
      authenticationDetailsProvider: provider
    });
}

/***
 * @returns {identity.IdentityClient} OCI Identity Client
 ***/
 function getIdentityClient(settings){
    const provider = getProvider(settings);
    return new identity.IdentityClient({
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
 * @returns {core.BlockstorageClient} OCI Blockstorage Client
 ***/
 function getBlockstorageClient(settings){
    const provider = getProvider(settings);
    return new core.BlockstorageClient({
      authenticationDetailsProvider: provider
    });
}

/***
 * @returns {core.ComputeWaiter} OCI Virtual Network Waiter
 ***/
 function getCoreWaiter(settings){
    const provider = getProvider(settings);
    const computeClient = getComputeClient(settings);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    getComputeClient,
    getProvider,
    getVirtualNetworkClient,
    getBlockstorageClient,
    setPromiseResult,
    getCoreWaiter,
    getIdentityClient,
    sleep
}