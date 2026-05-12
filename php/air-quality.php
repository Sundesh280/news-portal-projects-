<?php
header('Content-Type: application/json; charset=utf-8');

$API_KEY = '3499debf8404c6fe9a44f9785b68b0ad';

$cities = array(
    'kathmandu' => array('name' => 'Kathmandu', 'lat' => 27.7172, 'lon' => 85.3240, 'note' => 'Local snapshot'),
    'lalitpur' => array('name' => 'Lalitpur', 'lat' => 27.6644, 'lon' => 85.3188, 'note' => 'Valley coverage'),
    'pokhara' => array('name' => 'Pokhara', 'lat' => 28.2096, 'lon' => 83.9856, 'note' => 'Lakeside'),
    'biratnagar' => array('name' => 'Biratnagar', 'lat' => 26.4525, 'lon' => 87.2718, 'note' => 'Province 1'),
    'birgunj' => array('name' => 'Birgunj', 'lat' => 27.0104, 'lon' => 84.8773, 'note' => 'Trade corridor'),
    'bharatpur' => array('name' => 'Bharatpur', 'lat' => 27.6833, 'lon' => 84.4333, 'note' => 'Chitwan'),
    'butwal' => array('name' => 'Butwal', 'lat' => 27.7000, 'lon' => 83.4500, 'note' => 'Lumbini'),
    'nepalgunj' => array('name' => 'Nepalgunj', 'lat' => 28.0500, 'lon' => 81.6167, 'note' => 'Far-west access'),
    'dharan' => array('name' => 'Dharan', 'lat' => 26.8120, 'lon' => 87.2830, 'note' => 'Eastern hub'),
    'hetauda' => array('name' => 'Hetauda', 'lat' => 27.4280, 'lon' => 85.0320, 'note' => 'Central Nepal')
);

$requested = isset($_GET['city']) ? strtolower(trim($_GET['city'])) : 'all';

if ($requested !== 'all' && !isset($cities[$requested])) {
    $requested = 'all';
}

$selected = ($requested === 'all') ? $cities : array($requested => $cities[$requested]);
$results = array();

foreach ($selected as $key => $city) {
    $snapshot = fetchAirQualitySnapshot($API_KEY, $city['lat'], $city['lon']);
    $results[] = array(
        'key' => $key,
        'name' => $city['name'],
        'note' => $city['note'],
        'lat' => $city['lat'],
        'lon' => $city['lon'],
        'aqi' => $snapshot['aqi'],
        'components' => $snapshot['components'],
        'observed_at' => $snapshot['observed_at'],
        'status' => $snapshot['status']
    );
}

echo json_encode(array(
    'ok' => true,
    'updated_at' => gmdate('c'),
    'cities' => $results,
    'requested' => $requested
));

function fetchAirQualitySnapshot($apiKey, $lat, $lon) {
    $url = 'https://api.openweathermap.org/data/2.5/air_pollution?lat=' . urlencode($lat)
        . '&lon=' . urlencode($lon)
        . '&appid=' . urlencode($apiKey);

    $json = fetchUrl($url);
    if ($json === '') {
        return emptySnapshot('Unable to reach the air quality API.');
    }

    $data = json_decode($json, true);
    if (!$data || !isset($data['list'][0])) {
        return emptySnapshot('No air quality data returned.');
    }

    $entry = $data['list'][0];
    $components = isset($entry['components']) && is_array($entry['components']) ? $entry['components'] : array();
    $observedAt = isset($entry['dt']) ? gmdate('c', intval($entry['dt'])) : gmdate('c');

    return array(
        'aqi' => isset($entry['main']['aqi']) ? intval($entry['main']['aqi']) : 0,
        'components' => $components,
        'observed_at' => $observedAt,
        'status' => 'ok'
    );
}

function fetchUrl($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        if ($response !== false) {
            return $response;
        }
    }

    $context = stream_context_create(array(
        'http' => array('timeout' => 12),
        'ssl' => array('verify_peer' => true, 'verify_peer_name' => true)
    ));

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        return '';
    }
    return $response;
}

function emptySnapshot($message) {
    return array(
        'aqi' => 0,
        'components' => array(),
        'observed_at' => gmdate('c'),
        'status' => $message
    );
}
?>