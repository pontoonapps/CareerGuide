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

INSERT INTO `pontoonapps_careerguide`.`likes`
( user_id, job_id, type )
VALUES
( 1, 1, 'like' ),
( 1, 2, 'show later' ),
( 1, 3, 'dislike' ),
( 2, 3, 'like' ),
( 2, 4, 'dislike' ),
( 3, 4, 'dislike' );

INSERT INTO `pontoonapps_careerguide`.`shortlists`
( user_id, job_id )
VALUES
( 1, 1 ),
( 2, 3 ),
( 3, 2 ),
( 3, 1 );