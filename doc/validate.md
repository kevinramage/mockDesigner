# Validate trigger

Mock designer propose solution to check the request consistency
This trigger simulate a classical request validation system, it help you to:
* check mandatory fields
* check enum field

## Usage

To use this trigger, you just have to add fields to check
* mandatoriesFields: A string array to list the path to validate
* enumFields: A enum field array to list to validate

Enum field object composed of:
* field: A string indicate the field to check
* values: A string array indicate value list

If there at least one field missing or invalid, actions linked to this trigger will be executed

> If you use composed path like "parentField.subFied", if parentField not present or inavlid in the request, the validation process will not evaluated subField.

## Example

```yaml
triggers:
- type: validate
  mandatoriesFields:
  - "deliveryDate"
  - "contact.id"
  - "products"
  - "products.id"
  - "products.name"
  actions:
  - type: message
    status: 400
    body: Mandatories fields missing %s
- type: validate
  enumFields:
  - field: "products.deliveryMode"
    values:
    - "IMMEDIATE"
    - "SCHEDULED"
  actions:
  - type: message
    status: 400
    body: DeliveryMode is not valid
```