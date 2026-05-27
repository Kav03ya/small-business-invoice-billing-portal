<?php

// header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Origin: https://small-business-invoice-billing-port.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "error" => "Unauthorized"
    ]);

    exit;
}

$user_id = $_SESSION['user_id'];

try {

    // Total Revenue
    $stmt = $pdo->prepare("
        SELECT IFNULL(SUM(total), 0) AS revenue
        FROM invoices
        WHERE user_id = ?
        AND status = 'Paid'
    ");

    $stmt->execute([$user_id]);

    $revenue = $stmt->fetch();

    // Pending Amount
    $stmt = $pdo->prepare("
        SELECT IFNULL(SUM(total), 0) AS pending
        FROM invoices
        WHERE user_id = ?
        AND status != 'Paid'
    ");

    $stmt->execute([$user_id]);

    $pending = $stmt->fetch();

    // Automatic Overdue Invoice Count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS overdue_count
        FROM invoices
        WHERE user_id = ?
        AND due_date < CURDATE()
        AND status != 'Paid'
    ");

    $stmt->execute([$user_id]);

    $overdue = $stmt->fetch();

    // Total Clients
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS total_clients
        FROM clients
        WHERE user_id = ?
    ");

    $stmt->execute([$user_id]);

    $clients = $stmt->fetch();

    // Recent Invoices
    $stmt = $pdo->prepare("
        SELECT
            invoices.id,
            invoices.invoice_number,
            invoices.total,
            invoices.due_date,
            invoices.status,
            clients.name AS client_name
        FROM invoices
        JOIN clients
        ON invoices.client_id = clients.id
        WHERE invoices.user_id = ?
        ORDER BY invoices.created_at DESC
        LIMIT 5
    ");

    $stmt->execute([$user_id]);

    $recentInvoices = $stmt->fetchAll();

    echo json_encode([

        "revenue" => $revenue['revenue'],

        "pending" => $pending['pending'],

        "overdue_count" => $overdue['overdue_count'],

        "total_clients" => $clients['total_clients'],

        "recent_invoices" => $recentInvoices
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
?>