import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cockpit — Cofabrik RH" },
      {
        name: "description",
        content:
          "Pilotage de la base Cofabrik RH : 5 035 sociétés classées, 6 128 contacts activables, cinq traitements automatiques et le journal des quinze derniers passages.",
      },
      { property: "og:title", content: "Cockpit — Cofabrik RH" },
      {
        property: "og:description",
        content:
          "Pilotage de la base Cofabrik RH : état de la base, traitements en attente de lancement et journal des passages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cockpit,
});

/* ------------------------------------------------------------------ */
/* Données — écrites en dur, aucune source externe                     */
/* ------------------------------------------------------------------ */

const DERNIERE_ECRITURE = "24/08 15:33";

const RESERVES = [
  { nom: "Jetons Pappers", valeur: "3 243" },
  { nom: "Crédits Dropcontact", valeur: "1 238" },
];

const BASE = {
  societes: {
    titre: "Sociétés classées",
    total: "5 035",
    tiers: [
      { nom: "Tier A", valeur: 787 },
      { nom: "Tier B", valeur: 2881 },
      { nom: "Tier C", valeur: 1367 },
    ],
  },
  contacts: {
    titre: "Contacts activables",
    total: "6 128",
    tiers: [
      { nom: "Tier A", valeur: 1318 },
      { nom: "Tier B", valeur: 3171 },
      { nom: "Tier C", valeur: 1639 },
    ],
  },
};

type RepartitionTier = { nom: string; valeur: number };

type Traitement = {
  numero: string;
  nom: string;
  description: string;
  attente: string;
  statut: "a-jour" | "a-lancer";
  cout?: string;
  /* Détails affichés dans l'écran de confirmation avant lancement */
  fichesConcernees: number;
  coutEstime: string;
  reserveConcernee?: string;
  libelleBouton?: string;
  /* Canaux de données déjà récupérés (ex. email / téléphone pour Dropcontact) */
  canaux?: { nom: string; valeur: number }[];
  /* Répartition par tier affichée au clic sur la ligne */
  impact: {
    perimetre: string;
    tiers: RepartitionTier[];
    reste: RepartitionTier[];
  };
};

/* Les traitements sont ordonnés comme la chaîne de production :
   Pappers alimente le triage, qui alimente Dropcontact et la classification des rôles. */
const TRAITEMENTS: Traitement[] = [
  {
    numero: "01",
    nom: "Pappers",
    description: "Identification SIREN des sociétés",
    attente: "2 fiches",
    statut: "a-jour",
    fichesConcernees: 2,
    coutEstime: "2 jetons",
    reserveConcernee: "Jetons Pappers",
    impact: {
      perimetre: "sociétés de la base",
      tiers: [
        { nom: "Tier A", valeur: 787 },
        { nom: "Tier B", valeur: 2881 },
        { nom: "Tier C", valeur: 1367 },
      ],
      reste: [
        { nom: "A", valeur: 0 },
        { nom: "B", valeur: 1 },
        { nom: "C", valeur: 1 },
      ],
    },
  },
  {
    numero: "02",
    nom: "Triage · Score · Propagation",
    description: "Classement algorithmique A/B/C",
    attente: "0",
    statut: "a-jour",
    fichesConcernees: 0,
    coutEstime: "—",
    impact: {
      perimetre: "toute la base — sociétés et contacts",
      tiers: [
        { nom: "Tier A", valeur: 2105 },
        { nom: "Tier B", valeur: 6052 },
        { nom: "Tier C", valeur: 3006 },
      ],
      reste: [
        { nom: "A", valeur: 0 },
        { nom: "B", valeur: 0 },
        { nom: "C", valeur: 0 },
      ],
    },
  },
  {
    numero: "03",
    nom: "Dropcontact",
    description: "Enrichissement emails et téléphones (Tiers A & B)",
    attente: "1 752 en attente",
    statut: "a-lancer",
    libelleBouton: "Lancer le traitement",
    fichesConcernees: 1752,
    coutEstime: "1 752 crédits",
    reserveConcernee: "Crédits Dropcontact",
    canaux: [
      { nom: "Email professionnel", valeur: 3902 },
      { nom: "Téléphone direct", valeur: 2410 },
    ],
    impact: {
      perimetre: "contacts des tiers A et B",
      tiers: [
        { nom: "Tier A", valeur: 1318 },
        { nom: "Tier B", valeur: 3171 },
        { nom: "Tier C", valeur: 0 },
      ],
      reste: [
        { nom: "A", valeur: 412 },
        { nom: "B", valeur: 1340 },
        { nom: "C", valeur: 0 },
      ],
    },
  },
  {
    numero: "04",
    nom: "Rôle du contact",
    description: "Classification par dictionnaire métier",
    attente: "0",
    statut: "a-jour",
    fichesConcernees: 0,
    coutEstime: "—",
    impact: {
      perimetre: "contacts de la base",
      tiers: [
        { nom: "Tier A", valeur: 1318 },
        { nom: "Tier B", valeur: 3171 },
        { nom: "Tier C", valeur: 1639 },
      ],
      reste: [
        { nom: "A", valeur: 0 },
        { nom: "B", valeur: 0 },
        { nom: "C", valeur: 0 },
      ],
    },
  },
  {
    numero: "05",
    nom: "Rôle du contact — IA",
    description: "Traitement des intitulés ambigus",
    attente: "288 en attente",
    statut: "a-lancer",
    cout: "0,35 €",
    libelleBouton: "Lancer l'IA",
    fichesConcernees: 288,
    coutEstime: "0,35 €",
    impact: {
      perimetre: "contacts de la base",
      tiers: [
        { nom: "Tier A", valeur: 1318 },
        { nom: "Tier B", valeur: 3171 },
        { nom: "Tier C", valeur: 1639 },
      ],
      reste: [
        { nom: "A", valeur: 87 },
        { nom: "B", valeur: 153 },
        { nom: "C", valeur: 48 },
      ],
    },
  },
];

