# Wakdo — Back-end (Bloc 2 : Développement Back-end)
 
Back-office et API du projet Wakdo (borne de commande de restauration rapide), réalisé dans le cadre de la certification RNCP 37805 - Développeur Web.
 
Ce dépôt correspond au **Bloc 2** : il gère les données de l'application, les commandes, et l'authentification/autorisation des utilisateurs internes (administration, préparation, accueil). Il communique avec le front-end du **Bloc 1** via une API REST.
 
---
 
## Accès à l'interface d'administration
 
Pour se connecter au back-office (`/login`) :
 
- **Email** : `admin@wakdo.fr`
- **Mot de passe** : `123`
Ce mot de passe volontairement simple est un choix assumé, propre au contexte de cet examen. Il ne s'agit évidemment pas d'une pratique à suivre dans une vraie application mise en production, où un mot de passe fort, unique et généré serait obligatoire. Ici, l'objectif était de faciliter l'accès pour le jury lors de la correction, et de gagner du temps pendant les mois de développement du projet, sans ajouter une contrainte inutile sur un compte de test. Dans un contexte réel, ce compte serait supprimé ou son mot de passe changé dès le premier déploiement (voir la section 9, Peuplement des données).
 
---
 
## 1. Objectif du projet

D'après le cahier des charges (kit d'examen Bloc 2) :

> Développer l'interface d'administration (back-office) pour gérer l'ensemble des données de l'application, les commandes des clients et la gestion des utilisateurs en fonction de leurs rôles.

Concrètement, ce back doit :
- Stocker et servir les catégories, produits et menus via une API
- Recevoir et enregistrer les commandes passées depuis le front
- Fournir un back-office pour gérer produits/menus, utilisateurs, et le suivi des commandes
- Sécuriser l'accès selon 3 rôles distincts (administration / préparation / accueil)

---

## 2. Stack technique

| Élément | Choix | Pourquoi |
|---|---|---|
| Langage / Framework | TypeScript + AdonisJS 6 | Framework orienté objet, MVC natif, ORM intégré — correspond à l'exigence "langage serveur orienté objet" du kit |
| Base de données | MySQL (MariaDB en prod) | Choisi pour se rapprocher d'un contexte professionnel réel plutôt qu'une base fichier (SQLite) |
| ORM | Lucid | Fourni avec Adonis, mapping objet-relationnel, migrations versionnées |
| Validation | VineJS | Validation stricte des données entrantes (API et formulaires admin) |
| Authentification | @adonisjs/auth (guard session) | Sessions sécurisées, mots de passe hashés en scrypt |
| Vues admin | Edge.js | Moteur de templates natif Adonis pour le back-office |
| Déploiement | VPS Scaleway + Caddy + PM2 + MariaDB | Environnement de production complet, auto-géré |

---

## 3. Architecture MVC

Le projet respecte une architecture Modèle-Vue-Contrôleur stricte :

- **Modèles** (`app/models/`) : classes héritant de `BaseModel` (Lucid), responsables uniquement des interactions avec la base de données et des relations entre tables (`hasMany`, `belongsTo`)
- **Contrôleurs** (`app/controllers/`) : contiennent la logique métier, préparent les données à afficher ou à renvoyer en JSON
- **Vues** : pour l'API, la "vue" est la réponse JSON elle-même ; pour le back-office, ce sont les templates Edge (`resources/views/`)

```
Requête HTTP → Route → Middleware (auth/rôle) → Contrôleur → Modèle → Base de données
                                                       ↓
                                          Vue Edge (HTML) ou réponse JSON
```

---

## 4. Modèle de données

### Schéma conceptuel

```
users (comptes internes)
   └─< commandes (une commande peut être créée par un user, ex: saisie comptoir)

categories
   └─< produits

commandes
   └─< lignes_commande >─ produits (référence, nullable)
           └─< ligne_commande_options
```

### Tables

| Table | Rôle | Champs clés |
|---|---|---|
| `users` | Comptes internes (back-office) | `email` (unique), `password` (hashé scrypt), `role` (enum) |
| `categories` | Regroupement des produits | `nom` (unique), `image` |
| `produits` | Catalogue (burgers, menus, boissons...) | `prix` (decimal), `disponible` (bool), `category_id` (FK → categories) |
| `commandes` | Commande passée par un client | `numero_commande`, `type` (sur_place/a_emporter), `statut` (cycle de vie), `user_id` (FK nullable → users) |
| `lignes_commande` | Un article au sein d'une commande | `commande_id` (FK), `produit_id` (FK nullable), `nom_produit`/`prix_unitaire` (snapshots) |
| `ligne_commande_options` | Options choisies sur un article (taille, sauce...) | `ligne_commande_id` (FK), `libelle`, `supplement` |

### Choix de modélisation à justifier à l'oral

