export type Publication = {
  title: string;
  meta: string;
  details?: readonly string[];
};

export const personalPublications: readonly Publication[] = [
  {
    title: "Trous Noirs, Trous Blancs — Patrick Everaert",
    meta: "2005 — Éditeur FRAC Provence-Alpes-Côte d’Azur",
    details: [
      "Les tentations de Patrick Everaert — Pierre-Olivier Rollin",
      "Les fantômes d’Everaert — cinquante-cinq images en suspension — Eric Mangion",
    ],
  },
  {
    title: "Tuer le Temps — Patrick Everaert, journal de l’exposition",
    meta: "2002 — Éditeur BPS22 Centre d’Art Contemporain — Province du Hainaut",
    details: [
      "Le plaisir de ne pas comprendre — Stéphane Corréard",
      "Fictions Politiques — Pierre-Olivier Rollin",
      "Digressions sur l’éclipse de l’art — Renaud Huberlant",
    ],
  },
  {
    title: "Patrick Everaert",
    meta: "1995 — Éditeur Galerie Météo, Paris",
    details: [
      "Un fond de vérité — entretien avec Patrick Everaert — Bernard Lamarche-Vadel",
    ],
  },
] as const;

export const collectivePublications: readonly Publication[] = [
  {
    title: "Architectures Wallonie-Bruxelles — Inventaires #3 Inventories",
    meta: "2020 — Éditeur Cellule architecture de la Fédération Wallonie-Bruxelles",
    details: ["Sous la direction de Gilles Debrun & Pauline de La Boulaye"],
  },
  {
    title: "En attendant l’année dernière, E2N, Archives Actives",
    meta: "2019 — Éditeur MER — Borgerhoff & Lamberigts",
    details: ["Auteur : Laurent Jacob"],
  },
  {
    title: "Guide d’architecture moderne et contemporaine 1881–2017 — Charleroi Métropole",
    meta: "2018 — Mardaga éditeur",
  },
  {
    title: "Art Public",
    meta: "2017 — Éditeur Commission des Arts de Wallonie",
  },
  {
    title: "Les années Bonaparte",
    meta: "2015 — Éditeur Galerie Aline Vidal",
  },
  {
    title: "Chimera",
    meta: "2015 — Éditeur Galerie Meet Factory",
  },
  {
    title: "Pixels of Paradise — Images et croyance — Image and belief",
    meta: "2014 — Éditeur Chiroux Centre Culturel",
  },
  {
    title: "Semaine Hors-Série Ulysse",
    meta: "2013 — Éditeur Analogues",
  },
  {
    title: "10 artistes sur le divan",
    meta: "2013 — Éditeur Academia l’Harmattan",
    details: ["Auteur : Guidino Gosselin"],
  },
  {
    title: "La Vie Mode d’Emploi (Life A User’s Manual)",
    meta: "2011 — Éditeur Meessen — De Clercq",
  },
  {
    title: "Image(s) d’une collection",
    meta: "2010 — Éditeur Musée de la Photographie de Charleroi / Fonds Mercator",
  },
  {
    title: "Objects are like they appear",
    meta: "2010 — Éditeur Meessen — De Clercq",
  },
  {
    title: "Manières Noires",
    meta: "2010 — Éditeur Les Impressions Nouvelles",
  },
  {
    title: "One Shot!",
    meta: "2010 — Éditeur BPS22",
  },
  {
    title: "The State of Things, Brussels/Beijing",
    meta: "2010 — Éditeurs BOZAR Books — Lannoo",
  },
  {
    title: "500 chefs-d’œuvre de l’art belge (volume 1)",
    meta: "2008 — Éditeur Racines",
  },
  {
    title: "Absens",
    meta: "2008 — Éditeur Meessen — De Clercq",
  },
  {
    title: "Atlas de l’art contemporain à l’usage de tous",
    meta: "2007 — Éditeur MAC’s Musée d’Art Contemporain du Grand-Hornu",
    details: ["Auteur : Denis Gielen"],
  },
  {
    title: "Lucky Space — 1990–2006 — 15 ans de la collection",
    meta: "2006 — Éditeur I.D.E.A",
  },
  {
    title: "Prêts à Prêter",
    meta: "2006 — Isthmes éditions / Fonds régional d’art contemporain Paca",
  },
  {
    title: "Brussels South Airport",
    meta: "2005 — Éditeur Krinzinger Projekte",
  },
  {
    title: "Éblouissement",
    meta: "2004 — Éditeur Galeries Nationales du Jeu de Paume",
  },
  {
    title: "Humanism(e) II",
    meta: "2002 — Éditeur Orion Art Gallery",
    details: ["Auteur : Flor Bex"],
  },
  {
    title: "Quand soufflent les vents du sud",
    meta: "2000 — Éditeur Banque Bruxelles-Lambert",
    details: ["Auteurs : Claude Lorent, Anne Petre"],
  },
  {
    title: "De très courts espaces de temps",
    meta: "1998 — Éditeur Actes Sud",
    details: ["Auteur : Régis Durand"],
  },
  {
    title: "Uit het ongewisse / Entre chiens et loups",
    meta: "1997 — Éditeur ICC Antwerpen",
    details: [
      "Sans Titre, trois points de suspension — Patrick Everaert",
    ],
  },
  {
    title: "Une rose est une rose",
    meta: "1993 — Édition Galerie Météo",
    details: ["L’ombre sans cavalier — Pascale Cassagnau"],
  },
  {
    title: "Pour une histoire de la photographie en Belgique",
    meta: "1993 — Édition Musée de la Photographie, Charleroi",
    details: [
      "La photographie comme medium dans le champ des arts plastiques — Anne Wauters",
    ],
  },
] as const;
