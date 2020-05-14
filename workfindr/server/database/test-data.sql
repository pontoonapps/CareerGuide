INSERT INTO `pontoonapps_jobseeker`.`users`
( first_name )
VALUES
( 'jacek' ),
( 'kane' ),
( 'pontuz' ),
( 'passive' );

INSERT INTO `pontoonapps_workfindr2`.`categories`
( title_en, icon_filename )
VALUES
( 'jokes', 'jokes.png' ),
( 'witze', 'jokes.jpg' );

INSERT INTO `pontoonapps_workfindr2`.`jobs`
( title_en, description_en, titre_fr, description_fr, category_id,
  teamwork, physical_activity, creativity, driving, travel, hours_flexibility, care_work, danger )
VALUES
( 'joker', 'here be jokes', 'ne parles', 'francaise', 1,
  1, 2, 3, 1, 5, 6, 7, 8 ),
( 'sadder', 'here be sadness', 'ne parles', 'francaise', 1,
  2, 3, 4, 2, 6, 7, 8, 9 ),
( 'witzmacher', 'da ists lustig', 'ne parles', 'francaise', 2,
  1, 1, 1, 2, 1, 1, 1, 1 ),
( 'doofer', 'dummer', 'ne parles', 'francaise', 2,
  9, 9, 9, 1, 9, 9, 9, 9 );

INSERT INTO `pontoonapps_workfindr2`.`likes`
( user_id, job_id, type )
VALUES
( 1, 1, 'like' ),
( 1, 2, 'dislike' ),
( 1, 3, 'like' ),
( 2, 3, 'like' ),
( 2, 4, 'dislike' ),
( 3, 4, 'dislike' );

INSERT INTO `pontoonapps_workfindr2`.`shortlists`
( user_id, job_id )
VALUES
( 1, 1 ),
( 2, 3 ),
( 3, 2 ),
( 3, 1 );


INSERT INTO `pontoonapps_workfindr2`.`questions`
( title_en, question_en, jobs_column )
VALUES
( 'presence', 'you here?', 'teamwork' ),
( 'engagement', 'you doing anything?', 'danger' );


INSERT INTO `pontoonapps_workfindr2`.`options`
( option_number, question_id, label_en, min, max )
VALUES
( 1, 1, 'yes', 1, 3 ),
( 2, 1, 'mebbe', 2, 4 ),
( 3, 1, 'nope', 3, 5 ),
( 1, 2, 'yes-ish', 4, 6 ),
( 2, 2, 'mebbe-ish', 5, 7 ),
( 3, 2, 'nope-ish', 6, 8 );

INSERT INTO `pontoonapps_workfindr2`.`answers`
( user_id, question_id, option_number )
VALUES
( 1, 1, 1 ),
( 1, 2, 2 ),
( 2, 1, 3 ),
( 3, 2, 1 );
