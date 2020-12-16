USE pontoonapps_careerguide;
ALTER TABLE jobs CHANGE title_fr titre_fr VARCHAR(255);
ALTER TABLE categories DROP COLUMN title_fr;
ALTER TABLE options DROP COLUMN label_fr;
ALTER TABLE questions DROP COLUMN title_fr;
ALTER TABLE questions DROP COLUMN question_fr;
