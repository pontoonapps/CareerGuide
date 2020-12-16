USE pontoonapps_careerguide;
ALTER TABLE jobs CHANGE titre_fr title_fr VARCHAR(255);
ALTER TABLE categories ADD COLUMN title_fr VARCHAR(255) AFTER title_en;
ALTER TABLE options ADD COLUMN label_fr VARCHAR(255) NOT NULL AFTER label_en;
ALTER TABLE questions ADD COLUMN title_fr VARCHAR(255) NOT NULL AFTER title_en;
ALTER TABLE questions ADD COLUMN question_fr TEXT NOT NULL AFTER question_en;
