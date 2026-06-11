<?php

namespace Land\Moms;

class GoogleSheets
{
    private string $webhookUrl;

    public function __construct()
    {
        $this->webhookUrl = $_ENV['GOOGLE_SHEETS_WEBHOOK_URL'];
    }

    public function appendContactForm(array $post): void
    {
        try {
            $now = new \DateTime();
            $newsletter = ($post['contact_newsletter'] ?? 0) == 1 ? 'Tak' : 'Nie';

            $row = [
                $now->format('Y-m-d'),
                $now->format('H:i'),
                $post['contact_name'] ?? '',
                $post['contact_email'] ?? '',
                "'" . ($post['contact_phone'] ?? ''),
                $post['contact_date'] ?? '',
                $newsletter,
                'Pending',
            ];

            $this->post('contact_form', $row);
        } catch (\Exception $e) {
            $this->log('contact_form', $e->getMessage());
        }
    }

    public function appendCalcForm(array $post): void
    {
        try {
            $now = new \DateTime();

            $drinks = [
                'Wino'               => '',
                'Mocne alkohole'     => '',
                'Wino bezalkoholowe' => '',
                'Piwo'               => '',
                'Napoje'             => '',
                'Musujące'           => '',
            ];

            foreach (($post['calc_data']['results'] ?? []) as $drink) {
                $title = $drink['title'] ?? '';
                if (isset($drinks[$title])) {
                    $drinks[$title] = ($drink['value'] ?? '') . ' ' . ($drink['type'] ?? '');
                }
            }

            $eventNames = [
                'wesele'           => 'Wesele',
                'urodziny'         => 'Urodziny',
                'chrzciny'         => 'Chrzciny',
                'impreza_prywatna' => 'Impreza prywatna',
                'event_firmowy'    => 'Event firmowy',
                'inne'             => 'Inne',
            ];
            $eventKey = $post['calc_data']['data']['calc_event'] ?? '';
            $eventName = $eventNames[$eventKey] ?? $eventKey;

            $row = [
                $now->format('Y-m-d'),
                $now->format('H:i'),
                $post['calc_email'] ?? '',
                $post['calc_data']['data']['calc_guests'] ?? '',
                $post['calc_data']['data']['calc_hours'] ?? '',
                $eventName,
                'Pending',
                $drinks['Wino'],
                $drinks['Mocne alkohole'],
                $drinks['Wino bezalkoholowe'],
                $drinks['Piwo'],
                $drinks['Napoje'],
                $drinks['Musujące'],
            ];

            $this->post('calc_modal_form', $row);
        } catch (\Exception $e) {
            $this->log('calc_modal_form', $e->getMessage());
        }
    }

    public function appendSpecForm(array $post): void
    {
        try {
            $now = new \DateTime();

            $row = [
                $now->format('Y-m-d'),
                $now->format('H:i'),
                $post['spec_email'] ?? '',
                "'" . ($post['spec_phone'] ?? ''),
                'Pending',
            ];

            $this->post('spec_modal_form', $row);
        } catch (\Exception $e) {
            $this->log('spec_modal_form', $e->getMessage());
        }
    }

    private function post(string $sheet, array $row): void
    {
        $payload = json_encode(['sheet' => $sheet, 'row' => $row, 'secret' => $_ENV['GOOGLE_SHEETS_SECRET']]);

        $ch = curl_init($this->webhookUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception("HTTP $httpCode: $response");
        }
    }

    private function log(string $formType, string $message): void
    {
        $dir = __DIR__ . '/../logs';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $entry = sprintf("[%s] %s: %s\n", date('Y-m-d H:i:s'), $formType, $message);
        file_put_contents($dir . '/sheets_errors.log', $entry, FILE_APPEND);
    }
}
