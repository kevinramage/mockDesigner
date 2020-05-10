# Random trigger

Mock designer propose solution to add some dynamism in our service response.
You can add random rotation to provide different response in your service.
It can help the team to test with a large diversity of data.
In numerous situation, we must master data required for your tests but for non regression tests, it can be helpfull to have a rotation in your test data.

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