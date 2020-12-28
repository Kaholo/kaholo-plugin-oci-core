const core = require("oci-core");
//const os = require("oci-objectstorage");
const identity = require("oci-identity");
const wr = require("oci-workrequests");
const common = require("oci-common");
// ------> https://github.com/oracle/oci-typescript-sdk/blob/master/examples/javascript/launch_instance.js
async function launchInstance() {
    const tenancyId = "ocid1.tenancy.oc1..aaaaaaaaph6uw7qc4ypwhic4zayix3xm2437hoic5p4imbcc5h5qkkf4hq5a";
    const userId = "ocid1.user.oc1..aaaaaaaaldk34rgvs75opc2ragrgj7e5pcmuyyw673nd6vbzc6t6j5oqxkma";
    const fingerprint = "0b:22:0e:77:10:47:e3:20:c2:04:a2:af:87:95:de:7d";
    
    const privateKey = `-----BEGIN PRIVATE KEY-----
    MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0PlKimHXjLYL/
    z/WlKdEBg5MYXoKVB+ofHJw2Y4DZRy9B+7LfY9m4z0PgFw4AAsV7sQ+7p5QiRuvu
    yxMqbBQfCmuSNjz/UEUOyvCJiI2TG8xpVkiqENeR9Twjpxaz9hsnJS09op88Mtxv
    Mg0pfFP+4oPd+Th8ps0PTdA2ZzgtDvoYsqR4Tntrr6RWbI9u3/HQIH0vwrJm7rws
    0QqlWfOf++FieECimU4eMD2Bi/VWaXPJe02Eaj7tOk9rlnMBAW6MkO96LOyzKWrk
    iziS8/tm3J2Jp0Jv876m2gsSH65zqc4UO0k5icwDkm0cRDwCBMe6PF5dEHpcBGL3
    KlWswX5XAgMBAAECggEAOX+KJ/Ff5gVOPWHvWG1jDcsV4RfBK16Xeq5LTPRoFagm
    NLPhB29YdKK14eYo4qr/qao9vRzD3j1mpUomBonsz0wpLb7crYvDQ+lMW2ty0mNz
    TYUncA0oX5juQudaEDWpys6KxJc8md0VwekjFsFhIDXNYEHRGb6yOrgVfE1oN8L8
    98SDT9Dtdih0BaIt/75/jqNscfwwObQM652wZ8VNZtBHChnMBXueZmDDRhgbI60g
    Ek3SFgQlzdbRXN4XfQsqvUZ/2eBRp5MPO38i3mwRScICRF76tTM69Cz0IZBaFE79
    4HBWZeVbgc6sCf9Jv3Q4uuekhhrCq9g8QrC/2+beHQKBgQD83DbQM0M0A/RNrxUA
    QPEfpAS1dpy2+OGHwIyuyMkOrm6znVoxuUWB7pg6XuYRZWTQeSUYOnojum3Fn+d5
    Eo3gvoWSFA2UU6U4pRm9hQ4fRe8/NG7F3mjinZQ1nUrwr8CMxZuhKT5aoczGUn9V
    liPuKyvL2/izeYYbV7jn8td+8wKBgQC2e0a6T/nVILMZ/axDLon/hRyLYYo3lCFQ
    z5dJraJu410LppraBAguGNDs1TS81vnUJdE8J3WSoVIg8hJ2aAL9A73tClT1pJy+
    ZbEv2dbNVSq3MkCGQ61gU4DKKpC5hTpoE1yDWBvEqHqGM8BvDFAIOqY4IIZ+Je8J
    WhAUjmrEDQKBgQD1F+75d/bX4E1ZTy+oA0q1RKJb0hCtOihBEV5LvMtFs8YRy5+1
    OsQo4UAks/+FNSa2+/X8uhHRt87XE9ul+1oSUhneMhnHgBxR/5YnoWTC42K3fPcy
    TBaWMe+K2F/fVDvrN09Ws0eBSfvW7/gE2XcSUD4vZ5R1QoG+1xSfnz9KCQKBgQCv
    H1NbDdFm9cCr2sRsnMcWjvo70NnCSMhIM1CvBpFx9YSf372QKHppMqud/WZlK7IK
    JFjOb9fnZiXZNDb/pwXnJqYoS9gI/XbnSdRnZZk86NTbhsBhmaVTYg+g9IR7Zh4N
    LzeDXRUY/87F5/hvGdPccdx+1Mf9XA4wXVw9Pge8KQKBgFxdiC4Ux2HlCzNKH8Au
    9n2Qn01ceZiSzFo7GpUQXzR8fZ+JlwEoUVPATtkWce+GaibawkcUb12II+1qRJNy
    4BOgGvcHJEDgpBY7m+hdcw/RuZva6UmcOOeFWXXCPidsBvRWs5j5HGY/5o+j4mjz
    IlMcOliuCvOS8jKqyca7fmps
    -----END PRIVATE KEY-----`;
    const passPhrase = "kaholo";
    const region = "eu-frankfurt-1"
    
    const provider = new common.SimpleAuthenticationDetailsProvider(tenancyId, userId, fingerprint, privateKey, passPhrase)
    const compartmentId = "ocid1.tenancy.oc1..aaaaaaaaph6uw7qc4ypwhic4zayix3xm2437hoic5p4imbcc5h5qkkf4hq5a";
    
    const availabilityDomain = "AD-1";
    /*const shape = "VM.Standard.E2.1.Micro";
    
    const imageId = "Oracle Linux 7.9";
    
    const virtualNetworkClient = new core.VirtualNetworkClient({
        authenticationDetailsProvider: provider
      });
    
      const createVcnDetails = {
        cidrBlock: "10.0.0.0/16",
        compartmentId: compartmentId,
        displayName: "TypeScript-SDK-Example"
      };
  
      const createVcnRequest = {
        createVcnDetails: createVcnDetails
      };
  
      const createVcnResponse = await virtualNetworkClient.createVcn(createVcnRequest);
  
      const getVcnRequest = {
        vcnId: createVcnResponse.vcn.id
      };
  
      const getVcnResponse = await virtualNetworkWaiter.forVcn(
        getVcnRequest,
        core.models.Vcn.LifecycleState.Available
      );
  
      vcnId = getVcnResponse.vcn.id;
  
      const createSubnetRequest = {
        createSubnetDetails: {
          cidrBlock: "10.0.0.0/16",
          compartmentId: compartmentId,
          displayName: "TypeScript-SDK-Example",
          vcnId: createVcnResponse.vcn.id
        }
      };
  
      const createSubnetResponse = await virtualNetworkClient.createSubnet(createSubnetRequest);
  
      const getSubnetRequest = {
        subnetId: createSubnetResponse.subnet.id
      };

      await virtualNetworkWaiter.forSubnet(
        getSubnetRequest,
        core.models.Subnet.LifecycleState.Available
      );
  
      subnetId = createSubnetResponse.subnet.id;
        
      const sourceDetails = {
        imageId: imageId,
        sourceType: "image"
      };

  
    /*
    const sourceDetails = {
        imageId: image.id,
        sourceType: "image"virtualNetworkClient
      };
    
    const computeClient = new core.ComputeClient({
        authenticationDetailsProvider: provider
      });
    computeClient.regionId = region;
      
    const workRequestClient = new wr.WorkRequestClient({
        authenticationDetailsProvider: provider
      });
    workRequestClient.regionId = region;
    
    const computeWaiter = computeClient.createWaiters(workRequestClient);

    const virtualNetworkClient = new core.VirtualNetworkClient({
        authenticationDetailsProvider: provider
    });
    virtualNetworkClient.regionId = region;

    const virtualNetworkWaiter = virtualNetworkClient.createWaiters(workRequestClient);
    const identityClient = new identity.IdentityClient({
        authenticationDetailsProvider: provider
    });
    identityClient.regionId = region;
    const request = {
        compartmentId: tenancyId
    };
    const response = await identityClient.listAvailabilityDomains(request);
    console.log(response.item[0])
    return response.items[0];
    createVnicDetails: {
          subnetId: createSubnetResponse.subnet.id
        }
    */
    let computeClient = new core.ComputeClient({
        authenticationDetailsProvider: provider
    });
    /*
    const launchInstanceDetails = {
        compartmentId: compartmentId,
        availabilityDomain: availabilityDomain,
        shape: shape,
        displayName: "TypeScript-SDK-Example",
        sourceDetails: sourceDetails,
        
      };
  
      const launchInstanceRequest = {
        launchInstanceDetails: launchInstanceDetails
      };
  
      const launchInstanceResponse = await computeClient.launchInstance(launchInstanceRequest);
    */
    
    console.log("Getting Shapes....");
    const request = {
        availabilityDomain: availabilityDomain,
        compartmentId: compartmentId
    };
    var response = await computeClient.listShapes(request);
    for (let shape of response.items) {
        if (shape.shape.startsWith("VM")) {
          return shape;
        }
    }
    //console.log(response)
    //return response.value;
}

launchInstance();