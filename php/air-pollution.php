<?php
// air-pollution.php - Proxy for OpenWeather API (air quality + weather)

header('Content-Type: application/json; charset=utf-8');

// Supported cities
$cities = array(
    'biratnagar' => array('lat' => 26.4525, 'lon' => 87.2718),
);

$cityKey = isset($_GET['city']) ? strtolower(trim($_GET['city'])) : 'biratnagar';
if (!isset($cities[$cityKey])) {
    echo json_encode(array('ok' => false, 'error' => 'Unknown city'));
    exit;
}

$lat = $cities[$cityKey]['lat'];
$lon = $cities[$cityKey]['lon'];

// API key - kept server-side only
$OWM_KEY = '3499debf8404c6fe9a44f9785b68b0ad';

$action = isset($_GET['action']) ? $_GET['action'] : 'aqi';
$opts = array('http' => array('timeout' => 5));
$context = stream_context_create($opts);

// Weather action - returns temperature and icon
if ($action === 'weather') {
    $url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$OWM_KEY}&units=metric";
    $resp = @file_get_contents($url, false, $context);
    if ($resp === false) {
        echo json_encode(array('ok' => false, 'error' => 'Failed to fetch weather'));
        exit;
    }
    $data = json_decode($resp, true);
    if (!$data || !isset($data['main'])) {
        echo json_encode(array('ok' => false, 'error' => 'Invalid weather response'));
        exit;
    }
    $temp = isset($data['main']['temp']) ? round($data['main']['temp']) : 0;
    $icon = isset($data['weather'][0]['icon']) ? $data['weather'][0]['icon'] : null;
    echo json_encode(array('ok' => true, 'temp' => $temp, 'icon' => $icon));
    exit;
}

// Default: Air quality
$url = "https://api.openweathermap.org/data/2.5/air_pollution?lat={$lat}&lon={$lon}&appid={$OWM_KEY}";
$resp = @file_get_contents($url, false, $context);

if ($resp === false) {
    echo json_encode(array('ok' => false, 'error' => 'Failed to fetch'));
    exit;
}

$data = json_decode($resp, true);
if (!$data || !isset($data['list'][0])) {
    echo json_encode(array('ok' => false, 'error' => 'Invalid response'));
    exit;
}

$item = $data['list'][0];
$aqi = isset($item['main']['aqi']) ? (int)$item['main']['aqi'] : null;
$components = isset($item['components']) ? $item['components'] : array();

echo json_encode(array('ok' => true, 'cities' => array(array('name' => $cityKey, 'aqi' => $aqi, 'components' => $components))));
