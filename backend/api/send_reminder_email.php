<?php

// header("Access-Control-Allow-Origin: http://localhost:3000");
// //header("Access-Control-Allow-Origin: https://small-business-invoice-billing-port.vercel.app");

// header("Access-Control-Allow-Credentials: true");

// header("Access-Control-Allow-Headers: Content-Type");

// header("Content-Type: application/json");

// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

//     header("Access-Control-Allow-Methods: POST, OPTIONS");

//     exit(0);
// }

// session_start();

// if (!isset($_SESSION['user_id'])) {

//     echo json_encode([
//         "error" => "Unauthorized"
//     ]);

//     exit;
// }
require_once '../config/cors.php';
require_once '../config/session_check.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../config/mail.php';
require '../phpmailer/Exception.php';
require '../phpmailer/PHPMailer.php';
require '../phpmailer/SMTP.php';

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$mail = new PHPMailer(true);

try {

    // SMTP Configuration
    $mail->isSMTP();

    $mail->Host = 'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username = MAIL_USERNAME;

    $mail->Password = MAIL_PASSWORD;

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = 587;

    // Sender
    $mail->setFrom(
        'smallbiz.invoice.portal@gmail.com',
        'Invoice Portal'
    );

    // Receiver
    $mail->addAddress($data['client_email']);

    // Email Content
    $mail->isHTML(true);

    $mail->Subject =
    'Payment Reminder - ' .
    $data['invoice_number'];

    $mail->Body = '

<h2>Payment Reminder</h2>

<p>
    Dear ' . $data['client_name'] . ',
</p>

<p>
    This is a friendly reminder that the following invoice is overdue.
</p>

<hr>

<p>
    <strong>Invoice Number:</strong>
    ' . $data['invoice_number'] . '
</p>

<p>
    <strong>Due Date:</strong>
    ' . $data['due_date'] . '
</p>

<p>
    <strong>Outstanding Amount:</strong>
    INR ' . $data['total'] . '
</p>

<p>
    We kindly request you to complete the payment at your earliest convenience.
</p>

<br>

<p>
    Regards,
    <br>
    Invoice Portal
</p>
';

    $mail->send();

    echo json_encode([
        "message" => "Email sent successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "error" => $mail->ErrorInfo,
        "exception" => $e->getMessage()
    ]);
}
?>