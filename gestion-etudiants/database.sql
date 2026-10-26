CREATE DATABASE IF NOT EXISTS gestion_etudiants
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_etudiants;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  program VARCHAR(100) NOT NULL,
  year ENUM('L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat') NOT NULL,
  status ENUM('Actif', 'En attente', 'Inactif') NOT NULL DEFAULT 'Actif',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO students (name, email, program, year, status) VALUES
  ('Aina Rakoto', 'aina.rakoto@univ.mg', 'Informatique', 'L2', 'Actif'),
  ('Mickaël Randria', 'mickael.randria@univ.mg', 'Gestion', 'L3', 'Actif'),
  ('Soa Raveloson', 'soa.raveloson@univ.mg', 'Droit', 'L1', 'En attente'),
  ('Tiana Andry', 'tiana.andry@univ.mg', 'Informatique', 'M1', 'Actif'),
  ('Miora Rakotoarisoa', 'miora.rakotoarisoa@univ.mg', 'Économie', 'L2', 'Inactif');
