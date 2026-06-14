<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
//header("Access-Control-Allow-Origin: https://small-business-invoice-billing-port.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// session_start();

// if (!isset($_SESSION['user_id'])) {

//     echo json_encode([
//         "error" => "Unauthorized"
//     ]);

//     exit;
// }
require_once '../config/db.php';
require_once '../config/session_check.php';

$user_id = $_SESSION['user_id'];

//Adding this for better revenue dispay (last 30 dyas, 6 months, 1 year)
$period = $_GET['period'] ?? '6months';

switch ($period) {

    case '30days':
        $interval = '30 DAY';
        break;

    case '12months':
        $interval = '12 MONTH';
        break;

    default:
        $interval = '6 MONTH';
}

try {

    // Total Revenue
    // $stmt = $pdo->prepare("
    //     SELECT IFNULL(SUM(total), 0) AS revenue
    //     FROM invoices
    //     WHERE user_id = ?
    //     AND status = 'Paid'
    // ");

    //Revernue (last 30 days/ 6 months/ 1 year)
    // Revenue Collected

$stmt = $pdo->prepare("
    SELECT IFNULL(SUM(p.amount), 0) AS revenue
    FROM payments p
    JOIN invoices i
        ON p.invoice_id = i.id
    WHERE i.user_id = ?
    AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL $interval)
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
    
    //Below code block added for monthly revenue line chart
    // Monthly Revenue Trend (Last 6 Months)
    
$stmt = $pdo->prepare("
    SELECT
        DATE_FORMAT(payment_date, '%b %Y') AS month,
        SUM(amount) AS revenue
    FROM payments p
    JOIN invoices i
        ON p.invoice_id = i.id
    WHERE i.user_id = ?
    AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY YEAR(payment_date), MONTH(payment_date)
    ORDER BY YEAR(payment_date), MONTH(payment_date)
");

$stmt->execute([$user_id]);

$monthlyRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

    // Top Clients by Revenue
$stmt = $pdo->prepare("
    SELECT
        c.name,
        c.company,
        IFNULL(SUM(p.amount), 0) AS revenue
    FROM clients c
    JOIN invoices i
        ON c.id = i.client_id
    JOIN payments p
        ON i.id = p.invoice_id
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY revenue DESC
    LIMIT 5
");

$stmt->execute([$user_id]);

$topClients = $stmt->fetchAll();
    echo json_encode([

        "revenue" => $revenue['revenue'],

        "pending" => $pending['pending'],

        "overdue_count" => $overdue['overdue_count'],

        // "total_clients" => $clients['total_clients'],
        //Below two lines added for monthly revenue line chart
        "total_clients" => $clients['total_clients'],

        "monthly_revenue" => $monthlyRevenue,

        "recent_invoices" => $recentInvoices,

        "top_clients" => $topClients
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
?>