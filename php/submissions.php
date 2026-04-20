<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// GET ALL submissions
if ($action === 'get_all') {
    $result = $conn->query("SELECT * FROM submissions ORDER BY submitted_at DESC");
    $subs = [];
    while ($row = $result->fetch_assoc()) { $subs[] = fmt($row); }
    echo json_encode(['ok' => true, 'submissions' => $subs]);
    exit;
}

// ADD submission
if ($action === 'add') {
    $data     = json_decode(file_get_contents('php://input'), true);

    $title_en = trim($data['titleEn']  ?? '');
    $title_np = trim($data['titleNp']  ?? '');
    $body_en  = trim($data['bodyEn']   ?? '');
    $body_np  = trim($data['bodyNp']   ?? '');

    // BUG FIX #2 (submissions): Validate title and body are not empty before inserting
    if (!$title_en && !$title_np) {
        echo json_encode(['ok' => false, 'error' => 'Title is required.']);
        exit;
    }
    if (!$body_en && !$body_np) {
        echo json_encode(['ok' => false, 'error' => 'Article body is required.']);
        exit;
    }

    $id       = 'sub-news-' . time() . '-' . rand(100,999);
    $sub_id   = $conn->real_escape_string($data['subscriberId']       ?? '');
    $sub_name = $conn->real_escape_string($data['subscriberName']     ?? '');
    $sub_email= $conn->real_escape_string($data['subscriberEmail']    ?? '');
    $sub_loc  = $conn->real_escape_string($data['subscriberLocation'] ?? '');
    $title_en = $conn->real_escape_string($title_en);
    $title_np = $conn->real_escape_string($title_np);
    $location = $conn->real_escape_string($data['location']   ?? '');
    $date     = $conn->real_escape_string($data['date']       ?? date('Y-m-d'));
    $category = $conn->real_escape_string($data['category']   ?? 'general');
    $sum_en   = $conn->real_escape_string($data['summaryEn']  ?? '');
    $sum_np   = $conn->real_escape_string($data['summaryNp']  ?? '');
    $body_en  = $conn->real_escape_string($body_en);
    $body_np  = $conn->real_escape_string($body_np);
    $source   = $conn->real_escape_string($data['source']     ?? '');
    $photo    = $conn->real_escape_string($data['photo']      ?? '');

    $sql = "INSERT INTO submissions
              (id,subscriber_id,subscriber_name,subscriber_email,subscriber_location,
               title_en,title_np,location,date,category,
               summary_en,summary_np,body_en,body_np,source,photo,status)
            VALUES
              ('$id','$sub_id','$sub_name','$sub_email','$sub_loc',
               '$title_en','$title_np','$location','$date','$category',
               '$sum_en','$sum_np','$body_en','$body_np','$source','$photo','pending')";
    echo $conn->query($sql) ? json_encode(['ok' => true, 'id' => $id]) : json_encode(['ok' => false, 'error' => $conn->error]);
    exit;
}

// UPDATE STATUS
if ($action === 'update_status') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = $conn->real_escape_string($data['id']     ?? '');
    $status = $conn->real_escape_string($data['status'] ?? 'pending');
    if (!in_array($status, ['pending','approved','rejected'])) { echo json_encode(['ok' => false, 'error' => 'Invalid status.']); exit; }
    $conn->query("UPDATE submissions SET status='$status' WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

// DELETE submission
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM submissions WHERE id='$id'");
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);

function fmt($row) {
    return ['id' => $row['id'], 'subscriberId' => $row['subscriber_id'], 'subscriberName' => $row['subscriber_name'], 'subscriberEmail' => $row['subscriber_email'], 'subscriberLocation' => $row['subscriber_location'], 'titleEn' => $row['title_en'], 'titleNp' => $row['title_np'], 'location' => $row['location'], 'date' => $row['date'], 'category' => $row['category'], 'summaryEn' => $row['summary_en'], 'summaryNp' => $row['summary_np'], 'bodyEn' => $row['body_en'], 'bodyNp' => $row['body_np'], 'source' => $row['source'], 'photo' => $row['photo'], 'submittedAt' => $row['submitted_at'], 'status' => $row['status']];
}
?>
