<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

try {
    $pdo = database();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;

    if ($method === 'GET') {
        if ($id !== null) {
            $statement = $pdo->prepare('SELECT id, name, email, program, year, status FROM students WHERE id = ?');
            $statement->execute([$id]);
            $student = $statement->fetch();
            if (!$student) {
                send_json(['error' => 'Étudiant introuvable.'], 404);
            }
            send_json($student);
        }
        $statement = $pdo->query('SELECT id, name, email, program, year, status FROM students ORDER BY name ASC');
        send_json($statement->fetchAll());
    }

    if ($method === 'POST') {
        $student = student_input();
        $statement = $pdo->prepare('INSERT INTO students (name, email, program, year, status) VALUES (:name, :email, :program, :year, :status)');
        $statement->execute($student);
        $student['id'] = (int) $pdo->lastInsertId();
        send_json($student, 201);
    }

    if ($method === 'PUT') {
        if (!$id) {
            send_json(['error' => 'Un identifiant étudiant est requis.'], 400);
        }
        $student = student_input();
        $statement = $pdo->prepare('UPDATE students SET name = :name, email = :email, program = :program, year = :year, status = :status WHERE id = :id');
        $statement->execute($student + ['id' => $id]);
        if ($statement->rowCount() === 0) {
            $exists = $pdo->prepare('SELECT id FROM students WHERE id = ?');
            $exists->execute([$id]);
            if (!$exists->fetch()) {
                send_json(['error' => 'Étudiant introuvable.'], 404);
            }
        }
        send_json(['id' => $id] + $student);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            send_json(['error' => 'Un identifiant étudiant est requis.'], 400);
        }
        $statement = $pdo->prepare('DELETE FROM students WHERE id = ?');
        $statement->execute([$id]);
        if ($statement->rowCount() === 0) {
            send_json(['error' => 'Étudiant introuvable.'], 404);
        }
        http_response_code(204);
        exit;
    }

    send_json(['error' => 'Méthode non autorisée.'], 405);
} catch (PDOException $error) {
    handle_database_error($error);
}
