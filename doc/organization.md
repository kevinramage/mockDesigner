# Organization
In Mock Designer, the test organization is an important rule to follow in order to add your own custom files or organize your tests with directory.

## Structure
Mock designer propose you the following organization, include all your code in tests directory.
Inside this tests directory:
* data directory: Add data sources in this directory (json, ~~xml~~, ~~csv~~)
* functions directory: Add custom functions in this directory (ts)
* response directory: Add service response in this directory (json, txt, xml)
* code directory: Add service code in this directory (yml)

Inside each these directories, you can add subdirectories to organize your different services.

## Include

Mock Designer propose an include statement.
This statement can be used to divide big file in small files or can be used to facilitate some reuse.

An example of include statement:
```yml
name: MyMock
services:
  ##INCLUDE include.yml.part1##
##INCLUDE include.yml.part2##
```

## Next feature

- [x] Avoid the folder restriction 
- [ ] Add statement to include code in service