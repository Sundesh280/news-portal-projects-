<?php
// comments.php - Handles adding, editing, deleting and getting comments

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Start the user session so we can check who is logged in
session_name('nk_user');
session_start();

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------
// GET comments for one article
// -------------------------------------------------------
if ($action === 'get') {
    $article_id = $conn->real_escape_string(isset($_GET['article_id']) ? $_GET['article_id'] : '');
    $result     = $conn->query("SELECT * FROM comments WHERE article_id='$article_id' ORDER BY created_at ASC");
    $comments   = array();

    while ($row = $result->fetch_assoc()) {
        $comments[] = array(
            'id'     => $row['id'],
            'userId' => $row['user_id'],
            'name'   => $row['name'],
            'text'   => $row['text_body'],
            'date'   => $row['date'],
        );
    }

    echo json_encode(array('ok' => true, 'comments' => $comments));
    exit;
}

// -------------------------------------------------------
// GET ALL comments (for admin panel, grouped by article)
// -------------------------------------------------------
if ($action === 'get_all') {
    $result = $conn->query(
        "SELECT c.*, a.title_en
         FROM comments c
         LEFT JOIN articles a ON c.article_id = a.id
         ORDER BY c.created_at DESC"
    );

    $all = array(); // will be { articleId: [comments] }

    while ($row = $result->fetch_assoc()) {
        $artId = $row['article_id'];

        // Create empty array for this article if it doesn't exist yet
        if (!isset($all[$artId])) {
            $all[$artId] = array();
        }

        $all[$artId][] = array(
            'id'           => $row['id'],
            'userId'       => $row['user_id'],
            'name'         => $row['name'],
            'text'         => $row['text_body'],
            'date'         => $row['date'],
            'articleTitle' => $row['title_en'],
        );
    }

    echo json_encode(array('ok' => true, 'comments' => $all));
    exit;
}

// -------------------------------------------------------
// ADD a comment (user must be logged in)
// -------------------------------------------------------
if ($action === 'add') {
    // Must be logged in
    if (empty($_SESSION['user_id'])) {
        echo json_encode(array('ok' => false, 'error' => 'Login required.'));
        exit;
    }

    $data       = json_decode(file_get_contents('php://input'), true);
    $article_id = $conn->real_escape_string(isset($data['articleId']) ? $data['articleId'] : '');
    $text       = $conn->real_escape_string(trim(isset($data['text']) ? $data['text'] : ''));
    $user_id    = $conn->real_escape_string($_SESSION['user_id']);
    $name       = $conn->real_escape_string($_SESSION['user_name']);
    $date       = date('d/m/Y, H:i:s'); // current date and time
    $id         = 'cmt-' . time() . '-' . rand(100, 999);

    // Comment text cannot be empty
    if (!$text) {
        echo json_encode(array('ok' => false, 'error' => 'Comment cannot be empty.'));
        exit;
    }

    $sql = "INSERT INTO comments (id, article_id, user_id, name, text_body, date)
            VALUES ('$id', '$article_id', '$user_id', '$name', '$text', '$date')";

    if ($conn->query($sql)) {
        echo json_encode(array(
            'ok'      => true,
            'comment' => array(
                'id'     => $id,
                'userId' => $user_id,
                'name'   => $name,
                'text'   => $text,
                'date'   => $date,
            )
        ));
    } else {
        echo json_encode(array('ok' => false, 'error' => $conn->error));
    }
    exit;
}

// -------------------------------------------------------
// EDIT a comment (only owner or admin can edit)
// -------------------------------------------------------
if ($action === 'edit') {
    if (empty($_SESSION['user_id'])) {
        echo json_encode(array('ok' => false, 'error' => 'Login required.'));
        exit;
    }

    $data    = json_decode(file_get_contents('php://input'), true);
    $id      = $conn->real_escape_string(isset($data['id'])   ? $data['id']   : '');
    $text    = $conn->real_escape_string(trim(isset($data['text']) ? $data['text'] : ''));
    $user_id = $_SESSION['user_id'];
    $role    = $_SESSION['user_role'];

    if (!$text) {
        echo json_encode(array('ok' => false, 'error' => 'Comment cannot be empty.'));
        exit;
    }

    // Admin can edit any comment; regular users can only edit their own
    if ($role === 'admin') {
        $sql = "UPDATE comments SET text_body='$text' WHERE id='$id'";
    } else {
        $sql = "UPDATE comments SET text_body='$text' WHERE id='$id' AND user_id='$user_id'";
    }

    if ($conn->query($sql)) {
        if ($conn->affected_rows > 0) {
            echo json_encode(array('ok' => true));
        } else {
            echo json_encode(array('ok' => false, 'error' => 'Not authorized or comment not found.'));
        }
    } else {
        echo json_encode(array('ok' => false, 'error' => $conn->error));
    }
    exit;
}

// -------------------------------------------------------
// DELETE a comment (only owner or admin can delete)
// -------------------------------------------------------
if ($action === 'delete') {
    if (empty($_SESSION['user_id'])) {
        echo json_encode(array('ok' => false, 'error' => 'Login required.'));
        exit;
    }

    $id      = $conn->real_escape_string($_GET['id']);
    $user_id = $_SESSION['user_id'];
    $role    = $_SESSION['user_role'];

    // Admin can delete any comment; regular user can only delete their own
    if ($role === 'admin') {
        $conn->query("DELETE FROM comments WHERE id='$id'");
    } else {
        $conn->query("DELETE FROM comments WHERE id='$id' AND user_id='$user_id'");
    }

    // Check if a row was actually deleted
    if ($conn->affected_rows > 0) {
        echo json_encode(array('ok' => true));
    } else {
        echo json_encode(array('ok' => false, 'error' => 'Comment not found or not authorised.'));
    }
    exit;
}

echo json_encode(array('ok' => false, 'error' => 'Unknown action'));
?>