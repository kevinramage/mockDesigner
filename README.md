# Mock Designer
Mock designer tool help you to easily manage your mocks. You can describe the mock behaviour expected and the system will generate the mock source code for you.

## Installation

To install it, you just have to clone this repository.
Docker and npm tools required to use Mock Designer.

## Usage

To use it describe your mock behaviour in yaml file and execute the tool to generate the code link.

You can find bellow a command to execute the tool.

`npm run start -- --input mocks/code/examples/basic.yml`

Now, you can find a directory named "generated" that contains the source code of the mock system.
You can run the mock system with the following command:

`docker-compose -f generated/docker-compose.yml up -d --build`

Now, you just have to do a GET request `http://localhost:7001/api/v1/myService` to test the service.

[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/commandLine.md)

## Create a simple mock

We will create a simple GET service:
This service will return a basic 200 HTTP response.

*basic.yml*
```yaml
name: MyMock
services:
- name: "myService"
  method: GET
  path: /api/v1/myService
  response:
    triggers:
    - type: none
      actions:
      - type: message
        status: 200
        body: OK
```

## Documentation

To use all features of Mock Designer, you must know some basics notions: trigger, action, behaviour...

[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/mockDesigner.md)

## Tools

### Generate definition from Swagger

Generate the mock definition directly from a swagger (JSON or YAML format).
Copy the swagger file in swaggerToMockDesigner tool workspace and run the tool with the following command:

`cd .\src\tools\swaggerToMockDesigner\`
`npm install`
`npm run start -- --name myMockSystem --input swagger3.json`

After the generation, a directory mockGenerated is present in tools workspace.
This new directory contains the mock description and mock response, with this mock description, we can now run the code generation to 

`cd ../../`
`npm install`
`npm run start -- --input tools/swaggerToMockDesigner/mockGenerated/code/myMockSystem.yml`
`docker-compose -f generated/docker-compose.yml up -d --build`

### Generate definition from WSDL

This feature will come in future version

## Use cases

Some situations are complex to manage with classical mock system.

[You can find examples here](https://github.com/kevinramage/mockDesigner/blob/master/doc/usecase.md)

## Integration

Mock Designer use venom as integration test technology. You can run the integration tests with the following command:

`.\venom.exe run --output-dir . .\integration\*.yml`

## Others tools

Features  | Soap     | Postman  | Fortress | VRest    | Nock     | Beeceptor | Mockoon | WireMock | MockDesigner
------------------------------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
Free | :x: | :x: | :x: | :x: | :heavy_check_mark: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Data Stored in cloud | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Scripting | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark:
Dynamic mock response | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Conditionnal execution | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Delay response | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Error handling | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Data storage | :x: | :x: | :x: | :x: | :x: | :x: | :x: | :x: | :heavy_check_mark:
Generate from WSDL | :heavy_check_mark: | :x: | :x: | :x: | :x: | :x: | :x: | :x: | :x:
Generate from Swagger | :x: | :x: | :x: | :x: | :x: | :x: | :x: | :x: | :heavy_check_mark:
Low code | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark:
GUI Interface | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x:
Monitor requests | :x: | :heavy_check_mark: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark:

## Contribution

[More informations ...](https://github.com/kevinramage/mockDesigner/blob/master/CONTRIBUTING.md)