# PONToon WorkFindr

## Installation

### Configuration

0. Make a copy of the `config-template.json`, found inside [server/](https://github.com/jacekkopecky/pontoon/tree/master/workfindr/server) and rename it to `config.json`
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
