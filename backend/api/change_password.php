<?php

require_once '../config/db.php';

require_once '../config/session_check.php';

$user_id = $_SESSION['user_id'];

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$current_password =
    $data['current_password'] ?? '';

$new_password =
    $data['new_password'] ?? '';

$confirm_password =
    $data['confirm_password'] ?? '';

if (
    !$current_password ||
    !$new_password ||
    !$confirm_password
) {

    http_response_code(400);

    echo json_encode([
        "error" => "All fields are required."
    ]);

    exit();
}

if ($new_password !== $confirm_password) {

    http_response_code(400);

    echo json_encode([
        "error" => "Passwords do not match."
    ]);

    exit();
}

if (
    strlen($new_password) < 8 ||
    !preg_match('/[A-Z]/', $new_password) ||
    !preg_match('/[a-z]/', $new_password) ||
    !preg_match('/[0-9]/', $new_password)
) {

    http_response_code(400);

    echo json_encode([
        "error" =>
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
    ]);

    exit();
}

$stmt = $pdo->prepare(
    "SELECT password
     FROM users
     WHERE id = ?"
);

$stmt->execute([$user_id]);

$user = $stmt->fetch();

if (
    !$user ||
    !password_verify(
        $current_password,
        $user['password']
    )
) {

    http_response_code(401);

    echo json_encode([
        "error" => "Current password is incorrect."
    ]);

    exit();
}

$hashed_password = password_hash(
    $new_password,
    PASSWORD_BCRYPT
);

$stmt = $pdo->prepare(
    "UPDATE users
     SET password = ?
     WHERE id = ?"
);

$stmt->execute([
    $hashed_password,
    $user_id
]);

echo json_encode([
    "message" => "Password updated successfully."
]);