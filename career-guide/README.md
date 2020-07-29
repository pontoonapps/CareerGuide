# PONToon Career Guide

TODO a brief description goes here

## Installation

TODO rough but accurate, probably encompasses config and db config

## Design

TODO point to routes-and-auth, give broad-strokes overview, introduce the ERD

#### ERD
![ERD](docs/images/erd.png)

### Configuration

0. Make a copy of the `config-template.json`, found inside [server/](https://github.com/jacekkopecky/pontoon/tree/master/career-guide/server) and rename it to `config.json`
1. Provide the deployment route
2. Provide the right URL for the login check
3. Input your details such as database username, password

#### Database Configuration
There is two different databases that needs to be setup.
To initialize these databases you need to run the SQL code inside the database folder, in the following order:

0. `init.sql`
1. `data-jobs.sql`
2. `data-questions.sql`
3. `test-data.sql` (Not a necessity)
