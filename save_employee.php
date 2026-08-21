<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "db_user", "db_password", "your_database_name");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

$name = $_POST['name'] ?? '';
$role = $_POST['role'] ?? '';
$dept = $_POST['dept'] ?? '';
$email = $_POST['email'] ?? '';
$salary = $_POST['salary'] ?? 0;
$org_id = $_POST['org_id'] ?? 1;

$stmt = $conn->prepare("INSERT INTO employees (org_id, name, role, department, email, salary) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("issssd", $org_id, $name, $role, $dept, $email, $salary);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Record saved to MySQL"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
