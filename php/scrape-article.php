<?php
// scrape-article.php
// This takes a news URL and tries to extract the full paragraphs
// to give you "big articles" for your portal.

// ---- Input & Validation ----
header('Content-Type: application/json; charset=utf-8');

$url = isset($_POST['url']) ? $_POST['url'] : '';

if (!$url) {
    echo json_encode(array('ok' => false, 'text' => ''));
    exit;
}

// ---- Web Fetcher ----
// We use cURL to act like a normal web browser (like Chrome)
// If we don't do this, news websites will block us thinking we are a bot.
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Give us the website text back
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);    // Follow the link if the website redirects
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);   // Ignore security warnings
curl_setopt($ch, CURLOPT_TIMEOUT, 15);             // Give up after 15 seconds
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0"); // Pretend to be a normal browser

$html = curl_exec($ch);
curl_close($ch);


if (!$html) {
    echo json_encode(array('ok' => false, 'text' => ''));
    exit;
}

// ---- Text Extraction ----
// 2. Extract paragraphs and large div text
// We look for <p> tags but also <div> tags that might contain the story
preg_match_all('/<(p|div)[^>]*>(.*?)<\/\1>/is', $html, $matches);

$fullText = "";

if (isset($matches[2]) && is_array($matches[2])) {
    for ($i = 0; $i < count($matches[2]); $i++) {
        $paragraph = strip_tags($matches[2][$i]); 
        $paragraph = trim(html_entity_decode($paragraph, ENT_QUOTES, 'UTF-8'));
        
        // --- SMART QUALITY FILTERING ---
        $len = strlen($paragraph);

        // 1. Skip if too short (menus, tags, dates)
        if ($len < 50) continue;

        // 2. Skip ONLY if it looks like REAL code junk
        if (preg_match('/function\s*\(|var\s+[\w\$]+\s*=|window\.atob|innerHTML\s*=|getAttribute\(|\(function\(e,t,n\)\{/i', $paragraph)) {
            continue;
        }

        // 3. Skip Navigation Menus (The "Home Nation World..." lists)
        // Real news has periods (.) to end sentences. Menus are just lists of words.
        $wordCount = str_word_count($paragraph);
        $periodCount = substr_count($paragraph, '.');
        if ($wordCount > 10 && $periodCount == 0) {
            continue; // This is a menu list, not an article
        }

        // --- NEW: CSS & CODE BLOCK FILTER ---
        // KILL SWITCH: If it contains curly braces or CSS-like selectors, skip it
        if (strpos($paragraph, '{') !== false || strpos($paragraph, '}') !== false || strpos($paragraph, ';') !== false) {
            continue; // This is definitely code or style junk
        }

        if (preg_match('/[#.;>:]/i', $paragraph)) {
            // CSS usually has lots of special chars and few periods
            if ($periodCount < 2) {
                continue;
            }
        }

        // 4. Skip if it contains too many Navigation Keywords
        if (preg_match('/Home|Nation|World|Oped|Provinces|Sports|Business|Health|Science|Entertainment|Login|Register/i', $paragraph)) {
            if ($len < 300 && $periodCount < 2) continue; 
        }

        // 5. Bracket check for code
        $brackets = substr_count($paragraph, '{') + substr_count($paragraph, '}');
        if ($brackets > 2 && $len < 600) continue; 

        // 6. Skip common junk phrases
        if (preg_match('/follow us on|click here|cookie policy|advertisement|sign up for|your email|read more/i', $paragraph)) {
            continue;
        }

        // 7. Clean up image URLs if any are left
        $paragraph = preg_replace('/\bhttps?:\/\/\S+\.(jpg|jpeg|png|gif|webp)\b/i', '', $paragraph);
        
        $cleanPara = trim($paragraph);
        if ($cleanPara) {
            // Prevent duplicate paragraphs
            if (strpos($fullText, substr($cleanPara, 0, 30)) === false) {
                $fullText .= $cleanPara . "\n\n";
            }
        }

        // Stop once we have a good length article (15 paragraphs max)
        if (count(explode("\n\n", trim($fullText))) >= 15) break;
    }
}

// Return the extracted text
echo json_encode(array('ok' => true, 'text' => trim($fullText)));
?>
