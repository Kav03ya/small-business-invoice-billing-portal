<?php
// header("Access-Control-Allow-Origin: https://small-business-invoice-billing-port.vercel.app");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");

// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit();
// }
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Credentials: true");
require_once '../config/cors.php';
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'register') {

    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $business_name = trim($data['business_name'] ?? '');

    //Strong Password Policy
    if (
    strlen($password) < 8 ||
    !preg_match('/[A-Z]/', $password) ||
    !preg_match('/[a-z]/', $password) ||
    !preg_match('/[0-9]/', $password)
) {

    http_response_code(400);

    echo json_encode([
        "error" =>
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
    ]);

    exit();
}
    if (!$name || !$email || !$password) {

        http_response_code(400);

        echo json_encode([
            "error" => "Name, email and password are required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");

    $stmt->execute([$email]);

    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "error" => "Email already registered."
        ]);

        exit();
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        "INSERT INTO users (name, email, password, business_name)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->execute([
        $name,
        $email,
        $hashed,
        $business_name
    ]);

    echo json_encode([
        "message" => "Registration successful!",
        "user_id" => $pdo->lastInsertId()
    ]);
}

elseif ($method === 'POST' && $action === 'login') {

    session_start();

    $data = json_decode(file_get_contents("php://input"), true);

    $email = trim($data['email'] ?? '');

    $password = $data['password'] ?? '';

    if (!$email || !$password) {

        http_response_code(400);

        echo json_encode([
            "error" => "Email and password are required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");

    $stmt->execute([$email]);

    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {

        http_response_code(401);

        echo json_encode([
            "error" => "Invalid email or password."
        ]);

        exit();
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['last_activity'] = time();
    
    unset($user['password']);

    echo json_encode([
        "message" => "Login successful!",
        "user" => $user
    ]);
}

elseif ($method === 'POST' && $action === 'logout') {

    session_start();

    session_destroy();

    echo json_encode([
        "message" => "Logged out successfully."
    ]);
}

else {

    http_response_code(404);

    echo json_encode([
        "error" => "Invalid endpoint."
    ]);
}

?>