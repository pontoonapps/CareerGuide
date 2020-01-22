CREATE TABLE map_pins (
  user_id         INT             NOT NULL,
  name            VARCHAR(40)     NOT NULL,
  category        INT,
  description     VARCHAR(255),
  phone           VARCHAR(25),
  website         VARCHAR(255),
  email           VARCHAR(255),
  address_line_1  VARCHAR(255),
  address_line_2  VARCHAR(255),
  postcode        VARCHAR(12),
  latitude        DOUBLE,
  longitude       DOUBLE,
  notes           VARCHAR(255),
  PRIMARY KEY (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