- **Tables séparées `lignes_commande` / `ligne_commande_options`** plutôt que des colonnes répétées (`article_1`, `article_2`...) : une commande a un nombre variable d'articles, et chaque article un nombre variable d'options. Éviter la "répétition de groupe" est une règle de normalisation de base de données (1FN).
- **Snapshots (`nom_produit`, `prix_unitaire`)** dans `lignes_commande` : si le prix d'un produit change après coup, l'historique des commandes passées reste intact — intégrité des données dans le temps.
- **Clés étrangères avec `ON DELETE CASCADE` / `SET NULL`** : suppression en cascade cohérente (supprimer une commande supprime ses lignes et leurs options), tout en préservant l'historique des commandes si un produit est supprimé du catalogue (`produit_id` passe à `null`, mais `nom_produit`/`prix_unitaire` restent).

---

## 5. Sécurité

Plusieurs mesures mises en œuvre, en réponse directe au critère *"Mise en œuvre de mesures de sécurité robustes"* :

- **Mots de passe hashés** avec l'algorithme **scrypt** (jamais stockés en clair), via `@adonisjs/auth`
- **Authentification par session** : cookie de session sécurisé (`httpOnly`, `secure` en production, `sameSite: lax`), pas de mot de passe transmis à chaque requête
- **Protection CSRF** (`@adonisjs/shield`) sur toutes les routes de formulaire (POST/PUT/PATCH/DELETE) du back-office
- **Validation stricte des entrées** (VineJS) sur l'API et les formulaires admin — tout payload mal formé est rejeté avant d'atteindre la base
- **Protection contre l'injection SQL** : passer exclusivement par l'ORM Lucid (requêtes paramétrées) empêche l'injection directe de SQL depuis une entrée utilisateur
- **Gestion des rôles** (voir section suivante) : chaque route admin est protégée par un middleware qui vérifie le rôle de l'utilisateur connecté
- **En-têtes de sécurité HTTP** : `X-Frame-Options: DENY` (anti-clickjacking), HSTS (force HTTPS), anti-sniffing de content-type
- **Page de politique de confidentialité** (`/confidentialite`) : informe les utilisateurs internes des données collectées (nom, email, rôle), de leur usage, et de leur droit de consultation/modification/suppression — répond au critère RGPD du référentiel

---

## 6. Gestion des rôles

Trois rôles, définis dans le kit d'examen et implémentés via un middleware dédié (`role_middleware.ts`) posé sur chaque route admin :

| Rôle | Peut faire |
|---|---|
| **administration** | Tout : gérer produits/menus, gérer les comptes utilisateurs, voir/traiter les commandes |
| **preparation** | Voir la liste des commandes, les marquer "préparées" |
| **accueil** | Saisir une nouvelle commande au comptoir, marquer une commande "livrée" |

Le middleware vérifie le rôle de l'utilisateur connecté (`ctx.auth.user.role`) contre la liste des rôles autorisés pour chaque route, et renvoie une erreur 403 sinon. Toutes les routes `/admin/*` exigent en plus d'être authentifié (middleware `auth`).

---

