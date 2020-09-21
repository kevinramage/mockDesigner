# Data trigger

Mock Designer propose to trigger specifics actions when some expressions matches.

## Usage

To use this trigger, you just have to add conditions to match and the actions linked to this trigger.
* Conditions: Specify conditions array to match to execute the action set
* Actions: actions to proceed

Condition:
* LeftOperand: Property to check
* Operation: Operation to execute EQUALS, MATCHES, NOT_EQUALS, NOT_MATCHES, IN, NOT_IN, RANGE
* RightOperand: Value to check (string or property for equals operations regex else)

Notes:
* For MATCHES and NOT_MATCHES operations, you must define the regex on the rightOperand
* For MATCHES and NOT_MATCHES operations, you must define directly pattern without /. In this version, you can't define the flag option
* For IN and NOT_IN operations, you must define the list on the rightOperand
* For IN and NOT_IN operations, you must separate each item by a semi colon separator (Example: 1;2;3;4)
* For RANGE operation, you must define the range on the rightOperand
* For RANGE operation, you must separate the min value and max value with 3 dots (Example: 0...9)

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