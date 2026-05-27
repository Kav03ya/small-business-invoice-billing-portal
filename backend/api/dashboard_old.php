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

$stmt = $pdo->prepare(
    "
    SELECT COALESCE(SUM(total), 0) as total
    FROM invoices
    WHERE user_id=? AND status='Paid'
    "
);

$stmt->execute([$user_id]);

$revenue = $stmt->fetch()['total'];

$stmt = $pdo->prepare(
    "
    SELECT COALESCE(SUM(total), 0) as total
    FROM invoices
    WHERE user_id=? AND status='Sent'
    "
);

$stmt->execute([$user_id]);

$pending = $stmt->fetch()['total'];

$stmt = $pdo->prepare(
    "
    SELECT COUNT(*) as count
    FROM invoices
    WHERE user_id=? AND status='Overdue'
    "
);

$stmt->execute([$user_id]);

$overdue = $stmt->fetch()['count'];

$stmt = $pdo->prepare(
    "
    SELECT COUNT(*) as count
    FROM clients
    WHERE user_id=?
    "
);

$stmt->execute([$user_id]);

$clients = $stmt->fetch()['count'];

$stmt = $pdo->prepare(
    "
    SELECT
        i.id,
        i.invoice_number,
        i.total,
        i.status,
        i.due_date,
        c.name as client_name
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
    LIMIT 5
    "
);

$stmt->execute([$user_id]);

$recent = $stmt->fetchAll();

echo json_encode([
    "revenue" => $revenue,
    "pending" => $pending,
    "overdue_count" => $overdue,
    "total_clients" => $clients,
    "recent_invoices" => $recent
]);

?>