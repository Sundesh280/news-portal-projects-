<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// GET ALL subscribers
if ($action === 'get_all') {
    $result = $conn->query("SELECT * FROM subscribers ORDER BY joined_at DESC");
    $subs = [];
    while ($row = $result->fetch_assoc()) { $subs[] = fmt($row); }
    echo json_encode(['ok' => true, 'subscribers' => $subs]);
    exit;
}

// GET by email
if ($action === 'get_by_email') {
    $email  = $conn->real_escape_string(strtolower(trim($_GET['email'] ?? '')));
    $result = $conn->query("SELECT * FROM subscribers WHERE email='$email' LIMIT 1");
    $row    = $result->fetch_assoc();
    echo $row ? json_encode(['ok' => true, 'subscriber' => fmt($row)]) : json_encode(['ok' => false]);
    exit;
}

// ADD subscriber
if ($action === 'add') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $first    = $conn->real_escape_string(trim($data['firstName'] ?? ''));
    $last     = $conn->real_escape_string(trim($data['lastName']  ?? ''));
    $email    = $conn->real_escape_string(strtolower(trim($data['email']    ?? '')));
    $phone    = $conn->real_escape_string(trim($data['phone']     ?? ''));
    $location = $conn->real_escape_string(trim($data['location']  ?? ''));

    if (!$first || !$last || !$email) {
        echo json_encode(['ok' => false, 'error' => 'First name, last name and email are required.']);
        exit;
    }

    $check = $conn->query("SELECT id FROM subscribers WHERE email='$email' LIMIT 1");
    if ($check->num_rows > 0) {
        echo json_encode(['ok' => false, 'error' => 'This email is already subscribed.']);
        exit;
    }

    $id  = 'sub-' . time() . '-' . rand(100,999);
    $sql = "INSERT INTO subscribers (id, first_name, last_name, email, phone, location) VALUES ('$id','$first','$last','$email','$phone','$location')";
    if ($conn->query($sql)) {
        $result = $conn->query("SELECT * FROM subscribers WHERE id='$id'");
        $row    = $result->fetch_assoc();
        echo json_encode(['ok' => true, 'subscriber' => fmt($row)]);
    } else {
        echo json_encode(['ok' => false, 'error' => $conn->error]);
    }
    exit;
}

// DELETE subscriber
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM subscribers WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);

function fmt($row) {
    return ['id' => $row['id'], 'firstName' => $row['first_name'], 'lastName' => $row['last_name'], 'email' => $row['email'], 'phone' => $row['phone'], 'location' => $row['location'], 'joinedAt' => $row['joined_at']];
}
?>
