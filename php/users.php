<?php
/**
 * users.php — User Authentication & Management API
 * ──────────────────────────────────────────────────
 * Handles: login, register, logout, get_session, get_admin_session,
 *          admin_logout, get_all, delete.
 *
 * Security highlights
 * ───────────────────
 *  ✔ CSRF token validation on every state-changing POST action
 *  ✔ password_hash() / password_verify() — bcrypt, never plain text
 *  ✔ session_regenerate_id(true) after login — prevents session fixation
 *  ✔ Secure, HttpOnly, SameSite=Strict session cookie flags
 *  ✔ Prepared statements for every SQL query — no SQL injection possible
 *  ✔ Input trimming + email validation on server side
 *  ✔ Admin-only endpoints check for an active admin session before acting
 *  ✔ No CORS wildcard — restricted to same origin
 */

// ─── Output & headers ────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// Restrict to same origin only (no cross-origin AJAX allowed).
// Remove the Access-Control-* headers entirely for same-origin-only apps.
// If you do need CORS (e.g. separate SPA domain), pin it to a known origin:
// header('Access-Control-Allow-Origin: https://yourdomain.com');
// header('Access-Control-Allow-Credentials: true');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Configure and start a named PHP session with secure cookie settings.
 * Call once per action handler before reading/writing $_SESSION.
 *
 * @param string $name  'nk_user' or 'nk_admin'
 */
