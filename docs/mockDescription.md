## Mock description

### Format
Mock description use yaml format to structure its data.
A mock description is composed of key elements:
* mock informations: mock name
* route informations: path, method
* triggers: [Triggers](./trigger.md) to evaluate
* actions: [Actions](./action.md) to execute

Others kinds of elements are available
* authentication

Note: If you don't have any triggers, you add directly the action in the response element:
```yaml
    response:
      actions:
      - type: message
        status: 200
        body: OK
```
instead of:
```yaml
    response:
      triggers:
      - type: none
        actions:
        - type: message
            status: 200
            body: OK
```

### Organization

**Mock organisation**
**Project organisation**


Next step: [Manage data](./data.md)