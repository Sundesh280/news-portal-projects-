<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

session_name('nk_user');
session_start();
require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// GET comments for an article
if ($action === 'get') {
    $article_id = $conn->real_escape_string($_GET['article_id'] ?? '');
    $result = $conn->query("SELECT * FROM comments WHERE article_id='$article_id' ORDER BY created_at ASC");
    $comments = [];
    while ($row = $result->fetch_assoc()) {
        $comments[] = ['id' => $row['id'], 'userId' => $row['user_id'], 'name' => $row['name'], 'text' => $row['text_body'], 'date' => $row['date']];
    }
    echo json_encode(['ok' => true, 'comments' => $comments]);
    exit;
}

// GET ALL comments (admin)
if ($action === 'get_all') {
    $result = $conn->query("SELECT c.*, a.title_en FROM comments c LEFT JOIN articles a ON c.article_id = a.id ORDER BY c.created_at DESC");
    $all = [];
    while ($row = $result->fetch_assoc()) {
        $artId = $row['article_id'];
        if (!isset($all[$artId])) $all[$artId] = [];
        $all[$artId][] = ['id' => $row['id'], 'userId' => $row['user_id'], 'name' => $row['name'], 'text' => $row['text_body'], 'date' => $row['date'], 'articleTitle' => $row['title_en']];
    }
    echo json_encode(['ok' => true, 'comments' => $all]);
    exit;
}

// ADD comment
if ($action === 'add') {
    if (empty($_SESSION['user_id'])) { echo json_encode(['ok' => false, 'error' => 'Login required.']); exit; }

    $data       = json_decode(file_get_contents('php://input'), true);
    $article_id = $conn->real_escape_string($data['articleId'] ?? '');
    $text       = $conn->real_escape_string(trim($data['text'] ?? ''));
    $user_id    = $conn->real_escape_string($_SESSION['user_id']);
    $name       = $conn->real_escape_string($_SESSION['user_name']);
    $date       = date('d/m/Y, H:i:s');
    $id         = 'cmt-' . time() . '-' . rand(100,999);

    if (!$text) { echo json_encode(['ok' => false, 'error' => 'Comment cannot be empty.']); exit; }

    $sql = "INSERT INTO comments (id, article_id, user_id, name, text_body, date) VALUES ('$id','$article_id','$user_id','$name','$text','$date')";
    if ($conn->query($sql)) {
        echo json_encode(['ok' => true, 'comment' => ['id' => $id, 'userId' => $user_id, 'name' => $name, 'text' => $text, 'date' => $date]]);
    } else {
        echo json_encode(['ok' => false, 'error' => $conn->error]);
    }
    exit;
}

// EDIT comment
if ($action === 'edit') {
    if (empty($_SESSION['user_id'])) { echo json_encode(['ok' => false, 'error' => 'Login required.']); exit; }
    $data    = json_decode(file_get_contents('php://input'), true);
    $id      = $conn->real_escape_string($data['id'] ?? '');
    $text    = $conn->real_escape_string(trim($data['text'] ?? ''));
    $user_id = $_SESSION['user_id'];
    $role    = $_SESSION['user_role'];

    if (!$text) { echo json_encode(['ok' => false, 'error' => 'Comment cannot be empty.']); exit; }

    if ($role === 'admin') {
        $sql = "UPDATE comments SET text_body='$text' WHERE id='$id'";
    } else {
        $sql = "UPDATE comments SET text_body='$text' WHERE id='$id' AND user_id='$user_id'";
    }

    if ($conn->query($sql)) {
        if ($conn->affected_rows > 0) {
            echo json_encode(['ok' => true]);
        } else {
            echo json_encode(['ok' => false, 'error' => 'Not authorized or comment not found.']);
        }
    } else {
        echo json_encode(['ok' => false, 'error' => $conn->error]);
    }
    exit;
}

// DELETE comment
if ($action === 'delete') {
    if (empty($_SESSION['user_id'])) { echo json_encode(['ok' => false, 'error' => 'Login required.']); exit; }
    $id      = $conn->real_escape_string($_GET['id']);
    $user_id = $_SESSION['user_id'];
    $role    = $_SESSION['user_role'];

    if ($role === 'admin') {
        $conn->query("DELETE FROM comments WHERE id='$id'");
    } else {
        $conn->query("DELETE FROM comments WHERE id='$id' AND user_id='$user_id'");
    }

    // BUG FIX #3: Check affected_rows to confirm deletion actually happened
    if ($conn->affected_rows > 0) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'Comment not found or not authorised.']);
    }
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
?>
