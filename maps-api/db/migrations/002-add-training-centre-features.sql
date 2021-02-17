CREATE TABLE training_centre_features (
  training_centre_id INT             NOT NULL,
  has_guest_account  BOOLEAN         NOT NULL DEFAULT 0,
  FOREIGN KEY (training_centre_id) REFERENCES recruiters(id),
  PRIMARY KEY (training_centre_id)
)
