# Cahier de développement — Marketplace d'exportation de véhicules d'occasion

## 0. Positionnement du projet

Construire une plateforme web moderne d'exportation et de vente de véhicules d'occasion inspirée fonctionnellement de grands marketplaces automobiles internationaux, mais avec une identité visuelle originale, le logo de la marque du propriétaire, ses propres textes, ses propres photos et son propre parcours client.

Important : ne pas copier les éléments propriétaires, le design exact, le code, les textes, les images, les marques ou les bases de données de BE FORWARD. Reproduire uniquement les catégories de fonctionnalités utiles : catalogue, recherche, filtres, fiche véhicule, estimation du coût total, compte client, demande de devis, réservation/commande, suivi, et administration.

Nom temporaire du projet : J-CARS Export (modifiable).

## 1. Objectifs business

1. Présenter un catalogue professionnel de véhicules disponibles à l'export.
2. Permettre aux clients de rechercher rapidement un véhicule par marque, modèle, année, prix, kilométrage, carburant, transmission, type de carrosserie et emplacement.
3. Afficher des photos haute qualité et les détails techniques de chaque véhicule.
4. Permettre une demande de devis avec calcul du véhicule + transport + assurance + inspection + frais optionnels.
5. Permettre à un client de créer un compte, enregistrer des favoris, sauvegarder des recherches et suivre ses demandes/commandes.
6. Fournir un tableau de bord d'administration complet pour gérer véhicules, photos, prix, disponibilité, commandes, clients, pages, annonces et coûts logistiques.
7. Fournir une architecture suffisamment claire pour que Claude Code puisse construire le produit progressivement, module par module.

## 2. Utilisateurs et rôles

### 2.1 Visiteur

- Parcourir le stock
- Rechercher et filtrer
- Voir une fiche véhicule
- Utiliser le calculateur de prix total
- Envoyer une demande
- Créer un compte

### 2.2 Client enregistré

- Profil
- Favoris
- Recherches sauvegardées
- Demandes de devis
- Véhicules réservés
- Commandes
- Factures
- Preuves de paiement
- Suivi logistique
- Messages avec l'équipe commerciale

### 2.3 Commercial / Sales

- Voir les leads
- Répondre aux demandes
- Créer/modifier devis
- Réserver un véhicule
- Générer une facture
- Ajouter notes internes

### 2.4 Gestionnaire de stock

- Créer/modifier véhicules
- Uploader et réordonner les photos
- Modifier prix, statut, emplacement
- Ajouter inspection et documents

### 2.5 Administrateur

- Accès total
- Gestion des utilisateurs et rôles
- Configuration du site
- Devises
- Pays/ports
- Barèmes de shipping
- Contenus/CMS
- Logs et audit

## 3. Périmètre fonctionnel

### 3.1 Accueil

Sections recommandées :

- Hero avec recherche principale
- Nombre de véhicules disponibles
- Véhicules ajoutés récemment
- Recherche par marque
- Recherche par type : SUV, Sedan, Van, Truck, Bus, Hatchback, Coupe, Wagon, Pickup, Machinery
- Recherche par prix
- Promotions / véhicules en vedette
- Comment acheter
- Pays desservis
- Avis / témoignages
- FAQ
- WhatsApp / contact rapide
- Bannière d'alerte admin configurable

### 3.2 Catalogue / Stock list

Filtres :

- Mot-clé
- Marque
- Modèle
- Année min/max
- Prix min/max
- Kilométrage min/max
- Cylindrée
- Carburant
- Transmission
- Type de carrosserie
- Volant gauche/droite
- Couleur
- Nombre de sièges
- Emplacement
- Statut
- Promotion
- Date d'ajout

Options :

- Tri : prix asc/desc, année récente, kilométrage, nouveautés
- Pagination
- Vue grille / liste
- Favori
- Comparaison (V2)
- Recherche sauvegardée
- Alerte nouveaux véhicules

### 3.3 Fiche véhicule

Afficher :

