<?php
// scrape-article.php
// This takes a news URL and tries to extract the full paragraphs
// to give you "big articles" for your portal.

header('Content-Type: application/json; charset=utf-8');

$url = isset($_POST['url']) ? $_POST['url'] : '';

if (!$url) {
    echo json_encode(array('ok' => false, 'text' => ''));
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language: en-US,en;q=0.5"
));

$html = curl_exec($ch);
curl_close($ch);


if (!$html) {
    echo json_encode(array('ok' => false, 'text' => ''));
    exit;
}

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
