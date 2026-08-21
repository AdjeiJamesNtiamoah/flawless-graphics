<?php
// get_employees.php
header('Content-Type: application/json');
require_once 'db.php';

$sql = "SELECT emp_id AS id, name, role, department AS dept, email, salary, photo_url AS photo FROM employees";
$result = $conn->query($sql);

$employees = [];
while ($row = $result->fetch_assoc()) {
    $employees[] = $row;
}

echo json_encode(["status" => "success", "data" => $employees]);
?>
