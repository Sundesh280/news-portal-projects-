<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Admin login uses nk_admin session, user login uses nk_user session
if ($action === 'login') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $email    = trim(strtolower($data['email']    ?? ''));
    $password = trim($data['password'] ?? '');

    require 'db.php';
    $emailEsc = $conn->real_escape_string($email);
    $passEsc  = $conn->real_escape_string($password);

    $result = $conn->query("SELECT * FROM users WHERE email='$emailEsc' AND password='$passEsc' LIMIT 1");
    $user   = $result->fetch_assoc();

    if (!$user) {
        echo json_encode(['ok' => false, 'error' => 'Invalid email or password.']);
        exit;
    }

    // Use separate session names for admin vs user
    if ($user['role'] === 'admin') {
        session_name('nk_admin');
    } else {
        session_name('nk_user');
    }
    session_start();

    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role']  = $user['role'];

    echo json_encode(['ok' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']]]);
    exit;
}

// LOGOUT — destroy the correct session based on who calls it
if ($action === 'logout') {
    // Try to destroy user session
    session_name('nk_user');
    session_start();
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

// ADMIN LOGOUT
if ($action === 'admin_logout') {
    session_name('nk_admin');
    session_start();
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

// GET SESSION — check the correct session based on context
if ($action === 'get_session') {
    // Try user session first
    session_name('nk_user');
    session_start();
    if (!empty($_SESSION['user_id'])) {
        echo json_encode(['ok' => true, 'user' => ['id' => $_SESSION['user_id'], 'name' => $_SESSION['user_name'], 'email' => $_SESSION['user_email'], 'role' => $_SESSION['user_role']]]);
        exit;
    }
    echo json_encode(['ok' => false]);
    exit;
}

// GET ADMIN SESSION
if ($action === 'get_admin_session') {
    session_name('nk_admin');
    session_start();
    if (!empty($_SESSION['user_id'])) {
        echo json_encode(['ok' => true, 'user' => ['id' => $_SESSION['user_id'], 'name' => $_SESSION['user_name'], 'email' => $_SESSION['user_email'], 'role' => $_SESSION['user_role']]]);
        exit;
    }
    echo json_encode(['ok' => false]);
    exit;
}

// REGISTER
if ($action === 'register') {
    require 'db.php';
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

// GET ALL USERS (admin only)
if ($action === 'get_all') {
    require 'db.php';
    $result = $conn->query("SELECT id, name, email, role, joined_at FROM users ORDER BY joined_at DESC");
    $users  = [];
    while ($row = $result->fetch_assoc()) { $users[] = $row; }
    echo json_encode(['ok' => true, 'users' => $users]);
    exit;
}

// DELETE USER (admin only)
if ($action === 'delete') {
    require 'db.php';
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM users WHERE id='$id' AND role != 'admin'");
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
?>