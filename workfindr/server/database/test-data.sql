INSERT INTO `pontoonapps_jobseeker`.`users`
( id, first_name )
VALUES
( 1, 'jacek' ),
( 2, 'kane' ),
( 3, 'pontuz' ),
( 4, 'test4' ),
( 5, 'test5' ),
( 6, 'test6' ),
( 7, 'test7' ),
( 8, 'test8' ),
( 9, 'test9' ),
(10, 'passive' );

-- jobs and categories are in data.sql,
-- only jobs 1,2,3,4 are used in this test data

INSERT INTO `pontoonapps_workfindr2`.`likes`
( user_id, job_id, type )
VALUES
( 1, 1, 'like' ),
( 1, 2, 'show later' ),
( 1, 3, 'dislike' ),
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
( id, title_en, question_en, jobs_column )
VALUES
( 1, 'presence', 'you here?', 'teamwork' ),
( 2, 'engagement', 'you doing anything?', 'danger' );


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