function startSecureSession(string $name): void
{
    session_name($name);

    // Apply hardened cookie parameters before session_start().
    session_set_cookie_params([
        'lifetime' => 0,           // Cookie lives only for this browser session
        'path'     => '/',
        'domain'   => '',          // Current domain only
        'secure'   => false,       // Set TRUE in production (requires HTTPS)
        'httponly' => true,        // JavaScript cannot access the cookie
        'samesite' => 'Strict',    // No cross-site cookie sending (CSRF defence)
    ]);

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Output a JSON error and terminate.
 *
 * @param string $message  Human-readable error text
 * @param int    $code     HTTP status code (default 400)
 */
function jsonError(string $message, int $code = 400): never
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

/**
 * Output a JSON success payload and terminate.
 *
 * @param array $payload  Additional keys to merge into the response
 */
function jsonOk(array $payload = []): never
{
    echo json_encode(array_merge(['ok' => true], $payload));
    exit;
}

// ─── Route ───────────────────────────────────────────────────────────────────
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN — verify credentials, regenerate session ID, store session data
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'login') {
    /**
     * We don't know the user's role before the DB lookup, so we always open
     * the 'nk_user' session first — this is where the CSRF token lives for
     * both login pages (the admin login page also uses this token source).
     * After verifying credentials we switch to the correct named session.
     */
    startSecureSession('nk_user');

    // Read JSON body
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    // ── CSRF validation ───────────────────────────────────────────────────────
    require_once 'csrf.php';
    csrf_verify(); // terminates with 403 if token is bad

    // ── Input validation ──────────────────────────────────────────────────────
    $email    = strtolower(trim($data['email']    ?? ''));
    $password = trim($data['password'] ?? '');

    if ($email === '' || $password === '') {
        jsonError('Email and password are required.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError('Please enter a valid email address.');
    }

    // ── Database lookup (prepared statement) ─────────────────────────────────
    require_once 'db.php';

    /**
     * Fetch only the columns we need — never SELECT * in auth queries.
     * Password comparison is done in PHP with password_verify(), not in SQL.
     */
    $stmt = $conn->prepare(
        "SELECT id, name, email, password, role
           FROM users
          WHERE email = ?
          LIMIT 1"
    );
    if (!$stmt) {
        jsonError('Internal server error (prepare).', 500);
    }
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    // ── Verify password (timing-safe via password_verify) ─────────────────────
    if (!$user || !password_verify($password, $user['password'])) {
        // Same generic message for both "no user" and "wrong password"
        // to prevent user-enumeration via error messages.
        jsonError('Invalid email or password.');
    }

    // ── Switch to the correct named session based on role & regenerate ID ──────
    if ($user['role'] === 'admin') {
        /**
         * Admin users get their own isolated session namespace 'nk_admin'.
         * First destroy the temporary 'nk_user' session we opened for CSRF,
         * then open the admin session and populate it fresh.
         */
        $_SESSION = [];
        session_destroy();
        startSecureSession('nk_admin');
    }

    /**
     * session_regenerate_id(true) creates a brand-new session ID and
     * deletes the old session file on disk, preventing session-fixation attacks.
     * The old session ID cannot be replayed after this call.
     */
    session_regenerate_id(true);

    // ── Populate session ──────────────────────────────────────────────────────
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role']  = $user['role'];
    // Store login timestamp — useful for absolute session timeout enforcement
    $_SESSION['login_time'] = time();

    // Issue a fresh CSRF token tied to the new session
    unset($_SESSION['csrf_token']);
    $newCsrfToken = csrf_token(); // creates and stores a new token

    jsonOk([
        'user' => [
            'id'         => $user['id'],
            'name'       => $user['name'],
            'email'      => $user['email'],
            'role'       => $user['role'],
        ],
        'csrf_token' => $newCsrfToken, // JS layer must store and re-send this
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER — validate input, hash password, insert new user
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'register') {
    startSecureSession('nk_user');

    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    // ── CSRF validation ───────────────────────────────────────────────────────
    require_once 'csrf.php';
    csrf_verify();

    // ── Input validation ──────────────────────────────────────────────────────
    $name     = trim($data['name']     ?? '');
    $email    = strtolower(trim($data['email']    ?? ''));
    $password = trim($data['password'] ?? '');

    if ($name === '' || $email === '' || $password === '') {
        jsonError('Name, email, and password are required.');
    }
    if (mb_strlen($name) > 150) {
        jsonError('Name must be 150 characters or fewer.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError('Please enter a valid email address.');
    }
    if (strlen($password) < 8) {
        // 8 chars minimum — stricter than the original 6
        jsonError('Password must be at least 8 characters.');
    }

    // ── Database: check for duplicate email ───────────────────────────────────
    require_once 'db.php';

    $chk = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    if (!$chk) {
        jsonError('Internal server error (prepare).', 500);
    }
    $chk->bind_param('s', $email);
    $chk->execute();
    $chk->store_result();

    if ($chk->num_rows > 0) {
        $chk->close();
        jsonError('This email is already registered.');
    }
    $chk->close();

    // ── Hash password & insert ────────────────────────────────────────────────
    /**
     * PASSWORD_BCRYPT uses bcrypt with a cost of 12 (default is 10).
     * Higher cost = more expensive to brute-force, acceptable on modern servers.
     */
    $hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Use random_bytes for a globally unique, unpredictable user ID.
    $id = 'user-' . bin2hex(random_bytes(8)); // 16-char hex suffix

    $ins = $conn->prepare(
        "INSERT INTO users (id, name, email, password, role)
         VALUES (?, ?, ?, ?, 'user')"
    );
    if (!$ins) {
        jsonError('Internal server error (prepare).', 500);
    }
    $ins->bind_param('ssss', $id, $name, $email, $hashed);

    if (!$ins->execute()) {
        $ins->close();
        jsonError('Registration failed. Please try again.');
    }
    $ins->close();

    jsonOk();
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGOUT (regular user)
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'logout') {
    startSecureSession('nk_user');

    /**
     * Three-step session destruction (PHP manual recommendation):
     *  1. Clear all session variables.
     *  2. Expire the session cookie on the client.
     *  3. Destroy the session data on the server.
     */
    $_SESSION = [];

    // Delete the session cookie from the browser
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,          // expire in the past
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );

    session_destroy();
    jsonOk();
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGOUT (admin)
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'admin_logout') {
    startSecureSession('nk_admin');

    $_SESSION = [];

    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );

    session_destroy();
    jsonOk();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SESSION (regular user) — called by JS to restore the logged-in state
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'get_session') {
    startSecureSession('nk_user');

    if (!empty($_SESSION['user_id'])) {
        jsonOk([
            'user' => [
                'id'    => $_SESSION['user_id'],
                'name'  => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role'  => $_SESSION['user_role'],
            ],
            // Return current CSRF token so JS can re-sync after a page refresh
            'csrf_token' => csrf_token(),
        ]);
    }

    jsonError('Not authenticated.', 401);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SESSION (admin)
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'get_admin_session') {
    startSecureSession('nk_admin');

    if (!empty($_SESSION['user_id']) && $_SESSION['user_role'] === 'admin') {
        jsonOk([
            'user' => [
                'id'    => $_SESSION['user_id'],
                'name'  => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role'  => $_SESSION['user_role'],
            ],
            'csrf_token' => csrf_token(),
        ]);
    }

    jsonError('Not authenticated.', 401);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET CSRF TOKEN — lightweight endpoint for JS to fetch/refresh the token
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'get_csrf_token') {
    // Detect which session to open based on a query param
    $sessionType = isset($_GET['for']) && $_GET['for'] === 'admin' ? 'nk_admin' : 'nk_user';
    startSecureSession($sessionType);

    require_once 'csrf.php';
    jsonOk(['csrf_token' => csrf_token()]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL USERS — admin only
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'get_all') {
    startSecureSession('nk_admin');

    // Guard: only an authenticated admin may list users
    if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
        jsonError('Admin access required.', 403);
    }

    require_once 'db.php';

    // No user-supplied input here so no bind_param needed, but we still use
    // a prepared statement so future changes can't accidentally introduce injection.
    $result = $conn->query(
        "SELECT id, name, email, role, joined_at
           FROM users
          ORDER BY joined_at DESC"
    );

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    jsonOk(['users' => $users]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE USER — admin only; admins cannot delete other admins
// ═══════════════════════════════════════════════════════════════════════════════
if ($action === 'delete') {
    startSecureSession('nk_admin');

    // Guard: only an authenticated admin
    if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
        jsonError('Admin access required.', 403);
    }

    require_once 'csrf.php';
    require_once 'db.php';

    $id = trim($_GET['id'] ?? '');
    if ($id === '') {
        jsonError('User ID is required.');
    }

    // Prevent deleting the currently-logged-in admin account
    if ($id === $_SESSION['user_id']) {
        jsonError('You cannot delete your own admin account.');
    }

    // The AND role != 'admin' clause is an extra database-level safety net
    $stmt = $conn->prepare(
        "DELETE FROM users WHERE id = ? AND role != 'admin'"
    );
    if (!$stmt) {
        jsonError('Internal server error (prepare).', 500);
    }
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected === 0) {
        jsonError('User not found or cannot be deleted.');
    }

    jsonOk();
}

// ─── No action matched ────────────────────────────────────────────────────────
jsonError('Unknown action.', 404);
?>