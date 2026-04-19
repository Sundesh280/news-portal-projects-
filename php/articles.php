<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// GET all articles
if ($action === 'get_all') {
    $result = $conn->query("SELECT * FROM articles ORDER BY date DESC, created_at DESC");
    $articles = [];
    while ($row = $result->fetch_assoc()) {
        $articles[] = fmt($row);
    }
    echo json_encode(['ok' => true, 'articles' => $articles]);
    exit;
}

// GET single article
if ($action === 'get_one') {
    $id = $conn->real_escape_string($_GET['id']);
    $result = $conn->query("SELECT * FROM articles WHERE id='$id' LIMIT 1");
    $row = $result->fetch_assoc();
    echo $row ? json_encode(['ok' => true, 'article' => fmt($row)]) : json_encode(['ok' => false, 'error' => 'Not found']);
    exit;
}

// ADD article
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id         = 'art-' . time() . '-' . rand(100,999);
    $category   = $conn->real_escape_string($data['category']   ?? 'general');
    $title      = $conn->real_escape_string($data['title']      ?? '');
    $title_en   = $conn->real_escape_string($data['titleEn']    ?? $title);
    $summary    = $conn->real_escape_string($data['summary']    ?? '');
    $summary_en = $conn->real_escape_string($data['summaryEn']  ?? $summary);
    $content    = $conn->real_escape_string($data['content']    ?? '');
    $content_en = $conn->real_escape_string($data['contentEn']  ?? $content);
    $image      = $conn->real_escape_string($data['image']      ?? '');
    $author     = $conn->real_escape_string($data['author']     ?? '');
    $date       = date('Y-m-d');

    $sql = "INSERT INTO articles (id,category,title,title_en,summary,summary_en,content,content_en,image,author,date,views)
            VALUES ('$id','$category','$title','$title_en','$summary','$summary_en','$content','$content_en','$image','$author','$date',0)";
    echo $conn->query($sql) ? json_encode(['ok' => true, 'id' => $id]) : json_encode(['ok' => false, 'error' => $conn->error]);
    exit;
}

// UPDATE article
if ($action === 'update') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id         = $conn->real_escape_string($data['id']);
    $category   = $conn->real_escape_string($data['category']   ?? 'general');
    $title      = $conn->real_escape_string($data['title']      ?? '');
    $title_en   = $conn->real_escape_string($data['titleEn']    ?? $title);
    $summary    = $conn->real_escape_string($data['summary']    ?? '');
    $summary_en = $conn->real_escape_string($data['summaryEn']  ?? $summary);
    $content    = $conn->real_escape_string($data['content']    ?? '');
    $content_en = $conn->real_escape_string($data['contentEn']  ?? $content);
    $image      = $conn->real_escape_string($data['image']      ?? '');
    $author     = $conn->real_escape_string($data['author']     ?? '');

    $sql = "UPDATE articles SET category='$category',title='$title',title_en='$title_en',
            summary='$summary',summary_en='$summary_en',content='$content',content_en='$content_en',
            image='$image',author='$author' WHERE id='$id'";
    echo $conn->query($sql) ? json_encode(['ok' => true]) : json_encode(['ok' => false, 'error' => $conn->error]);
    exit;
}

// DELETE article
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM articles WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

// INCREMENT views
if ($action === 'increment_views') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("UPDATE articles SET views = views + 1 WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

// TOGGLE stop/show
if ($action === 'toggle_stop') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("UPDATE articles SET is_stopped = NOT is_stopped WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);

function fmt($row) {
    return [
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
        'views'     => (int)$row['views'],
        'isStopped' => (bool)$row['is_stopped'],
    ];
}
?>