- Référence unique
- Marque / modèle / version
- Prix FOB
- Prix promo éventuel
- Galerie photos
- Vidéo optionnelle
- Année / mois
- Kilométrage
- Moteur / cylindrée
- Carburant
- Transmission
- Drive type
- Volant
- Carrosserie
- Couleur
- Sièges / portes
- Châssis / VIN partiellement masqué publiquement
- Dimensions / poids
- Emplacement actuel
- Équipements
- Inspection / grade
- Commentaire du vendeur
- Statut : Available, Reserved, Sold, In Transit

CTA :

- Get Quote
- Reserve Vehicle
- WhatsApp
- Ask a Question
- Add to Favorites

### 3.4 Calculateur du coût total

Entrées :

- Pays destination
- Port destination
- Mode de transport : RoRo / Container / Shared Container
- Assurance : oui/non
- Inspection : oui/non
- Certificat : oui/non
- Autres frais configurables

Sortie :

- Prix véhicule
- Frais locaux/export
- Freight
- Assurance
- Inspection
- Certificat
- Total estimé
- Devise sélectionnée

Le calcul doit être piloté par les tables admin, jamais hardcodé dans le frontend.

### 3.5 Compte client

Dashboard :

- Résumé
- Favoris
- Recherches sauvegardées
- Demandes
- Réservations
- Commandes
- Factures
- Paiements
- Tracking
- Profil / consignee
- Préférences langue/devise

### 3.6 Workflow commercial

États recommandés : lead -> inquiry -> quote_sent -> reserved -> awaiting_payment -> paid -> preparing_export -> booked_shipping -> shipped -> arrived -> completed

Possibilité d'annulation avec raison.

### 3.7 Paiements

MVP :

- Virement bancaire
- Upload preuve de paiement
- Validation manuelle par admin

V2 :

- Stripe / carte bancaire si juridiquement et commercialement approprié
- Paiements partiels / dépôt

### 3.8 Shipping / Tracking

- Nom du transporteur
- Vessel / voyage
- Booking number
- ETD
- ETA
- Port de départ
- Port d'arrivée
- Statut
- Timeline visible client
- Documents téléchargeables

## 4. Dashboard d'administration

Route : `/admin`

### 4.1 Dashboard principal

KPI :

- véhicules actifs
- véhicules vendus
- leads aujourd'hui
- devis envoyés
- réservations actives
- paiements en attente
- chiffre d'affaires
- top marques / top pays

### 4.2 Gestion véhicules

Table admin :

- miniature
- ref
- marque
- modèle
- année
- prix
- location
- status
- date création

Actions :

- créer
- modifier
- dupliquer
- publier/dépublier
- réserver
- vendre
- archiver
- supprimer (soft delete par défaut)

### 4.3 Gestion photos

Fonctions indispensables :

- drag & drop multi-upload
- aperçu
- compression automatique
- génération thumbnails
- réordonner par drag & drop
- définir photo principale
- supprimer
- alt text
- watermark optionnel avec logo

Stockage recommandé : Supabase Storage ou Cloudinary.

### 4.4 CMS / Mises à jour

L'admin doit pouvoir modifier sans code :

- bannière d'alerte
- hero home
- promotions
- FAQ
- pages About / How to Buy / Shipping / Contact
- témoignages
- pays desservis
- coordonnées WhatsApp / téléphone / email
- réseaux sociaux

### 4.5 Gestion logistique

- pays
- ports
- route maritime
- shipping method
- tarif par m3 / véhicule / catégorie
- assurance
- inspection
- certificat
- période de validité

### 4.6 Utilisateurs et sécurité

- liste clients
- rôles internes
- désactivation compte
- historique activité
- audit logs

## 5. UX/UI et identité de marque

Le design doit être original.

### Direction visuelle

- look automobile premium, propre et rapide
- très lisible sur mobile
- logo du propriétaire dans header/footer/login/admin
- couleurs configurables via design tokens
- photos véhicules dominantes
- CTA visibles
- tableaux admin denses mais clairs

### Responsive

Priorité :

1. Mobile
2. Desktop
3. Tablet

### Accessibilité

- WCAG 2.1 AA
- contrastes
- navigation clavier
- labels formulaires
- alt text images

## 6. Internationalisation

MVP :

- Français
- Anglais

V2 :

- Japonais
- Swahili
- Portugais

Devise :

- USD base business
- JPY
- EUR
- autres devises configurables

