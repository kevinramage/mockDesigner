# Data trigger

Mock Designer propose to trigger specifics actions when some expressions matches.

## Usage

To use this trigger, you just have to add conditions to match and the actions linked to this trigger.
* Conditions: Specify conditions array to match to execute the action set
* Actions: actions to proceed

Condition:
* LeftOperand: Property to check
* Operation: Operation to execute EQUALS, MATCHES, NOT_EQUALS, NOT_MATCHES
* RightOperand: Value to check (string or property for equals operations regex else)

## Example

```yaml
triggers:
- type: data
  conditions: 
  - leftOperand: "{{.request.params.id}}"
    operation: EQUALS
    rightOperand: "99999"
  - leftOperand: "{{.request.body.name}}"
    operation: EQUALS
    rightOperand: "ERROR_500"
  actions:
  - type: message
    status: 500
    body: "Internal error"
```