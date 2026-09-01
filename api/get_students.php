<?php
// api/get_students.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config/db.php';

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}

try {
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
    $students = $stmt ? $stmt->fetchAll() : [];

    echo json_encode(['status' => 'success', 'data' => $students]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