Les prix convertis sont indicatifs si taux dynamique. Stocker toujours un prix base canonique.

## 7. Stack technique recommandée

### Frontend / Backend web

- Next.js (App Router)
- TypeScript strict
- React
- Tailwind CSS
- shadcn/ui

### Backend data

- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Row Level Security

### Déploiement

- Vercel
- Supabase
- domaine personnalisé

### Emails

- Resend ou Postmark

### Observabilité

- Sentry
- Vercel Analytics
- Supabase logs

### Recherche

MVP : PostgreSQL indexes + trigram/full text
V2 : Algolia / Meilisearch si catalogue très grand

## 8. Modèle de données principal

### users / profiles

- id uuid
- email
- full_name
- phone
- whatsapp
- country_code
- preferred_language
- preferred_currency
- role
- created_at

### vehicles

- id uuid
- ref_no unique
- make_id
- model_id
- trim
- year
- month
- price_usd
- sale_price_usd nullable
- mileage_km
- engine_cc
- fuel_type
- transmission
- drive_type
- steering_side
- body_type
- color
- seats
- doors
- chassis_no_private
- vin_private
- width_mm
- height_mm
- length_mm
- weight_kg
- location_id
- description
- status
- published
- featured
- created_at
- updated_at
- deleted_at nullable

### vehicle_images

- id
- vehicle_id
- storage_path
- public_url
- sort_order
- is_primary
- alt_text
- created_at

### makes

- id
- name
- slug
- logo_url nullable

### models

- id
- make_id
- name
- slug

### locations

- id
- country
- city
- yard_name

### vehicle_features

- id
- vehicle_id
- feature_key
- feature_value

### countries

- id
- name
- iso_code
- currency

### ports

- id
- country_id
- name
- code
- active

### shipping_rates

- id
- origin_location_id
- destination_port_id
- method
- base_cost_usd
- category nullable
- m3_rate nullable
- insurance_rate nullable
- effective_from
- effective_to nullable
- active

### inquiries

- id
- user_id nullable
- vehicle_id
- name
- email
- phone
- message
- status
- assigned_to nullable
- created_at

### quotes

- id
- inquiry_id
- vehicle_id
- user_id
- vehicle_price
- freight
- insurance
- inspection
- certificate
- other_fees
- discount
- total_usd
- status
- expires_at
- created_by

### orders

- id
- order_no unique
- user_id
- vehicle_id
- quote_id
- status
- total_usd
- reserved_until nullable
- created_at

### payments

- id
- order_id
- amount
- currency
- method
- proof_path nullable
- status
- verified_by nullable
- verified_at nullable

### shipments

- id
- order_id
- carrier
- vessel_name
- voyage_no
- booking_no
- origin_port
- destination_port
- etd
- eta
- status
- tracking_url nullable

### favorites

- user_id
- vehicle_id
- created_at
- Unique(user_id, vehicle_id)

### saved_searches

- id
- user_id
- name
- filters_json jsonb
- email_alerts boolean

### cms_pages

- id
- slug
- title
- content_json jsonb
- locale
- published
- updated_at

### site_settings

- key unique
- value_json jsonb

### audit_logs

- id
- actor_id
- action
- entity_type
- entity_id
- old_data jsonb nullable
- new_data jsonb nullable
- created_at

## 9. Permissions / RLS

Règles essentielles :

- visiteurs : lecture véhicules publiés uniquement
- clients : lecture/modification uniquement de leurs propres données
- sales : accès inquiries/quotes/orders autorisés
- inventory_manager : accès vehicles/images
- admin : full access
- chassis/VIN complet jamais exposé publiquement si non nécessaire
- paiements et documents privés via signed URLs

## 10. API / Server Actions

Endpoints/logique :

- GET /api/vehicles
- GET /api/vehicles/[slug]
- POST /api/inquiries
- POST /api/quotes/calculate
- POST /api/favorites
- DELETE /api/favorites/[vehicleId]
- POST /api/orders/reserve
- POST /api/payments/proof
- GET /api/orders/[id]/tracking

Admin :

- POST /api/admin/vehicles
- PATCH /api/admin/vehicles/[id]
- POST /api/admin/vehicles/[id]/images
- PATCH /api/admin/images/reorder
- DELETE /api/admin/images/[id]
- CRUD shipping rates
- CRUD CMS

