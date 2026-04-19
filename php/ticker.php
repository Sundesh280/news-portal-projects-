<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// GET ALL headlines + master stop state
if ($action === 'get_all') {
    $result    = $conn->query("SELECT * FROM ticker_headlines ORDER BY created_at ASC");
    $headlines = [];
    while ($row = $result->fetch_assoc()) { $headlines[] = fmt($row); }

    // Master stopped state: stored in a separate settings table or derived from the first row
    $sr = $conn->query("SELECT all_stopped FROM ticker_headlines LIMIT 1");
    $allStopped = ($sr && $srow = $sr->fetch_assoc()) ? (bool)$srow['all_stopped'] : false;

    echo json_encode(['ok' => true, 'headlines' => $headlines, 'allStopped' => $allStopped]);
    exit;
}

// ADD headline
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $text = $conn->real_escape_string(trim($data['text'] ?? ''));
    if (!$text) { echo json_encode(['ok' => false, 'error' => 'Text is required.']); exit; }
    $id  = 'th-' . time() . '-' . rand(100,999);
    $conn->query("INSERT INTO ticker_headlines (id, text_body, is_active) VALUES ('$id','$text',1)");
    echo json_encode(['ok' => true, 'id' => $id]);
    exit;
}

// REWRITE headline text
if ($action === 'rewrite') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = $conn->real_escape_string($data['id']   ?? '');
    $text = $conn->real_escape_string(trim($data['text'] ?? ''));
    if (!$text) { echo json_encode(['ok' => false, 'error' => 'Text is required.']); exit; }
    $conn->query("UPDATE ticker_headlines SET text_body='$text' WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

// TOGGLE single headline on/off
if ($action === 'toggle') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("UPDATE ticker_headlines SET is_active = NOT is_active WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

// TOGGLE ALL (master stop/start)
if ($action === 'toggle_all') {
    $conn->query("UPDATE ticker_headlines SET all_stopped = NOT all_stopped");
    $sr  = $conn->query("SELECT all_stopped FROM ticker_headlines LIMIT 1");
    $row = $sr ? $sr->fetch_assoc() : null;
    echo json_encode(['ok' => true, 'allStopped' => $row ? (bool)$row['all_stopped'] : false]);
    exit;
}

// DELETE headline
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM ticker_headlines WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);

function fmt($row) {
    return ['id' => $row['id'], 'text' => $row['text_body'], 'active' => (bool)$row['is_active'], 'allStopped' => (bool)$row['all_stopped']];
}
?>
