<?php

namespace Land\Moms;

use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;

class GoogleSheets
{
    private Sheets $service;
    private string $spreadsheetId;

    public function __construct()
    {
        $client = new Client();
        $client->setAuthConfig($_ENV['GOOGLE_SHEETS_CREDENTIALS']);
        $client->addScope(Sheets::SPREADSHEETS);

        $this->service = new Sheets($client);
        $this->spreadsheetId = $_ENV['GOOGLE_SHEETS_ID'];
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
                $post['contact_phone'] ?? '',
                $post['contact_date'] ?? '',
                $newsletter,
                'Pending',
            ];

            $this->append('contact_form', $row);
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

            $this->append('calc_modal_form', $row);
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
                $post['spec_phone'] ?? '',
                'Pending',
            ];

            $this->append('spec_modal_form', $row);
        } catch (\Exception $e) {
            $this->log('spec_modal_form', $e->getMessage());
        }
    }

    private function append(string $sheet, array $values): void
    {
        $body = new ValueRange(['values' => [$values]]);
        $this->service->spreadsheets_values->append(
            $this->spreadsheetId,
            $sheet,
            $body,
            ['valueInputOption' => 'RAW']
        );
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
