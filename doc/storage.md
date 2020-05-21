# Storage

## Save data

Mock designer propose a solution to save request data. Mock Designer propose a solution to save the complete request data, save an object or just save a value.
To save the request data, you can apply a save action to collect request data and store it in redis database.
Mock designer save data in storage space with a name and keys.
Name represents a logic storage domain
Keys represents an identifier or a set of identifiers to identify a particular line
All data stored expires after 10 hours.

**Usage**:
To save some data in redis, you just have to provide:
* storage: a logical name to store data
* keys: a combinaison of keys to identify data saved
* expressions: a key / value list that contains all data to store

**Example**:
```yaml
actions:
- type: save
    expressions:
    - key: name
      value: "{{.request.body.name}}"
    - key: description
      value: "{{.request.body.description}}"
    storage: command
    keys:
    - "{{Increment(commandCounter)}}"
```

## Use data stored

You can use a storage mechanism to return coherent data in your mock response.
You can use the storage keyword to retrieve informations saved.

**Usage**:
{{.store.storageKey[keys].property}}
* storageKey: The storage key to use to get the value. The storage key must match the format: [a-zA-Z0-9|_]
* keys: A List of key separate by a comma. The key must match the format: [a-zA-Z0-9|_]
* property: The property to search in the storage key. You can use the dot separator to go throught a complex structure

**Example**:
```json
{
    "id": "{{.ctx.incrementcommandCounter}}",
    "name": "{{.store.command[{{.ctx.incrementcommandCounter}}].name}}",
    "description": "{{.store.command[{{.ctx.lastIncrement}}].description}}"
}
```

## Next features

- [x] Manage data expiration
- [ ] Support the usage of object directly in the body response