# Micro Services
Mock Designer propose an action to simulate a microservice behaviour

## Get all action
Return all data of a business object.

**Usage:**
* action: Must equals to getall to use this action
* storage: The storage system use for this business object

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
        storage:
          businessObject: command
```

## Get action
Return data of a specific business object

**Usage:**
* action: Must equals to get to use this action
* storage: The storage system use for this business object

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
        storage:
          businessObject: command
          propertyValue: "{{.request.params.cmdId}}"
```

## Create action
Generate an identifier of the business object and save business object in redis database.

**Usage:**
* action: Must equals to create to use this action
* storage: The storage system use for this business object
* data: data to store
* expiration: Retention period to keep the data in ms (Default value 3600)

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
        storage:
          businessObject: command
          propertyName: commandId
          propertyValue: "{{Increment(Command)}}"
        data: "{{.request.body}}"
        expiration: 60
```

## Update action
Update an existing business object.

**Usage:**
* action: Must equals to update to use this action
* storage: The storage system use for this business object
* data: data to store
* expiration: Retention period to keep the data in ms (Default value 3600)

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
        storage:
          businessObject: command
          propertyValue: "{{.request.params.cmdId}}"
        expiration: 60
```

## Update delta action
Get an existing object and apply a differential update to it.

**Usage:**
* action: Must equals to update to use this action
* storage: The storage system use for this business object
* data: data to store
* expiration: Retention period to keep the data in ms (Default value 3600)

**Example:**
```yml
- name: UpdateDeltaCommand
  method: PATCH
  path: /api/v1/command/:cmdId
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: updatedelta
        storage:
          businessObject: command
          propertyValue: "{{.request.params.cmdId}}"
        expiration: 60
```

## Update delta action
Get all existing objects and apply a differential update to it.

**Usage:**
* action: Must equals to update to use this action
* storage: The storage system use for this business object
* data: data to store
* expiration: Retention period to keep the data in ms (Default value 3600)

**Example:**
```yml
- name: UpdateDeltaAllCommandLines
  method: PATCH
  path: /api/v1/command/:cmdId/commandLine
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: updatedeltaall
        storage:
          businessObject: commandLine
          parent:
            businessObject: command
            propertyValue: "{{.request.params.cmdId}}"
```

## Delete action
Delete an existing business object.

**Usage:**
* action: Must equals to delete to use this action
* storage: The storage system use for this business object

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
        storage:
          businessObject: command
          propertyValue: "{{.request.params.cmdId}}"
```

## Delete all action
Delete all business objects

**Usage:**
* action: Must equals to delete to use this action
* storage: The storage system use for this business object

**Example:**
```yml
- name: DeleteAllCommands
  method: DELETE
  path: /api/v1/command
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: deleteall
        storage:
          businessObject: command
```

## Search
Search business objects with specifics properties. The mock will use the request query parameters as search conditions, these conditions will be combinated with an and operation to filter data return.

**Usage:**
* action: Must equals to delete to use this action
* storage: The storage system use for this business object

**Example:**
```yml
- name: SearchCommands
  method: Get
  path: /api/v1/command/search
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: search
        storage:
          businessObject: command
```

## Disable action
Disable an existing object
A object disabled is not visible from get, get all, update and delta update action

**Usage:**
* action: Must equals to delete to use this action
* storage: The storage system use for this business object

**Example:**
```yml
- name: DisableCommand
  method: PUT
  path: /api/v1/command/:cmdId/disable
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: disable
        storage:
          businessObject: command
          propertyValue: "{{.request.params.cmdId}}"
```

## Enable
Enable an existing object
A object disabled is not visible from get, get all, update and delta update action

**Usage:**
* action: Must equals to delete to use this action
* storage: The storage system use for this business object

**Example:**
```yml
- name: EnableCommand
  method: PUT
  path: /api/v1/command/:cmdId/enable
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: enable
        storage:
          businessObject: command
          propertyValue: "{{.request.params.cmdId}}"
```

## Disable all
Disable all objects
A object disabled is not visible from get, get all, update and delta update action

**Usage:**
* action: Must equals to delete to use this action
* storage: The storage system use for this business object

**Example:**
```yml
- name: DisableAllCommands
  method: PUT
  path: /api/v1/command/disableall
  response:
    triggers:
    - type: none
      actions:
      - type: microservice
        action: disableall
        storage:
          businessObject: command
```

## Next features

* Be able to override the return json body