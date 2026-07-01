<?php
require_once '../config/cors.php';
require_once '../config/db.php';

// session_start();

// if (!isset($_SESSION['user_id'])) {

//     http_response_code(401);

//     echo json_encode([
//         "error" => "Unauthorized."
//     ]);

//     exit();
// }
require_once '../config/session_check.php';

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
    // Prevent future payment dates
    if ($payment_date > date('Y-m-d')) {
        http_response_code(400);
        echo json_encode([
            "error" => "Payment date cannot be in the future."
        ]);
    exit();
}

    $method_pay = $data['method'] ?? 'Cash';

    $note = $data['note'] ?? '';

    if (!$invoice_id || !$amount) {

        http_response_code(400);

        echo json_encode([
            "error" => "Invoice ID and amount are required."
        ]);

        exit();
    }
    // Check if invoice is already fully paid
$stmt = $pdo->prepare(
    "SELECT status
     FROM invoices
     WHERE id = ? AND user_id = ?"
);

$stmt->execute([
    $invoice_id,
    $user_id
]);

$invoiceStatus = $stmt->fetch();

if ($invoiceStatus && $invoiceStatus['status'] === 'Paid') {

    http_response_code(400);

    echo json_encode([
        "error" => "This invoice has already been fully paid."
    ]);

    exit();
}

//ADDING THIS NEW
// Get invoice total
$stmtTotal = $pdo->prepare(
"
SELECT total
FROM invoices
WHERE id = ? AND user_id = ?
"
);

$stmtTotal->execute([
    $invoice_id,
    $user_id
]);

$invoice = $stmtTotal->fetch();


// Get amount already paid
$stmtPaid = $pdo->prepare(
"
SELECT COALESCE(SUM(amount),0) AS paid
FROM payments
WHERE invoice_id = ?
"
);

$stmtPaid->execute([
    $invoice_id
]);

$totalPaid = $stmtPaid->fetch()['paid'];


// Prevent overpayment
if (($totalPaid + $amount) > $invoice['total']) {

    $remaining =
        $invoice['total'] - $totalPaid;

    http_response_code(400);

    echo json_encode([
        "error" =>
            "Payment exceeds remaining balance. Remaining amount: ₹" .
            number_format($remaining, 2)
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