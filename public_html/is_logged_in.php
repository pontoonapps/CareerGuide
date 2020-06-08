<?php
require_once('private/initialize.php');

$isLoggedIn = is_user_logged_in() || is_logged_in() || is_recruiter_logged_in();

$retval = (object) [
    'logged_in' => $isLoggedIn,
];

if ($isLoggedIn) {
  $adminId = $_SESSION['admin_id'];
  if ($adminId) $retval->admin_id = $adminId;

  $userId = $_SESSION['user_id'];
  if ($userId) $retval->user_id = $userId;

  $recruiterId = $_SESSION['recruiter_id'];
  if ($recruiterId) $retval->recruiter_id = $recruiterId;
}

header('Content-Type: application/json');
echo json_encode($retval);
