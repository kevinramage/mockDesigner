# Random trigger

Mock designer propose solution to randomize the mock response. In some case, it can interesting to propose some differents responses to be able to test differentes situations

## Usage

To use this trigger, you just have to add a probability and the actions linked to this probability.
* Probability: an integer positive value
* Actions: actions to proceed

## Example

```yaml
triggers:
- type: random
  messages:
  - probability:  85
    actions:
    - type: message
      status: 200
      body: Operation completed successfully
  - probability: 10
    actions:
    - type: message
      status: 400
      body: Request sent invalid
  - probability:  5
    actions:
    - type: message
      status: 500
      body: An internal error occured
```