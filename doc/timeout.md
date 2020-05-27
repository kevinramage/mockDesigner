# Wait action

Mock Designer provide a way to test application timeout handling. This action add some delay.

## Usage

To use this action, you just have to add time property.
* time: Milliseconds to wait before the next action

## Example

```yaml
actions:
- type: wait
  time: 10000
- type: message
  status: 200
  body: Timeout after 10000 ms
```