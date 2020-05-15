CREATE DATABASE IF NOT EXISTS `pontoonapps_jobseeker`;

-- taken from the existing jobseeker database, DO NOT CHANGE
CREATE TABLE IF NOT EXISTS `pontoonapps_jobseeker`.`users` (
 `id`                 INT           NOT NULL AUTO_INCREMENT,
 `first_name`         VARCHAR(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `last_name`          VARCHAR(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `email`              VARCHAR(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `profile_img`        VARCHAR(100)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `profile_img_status` INT(1)        DEFAULT 0,
 `job_prefs`          VARCHAR(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `hashed_password`    VARCHAR(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `reset_token`        VARCHAR(32)   COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `email_token`        VARCHAR(32)   COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `date_created`       DATETIME      NOT NULL DEFAULT current_timestamp(),
 `date_modified`      DATETIME      NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `visible`            VARCHAR(5)    COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'true',
 PRIMARY KEY (`id`)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




CREATE DATABASE IF NOT EXISTS `pontoonapps_workfindr2`;

CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`categories` (
  id                INT             PRIMARY KEY AUTO_INCREMENT,
  title_en          VARCHAR(255),
  icon_filename     VARCHAR(100)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`jobs` (
  id                INT             PRIMARY KEY AUTO_INCREMENT,
  title_en          VARCHAR(255),
  description_en    VARCHAR(255),
  titre_fr          VARCHAR(255),
  description_fr    VARCHAR(255),
  category_id       INT             NOT NULL,

  teamwork          INT             NOT NULL, -- (1) Alone / team(9)
  physical_activity INT             NOT NULL, -- (1) Active/ Not active(9)
  creativity        INT             NOT NULL, -- (1) Creative / not creative(9)
  driving           INT             NOT NULL, -- (1) no Driving Required? yes (2)
  travel            INT             NOT NULL, -- (1) Less travel / Travel ok (9)
  hours_flexibility INT             NOT NULL, -- (1) Fixed Hours / Flexible (9)
  care_work         INT             NOT NULL, -- (1) Care work ok / No Care work (9)
  danger            INT             NOT NULL, -- (1) Risk / No Risk (9)

  FOREIGN KEY (category_id) REFERENCES `pontoonapps_workfindr2`.categories(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`likes` (
  user_id           INT             NOT NULL,
  job_id            INT             NOT NULL,
  type              ENUM('like', 'dislike', 'show later'),
  time_stamp        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES `pontoonapps_jobseeker`.users(id),
  FOREIGN KEY (job_id) REFERENCES `pontoonapps_workfindr2`.jobs(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`shortlists` (
  user_id           INT             NOT NULL,
  job_id            INT             NOT NULL,
  time_stamp        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES `pontoonapps_jobseeker`.users(id),
  FOREIGN KEY (job_id) REFERENCES `pontoonapps_workfindr2`.jobs(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`questions` (
  id                INT             PRIMARY KEY AUTO_INCREMENT,
  title_en          VARCHAR(255)    NOT NULL,
  question_en       VARCHAR(255)    NOT NULL,
  jobs_column       ENUM(
    'teamwork', 'physical_activity', 'creativity', 'driving', 'travel',
    'hours_flexibility', 'care_work', 'danger')     NOT NULL
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`options` (
  option_number     INT             NOT NULL,
  question_id       INT             NOT NULL,
  label_en          VARCHAR(255)    NOT NULL,
  min               INT             NOT NULL,
  max               INT             NOT NULL,

  PRIMARY KEY (option_number, question_id),
  FOREIGN KEY (question_id) REFERENCES `pontoonapps_workfindr2`.questions(id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pontoonapps_workfindr2`.`answers` (
  user_id           INT             NOT NULL,
  question_id       INT             NOT NULL,
  option_number     INT             NOT NULL,
  time_stamp        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, question_id),
  FOREIGN KEY (user_id) REFERENCES `pontoonapps_jobseeker`.users(id),
  FOREIGN KEY (option_number, question_id) REFERENCES `pontoonapps_workfindr2`.options(option_number, question_id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
