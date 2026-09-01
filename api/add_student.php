<?php
// api/add_student.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/config/db.php';

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $class_id        = $input['class_id'] ?? null;
    $student_name    = $input['student_name'] ?? null;
    $enrollment_code = $input['enrollment_code'] ?? null;

    if (!$class_id || !$student_name || !$enrollment_code) {
        echo json_encode([
            'status'  => 'error', 
            'message' => 'Missing required fields.'
        ]);
        exit;
    }

    $sql = "INSERT INTO students (class_id, student_name, enrollment_code, status) 
            VALUES (:class_id, :student_name, :enrollment_code, 'Active')";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':class_id'        => $class_id,
        ':student_name'    => $student_name,
        ':enrollment_code' => $enrollment_code
    ]);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Student added successfully!',
        'id'      => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'Enrollment code already exists.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
