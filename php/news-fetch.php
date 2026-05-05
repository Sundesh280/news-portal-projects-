<?php


header('Content-Type: application/json; charset=utf-8');

// Your newsdata.io API key
$API_KEY = 'pub_06b20374a1a44447853358856edf27f8';

// Read which category the admin wants to see
$cat = isset($_GET['category']) ? $_GET['category'] : 'general';

// Map our category names to newsdata.io category names
if ($cat === 'general') {
    $apiCat = 'top';
} elseif ($cat === 'business') {
    $apiCat = 'business';
} elseif ($cat === 'technology') {
    $apiCat = 'technology';
} elseif ($cat === 'science') {
    $apiCat = 'science';
} elseif ($cat === 'health') {
    $apiCat = 'health';
} elseif ($cat === 'sports') {
    $apiCat = 'sports';
} elseif ($cat === 'entertainment') {
    $apiCat = 'entertainment';
} else {
    $apiCat = 'top';
}

$allArticles = array();

if ($cat === 'general') {
    // TOP STORIES: Try to get news from Kathmandu Post first
    $url1     = 'https://newsdata.io/api/1/latest?apikey=' . $API_KEY . '&q=Kathmandu+Post&language=en';
    $results  = fetchFromApi($url1);
    
    // If no specific Kathmandu Post results, fall back to broad Nepal news
    if (count($results) === 0) {
        $urlFallback = 'https://newsdata.io/api/1/latest?apikey=' . $API_KEY . '&q=Nepal&language=en';
        $results = fetchFromApi($urlFallback);
    }
    
    $allArticles = $results;

} else {
    // SPORTS and OTHER CATEGORIES:
    // Call 1: Nepal news for this category
    $url1     = 'https://newsdata.io/api/1/latest?apikey=' . $API_KEY
              . '&q=Nepal&category=' . $apiCat . '&language=en';
    $nepalNews = fetchFromApi($url1);

    // Call 2: International news for this category
    $url2     = 'https://newsdata.io/api/1/latest?apikey=' . $API_KEY
              . '&category=' . $apiCat . '&language=en';
    $intlNews  = fetchFromApi($url2);

    // Combine them
    $allArticles = array_merge($nepalNews, $intlNews);
}

// -------------------------------------------------------
// Convert each raw API result into a clean format
// -------------------------------------------------------
$articles = array();
for ($i = 0; $i < count($allArticles); $i++) {
    $item = $allArticles[$i];

    $title = isset($item['title']) ? $item['title'] : '';
    if (!$title) continue; // skip articles with no title

    $summary = '';
    if (isset($item['description']) && $item['description']) {
        $summary = $item['description'];
    }

    $content = '';
    if (isset($item['content']) && $item['content']) {
        $content = $item['content'];
    } elseif ($summary) {
        $content = $summary;
    }

    $image = '';
    if (isset($item['image_url']) && $item['image_url']) {
        $image = $item['image_url'];
    }

    $author = '';
    if (isset($item['source_name']) && $item['source_name']) {
        $author = $item['source_name'];
    }

    $date = '';
    if (isset($item['pubDate']) && $item['pubDate']) {
        $date = substr($item['pubDate'], 0, 10); // e.g. "2025-04-30"
    }

    $link = '';
    if (isset($item['link']) && $item['link']) {
        $link = $item['link'];
    }

    $articles[] = array(
        'title'    => $title,
        'summary'  => cleanText($summary),
        'content'  => cleanText($content),
        'image'    => $image,
        'author'   => $author,
        'date'     => $date,
        'link'     => $link,
        'category' => $cat,
    );
}

// Simple function to remove raw image URLs from text
function cleanText($text) {
    // Remove links ending with image extensions (jpg, png, etc.)
    $text = preg_replace('/\bhttps?:\/\/\S+\.(jpg|jpeg|png|gif|webp)\b/i', '', $text);
    return trim($text);
}

echo json_encode(array('ok' => true, 'articles' => $articles, 'category' => $cat));


function fetchFromApi($url) {
    $response = file_get_contents($url);
    if ($response === false) {
        return array(); // request failed
    }
    $data = json_decode($response, true);
    if (!$data) {
        return array(); // response was not valid JSON
    }
    if (!isset($data['status']) || $data['status'] !== 'success') {
        return array(); // API returned an error
    }
    return isset($data['results']) ? $data['results'] : array();
}
?>
