# Sequential trigger

Mock designer propose solution to add some dynamism in our service response.
You can add sequential rotation to provide different response in your service.
It can help the team to test with a large diversity of data.
In numerous situation, we must master data required for your tests but for non regression tests, it can be helpfull to have a rotation in your test data.

## Usage

To use this trigger, you just have to add a repeat and the actions linked to this repeat.
* Repeat: an integer positive value, the action will be repeat (Optionnal, default value is 1)
* Actions: actions to proceed

## Example

```yaml
triggers:
- type: sequential
  messages:
  - repeat:  3
    actions:
    - type: message
      status: 200
      body: Operation completed successfully
  - repeat: 2
    actions:
    - type: message
      status: 400
      body: Request sent invalid
  - repeat:  1
    actions:
    - type: message
      status: 500
      body: An internal error occured
```