const HISTORIQUE = [
  { debut: "24/08 15:32", traitement: "Triage · Score · Propagation", mode: "écriture", lues: "11 163", ecrites: "0", fin: "15:33" },
  { debut: "24/08 12:17", traitement: "Triage · Score · Propagation", mode: "écriture", lues: "6 128", ecrites: "19", fin: "12:17" },
  { debut: "24/08 08:41", traitement: "Pappers", mode: "simulation", lues: "5 035", ecrites: "0", fin: "08:42" },
  { debut: "23/08 17:05", traitement: "Rôle du contact", mode: "écriture", lues: "6 128", ecrites: "442", fin: "17:06" },
  { debut: "23/08 11:22", traitement: "Dropcontact", mode: "écriture", lues: "4 489", ecrites: "1 204", fin: "11:26" },
  { debut: "22/08 16:48", traitement: "Triage · Score · Propagation", mode: "écriture", lues: "11 163", ecrites: "27", fin: "16:49" },
  { debut: "22/08 09:03", traitement: "Pappers", mode: "écriture", lues: "5 035", ecrites: "88", fin: "09:04" },
  { debut: "21/08 14:19", traitement: "Rôle du contact — IA", mode: "simulation", lues: "742", ecrites: "0", fin: "14:20" },
  { debut: "21/08 10:55", traitement: "Rôle du contact", mode: "écriture", lues: "6 128", ecrites: "311", fin: "10:56" },
  { debut: "20/08 15:40", traitement: "Dropcontact", mode: "écriture", lues: "4 489", ecrites: "980", fin: "15:43" },
  { debut: "20/08 08:12", traitement: "Triage · Score · Propagation", mode: "simulation", lues: "11 163", ecrites: "0", fin: "08:13" },
  { debut: "19/08 17:31", traitement: "Pappers", mode: "écriture", lues: "5 035", ecrites: "52", fin: "17:32" },
  { debut: "19/08 11:07", traitement: "Rôle du contact", mode: "écriture", lues: "6 128", ecrites: "266", fin: "11:08" },
  { debut: "18/08 16:24", traitement: "Dropcontact", mode: "écriture", lues: "4 489", ecrites: "1 047", fin: "16:27" },
  { debut: "18/08 09:50", traitement: "Triage · Score · Propagation", mode: "écriture", lues: "6 128", ecrites: "11", fin: "09:50" },
];

/* ------------------------------------------------------------------ */
/* Détail d'un passage — extrait de fiches et points d'attention       */
/* ------------------------------------------------------------------ */

type FicheDetail = {
  nom: string;
  tier: "A" | "B" | "C";
  changement: string;
  ecrite: boolean;
};

type DetailPassageData = {
  fiches: FicheDetail[];
  attention: string[];
};

