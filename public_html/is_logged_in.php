<?php require_once('private/initialize.php');

header('Content-Type: application/json');
echo json_encode(is_user_logged_in());
