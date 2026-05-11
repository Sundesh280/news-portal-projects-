<?php
// db.php - Database Connection
// This file connects to the MySQL database.
// Include this file in any PHP file that needs the database.

$host   = 'localhost';   // MySQL server address
$user   = 'root';        // MySQL username
$pass   = 'S@n1desh';   // MySQL password
$dbname = 'nepal_khabar'; // Database name

// Create a connection to the database
$conn = new mysqli($host, $user, $pass, $dbname);

// If connection failed, stop and show an error message
if ($conn->connect_error) {
    die(json_encode([
        'ok'    => false,
        'error' => 'DB connection failed: ' . $conn->connect_error
    ]));
}

// Set character encoding to support Nepali and other Unicode text
$conn->set_charset('utf8mb4');
?>
