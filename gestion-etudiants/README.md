# Gestion des étudiants

Ce projet permet de suivre les dossiers des étudiants d’un établissement. On peut consulter la liste, retrouver un dossier, puis ajouter, modifier ou supprimer un étudiant. Les données sont enregistrées dans MySQL.

L’interface est faite avec **React** et le serveur de développement **Vite**. Une petite API en **PHP** fait le lien entre l’interface et la base MySQL fournie avec **XAMPP**.

## Ce que l’application permet de faire

- Afficher les étudiants et leurs informations : nom, e-mail, filière, niveau et statut.
- Rechercher par nom, e-mail ou filière.
- Filtrer par statut et trier les résultats par nom.
- Créer un dossier, le modifier ou le supprimer.
- Voir quelques chiffres calculés à partir de la liste : nombre total d’étudiants, nombre d’actifs, dossiers en attente et filières représentées.
- Imprimer la liste affichée.

## Comment les éléments fonctionnent ensemble

```text
Navigateur (React + Vite)
          │ requêtes HTTP avec JSON
          ▼
API PHP (api/students.php)
          │ requêtes préparées avec PDO
          ▼
MySQL (base gestion_etudiants)
```

React s’occupe de l’écran et des interactions. Quand un utilisateur ajoute ou modifie un étudiant, l’application envoie les informations à l’API. PHP les vérifie, échange avec MySQL et renvoie le résultat à React. Ainsi, la liste affichée vient de la base de données et reste disponible après avoir fermé le navigateur.

## Organisation du projet

```text
gestion-etudiants/
├── api/
│   ├── config.php       # Connexion à MySQL et réponses de l’API
│   └── students.php     # Opérations sur les dossiers étudiants
├── src/
│   ├── App.jsx          # Écran React et appels à l’API
│   ├── App.css          # Styles de l’écran
│   ├── index.css        # Styles généraux
│   └── main.jsx         # Démarrage de l’application React
├── database.sql         # Création de la base et données de départ
├── index.html           # Page ouverte par Vite
├── package.json         # Dépendances et commandes du projet
└── README.md            # Ce guide
```

## La base de données

Le script `database.sql` crée la base `gestion_etudiants` et la table `students`. Il ajoute aussi cinq étudiants d’exemple pour que la liste ne soit pas vide au premier lancement.

| Champ | Contenu |
| --- | --- |
| `id` | Identifiant attribué automatiquement |
| `name` | Nom complet, jusqu’à 120 caractères |
| `email` | Adresse e-mail, jusqu’à 190 caractères et unique |
| `program` | Filière, jusqu’à 100 caractères |
| `year` | Niveau : `L1`, `L2`, `L3`, `M1`, `M2` ou `Doctorat` |
| `status` | `Actif`, `En attente` ou `Inactif` |
| `created_at` | Date de création du dossier |
| `updated_at` | Date de la dernière modification |

Le jeu de données de départ utilise `INSERT IGNORE` : réimporter le script ne crée pas de doublons pour les adresses e-mail déjà présentes.

## Installation avec XAMPP

### 1. Démarrer les services

Installez XAMPP, ouvrez **XAMPP Control Panel**, puis démarrez **Apache** et **MySQL**.

### 2. Placer le projet dans le dossier web

Copiez le dossier `gestion-etudiants` dans le dossier `htdocs` de XAMPP :

```text
C:\xampp\htdocs\gestion-etudiants
```

Apache pourra alors servir les fichiers PHP de l’API.

### 3. Créer la base

