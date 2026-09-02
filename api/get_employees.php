<?php
// api/get_employees.php
header('Content-Type: application/json');
require_once __DIR__ . '/config/db.php';

if (!$conn || $conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection unavailable", "data" => []]);
    exit;
}

$sql = "SELECT emp_id AS id, name, role, department AS dept, email, salary, photo_url AS photo FROM employees";
$result = $conn->query($sql);

$employees = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $employees]);
?>
