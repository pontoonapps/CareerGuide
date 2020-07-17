-- careerguide started by referencing `pontoonapps_jobseeker`.users directly
-- to support guest login, we add `pontoonapps_careerguide`.`users`
-- this script undoes that change

-- -------------- tasks:
-- 1. drop likes, answers, shortlists tables, the new users table
-- 2. rename backup_* tables to likes, answers, shortlists


-- 1. drop likes, answers, shortlists tables

DROP TABLE `pontoonapps_careerguide`.`likes`;
DROP TABLE `pontoonapps_careerguide`.`shortlists`;
DROP TABLE `pontoonapps_careerguide`.`answers`;
DROP TABLE `pontoonapps_careerguide`.`users`;


-- 2. rename backup_* tables to likes, answers, shortlists

ALTER TABLE `pontoonapps_careerguide`.backup_likes
  RENAME TO `pontoonapps_careerguide`.likes;

ALTER TABLE `pontoonapps_careerguide`.backup_answers
  RENAME TO `pontoonapps_careerguide`.answers;

ALTER TABLE `pontoonapps_careerguide`.backup_shortlists
  RENAME TO `pontoonapps_careerguide`.shortlists;
