# Data trigger

Mock Designer propose to trigger specifics actions when some expressions matches.

## Usage

To use this trigger, you just have to add conditions to match and the actions linked to this trigger.
* Conditions: an array of string of string condition to match
* Actions: actions to proceed

## Example

```yaml
triggers:
- type: data
  conditions: 
  - "'{{.request.params.id}}' == '99999'"
  - "'{{.request.body.name}}' == 'ERROR_500'"
  actions:
  - type: message
    status: 500
    body: "Internal error"
```