<?php
// Database Connection
$db_host = 'localhost';
$db_name = 'lucy_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Fetch all registered organizations
    $stmt = $pdo->query("SELECT id, org_name, full_name, email, logo_path, role, created_at FROM users ORDER BY id DESC");
    $organizations = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Registered Organizations - LUCY™</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #311868;
        color: #ffffff;
        padding: 40px 20px;
        min-height: 100vh;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { margin-bottom: 20px; font-size: 24px; }
    table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        overflow: hidden;
    }
    th, td { padding: 14px 18px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    th { background: rgba(255, 255, 255, 0.1); font-size: 13px; font-weight: 600; }
    td { font-size: 13px; }
    .logo-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
    .no-logo { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 14px; }
</style>
</head>
<body>

<div class="container">
    <h1><i class="fa-solid fa-building"></i> Registered Organizations</h1>

    <table>
        <thead>
            <tr>
                <th>Logo</th>
                <th>Organization</th>
                <th>Admin Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered Date</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($organizations)): ?>
                <tr>
                    <td colspan="6" style="text-align: center; color: rgba(255,255,255,0.5);">No registered organizations found.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($organizations as $org): ?>
                    <tr>
                        <td>
                            <?php if (!empty($org['logo_path']) && file_exists($org['logo_path'])): ?>
                                <img src="<?= htmlspecialchars($org['logo_path']) ?>" class="logo-img" alt="Logo">
                            <?php else: ?>
                                <div class="no-logo"><i class="fa-regular fa-image"></i></div>
                            <?php endif; ?>
                        </td>
                        <td><strong><?= htmlspecialchars($org['org_name']) ?></strong></td>
                        <td><?= htmlspecialchars($org['full_name']) ?></td>
                        <td><?= htmlspecialchars($org['email']) ?></td>
                        <td><?= htmlspecialchars($org['role']) ?></td>
                        <td><?= date('M d, Y h:i A', strtotime($org['created_at'])) ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

</body>
</html>
