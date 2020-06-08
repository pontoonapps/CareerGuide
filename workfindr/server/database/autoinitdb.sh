username=$( cat server/config.js | grep ""user | awk '{print $2}' | sed "s/[,\']//g" )
password=$( cat server/config.js | grep ""password | awk '{print $2}' | sed "s/[,\']//g" )
echo "drop databases if exist"
mysql -u $username -p$password -e "
  DROP DATABASE pontoonapps_workfindr2;
  DROP DATABASE pontoonapps_jobseeker;"
echo "create databases and insert data"
mysql -u $username -p$password -e "
  SOURCE $(pwd)/server/database/init.sql
  SOURCE $(pwd)/server/database/data-questions.sql
  SOURCE $(pwd)/server/database/data-jobs.sql
  SOURCE $(pwd)/server/database/test-data.sql"
