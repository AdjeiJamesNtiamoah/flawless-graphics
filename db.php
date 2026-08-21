<?php
// db.php
$host = "localhost";
$user = "root";      // Replace with your DB username
$pass = "";          // Replace with your DB password
$dbname = "hr_portal"; // Replace with your DB name

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}
?>
