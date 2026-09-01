<?php
// api/login.php
session_start();
require_once __DIR__ . '/config/db.php';

if (!$conn || $conn->connect_error) {
    die("Database connection failed");
}

if (isset($_POST['login'])) {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];

    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = mysqli_query($conn, $sql);

    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);

        if (password_verify($password, $user['password'])) {
            $_SESSION['user'] = $user['fullname'] ?? $user['name'] ?? $email;
            header("Location: ../pages/hr/hr-dashboard.html");
            exit;
        } else {
            echo "Wrong password!";
        }
    } else {
        echo "User not found!";
    }
}
?>