<?php
// submissions.php - Handles news tip submissions from the public

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------
// GET ALL submissions (admin panel)
// -------------------------------------------------------
if ($action === 'get_all') {
    $result = $conn->query("SELECT * FROM submissions ORDER BY submitted_at DESC");
    $subs   = array();

    while ($row = $result->fetch_assoc()) {
        $subs[] = formatSubmission($row);
    }

    echo json_encode(array('ok' => true, 'submissions' => $subs));
    exit;
}

// -------------------------------------------------------
// ADD a new submission (public user sends a news tip)
// -------------------------------------------------------
if ($action === 'add') {
    $data     = json_decode(file_get_contents('php://input'), true);

    // Read title and body first (before escaping) to validate them
    $title_en = trim(isset($data['titleEn']) ? $data['titleEn'] : '');
    $title_np = trim(isset($data['titleNp']) ? $data['titleNp'] : '');
    $body_en  = trim(isset($data['bodyEn'])  ? $data['bodyEn']  : '');
    $body_np  = trim(isset($data['bodyNp'])  ? $data['bodyNp']  : '');

    // At least one title is required
    if (!$title_en && !$title_np) {
        echo json_encode(array('ok' => false, 'error' => 'Title is required.'));
        exit;
    }

    // At least one body/content is required
    if (!$body_en && !$body_np) {
        echo json_encode(array('ok' => false, 'error' => 'Article body is required.'));
        exit;
    }

    // Generate a unique ID
    $id = 'sub-news-' . time() . '-' . rand(100, 999);

    // Clean all fields before inserting into the database
    $sub_id    = $conn->real_escape_string(isset($data['subscriberId'])       ? $data['subscriberId']       : '');
    $sub_name  = $conn->real_escape_string(isset($data['subscriberName'])     ? $data['subscriberName']     : '');
    $sub_email = $conn->real_escape_string(isset($data['subscriberEmail'])    ? $data['subscriberEmail']    : '');
    $sub_loc   = $conn->real_escape_string(isset($data['subscriberLocation']) ? $data['subscriberLocation'] : '');
    $title_en  = $conn->real_escape_string($title_en);
    $title_np  = $conn->real_escape_string($title_np);
    $location  = $conn->real_escape_string(isset($data['location'])   ? $data['location']   : '');
    $date      = $conn->real_escape_string(isset($data['date'])       ? $data['date']       : date('Y-m-d'));
    $category  = $conn->real_escape_string(isset($data['category'])   ? $data['category']   : 'general');
    $sum_en    = $conn->real_escape_string(isset($data['summaryEn'])  ? $data['summaryEn']  : '');
    $sum_np    = $conn->real_escape_string(isset($data['summaryNp'])  ? $data['summaryNp']  : '');
    $body_en   = $conn->real_escape_string($body_en);
    $body_np   = $conn->real_escape_string($body_np);
    $source    = $conn->real_escape_string(isset($data['source'])     ? $data['source']     : '');
    $photo     = $conn->real_escape_string(isset($data['photo'])      ? $data['photo']      : '');

    $sql = "INSERT INTO submissions
              (id, subscriber_id, subscriber_name, subscriber_email, subscriber_location,
               title_en, title_np, location, date, category,
               summary_en, summary_np, body_en, body_np, source, photo, status)
            VALUES
              ('$id', '$sub_id', '$sub_name', '$sub_email', '$sub_loc',
               '$title_en', '$title_np', '$location', '$date', '$category',
               '$sum_en', '$sum_np', '$body_en', '$body_np', '$source', '$photo', 'pending')";

    if ($conn->query($sql)) {
        echo json_encode(array('ok' => true, 'id' => $id));
    } else {
        echo json_encode(array('ok' => false, 'error' => $conn->error));
    }
    exit;
}

// -------------------------------------------------------
// UPDATE STATUS - admin approves, rejects, or sets pending
// -------------------------------------------------------
if ($action === 'update_status') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = $conn->real_escape_string(isset($data['id'])     ? $data['id']     : '');
    $status = $conn->real_escape_string(isset($data['status']) ? $data['status'] : 'pending');

    // Only allow these three status values
    $allowed = array('pending', 'approved', 'rejected');
    if (!in_array($status, $allowed)) {
        echo json_encode(array('ok' => false, 'error' => 'Invalid status.'));
        exit;
    }

    $conn->query("UPDATE submissions SET status='$status' WHERE id='$id'");
    echo json_encode(array('ok' => true));
    exit;
}

// -------------------------------------------------------
// DELETE a submission
// -------------------------------------------------------
if ($action === 'delete') {
    $id = $conn->real_escape_string($_GET['id']);
    $conn->query("DELETE FROM submissions WHERE id='$id'");
    echo json_encode(array('ok' => true));
    exit;
}

echo json_encode(array('ok' => false, 'error' => 'Unknown action'));

// -------------------------------------------------------
// formatSubmission - converts a DB row into a clean array
// -------------------------------------------------------
function formatSubmission($row) {
    return array(
        'id'                 => $row['id'],
        'subscriberId'       => $row['subscriber_id'],
        'subscriberName'     => $row['subscriber_name'],
        'subscriberEmail'    => $row['subscriber_email'],
        'subscriberLocation' => $row['subscriber_location'],
        'titleEn'            => $row['title_en'],
        'titleNp'            => $row['title_np'],
        'location'           => $row['location'],
        'date'               => $row['date'],
        'category'           => $row['category'],
        'summaryEn'          => $row['summary_en'],
        'summaryNp'          => $row['summary_np'],
        'bodyEn'             => $row['body_en'],
        'bodyNp'             => $row['body_np'],
        'source'             => $row['source'],
        'photo'              => $row['photo'],
        'submittedAt'        => $row['submitted_at'],
        'status'             => $row['status'],
    );
}
?>