Ouvrez [phpMyAdmin](http://localhost/phpmyadmin), allez dans **Importer**, sélectionnez le fichier `database.sql` à la racine du projet, puis lancez l’import. Vous devriez voir la base `gestion_etudiants` et sa table `students` dans la colonne de gauche.

### 4. Vérifier que l’API répond

Ouvrez cette adresse dans votre navigateur :

[http://localhost/gestion-etudiants/api/students.php](http://localhost/gestion-etudiants/api/students.php)

Vous devez obtenir une réponse JSON avec les étudiants de la base.

Par défaut, `api/config.php` se connecte à MySQL avec l’hôte `127.0.0.1`, la base `gestion_etudiants`, l’utilisateur `root` et un mot de passe vide. C’est la configuration locale courante de XAMPP. Si votre installation utilise d’autres paramètres, définissez `DB_HOST`, `DB_NAME`, `DB_USER` et `DB_PASSWORD` dans l’environnement de PHP.

## Lancer l’interface React

Vite sert l’interface pendant le développement ; Apache sert l’API PHP. Les deux doivent fonctionner en même temps.

Dans un terminal ouvert à la racine du projet, lancez :

```bash
npm install
npm run dev
```

Ouvrez ensuite l’adresse indiquée par Vite, généralement [http://localhost:5173](http://localhost:5173). React se connecte par défaut à :

```text
http://localhost/gestion-etudiants/api/students.php
```

Si l’API se trouve à une autre adresse, créez un fichier `.env.local` à la racine du projet :

```dotenv
VITE_STUDENTS_API=http://localhost/gestion-etudiants/api/students.php
```

Après avoir modifié `.env.local`, arrêtez puis relancez Vite. L’API accepte les origines locales `http://localhost:5173` et `http://127.0.0.1:5173`.

Pour générer les fichiers de production de l’interface :

```bash
npm run build
```

Vite place le résultat dans `dist/`.

## Les opérations CRUD

CRUD désigne les quatre actions principales sur des données : **Create** (créer), **Read** (lire), **Update** (modifier) et **Delete** (supprimer). Dans cette application, chaque action passe par `api/students.php`.

| Action dans l’application | Méthode et adresse de l’API |
| --- | --- |
| Charger la liste | `GET /api/students.php` |
| Consulter un dossier précis | `GET /api/students.php?id=1` |
| Ajouter un étudiant | `POST /api/students.php` |
| Modifier un étudiant | `PUT /api/students.php?id=1` |
| Supprimer un étudiant | `DELETE /api/students.php?id=1` |

Les requêtes `POST` et `PUT` envoient un objet JSON contenant `name`, `email`, `program`, `year` et `status`. Par exemple :

```json
{
  "name": "Aina Rakoto",
  "email": "aina.rakoto@univ.mg",
  "program": "Informatique",
  "year": "L2",
  "status": "Actif"
}
```

Une suppression réussie renvoie le code HTTP `204` et aucun contenu. Les autres réponses de l’API sont au format JSON.

## Vérifications effectuées par l’API

Le formulaire React demande les champs obligatoires et vérifie le format de l’e-mail. PHP refait ces vérifications avant d’écrire dans la base : cela évite de dépendre uniquement du navigateur.

- Le nom et la filière doivent être renseignés.
- Le nom, l’e-mail et la filière ne doivent pas dépasser leur longueur maximale.
- L’e-mail doit être valide et ne peut pas être utilisé par un autre étudiant.
- Le niveau et le statut doivent correspondre aux valeurs prévues.

Les requêtes SQL passent par PDO et utilisent des paramètres préparés. En cas de problème, l’API renvoie un code HTTP et un message JSON : `400` pour une requête incomplète, `404` pour un dossier introuvable, `409` pour un e-mail déjà utilisé ou `422` pour des champs invalides.

## Si quelque chose ne fonctionne pas

| Ce que vous voyez | À vérifier |
| --- | --- |
| La page React ne s’ouvre pas | Vérifiez que `npm run dev` est toujours actif et utilisez l’adresse affichée par Vite. |
| « Failed to fetch » dans la page | Vérifiez qu’Apache et MySQL tournent dans XAMPP, puis ouvrez directement l’adresse de l’API. Vérifiez aussi `VITE_STUDENTS_API`. |
| Une erreur de connexion à MySQL | Vérifiez l’import de `database.sql` et les paramètres de connexion dans `api/config.php`. |
| L’adresse de l’API renvoie `404` | Vérifiez que le projet se trouve bien dans `C:\xampp\htdocs\gestion-etudiants`. |
| La liste est vide | Dans phpMyAdmin, ouvrez `gestion_etudiants`, puis `students`, et vérifiez que les lignes d’exemple sont présentes. |

## Limites actuelles

Ce projet est configuré pour un usage local et ne comporte pas de connexion administrateur. Il sert à montrer la gestion des dossiers étudiants et les échanges entre React, PHP et MySQL ; il ne doit pas être exposé tel quel sur un serveur public.
