<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$host = 'localhost';
$db   = 'your_database_name'; // Change to your DB name
$user = 'root';               // Change to your DB user
$pass = '';                   // Change to your DB password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

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
