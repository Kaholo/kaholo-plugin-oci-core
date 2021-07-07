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
4. Preemptible Capacity Type (Boolean) **Optional** - If specified, place the instance on a shared host using preemptible capacity. This instance can be reclaimed at any time. Default is False.
5. (Preemptible) Preserve Boot Volume (Boolean) **Optional** - Only for preemtible instances. If specified, when reclaimed, don't delete the attached boot volume. Default is false.
6. Capacity Reservation (Autocomplete) **Optional** - If specified, place the instance on a shared host, and have it count against thespecified capacity reservation. Can't be provided with Preemptible Capacity Type or a dedicated VM host.
7. Dedicated VM Host (Autocomplete) **Optional** - If specified, place the instance on the specified dedicated virtual machine host. Can't be provided with Preemptible Capacity Type or Capacity Reservation.
7. Fault Domain (Autocomplete) **Optional** - If specified, place the instance on the specified fault domain. You can read more on fault domains [here](https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm#fault). If not specified, let OCI choose the fault domain for you.
8. Shape (Autocomplete) **Required** - Instance Shape to use for the instance. For example: VM.Standard.E2.1.Micro.
9. Custom Shape OCPU Count (Integer) **Optional** - Only for flexiable shapes with custom amount of OCPUs. Determines the number of OCPUs in the instance's image.
10. Custom Shape Memory(GBs) (Integer) **Optional** - Only for flexiable shapes with custom amount of Memory size. Determines the size of the memory in the instance's image.
11. Image (Autocomplete) **Required** - The ID of the base image of the instance.
12. VCN (Autocomplete) **Optional** - The ID of the VCN to choose a subnet from.
13. Subnet (Autocomplete) **Required** - The ID of the subnet to host the instance on.
14. Assign Public IP (Boolean) **Optional** - If specified, assign a public IP to the instance.
15. SSH Keys (Text/Array) **Optional** - Public SSH Keys To save in accepted ssh keys in the instance. To enter multiple values seperate each with a new line.
16. Custom Boot Volume Size(GBs) (Integer) **Optional** - If specifiied, create a boot volume for this instance with the specified storage size. Default boot volume storage size is 46.6 GB.
17. Use In-Transit Encryption (Boolean) **Optional** - If specified, Encrypt data in transit between the instance, the boot volume, and the block volumes.
18. User Data (Text) **Optional** - A script to run on the instance on launch.
19. Wait For Creation (Boolean) **Optional** - If specified return only after new instance is running. Default Value is False.

## Method: create VCN
Creates a new VCN in the specified compartment.

### Parameters
1. VCN Name (String) **Required** - The name of the VCN to create.
2. Compartment (Autocomplete) **Optional** - The compartment to launch the instance in. If not specified will use tennancy ID.
3. CIDR Block (String) **Required** - The IP Address Range to assign to the VCN, in CIDR notation.
4. Create Related (Boolean) **Optional** - If specified, create default related resources inside the VCN. The Default resources are an internet gateway always, and if also creates a private subnet, create all required resources in it.
5. Public Subnet CIDR Block (String) **Optional** - The IP Address Range to assign to the default public subnet in this VCN, in CIDR notation. If specified, create a new public subnet in the VCN.
6. Private Subnet CIDR Block (String) **Optional** - The IP Address Range to assign to the default private subnet in this VCN, in CIDR notation. If specified, create a new private subnet in the VCN.
7. Use DNS Hostnames (Boolean) **Optional** - If true, use automatic dns hostnames for this VCN and any default subnets created from this method.

## Method: Create Subnet
Creates a new subnet in the specified VCN.

### Parameters
1. Subnet Name (String) **Required** - The name of the new subnet to create.
2. Compartment (AutoComplete) **Optional** - The compartment of the VCN and the new subnet. If not specified default compartment is the Tenancy.
3. CIDR Block (String) **Required** - The range of IP addresses in CIDR notation to assign to the subnet.
4. Create Related (Boolean) **Optional** - If specified, create default related resources inside the Subnet. There are only resources needed in case the subnet is private. If it is private, create a private route table for it, a NAT gateway, and a service gateway. Default is false.
5. Private (Boolean) **Optional** - If specified, set the subnet to be private - with no access from the internet to it. Also don't provide public IP addresses to resources inside the subnet. Default is false.
6. VCN (AutoComplete) **Required** - The VCN of the new subnet.
7. Route Table (AutoComplete) **Optional** - If specified, associate this subnet with the specified Route Table. If not specified will be associated with the default route table of the VCN.
8. Availability Domain (AutoComplete) **Optional** - If specified, only allow access to this subnet from the specified availability domain.
9. Security List **Optional** - If specified, apply the specified security list to the new subnet.
10. DHCP Options **Optional** - If specified, apply the specified DHCP options to the new subnet.

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
1. Compartment (Autocomplete) **Optional** - The compartment to create the security list in. If not specified will use tennancy ID from settings.
2. Name (String) **Optional** - The display name of the new security list.
3. VCN (AutoComplete) **Required** - The VCN of the new security list.
4. Egress Security Rules (Array of Objects) **Optional** - An array of egrass security rules objects. If specified apply the specified rules to the Security List. If not, use default egrass security rule which is: `{protocol: "all", destination: "0.0.0.0/0"}`.
4. Ingress Security Rules (Array of Objects) **Optional** - An array of ingress security rules objects. If specified apply the specified rules to the Security List. If not, use default ingress security rule which is: `{protocol: "all", source: "0.0.0.0/0"}`.

## Method: Create Internet Gateway
Create a new internet gateway in the specified vcn.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment to create the internet gateway in. If not specified will use tennancy ID from settings.
2. Name (String) **Optional** - The display name of the new internet gateway.
3. VCN (AutoComplete) **Required** - The VCN of the new internet gateway.

## Method: Create Route Table
Create a new route table in the specified vcn.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment to create the route table in. If not specified will use tennancy ID from settings.
2. Name (String) **Optional** - The display name of the new route table.
3. VCN (AutoComplete) **Required** - The VCN of the new route table.
4. Destinations (Text/Array) **Optional** - CIDR Block IPv4 addresses, or CIDR labels for service destinations. If specified, create route rules inside the route tables to the specified destinations.
5. Rules Network Entity IDs (Text/Array) **Optional** - Required in case Destinations were provided. The OCIDs of the network entities to route the destinations addresses to. **Must be in the same length as Destinations**
6. Destinations Type (Options) **Optional** - If specified any destinations for rules, than determines the type of the specified destinations. Possible Values are CIDR_BLOCK/SERVICE_CIDR_BLOCK. Default vakue is CIDR_BLOCK.

## Method: Add Route Rules
Add new route rules to the specified route table.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment of the route table. If not specified will use tennancy ID from settings.
2. VCN (AutoComplete) **Required** - The VCN of the route table.
3. Route Table (AutoComplete) **Required** - The route table to add route rules to.
4. Destinations (Text/Array) **Required** - The destinations of the rules in CIDR block or label notation. 
5. Rules Network Entity IDs (Text/Array) **Required** - The OCIDs of the network entities to route the destinations addresses to. **Must be in the same length as Destinations**
6. Destinations Type (Options) **Optional** - Determines the type of the specified destinations. Possible Values are CIDR_BLOCK/SERVICE_CIDR_BLOCK. Default value is CIDR_BLOCK.

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

## Method: Create NAT Gateway
Create a new NAT gateway in the specified vcn.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment to create the NAT gateway in. If not specified will use tennancy ID from settings.
2. Name (String) **Optional** - The display name of the new NAT gateway.
3. VCN (AutoComplete) **Required** - The VCN of the new NAT gateway.

## Method: Create Service Gateway
Create a new service gateway in the specified vcn.

### Parameters
1. Compartment (Autocomplete) **Optional** - The compartment to create the service gateway in. If not specified will use tennancy ID from settings.
2. Name (String) **Optional** - The display name of the new service gateway.
3. VCN (AutoComplete) **Required** - The VCN of the new service gateway.
3. Service (AutoComplete) **Required** - The service to allow traffic for, in the new service gateway.