const FICHES_SOCIETES = [
  "Tronics Microsystems",
  "Asteelflash Grenoble",
  "Serma Technologies",
  "MMT-Baumann",
  "Eolane Valence",
  "Photonique Systems",
  "Alpes Contrôle",
  "Sirea Énergie",
  "Wavelight Medical",
  "Mecapack Lyon",
];

const FICHES_CONTACTS = [
  "D. Revol — Dir. industriel",
  "S. Chabert — Resp. achats",
  "M. Perrin — Dir. R&D",
  "C. Bouvier — Resp. production",
  "L. Faure — Dir. technique",
  "A. Morel — Resp. supply chain",
  "J. Roche — Chef de projet",
  "V. Lambert — Dir. général",
  "N. Girard — Resp. qualité",
  "P. Marchand — Ing. process",
];

const CHANGEMENTS_PAR_TRAITEMENT: Record<string, string[]> = {
  pappers: [
    "SIREN identifié",
    "SIREN confirmé",
    "Dirigeant vérifié",
    "Aucune correspondance trouvée",
  ],
  dropcontact: [
    "Email professionnel ajouté",
    "Téléphone direct ajouté",
    "Email + téléphone ajoutés",
    "Aucune donnée trouvée",
  ],
  triage: [
    "Tier B → A",
    "Tier C → B",
    "Score recalculé, tier inchangé",
    "Tier A confirmé",
  ],
  role: [
    "Rôle : direction industrielle",
    "Rôle : achats / supply chain",
    "Rôle : R&D / technique",
    "Intitulé ambigu → file IA",
  ],
};

const ATTENTIONS_PAR_TRAITEMENT: Record<string, string[]> = {
  pappers: [
    "{n} sociétés sans correspondance SIREN — vérification manuelle conseillée",
    "{n} homonymes détectés — rapprochement à confirmer",
  ],
  dropcontact: [
    "{n} emails invalides écartés automatiquement",
    "{n} fiches sans réponse — relance possible au prochain passage",
  ],
  triage: [
    "{n} fiches sans chiffre d'affaires — score incomplet",
    "{n} sociétés sans effectif renseigné",
  ],
  role: [
    "{n} intitulés ambigus renvoyés vers le traitement IA",
    "{n} fiches sans intitulé — ignorées",
  ],
};

function categoriePassage(nom: string): string {
  const n = nom.toLowerCase();
  if (n.includes("pappers")) return "pappers";
  if (n.includes("dropcontact")) return "dropcontact";
  if (n.includes("rôle")) return "role";
  return "triage";
}

/* Reconstitue un extrait représentatif du passage à partir de ses totaux. */
function detailDuPassage(
  passage: (typeof HISTORIQUE)[number],
  index: number,
): DetailPassageData {
  const categorie = categoriePassage(passage.traitement);
  const lues = nombre(passage.lues);
  const ecrites = nombre(passage.ecrites);

  const noms =
    categorie === "pappers"
      ? FICHES_SOCIETES
      : categorie === "triage"
        ? [...FICHES_SOCIETES, ...FICHES_CONTACTS]
        : FICHES_CONTACTS;

  const changements = CHANGEMENTS_PAR_TRAITEMENT[categorie]!;
  const tiers: ("A" | "B" | "C")[] = ["A", "B", "B", "C", "A"];

  const fiches: FicheDetail[] = Array.from({ length: 5 }, (_, i) => {
    const changement = changements[(index + i) % changements.length]!;
    const sansEcriture =
      changement.includes("Aucune") ||
      changement.includes("inchangé") ||
      changement.includes("file IA");
    return {
      nom: noms[(index * 3 + i * 2) % noms.length]!,
      tier: tiers[(index + i) % tiers.length]!,
      changement,
      ecrite: passage.mode === "écriture" && ecrites > 0 && !sansEcriture,
    };
  });

  const base = ecrites > 0 ? ecrites : lues;
  const attention = ATTENTIONS_PAR_TRAITEMENT[categorie]!.map((modele, i) =>
    modele.replace(
      "{n}",
      Math.max(1, Math.round(base * (0.04 + i * 0.02))).toLocaleString("fr-FR"),
    ),
  );
  if (passage.mode === "simulation") {
    attention.unshift("Simulation — aucune écriture en base.");
  } else if (ecrites === 0) {
    attention.unshift("Aucune fiche modifiée — la base était déjà à jour.");
  }

  return { fiches, attention };
}

