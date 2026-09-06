<?php
// api/get_teachers.php
header('Content-Type: application/json');
require_once __DIR__ . '/config/db.php';

if (!$conn || $conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection unavailable", "data" => []]);
    exit;
}

$sql = "SELECT emp_id AS id, name, role, department AS dept, email, salary, photo_url AS photo FROM teachers";
$result = $conn->query($sql);

$teachers = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $teachers[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $teachers]);
?>
