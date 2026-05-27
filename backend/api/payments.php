<?php

require_once '../config/db.php';

session_start();

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        "error" => "Unauthorized."
    ]);

    exit();
}

$user_id = $_SESSION['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

$invoice_id = $_GET['invoice_id'] ?? null;

if ($method === 'GET' && $invoice_id) {

    $stmt = $pdo->prepare(
        "
        SELECT *
        FROM payments
        WHERE invoice_id = ?
        ORDER BY payment_date DESC
        "
    );

    $stmt->execute([$invoice_id]);

    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $invoice_id = $data['invoice_id'] ?? null;

    $amount = $data['amount'] ?? 0;

    $payment_date = $data['payment_date'] ?? date('Y-m-d');

    $method_pay = $data['method'] ?? 'Cash';

    $note = $data['note'] ?? '';

    if (!$invoice_id || !$amount) {

        http_response_code(400);

        echo json_encode([
            "error" => "Invoice ID and amount are required."
        ]);

        exit();
    }

    $stmt = $pdo->prepare(
        "
        INSERT INTO payments
        (
            invoice_id,
            amount,
            payment_date,
            method,
            note
        )
        VALUES (?, ?, ?, ?, ?)
        "
    );

    $stmt->execute([
        $invoice_id,
        $amount,
        $payment_date,
        $method_pay,
        $note
    ]);

    $stmt2 = $pdo->prepare(
        "
        SELECT total
        FROM invoices
        WHERE id = ? AND user_id = ?
        "
    );

    $stmt2->execute([
        $invoice_id,
        $user_id
    ]);

    $invoice = $stmt2->fetch();

    $stmt3 = $pdo->prepare(
        "
        SELECT COALESCE(SUM(amount), 0) as paid
        FROM payments
        WHERE invoice_id = ?
        "
    );

    $stmt3->execute([$invoice_id]);

    $total_paid = $stmt3->fetch()['paid'];

    if ($total_paid >= $invoice['total']) {

        $stmt4 = $pdo->prepare(
            "
            UPDATE invoices
            SET status='Paid'
            WHERE id=?
            "
        );

        $stmt4->execute([$invoice_id]);
    }

    echo json_encode([
        "message" => "Payment recorded successfully!"
    ]);
}

else {

    http_response_code(405);

    echo json_encode([
        "error" => "Method not allowed."
    ]);
}

?>