Préférer Server Actions sécurisées quand cela simplifie le produit.

## 11. Architecture Next.js

```
src/
  app/
    (public)/
      page.tsx
      stock/
      cars/[slug]/
      how-to-buy/
      shipping/
      about/
      contact/
    (auth)/
      login/
      register/
      forgot-password/
    account/
      page.tsx
      favorites/
      searches/
      inquiries/
      orders/
      invoices/
      profile/
    admin/
      page.tsx
      vehicles/
      vehicles/new/
      vehicles/[id]/edit/
      inquiries/
      quotes/
      orders/
      payments/
      shipping/
      customers/
      content/
      settings/
    api/
  components/
    vehicle/
    search/
    quote/
    layout/
    admin/
    ui/
  lib/
    supabase/
    auth/
    pricing/
    shipping/
    currency/
    validation/
  types/
  actions/
```

## 12. SEO

- URLs propres : /cars/toyota/land-cruiser/ref-12345
- metadata dynamique
- OpenGraph
- sitemap XML
- robots.txt
- canonical URLs
- Schema.org Vehicle / Product / Offer lorsque pertinent
- pages marques et modèles indexables
- images optimisées WebP/AVIF

## 13. Performance

Objectifs :

- LCP < 2.5 s sur pages principales
- lazy load galerie
- Next/Image
- pagination serveur
- CDN images
- indexes DB sur filtres fréquents
- cache listes marques/modèles

## 14. Sécurité

- Auth Supabase
- MFA admin recommandé
- RLS obligatoire
- validation Zod côté serveur
- rate limit sur login/inquiry/quote
- CSRF selon architecture
- anti-spam hCaptcha/Turnstile
- signed URLs documents privés
- logs actions admin
- soft delete
- backups DB
- secrets uniquement en env vars
- aucun secret dans le navigateur

## 15. Variables d'environnement

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

Option Cloudinary :

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 16. Notifications

Emails :

- bienvenue
- demande reçue
- devis prêt
- réservation confirmée
- rappel expiration réservation
- paiement reçu
- paiement validé
- véhicule expédié
- ETA mis à jour
- nouveau véhicule correspondant à recherche sauvegardée

WhatsApp V2 :

- notification commerciale via fournisseur API approuvé

## 17. Tests

### Unit

- calcul total
- devise
- validation filtres
- permissions helpers

### Integration

- création véhicule
- upload images
- quote
- reservation
- payment proof

### E2E Playwright

1. rechercher véhicule
2. ouvrir fiche
3. créer compte
4. ajouter favori
5. demander devis
6. admin traite lead
7. client voit devis
8. réservation
9. upload preuve paiement
10. admin valide
11. tracking visible

## 18. CI/CD

GitHub Actions :

- lint
- typecheck
- unit tests
- Playwright smoke
- build

Branches :

- main production
- develop staging si nécessaire
- feature branches

Preview deployments Vercel sur PR.

## 19. Phases de développement

### Phase 0 — Foundation

- repo
- Next.js/TS/Tailwind/shadcn
- Supabase
- auth
- design system
- DB migrations
- seed data

### Phase 1 — Catalogue public

- home
- stock list
- filtres
- vehicle detail
- images
- SEO

### Phase 2 — Admin stock

- admin auth/RBAC
- CRUD vehicles
- photo manager
- publication/status
- marques/modèles/locations

### Phase 3 — Leads et devis

- inquiry
- total price calculator
- shipping rates admin
- quote workflow
- email notifications

### Phase 4 — Client account

- favorites
- saved searches
- orders
- invoices
- profile/consignee

### Phase 5 — Paiement et shipping

- payment proof
- verification
- shipment timeline
- documents

### Phase 6 — CMS et analytics

- banners
- pages
- promotions
- dashboard metrics
- audit log

### Phase 7 — Hardening

- tests E2E
- security review
- performance
- accessibility
- SEO audit
- backup/restore

## 20. Critères d'acceptation MVP

Le MVP est terminé quand :

