<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$mail = new PHPMailer(true);

$post = !empty($_POST) ? $_POST : [];

$json = array();
$json['error'] = true;
$comment = '';

if(isset($post['type']) && !empty($post['type'])) {
    $json['error'] = false;
}

if($json['error'] === false) {
    $subject = 'Aplikacja ze strony Finespirits DrinkPlanner';
    $message = '';

    if(
        ($post['type'] === "contact_form")
    ) {
        if(
            (isset($post['type']) && !empty($post['type'])) &&
            (isset($post['contact_name']) && !empty($post['contact_name'])) &&
            (isset($post['contact_email']) && !empty($post['contact_email'])) &&
            (isset($post['contact_phone']) && !empty($post['contact_phone'])) &&
            (isset($post['contact_date']) && !empty($post['contact_date'])) &&
            (isset($post['contact_newsletter']))
        ) {
            $newsletter = $post['contact_newsletter'] == 1 ? "Tak" : "Nie";
            $message .= '<b>Forma:</b> Formularz kontaktowy<br>';
            $message .= '<b>Imię:</b> ' . htmlspecialchars($post['contact_name'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>E-mail:</b> ' . htmlspecialchars($post['contact_email'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>Data wydarzenia:</b> ' . htmlspecialchars($post['contact_date'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>Telefon:</b> ' . htmlspecialchars($post['contact_phone'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>Zapisz się na nasz newsletter:</b> ' . $newsletter . '<br>';

        } else {
            $json['error'] = false;
        }
    } else if(
        ($post['type'] === "calc_modal_form")
    ) {
        //echo json_encode($post);
        //exit();
        if(
            (isset($post['calc_email']) && !empty($post['calc_email'])) &&
            (isset($post['calc_data']) && !empty($post['calc_data'])) &&
            (isset($post['calc_data']['data']) && !empty($post['calc_data']['data'])) &&
            (isset($post['calc_data']['results']) && !empty($post['calc_data']['results'])) &&
            (isset($post['calc_data']['data']['calc_event']) && !empty($post['calc_data']['data']['calc_event'])) &&
            (isset($post['calc_data']['data']['calc_guests']) && !empty($post['calc_data']['data']['calc_guests'])) &&
            (isset($post['calc_data']['data']['calc_hours']) && !empty($post['calc_data']['data']['calc_hours'])) &&
            (isset($post['calc_data']['data']['calc_drink']) && !empty($post['calc_data']['data']['calc_drink']))
        ) {
            $event_name = '';
            switch($post['calc_data']['data']['calc_event']) {
                case 'wesele':
                    $event_name = "Wesele";
                    break;
                case 'urodziny':
                    $event_name = "Urodziny";
                    break;
                case 'chrzciny':
                    $event_name = "Chrzciny";
                    break;
                case 'impreza_prywatna':
                    $event_name = "Impreza prywatna";
                    break;
                case 'event_firmowy':
                    $event_name = "Event firmowy";
                    break;
                case 'inne':
                    $event_name = "Inne";
                    break;
                default:
                    $event_name = $post['calc_data']['data']['calc_event'];
            }

            $message .= '<b>Forma:</b> Kalkulator napojów<br>';
            $message .= '<b>E-mail:</b> ' . htmlspecialchars($post['calc_email'], ENT_QUOTES, 'UTF-8') . '<br>';
            if (!empty($post['calc_name'])) {
                $message .= '<b>Imię:</b> ' . htmlspecialchars($post['calc_name'], ENT_QUOTES, 'UTF-8') . '<br>';
            }
            if (!empty($post['calc_phone'])) {
                $message .= '<b>Telefon:</b> ' . htmlspecialchars($post['calc_phone'], ENT_QUOTES, 'UTF-8') . '<br>';
            }
            $message .= '<b>Gości:</b> ' . htmlspecialchars($post['calc_data']['data']['calc_guests'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>Czas trwania wydarzenia (godz.):</b> ' . htmlspecialchars($post['calc_data']['data']['calc_hours'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>Typ wydarzenia:</b> ' . htmlspecialchars($event_name, ENT_QUOTES, 'UTF-8') . '<br><br>';
            $message .= '<b>Plan napojów:</b><br>';
            foreach($post['calc_data']['results'] as $drink) {
                $message .= '<b>' . htmlspecialchars($drink["title"], ENT_QUOTES, 'UTF-8') . ':</b> ' . htmlspecialchars($drink["value"], ENT_QUOTES, 'UTF-8') . ' ' . htmlspecialchars($drink["type"], ENT_QUOTES, 'UTF-8') . '<br>';
            }

        }
    } else if(
        ($post['type'] === "spec_modal_form")
    ) {
        if(
            (isset($post['spec_email']) && !empty($post['spec_email'])) &&
            (isset($post['spec_phone']) && !empty($post['spec_phone']))
        ) {
            $message .= '<b>Forma:</b> Skonsultuj się z ekspertem<br>';
            $message .= '<b>E-mail:</b> ' . htmlspecialchars($post['spec_email'], ENT_QUOTES, 'UTF-8') . '<br>';
            $message .= '<b>Phone:</b> ' . htmlspecialchars($post['spec_phone'], ENT_QUOTES, 'UTF-8') . '<br>';
        }
    }

    $headers ='From: noreply@ilealkoholu.finespirits.pl' . "\r\n";
    $headers .= 'Reply-To: noreply@ilealkoholu.finespirits.pl' . "\r\n";
    $headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();

    /*try {
        $to = "web.develop54@gmail.com";
        if(!mail($to, $subject, $message, $headers)) {
            $json['error'] = false;
        }
    } catch (Exception $e) {
        $json['error'] = false;
    }*/

    $sheets =new \Land\Moms\GoogleSheets();
    if ($post['type'] === 'contact_form') {
        $sheets->appendContactForm($post);
    } elseif ($post['type'] === 'calc_modal_form') {
        $sheets->appendCalcForm($post);
    } elseif ($post['type'] === 'spec_modal_form') {
        $sheets->appendSpecForm($post);
    }

    try {
        $mail->isSMTP();
        $mail->Host = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['SMTP_USERNAME'];
        $mail->Password = $_ENV['SMTP_PASSWORD'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->addCustomHeader('Content-type', 'text/html; charset=utf-8');

        // От кого
        $mail->setFrom('info@finespirits.website');
        // Кому
        $mail->addAddress('toshchev.vadym@gmail.com', 'DrinkPlanner_1');
        $mail->addAddress('business@finespirits.pl', 'DrinkPlanner_3');

        $mail->Subject = $subject;
        $mail->Body = $message;

        $mail->send();
    } catch (Exception $e) {
        $json['error'] = true;
        $json['message'] = $e->getMessage();
    }
}

echo json_encode($json);
die();
