INSERT INTO `pontoonapps_careerguide`.`questions`
  (id, title_en, title_fr, question_en, question_fr, jobs_column)
VALUES
  (1, 'Teamwork', 'Travail en équipe', 'Would you prefer to work alone or in a team?', 'Préférez-vous travailler tout(e) seul(e) ou en équipe ?', 'teamwork'),
  (2, 'Activity', 'Activité physique', 'Are you looking for physical work?', 'Souhaitez-vous faire des activités physiques ?', 'physical_activity'),
  (3, 'Creative/Scientific', 'Créatif/Scientifique', 'Would you like a career in the creative industries', 'Aimeriez-vous faire carrière dans les métiers créatifs ?', 'creativity'),
  (4, 'Driving', 'Conduire', 'Would you like to do a job where you are required to drive?', 'Aimeriez-vous avoir un travail où vous êtes amené(e) à conduire ?', 'driving'),
  (5, 'Travelling', 'Voyager', 'Would you prefer to travel while working?', 'Aimeriez-vous voyager pour votre travail ?', 'travel'),
  (6, 'Working Hours', 'Horaires de travail', 'What type of working hours are you looking for?', 'Quel type d\'horaires de travail aimeriez-vous avoir ?', 'hours_flexibility'),
  (7, 'Care work', 'Services à la personne', 'Are you willing to work in care? (looking after the elderly/children etc...)', 'Aimeriez-vous travailler dans le secteur des services à la personne ?', 'care_work'),
  (8, 'Risks', 'Risques', 'Are you willing to work Dangerous Jobs?', 'Accepteriez-vous de faire un travail dangereux ?', 'danger');



INSERT INTO `pontoonapps_careerguide`.`options`
  (option_number, question_id, label_en, label_fr, min, max)
VALUES
  (1, 1, 'Alone', 'Tout(e) seul(e)', 1, 3),
  (2, 1, 'I don''t mind', 'Peu importe', 1, 9),
  (3, 1, 'In a team', 'Dans une équipe', 4, 9),

  (1, 2, 'No', 'Non', 5, 9),
  (2, 2, 'I don''t mind', 'Cela ne me dérange pas', 1, 9),
  (3, 2, 'Yes', 'Oui', 1, 4),

  (1, 3, 'No', 'Non', 6, 9),
  (2, 3, 'I don''t mind', 'Cela ne me dérange pas', 1, 9),
  (3, 3, 'Yes', 'Oui', 1, 5),

  (1, 4, 'No', 'Non', 1, 1),
  (2, 4, 'Willing to drive', 'Cela ne me dérange pas', 1, 2),
  (3, 4, 'Yes', 'Oui', 1, 2),

  (1, 5, 'No', 'Non', 1, 2),
  (2, 5, 'Occasionally', 'Occasionnellement', 3, 5),
  (3, 5, 'Yes', 'Oui', 6, 9),

  (1, 6, 'Flexible', 'Flexibles', 6, 9),
  (2, 6, 'I don''t mind', 'Peu importe', 1, 9),
  (3, 6, 'Fixed', 'Fixes', 1, 5),

  (1, 7, 'No', 'Non', 5, 9),
  (2, 7, 'I don''t mind', 'Cela ne me dérange pas', 1, 9),
  (3, 7, 'Yes', 'Oui', 1, 5),

  (1, 8, 'No', 'Non', 7, 9),
  (2, 8, 'To an extent', 'Jusqu\'à un certain point', 4, 9),
  (3, 8, 'Yes', 'Oui', 1, 9);
