/* ════════════════════════════════════════════════════════════
   LES JARDINS DE CÉLESTINE · Carnet de bord partagé
   Mémoire commune à tous les jeux : parcours, niveaux, variété.
   À inclure dans chaque jeu :  <script src="jdc-parcours.js"></script>
   ════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var CLE = 'jdc_parcours_v1';
  var MAX_SESSIONS = 300;          // on garde les 300 dernières parties
  var CIBLE_BASSE = 0.60;          // en dessous : on redescend d'un cran
  var CIBLE_HAUTE = 0.85;          // au dessus : on monte d'un cran

  /* ── Catalogue : ce que travaille chaque jeu et son exigence ──
     exigence : 1 = accessible, 2 = intermédiaire, 3 = soutenu     */
  var CATALOGUE = {
    cherchetrouve: { nom: 'Cherche et Trouve', fonction: 'attention',  exigence: 1, niveaux: 3 },
    motsmanquants: { nom: 'Les Mots Manquants', fonction: 'langage',   exigence: 2, niveaux: 3 },
    association:   { nom: 'À qui appartient ?', fonction: 'memoire',   exigence: 2, niveaux: 3 },
    saisons:       { nom: 'Au fil des Saisons', fonction: 'temps',     exigence: 2, niveaux: 3 },
    danslordre:    { nom: "Dans l'Ordre",       fonction: 'logique',   exigence: 2, niveaux: 3 },
    memoire:       { nom: 'Mémoire des Grands', fonction: 'memoire',   exigence: 2, niveaux: 3 },
    memory:        { nom: 'Memory',             fonction: 'memoire',   exigence: 1, niveaux: 3 },
    paires:        { nom: 'Jeu des Paires',     fonction: 'memoire',   exigence: 1, niveaux: 3 },
    loto:          { nom: 'Loto des Images',    fonction: 'memoire',   exigence: 1, niveaux: 3 },
    motsmeles:     { nom: 'Mots Mêlés',         fonction: 'langage',   exigence: 2, niveaux: 4 },
    associations:  { nom: 'Associations',       fonction: 'langage',   exigence: 1, niveaux: 3 },
    calcul:        { nom: 'Calcul Mental',      fonction: 'calcul',    exigence: 2, niveaux: 3 },
    sudoku:        { nom: 'Sudoku',             fonction: 'calcul',    exigence: 3, niveaux: 3 },
    intrus:        { nom: "Trouver l'Intrus",   fonction: 'attention', exigence: 1, niveaux: 3 },
    formes:        { nom: 'Jeu des Formes',     fonction: 'attention', exigence: 1, niveaux: 3 },
    labyrinthe:    { nom: 'Labyrinthe',         fonction: 'attention', exigence: 2, niveaux: 3 },
    puzzle:        { nom: 'Puzzle',             fonction: 'attention', exigence: 2, niveaux: 3 },
    heure:         { nom: "Jeu de l'Heure",     fonction: 'temps',     exigence: 2, niveaux: 3 },
    changeregle:   { nom: 'Change de Règle',    fonction: 'executif',  exigence: 1, niveaux: 3 },
    oeilmot:       { nom: "L'Œil et le Mot",    fonction: 'executif',  exigence: 3, niveaux: 3 },
    enquete:       { nom: "L'Enquête",          fonction: 'logique',   exigence: 2, niveaux: 3 },
    enquete_vase:  { nom: 'Le vase brisé',      fonction: 'logique',   exigence: 2, niveaux: 3 },
    enquete_tarte: { nom: 'La part de tarte',   fonction: 'logique',   exigence: 2, niveaux: 3 },
    journee:       { nom: 'Le moment de la journée', fonction: 'temps', exigence: 1, niveaux: 3 },
    combien:       { nom: 'Combien y en a-t-il ?', fonction: 'calcul', exigence: 1, niveaux: 3 },
    apres:         { nom: "Qu'est-ce qui vient après ?", fonction: 'logique', exigence: 1, niveaux: 3 },
    grandeliste:   { nom: 'La grande liste',    fonction: 'langage', exigence: 1, niveaux: 1 },
    range:         { nom: 'Où est-ce rangé ?',  fonction: 'attention', exigence: 1, niveaux: 3 },
    monnaie:       { nom: 'Rendre la Monnaie', fonction: 'calcul', exigence: 1, niveaux: 3 },
    tables:        { nom: 'Les Tables', fonction: 'calcul', exigence: 2, niveaux: 3 },
    double:        { nom: 'Le double et la moitié', fonction: 'calcul', exigence: 2, niveaux: 3 },
    geographie:    { nom: 'La Géographie', fonction: 'temps', exigence: 2, niveaux: 3 },
    devinettes:    { nom: 'Ça vous revient ?', fonction: 'langage', exigence: 1, niveaux: 3 },
    racontezmoi:   { nom: 'Racontez-moi', fonction: 'langage', exigence: 1, niveaux: 3 },
    filannee:      { nom: "Le Fil de l'Année", fonction: 'temps', exigence: 1, niveaux: 1 },
    objets:        { nom: "Les Objets d'Autrefois", fonction: 'langage', exigence: 1, niveaux: 1 },
    racontemoi:    { nom: "Ça me revient", fonction: 'langage', exigence: 1, niveaux: 1 },
    lettrejour:    { nom: "La Lettre du Jour", fonction: 'langage', exigence: 1, niveaux: 1 },
    panier:        { nom: "Le bon panier", fonction: 'logique', exigence: 1, niveaux: 1 },
    /* Les enquêtes à concertation se jouent à plusieurs. Un seul identifiant
       pour toutes : ce qui les distingue est la variante (potager, goûter…). */
    enquete_groupe: { nom: 'Les enquêtes à plusieurs', fonction: 'logique', exigence: 2, niveaux: 1 }
  };

  var FONCTIONS = {
    memoire:   'La mémoire',
    langage:   'Les mots et le langage',
    calcul:    'Les nombres et le calcul',
    attention: "L'attention et l'observation",
    temps:     'Se repérer dans le temps et dans l\'espace',
    executif:  'La souplesse et le contrôle',
    logique:   'La logique et la déduction'
  };

  /* ── Lecture / écriture ── */
  function lire() {
    try {
      var d = JSON.parse(localStorage.getItem(CLE));
      if (!d || typeof d !== 'object') throw 0;
      if (!Array.isArray(d.sessions)) d.sessions = [];
      if (!d.vus || typeof d.vus !== 'object') d.vus = {};
      return d;
    } catch (e) {
      return { sessions: [], vus: {} };
    }
  }

  function ecrire(d) {
    try {
      if (d.sessions.length > MAX_SESSIONS) {
        d.sessions = d.sessions.slice(-MAX_SESSIONS);
      }
      localStorage.setItem(CLE, JSON.stringify(d));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ── Mesure d'usage, anonyme ──
     Pour savoir, dans deux ou trois mois, quels jeux et quelles rubriques
     du catalogue sont les plus joués (et, dans « Qui a fait quoi ? », quel
     thème est choisi). À chaque partie enregistrée, un signal part vers
     Google Analytics (déjà présent sur le site) :
        jeu_<identifiant>     avec rubrique, niveau, variante
        rubrique_<rubrique>   avec jeu
     Rien d'autre : ni résultat, ni durée, ni nombre d'erreurs, ni nom.
     Sans Google Analytics (bloqueur, hors ligne), le jeu ne voit aucune
     différence. Pour que tes propres parties ne comptent pas, ouvre une
     fois n'importe quelle page du site avec  ?sans-mesure=1  (et
     ?sans-mesure=0  pour rétablir).

     La table RUBRIQUE_DE est ENGENDRÉE par fiches/rubriques_mesure.py
     d'après jeux.html : ne pas la modifier à la main.                    */
  /* RUBRIQUES:DEBUT */
  var RUBRIQUE_DE = {
    apres: 'reperes',
    association: 'memoire',
    associations: 'langage',
    calcul: 'nombres',
    changeregle: 'attention',
    cherchetrouve: 'attention',
    combien: 'nombres',
    commission: 'memoire',
    comptes: 'nombres',
    danslordre: 'logique',
    double: 'nombres',
    enquete: 'logique',
    enquete_a_deux: 'logique',
    enquete_groupe: 'logique',
    enquete_vase: 'logique',
    filannee: 'reperes',
    formes: 'attention',
    geographie: 'reperes',
    gestes: 'quotidien',
    grandeliste: 'souvenirs',
    heure: 'reperes',
    intrus: 'attention',
    journee: 'reperes',
    labyrinthe: 'attention',
    lettre: 'souvenirs',
    lettres: 'langage',
    loto: 'memoire',
    memoire: 'memoire',
    memory: 'memoire',
    monnaie: 'nombres',
    mot_de_trop: 'logique',
    motsmanquants: 'langage',
    motsmeles: 'langage',
    oeilmot: 'attention',
    paires: 'memoire',
    panier: 'logique',
    proverbes: 'langage',
    puzzle: 'attention',
    quifaitquoi: 'memoire',
    racontemoi: 'souvenirs',
    range: 'attention',
    saisons: 'reperes',
    sudoku: 'logique',
    syllabes: 'langage',
    tables: 'nombres',
    ticket: 'nombres',
    touty: 'quotidien'
  };
  /* RUBRIQUES:FIN */

  function sansMesure() {
    var m = /[?&]sans-mesure=([01])(&|#|$)/.exec(global.location.search || '');
    var cle = 'jdc-sans-mesure';
    try {
      if (m && m[1] === '1') localStorage.setItem(cle, '1');
      if (m && m[1] === '0') localStorage.removeItem(cle);
      if (m) return m[1] === '1';
      return localStorage.getItem(cle) === '1';
    } catch (e) {
      return !!(m && m[1] === '1');
    }
  }

  /* Envoie un évènement. Retourne true s'il est parti (utile aux essais). */
  function mesure(nom, params) {
    try {
      if (typeof global.gtag !== 'function' || sansMesure()) return false;
      var n = String(nom).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
      var p = {};
      Object.keys(params || {}).forEach(function (k) {
        var v = params[k];
        if (v !== null && v !== undefined && v !== '') p[k] = String(v).slice(0, 60);
      });
      global.gtag('event', n, p);
      return true;
    } catch (e) {
      return false;
    }
  }

  function mesurerPartie(jeu, niveau, variante) {
    var rub = RUBRIQUE_DE[jeu] || 'autre';
    mesure('jeu_' + jeu, { rubrique: rub, niveau: niveau, variante: variante });
    mesure('rubrique_' + rub, { jeu: jeu });
  }

  /* ── Enregistrer une partie terminée ──
     jeu     : identifiant du catalogue (ex. 'cherchetrouve')
     niveau  : 1, 2, 3…
     reussi  : true si la partie est allée au bout
     options : { duree: secondes, erreurs: n, variante: 'jardin' }        */
  function enregistrer(jeu, niveau, reussi, options) {
    options = options || {};
    var d = lire();
    d.sessions.push({
      j: jeu,
      n: niveau || 1,
      r: !!reussi,
      d: options.duree || 0,
      e: options.erreurs || 0,
      v: options.variante || null,
      t: Date.now()
    });
    ecrire(d);
    mesurerPartie(jeu, niveau || 1,
                  options.variante || options.theme || options.mode);
  }

  /* ── Mémoriser un contenu déjà vu (fable, scène, histoire…) ──
     Sert à ne pas reproposer le même contenu deux fois de suite.        */
  function marquerVu(jeu, idContenu) {
    var d = lire();
    if (!d.vus[jeu]) d.vus[jeu] = [];
    var l = d.vus[jeu];
    var i = l.indexOf(idContenu);
    if (i !== -1) l.splice(i, 1);
    l.push(idContenu);                      // le plus récent en dernier
    if (l.length > 40) d.vus[jeu] = l.slice(-40);
    ecrire(d);
  }

  /* ── Choisir un contenu peu vu récemment ──
     liste : tableau d'identifiants disponibles
     Retourne celui vu le moins récemment (jamais vu en priorité).       */
  function contenuSuivant(jeu, liste) {
    if (!liste || !liste.length) return null;
    var d = lire();
    var vus = d.vus[jeu] || [];
    var jamais = liste.filter(function (id) { return vus.indexOf(id) === -1; });
    var pool = jamais.length ? jamais : liste.slice();
    // parmi le pool, celui vu le plus anciennement
    pool.sort(function (a, b) { return vus.indexOf(a) - vus.indexOf(b); });
    // un peu de hasard parmi les 3 premiers pour éviter la routine
    var top = pool.slice(0, Math.min(3, pool.length));
    return top[Math.floor(Math.random() * top.length)];
  }

  /* ── Statistiques d'un jeu ── */
  function bilanJeu(jeu, niveau) {
    var d = lire();
    var s = d.sessions.filter(function (x) {
      return x.j === jeu && (niveau == null || x.n === niveau);
    });
    if (!s.length) return { parties: 0, reussite: null, derniereDate: null, dernierNiveau: null };
    var ok = s.filter(function (x) { return x.r; }).length;
    return {
      parties: s.length,
      reussite: ok / s.length,
      derniereDate: s[s.length - 1].t,
      dernierNiveau: s[s.length - 1].n
    };
  }

  /* ── Niveau conseillé pour un jeu ──
     Règle : on vise 60–85 % de réussite sur les 5 dernières parties.
     Jamais de saut brutal : on monte ou descend d'un cran maximum.      */
  function niveauConseille(jeu) {
    var info = CATALOGUE[jeu] || { niveaux: 3 };
    var d = lire();
    var s = d.sessions.filter(function (x) { return x.j === jeu; }).slice(-5);
    if (!s.length) return 1;                       // première fois : on démarre doux

    var dernier = s[s.length - 1].n || 1;
    var memeNiveau = s.filter(function (x) { return x.n === dernier; });
    if (memeNiveau.length < 2) return dernier;     // pas assez de recul : on reste

    var ok = memeNiveau.filter(function (x) { return x.r; }).length / memeNiveau.length;
    if (ok >= CIBLE_HAUTE && dernier < info.niveaux) return dernier + 1;
    if (ok <= CIBLE_BASSE && dernier > 1) return dernier - 1;
    return dernier;
  }

  /* ── Suggestions pour la page catalogue ──
     Retourne : reprise (dernier jeu), jamaisEssayes, fonctionDelaissee  */
  function suggestions() {
    var d = lire();
    var res = { reprise: null, jamaisEssayes: [], fonctionDelaissee: null, totalParties: d.sessions.length };
    if (!d.sessions.length) {
      res.jamaisEssayes = Object.keys(CATALOGUE);
      return res;
    }
    var derniere = d.sessions[d.sessions.length - 1];
    res.reprise = {
      jeu: derniere.j,
      nom: (CATALOGUE[derniere.j] || {}).nom || derniere.j,
      niveau: niveauConseille(derniere.j),
      variante: derniere.v
    };
    var joues = {};
    d.sessions.forEach(function (x) { joues[x.j] = true; });
    res.jamaisEssayes = Object.keys(CATALOGUE).filter(function (k) { return !joues[k]; });

    // fonction cognitive la moins travaillée (parmi celles disponibles)
    var parFonction = {};
    Object.keys(FONCTIONS).forEach(function (f) { parFonction[f] = 0; });
    d.sessions.forEach(function (x) {
      var c = CATALOGUE[x.j];
      if (c && parFonction[c.fonction] !== undefined) parFonction[c.fonction]++;
    });
    var mini = null;
    Object.keys(parFonction).forEach(function (f) {
      if (mini === null || parFonction[f] < parFonction[mini]) mini = f;
    });
    if (mini !== null) res.fonctionDelaissee = { cle: mini, nom: FONCTIONS[mini] };
    return res;
  }

  /* ── Effacer (pour le panneau admin) ── */
  function reset() {
    try { localStorage.removeItem(CLE); return true; } catch (e) { return false; }
  }

  /* ── Export brut (pour un futur partage avec un professionnel) ── */
  function exporter() {
    var d = lire();
    return JSON.stringify({
      exporteLe: new Date().toISOString(),
      totalParties: d.sessions.length,
      sessions: d.sessions
    }, null, 2);
  }

  global.JDC = {
    CATALOGUE: CATALOGUE,
    FONCTIONS: FONCTIONS,
    enregistrer: enregistrer,
    mesure: mesure,
    RUBRIQUE_DE: RUBRIQUE_DE,
    marquerVu: marquerVu,
    contenuSuivant: contenuSuivant,
    bilanJeu: bilanJeu,
    niveauConseille: niveauConseille,
    suggestions: suggestions,
    lire: lire,
    reset: reset,
    exporter: exporter
  };
})(window);
