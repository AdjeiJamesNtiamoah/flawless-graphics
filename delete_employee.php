<?php
// delete_employee.php
header('Content-Type: application/json');
require_once 'db.php';

$id = $_POST['id'] ?? null;

if ($id) {
    $stmt = $conn->prepare("DELETE FROM employees WHERE emp_id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
        exit();
    }
}
echo json_encode(["status" => "error", "message" => "Failed to delete record"]);
?>
