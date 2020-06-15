INSERT INTO `pontoonapps_workfindr2`.`questions`
( id, title_en, question_en, jobs_column )
VALUES
( 1, 'Teamwork', 'Would you prefer to work alone or in a team?', 'teamwork' ),
( 2, 'Activity', 'Are you looking for physical work?', 'physical_activity' ),
( 3, 'Creative/Scientific', 'Would you like a career in the creative industries', 'creativity' ),
( 4, 'Driving', 'Would you like to do a job where you are required to drive?', 'driving' ),
( 5, 'Travelling', 'Would you prefer to travel while working?', 'travel' ),
( 6, 'Working Hours', 'What type of working hours are you looking for?', 'hours_flexibility' ),
( 7, 'Care work', 'Are you willing to work in care? (looking after the elderly/children etc...)', 'care_work'),
( 8, 'Risks', 'Are you willing to work Dangerous Jobs?', 'danger');



INSERT INTO `pontoonapps_workfindr2`.`options`
( option_number, question_id, label_en, min, max )
VALUES
( 1, 1, 'Alone', 1, 3 ),
( 2, 1, 'I don''t mind', 1, 9 ),
( 3, 1, 'In a Team', 4, 9 ),

( 1, 2, 'No', 5, 9 ),
( 2, 2, 'I don''t mind', 1, 9 ),
( 3, 2, 'Yes', 1, 4 ),

( 1, 3, 'No', 6, 9 ),
( 2, 3, 'I don''t mind', 1, 9 ),
( 3, 3, 'Yes', 1, 5 ),

( 1, 4, 'No', 1, 1 ),
( 2, 4, 'Willing to drive', 1, 2 ),
( 3, 4, 'Yes', 1, 2 ),

( 1, 5, 'No', 1, 2 ),
( 2, 5, 'Occasionally', 3, 5 ),
( 3, 5, 'Yes', 6, 9 ),

( 1, 6, 'Flexible', 6, 9 ),
( 2, 6, 'I don''t mind', 1, 9 ),
( 3, 6, 'Fixed', 1, 5 ),

( 1, 7, 'No', 5, 9 ),
( 2, 7, 'I don''t mind', 1, 9 ),
( 3, 7, 'Yes', 1, 5 ),

( 1, 8, 'No', 7, 9 ),
( 2, 8, 'To an extent', 4, 9 ),
( 3, 8, 'Yes', 1, 9 );
