import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
      { nom: "Tier A", valeur: "787", largeur: "15.6%" },
      { nom: "Tier B", valeur: "2 881" },
      { nom: "Tier C", valeur: "1 367" },
    ],
  },
  contacts: {
    titre: "Contacts activables",
    total: "6 128",
    tiers: [
      { nom: "Tier A", valeur: "1 318", largeur: "21.5%" },
      { nom: "Tier B", valeur: "3 171" },
      { nom: "Tier C", valeur: "1 639" },
    ],
  },
};

type Traitement = {
  numero: string;
  nom: string;
  description: string;
  attente: string;
  statut: "a-jour" | "a-lancer";
  cout?: string;
  principal?: boolean;
  libelleBouton?: string;
};

const TRAITEMENTS: Traitement[] = [
  {
    numero: "01",
    nom: "Pappers",
    description: "Identification SIREN des sociétés",
    attente: "2 fiches",
    statut: "a-jour",
  },
  {
    numero: "02",
    nom: "Dropcontact",
    description: "Enrichissement emails et téléphones (Tiers A & B)",
    attente: "1 752 en attente",
    statut: "a-lancer",
    principal: true,
    libelleBouton: "Lancer le traitement",
  },
  {
    numero: "03",
    nom: "Triage · Score · Propagation",
    description: "Classement algorithmique A/B/C",
    attente: "0",
    statut: "a-jour",
  },
  {
    numero: "04",
    nom: "Rôle du contact",
    description: "Classification par dictionnaire métier",
    attente: "0",
    statut: "a-jour",
  },
  {
    numero: "05",
    nom: "Rôle du contact — IA",
    description: "Traitement des intitulés ambigus",
    attente: "288 en attente",
    statut: "a-lancer",
    cout: "0,35 €",
    libelleBouton: "Lancer l'IA",
  },
];

const HISTORIQUE = [
  { debut: "24/08 15:32", traitement: "Triage score propagation", mode: "écriture", lues: "11 163", ecrites: "0", fin: "15:33" },
  { debut: "24/08 12:17", traitement: "Propagation", mode: "écriture", lues: "6 128", ecrites: "19", fin: "12:17" },
  { debut: "24/08 08:41", traitement: "Pappers", mode: "simulation", lues: "5 035", ecrites: "0", fin: "08:42" },
  { debut: "23/08 17:05", traitement: "Rôle du contact", mode: "écriture", lues: "6 128", ecrites: "442", fin: "17:06" },
  { debut: "23/08 11:22", traitement: "Dropcontact", mode: "écriture", lues: "4 489", ecrites: "1 204", fin: "11:26" },
  { debut: "22/08 16:48", traitement: "Triage · Score · Propagation", mode: "écriture", lues: "11 163", ecrites: "27", fin: "16:49" },
  { debut: "22/08 09:03", traitement: "Pappers", mode: "écriture", lues: "5 035", ecrites: "88", fin: "09:04" },
  { debut: "21/08 14:19", traitement: "Propagation", mode: "simulation", lues: "6 128", ecrites: "0", fin: "14:19" },
  { debut: "21/08 10:55", traitement: "Rôle du contact", mode: "écriture", lues: "6 128", ecrites: "311", fin: "10:56" },
  { debut: "20/08 15:40", traitement: "Dropcontact", mode: "écriture", lues: "4 489", ecrites: "980", fin: "15:43" },
  { debut: "20/08 08:12", traitement: "Triage · Score · Propagation", mode: "simulation", lues: "11 163", ecrites: "0", fin: "08:13" },
  { debut: "19/08 17:31", traitement: "Pappers", mode: "écriture", lues: "5 035", ecrites: "52", fin: "17:32" },
  { debut: "19/08 11:07", traitement: "Rôle du contact", mode: "écriture", lues: "6 128", ecrites: "266", fin: "11:08" },
  { debut: "18/08 16:24", traitement: "Dropcontact", mode: "écriture", lues: "4 489", ecrites: "1 047", fin: "16:27" },
  { debut: "18/08 09:50", traitement: "Propagation", mode: "écriture", lues: "6 128", ecrites: "11", fin: "09:50" },
];

/* ------------------------------------------------------------------ */
/* Bouton de lancement — geste délibéré en deux temps                  */
/* ------------------------------------------------------------------ */

