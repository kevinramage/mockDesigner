# Validate trigger

Mock designer propose solution to check the request consistency
This trigger simulate a classical request validation system, it help you to check mandatory fields.

## Usage

To use this trigger, you just have to add mandatory fields to check
* mandatoriesFields: A string array to list the path to validate

If there at least one field missing, actions linked to this trigger will be executed

> If you use composed path like "parentField.subFied", if parentField not present in the request, the validation process will not evaluated subField as a missing field.

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
```