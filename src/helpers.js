const fs = require("fs");
const common = require("oci-common");

async function createOci(user, tenancy, finger, region) {
    const path = __dirname;
    const content = `[DEFAULT]\nuser=${user}\nfingerprint=${finger}\ntenancy=${tenancy}\nregion=${region}\nkey_file=${path}/kaholo.pem`;
    return new Promise((resolve, reject) => {
        fs.writeFile(`${path}/.oci`, content, (err) => {
            if (err) reject(err)
            else resolve()
        });
    })
}

async function createPem(pem) {
    const path = __dirname;
    pem = pem.replace(/-----BEGIN PRIVATE KEY-----/g,'' )
    pem = pem.replace(/-----END PRIVATE KEY-----/g,'');
    pem = pem.replace(/ /g,'\n');
    pem = "-----BEGIN PRIVATE KEY-----\n"+pem+"-----END PRIVATE KEY-----"
    return new Promise((resolve, reject) => {
        fs.writeFile(`${path}/kaholo.pem`, pem, (err) => {
            if (err) reject(err)
            else resolve()
        });
    });
}

async function createProvider () {
    const path = __dirname;
    const configFilePath = `${path}/.oci`;
    const profile = "DEFAULT";
    const provider = await new common.ConfigFileAuthenticationDetailsProvider(
      configFilePath,
      profile
    );
    return provider;
  }
  
module.exports = {
    createOci,
    createPem,
    createProvider
}