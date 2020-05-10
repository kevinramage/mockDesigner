# Project Name
You can define the project name with the following command
`npm run start -- --input tests/basic.yml --projectName mySuperProject`
The default value of this attribute is MyMockApp

# Port
You can define the project port with the following command
`npm run start -- --input tests/basic.yml --port 8080`
The default value of this attribute is 7001

# Input
You must define the input directory. You can use several syntaxes:
* The direct file name
`npm run start -- --input tests/basic.yml`
* An expression
`npm run start -- --input tests/*.yml`
* A directory
`npm run start -- --input tests/`

# Output
You can define the output directory of the generated files with the following command:
`npm run start -- --input tests/*.yml --output mySuperProject`
The default value of this attribute is the generated directory

## Next features

[ ] - Add the possibility to disable redis