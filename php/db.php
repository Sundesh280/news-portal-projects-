<?php
// db.php - Database Connection
// This file connects to the MySQL database.
// Include this file in any PHP file that needs the database.

$host   = 'localhost';    // MySQL server address
$user   = 'root';         // MySQL username
$pass   = '';             // MySQL password (empty by default in XAMPP)
$dbname = 'nepal_khabar'; // Database name

// PHP 8.1+ throws exceptions by default on mysqli errors.
// We must catch them to return proper JSON to the frontend instead of crashing.
try {
    // Create a connection to the database
    $conn = new mysqli($host, $user, $pass, $dbname);
    
    // Set character encoding to support Nepali and other Unicode text
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'ok'    => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]));
}
?>
