<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "flawless_graphics";

$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>