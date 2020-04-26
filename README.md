# Mock Designer
Mock designer tool help you to easily manage your mocks. You can describe the mock behaviour expected and the system will generate code for you.

## Installation

## Usage

To use it describe your mock behaviour in yaml file and execute the tool to generate the code link.
You can find here the complete description of the yaml syntax.

You can find bellow a command to execute the tool.
`npm run start -- --input tests/basic.yml`
Now, you can find a directory named "generated" that contains the source code of the mock system.
You can run the mock system with the following command:
```
cd generated
npm start
```
Now, you just have to do a GET request `http://localhost:7001/api/v1/myService` to test the service
You can find more information about the command line options here.

### Create a simple mock

We will a simple GET service. This service will return a basic 200 HTTP response.
```yaml
name: MyMock
services:
  - name: "myService"
    method: GET
    path: /api/v1/myService
    response:
      actions:
      - type: message
        status: 200
        body: OK
```

### Add some dynamics behaviour

### Add authentication mecanism