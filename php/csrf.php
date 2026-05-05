<?php
/**
 * csrf.php — Centralized CSRF Token Helper
 * ─────────────────────────────────────────
 * Include this file AFTER session_start() has been called in any PHP file
 * that needs to generate or validate a CSRF token.
 *
 * Usage (generate token for a form):
 *   require 'csrf.php';
 *   $token = csrf_token();   // outputs hidden input HTML automatically in forms
 *
 * Usage (validate on POST):
 *   require 'csrf.php';
 *   csrf_verify();           // dies with 403 JSON if token is invalid
 *
 * The token is a cryptographically random 64-hex-char string tied to the
 * current session.  It is regenerated once per session (not per request),
 * which keeps things practical for AJAX-heavy pages while still being secure.
 */

// ---------------------------------------------------------------------------
// csrf_token() — Return the current session CSRF token, creating one if needed.
// ---------------------------------------------------------------------------
function csrf_token(): string
{
    // Session must already be started by the caller.
    if (session_status() !== PHP_SESSION_ACTIVE) {
        // Safety net: if session isn't open yet, open it now.
        session_start();
    }

    if (empty($_SESSION['csrf_token'])) {
        // random_bytes(32) gives 32 bytes → bin2hex doubles it → 64-char hex string
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

// ---------------------------------------------------------------------------
// csrf_field() — Echo a hidden <input> element ready to embed in HTML forms.
// ---------------------------------------------------------------------------
function csrf_field(): void
{
    $token = csrf_token();
    // htmlspecialchars is a belt-and-braces precaution even though our tokens
    // are hex-only and can never contain HTML special characters.
    echo '<input type="hidden" name="csrf_token" id="csrf_token" value="'
        . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
}

// ---------------------------------------------------------------------------
// csrf_verify() — Validate the token coming from a POST request.
//   Checks $_POST['csrf_token'] first; falls back to the X-CSRF-Token header
//   (sent by the JS fetch/XHR layer) and the JSON request body field.
//   Terminates with 403 JSON on failure so callers don't need to check.
// ---------------------------------------------------------------------------
function csrf_verify(): void
{
    $stored = isset($_SESSION['csrf_token']) ? $_SESSION['csrf_token'] : '';

    // 1. Standard HTML form POST field
    $incoming = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';

    // 2. Custom HTTP header (used by the XHR / fetch JS layer)
    if ($incoming === '') {
        $header = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
        $incoming = $header;
    }

    // 3. JSON body field (for API calls that send application/json)
    if ($incoming === '') {
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);
        if (is_array($body) && isset($body['csrf_token'])) {
            $incoming = $body['csrf_token'];
        }
    }

    // hash_equals() is timing-safe — prevents timing-based token brute-force.
    if ($stored === '' || !hash_equals($stored, $incoming)) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok'    => false,
            'error' => 'Invalid or missing CSRF token. Please refresh the page and try again.'
        ]);
        exit;
    }
}
?>
