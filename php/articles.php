<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php'; // connect to database

// Read which action the browser is requesting
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------
// GET ALL articles (sorted newest first)
// -------------------------------------------------------
if ($action === 'get_all') {
    $result   = $conn->query("SELECT * FROM articles ORDER BY date DESC, created_at DESC");
    $articles = array();

    while ($row = $result->fetch_assoc()) {
        $articles[] = formatArticle($row);
    }

    echo json_encode(array('ok' => true, 'articles' => $articles));
    exit;
}

// -------------------------------------------------------
// GET ONE article by its ID
// -------------------------------------------------------
if ($action === 'get_one') {
    $id     = $conn->real_escape_string($_GET['id']);
    $result = $conn->query("SELECT * FROM articles WHERE id='$id' LIMIT 1");
    $row    = $result->fetch_assoc();

    if ($row) {
        echo json_encode(array('ok' => true, 'article' => formatArticle($row)));
    } else {
        echo json_encode(array('ok' => false, 'error' => 'Not found'));
    }
    exit;
}

// -------------------------------------------------------
// ADD a new article
// -------------------------------------------------------
if ($action === 'add') {
    // Read the JSON data sent from the browser
    $data = json_decode(file_get_contents('php://input'), true);

    // Generate a unique ID using the current time + random number
    $id = 'art-' . time() . '-' . rand(100, 999);

    // Read and clean each field from the submitted data
    $category   = isset($data['category'])  ? $conn->real_escape_string($data['category'])  : 'general';
    $title      = isset($data['title'])     ? $conn->real_escape_string($data['title'])      : '';
    $title_en   = isset($data['titleEn'])   ? $conn->real_escape_string($data['titleEn'])   : $title;
    $summary    = isset($data['summary'])   ? $conn->real_escape_string($data['summary'])   : '';
    $summary_en = isset($data['summaryEn']) ? $conn->real_escape_string($data['summaryEn']) : $summary;
    $content    = isset($data['content'])   ? $conn->real_escape_string($data['content'])   : '';
    $content_en = isset($data['contentEn']) ? $conn->real_escape_string($data['contentEn']) : $content;
    $image      = isset($data['image'])     ? $conn->real_escape_string($data['image'])     : '';
    $author     = isset($data['author'])    ? $conn->real_escape_string($data['author'])    : '';
    $date       = date('Y-m-d'); // today's date

    // Validate: title is required
    if (!$title_en && !$title) {
        echo json_encode(array('ok' => false, 'error' => 'Title is required.'));
        exit;
    }

    // Validate: content is required
    if (!$content_en && !$content) {
        echo json_encode(array('ok' => false, 'error' => 'Content is required.'));
        exit;
    }

    // Insert into the database
    $sql = "INSERT INTO articles
              (id, category, title, title_en, summary, summary_en, content, content_en, image, author, date, views)
            VALUES
              ('$id','$category','$title','$title_en','$summary','$summary_en','$content','$content_en','$image','$author','$date', 0)";

    if ($conn->query($sql)) {
        echo json_encode(array('ok' => true, 'id' => $id));
    } else {
        echo json_encode(array('ok' => false, 'error' => $conn->error));
    }
    exit;
}

// -------------------------------------------------------
// UPDATE an existing article
// -------------------------------------------------------
if ($action === 'update') {
    $data = json_decode(file_get_contents('php://input'), true);

    $id         = $conn->real_escape_string($data['id']);
    $category   = isset($data['category'])  ? $conn->real_escape_string($data['category'])  : 'general';
    $title      = isset($data['title'])     ? $conn->real_escape_string($data['title'])      : '';
    $title_en   = isset($data['titleEn'])   ? $conn->real_escape_string($data['titleEn'])   : $title;
    $summary    = isset($data['summary'])   ? $conn->real_escape_string($data['summary'])   : '';
    $summary_en = isset($data['summaryEn']) ? $conn->real_escape_string($data['summaryEn']) : $summary;
    $content    = isset($data['content'])   ? $conn->real_escape_string($data['content'])   : '';
    $content_en = isset($data['contentEn']) ? $conn->real_escape_string($data['contentEn']) : $content;
    $image      = isset($data['image'])     ? $conn->real_escape_string($data['image'])     : '';
    $author     = isset($data['author'])    ? $conn->real_escape_string($data['author'])    : '';

    $sql = "UPDATE articles
            SET category='$category', title='$title', title_en='$title_en',
                summary='$summary', summary_en='$summary_en',
                content='$content', content_en='$content_en',
                image='$image', author='$author'
            WHERE id='$id'";

    if ($conn->query($sql)) {
        echo json_encode(array('ok' => true));
    } else {
        echo json_encode(array('ok' => false, 'error' => $conn->error));
    }
    exit;
}

// -------------------------------------------------------
// DELETE an article (also deletes its comments)
// -------------------------------------------------------
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);

    // Delete related comments first so no orphan records remain
    $conn->query("DELETE FROM comments WHERE article_id='$id'");

    // Now delete the article itself
    $conn->query("DELETE FROM articles WHERE id='$id'");

    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// INCREMENT VIEWS — count one more view for this article
// Only counts once per browser session (not every page load)
// -------------------------------------------------------
if ($action === 'increment_views') {
    $id = $conn->real_escape_string($_GET['id']);

    session_start();
    $sessionKey = 'viewed_' . $id; // unique key per article

    if (empty($_SESSION[$sessionKey])) {
        // Not viewed yet this session — add one view
        $conn->query("UPDATE articles SET views = views + 1 WHERE id='$id'");
        $_SESSION[$sessionKey] = true; // mark as viewed
    }

    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// TOGGLE STOP — hide or show an article on the homepage
// -------------------------------------------------------
if ($action === 'toggle_stop') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("UPDATE articles SET is_stopped = NOT is_stopped WHERE id='$id'");
    echo json_encode(array('ok' => true));
    exit;
}

// If no action matched, return an error
echo json_encode(array('ok' => false, 'error' => 'Unknown action'));

// -------------------------------------------------------
// formatArticle - Converts a database row into a clean array
// that matches what the JavaScript frontend expects
// -------------------------------------------------------
function formatArticle($row) {
    return array(
        'id'        => $row['id'],
        'category'  => $row['category'],
        'title'     => $row['title'],
        'titleEn'   => $row['title_en'],
        'summary'   => $row['summary'],
        'summaryEn' => $row['summary_en'],
        'content'   => $row['content'],
        'contentEn' => $row['content_en'],
        'image'     => $row['image'],
        'author'    => $row['author'],
        'date'      => $row['date'],
        'views'     => (int)($row['views']),  // cast to number (never null)
        'isStopped' => (bool)$row['is_stopped'],
    );
}
?>