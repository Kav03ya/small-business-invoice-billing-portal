<?php

require_once '../config/db.php';

session_start();

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        "error" => "Unauthorized. Please login."
    ]);

    exit();
}

$user_id = $_SESSION['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

$id = $_GET['id'] ?? null;

if ($method === 'GET' && !$id) {

    $stmt = $pdo->prepare(
        "SELECT * FROM clients
         WHERE user_id = ?
         ORDER BY created_at DESC"
    );

    $stmt->execute([$user_id]);

    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare(
        "SELECT * FROM clients
         WHERE id = ? AND user_id = ?"
    );

    $stmt->execute([$id, $user_id]);

    $client = $stmt->fetch();

    if (!$client) {

        http_response_code(404);

        echo json_encode([
            "error" => "Client not found."
        ]);

        exit();
    }

    echo json_encode($client);
}

elseif ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $address = trim($data['address'] ?? '');
    $company = trim($data['company'] ?? '');

    if (!$name) {

        http_response_code(400);

        echo json_encode([
            "error" => "Client name is required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare(
        "INSERT INTO clients
        (user_id, name, email, phone, address, company)
        VALUES (?, ?, ?, ?, ?, ?)"
    );

    $stmt->execute([
        $user_id,
        $name,
        $email,
        $phone,
        $address,
        $company
    ]);

    echo json_encode([
        "message" => "Client created!",
        "id" => $pdo->lastInsertId()
    ]);
}

elseif ($method === 'PUT' && $id) {

    $data = json_decode(file_get_contents("php://input"), true);

    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $address = trim($data['address'] ?? '');
    $company = trim($data['company'] ?? '');

    if (!$name) {

        http_response_code(400);

        echo json_encode([
            "error" => "Client name is required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare(
        "UPDATE clients
         SET name=?, email=?, phone=?, address=?, company=?
         WHERE id=? AND user_id=?"
    );

    $stmt->execute([
        $name,
        $email,
        $phone,
        $address,
        $company,
        $id,
        $user_id
    ]);

    echo json_encode([
        "message" => "Client updated successfully."
    ]);
}

elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare(
        "DELETE FROM clients
         WHERE id = ? AND user_id = ?"
    );

    $stmt->execute([$id, $user_id]);

    echo json_encode([
        "message" => "Client deleted successfully."
    ]);
}

else {

    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed."
    ]);
}

?>