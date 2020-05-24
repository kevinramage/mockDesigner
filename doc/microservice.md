# Micro Services
Mock Designer propose an action to simulate a microservice behaviour

## Get all service
Return all data of a business object.
This action will
* Check the presence of parent object
* Compute the key to retrieve data (with storage and keys)
* Retrieve data
* Send data

**Usage:**
* action: Must equals to getall to use this action
* storage: A logical name to store the business object data 

**Example:**
```yml
- name: GetAllCommands
  method: GET
  path: /api/v1/command
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: getall
        storage: command
```

## Get service
Return data of a specific business object
This action will
* Compute the key to retrieve data (with storage and keys)
* Retrieve data
* Send data

**Usage:**
* action: Must equals to get to use this action
* storage: A logical name to store the business object data 
* identifier.value: The way to get the business object unique identifier 

**Example:**
```yml
- name: GetCommand
  method: GET
  path: /api/v1/command/:cmdId
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: get
        storage: command
        identifier:
          value: "{{.request.params.cmdId}}"
```

## Search service

## Create service
Generate the unique identifier of the business object and save business object in redis database.
This action will
* Generate identifier
* Save data
* Updade indexes
* Send data

**Usage:**
* action: Must equals to create to use this action
* storage: A logical name to store the business object data 
* identifier.name: The name of the unique identifier property
* identifier.value: The way to generate the business object unique identifier (increment, unique value...)

**Example:**
```yml
- name: CreateCommand
  method: POST
  path: /api/v1/command
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: create
        storage: command
        identifier: 
          name: id
          value: "{{Increment(commandCounter)}}"
```

## Update service
Update an existing business object.
This action will
* Compute the key to retrieve data (with storage and keys)
* Save data
* Send data

**Usage:**
* action: Must equals to update to use this action
* storage: A logical name to store the business object data 
* identifier.value: The way to get the business object unique identifier 

**Example:**
```yml
- name: UpdateCommand
  method: PUT
  path: /api/v1/command/:cmdId
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: update
        storage: command
        identifier: 
          value: "{{.request.params.cmdId}}"
```

## Delete service
Delete an existing business object.
This action will
* Delete data
* Updade indexes
* Send empty response

**Usage:**
* action: Must equals to delete to use this action
* storage: A logical name to store the business object data 
* identifier.value: The way to get the business object unique identifier 

**Example:**
```yml
- name: DeleteCommand
  method: DELETE
  path: /api/v1/command/:cmdId
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: delete
        storage: command
        identifier: 
          value: "{{.request.params.cmdId}}"
```

## Storage of business object

Store a command: command$$1
Store command list: command_list
Store a product: product$$1-1
Store a product list: product_list$$1