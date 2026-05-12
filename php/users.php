<?php
// users.php - Handles login, register, logout, and user management
// Responds with JSON data to the browser

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Read which action the browser is requesting
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------
// LOGIN - check email and password, start a session
// -------------------------------------------------------
if ($action === 'login') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $email    = strtolower(trim(isset($data['email'])    ? $data['email']    : ''));
    $password = trim(isset($data['password']) ? $data['password'] : '');

    if (!$email || !$password) {
        echo json_encode(array('ok' => false, 'error' => 'Email and password are required.'));
        exit;
    }

    require 'db.php';

    // Look up the user by email only (never compare password in SQL)
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    // Check if user exists and password matches the stored hash
    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(array('ok' => false, 'error' => 'Invalid email or password.'));
        exit;
    }

    // Use a different session name for admin vs regular user
    // This prevents admin session from leaking into the user panel
    if ($user['role'] === 'admin') {
        session_name('nk_admin');
    } else {
        session_name('nk_user');
    }
    session_start();

    // Save user info in the session
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role']  = $user['role'];

    // Send user info back to the browser
    echo json_encode(array(
        'ok'   => true,
        'user' => array(
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
        )
    ));
    exit;
}

// -------------------------------------------------------
// REGISTER - create a new user account
// -------------------------------------------------------
if ($action === 'register') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $name     = trim(isset($data['name'])     ? $data['name']     : '');
    $email    = strtolower(trim(isset($data['email'])    ? $data['email']    : ''));
    $password = trim(isset($data['password']) ? $data['password'] : '');

    // All three fields are required
    if (!$name || !$email || !$password) {
        echo json_encode(array('ok' => false, 'error' => 'Name, email and password are required.'));
        exit;
    }

    // Password must be at least 6 characters
    if (strlen($password) < 6) {
        echo json_encode(array('ok' => false, 'error' => 'Password must be at least 6 characters.'));
        exit;
    }

    require 'db.php';

    // Check if this email is already registered
    $chk = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $chk->bind_param('s', $email);
    $chk->execute();
    $chk->store_result();

    if ($chk->num_rows > 0) {
        $chk->close();
        echo json_encode(array('ok' => false, 'error' => 'This email is already registered.'));
        exit;
    }
    $chk->close();

    // Hash the password before saving (never store plain text passwords)
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $id     = 'user-' . time() . '-' . rand(100, 999);

    // Insert the new user into the database
    $ins = $conn->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'user')");
    $ins->bind_param('ssss', $id, $name, $email, $hashed);

    if ($ins->execute()) {
        echo json_encode(array('ok' => true));
    } else {
        echo json_encode(array('ok' => false, 'error' => $conn->error));
    }
    $ins->close();
    exit;
}

// -------------------------------------------------------
// LOGOUT (regular user)
// -------------------------------------------------------
if ($action === 'logout') {
    session_name('nk_user');
    session_start();
    session_destroy(); // clear all session data
    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// LOGOUT (admin)
// -------------------------------------------------------
if ($action === 'admin_logout') {
    session_name('nk_admin');
    session_start();
    session_destroy();
    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// GET SESSION (regular user) - check if user is logged in
// -------------------------------------------------------
if ($action === 'get_session') {
    session_name('nk_user');
    session_start();

    if (!empty($_SESSION['user_id'])) {
        echo json_encode(array(
            'ok'   => true,
            'user' => array(
                'id'    => $_SESSION['user_id'],
                'name'  => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role'  => $_SESSION['user_role'],
            )
        ));
    } else {
        echo json_encode(array('ok' => false));
    }
    exit;
}

// -------------------------------------------------------
// GET SESSION (admin) - check if admin is logged in
// -------------------------------------------------------
if ($action === 'get_admin_session') {
    session_name('nk_admin');
    session_start();

    if (!empty($_SESSION['user_id'])) {
        echo json_encode(array(
            'ok'   => true,
            'user' => array(
                'id'    => $_SESSION['user_id'],
                'name'  => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role'  => $_SESSION['user_role'],
            )
        ));
    } else {
        echo json_encode(array('ok' => false));
    }
    exit;
}

// -------------------------------------------------------
// GET ALL USERS (admin use only)
// -------------------------------------------------------
if ($action === 'get_all') {
    require 'db.php';
    $result = $conn->query("SELECT id, name, email, role, joined_at FROM users ORDER BY joined_at DESC");
    $users  = array();

    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode(array('ok' => true, 'users' => $users));
    exit;
}

// -------------------------------------------------------
// DELETE a user (admin only, cannot delete other admins)
// -------------------------------------------------------
if ($action === 'delete') {
    require 'db.php';
    $id   = isset($_GET['id']) ? $_GET['id'] : '';

    // The AND role != 'admin' ensures admins cannot be deleted
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(array('ok' => true));
    exit;
}

// If no action matched
echo json_encode(array('ok' => false, 'error' => 'Unknown action'));
?>