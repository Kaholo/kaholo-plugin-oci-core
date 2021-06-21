# kaholo-plugin-oci-core
Integration with Oracle Cloud Infrastracture(OCI) Core Services.

## Settings
1. Private Key (Vault) **Required** - Will be used to authenticate to the OCI API. Can be taken from Identity\Users\YOUR_USER\API keys.
2. User ID (String) **Required** - The OCID of the user to authenticate with.
3. Tenancy ID (String) **Required** - Tenancy OCID. Can be found in user profile.
4. Fingerprint (Vault) **Required** -  Will be used to authenticate to the OCI API. Can be taken from Identity\Users\YOUR_USER\API keys.
5. Region (String) **Required** - Identifier of the region to create the requests in. 

## Method Launch instance
Launches a new instance.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment to launch the instance in. If not specified will use tennancy ID.
2. Display name (String) **Optional** - The name of the new instance.
3. Availability Domain (Autocomplete) **Required** - Availability domain of the instance. For example: jUfS:eu-amsterdam-1-AD-1
4. Shape (Autocomplete) **Required** - Instance Shape to use for the instance. For example: VM.Standard.E2.1.Micro
5. Image (Autocomplete) **Required** - The ID of the base image of the instance. For Example: Oracle-Linux-7.9-2021.05.12-0
6. Subnet (Autocomplete) **Required** - The ID of the subnet to host the instance on.
7. SSH Keys (Text/Array) **Optional** - Public SSH Keys To save in accepted ssh keys in the instance. To enter multiple values seperate each with a new line.
8. User Data (Text) **Optional** - A script to run on the instance on launch.
9. Wait For Creation (Boolean) **Optional** - If specified return only after new instance is running. Default Value is False.

## Method: create VCN
Creates a new VCN in the specified compartment.

### Parameters
1. VCN Name (String) **Required** - The name of the VCN to create.
2. Compartment (Autocomplete) **Optional** - The compartment to launch the instance in. If not specified will use tennancy ID.
3. CIDR Block (String) **Required** - The IP Address Range to assign to the VCN, in CIDR notation.
4. Subnet CIDR Block (String) **Optional** - The IP Address Range to assign to a new subnet, in CIDR notation. If specified, create a new subnet in the VCN.
5. Create Internet Gateway (Boolean) **Optional** - If true, create a new internet gateway inside of the vpc. Default is false.
6. Create Default Route Table (Boolean) **Optional** - If true, create a new Route Table inside of the vpc. If created also a new internet gateway than create a default route in the route table to the internet gateway. Default is false.

## Method: Create Subnet
Creates a new subnet in the specified VCN.

### Parameters
1. Subnet Name (String) **Required** - The name of the new subnet to create.
2. Compartment (AutoComplete) **Optional** - The compartment of the VCN and the new subnet. If not specified default compartment is the Tenancy.
3. CIDR Block (String) **Required** - The range of IP addresses in CIDR notation to assign to the subnet.
4. VCN (AutoComplete) **Required** - The VCN of the new subnet.

## Method: Delete VCN
Delete a VCN and all related resources.

### Parameter
1. Compartment (AutoComplete) **Optional** - The compartment of the VCN to delete.
2. VCN (AutoComplete) **Required** - The VCN to delete.

## Method: Delete subnet
Deletes a subnet and all related resources.

### Parameter
1. Compartment (AutoComplete) **Optional** - The compartment of the VCN to delete.
2. Subnet (AutoComplete) **Required** - The Subnet to delete.

## Method: Create Security List
Create a new security list in the specified vcn.

### Parameters
1. VCN Name (String) **Required** - The name of the VCN to create.
2. Compartment (Autocomplete) **Optional** - The compartment to launch the instance in. If not specified will use tennancy ID.
3. CIDR Block (String) **Required** - The IP Address Range to assign to the VCN, in CIDR notation.
4. Subnet CIDR Block (String) **Optional** - The IP Address Range to assign to a new subnet, in CIDR notation. If specified, create a new subnet in the VCN.
5. Create Internet Gateway (Boolean) **Optional** - If true, create a new internet gateway inside of the vpc. Default is false.
6. Create Default Route Table (Boolean) **Optional** - If true, create a new Route Table inside of the vpc. If created also a new internet gateway than create a default route in the route table to the internet gateway. Default is false.

## Method: Create Internet Gateway
Create a new internet gateway in the specified vcn.

### Parameters
1. VCN Name (String) **Required** - The name of the VCN to create.
2. Compartment (Autocomplete) **Optional** - The compartment to launch the instance in. If not specified will use tennancy ID.
3. CIDR Block (String) **Required** - The IP Address Range to assign to the VCN, in CIDR notation.
4. Subnet CIDR Block (String) **Optional** - The IP Address Range to assign to a new subnet, in CIDR notation. If specified, create a new subnet in the VCN.
5. Create Internet Gateway (Boolean) **Optional** - If true, create a new internet gateway inside of the vpc. Default is false.
6. Create Default Route Table (Boolean) **Optional** - If true, create a new Route Table inside of the vpc. If created also a new internet gateway than create a default route in the route table to the internet gateway. Default is false.

## Method: Create Route Table
Create a new route table in the specified vcn.

### Parameters
1. VCN Name (String) **Required** - The name of the VCN to create.
2. Compartment (Autocomplete) **Optional** - The compartment to launch the instance in. If not specified will use tennancy ID.
3. CIDR Block (String) **Required** - The IP Address Range to assign to the VCN, in CIDR notation.
4. Subnet CIDR Block (String) **Optional** - The IP Address Range to assign to a new subnet, in CIDR notation. If specified, create a new subnet in the VCN.
5. Create Internet Gateway (Boolean) **Optional** - If true, create a new internet gateway inside of the vpc. Default is false.
6. Create Default Route Table (Boolean) **Optional** - If true, create a new Route Table inside of the vpc. If created also a new internet gateway than create a default route in the route table to the internet gateway. Default is false.

## Method: Update Instance
Update some of the specified instance's fields.

### Parameters
1. Compartment (AutoComplete) **Optional** - The compartment of the instance. If not specified will use tennancy ID.
2. Instance (AutoComplete) **Required** - The instance to update.
3. Display Name (String) **Optional** - If specified update the display name of the instance to the new name specified.
4. Shape (AutoComplete) **Optional** - If specified change the shape of the instance to the specified shape.

## Method: Instance Action
Start/Stop/Restart/"Soft Stop" the specified instance.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment of the instance to run the action on. If not specified will use tennancy ID.
2. Instance (AutoComplete) **Required** - The instance to run the action on.
3. Action (Options) **Required** - The action to run on the specified instance. Can be START/STOP/RESET/SOFTSTOP. RESET shuts down the instance then starts it again. SOFTSTOP sends a stop signal to the instance and waits for the OS to shut down before stop the instance. STOP doesn't wait for the OS.
4. Wait Until Finished (Boolean) **Optional** - If specified wait until the instance has finished shutting down\starting.