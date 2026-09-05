<?php
// api/organizations.php
require_once __DIR__ . '/config/db.php';
if (file_exists(__DIR__ . '/config/supabase.php')) {
    require_once __DIR__ . '/config/supabase.php';
}

$organizations = [];

// 1. Fetch from Supabase Cloud if configured
if (class_exists('SupabasePHP') && SupabasePHP::isConfigured()) {
    $res = SupabasePHP::query('organizations?select=*&order=created_at.desc');
    if (!empty($res['data']) && is_array($res['data'])) {
        $organizations = $res['data'];
    }
}

// 2. Query Database (Supabase Postgres or local MySQL)
if (empty($organizations) && $pdo) {
    try {
        $stmt = $pdo->query("SELECT id, org_name, admin_name, email, logo_path, created_at, updated_at FROM organizations ORDER BY created_at DESC");
        $organizations = $stmt ? $stmt->fetchAll() : [];
    } catch (PDOException $e) {
        try {
            $stmt = $pdo->query("SELECT id, org_name, full_name AS admin_name, email, logo_path, created_at, created_at AS updated_at FROM users ORDER BY id DESC");
            $organizations = $stmt ? $stmt->fetchAll() : [];
        } catch (PDOException $e2) {
            $organizations = [];
        }
    }
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
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 24px; }
    .btn-back { color: #a2e8dd; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
    .btn-back:hover { text-decoration: underline; }
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
    <div class="header-row">
        <h1><i class="fa-solid fa-building"></i> Registered Organizations</h1>
        <a href="../welcome.html" class="btn-back"><i class="fa-solid fa-arrow-left"></i> Back to Hub</a>
    </div>

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
                    <?php 
                        $logo = $org['logo_path'] ?? '';
                        $hasLogo = !empty($logo) && (
                            strpos($logo, 'http') === 0 || 
                            strpos($logo, 'data:image') === 0 || 
                            file_exists($logo)
                        );
                    ?>
                    <tr>
                        <td>
                            <?php if ($hasLogo): ?>
                                <img src="<?= htmlspecialchars($logo) ?>" class="logo-img" alt="Logo">
                            <?php else: ?>
                                <div class="no-logo"><i class="fa-regular fa-building"></i></div>
                            <?php endif; ?>
                        </td>
                        <td><strong><?= htmlspecialchars($org['org_name'] ?? '—') ?></strong></td>
                        <td><?= htmlspecialchars($org['admin_name'] ?? $org['full_name'] ?? 'Admin') ?></td>
                        <td><?= htmlspecialchars($org['email'] ?? '—') ?></td>
                        <td><span style="background: rgba(114, 239, 221, 0.15); color: #72efdd; padding: 3px 8px; border-radius: 6px; font-size: 11px;"><?= htmlspecialchars($org['role'] ?? 'Admin') ?></span></td>
                        <td><?= !empty($org['created_at']) ? date('M d, Y h:i A', strtotime($org['created_at'])) : '—' ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

</body>
</html>