1. Un admin peut créer un véhicule avec minimum 10 photos.
2. Le véhicule apparaît publiquement après publication.
3. Un visiteur peut filtrer le catalogue.
4. La fiche affiche toutes les informations essentielles.
5. Un client peut créer un compte et ajouter des favoris.
6. Le client peut demander un devis.
7. Le système calcule le total via tarifs administrables.
8. Un commercial peut transformer une demande en devis.
9. Un client peut réserver et uploader une preuve de paiement.
10. Un admin peut valider le paiement.
11. Un shipment peut être créé avec ETD/ETA.
12. Le client peut suivre son statut.
13. Les données privées sont protégées par RLS.
14. Le site fonctionne mobile + desktop.

## 21. Seed data pour Claude Code

Créer en développement :

- 8 marques
- 20 modèles
- 30 véhicules fictifs
- 5 pays destination
- 10 ports
- 10 shipping rates
- 1 admin
- 1 sales
- 1 inventory manager
- 2 clients test

Ne jamais scraper/copier le stock réel d'un concurrent.

## 22. Prompt maître pour Claude Code

Utiliser le texte suivant dans Claude Code après avoir placé ce document à la racine du repo :

```
You are the lead full-stack engineer for this project.
Read DEVELOPMENT_SPEC_JCARS.md completely before writing code.

Goal: build the vehicle export marketplace described in the specification as a production-quality application.

Rules:
1. Do not clone proprietary UI, code, copy, logos, images, or data from BE FORWARD or any competitor. Build an original design with equivalent categories of functionality.
2. Use Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase Postgres/Auth/Storage and RLS.
3. Keep all business rules server-side where security matters.
4. Use migrations for every database schema change.
5. Do not hardcode shipping prices, countries, ports, makes, models, roles, or status labels when they belong in data/config.
6. Use Zod validation.
7. Add tests for pricing, permissions, catalog filters and critical workflows.
8. Use accessible responsive components.
9. Implement soft-delete for important business records.
10. Never expose service-role credentials to the browser.

Execution strategy:
- First inspect the repo and write an implementation plan mapped to the phases in the specification.
- Implement one phase at a time.
- At the end of every phase, run lint, typecheck, tests and build.
- Fix all failures before continuing.
- Maintain a PROGRESS.md file containing completed items, current work, blockers and next steps.
- Maintain DECISIONS.md for architectural decisions.
- Do not invent credentials. If an external secret is required, add its key to .env.example and continue with a safe mock/fallback.

Start with Phase 0 only. Do not jump ahead until the foundation builds successfully.
```

## 23. Instructions d'exécution phase par phase pour Claude Code

Pour chaque nouvelle phase, utiliser :

```
Continue the project using DEVELOPMENT_SPEC_JCARS.md.
Read PROGRESS.md and DECISIONS.md first.
Implement Phase X completely.
Do not change completed behavior unless required.
Add/update migrations, tests and documentation.
Run lint, typecheck, tests and production build.
Fix every failure.
Update PROGRESS.md when done.
```

## 24. Fonctionnalités V2 recommandées

- comparaison véhicules
- enchères
- multi-seller marketplace
- commissions vendeurs
- chat temps réel
- WhatsApp Business API
- OCR documents véhicule
- génération facture PDF
- calcul volume m3 automatique
- tracking transporteur via API
- recommandations IA
- recherche sémantique
- import CSV stock
- bulk photo upload
- API partenaires
- mobile app
- PWA
- multi-warehouse
- taxes/import estimators par pays

## 25. Décisions à fournir par le propriétaire avant production

- Nom officiel de la marque
- Logo SVG/PNG
- Couleurs de marque
- Domaine
- Email support
- WhatsApp commercial
- Adresse société
- Conditions générales
- Politique confidentialité
- Politique remboursement/réservation
- Banques/moyens de paiement
- Pays servis
- Ports servis
- Règles réelles de freight
- Types d'inspection/certificats
- Langues initiales
- Devise de référence

## 26. Définition du succès

Le produit final doit permettre au propriétaire de gérer son activité automobile sans modifier le code : ajout d'un véhicule, photos, prix, disponibilité, promotions, demandes clients, devis, paiements, expéditions et contenus doivent être administrables depuis le dashboard.

Le site public doit être rapide, clair, mobile-first, SEO-friendly, multilingue et inspirer confiance à un acheteur international.