function BoutonLancement({
  tonalite,
  libelle,
}: {
  tonalite: "principal" | "accent";
  libelle: string;
}) {
  const [etat, setEtat] = useState<"pret" | "arme" | "lance">("pret");

  useEffect(() => {
    if (etat !== "arme") return;
    const minuteur = setTimeout(() => setEtat("pret"), 6000);
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

  if (etat === "arme") {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEtat("pret")}
            className="cursor-pointer rounded-lg border border-border bg-card px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => setEtat("lance")}
            className="cursor-pointer rounded-lg bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background shadow-lg ring-2 ring-foreground/20 transition-colors hover:bg-foreground/90"
          >
            Confirmer le lancement
          </button>
        </div>
        <p className="max-w-56 text-right text-[10px] leading-snug text-muted-foreground">
          Le lancement consomme des crédits. Sans confirmation, l'armement
          s'annule tout seul.
        </p>
      </div>
    );
  }

  const styles =
    tonalite === "principal"
      ? "bg-primary text-primary-foreground shadow-lg hover:bg-foreground"
      : "bg-accent text-accent-foreground shadow-sm hover:bg-accent-deep";

  return (
    <button
      type="button"
      onClick={() => setEtat("arme")}
      className={`cursor-pointer rounded-lg px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${styles}`}
    >
      {libelle}
    </button>
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

function PanneauBase({
  titre,
  total,
  tiers,
  miseEnAvant,
}: {
  titre: string;
  total: string;
  tiers: { nom: string; valeur: string; largeur?: string }[];
  miseEnAvant: "encre" | "cobalt";
}) {
  const [tierA, ...autres] = tiers;
  if (!tierA) return null;
  const couleur = miseEnAvant === "cobalt" ? "bg-primary" : "bg-foreground";
  const texte = miseEnAvant === "cobalt" ? "text-primary" : "text-foreground";

  return (
    <div className="bg-card p-8">
      <div className="mb-8 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">
          {titre}
        </h3>
        <span className="font-mono text-4xl font-bold tracking-tighter">
          {total}
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${couleur}`} />
            {tierA.nom}
          </span>
          <span className={`font-mono font-bold ${texte}`}>{tierA.valeur}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${couleur}`}
            style={{ width: tierA.largeur }}
          />
        </div>
        <div className="grid grid-cols-2 gap-8 pt-2 text-sm">
          {autres.map((tier) => (
            <div key={tier.nom} className="flex flex-col">
              <span className="text-xs text-muted-foreground">{tier.nom}</span>
              <span className="font-mono font-medium">{tier.valeur}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LigneTraitement({ traitement }: { traitement: Traitement }) {
  const aLancer = traitement.statut === "a-lancer";

  const cadre = traitement.principal
    ? "border-2 border-primary bg-card p-5 shadow-lg"
    : aLancer
      ? "border border-accent/40 bg-accent/5 p-4"
      : "border border-border bg-card p-4 opacity-60 transition-opacity hover:opacity-100";

  const pastille = traitement.principal
    ? "bg-primary text-primary-foreground"
    : aLancer
      ? "bg-accent text-accent-foreground"
      : "border border-border bg-muted text-muted-foreground";

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg sm:flex-row sm:items-center sm:justify-between ${cadre}`}
    >
      <div className="flex items-center gap-6">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded font-mono text-xs ${pastille}`}
        >
          {traitement.numero}
        </div>
        <div>
          <div
            className={
              traitement.principal
                ? "text-lg font-bold"
                : aLancer
                  ? "font-semibold text-accent-deep"
                  : "font-semibold"
            }
          >
            {traitement.nom}
          </div>
          <div
            className={`text-xs ${aLancer && !traitement.principal ? "text-accent-deep/60" : "text-muted-foreground"}`}
          >
            {traitement.description}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-12">
        <div className="text-right">
          {traitement.principal && (
            <div className="animate-pulse text-xs font-bold uppercase tracking-tighter text-primary">
              Important
            </div>
          )}
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
              traitement.principal
                ? "text-xl font-bold"
                : aLancer
                  ? "font-bold text-accent-deep"
                  : "text-muted-foreground"
            } ${traitement.attente === "2 fiches" ? "font-bold text-foreground" : ""}`}
          >
            {traitement.attente}
          </div>
        </div>

        {aLancer ? (
          <BoutonLancement
            tonalite={traitement.principal ? "principal" : "accent"}
            libelle={traitement.libelleBouton ?? "Lancer"}
          />
        ) : (
          <div className="w-32 rounded border border-border bg-muted py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            À jour
          </div>
        )}
      </div>
    </div>
  );
}

function JournalBord() {
  return (
    <section>
      <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Journal de bord — 15 derniers passages
      </h2>
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
            {HISTORIQUE.map((passage) => {
              const aEcrit =
                passage.mode === "écriture" && passage.ecrites !== "0";
              return (
                <tr
                  key={`${passage.debut}-${passage.traitement}`}
                  className="transition-colors hover:bg-muted"
                >
                  <td className="p-4 text-muted-foreground">{passage.debut}</td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

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
              miseEnAvant="encre"
            />
            <PanneauBase
              titre={BASE.contacts.titre}
              total={BASE.contacts.total}
              tiers={BASE.contacts.tiers}
              miseEnAvant="cobalt"
            />
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Traitements automatiques
            </h2>
            <span className="rounded bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              Action requise sur 2 traitements
            </span>
          </div>
          <div className="space-y-2">
            {TRAITEMENTS.map((traitement) => (
              <LigneTraitement
                key={traitement.numero}
                traitement={traitement}
              />
            ))}
          </div>
        </section>

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
