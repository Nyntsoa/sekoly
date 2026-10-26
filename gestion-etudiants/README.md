# Gestion des étudiants

Application React avec une API PHP et une base MySQL pour XAMPP.

## Démarrer avec XAMPP

1. Copiez le dossier `gestion-etudiants` dans `C:\xampp\htdocs\gestion-etudiants`.
2. Dans XAMPP Control Panel, démarrez **Apache** et **MySQL**.
3. Ouvrez [http://localhost/phpmyadmin](http://localhost/phpmyadmin), choisissez **Importer**, sélectionnez `database.sql`, puis cliquez sur **Importer**.
4. Confirmez que l’API répond sur [http://localhost/gestion-etudiants/api/students.php](http://localhost/gestion-etudiants/api/students.php). Elle doit renvoyer la liste JSON des étudiants.

Par défaut, l’API utilise l’utilisateur MySQL `root` sans mot de passe, comme dans une installation locale courante de XAMPP. Pour une autre configuration, définissez les variables `DB_HOST`, `DB_NAME`, `DB_USER` et `DB_PASSWORD` dans l’environnement PHP.

## Démarrer React

Dans un terminal, depuis le dossier du projet :

```bash
npm install
npm run dev
```

Ouvrez l’adresse affichée par Vite, généralement [http://localhost:5173](http://localhost:5173). React appelle l’API XAMPP à `http://localhost/gestion-etudiants/api/students.php`.

Pour utiliser une autre URL d’API en développement, créez un fichier `.env.local` à la racine du projet :

```dotenv
VITE_STUDENTS_API=http://localhost/gestion-etudiants/api/students.php
```

Puis relancez Vite. L’API autorise les origines locales de Vite `5173`, `5174`, `5175` et Angular `4200`.

## Fonctions

- Liste et statistiques calculées depuis MySQL
- Recherche, filtres de statut et tri par nom
- Ajout, modification et suppression d’étudiants
- Vérification des champs et unicité de l’adresse e-mail côté API
- Impression de la liste

## API

Toutes les opérations utilisent `api/students.php` :

| Méthode | URL | Action |
| --- | --- | --- |
| `GET` | `/api/students.php` | Lister les étudiants |
| `GET` | `/api/students.php?id=1` | Lire un étudiant |
| `POST` | `/api/students.php` | Ajouter un étudiant (JSON) |
| `PUT` | `/api/students.php?id=1` | Modifier un étudiant (JSON) |
| `DELETE` | `/api/students.php?id=1` | Supprimer un étudiant |

Le JSON d’un étudiant contient `name`, `email`, `program`, `year` et `status`. Les données d’exemple sont insérées par `database.sql`.
