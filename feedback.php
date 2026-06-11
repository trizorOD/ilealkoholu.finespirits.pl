<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$mail = new PHPMailer(true);

$post = !empty($_POST) ? $_POST : [];

$apiKey = $_ENV['FUNNELKIT_API_KEY'];
$url = "https://finespirits.pl/wp-json/funnelkit-automations/contact/add?api_key={$apiKey}";

$data_f = [
    "email"     => '',
    "tags"      => [],
    "status"    => "subscribed",
    "country"   =>  "PL"
];

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
            $message .= '<b>Imię:</b> ' . $post['contact_name'] . '<br>';
            $message .= '<b>E-mail:</b> ' . $post['contact_email'] . '<br>';
            $message .= '<b>Data wydarzenia:</b> ' . $post['contact_date'] . '<br>';
            $message .= '<b>Telefon:</b> ' . $post['contact_phone'] . '<br>';
            $message .= '<b>Zapisz się na nasz newsletter:</b> ' . $newsletter . '<br>';

            $data_f['email'] = $post['contact_email'];
            $data_f['f_name'] = $post['contact_name'];
            $data_f['contact_no'] = $post['contact_phone'];
            $data_f['tags'] = [63];

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
                    $event_name = $post['data']['calc_event'];
            }

            $message .= '<b>Forma:</b> Kalkulator napojów<br>';
            $message .= '<b>E-mail:</b> ' . $post['calc_email'] . '<br>';
            $message .= '<b>Gości:</b> ' . $post['calc_data']['data']['calc_guests'] . '<br>';
            $message .= '<b>Czas trwania wydarzenia (godz.):</b> ' . $post['calc_data']['data']['calc_hours'] . '<br>';
            $message .= '<b>Typ wydarzenia:</b> ' . $event_name . '<br><br>';
            $message .= '<b>Plan napojów:</b><br>';
            foreach($post['calc_data']['results'] as $drink) {
                $message .= '<b>'.$drink["title"].':</b> ' . $drink["value"] . ' ' . $drink["type"] . '<br>';
            }

            $data_f['email'] = $post['calc_email'];
            $data_f['tags'][] = 61;

        }
    } else if(
        ($post['type'] === "spec_modal_form")
    ) {
        if(
            (isset($post['spec_email']) && !empty($post['spec_email'])) &&
            (isset($post['spec_phone']) && !empty($post['spec_phone']))
        ) {
            $message .= '<b>Forma:</b> Skonsultuj się z ekspertem<br>';
            $message .= '<b>E-mail:</b> ' . $post['spec_email'] . '<br>';
            $message .= '<b>Phone:</b> ' . $post['spec_phone'] . '<br>';

            $data_f['email'] = $post['spec_email'];
            $data_f['contact_no'] = $post['spec_phone'];
            $data_f['tags'] = [62];
        }
    }

    if(($post['type'] === "spec_modal_form") || ($post['type'] === "calc_modal_form")) {
        foreach($post['calc_data']['data']['calc_drink'] as $drink) {
            switch($drink) {
                case "wino":
                    $data_f['tags'][] = 9;
                    break;
                case "mocniejsze_alkohole":
                    $data_f['tags'][] = 65;
                    break; 
                case "wino_bezalkoholowe":
                    $data_f['tags'][] = 69;
                    break;    
                case "piwo":
                    $data_f['tags'][] = 68;
                    break;     
                case "woda":
                    $data_f['tags'][] = 67;
                    break; 
                case "musujące":
                    $data_f['tags'][] = 54;
                    break;          
            }
        }
    }



    $headers = 'From: noreply@' . str_replace('www.', '', $_SERVER['SERVER_NAME']) . "\r\n";
    $headers .= 'Reply-To: noreply@' . str_replace('www.', '', $_SERVER['SERVER_NAME']) . "\r\n";
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

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data_f));
    curl_exec($ch);

    curl_close($ch);

    $sheets = new \Land\Moms\GoogleSheets();
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
        $mail->addAddress('valeriia.h@finespirits.pl', 'DrinkPlanner_2');
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
