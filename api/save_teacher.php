<?php
// api/save_teacher.php
header('Content-Type: application/json');
require_once __DIR__ . '/config/db.php';

if (!$conn || $conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection unavailable"]);
    exit;
}

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? '';
$role = $_POST['role'] ?? '';
$dept = $_POST['dept'] ?? '';
$email = $_POST['email'] ?? '';
$salary = $_POST['salary'] ?? 0;
$photo = $_POST['photo'] ?? '';

if ($id) {
    // Update existing record
    $stmt = $conn->prepare("UPDATE teachers SET name=?, role=?, department=?, email=?, salary=?, photo_url=? WHERE emp_id=?");
    $stmt->bind_param("ssssdsi", $name, $role, $dept, $email, $salary, $photo, $id);
} else {
    // Insert new record
    $stmt = $conn->prepare("INSERT INTO teachers (name, role, department, email, salary, photo_url) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssds", $name, $role, $dept, $email, $salary, $photo);
}

if ($stmt && $stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Teacher saved successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt ? $stmt->error : "Query preparation failed"]);
}
?>
