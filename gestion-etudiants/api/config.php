<?php
declare(strict_types=1);

function send_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $name = getenv('DB_NAME') ?: 'gestion_etudiants';
    $user = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: '';
    $pdo = new PDO(
        "mysql:host={$host};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    return $pdo;
}

function student_input(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($data)) {
        send_json(['error' => 'Le corps de la requête doit être un objet JSON.'], 400);
    }

    $student = [
        'name' => trim((string) ($data['name'] ?? '')),
        'email' => trim((string) ($data['email'] ?? '')),
        'program' => trim((string) ($data['program'] ?? '')),
        'year' => trim((string) ($data['year'] ?? '')),
        'status' => trim((string) ($data['status'] ?? '')),
    ];
    if ($student['name'] === '' || mb_strlen($student['name']) > 120) {
        send_json(['error' => 'Le nom est obligatoire et doit contenir au plus 120 caractères.'], 422);
    }
    if (!filter_var($student['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($student['email']) > 190) {
        send_json(['error' => 'Veuillez fournir une adresse e-mail valide.'], 422);
    }
    if ($student['program'] === '' || mb_strlen($student['program']) > 100) {
        send_json(['error' => 'La filière est obligatoire.'], 422);
    }
    if (!in_array($student['year'], ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'], true)) {
        send_json(['error' => 'Le niveau sélectionné est invalide.'], 422);
    }
    if (!in_array($student['status'], ['Actif', 'En attente', 'Inactif'], true)) {
        send_json(['error' => 'Le statut sélectionné est invalide.'], 422);
    }

    return $student;
}

function handle_database_error(PDOException $error): void
{
    if ($error->getCode() === '23000') {
        send_json(['error' => 'Cette adresse e-mail est déjà attribuée à un étudiant.'], 409);
    }
    error_log($error->getMessage());
    send_json(['error' => 'La base de données est indisponible. Vérifiez XAMPP et la configuration MySQL.'], 500);
}