/* ------------------------------------------------------------------ */
/* Bouton de lancement — geste délibéré en deux temps                  */
/* ------------------------------------------------------------------ */

function BoutonLancement({
  traitement,
}: {
  traitement: Traitement;
}) {
  const [etat, setEtat] = useState<"pret" | "confirme" | "lance">("pret");
  const [mode, setMode] = useState<"simulation" | "écriture">("simulation");

  useEffect(() => {
    if (etat !== "confirme") return;
    const minuteur = setTimeout(() => setEtat("pret"), 8000);
    return () => clearTimeout(minuteur);
  }, [etat]);

  if (etat === "lance") {
    return (
      <div className="flex w-56 flex-col items-center gap-1 rounded-lg border border-border bg-muted px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          ✓ Traitement lancé
        </span>
        <span className="text-[10px] text-muted-foreground">
          Le journal sera mis à jour à la fin du passage.
        </span>
      </div>
    );
  }

  const libelle = traitement.libelleBouton ?? "Lancer";

  return (
    <>
      <button
        type="button"
        onClick={() => setEtat("confirme")}
        className="cursor-pointer rounded-lg bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-colors hover:bg-foreground"
      >
        {libelle}
      </button>

      {etat === "confirme" && (
        <EcranConfirmation
          traitement={traitement}
          mode={mode}
          setMode={setMode}
          onConfirmer={() => setEtat("lance")}
          onAnnuler={() => setEtat("pret")}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Écran de confirmation — récapitulatif avant lancement                */
/* ------------------------------------------------------------------ */

function EcranConfirmation({
  traitement,
  mode,
  setMode,
  onConfirmer,
  onAnnuler,
}: {
  traitement: Traitement;
  mode: "simulation" | "écriture";
  setMode: (m: "simulation" | "écriture") => void;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  const consomme = mode === "écriture" && traitement.coutEstime !== "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-line bg-card shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-foreground font-mono text-xs text-background">
            {traitement.numero}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Confirmer le lancement
            </div>
            <div className="text-base font-bold">{traitement.nom}</div>
          </div>
        </div>

        {/* Corps — récapitulatif */}
        <div className="space-y-4 px-6 py-6">
          <LigneRecap etiquette="Fiches concernées">
            <span className="font-mono text-lg font-bold">
              {traitement.fichesConcernees.toLocaleString("fr-FR")}
            </span>
          </LigneRecap>

          <LigneRecap etiquette="Coût estimé">
            {consomme ? (
              <span className="font-mono text-lg font-bold text-accent-deep">
                {traitement.coutEstime}
              </span>
            ) : (
              <span className="font-mono text-lg font-bold text-muted-foreground">
                0
              </span>
            )}
            {consomme && traitement.reserveConcernee && (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                ({traitement.reserveConcernee})
              </span>
            )}
          </LigneRecap>

          {/* Sélecteur de mode */}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Mode d'exécution
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("simulation")}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                  mode === "simulation"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-muted/30 hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">
                  Simulation
                </div>
                <div className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  Lecture seule, aucun coût
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode("écriture")}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                  mode === "écriture"
                    ? "border-accent bg-accent/10 ring-1 ring-accent"
                    : "border-border bg-muted/30 hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-accent-deep">
                  Écriture
                </div>
                <div className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  Modifie la base, consomme des crédits
                </div>
              </button>
            </div>
          </div>

          {mode === "écriture" && traitement.coutEstime !== "—" && (
            <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <p className="text-[11px] leading-snug text-accent-deep">
                Le mode écriture consomme {traitement.coutEstime}
                {traitement.reserveConcernee
                  ? ` (${traitement.reserveConcernee})`
                  : ""}
                . L'opération est définitive.
              </p>
            </div>
          )}
        </div>

        {/* Pied — actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-5">
          <button
            type="button"
            onClick={onAnnuler}
            className="cursor-pointer rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirmer}
            className={`cursor-pointer rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg transition-colors ${
              mode === "écriture"
                ? "bg-accent text-accent-foreground hover:bg-accent-deep"
                : "bg-primary text-primary-foreground hover:bg-foreground"
            }`}
          >
            Confirmer · {mode}
          </button>
        </div>

        <p className="px-6 pb-4 text-center text-[10px] text-muted-foreground">
          Sans confirmation, l'écran se referme tout seul.
        </p>
      </div>
    </div>
  );
}

function LigneRecap({
  etiquette,
  children,
}: {
  etiquette: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {etiquette}
      </span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Entete() {
  return (
    <header className="mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-8 border-b border-line pb-8 md:flex-row md:items-end">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Système de pilotage v2.4
          </span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Cockpit{" "}
          <span className="font-light text-muted-foreground">Cofabrik RH</span>
        </h1>
      </div>

      <div className="flex gap-12">
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Dernière écriture
          </span>
          <span className="font-mono text-sm font-medium">
            {DERNIERE_ECRITURE}
          </span>
        </div>
        {RESERVES.map((reserve) => (
          <div key={reserve.nom} className="flex flex-col">
            <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {reserve.nom}
            </span>
            <span className="font-mono text-sm font-medium">
              {reserve.valeur}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

/* Échelle d'encre commune à toutes les réglettes de tiers :
   A = encre pleine, B = encre moyenne, C = encre légère. */
const COULEURS_TIERS = [
  "bg-foreground",
  "bg-foreground/45",
  "bg-muted-foreground/30",
];

function PanneauBase({
  titre,
  total,
  tiers,
}: {
  titre: string;
  total: string;
  tiers: { nom: string; valeur: number }[];
}) {
  const somme = tiers.reduce((acc, t) => acc + t.valeur, 0);
  const format = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="bg-card p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">
          {titre}
        </h3>
        <span className="font-mono text-4xl font-bold tracking-tighter">
          {total}
        </span>
      </div>

      {/* Réglette de répartition des tiers */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {tiers.map((tier, i) => (
          <div
            key={tier.nom}
            className={COULEURS_TIERS[i]}
            style={{ width: `${(tier.valeur / somme) * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {tiers.map((tier, i) => (
          <div key={tier.nom} className="flex flex-col">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${COULEURS_TIERS[i]}`} />
              {tier.nom}
            </span>
            <span className="mt-1 font-mono text-lg font-bold tracking-tight">
              {format(tier.valeur)}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {Math.round((tier.valeur / somme) * 100)}&nbsp;% de la base
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LigneTraitement({ traitement }: { traitement: Traitement }) {
  const aLancer = traitement.statut === "a-lancer";
  const [ouvert, setOuvert] = useState(false);

  const cadre = aLancer
    ? "border border-accent/40 bg-accent/5"
    : "border border-border bg-card opacity-60 hover:opacity-100";

  const pastille = aLancer
    ? "bg-accent text-accent-foreground"
    : "border border-border bg-muted text-muted-foreground";

  return (
    <div
      className={`group @container rounded-lg p-4 transition-all ${cadre} ${
        ouvert ? "opacity-100 ring-1 ring-foreground/20" : "hover:border-foreground/40"
      }`}
    >
      <div
        onClick={() => setOuvert((o) => !o)}
        className="flex cursor-pointer flex-col gap-4 select-none @2xl:flex-row @2xl:items-center @2xl:justify-between"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded font-mono text-xs ${pastille}`}
          >
            {traitement.numero}
          </div>
          <div className="min-w-0">
            <div
              className={`font-semibold ${aLancer ? "text-accent-deep" : ""}`}
            >
              {traitement.nom}
            </div>
            <div
              className={`text-xs ${aLancer ? "text-accent-deep/60" : "text-muted-foreground"}`}
            >
              {traitement.description}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="text-right">
            {traitement.cout && (
              <div className="text-[10px] font-bold uppercase tracking-tighter text-accent">
                Coût estimé : {traitement.cout}
              </div>
            )}
            {!aLancer && (
              <div className="text-xs uppercase tracking-tighter text-muted-foreground">
                Attente
              </div>
            )}
            <div
              className={`font-mono ${
                aLancer
                  ? "font-bold text-accent-deep"
                  : "text-muted-foreground"
              } ${traitement.attente === "2 fiches" ? "font-bold text-foreground" : ""}`}
            >
              {traitement.attente}
            </div>
          </div>

          {/* Le bouton de lancement ne doit pas déplier le détail */}
          <div onClick={(e) => e.stopPropagation()}>
            {aLancer ? (
              <BoutonLancement traitement={traitement} />
            ) : (
              <div className="w-32 rounded border border-border bg-muted py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                À jour
              </div>
            )}
          </div>

          {/* Affordance explicite du tiroir */}
          <span
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              ouvert
                ? "border-foreground/40 text-foreground"
                : "border-border text-muted-foreground group-hover:border-foreground/40 group-hover:text-foreground"
            }`}
          >
            {ouvert ? "Masquer" : "Détail"}
            <span
              aria-hidden="true"
              className={`inline-block transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </span>
        </div>
      </div>

      {ouvert && <DetailTraitement traitement={traitement} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Détail d'un traitement — répartition par tier et reste à faire      */
/* ------------------------------------------------------------------ */


function DetailTraitement({ traitement }: { traitement: Traitement }) {
  const { perimetre, tiers, reste } = traitement.impact;
  const total = tiers.reduce((acc, t) => acc + t.valeur, 0);
  const totalReste = reste.reduce((acc, t) => acc + t.valeur, 0);
  const dejaTraitees = total - totalReste;
  const format = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="mt-4 space-y-6 border-t border-border pt-5">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Réglette de répartition des fiches impactées par tier */}
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Fiches impactées — {perimetre}
            </span>
            <span className="font-mono text-sm font-bold">{format(total)}</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {tiers.map((tier, i) =>
              tier.valeur > 0 ? (
                <div
                  key={tier.nom}
                  className={COULEURS_TIERS[i]}
                  style={{ width: `${(tier.valeur / total) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <div key={tier.nom} className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${COULEURS_TIERS[i]}`} />
                  {tier.nom}
                </span>
                <span className="font-mono text-sm font-bold">
                  {tier.valeur > 0 ? format(tier.valeur) : "—"}
                </span>
                {tier.valeur === 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    hors périmètre
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Réglette d'avancement : déjà traitées vs reste à faire */}
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Reste à faire
            </span>
            <span
              className={`font-mono text-2xl font-bold tracking-tighter ${
                totalReste > 0 ? "text-accent-deep" : "text-muted-foreground"
              }`}
            >
              {format(totalReste)}
            </span>
          </div>
          <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-background">
            {dejaTraitees > 0 && (
              <div
                className="bg-foreground/25"
                style={{ width: `${(dejaTraitees / total) * 100}%` }}
              />
            )}
            {totalReste > 0 && (
              <div
                className="bg-accent"
                style={{ width: `${(totalReste / total) * 100}%` }}
              />
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-foreground/25" />
              {format(dejaTraitees)} déjà traitées
            </span>
            {totalReste > 0 ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="font-bold text-accent-deep">
                    {format(totalReste)} en attente
                  </span>
                </span>
                {reste
                  .filter((r) => r.valeur > 0)
                  .map((r) => (
                    <span key={r.nom} className="font-mono">
                      dont {r.nom}&nbsp;:{" "}
                      <span className="font-bold text-accent-deep">
                        {format(r.valeur)}
                      </span>
                    </span>
                  ))}
              </>
            ) : (
              <span>Rien en attente — le traitement est à jour.</span>
            )}
          </div>
        </div>
      </div>

      {/* Canaux de données déjà récupérés (Dropcontact) */}
      {traitement.canaux && (
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Données déjà récupérées sur les {format(total)} contacts
            </span>
            <span className="text-[10px] text-muted-foreground">
              Le prochain passage complète les {format(totalReste)} fiches en
              attente
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {traitement.canaux.map((canal) => (
              <div key={canal.nom}>
                <div className="mb-1.5 flex items-baseline justify-between text-xs">
                  <span className="font-medium">{canal.nom}</span>
                  <span className="font-mono text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {format(canal.valeur)}
                    </span>{" "}
                    / {format(total)} ·{" "}
                    {Math.round((canal.valeur / total) * 100)}&nbsp;%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-foreground/45"
                    style={{ width: `${(canal.valeur / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Les valeurs numériques (« 11 163 ») utilisent l'espace fine comme séparateur. */
function nombre(texte: string): number {
  return Number(texte.replace(/\s/g, "").replace(/[^\d]/g, "")) || 0;
}

const COULEURS_PASTILLE_TIER: Record<string, string> = {
  A: "bg-primary/10 text-primary",
  B: "bg-foreground/10 text-foreground",
  C: "bg-muted text-muted-foreground",
};

function DetailPassage({
  passage,
  detail,
}: {
  passage: (typeof HISTORIQUE)[number];
  detail: DetailPassageData;
}) {
  return (
    <div className="grid gap-6 border-l-2 border-primary/40 pl-5 md:grid-cols-[1.6fr_1fr]">
      {/* Extrait des fiches du passage */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Fiches lues et écrites — extrait
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            5 fiches sur {passage.lues} lues
          </span>
        </div>
        <ul className="divide-y divide-border">
          {detail.fiches.map((fiche) => (
            <li
              key={fiche.nom}
              className="flex items-center justify-between gap-4 py-2"
            >
              <span className="flex items-center gap-2.5 font-sans text-xs font-medium text-foreground">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${COULEURS_PASTILLE_TIER[fiche.tier]}`}
                >
                  {fiche.tier}
                </span>
                {fiche.nom}
              </span>
              <span className="flex items-center gap-2 text-right">
                <span className="text-[11px] text-muted-foreground">
                  {fiche.changement}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${
                    fiche.ecrite
                      ? "bg-primary/10 font-bold text-primary"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {fiche.ecrite ? "écrite" : "lue"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Points d'attention du passage */}
      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Points d'attention
        </div>
        <ul className="space-y-2">
          {detail.attention.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 text-xs leading-snug text-foreground"
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function JournalBord() {
  const traitementsDisponibles = Array.from(
    new Set(HISTORIQUE.map((p) => p.traitement)),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  const [ordre, setOrdre] = useState<"recent" | "ancien">("recent");
  const [filtre, setFiltre] = useState<string>("Tous");
  const [ouvert, setOuvert] = useState<string | null>(null);

  const passages = HISTORIQUE.filter(
    (p) => filtre === "Tous" || p.traitement === filtre,
  ).sort((a, b) => {
    // Les débuts sont au format « JJ/MM HH:mm » — année implicite 2026.
    const ta = Date.parse(`2026/${a.debut.replace(" ", "T")}:00`);
    const tb = Date.parse(`2026/${b.debut.replace(" ", "T")}:00`);
    return ordre === "recent" ? tb - ta : ta - tb;
  });

  const totalLues = passages.reduce((acc, p) => acc + nombre(p.lues), 0);
  const totalEcrites = passages.reduce((acc, p) => acc + nombre(p.ecrites), 0);
  const format = (n: number) => n.toLocaleString("fr-FR");

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Journal de bord — {passages.length}{" "}
          {passages.length > 1 ? "passages" : "passage"}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Traitement
            <select
              value={filtre}
              onChange={(e) => setFiltre(e.target.value)}
              className="cursor-pointer rounded-md border border-border bg-card px-3 py-2 font-sans text-xs font-medium normal-case tracking-normal text-foreground transition-colors hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="Tous">Tous les traitements</option>
              {traitementsDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() =>
              setOrdre((o) => (o === "recent" ? "ancien" : "recent"))
            }
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <span>{ordre === "recent" ? "↓" : "↑"}</span>
            {ordre === "recent" ? "Plus récent" : "Plus ancien"}
          </button>
        </div>
      </div>

      {/* Résumé des fiches lues et écrites sur la sélection affichée */}
      <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-sm">
        <div className="flex items-baseline justify-between bg-card px-5 py-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Fiches lues (cumul)
          </span>
          <span className="font-mono text-2xl font-bold tracking-tighter">
            {format(totalLues)}
          </span>
        </div>
        <div className="flex items-baseline justify-between bg-card px-5 py-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Fiches écrites (cumul)
          </span>
          <span
            className={`font-mono text-2xl font-bold tracking-tighter ${
              totalEcrites > 0 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {format(totalEcrites)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Démarrage
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Traitement
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Mode
              </th>
              <th className="p-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fiches lues
              </th>
              <th className="p-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fiches écrites
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Fin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-xs">
            {passages.map((passage, index) => {
              const aEcrit =
                passage.mode === "écriture" && passage.ecrites !== "0";
              const cle = `${passage.debut}-${passage.traitement}`;
              const estOuvert = ouvert === cle;
              return (
                <Fragment key={cle}>
                  <tr
                    onClick={() => setOuvert(estOuvert ? null : cle)}
                    aria-expanded={estOuvert}
                    className={`cursor-pointer transition-colors hover:bg-muted ${estOuvert ? "bg-muted/60" : ""}`}
                  >
                    <td className="p-4 text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className={`mr-2 inline-block text-[10px] transition-transform duration-200 ${estOuvert ? "rotate-90" : ""}`}
                      >
                        ▸
                      </span>
                      {passage.debut}
                    </td>
                    <td className="p-4 font-sans font-semibold text-foreground">
                      {passage.traitement}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          passage.mode === "écriture"
                            ? "bg-muted text-muted-foreground"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {passage.mode}
                      </span>
                    </td>
                    <td className="p-4 text-right">{passage.lues}</td>
                    <td
                      className={`p-4 text-right ${
                        aEcrit
                          ? "font-bold text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {passage.ecrites}
                    </td>
                    <td className="p-4 text-muted-foreground">{passage.fin}</td>
                  </tr>
                  {estOuvert && (
                    <tr className="bg-muted/30">
                      <td colSpan={6} className="px-6 py-5">
                        <DetailPassage
                          passage={passage}
                          detail={detailDuPassage(passage, index)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {passages.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center font-sans text-sm text-muted-foreground"
                >
                  Aucun passage ne correspond à ce traitement.
                </td>
              </tr>
            )}
          </tbody>
          {passages.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/50 font-mono text-xs">
                <td className="p-4 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total ({passages.length}{" "}
                  {passages.length > 1 ? "passages" : "passage"})
                </td>
                <td className="p-4" />
                <td className="p-4" />
                <td className="p-4 text-right font-bold">{format(totalLues)}</td>
                <td
                  className={`p-4 text-right font-bold ${
                    totalEcrites > 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {format(totalEcrites)}
                </td>
                <td className="p-4" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Chaîne de traitement — la matière passe d'un traitement à l'autre   */
/* ------------------------------------------------------------------ */

/* Connecteur entre deux traitements : ce qui sort de l'un alimente l'autre. */
function ConnecteurFlux({
  quantite,
  libelle,
  attente,
}: {
  quantite: string;
  libelle: string;
  attente?: string;
}) {
  return (
    <div className="flex items-stretch gap-4" aria-hidden="true">
      <div className="relative ml-[35px] w-px self-stretch bg-line">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">
          ▼
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2.5 text-xs text-muted-foreground">
        <span className="font-mono font-bold text-foreground">{quantite}</span>
        <span>{libelle}</span>
        {attente && (
          <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent-deep">
            {attente}
          </span>
        )}
      </div>
    </div>
  );
}

function ChaineTraitements() {
  const [pappers, triage, dropcontact, role, roleIa] = TRAITEMENTS;
  if (!pappers || !triage || !dropcontact || !role || !roleIa) return null;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Traitements automatiques — la chaîne de production
        </h2>
        <span className="rounded bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
          Action requise sur 2 traitements
        </span>
      </div>

      <div>
        <LigneTraitement traitement={pappers} />
        <ConnecteurFlux
          quantite="5 035"
          libelle="sociétés identifiées alimentent le classement"
          attente="2 en attente"
        />
        <LigneTraitement traitement={triage} />

        {/* Après le classement, la matière se divise en deux branches */}
        <div className="flex items-center gap-4 py-1 pl-[35px]">
          <span className="text-[8px] text-muted-foreground">▼</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Le classement alimente deux traitements
          </span>
        </div>

        <div className="grid gap-2 lg:grid-cols-2 lg:gap-6">
          {/* Branche enrichissement */}
          <div>
            <ConnecteurFlux
              quantite="4 489"
              libelle="contacts des tiers A & B à enrichir"
              attente="1 752 en attente"
            />
            <LigneTraitement traitement={dropcontact} />
          </div>

          {/* Branche classification des rôles */}
          <div>
            <ConnecteurFlux
              quantite="6 128"
              libelle="intitulés de poste à classer"
            />
            <LigneTraitement traitement={role} />
            <ConnecteurFlux
              quantite="288"
              libelle="intitulés ambigus confiés à l'IA"
              attente="en attente · 0,35 €"
            />
            <LigneTraitement traitement={roleIa} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Cockpit() {
  return (
    <div className="min-h-screen bg-background p-6 font-sans text-foreground lg:p-12">
      <Entete />

      <main className="mx-auto max-w-7xl space-y-12">
        <section>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            État de la base de données
          </h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-sm md:grid-cols-2">
            <PanneauBase
              titre={BASE.societes.titre}
              total={BASE.societes.total}
              tiers={BASE.societes.tiers}
            />
            <PanneauBase
              titre={BASE.contacts.titre}
              total={BASE.contacts.total}
              tiers={BASE.contacts.tiers}
            />
          </div>
        </section>

        <ChaineTraitements />

        <JournalBord />
      </main>

      <footer className="mx-auto mt-20 max-w-7xl pb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Cofabrik RH © 2026 — Console de pilotage industriel · Grenoble / Lyon
        </p>
      </footer>
    </div>
  );
}
