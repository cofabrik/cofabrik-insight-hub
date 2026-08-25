# Cockpit RH

Crée une application web d'une seule page : un tableau de bord de pilotage nommé "Cockpit",

pour un cabinet de recrutement industriel français (Cofabrik RH, Grenoble/Lyon, secteurs

électronique, semi-conducteurs, dispositifs médicaux, énergie).

UTILISATEURS : la fondatrice et le directeur général du cabinet. Ni l'un ni l'autre n'est

technique. Ils ouvrent cette page pour répondre à deux questions en cinq secondes :

"où en est ma base de données clients ?" et "qu'est-ce qui attend que je le lance ?".

CE QUE FAIT LA MACHINE DERRIÈRE (à ne PAS construire, seulement à représenter) :

cinq traitements automatiques enrichissent et classent une base de 5 035 sociétés et

6 128 contacts. Chaque contact est rangé en tier A, B ou C selon la valeur commerciale

de son entreprise. Certains traitements coûtent de l'argent à chaque lancement (crédits

d'API), donc le lancement doit être un geste conscient, jamais accidentel.

CONTENU RÉEL À AFFICHER (utilise ces chiffres exacts, pas des valeurs inventées) :

Vue d'ensemble :

- Sociétés classées : 5 035 → tier A 787, tier B 2 881, tier C 1 367

- Contacts activables : 6 128 → tier A 1 318, tier B 3 171, tier C 1 639

- Réserves : 3 243 jetons Pappers, 1 238 crédits Dropcontact

- Dernière écriture en base : 24/08 15:33

Les cinq traitements, chacun avec son reste à faire :

1. "Pappers" — identification SIREN des sociétés — 2 fiches en attente — à jour

2. "Dropcontact" — emails et téléphones des tiers A et B — 1 752 en attente — à lancer

3. "Triage · Score · Propagation" — classement A/B/C — 0 en attente — à jour

4. "Rôle du contact" — classification par dictionnaire — 0 en attente — à jour

5. "Rôle du contact — IA" — intitulés ambigus, traités par IA — 288 en attente,

   coût estimé 0,35 € — à lancer

Historique : un tableau des 15 derniers passages avec date de démarrage, nom du

traitement, mode ("écriture" ou "simulation"), fiches lues, fiches écrites, date de fin.

Exemples : 24/08 15:32 · Triage score propagation · écriture · 11 163 lues · 0 écrites ·

fini 15:33. 24/08 12:17 · Propagation · écriture · 6 128 lues · 19 écrites · fini 12:17.

IDENTITÉ VISUELLE : libre. Tu es le directeur artistique. Choisis une palette, des

typographies et un parti pris de mise en page qui servent ce sujet précis — une machine

de traitement de données pilotée par des dirigeants non techniques dans l'industrie.

Assume un vrai point de vue esthétique plutôt qu'un tableau de bord générique.

Évite les défauts : dégradé violet/bleu, fond sombre avec accent néon, cartes toutes

identiques alignées en grille.

AGENCEMENT : libre également. À toi de décider ce qui mérite le haut de page, ce qui

se regroupe, ce qui se cache derrière une interaction. Une seule règle : un dirigeant

qui ouvre cette page doit savoir en cinq secondes ce qui attend une action de sa part.

Propose trois directions visuelles distinctes avant de coder, puis construis celle qui

sert le mieux ce sujet — et dis-moi en une phrase pourquoi tu l'as choisie.

CONTRAINTES :

- Aucune authentification, aucune base de données, aucun appel API : toutes les données

  sont écrites en dur dans le code

- Interface entièrement en français

- Le vocabulaire doit être celui d'un dirigeant, jamais celui d'un développeur :

  on dit "traitement", "fiches", "écriture", "simulation" — jamais "workflow", "records",

  "apply", "dry run", "webhook"

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bbe59c42-2913-4c21-a3cd-722bf3d48f16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
