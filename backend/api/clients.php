<?php
require_once '../config/cors.php';
require_once '../config/db.php';
require_once '../config/session_check.php';

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

    // Total invoices
$stmt = $pdo->prepare("
    SELECT COUNT(*) AS total_invoices
    FROM invoices
    WHERE client_id = ?
    AND user_id = ?
");

$stmt->execute([$id, $user_id]);

$client['total_invoices'] =
    $stmt->fetch()['total_invoices'];


// Pending amount
$stmt = $pdo->prepare("
    SELECT IFNULL(SUM(total), 0) AS pending_amount
    FROM invoices
    WHERE client_id = ?
    AND user_id = ?
    AND status != 'Paid'
");

$stmt->execute([$id, $user_id]);

$client['pending_amount'] =
    $stmt->fetch()['pending_amount'];


// Revenue generated
$stmt = $pdo->prepare("
    SELECT IFNULL(SUM(total), 0) AS revenue_generated
    FROM invoices
    WHERE client_id = ?
    AND user_id = ?
    AND status = 'Paid'
");

$stmt->execute([$id, $user_id]);

$client['revenue_generated'] =
    $stmt->fetch()['revenue_generated'];
    
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

    if (!$name || !$email || !$phone || !$address || !$company) {

        http_response_code(400);

        echo json_encode([
            "error" => "All fields are required."
        ]);

        exit();
    }

    // Check duplicate email
    $stmt = $pdo->prepare(
        "SELECT id
         FROM clients
         WHERE email = ?
         AND user_id = ?"
    );

    $stmt->execute([
        $email,
        $user_id
    ]);

    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "error" => "Client with this email already exists."
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

    if (!$name || !$email || !$phone || !$address || !$company) {

        http_response_code(400);

        echo json_encode([
            "error" => "All fields are required."
        ]);

        exit();
    }

    // Check duplicate email excluding current client
    $stmt = $pdo->prepare(
        "SELECT id
         FROM clients
         WHERE email = ?
         AND user_id = ?
         AND id != ?"
    );

    $stmt->execute([
        $email,
        $user_id,
        $id
    ]);

    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "error" => "Client with this email already exists."
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

// elseif ($method === 'DELETE' && $id) {

//     $stmt = $pdo->prepare(
//         "DELETE FROM clients
//          WHERE id = ? AND user_id = ?"
//     );

//     $stmt->execute([$id, $user_id]);

//     echo json_encode([
//         "message" => "Client deleted successfully."
//     ]);
// }
elseif ($method === 'DELETE' && $id) {

    // Check if client has invoices
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS invoice_count
         FROM invoices
         WHERE client_id = ?
         AND user_id = ?"
    );

    $stmt->execute([
        $id,
        $user_id
    ]);

    $result = $stmt->fetch();

    if ($result['invoice_count'] > 0) {

        http_response_code(400);

        echo json_encode([
            "error" => "Cannot delete client because invoices exist for this client."
        ]);

        exit();
    }

    $stmt = $pdo->prepare(
        "DELETE FROM clients
         WHERE id = ? AND user_id = ?"
    );

    $stmt->execute([
        $id,
        $user_id
    ]);

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