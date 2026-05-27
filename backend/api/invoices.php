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

    $status = $_GET['status'] ?? '';

    $query = "
        SELECT i.*, c.name as client_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        WHERE i.user_id = ?
    ";

    $params = [$user_id];

    if ($status) {

        $query .= " AND i.status = ?";

        $params[] = $status;
    }

    $query .= " ORDER BY i.created_at DESC";

    $stmt = $pdo->prepare($query);

    $stmt->execute($params);

    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare(
        "
        SELECT i.*, c.name as client_name, c.email as client_email
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        WHERE i.id = ? AND i.user_id = ?
        "
    );

    $stmt->execute([$id, $user_id]);

    $invoice = $stmt->fetch();

    if (!$invoice) {

        http_response_code(404);

        echo json_encode([
            "error" => "Invoice not found."
        ]);

        exit();
    }

    $stmt2 = $pdo->prepare(
        "SELECT * FROM invoice_items WHERE invoice_id = ?"
    );

    $stmt2->execute([$id]);

    $invoice['items'] = $stmt2->fetchAll();

    echo json_encode($invoice);
}

elseif ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $client_id = $data['client_id'] ?? null;

    $issue_date = $data['issue_date'] ?? '';

    $due_date = $data['due_date'] ?? '';

    $status = $data['status'] ?? 'Draft';

    $tax_rate = $data['tax_rate'] ?? 0;

    $notes = $data['notes'] ?? '';

    $items = $data['items'] ?? [];

    if (!$client_id || !$issue_date || !$due_date || empty($items)) {

        http_response_code(400);

        echo json_encode([
            "error" => "Client, dates, and at least one item are required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare(
        "SELECT COUNT(*) as count
         FROM invoices
         WHERE user_id = ?"
    );

    $stmt->execute([$user_id]);

    $count = $stmt->fetch()['count'] + 1;

    $invoice_number = "INV-" . str_pad($count, 4, "0", STR_PAD_LEFT);

    $subtotal = 0;

    foreach ($items as $item) {

        $subtotal +=
            ($item['quantity'] ?? 1)
            *
            ($item['unit_price'] ?? 0);
    }

    $total = $subtotal + ($subtotal * $tax_rate / 100);

    $stmt = $pdo->prepare(
        "
        INSERT INTO invoices
        (
            user_id,
            client_id,
            invoice_number,
            issue_date,
            due_date,
            status,
            subtotal,
            tax_rate,
            total,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "
    );

    $stmt->execute([
        $user_id,
        $client_id,
        $invoice_number,
        $issue_date,
        $due_date,
        $status,
        $subtotal,
        $tax_rate,
        $total,
        $notes
    ]);

    $invoice_id = $pdo->lastInsertId();

    foreach ($items as $item) {

        $item_subtotal =
            ($item['quantity'] ?? 1)
            *
            ($item['unit_price'] ?? 0);

        $stmt2 = $pdo->prepare(
            "
            INSERT INTO invoice_items
            (
                invoice_id,
                description,
                quantity,
                unit_price,
                subtotal
            )
            VALUES (?, ?, ?, ?, ?)
            "
        );

        $stmt2->execute([
            $invoice_id,
            $item['description'],
            $item['quantity'] ?? 1,
            $item['unit_price'] ?? 0,
            $item_subtotal
        ]);
    }

    echo json_encode([
        "message" => "Invoice created!",
        "id" => $invoice_id,
        "invoice_number" => $invoice_number,
        "total" => $total
    ]);
}

elseif ($method === 'PUT' && $id) {

    $data = json_decode(file_get_contents("php://input"), true);

    $status = $data['status'] ?? null;

    if (!$status) {

        http_response_code(400);

        echo json_encode([
            "error" => "Status is required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare(
        "UPDATE invoices
         SET status=?
         WHERE id=? AND user_id=?"
    );

    $stmt->execute([
        $status,
        $id,
        $user_id
    ]);

    echo json_encode([
        "message" => "Invoice updated successfully."
    ]);
}

elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare(
        "DELETE FROM invoices
         WHERE id = ? AND user_id = ?"
    );

    $stmt->execute([
        $id,
        $user_id
    ]);

    echo json_encode([
        "message" => "Invoice deleted successfully."
    ]);
}

else {

    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed."
    ]);
}

?>