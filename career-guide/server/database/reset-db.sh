#!/bin/bash

# THIS WILL DELETE AND RE-SET YOUR DATABASE

username=$( cat server/config.json | grep user | awk '{print $2}' | sed 's/[,"]//g' )
password=$( cat server/config.json | grep password | awk '{print $2}' | sed 's/[,"]//g' )
echo "drop databases if exist"
mysql -u $username -p$password -e "
  DROP DATABASE IF EXISTS pontoonapps_careerguide;
  DROP DATABASE IF EXISTS pontoonapps_jobseeker;"
echo "create databases and insert data"
mysql -u $username -p$password -e "
  SOURCE server/database/init.sql
  SOURCE server/database/data-questions.sql
  SOURCE server/database/data-jobs.sql
  SOURCE server/database/test-data.sql" --default-character-set=utf8
