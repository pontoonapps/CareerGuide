<?php
require_once('private/initialize.php');

$isLoggedIn = is_user_logged_in();

$retval = (object) [
    'logged_in' => $isLoggedIn,
];

if ($isLoggedIn) {
  $userId = $_SESSION['user_id'];
  $retval->user_id = $userId;
}

header('Content-Type: application/json');
echo json_encode($retval);
