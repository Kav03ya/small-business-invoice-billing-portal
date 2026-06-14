<?php

session_start();

$timeout = 1800; // 30 minutes

if (
    isset($_SESSION['last_activity']) &&
    (time() - $_SESSION['last_activity']) > $timeout
) {

    session_unset();

    session_destroy();

    http_response_code(401);

    echo json_encode([
        "error" => "Session expired. Please login again."
    ]);

    exit;
}

$_SESSION['last_activity'] = time();

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        "error" => "Unauthorized"
    ]);

    exit;
}