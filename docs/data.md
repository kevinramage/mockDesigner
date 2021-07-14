## Data

### Use data source

Mock designer propose options to manage simple or structured data sources.
Simple data source can be used to represent firstName, lastName, city, email
Structured data source can be used to represent contact, product, movie

### Simple data source

Mock designer propose a solution to generate data.
Use the keyword '.data.' and the data source name.
Example:
`{{ .data.firstname }}`

For computed data, use functions, [a generation library](./functions/generateFunctions.md) dedicated to data generation.

### Create your own data source

Create a file to store a list of values.

**Global data source**
Global data source is accessible to all mocks.
Use the /default/data/simple or /default/data/structured directory to store data sources.

**Specific data source**
Specific data source is accessible to one mock.
Use the /mock/XXXX/data to store data sources.