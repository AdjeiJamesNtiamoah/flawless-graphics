<?php
// Enable error reporting to diagnose blank screens
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$db_host = 'localhost';
$db_name = 'flawless graphyx'; // Recommended: use underscore instead of space
$db_user = 'root';
$db_pass = '';

$message = '';
$isError = false;

// 1. Automatically connect and build DB/Table if missing
try {
    $pdo = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    // Create database if it does not exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db_name`");
    
    // Create users table if missing
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `org_name` VARCHAR(255) NOT NULL,
        `full_name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `logo_path` VARCHAR(255) NULL,
        `role` VARCHAR(50) DEFAULT 'admin',
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

} catch (PDOException $e) {
    die("Database Initialization Failed: " . $e->getMessage());
}

// 2. Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $orgName  = trim($_POST['orgName'] ?? '');
    $fullName = trim($_POST['fullName'] ?? '');
    $email    = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';
    $logoPath = null;

    if (empty($orgName) || empty($fullName) || empty($email) || empty($password)) {
        $message = "Please complete all required fields.";
        $isError = true;
    } elseif (strlen($password) < 8) {
        $message = "Password must be at least 8 characters.";
        $isError = true;
    } else {
        try {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->fetch()) {
                $message = "Email address is already registered.";
                $isError = true;
            } else {
                if (isset($_FILES['orgLogo']) && $_FILES['orgLogo']['error'] === UPLOAD_ERR_OK) {
                    $fileTmpPath = $_FILES['orgLogo']['tmp_name'];
                    $fileName    = $_FILES['orgLogo']['name'];
                    $fileSize    = $_FILES['orgLogo']['size'];
                    $ext         = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

                    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

                    if ($fileSize > 2 * 1024 * 1024) {
                        $message = "Logo image size must be under 2MB.";
                        $isError = true;
                    } elseif (!in_array($ext, $allowedExts)) {
                        $message = "Invalid image type. Allowed: JPG, PNG, WEBP, SVG.";
                        $isError = true;
                    } else {
                        $uploadDir = 'uploads/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0755, true);
                        }
                        $newFileName = uniqid('logo_', true) . '.' . $ext;
                        $logoPath    = $uploadDir . $newFileName;
                        move_uploaded_file($fileTmpPath, $logoPath);
                    }
                }

                if (!$isError) {
                    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

                    $insertStmt = $pdo->prepare("INSERT INTO users (org_name, full_name, email, password, logo_path, role, created_at) VALUES (?, ?, ?, ?, ?, 'admin', NOW())");
                    $insertStmt->execute([$orgName, $fullName, $email, $hashedPassword, $logoPath]);

                    $message = "Registration successful! Redirecting to login...";
                    $isError = false;

                    header("refresh:2;url=site-login.php");
                }
            }
        } catch (PDOException $e) {
            $message = "Registration Error: " . $e->getMessage();
            $isError = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Register Organization</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #9292db;
        background-image: 
            radial-gradient(at 0% 0%, #a5a6f6 0px, transparent 50%),
            radial-gradient(at 100% 100%, #311868 0px, transparent 50%),
            radial-gradient(at 50% 50%, #4c2882 0px, transparent 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        color: #ffffff;
    }
    .app-window {
        width: 100%;
        max-width: 1100px;
        background: #3c1e78;
        border-radius: 20px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .window-header {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-1 { background: #9c8ce8; }
    .dot-2 { background: #72efdd; }
    .dot-3 { background: #92b0ff; }

    .main-container { display: flex; flex-direction: row; min-height: 620px; position: relative; }
    .hero-section {
        flex: 1; padding: 50px; display: flex; flex-direction: column;
        justify-content: space-between; position: relative; overflow: hidden;
    }
    .ribbon-container { position: absolute; top: -40px; left: -40px; width: 320px; height: 320px; pointer-events: none; }
    .ribbon { position: absolute; border-radius: 50%; border: 28px solid transparent; }
    .ribbon-1 { width: 240px; height: 240px; border-top-color: #5ce1e6; border-right-color: #5ce1e6; transform: rotate(-25deg); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3)); }
    .ribbon-2 { width: 200px; height: 200px; top: 30px; left: 20px; border-bottom-color: #8c52ff; border-left-color: #8c52ff; transform: rotate(15deg); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3)); }
    .brand-logo { display: flex; align-items: center; gap: 12px; z-index: 2; margin-top: 140px; }
    .logo-icon { font-size: 32px; color: #ffffff; }
    .brand-title { font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .brand-subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 1px; }
    .hero-text { z-index: 2; margin-top: 30px; max-width: 360px; }
    .hero-text h1 { font-size: 22px; font-weight: 500; line-height: 1.4; color: #ffffff; }
    .hero-text span { font-weight: 700; }
    .hero-buttons { display: flex; gap: 15px; align-items: center; margin-top: 30px; z-index: 2; }
    .btn-outline { border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.05); color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.5); }
    .link-subtle { color: rgba(255, 255, 255, 0.7); font-size: 12px; text-decoration: none; font-weight: 500; }
    .link-subtle:hover { color: #ffffff; text-decoration: underline; }

    .form-section { flex: 1; padding: 40px; display: flex; justify-content: center; align-items: center; }
    .card { width: 100%; max-width: 420px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; backdrop-filter: blur(20px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .card h2 { font-size: 20px; font-weight: 600; margin-bottom: 24px; color: #ffffff; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.8); margin-bottom: 6px; }

    .logo-upload-container { display: flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.08); border: 1px dashed rgba(255, 255, 255, 0.25); border-radius: 10px; padding: 12px 14px; transition: all 0.2s ease; }
    .logo-upload-container:hover { border-color: #a2e8dd; background: rgba(255, 255, 255, 0.1); }
    .logo-preview-box { width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
    .logo-preview-box img { width: 100%; height: 100%; object-fit: cover; }
    .logo-preview-box i { font-size: 18px; color: rgba(255, 255, 255, 0.5); }
    .logo-upload-actions { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .btn-upload-trigger { background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; width: fit-content; transition: all 0.2s ease; }
    .btn-upload-trigger:hover { background: rgba(255, 255, 255, 0.25); }
    .logo-hint { font-size: 10px; color: rgba(255, 255, 255, 0.5); }
    .btn-remove-logo { color: #ff9999; font-size: 11px; background: none; border: none; cursor: pointer; text-align: left; display: none; }

    .input-wrapper { position: relative; display: flex; align-items: center; }
    input[type="text"], input[type="email"], input[type="password"] {
        width: 100%; padding: 12px 40px 12px 14px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #ffffff; font-size: 13px; font-family: inherit; outline: none; transition: all 0.2s ease;
    }
    input::placeholder { color: rgba(255, 255, 255, 0.35); }
    input:focus { border-color: #a2e8dd; background: rgba(255, 255, 255, 0.12); box-shadow: 0 0 0 3px rgba(162, 232, 221, 0.2); }
    .field-icon { position: absolute; right: 14px; color: rgba(255, 255, 255, 0.5); font-size: 14px; cursor: pointer; }

    .btn-submit { width: 100%; padding: 12px; background: #a2e8dd; border: none; border-radius: 8px; color: #1a0836; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 10px; transition: all 0.2s ease; }
    .btn-submit:hover { background: #8ce2d5; transform: translateY(-1px); }

    .footer-text { text-align: center; margin-top: 20px; font-size: 12px; color: rgba(255, 255, 255, 0.7); }
    .footer-text a { color: #ffffff; font-weight: 600; text-decoration: none; }
    .footer-text a:hover { text-decoration: underline; }

    .msg { padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; font-weight: 500; }
    .msg.error { background: rgba(235, 87, 87, 0.2); border: 1px solid #eb5757; color: #ff9999; }
    .msg.success { background: rgba(39, 174, 96, 0.2); border: 1px solid #27ae60; color: #7bed9f; }

    @media (max-width: 850px) {
        .main-container { flex-direction: column; }
        .hero-section { padding: 30px; }
        .ribbon-container { transform: scale(0.7); top: -60px; left: -60px; }
        .brand-logo { margin-top: 60px; }
    }
</style>
</head>
<body>

<div class="app-window">
    <div class="window-header">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
    </div>

    <div class="main-container">
        <div class="hero-section">
            <div class="ribbon-container">
                <div class="ribbon ribbon-1"></div>
                <div class="ribbon ribbon-2"></div>
            </div>

            <div class="brand-logo">
                <i class="fa-solid fa-elephant logo-icon"></i>
                <div>
                    <div class="brand-title">LUCY™</div>
                    <div class="brand-subtitle">Innovation Starts Here</div>
                </div>
            </div>

            <div class="hero-text">
                <h1>You will be registering your enterprise on <span>LUCY™</span> Core Network</h1>
            </div>

            <div class="hero-buttons">
                <button class="btn-outline" type="button">What to Expect?</button>
                <a href="#" class="link-subtle">Other Future Applications</a>
            </div>
        </div>

        <div class="form-section">
            <div class="card">
                <h2>Register Organization</h2>

                <?php if (!empty($message)): ?>
                    <div class="msg <?= $isError ? 'error' : 'success' ?>">
                        <?= htmlspecialchars($message) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="index.php" enctype="multipart/form-data">
                    <div class="form-group">
                        <label>Organization Logo (Optional)</label>
                        <div class="logo-upload-container">
                            <div class="logo-preview-box" id="logoPreviewBox">
                                <i class="fa-regular fa-image" id="logoPlaceholderIcon"></i>
                            </div>
                            <div class="logo-upload-actions">
                                <input type="file" name="orgLogo" id="orgLogo" accept="image/png, image/jpeg, image/svg+xml, image/webp" style="display: none;" onchange="handleLogoChange(event)">
                                <button type="button" class="btn-upload-trigger" onclick="document.getElementById('orgLogo').click()">
                                    <i class="fa-solid fa-upload"></i> Upload Logo
                                </button>
                                <span class="logo-hint" id="logoHint">PNG, JPG or SVG (Max 2MB)</span>
                                <button type="button" class="btn-remove-logo" id="removeLogoBtn" onclick="removeLogo()">Remove</button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="orgName">Organization Name</label>
                        <div class="input-wrapper">
                            <input type="text" name="orgName" id="orgName" placeholder="Flawless Graphics Ltd" value="<?= htmlspecialchars($_POST['orgName'] ?? '') ?>" required>
                            <i class="fa-regular fa-building field-icon"></i>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="fullName">Admin Full Name</label>
                        <div class="input-wrapper">
                            <input type="text" name="fullName" id="fullName" placeholder="John Doe" value="<?= htmlspecialchars($_POST['fullName'] ?? '') ?>" required>
                            <i class="fa-regular fa-user field-icon"></i>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email (Login Username)</label>
                        <div class="input-wrapper">
                            <input type="email" name="email" id="email" placeholder="admin@company.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
                            <i class="fa-regular fa-envelope field-icon"></i>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <input type="password" name="password" id="password" placeholder="Minimum 8 characters" required minlength="8">
                            <i class="fa-regular fa-eye-slash field-icon" id="togglePassword" onclick="togglePasswordVisibility()"></i>
                        </div>
                    </div>

                    <button type="submit" id="submitBtn" class="btn-submit">Register</button>
                </form>

                <div class="footer-text">
                    Already registered? <a href="site-login.php">Login</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePassword");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

function handleLogoChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("Logo image size must be under 2MB.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("logoPreviewBox").innerHTML = `<img src="${e.target.result}" alt="Logo Preview">`;
        document.getElementById("removeLogoBtn").style.display = "inline-block";
        document.getElementById("logoHint").style.display = "none";
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    document.getElementById("orgLogo").value = "";
    document.getElementById("logoPreviewBox").innerHTML = `<i class="fa-regular fa-image" id="logoPlaceholderIcon"></i>`;
    document.getElementById("removeLogoBtn").style.display = "none";
    document.getElementById("logoHint").style.display = "inline";
}
</script>
</body>
</html>
