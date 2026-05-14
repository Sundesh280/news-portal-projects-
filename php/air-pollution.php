<?php
// air-pollution.php - Proxy to OpenWeather Air Pollution API for simple client use

header('Content-Type: application/json; charset=utf-8');

// Map of supported cities to lat/lon
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

// OpenWeather API key (public key used in client JS). Replace with your own if needed.
$OWM_KEY = '3499debf8404c6fe9a44f9785b68b0ad';

$url = "https://api.openweathermap.org/data/2.5/air_pollution?lat={$lat}&lon={$lon}&appid={$OWM_KEY}";

$opts = array('http' => array('timeout' => 5));
$context = stream_context_create($opts);
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
