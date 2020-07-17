-- careerguide started by referencing `pontoonapps_jobseeker`.users directly
-- to support guest login, we add `pontoonapps_careerguide`.`users`
-- this script makes that change

-- -------------- tasks:
-- 1. create the new users table
-- 2. rename likes, answers, shortlists tables to backup_*
-- 3. create new likes, answers, shortlists tables
-- 4. register all users in backup likes, answers, shortlists
-- 5. copy backup likes, answers, shortlists to new structure


-- 1. create the new users table

-- copied from init.sql
CREATE TABLE IF NOT EXISTS `pontoonapps_careerguide`.`users` (
 `id`                 INT           NOT NULL AUTO_INCREMENT,
 `pontoon_user_id`    INT           UNIQUE DEFAULT NULL, -- either pontoon_user_id or tmp_name must exist
 `tmp_name`           VARCHAR(32)   UNIQUE DEFAULT NULL, -- if both exist, user started as temporary user
 `date_created`       DATETIME      NOT NULL DEFAULT current_timestamp(),
 `date_modified`      DATETIME      NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 PRIMARY KEY (`id`),
 FOREIGN KEY (`pontoon_user_id`) REFERENCES `pontoonapps_jobseeker`.users(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- 2. rename likes, answers, shortlists tables to backup_*

ALTER TABLE `pontoonapps_careerguide`.likes
  RENAME TO `pontoonapps_careerguide`.backup_likes;

ALTER TABLE `pontoonapps_careerguide`.answers
  RENAME TO `pontoonapps_careerguide`.backup_answers;

ALTER TABLE `pontoonapps_careerguide`.shortlists
  RENAME TO `pontoonapps_careerguide`.backup_shortlists;



-- 3. create new likes, answers, shortlists tables

-- copied from init.sql
CREATE TABLE IF NOT EXISTS `pontoonapps_careerguide`.`likes` (
  user_id           INT             NOT NULL,
  job_id            INT             NOT NULL,
  type              ENUM('like', 'dislike', 'show later'),
  time_stamp        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES `pontoonapps_careerguide`.users(id),
  FOREIGN KEY (job_id) REFERENCES `pontoonapps_careerguide`.jobs(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- copied from init.sql
CREATE TABLE IF NOT EXISTS `pontoonapps_careerguide`.`shortlists` (
  user_id           INT             NOT NULL,
  job_id            INT             NOT NULL,
  time_stamp        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES `pontoonapps_careerguide`.users(id),
  FOREIGN KEY (job_id) REFERENCES `pontoonapps_careerguide`.jobs(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- copied from init.sql
CREATE TABLE IF NOT EXISTS `pontoonapps_careerguide`.`answers` (
  user_id           INT             NOT NULL,
  question_id       INT             NOT NULL,
  option_number     INT             NOT NULL,
  time_stamp        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, question_id),
  FOREIGN KEY (user_id) REFERENCES `pontoonapps_careerguide`.users(id),
  FOREIGN KEY (option_number, question_id) REFERENCES `pontoonapps_careerguide`.options(option_number, question_id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. register all users in backup likes, answers, shortlists

INSERT IGNORE INTO `pontoonapps_careerguide`.`users` (pontoon_user_id)
SELECT user_id FROM `pontoonapps_careerguide`.backup_likes;

INSERT IGNORE INTO `pontoonapps_careerguide`.`users` (pontoon_user_id)
SELECT user_id FROM `pontoonapps_careerguide`.backup_shortlists;

INSERT IGNORE INTO `pontoonapps_careerguide`.`users` (pontoon_user_id)
SELECT user_id FROM `pontoonapps_careerguide`.backup_answers;



-- 5. copy backup likes, answers, shortlists to new structure

INSERT INTO `pontoonapps_careerguide`.`likes` (user_id, job_id, type, time_stamp)
SELECT users.id,
       backup.job_id,
       backup.type,
       backup.time_stamp
FROM `pontoonapps_careerguide`.`backup_likes` backup
JOIN `pontoonapps_careerguide`.`users` users
  ON backup.user_id = users.pontoon_user_id;

INSERT INTO `pontoonapps_careerguide`.`shortlists` (user_id, job_id, time_stamp)
SELECT users.id,
       backup.job_id,
       backup.time_stamp
FROM `pontoonapps_careerguide`.`backup_shortlists` backup
JOIN `pontoonapps_careerguide`.`users` users
  ON backup.user_id = users.pontoon_user_id;

INSERT INTO `pontoonapps_careerguide`.`answers` (user_id, question_id, option_number, time_stamp)
SELECT users.id,
       backup.question_id,
       backup.option_number,
       backup.time_stamp
FROM `pontoonapps_careerguide`.`backup_answers` backup
JOIN `pontoonapps_careerguide`.`users` users
  ON backup.user_id = users.pontoon_user_id;
