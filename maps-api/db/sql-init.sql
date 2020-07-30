CREATE TABLE user_map_pins_v2 (
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


CREATE TABLE training_centre_map_pins_v2 (
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

CREATE TABLE training_centre_assignments (
  user_id            INT             NOT NULL,
  training_centre_id INT             NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (training_centre_id) REFERENCES recruiters(id),
  PRIMARY KEY (user_id, training_centre_id)
);
