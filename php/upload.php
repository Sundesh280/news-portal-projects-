<?php
// upload.php - Handles image file uploads from the admin panel
// Saves uploaded images to the /uploads/ folder and returns the file path

header('Content-Type: application/json; charset=utf-8');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(array('ok' => false, 'error' => 'POST required.'));
    exit;
}

// Check if a file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errMsg = 'No file uploaded.';
    if (isset($_FILES['image'])) {
        $code = $_FILES['image']['error'];
        if ($code === UPLOAD_ERR_INI_SIZE || $code === UPLOAD_ERR_FORM_SIZE) {
            $errMsg = 'File is too large. Max 5MB.';
        }
    }
    echo json_encode(array('ok' => false, 'error' => $errMsg));
    exit;
}

$file = $_FILES['image'];

// Validate file type — only allow images
$allowedTypes = array('image/jpeg', 'image/png', 'image/gif', 'image/webp');
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    echo json_encode(array('ok' => false, 'error' => 'Only JPEG, PNG, GIF, and WebP images are allowed.'));
    exit;
}

// Validate file size — max 5MB
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    echo json_encode(array('ok' => false, 'error' => 'File is too large. Max 5MB.'));
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate a unique file name to prevent overwriting
$ext = '';
switch ($mimeType) {
    case 'image/jpeg': $ext = '.jpg'; break;
    case 'image/png':  $ext = '.png'; break;
    case 'image/gif':  $ext = '.gif'; break;
    case 'image/webp': $ext = '.webp'; break;
}
$fileName = 'img-' . time() . '-' . rand(1000, 9999) . $ext;
$destPath = $uploadDir . $fileName;

// Move the uploaded file from temp to our uploads folder
if (move_uploaded_file($file['tmp_name'], $destPath)) {
    // Return the relative path that the browser can use as an image src
    echo json_encode(array(
        'ok'   => true,
        'path' => 'uploads/' . $fileName
    ));
} else {
    echo json_encode(array('ok' => false, 'error' => 'Failed to save file.'));
}
?>
