<?php
/**
 * logout.php — Secure User Logout
 * ─────────────────────────────────
 * Three-step session destruction (PHP manual recommended approach):
 *  1. Clear all $_SESSION variables in memory
 *  2. Send a Set-Cookie header to expire the session cookie on the client
 *  3. Destroy the session data file on the server
 *
 * This ensures neither the browser nor the server retain any session state.
 */

session_name('nk_user');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,   // ← set TRUE on HTTPS/production
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

// Step 1: Clear all session data in memory
$_SESSION = [];

// Step 2: Expire the session cookie in the browser
$params = session_get_cookie_params();
setcookie(
    session_name(),       // e.g. 'nk_user'
    '',                   // empty value
    time() - 42000,       // timestamp in the past = immediately expired
    $params['path'],
    $params['domain'],
    $params['secure'],
    $params['httponly']
);

// Step 3: Destroy the session file on the server
session_destroy();

// Redirect back to the home page
header('Location: ../index.php');
exit;
?>