-- pontoonapps_careerguide.categories
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Agriculture, horticulture et services auprès des animaux' WHERE id=1;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Gestion des biens et des installations' WHERE id=2;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Services financiers' WHERE id=3;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Arts du spectacle et médias' WHERE id=4;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Santé et protection sociale' WHERE id=5;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Administratif' WHERE id=6;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Publicité, marketing et relations publiques' WHERE id=7;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Fabrication et ingénierie' WHERE id=8;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Sciences de l\'environnement' WHERE id=9;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Transport et logistique' WHERE id=10;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Arts, artisanat et design' WHERE id=11;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Vente au détail et service à la clientèle' WHERE id=12;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Services juridiques' WHERE id=13;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Science et recherche' WHERE id=14;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Métiers de l\'uniforme et de la sécurité' WHERE id=15;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Sport, loisirs et tourisme' WHERE id=16;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Services sociaux et à la personne' WHERE id=17;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Services de restauration' WHERE id=18;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Gestion et planification organisationnelle' WHERE id=19;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Édition et journalisme' WHERE id=20;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Technologie de l\'information et gestion de l\'information' WHERE id=21;
UPDATE `pontoonapps_careerguide`.`categories` SET title_fr='Éducation et formation' WHERE id=22;


-- pontoonapps_careerguide.options
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Tout(e) seul(e)' WHERE question_id=1 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Peu importe' WHERE question_id=1 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Dans une équipe' WHERE question_id=1 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Non' WHERE question_id=2 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Cela ne me dérange pas' WHERE question_id=2 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Oui' WHERE question_id=2 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Non' WHERE question_id=3 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Cela ne me dérange pas' WHERE question_id=3 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Oui' WHERE question_id=3 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Non' WHERE question_id=4 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Cela ne me dérange pas' WHERE question_id=4 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Oui' WHERE question_id=4 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Non' WHERE question_id=5 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Occasionnellement' WHERE question_id=5 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Oui' WHERE question_id=5 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Flexibles' WHERE question_id=6 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Peu importe' WHERE question_id=6 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Fixes' WHERE question_id=6 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Non' WHERE question_id=7 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Cela ne me dérange pas' WHERE question_id=7 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Oui' WHERE question_id=7 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Non' WHERE question_id=8 AND option_number=1;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Jusqu\'à un certain point' WHERE question_id=8 AND option_number=2;
UPDATE `pontoonapps_careerguide`.`options` SET label_fr='Oui' WHERE question_id=8 AND option_number=3;

UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Travail en équipe', question_fr='Préférez-vous travailler tout(e) seul(e) ou en équipe ?' WHERE id=1;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Activité physique', question_fr='Souhaitez-vous faire des activités physiques ?' WHERE id=2;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Créatif/Scientifique', question_fr='Aimeriez-vous faire carrière dans les métiers créatifs ?' WHERE id=3;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Conduire', question_fr='Aimeriez-vous avoir un travail où vous êtes amené(e) à conduire ?' WHERE id=4;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Voyager', question_fr='Aimeriez-vous voyager pour votre travail ?' WHERE id=5;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Horaires de travail', question_fr='Quel type d\'horaires de travail aimeriez-vous avoir ?' WHERE id=6;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Services à la personne', question_fr='Aimeriez-vous travailler dans le secteur des services à la personne ?' WHERE id=7;
UPDATE `pontoonapps_careerguide`.`questions` SET title_fr='Risques', question_fr='Accepteriez-vous de faire un travail dangereux ?' WHERE id=8;
