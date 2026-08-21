<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Database credentials
$host = 'localhost';
$db   = 'your_database_name'; // Replace with your phpMyAdmin DB name
$user = 'root';               // Replace with your DB username
$pass = '';                   // Replace with your DB password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Read JSON payload from POST request
    $input = json_decode(file_get_contents('php://input'), true);

    $class_id       = $input['class_id'] ?? null;
    $student_name   = $input['student_name'] ?? null;
    $enrollment_code = $input['enrollment_code'] ?? null;

    // Basic validation
    if (!$class_id || !$student_name || !$enrollment_code) {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Missing required fields: class_id, student_name, and enrollment_code are required.'
        ]);
        exit;
    }

    // Insert student into database
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
    // Handle duplicate enrollment codes or SQL errors
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'Enrollment code already exists.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
