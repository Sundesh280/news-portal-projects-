<?php
/* translate.php - Proxy for MyMemory Translation API
   Translates text between English (en) and Nepali (ne).
   Usage: GET ?text=Hello&from=en&to=ne
*/

header('Content-Type: application/json');

$text = isset($_GET['text']) ? trim($_GET['text']) : '';
$from = isset($_GET['from']) ? trim($_GET['from']) : '';
$to   = isset($_GET['to'])   ? trim($_GET['to'])   : '';

// Validate inputs
if ($text === '' || $from === '' || $to === '') {
    echo json_encode(['ok' => false, 'error' => 'Missing parameters: text, from, to']);
    exit;
}

// Only allow en<->ne translations
$allowed = ['en', 'ne'];
if (!in_array($from, $allowed) || !in_array($to, $allowed) || $from === $to) {
    echo json_encode(['ok' => false, 'error' => 'Only en↔ne translation is supported.']);
    exit;
}

// MyMemory API has a ~500 char limit per request for free tier.
// For longer text, split into chunks and translate each one.
$chunks = splitTextIntoChunks($text, 450);
$translated = '';

foreach ($chunks as $chunk) {
    $result = translateChunk($chunk, $from, $to);
    if ($result === false) {
        echo json_encode(['ok' => false, 'error' => 'Translation API request failed.']);
        exit;
    }
    $translated .= $result;
}

echo json_encode(['ok' => true, 'translated' => $translated]);


// ---- Helper functions ----

// Translate a single chunk of text using MyMemory API
function translateChunk($text, $from, $to) {
    $langpair = $from . '|' . $to;
    $url = 'https://api.mymemory.translated.net/get?'
         . 'q=' . urlencode($text)
         . '&langpair=' . urlencode($langpair);

    // Use cURL if available, otherwise file_get_contents
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode !== 200) {
            return false;
        }
    } else {
        $ctx = stream_context_create(['http' => ['timeout' => 15]]);
        $response = @file_get_contents($url, false, $ctx);
        if ($response === false) {
            return false;
        }
    }

    $data = json_decode($response, true);
    if (!$data || !isset($data['responseData']['translatedText'])) {
        return false;
    }

    return $data['responseData']['translatedText'];
}

// Split text into chunks by sentence boundaries, keeping under maxLen
function splitTextIntoChunks($text, $maxLen) {
    if (mb_strlen($text) <= $maxLen) {
        return [$text];
    }

    $chunks = [];
    // Split by sentence-ending punctuation (. ! ? and Nepali danda ।)
    $sentences = preg_split('/((?<=[.!?।])\s+)/', $text, -1, PREG_SPLIT_DELIM_CAPTURE);

    $current = '';
    for ($i = 0; $i < count($sentences); $i++) {
        $piece = $sentences[$i];
        if (mb_strlen($current . $piece) <= $maxLen) {
            $current .= $piece;
        } else {
            if ($current !== '') {
                $chunks[] = $current;
            }
            // If a single sentence is longer than maxLen, force-split it
            if (mb_strlen($piece) > $maxLen) {
                $words = explode(' ', $piece);
                $current = '';
                foreach ($words as $w) {
                    if (mb_strlen($current . ' ' . $w) <= $maxLen) {
                        $current .= ($current === '' ? '' : ' ') . $w;
                    } else {
                        if ($current !== '') $chunks[] = $current;
                        $current = $w;
                    }
                }
            } else {
                $current = $piece;
            }
        }
    }
    if ($current !== '') {
        $chunks[] = $current;
    }

    return $chunks;
}
