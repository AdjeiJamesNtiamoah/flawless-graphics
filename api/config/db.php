<?php
// api/config/db.php - Central Database Configuration with Supabase PostgreSQL & MySQL Support

$supabaseHost = getenv('SUPABASE_DB_HOST');
$supabaseUser = getenv('SUPABASE_DB_USER');
$supabasePass = getenv('SUPABASE_DB_PASSWORD');
$supabaseDb   = getenv('SUPABASE_DB_NAME') ?: 'postgres';
$supabasePort = getenv('SUPABASE_DB_PORT') ?: 5432;

$conn = null;
$pdo = null;

if ($supabaseHost && $supabaseUser && $supabasePass) {
    // 1. Connect via Supabase PostgreSQL
    try {
        $dsn = "pgsql:host=$supabaseHost;port=$supabasePort;dbname=$supabaseDb;";
        $pdo = new PDO($dsn, $supabaseUser, $supabasePass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $e) {
        $pdo = null;
    }
} else {
    // 2. Fallback to Local MySQL
    $host = getenv('DB_HOST') ?: 'localhost';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $dbname = getenv('DB_NAME') ?: 'flawless_graphics';

    $conn = @new mysqli($host, $user, $pass, $dbname);
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $e) {
        $pdo = null;
    }
}
?>
