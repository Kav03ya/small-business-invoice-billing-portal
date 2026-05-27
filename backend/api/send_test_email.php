<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../phpmailer/Exception.php';
require '../phpmailer/PHPMailer.php';
require '../phpmailer/SMTP.php';

$mail = new PHPMailer(true);

try {

    // SMTP Settings
    $mail->isSMTP();

    $mail->Host = 'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username = 'smallbiz.invoice.portal@gmail.com';

    $mail->Password = 'wgadsouipqmgvhpi';

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = 587;

    // Sender
    $mail->setFrom(
        'smallbiz.invoice.portal@gmail.com',
        'Invoice Portal'
    );

    // Receiver
    $mail->addAddress(
        'kavyaguru16@gmail.com'
    );

    // Email Content
    $mail->isHTML(true);

    $mail->Subject = 'Invoice Portal Test Email';

    $mail->Body = '
        <h2>Invoice Portal Email Test</h2>

        <p>
            PHPMailer integration is working successfully.
        </p>
    ';

    $mail->send();

    echo 'Email sent successfully';

} catch (Exception $e) {

    echo 'Mailer Error: ' . $mail->ErrorInfo;
}
?>