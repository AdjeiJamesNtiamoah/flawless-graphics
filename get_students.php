<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$db   = 'your_database_name'; // Replace with your phpMyAdmin DB name
$user = 'root';               // Replace with your DB username
$pass = '';                   // Replace with your DB password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $sql = "SELECT 
                students.id,
                students.student_name,
                students.enrollment_code,
                students.status,
                classes.class_name,
                teachers.name AS teacher_name
            FROM students
            JOIN classes ON students.class_id = classes.id
            JOIN teachers ON classes.teacher_id = teachers.id
            ORDER BY students.id DESC";

    $stmt = $pdo->query($sql);
    $students = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $students]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
