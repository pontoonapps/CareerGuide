-- community API v2 makes pins identified by ID, not by name unique to a user
-- this script migrates from an existing v1 database to v2

-- --------- tasks:
-- 1. rename original *_map_pins tables to v1_backup_*
-- 2. create new  *_map_pins tables
-- 3. copy backup map pins to the new tables


-- 1. rename original *_map_pins tables to v1_backup_*

ALTER TABLE user_map_pins RENAME TO v1_backup_user_map_pins;
ALTER TABLE training_centre_map_pins RENAME TO v1_backup_training_centre_map_pins;

-- 2. create new  *_map_pins tables

CREATE TABLE user_map_pins (
  id                 INT             AUTO_INCREMENT PRIMARY KEY,
  user_id            INT             NOT NULL,
  name               VARCHAR(255)    NOT NULL,
  latitude           DOUBLE          NOT NULL,
  longitude          DOUBLE          NOT NULL,
  category           INT,
  description        VARCHAR(255),
  phone              VARCHAR(25),
  website            VARCHAR(255),
  email              VARCHAR(255),
  address_line_1     VARCHAR(255),
  address_line_2     VARCHAR(255),
  postcode           VARCHAR(12),
  notes              VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE training_centre_map_pins (
  id                 INT             AUTO_INCREMENT PRIMARY KEY,
  training_centre_id INT             NOT NULL,
  name               VARCHAR(255)    NOT NULL,
  latitude           DOUBLE          NOT NULL,
  longitude          DOUBLE          NOT NULL,
  category           INT,
  description        VARCHAR(255),
  phone              VARCHAR(25),
  website            VARCHAR(255),
  email              VARCHAR(255),
  address_line_1     VARCHAR(255),
  address_line_2     VARCHAR(255),
  postcode           VARCHAR(12),
  notes              VARCHAR(255),
  FOREIGN KEY (training_centre_id) REFERENCES recruiters(id)
);


-- 3. copy map pins from backup to the new tables

INSERT INTO user_map_pins (
  user_id, name, latitude, longitude,
  category, description, phone, website,
  email, address_line_1, address_line_2,
  postcode, notes
)
SELECT
  user_id, name, latitude, longitude,
  category, description, phone, website,
  email, address_line_1, address_line_2,
  postcode, notes
FROM v1_backup_user_map_pins;

INSERT INTO training_centre_map_pins (
  user_id, name, latitude, longitude,
  category, description, phone, website,
  email, address_line_1, address_line_2,
  postcode, notes
)
SELECT
  user_id, name, latitude, longitude,
  category, description, phone, website,
  email, address_line_1, address_line_2,
  postcode, notes
FROM v1_backup_training_centre_map_pins;
