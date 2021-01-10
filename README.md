# kaholo-plugin-oci-instances
Thi plugin integrate with Oracle Cloud to create instances

## Settings
1. Compartment ID (vault)
2. Private Key (vault). From Identity\Users\YOUR_USER\API keys. This value contains all the text from -----BEGIN PRIVATE KEY----- ...... -----END PRIVATE KEY-----
3. User ID (vault): User ocid. From Identity\Users\YOUR_USER.
4. Tenancy ID (vault) Tenancy ocid, from user profile.
5. Fingerprint (vault): From Identity\Users\YOUR_USER\API keys
6. Region (vault): Region identifier

## Method Launch instance
This method will invoke a new instance.

### Parameters
1. Compartment Id: (including Tenanty Id which is the root compartment).
2. Display name: The name of the new instance
3. Availability Domains: from a list of all available domains
4. Shape: From a list of all shapes
5. Image: from a list of images
6. Subnet: from a list of subnets

## Method: create VCN
This method will create a new VCN

### Parameters
1. VCN name
2. Compartment Id: (including Tenanty Id which is the root compartment).
3. CIDR Block

## Method: create Subnet
This method will create a subnet inside a VCN.

### Parameters
1. Subnet name
2. Compartment Id: (including Tenanty Id which is the root compartment).
3. CIDR Block
4. VCN

## Method: Delete VCN
This method will delete a VCN

### Parameter
1. VCN Name

## Method: Delete subnet
This method will delete a subnet

### Parameter
1. Subnet name
