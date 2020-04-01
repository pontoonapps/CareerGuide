CREATE TABLE user_map_pins (
  user_id            INT             NOT NULL,
  name               VARCHAR(40)     NOT NULL,
  category           INT,
  description        VARCHAR(255),
  phone              VARCHAR(25),
  website            VARCHAR(255),
  email              VARCHAR(255),
  address_line_1     VARCHAR(255),
  address_line_2     VARCHAR(255),
  postcode           VARCHAR(12),
  latitude           DOUBLE,
  longitude          DOUBLE,
  notes              VARCHAR(255),
  PRIMARY KEY (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE training_centre_map_pins (
  training_centre_id INT             NOT NULL,
  name               VARCHAR(40)     NOT NULL,
  category           INT,
  description        VARCHAR(255),
  phone              VARCHAR(25),
  website            VARCHAR(255),
  email              VARCHAR(255),
  address_line_1     VARCHAR(255),
  address_line_2     VARCHAR(255),
  postcode           VARCHAR(12),
  latitude           DOUBLE,
  longitude          DOUBLE,
  notes              VARCHAR(255),
  PRIMARY KEY (training_centre_id, name),
  FOREIGN KEY (training_centre_id) REFERENCES recruiters(id)
);

CREATE TABLE training_centre_assignments (
  user_id            INT             NOT NULL,
  training_centre_id INT             NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (training_centre_id) REFERENCES recruiters(id),
  PRIMARY KEY (user_id, training_centre_id)
);