## 7. L'API (communication avec le front-end)

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/categories` | Liste des catégories, avec leurs produits imbriqués |
| `GET` | `/api/produits` | Liste des produits disponibles (filtrable par `?categorie=nom`) |
| `POST` | `/api/commandes` | Réception d'une commande passée sur le front |
| `GET` | `/api/commandes` | Liste des commandes (usage interne/supervision) |

Le CORS (`@adonisjs/cors`) est activé pour autoriser le front (hébergé sur un domaine différent) à consommer cette API.

La création d'une commande (`POST /api/commandes`) est **transactionnelle** : la commande, ses lignes et leurs options sont insérées comme un bloc indivisible (`db.transaction`). Si une insertion échoue en cours de route, tout est annulé — jamais de commande à moitié enregistrée.

---

## 8. Back-office (interface d'administration)

Accessible via `/login`, protégé par authentification + rôle :

- **Gestion des produits** (`/admin/produits`) : liste, création, modification (avec upload d'image), suppression, activation/désactivation de la disponibilité — réservé au rôle `administration`
- **Gestion des utilisateurs** (`/admin/utilisateurs`) : création/modification/suppression des comptes internes, attribution des rôles — réservé au rôle `administration`
- **Suivi des commandes** (`/admin/commandes`) : liste triée par date de création, actions "marquer préparée" / "marquer livrée" selon le rôle
- **Saisie manuelle de commande** (`/admin/commandes/nouvelle`) : formulaire pour les équipiers accueil/administration, permettant de composer un menu (taille, accompagnement, sauce, boisson) ou d'ajouter des produits à l'unité

---

## 9. Peuplement des données (seeders)

Trois seeders, exécutés via `node ace db:seed` :

- `categorie_seeder.ts` : importe `database/data/categories.json` (9 catégories)
- `produit_seeder.ts` : importe `database/data/produits.json` (65 produits, répartis par catégorie)
- `user_seeder.ts` : crée un compte administrateur initial

Les seeders utilisent `updateOrCreate` (catégories/produits), ce qui les rend **idempotents** : les relancer plusieurs fois ne crée jamais de doublons.

⚠️ Le mot de passe du compte admin créé par le seeder doit être changé immédiatement après le premier déploiement en production.

---

## 10. Déploiement

Application déployée sur un **VPS Scaleway**, avec :
- **Caddy** comme reverse proxy (gère automatiquement le certificat HTTPS via Let's Encrypt)
- **PM2** pour garder le processus Node.js actif en permanence et le redémarrer en cas de crash
- **MariaDB** (compatible MySQL) comme base de données de production
- Un **Makefile** (`make deploy`) qui automatise : build, envoi du code par `rsync`, installation des dépendances, migrations, et redémarrage du service

Domaines : `wakdo.elknir.com` (front) / `wakdo-api.elknir.com` (back).

---

## 11. Installation en local

```bash
git clone <url-du-repo>
cd wakdo-backend
npm install
cp .env.example .env
# Renseigner APP_KEY (node ace generate:key) et les identifiants MySQL locaux
node ace migration:run
node ace db:seed
node ace serve --watch
```

---

## 12. Choix de conception justifiés

**MySQL plutôt que SQLite.** SQLite aurait suffi techniquement pour un exercice, mais MySQL a été choisi pour se rapprocher d'un contexte professionnel réel : gestion d'un vrai serveur de base de données, connexions concurrentes, et c'est le SGBD le plus couramment attendu en entreprise.

**Des tables séparées pour les lignes de commande et leurs options, plutôt que tout regrouper dans `commandes`.** Une commande contient un nombre variable d'articles, et chaque article un nombre variable d'options (un burger seul n'a aucune option, un menu en a quatre : taille, accompagnement, sauce, boisson). Mettre ça dans des colonnes fixes (`article_1`, `article_2`...) obligerait à fixer une limite arbitraire et laisserait des colonnes vides pour la majorité des commandes. Une table à part, avec une ligne par article (puis une ligne par option), absorbe n'importe quelle quantité sans jamais changer la structure de la base — c'est la normalisation de base de données (1ère forme normale : éviter les répétitions de groupes).

**Des snapshots de prix et de nom dans `lignes_commande`, en plus de la clé étrangère vers `produits`.** Si le prix d'un burger change après coup, les commandes déjà passées doivent garder le prix payé au moment de l'achat, pas le prix actuel du catalogue. Dupliquer `nom_produit` et `prix_unitaire` au moment de la commande garantit que l'historique reste fidèle à ce qui s'est réellement passé, même si le produit est modifié ou supprimé plus tard.

**La sécurité est traitée à chaque couche plutôt qu'à un seul endroit.** Les mots de passe sont hashés avec scrypt (jamais stockés en clair). L'authentification repose sur des sessions avec cookie sécurisé (`httpOnly`, `secure` en production, `sameSite: lax`). Chaque formulaire du back-office est protégé contre le CSRF. Toutes les entrées (API et formulaires admin) passent par un validateur VineJS qui rejette toute donnée mal formée avant qu'elle n'atteigne la base. Aucune requête SQL n'est écrite à la main : passer systématiquement par l'ORM Lucid élimine le risque d'injection SQL. Enfin, une page dédiée informe les utilisateurs internes de l'usage fait de leurs données personnelles, conformément aux exigences RGPD du référentiel.

**Les rôles délimitent précisément ce que chaque type de compte peut faire.** Un middleware dédié (`role_middleware.ts`) est posé sur chaque route du back-office et vérifie le rôle de l'utilisateur connecté avant d'autoriser l'accès. Le rôle `administration` a accès à tout (produits, utilisateurs, commandes). Le rôle `preparation` ne voit que les commandes et peut les marquer comme préparées. Le rôle `accueil` peut saisir de nouvelles commandes et les marquer comme livrées. Cette séparation est appliquée au niveau des routes, pas seulement de l'affichage — un utilisateur ne peut donc pas contourner la restriction en devinant une URL.

**Le front et le back communiquent via une API REST en JSON, et non par un couplage direct.** Le back expose des routes (`/api/categories`, `/api/produits`, `/api/commandes`) qui renvoient ou reçoivent du JSON. Le CORS est configuré pour autoriser explicitement le domaine du front à appeler cette API, alors que par défaut un navigateur bloquerait ces échanges entre deux origines différentes. Cette séparation permet de faire évoluer le front et le back indépendamment, tant que le contrat de l'API (la forme du JSON échangé) reste stable.
