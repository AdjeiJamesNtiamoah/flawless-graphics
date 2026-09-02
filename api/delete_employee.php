<?php
// api/delete_employee.php
header('Content-Type: application/json');
require_once __DIR__ . '/config/db.php';

if (!$conn || $conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection unavailable"]);
    exit;
}

$id = $_POST['id'] ?? null;

if ($id) {
    $stmt = $conn->prepare("DELETE FROM employees WHERE emp_id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
            exit();
        }
    }
}
echo json_encode(["status" => "error", "message" => "Failed to delete record"]);
?>
