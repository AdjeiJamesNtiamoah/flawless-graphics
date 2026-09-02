<?php
// api/config/supabase.php
// Server-side Supabase REST Client for PHP
// Account: AdjeiJamesNtiamoah

class SupabasePHP {
    private static function getEnvVar($key, $default = '') {
        $val = getenv($key);
        if ($val !== false && $val !== '') return $val;
        return isset($_ENV[$key]) ? $_ENV[$key] : $default;
    }

    public static function getUrl() {
        return rtrim(self::getEnvVar('SUPABASE_URL', ''), '/');
    }

    public static function getKey() {
        return self::getEnvVar('SUPABASE_SERVICE_ROLE_KEY') ?: self::getEnvVar('SUPABASE_ANON_KEY', '');
    }

    public static function isConfigured() {
        $url = self::getUrl();
        $key = self::getKey();
        return !empty($url) && !empty($key) && strpos($url, 'supabase.co') !== false;
    }

    public static function query($endpoint, $method = 'GET', $data = null) {
        if (!self::isConfigured()) {
            return ["error" => "Supabase is not configured on server"];
        }

        $url = self::getUrl() . '/rest/v1/' . ltrim($endpoint, '/');
        $key = self::getKey();

        $ch = curl_init($url);
        $headers = [
            'apikey: ' . $key,
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            "status" => $httpCode,
            "data" => json_decode($response, true)
        ];
    }
}
?>
