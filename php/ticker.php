<?php
// ticker.php - Handles breaking news ticker headlines

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------
// GET ALL headlines + the global stopped state
// -------------------------------------------------------
if ($action === 'get_all') {
    $result    = $conn->query("SELECT * FROM ticker_headlines ORDER BY created_at ASC");
    $headlines = array();

    while ($row = $result->fetch_assoc()) {
        $headlines[] = formatHeadline($row);
    }

    // Get the global all_stopped flag from the first row
    $sr         = $conn->query("SELECT all_stopped FROM ticker_headlines LIMIT 1");
    $allStopped = false;

    if ($sr) {
        $srow = $sr->fetch_assoc();
        if ($srow) {
            $allStopped = (bool)$srow['all_stopped'];
        }
    }

    echo json_encode(array('ok' => true, 'headlines' => $headlines, 'allStopped' => $allStopped));
    exit;
}

// -------------------------------------------------------
// ADD a new headline
// -------------------------------------------------------
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $text = $conn->real_escape_string(trim(isset($data['text']) ? $data['text'] : ''));

    if (!$text) {
        echo json_encode(array('ok' => false, 'error' => 'Text is required.'));
        exit;
    }

    $id = 'th-' . time() . '-' . rand(100, 999);
    $conn->query("INSERT INTO ticker_headlines (id, text_body, is_active) VALUES ('$id', '$text', 1)");

    echo json_encode(array('ok' => true, 'id' => $id));
    exit;
}

// -------------------------------------------------------
// REWRITE (edit) a headline's text
// -------------------------------------------------------
if ($action === 'rewrite') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = $conn->real_escape_string(isset($data['id'])   ? $data['id']   : '');
    $text = $conn->real_escape_string(trim(isset($data['text']) ? $data['text'] : ''));

    if (!$text) {
        echo json_encode(array('ok' => false, 'error' => 'Text is required.'));
        exit;
    }

    $conn->query("UPDATE ticker_headlines SET text_body='$text' WHERE id='$id'");
    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// TOGGLE one headline on or off
// -------------------------------------------------------
if ($action === 'toggle') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("UPDATE ticker_headlines SET is_active = NOT is_active WHERE id='$id'");
    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// TOGGLE ALL - start or stop all headlines at once
// -------------------------------------------------------
if ($action === 'toggle_all') {
    $conn->query("UPDATE ticker_headlines SET all_stopped = NOT all_stopped");

    // Read the new state
    $sr         = $conn->query("SELECT all_stopped FROM ticker_headlines LIMIT 1");
    $allStopped = false;

    if ($sr) {
        $row = $sr->fetch_assoc();
        if ($row) {
            $allStopped = (bool)$row['all_stopped'];
        }
    }

    echo json_encode(array('ok' => true, 'allStopped' => $allStopped));
    exit;
}

// -------------------------------------------------------
// DELETE a headline
// -------------------------------------------------------
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM ticker_headlines WHERE id='$id'");
    echo json_encode(array('ok' => true));
    exit;
}

echo json_encode(array('ok' => false, 'error' => 'Unknown action'));

// -------------------------------------------------------
// formatHeadline - converts a DB row into a clean array
// -------------------------------------------------------
function formatHeadline($row) {
    return array(
        'id'         => $row['id'],
        'text'       => $row['text_body'],
        'active'     => (bool)$row['is_active'],
        'allStopped' => (bool)$row['all_stopped'],
    );
}
?>