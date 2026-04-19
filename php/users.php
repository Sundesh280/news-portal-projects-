<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// LOGIN
if ($action === 'login') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $email    = $conn->real_escape_string(strtolower(trim($data['email']    ?? '')));
    $password = $conn->real_escape_string(trim($data['password'] ?? ''));

    $result = $conn->query("SELECT * FROM users WHERE email='$email' AND password='$password' LIMIT 1");
    $user   = $result->fetch_assoc();

    if (!$user) {
        echo json_encode(['ok' => false, 'error' => 'Invalid email or password.']);
        exit;
    }

    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role']  = $user['role'];

    echo json_encode(['ok' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']]]);
    exit;
}

// LOGOUT
if ($action === 'logout') {
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

// GET SESSION
if ($action === 'get_session') {
    if (!empty($_SESSION['user_id'])) {
        echo json_encode(['ok' => true, 'user' => ['id' => $_SESSION['user_id'], 'name' => $_SESSION['user_name'], 'email' => $_SESSION['user_email'], 'role' => $_SESSION['user_role']]]);
    } else {
        echo json_encode(['ok' => false]);
    }
    exit;
}

// REGISTER
if ($action === 'register') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $name     = $conn->real_escape_string(trim($data['name']     ?? ''));
    $email    = $conn->real_escape_string(strtolower(trim($data['email']    ?? '')));
    $password = $conn->real_escape_string(trim($data['password'] ?? ''));

    if (!$name || !$email || !$password) {
        echo json_encode(['ok' => false, 'error' => 'Name, email and password are required.']);
        exit;
    }

    $check = $conn->query("SELECT id FROM users WHERE email='$email' LIMIT 1");
    if ($check->num_rows > 0) {
        echo json_encode(['ok' => false, 'error' => 'This email is already registered.']);
        exit;
    }

    $id  = 'user-' . time() . '-' . rand(100,999);
    $sql = "INSERT INTO users (id, name, email, password, role) VALUES ('$id','$name','$email','$password','user')";
    echo $conn->query($sql) ? json_encode(['ok' => true]) : json_encode(['ok' => false, 'error' => $conn->error]);
    exit;
}

// GET ALL USERS
if ($action === 'get_all') {
    $result = $conn->query("SELECT id, name, email, role, joined_at FROM users ORDER BY joined_at DESC");
    $users  = [];
    while ($row = $result->fetch_assoc()) { $users[] = $row; }
    echo json_encode(['ok' => true, 'users' => $users]);
    exit;
}

// DELETE USER
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM users WHERE id='$id' AND role != 'admin'");
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
?>
