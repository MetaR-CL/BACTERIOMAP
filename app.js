/* ============================================================
   BACTERIOMAP — app.js
   Atlas bactériologique interactif par site anatomique
   CHUV Lausanne — Service de microbiologie
   ============================================================ */

// ==================== DATA (chargée depuis data.js) ====================
//
// data.js définit window.BACTERIOMAP_DATA.{zones, bacteries, quiz}
// On les lit ici dans des variables locales pour usage dans tout le code.

var zonesData    = (window.BACTERIOMAP_DATA && window.BACTERIOMAP_DATA.zones)     || {};
var bacteriesData = (window.BACTERIOMAP_DATA && window.BACTERIOMAP_DATA.bacteries) || [];
var quizCases    = (window.BACTERIOMAP_DATA && window.BACTERIOMAP_DATA.quiz)      || [];

// ==================== STATE ====================
let state = {
  currentView: 'home', // home, zone, detail, comparison, quiz, admin
  currentZone: null,
  currentSubZone: null, // Sous-zone active (ex: 'gorge' dans ORL)
  focusedZone: null, // Zone avec sous-zones actuellement "zoomée" sur l'accueil
  currentBacteria: null,
  comparisonList: [],
  quizScore: { correct: 0, total: 0 },
  quizCurrentIndex: 0,
  quizAnswered: false,
  adminLoggedIn: false,
  adminTab: 'bacteries',
  adminEditingBacteria: null,
  adminEditingQuiz: null, // null | 'new' | index number
  searchQuery: '',
  filters: { gram: '', morphologie: '', aerobiose: '', catalase: '', oxydase: '' },
  theme: safeStorageGet('bacteriomap-theme') || 'light'
};

// ==================== SAFE STORAGE ====================
// Wrappers around localStorage that don't crash if storage is unavailable
// (e.g. private browsing mode, file:// in some browsers, quota exceeded)

function safeStorageGet(key) {
  try { return localStorage.getItem(key); }
  catch (e) { return null; }
}
function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch (e) {
    console.warn('localStorage indisponible (' + e.name + ') — modifications non sauvegardées.');
    return false;
  }
}
function safeStorageGetJSON(key) {
  try { return JSON.parse(safeStorageGet(key) || 'null'); }
  catch (e) { return null; }
}

// Load custom data from localStorage
let customBacteries = safeStorageGetJSON('bacteriomap-bacteries');
let customZones = safeStorageGetJSON('bacteriomap-zones');
let customQuiz = safeStorageGetJSON('bacteriomap-quiz');

function getBacteries() { return customBacteries || bacteriesData; }
function getZones() { return customZones || zonesData; }
function getQuiz() { return customQuiz || quizCases; }

function saveBacteries(data) { customBacteries = data; safeStorageSet('bacteriomap-bacteries', JSON.stringify(data)); }
function saveZones(data) { customZones = data; safeStorageSet('bacteriomap-zones', JSON.stringify(data)); }
function saveQuiz(data) { customQuiz = data; safeStorageSet('bacteriomap-quiz', JSON.stringify(data)); }

// ==================== INFO-BULLES DES CHAMPS DE FICHE ====================
// Définitions pédagogiques pour aider les nouveaux TABs à comprendre
// chaque section/champ de la fiche bactérie.

const fieldHelp = {
  // En-tête et champs biochimiques
  'Gram': 'Réaction à la coloration de Gram (mise au point par Hans Christian Gram en 1884). Gram + : paroi épaisse en peptidoglycane retenant le cristal violet (bactérie violette). Gram - : paroi fine avec membrane externe (bactérie rose après safranine).',
  'Morphologie': 'Forme de la bactérie observée au microscope : coque (ronde), bacille (allongée), coccobacille (intermédiaire), spiralé, filamenteux.',
  'Groupement': 'Disposition des bactéries les unes par rapport aux autres : isolées, en amas (grappes), en chaînettes, en diplocoques (paires), en palissade, etc. Utile pour l\'orientation au Gram direct.',
  'Aérobiose': 'Besoin en oxygène pour se développer. Aérobie strict (O₂ obligatoire), anaérobie strict (O₂ toxique), aéro-anaérobie facultatif (les deux), microaérophile (peu d\'O₂).',
  'Sporulation': 'Capacité à former des spores, structures très résistantes permettant la survie dans des conditions hostiles (chaleur, dessiccation, antiseptiques). Quasi-exclusive aux Bacillus et Clostridium.',
  'Catalase': 'Enzyme qui décompose le peroxyde d\'hydrogène (H₂O₂) en eau et oxygène. Test rapide : une goutte d\'eau oxygénée sur la colonie → bullage = catalase +. Staphylocoques + vs streptocoques -.',
  'Oxydase': 'Enzyme (cytochrome c oxydase) de la chaîne respiratoire. Test rapide : réactif oxydase sur colonie → virage violet en 10s = oxydase +. Utile pour différencier les bacilles Gram - (entérobactéries oxydase -, Pseudomonas oxydase +).',
  'Coagulase': 'Enzyme qui coagule le plasma. Test clé pour différencier Staphylococcus aureus (coagulase +) des autres staphylocoques (SCN, coagulase -).',

  // Sections de la fiche
  'Images': 'Photos de la bactérie : coloration de Gram, aspect des colonies sur différents milieux, tests biochimiques caractéristiques. Clique sur une image pour l\'agrandir.',
  'Milieux de culture': 'Milieux gélosés utilisés au laboratoire pour isoler et cultiver la bactérie, avec l\'aspect caractéristique des colonies (couleur, taille, hémolyse).',
  'Identification au laboratoire': 'Méthodes utilisées pour identifier la bactérie avec certitude : MALDI-TOF (spectrométrie de masse), tests biochimiques (galeries API), sérotypage, tests immunologiques rapides, PCR.',
  'Résistances naturelles': 'Résistances présentes naturellement chez toutes les souches de l\'espèce, indépendamment de toute exposition aux antibiotiques. À connaître pour éviter de proposer un antibiotique intrinsèquement inefficace.',
  'Résistances acquises': 'Résistances qui peuvent apparaître par mutation ou acquisition de gènes (plasmides, transposons). Variables d\'une souche à l\'autre — c\'est l\'antibiogramme qui tranche.',
  'Facteurs de virulence': 'Éléments structurels ou sécrétés qui rendent la bactérie pathogène : capsule, toxines, adhésines, enzymes tissulaires, facteurs anti-phagocytaires, biofilm.',
  'Signification clinique': 'Tableaux cliniques et infections typiquement causés par cette bactérie. Indique le contexte épidémiologique (communautaire vs nosocomial) et les populations à risque.',
  'Antibiothérapie probabiliste': 'Traitement initial recommandé AVANT le résultat de l\'antibiogramme, basé sur l\'épidémiologie locale et les résistances naturelles. À adapter dès que l\'antibiogramme est disponible.',
  'Sites anatomiques': 'Zones du corps où cette bactérie est typiquement isolée. La fréquence (fréquent/occasionnel/rare) indique son importance relative dans ce site.',

  // Alertes
  'Urgence clinique': 'Bactérie nécessitant une prise en charge urgente (antibiothérapie immédiate, isolement, contact clinicien). Tout retard peut engager le pronostic vital.',
  'BSL-3': 'Biosafety Level 3 — Agent pathogène à risque infectieux élevé. Manipulation obligatoire sous PSM de classe II ou III, laboratoire de confinement P3. Ex : M. tuberculosis, Brucella, Coxiella.',
  'Déclaration obligatoire': 'Infection à déclaration obligatoire aux autorités sanitaires (OFSP en Suisse). Permet la surveillance épidémiologique et les mesures de santé publique.',
  'Populations à risque': 'Patients particulièrement vulnérables à cette bactérie : immunodéprimés, mucoviscidose, grands brûlés, nouveau-nés, porteurs de matériel prothétique, patients en réanimation, etc.'
};

// Génère le HTML d'un bouton d'aide avec info-bulle au survol
function helpIcon(fieldName) {
  const help = fieldHelp[fieldName];
  if (!help) return '';
  return `<span class="help-tip" tabindex="0" role="button" aria-label="Aide sur ${escapeHtml(fieldName)}"><span class="help-tip-icon">?</span><span class="help-tip-bubble">${escapeHtml(help)}</span></span>`;
}

// ==================== ANNOTATION DES TERMES TECHNIQUES ====================
// Souligne discrètement les termes techniques (définis dans data.js → glossaire)
// et ajoute une info-bulle avec leur définition au survol.

// Échappe les caractères spéciaux regex dans un terme
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pré-compile un pattern regex à partir du glossaire
// Les termes les plus longs sont placés en premier pour éviter les matches partiels
let _glossairePattern = null;
let _glossaireMap = null;

function buildGlossaireRegex() {
  const glossaire = (window.BACTERIOMAP_DATA && window.BACTERIOMAP_DATA.glossaire) || {};
  const terms = Object.keys(glossaire);
  if (terms.length === 0) {
    _glossairePattern = null;
    _glossaireMap = {};
    return;
  }
  // Sort by length DESC so longer terms are matched first (β-lactamines avant β-lactam)
  terms.sort((a, b) => b.length - a.length);
  // Use (?:^|[\s...]) lookbehind-like pattern and (?=...) lookahead for word boundaries
  // Since \b doesn't work with non-ASCII chars (β, -), we define our own boundaries
  const pattern = '(^|[^\\wÀ-ÿ-])(' + terms.map(escapeRegex).join('|') + ')(?=[^\\wÀ-ÿ-]|$)';
  _glossairePattern = new RegExp(pattern, 'g');
  _glossaireMap = glossaire;
}

// Prend un texte BRUT (pas encore escape-HTML) et retourne du HTML
// avec les termes techniques entourés d'info-bulles.
function annotateText(text) {
  if (!text) return '';
  if (_glossairePattern === null) buildGlossaireRegex();
  // Si le glossaire est vide, on retourne juste le texte échappé
  if (!_glossairePattern) return escapeHtml(text);

  // On escape le texte complet d'abord
  const escaped = escapeHtml(text);
  // Puis on remplace les termes par les spans d'info-bulle
  // Reset lastIndex car regex est 'g'
  _glossairePattern.lastIndex = 0;
  return escaped.replace(_glossairePattern, function(match, prefix, term) {
    const def = _glossaireMap[term];
    if (!def) return match;
    const defEscaped = escapeHtml(def);
    return prefix + '<span class="tech-term" tabindex="0" role="button" aria-label="Définition de ' + escapeHtml(term) + '">' + escapeHtml(term) + '<span class="tech-term-bubble">' + defEscaped + '</span></span>';
  });
}

// Idem mais pour du HTML contenant déjà des éléments (ex: liste ul/li)
// On parse et on applique annotateText au contenu texte uniquement
function annotateListItems(items) {
  if (!items || !items.length) return '';
  return items.map(function(item) {
    return '<li>' + annotateText(item) + '</li>';
  }).join('');
}

function annotateTags(items) {
  if (!items || !items.length) return '';
  return items.map(function(item) {
    return '<span class="tag-item">' + annotateText(item) + '</span>';
  }).join('');
}

// ==================== RENDERING ====================

function render() {
  const app = document.getElementById('app');
  document.documentElement.setAttribute('data-theme', state.theme);
  // Reset zone background tint (renderZone will set it if needed)
  document.body.style.background = '';
  
  let html = renderHeader();
  
  switch(state.currentView) {
    case 'home': html += renderHome(); break;
    case 'zone': html += renderZone(); break;
    case 'detail': html += renderDetail(); break;
    case 'comparison': html += renderComparison(); break;
    case 'quiz': html += renderQuiz(); break;
    case 'admin': html += renderAdmin(); break;
  }
  
  html += renderComparisonBar();
  html += '<div class="lightbox" id="lightbox" onclick="closeLightbox()"><img id="lightbox-img" src="" alt=""/><div class="lightbox-caption" id="lightbox-caption"></div></div>';
  
  app.innerHTML = html;
  
  // Bind events after render
  bindEvents();
}

function renderHeader() {
  return `
    <header class="app-header">
      <div class="app-brand" onclick="navigate('home')" role="button" tabindex="0" title="Retour à l'accueil" aria-label="Retour à l'accueil" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navigate('home');}">
        <div class="brand-mark">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.4"/>
            <ellipse cx="16" cy="16" rx="9" ry="5" fill="currentColor" opacity="0.85"/>
            <circle cx="10" cy="11" r="2" fill="currentColor" opacity="0.6"/>
            <circle cx="22" cy="21" r="2.5" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="app-title">BACTERIOMAP</div>
          <div class="app-subtitle">CHUV · Microbiologie</div>
        </div>
      </div>
      <div class="app-search">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" id="global-search" placeholder="Rechercher une bact\u00e9rie..." value="${escapeHtml(state.searchQuery)}" oninput="onSearch(this.value)" onfocus="onSearchFocus()" onblur="setTimeout(()=>closeSearchDropdown(),200)"/>
        <div class="search-results-dropdown" id="search-dropdown"></div>
      </div>
      <div class="app-actions">
        <button class="btn-icon" onclick="toggleTheme()" title="Mode sombre/clair" aria-label="Mode sombre/clair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${state.theme === 'dark' ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>' : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'}</svg>
        </button>
        <button class="btn-icon" onclick="navigate('admin')" title="Administration" aria-label="Administration">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </header>`;
}

function renderHome() {
  const bacts = getBacteries();
  const zones = getZones();
  
  // Palette de couleurs pour les bulles (cycle si >15 zones)
  const ZONE_COLORS = [
    '#8b5cf6', '#0ea5e9', '#06b6d4', '#14b8a6', '#84cc16',
    '#ef4444', '#f59e0b', '#eab308', '#f97316', '#ec4899',
    '#a855f7', '#3b82f6', '#22c55e', '#f43f5e', '#d946ef'
  ];
  
  // Abréviations connues pour les labels de bulles
  var ABBR = {
    'système nerveux central': 'SNC', 'systeme nerveux central': 'SNC',
    'système cardiovasculaire': 'Cardiovasc.', 'cardiovasculaire': 'Cardiovasc.',
    'voies respiratoires': 'Respiratoire', 'système respiratoire': 'Respiratoire',
    'os et articulations': 'Os · Artic.', 'peau et tissus mous': 'Peau',
    'sphère orl': 'ORL', 'orl': 'ORL'
  };
  
  function shortLabel(nom) {
    if (!nom) return '';
    var lower = nom.toLowerCase();
    if (ABBR[lower]) return ABBR[lower];
    if (nom.length <= 13) return nom;
    var stripped = nom.replace(/^(Système|Systeme|Appareil|Sphère)\s+/i, '');
    return stripped.length <= 13 ? stripped : stripped.slice(0, 12) + '…';
  }
  
  // Générer zonesDef dynamiquement depuis les données
  var zonesDef = Object.entries(zones).map(function(entry, i) {
    var id = entry[0], z = entry[1];
    return {
      id: id,
      label: shortLabel(z.nom || id),
      sub: z.sousNom || '',
      color: ZONE_COLORS[i % ZONE_COLORS.length]
    };
  });
  
  const cx = 400, cy = 400;
  const radius = zonesDef.length <= 4 ? 200 : zonesDef.length <= 7 ? 240 : 260;
  const bubbleR = zonesDef.length <= 4 ? 70 : zonesDef.length <= 7 ? 64 : 58;
  
  // Build zone bubbles positioned in a circle
  let zoneBubbles = '';
  let connectorLines = '';
  
  zonesDef.forEach((z, i) => {
    const angle = (i / zonesDef.length) * 2 * Math.PI - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const count = bacts.filter(b => b.sites.includes(z.id)).length;
    const delay = 0.2 + i * 0.07;
    
    // Gradient connector from center to bubble
    connectorLines += `
      <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" 
        stroke="${z.color}" stroke-width="1.5" stroke-opacity="0.18" stroke-dasharray="3,5"
        class="connector-line" style="animation-delay:${delay - 0.1}s"/>`;
    
    zoneBubbles += `
      <g class="zone-bubble" data-zone="${z.id}" onclick="onZoneClick('${z.id}', event)" 
         style="--zone-color:${z.color};animation-delay:${delay}s">
        <!-- Outer pulsing ring -->
        <circle cx="${x}" cy="${y}" r="${bubbleR + 10}" fill="none" stroke="${z.color}" stroke-width="1.5" stroke-opacity="0.18" class="bubble-pulse" style="animation-delay:${delay + 0.3}s"/>
        <circle cx="${x}" cy="${y}" r="${bubbleR + 4}" fill="none" stroke="${z.color}" stroke-width="1" stroke-opacity="0.12" class="bubble-pulse-inner" style="animation-delay:${delay + 0.6}s"/>
        
        <!-- Main bubble with gradient fill -->
        <circle cx="${x}" cy="${y}" r="${bubbleR}" fill="url(#bubble-grad-${z.id})" stroke="${z.color}" stroke-width="2" stroke-opacity="0.7" class="bubble-bg"/>
        
        <!-- Inner highlight (glossy effect) -->
        <ellipse cx="${x - 12}" cy="${y - 18}" rx="22" ry="10" fill="white" opacity="0.15" class="bubble-gloss"/>
        
        <!-- Label -->
        <text x="${x}" y="${y - 2}" text-anchor="middle" class="bubble-label">${z.label}</text>
        <text x="${x}" y="${y + 14}" text-anchor="middle" class="bubble-sublabel">${z.sub}</text>
        
        <!-- Counter badge -->
        <circle cx="${x + bubbleR * 0.68}" cy="${y - bubbleR * 0.68}" r="14" fill="${z.color}" class="bubble-count-bg"/>
        <text x="${x + bubbleR * 0.68}" y="${y - bubbleR * 0.68 + 4.5}" text-anchor="middle" class="bubble-count-text">${count}</text>
      </g>`;
  });
  
  // Build gradient definitions for each zone
  const bubbleGradients = zonesDef.map(z => `
    <radialGradient id="bubble-grad-${z.id}" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="${z.color}" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="${z.color}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${z.color}" stop-opacity="0.22"/>
    </radialGradient>`).join('');
  
  // Central bacterium — refined stylized illustration
  const centralBacteria = `
    <g class="central-bacteria" transform="translate(${cx},${cy})">
      <!-- Soft glow layers -->
      <circle r="110" fill="url(#center-glow)" class="bacteria-glow"/>
      <circle r="85" fill="url(#center-glow-inner)"/>
      
      <!-- Petri dish ring -->
      <circle r="74" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="2,4" class="petri-ring"/>
      <circle r="68" fill="none" stroke="var(--accent)" stroke-width="0.5" stroke-opacity="0.15"/>
      
      <!-- Bacterium illustration -->
      <g class="bacteria-body">
        <!-- Main bacillus body with gradient -->
        <ellipse cx="0" cy="0" rx="34" ry="13" fill="url(#bacillus-grad)" stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.8"/>
        <!-- Internal structure hint -->
        <ellipse cx="-8" cy="0" rx="4" ry="5" fill="var(--accent)" opacity="0.35"/>
        <ellipse cx="10" cy="-1" rx="3.5" ry="4.5" fill="var(--accent)" opacity="0.4"/>
        <!-- Glossy highlight -->
        <ellipse cx="-6" cy="-6" rx="16" ry="3" fill="white" opacity="0.35"/>
        
        <!-- Smaller cocci satellites -->
        <circle cx="-46" cy="22" r="9" fill="url(#coccus-grad)" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.6"/>
        <ellipse cx="-48" cy="20" rx="4" ry="1.5" fill="white" opacity="0.35"/>
        
        <circle cx="44" cy="-24" r="8" fill="url(#coccus-grad)" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.6"/>
        <ellipse cx="42" cy="-26" rx="3.5" ry="1.2" fill="white" opacity="0.35"/>
        
        <circle cx="25" cy="28" r="10" fill="url(#coccus-grad)" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.6"/>
        <ellipse cx="22" cy="25" rx="4.5" ry="1.5" fill="white" opacity="0.35"/>
        
        <!-- Diplococci pair -->
        <circle cx="-20" cy="-32" r="7" fill="url(#coccus-grad)" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.55"/>
        <circle cx="-8" cy="-34" r="7" fill="url(#coccus-grad)" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.55"/>
        
        <!-- Flagella -->
        <path d="M32,-2 Q52,-18 58,-38 Q62,-50 54,-58" fill="none" stroke="var(--accent)" stroke-width="2" stroke-opacity="0.4" stroke-linecap="round" stroke-dasharray="5,3" class="flagellum f1"/>
        <path d="M33,3 Q54,20 62,38 Q66,50 58,56" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-opacity="0.35" stroke-linecap="round" stroke-dasharray="6,3" class="flagellum f2"/>
        <path d="M-32,2 Q-52,18 -60,38 Q-64,50 -56,56" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-opacity="0.3" stroke-linecap="round" stroke-dasharray="4,4" class="flagellum f3"/>
      </g>
      
      <!-- Center label -->
      <text y="95" text-anchor="middle" class="central-label">Sites anatomiques</text>
      <text y="112" text-anchor="middle" class="central-sublabel">Cliquez sur une bulle</text>
    </g>`;
  
  return `
    <div class="home-toolbar">
      <button class="pill-btn" onclick="navigate('quiz')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Mode quiz
      </button>
      ${state.comparisonList.length >= 2 ? '<button class="pill-btn pill-btn-accent" onclick="navigate(\'comparison\')">Comparer (' + state.comparisonList.length + ')</button>' : ''}
    </div>
    <div class="body-map-container" id="body-map">
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" class="bacteriomap-svg">
        <defs>
          <!-- Grid pattern -->
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.35"/>
          </pattern>
          
          <!-- Center glow -->
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="center-glow-inner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
          </radialGradient>
          
          <!-- Bacillus gradient -->
          <linearGradient id="bacillus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--accent-light)" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.95"/>
          </linearGradient>
          
          <!-- Coccus gradient -->
          <radialGradient id="coccus-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="var(--accent-light)" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.9"/>
          </radialGradient>
          
          ${bubbleGradients}
        </defs>
        
        <!-- Background grid -->
        <rect width="800" height="800" fill="url(#grid-pattern)" opacity="0.4"/>
        
        <!-- Orbital rings -->
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.1" stroke-dasharray="8,8" class="orbit-ring"/>
        <circle cx="${cx}" cy="${cy}" r="${radius - 50}" fill="none" stroke="var(--accent)" stroke-width="0.5" stroke-opacity="0.06"/>
        <circle cx="${cx}" cy="${cy}" r="${radius + 50}" fill="none" stroke="var(--accent)" stroke-width="0.5" stroke-opacity="0.06"/>
        
        <!-- Connector lines -->
        ${connectorLines}
        
        <!-- Central bacterium -->
        ${centralBacteria}
        
        <!-- Zone bubbles -->
        ${zoneBubbles}
      </svg>
    </div>`;
}

function renderFilters() {
  return `
    <div class="filters-bar">
      <select class="filter-select" onchange="setFilter('gram', this.value)">
        <option value="">Gram (tous)</option>
        <option value="positif" ${state.filters.gram==='positif'?'selected':''}>Gram +</option>
        <option value="n\u00e9gatif" ${state.filters.gram==='négatif'?'selected':''}>Gram -</option>
      </select>
      <select class="filter-select" onchange="setFilter('morphologie', this.value)">
        <option value="">Morphologie (toutes)</option>
        <option value="coque" ${state.filters.morphologie==='coque'?'selected':''}>Coque</option>
        <option value="bacille" ${state.filters.morphologie==='bacille'?'selected':''}>Bacille</option>
        <option value="coccobacille" ${state.filters.morphologie==='coccobacille'?'selected':''}>Coccobacille</option>
      </select>
      <select class="filter-select" onchange="setFilter('aerobiose', this.value)">
        <option value="">A\u00e9robiose (toute)</option>
        <option value="a\u00e9robie strict" ${state.filters.aerobiose==='aérobie strict'?'selected':''}>A\u00e9robie strict</option>
        <option value="ana\u00e9robie strict" ${state.filters.aerobiose==='anaérobie strict'?'selected':''}>Ana\u00e9robie strict</option>
        <option value="a\u00e9ro-ana\u00e9robie facultatif" ${state.filters.aerobiose==='aéro-anaérobie facultatif'?'selected':''}>Facultatif</option>
        <option value="microa\u00e9rophile" ${state.filters.aerobiose==='microaérophile'?'selected':''}>Microa\u00e9rophile</option>
      </select>
      <select class="filter-select" onchange="setFilter('catalase', this.value)">
        <option value="">Catalase</option>
        <option value="true" ${state.filters.catalase==='true'?'selected':''}>Catalase +</option>
        <option value="false" ${state.filters.catalase==='false'?'selected':''}>Catalase -</option>
      </select>
      <select class="filter-select" onchange="setFilter('oxydase', this.value)">
        <option value="">Oxydase</option>
        <option value="true" ${state.filters.oxydase==='true'?'selected':''}>Oxydase +</option>
        <option value="false" ${state.filters.oxydase==='false'?'selected':''}>Oxydase -</option>
      </select>
      <button class="btn btn-sm" onclick="clearFilters()">Effacer filtres</button>
    </div>`;
}

function renderZone() {
  const zones = getZones();
  const zone = zones[state.currentZone];
  if (!zone) return '<p>Zone non trouvée</p>';
  
  // Get zone color for background tint
  const zDef = getZonesDef().find(function(z) { return z.id === state.currentZone; });
  const zoneColor = (zone.color) || (zDef ? zDef.color : null);
  // Apply a very faint tint as page background — light mode only.
  // In dark mode the gradient washes the page out, so keep the default dark bg.
  if (zoneColor && state.theme !== 'dark') {
    document.body.style.background = 'linear-gradient(180deg, ' + hexToRgba(zoneColor, 0.10) + ' 0%, ' + hexToRgba(zoneColor, 0.04) + ' 50%, var(--bg-primary) 100%)';
  } else {
    document.body.style.background = '';
  }
  
  const bacts = getBacteries();
  const subId = state.currentSubZone;
  const sub = (subId && zone.sousZones) ? zone.sousZones[subId] : null;
  
  // Filtrage selon sous-zone active
  // - Si pas de sous-zone : toutes les bactéries de la zone
  // - Si sous-zone : bactéries spécifiques à la sous-zone + générales (non-précisées)
  function matchesSubZone(b) {
    if (!subId) return true;
    const subs = (b.sousZones && b.sousZones[state.currentZone]) || [];
    // Bactérie générale (pas de sousZones précisées) → incluse
    // Bactérie spécifique à cette sous-zone → incluse
    return subs.length === 0 || subs.includes(subId);
  }
  
  const pathogenes = bacts.filter(b =>
    b.sites.includes(state.currentZone) && !b.floreNormale[state.currentZone] && matchesSubZone(b));
  const flore = bacts.filter(b =>
    b.sites.includes(state.currentZone) && b.floreNormale[state.currentZone] && matchesSubZone(b));
  
  // En-tête de zone (avec gestion sous-zone active)
  const subZoneInfo = sub ? `
    <div class="subzone-active-banner">
      <div>
        <span class="szab-label">Sous-zone active :</span>
        <strong>${escapeHtml(sub.nom || subId)}</strong>
        ${sub.prelevements && sub.prelevements.length ? `
          <div class="szab-prelevements">
            <span class="szab-prel-label">Prélèvements :</span>
            ${sub.prelevements.map(p => `<span class="zone-info-pill">${escapeHtml(p)}</span>`).join(' ')}
          </div>` : ''}
        ${sub.commentaire ? `<div class="szab-commentaire">${escapeHtml(sub.commentaire)}</div>` : ''}
      </div>
      <button class="btn btn-sm" onclick="navigateZone('${escapeHtml(state.currentZone)}')" title="Voir toute la zone">
        Toute la zone ${escapeHtml(zone.nom)}
      </button>
    </div>
  ` : '';
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="navigate('home')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Vue anatomique
      </button>
    </div>
    <div class="zone-header">
      <h2>${zone.nom}${sub ? ' · <span class="zone-subzone-title">' + escapeHtml(sub.nom || subId) + '</span>' : ''}</h2>
      <div class="zone-sous-nom">${zone.sousNom || ''}</div>
      <div class="zone-description">${zone.description}</div>
      ${!sub ? `
        <div class="zone-info-pills">
          ${(zone.prelevements||[]).map(p => `<span class="zone-info-pill">${p}</span>`).join('')}
        </div>
        ${zone.transport ? `<p class="text-muted mt-8" style="font-size:0.8rem"><strong>Transport :</strong> ${zone.transport}</p>` : ''}
        ${zone.commentaire ? `<p class="text-muted mt-8" style="font-size:0.8rem;font-style:italic">${zone.commentaire}</p>` : ''}
      ` : ''}
      ${subZoneInfo}
      ${!sub && zone.sousZones && Object.keys(zone.sousZones).length > 0 ? `
        <div class="subzone-quick-access">
          <span class="sqa-label">Zones précises :</span>
          ${Object.entries(zone.sousZones).map(([sid, s]) =>
            `<button class="sqa-btn" onclick="navigateZone('${escapeHtml(state.currentZone)}','${escapeHtml(sid)}')">${escapeHtml(s.nom || sid)}</button>`
          ).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="section-header">
      <h3>Pathogènes</h3>
      <span class="badge-count">${pathogenes.length}</span>
    </div>
    <div class="bacteria-grid">
      ${pathogenes.map(b => renderBacteriaItem(b, state.currentZone)).join('')}
      ${pathogenes.length === 0 ? '<p class="text-muted" style="padding:10px">Aucun pathogène référencé' + (sub ? ' pour cette sous-zone' : ' pour cette zone') + '.</p>' : ''}
    </div>
    
    <div class="section-header">
      <h3>Flore normale / commensale</h3>
      <span class="badge-count">${flore.length}</span>
    </div>
    <div class="bacteria-grid">
      ${flore.map(b => renderBacteriaItem(b, state.currentZone)).join('')}
      ${flore.length === 0 ? '<p class="text-muted" style="padding:10px">Aucune flore commensale référencée' + (sub ? ' pour cette sous-zone' : ' pour cette zone') + '.</p>' : ''}
    </div>`;
}

// ==================== MORPHOLOGY SVG ====================
// Returns an inline SVG illustrating the morphology of a bacterium / fungus,
// sized to fit inside a circle of `size` pixels (used in cards: 36px, detail: 64px).
// The outer .gram-circle (CSS) already provides background + border, so the SVG
// only contains the morphology elements drawn relative to a (-54 .. 54) viewBox.
// 12 morphologies covered (see morphologies_preview.html).
function getMorphologySVG(b, size) {
  var bType = b.type || 'bacterie';
  var isYeast = bType === 'levure';
  var isMold = bType === 'moisissure';
  var isFungal = isYeast || isMold;

  // Color palette
  var fill, stroke;
  if (isFungal) { fill = '#60a5fa'; stroke = '#2563eb'; }
  else if (b.gram === 'positif') { fill = '#a78bfa'; stroke = '#7c3aed'; }
  else if (b.gram === 'négatif') { fill = '#f472b6'; stroke = '#db2777'; }
  else { fill = '#fbbf24'; stroke = '#d97706'; } // variable / fallback

  // Choose morphology key based on type / gram / morphologie / groupement
  var groupement = (b.groupement || '').toLowerCase();
  var morpho = (b.morphologie || '').toLowerCase();
  var key;

  if (isYeast) {
    key = 'yeast';
  } else if (isMold) {
    key = 'mold';
  } else if (morpho === 'coccobacille') {
    key = 'coccobacilles';
  } else if (b.gram === 'positif') {
    if (morpho === 'coque') {
      if (groupement.indexOf('lancéol') !== -1) key = 'diplo_lanceole';
      else if (groupement.indexOf('chaînettes') !== -1 || groupement.indexOf('chainettes') !== -1) key = 'chainettes';
      else if (groupement.indexOf('amas') !== -1) key = 'amas';
      else key = 'chainettes'; // fallback for diplocoques etc.
    } else { // bacille G+
      // sporulés -> bacilles sporulés
      if (b.sporulation === true || groupement.indexOf('sporul') !== -1) key = 'bacilles_sporules';
      else key = 'bacilles_palissade'; // Listeria, Corynebacterium, Cutibacterium, Mycobacterium...
    }
  } else if (b.gram === 'négatif') {
    if (morpho === 'coque') {
      key = 'diplo_grain_cafe'; // Neisseria, Moraxella
    } else { // bacille G-
      if (groupement.indexOf('spiral') !== -1) key = 'spirale';
      // Non-fermentants (Pseudomonas, Acinetobacter strict aerobic) -> fins/longs.
      // Use a regex anchored to the start of the word "aérobie" to avoid matching
      // "anaérobie strict" (which contains "aérobie strict" as a substring).
      else if (b.aerobiose && /(^|\s)aérobie\s+strict/.test(b.aerobiose)) key = 'bacilles_fins';
      else key = 'bacilles_courts';
    }
  } else {
    key = 'bacilles_courts'; // ultimate fallback
  }

  // SVG inner content per key. viewBox -54 -54 108 108 (matches preview).
  // No outer <circle> (the CSS .gram-circle already provides bg+border).
  var inner = '';
  switch (key) {
    case 'amas':
      inner =
        '<circle cx="-2" cy="-14" r="6.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="9" cy="-10" r="7" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="-12" cy="-5" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="1" cy="-2" r="7" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="14" cy="0" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" opacity="0.9"/>' +
        '<circle cx="-8" cy="9" r="6.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" opacity="0.9"/>' +
        '<circle cx="5" cy="12" r="7" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" opacity="0.85"/>' +
        '<circle cx="17" cy="13" r="5.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" opacity="0.8"/>' +
        '<circle cx="-16" cy="16" r="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" opacity="0.7"/>';
      break;
    case 'chainettes':
      inner =
        '<circle cx="-30" cy="4" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="-18" cy="-1" r="6.2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="-6" cy="-4" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="6" cy="-6" r="6.3" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="18" cy="-4" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="30" cy="0" r="6.2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="-14" cy="15" r="5.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.55"/>' +
        '<circle cx="-3" cy="13" r="5.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.55"/>' +
        '<circle cx="8" cy="15" r="5.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.55"/>';
      break;
    case 'diplo_lanceole':
      inner =
        '<ellipse cx="-9" cy="-6" rx="7" ry="12.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-8 -9 -6)"/>' +
        '<ellipse cx="9" cy="-6" rx="7" ry="12.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(8 9 -6)"/>' +
        '<ellipse cx="0" cy="-6" rx="23" ry="19" fill="none" stroke="#c4b5fd" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.5"/>' +
        '<ellipse cx="-7" cy="19" rx="5" ry="9" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.5" transform="rotate(-5 -7 19)"/>' +
        '<ellipse cx="7" cy="19" rx="5" ry="9" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.5" transform="rotate(5 7 19)"/>';
      break;
    case 'bacilles_sporules':
      inner =
        '<rect x="-22" y="-18" width="11" height="30" rx="3" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-12 -16 -3)"/>' +
        '<ellipse cx="-18" cy="-19" rx="7.5" ry="6" fill="white" stroke="' + stroke + '" stroke-width="0.8" opacity="0.9" transform="rotate(-12 -18 -19)"/>' +
        '<rect x="-1" y="-16" width="11" height="32" rx="3" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(5 4 0)"/>' +
        '<ellipse cx="3" cy="-16" rx="7.5" ry="6" fill="white" stroke="' + stroke + '" stroke-width="0.8" opacity="0.9" transform="rotate(5 3 -16)"/>' +
        '<rect x="17" y="-12" width="10" height="26" rx="3" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.75" transform="rotate(-8 22 1)"/>' +
        '<ellipse cx="21" cy="-12" rx="7" ry="5.5" fill="white" stroke="' + stroke + '" stroke-width="0.7" opacity="0.8" transform="rotate(-8 21 -12)"/>';
      break;
    case 'bacilles_palissade':
      inner =
        '<rect x="-14" y="-18" width="7" height="22" rx="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-30 -10 -7)"/>' +
        '<rect x="-2" y="-18" width="7" height="22" rx="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(30 1 -7)"/>' +
        '<rect x="12" y="-14" width="6" height="20" rx="2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.85" transform="rotate(-5 15 -4)"/>' +
        '<rect x="20" y="-16" width="6" height="22" rx="2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.85" transform="rotate(3 23 -5)"/>' +
        '<rect x="-22" y="8" width="6" height="16" rx="2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.6" transform="rotate(20 -19 16)"/>' +
        '<rect x="-10" y="6" width="6" height="18" rx="2" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.6" transform="rotate(-15 -7 15)"/>' +
        '<circle cx="-18" cy="-6" r="1.5" fill="' + stroke + '" opacity="0.5"/>' +
        '<circle cx="5" cy="-6" r="1.5" fill="' + stroke + '" opacity="0.5"/>';
      break;
    case 'bacilles_courts':
      inner =
        '<rect x="-24" y="-8" width="9" height="22" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-25 -19 3)"/>' +
        '<rect x="-8" y="-14" width="9" height="24" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(8 -3 -2)"/>' +
        '<rect x="8" y="-10" width="9" height="20" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-10 12 0)"/>' +
        '<rect x="20" y="-6" width="8" height="18" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.7" transform="rotate(15 24 3)"/>';
      break;
    case 'diplo_grain_cafe':
      inner =
        '<path d="M-16,-14 C-16,-26 -2,-26 -2,-14 C-2,-6 -16,-6 -16,-14Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<path d="M2,-14 C2,-26 16,-26 16,-14 C16,-6 2,-6 2,-14Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<line x1="0" y1="-24" x2="0" y2="-4" stroke="' + stroke + '" stroke-width="0.6" opacity="0.5"/>' +
        '<path d="M-12,8 C-12,-1 -1,-1 -1,8 C-1,15 -12,15 -12,8Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.55"/>' +
        '<path d="M1,8 C1,-1 12,-1 12,8 C12,15 1,15 1,8Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.55"/>';
      break;
    case 'spirale':
      inner =
        '<path d="M-34,-4 C-26,-22 -14,-22 -6,-8 C2,6 10,6 18,-8 C26,-22 32,-14 34,-4" fill="none" stroke="' + fill + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M34,-4 Q40,4 37,12 Q34,20 38,26" fill="none" stroke="' + stroke + '" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>' +
        '<path d="M-24,16 C-18,4 -8,4 -2,14 C4,24 12,20 18,14" fill="none" stroke="' + fill + '" stroke-width="3" stroke-linecap="round" opacity="0.45"/>';
      break;
    case 'coccobacilles':
      inner =
        '<ellipse cx="-18" cy="-12" rx="8" ry="5.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-15 -18 -12)"/>' +
        '<ellipse cx="-2" cy="-6" rx="8.5" ry="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(10 -2 -6)"/>' +
        '<ellipse cx="16" cy="-10" rx="7.5" ry="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-20 16 -10)"/>' +
        '<ellipse cx="-10" cy="6" rx="7" ry="4.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.65" transform="rotate(5 -10 6)"/>' +
        '<ellipse cx="8" cy="8" rx="8" ry="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.65" transform="rotate(-8 8 8)"/>' +
        '<ellipse cx="24" cy="4" rx="6.5" ry="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.5" transform="rotate(12 24 4)"/>';
      break;
    case 'bacilles_fins':
      inner =
        '<rect x="-22" y="-16" width="6" height="30" rx="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(-12 -19 -1)"/>' +
        '<rect x="-8" y="-18" width="6" height="34" rx="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" transform="rotate(6 -5 -1)"/>' +
        '<rect x="6" y="-14" width="6" height="28" rx="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.85" transform="rotate(-8 9 0)"/>' +
        '<rect x="18" y="-16" width="6" height="32" rx="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.7" transform="rotate(10 21 0)"/>';
      break;
    case 'yeast':
      inner =
        '<ellipse cx="-4" cy="-2" rx="16" ry="14" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"/>' +
        '<ellipse cx="-6" cy="-4" rx="5" ry="4" fill="' + stroke + '" opacity="0.15"/>' +
        '<ellipse cx="14" cy="-10" rx="9" ry="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
        '<circle cx="22" cy="-16" r="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.8"/>' +
        '<path d="M10,-4 Q12,-9 10,-13" fill="none" stroke="' + stroke + '" stroke-width="0.6" opacity="0.4"/>' +
        '<ellipse cx="-20" cy="16" rx="10" ry="9" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" opacity="0.5"/>' +
        '<circle cx="-13" cy="10" r="4.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.45"/>';
      break;
    case 'mold':
      inner =
        '<path d="M-30,25 L-10,0 L5,-20" fill="none" stroke="' + fill + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="-22" y1="17" x2="-18" y2="13" stroke="' + stroke + '" stroke-width="1" opacity="0.5"/>' +
        '<line x1="-12" y1="5" x2="-8" y2="1" stroke="' + stroke + '" stroke-width="1" opacity="0.5"/>' +
        '<line x1="-2" y1="-8" x2="2" y2="-12" stroke="' + stroke + '" stroke-width="1" opacity="0.5"/>' +
        '<path d="M-10,0 L-20,-18" fill="none" stroke="' + fill + '" stroke-width="3" stroke-linecap="round" opacity="0.8"/>' +
        '<circle cx="5" cy="-22" r="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" opacity="0.7"/>' +
        '<circle cx="2" cy="-30" r="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.5" opacity="0.6"/>' +
        '<circle cx="8" cy="-31" r="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.5" opacity="0.6"/>' +
        '<circle cx="12" cy="-27" r="2.5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.5" opacity="0.6"/>' +
        '<path d="M-20,-18 L-30,-30" fill="none" stroke="' + fill + '" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>' +
        '<circle cx="-30" cy="-32" r="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6" opacity="0.5"/>';
      break;
    default:
      inner = '<circle cx="0" cy="0" r="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>';
  }

  return '<svg class="morpho-svg" viewBox="-54 -54 108 108" width="' + size + '" height="' + size + '" aria-hidden="true">' + inner + '</svg>';
}

function renderBacteriaItem(b, zoneId) {
  const freq = zoneId && b.frequence[zoneId] ? b.frequence[zoneId] : '';
  const isInComparison = state.comparisonList.includes(b.nom);
  const bType = b.type || 'bacterie';
  const isFungal = bType === 'levure' || bType === 'moisissure';
  var gramColor, gramBg, gramSymbol, circleTitle;
  if (isFungal) {
    gramColor = '#3b82f6'; gramBg = 'rgba(59,130,246,0.15)';
    gramSymbol = bType === 'levure' ? 'L' : 'M';
    circleTitle = bType === 'levure' ? 'Levure' : 'Moisissure';
  } else {
    gramColor = b.gram === 'positif' ? '#8b5cf6' : b.gram === 'négatif' ? '#ec4899' : '#f59e0b';
    gramBg = b.gram === 'positif' ? 'rgba(139,92,246,0.15)' : b.gram === 'négatif' ? 'rgba(236,72,153,0.15)' : 'rgba(245,158,11,0.15)';
    gramSymbol = b.gram === 'positif' ? '+' : b.gram === 'négatif' ? '−' : '±';
    circleTitle = 'Gram ' + gramSymbol;
  }
  
  const firstImg = (b.images && b.images.length > 0) ? (typeof b.images[0] === 'string' ? b.images[0] : (b.images[0].url || '')) : '';
  
  return `
    <div class="bacteria-card" onclick="navigateDetail('${escapeHtml(b.nom)}')">
      ${firstImg ? `<div class="bc-img" style="background-image:url('${escapeHtml(firstImg)}')"></div>` : ''}
      <div class="bc-body">
        <div class="bc-top">
          <div class="bc-gram-circle" style="--gram-color:${gramColor};background:${gramBg};border-color:${gramColor};color:${gramColor}" title="${circleTitle}">
            ${getMorphologySVG(b, 36)}
          </div>
          <div class="bc-info">
            <div class="bc-name">${escapeHtml(b.nom)}</div>
            <div class="bc-morpho">${escapeHtml(b.morphologie)}${b.groupement ? ' · ' + escapeHtml(b.groupement) : ''}</div>
          </div>
        </div>
        <div class="bc-tags">
          ${freq ? `<span class="tag tag-freq-${freq}">${freq}</span>` : ''}
          ${b.aerobiose ? `<span class="bc-tag-light">${escapeHtml(b.aerobiose)}</span>` : ''}
          ${b.alertes && b.alertes.urgence ? '<span class="badge-alert badge-urgence">Urgence</span>' : ''}
          ${b.alertes && b.alertes.bsl3 ? '<span class="badge-alert badge-bsl3">BSL-3</span>' : ''}
          ${b.alertes && b.alertes.declaration ? '<span class="badge-alert badge-declaration">Déclaration</span>' : ''}
        </div>
      </div>
      <button class="bc-compare-btn" onclick="event.stopPropagation();toggleComparison('${escapeHtml(b.nom)}')" title="${isInComparison ? 'Retirer' : 'Comparer'}" style="${isInComparison ? 'color:var(--accent);border-color:var(--accent)' : ''}">
        ${isInComparison ? '−' : '+'}
      </button>
    </div>`;
}

function renderDetail() {
  var b = getBacteries().find(function(x) { return x.nom === state.currentBacteria; });
  if (!b) return '<p>Bactérie non trouvée</p>';
  var zones = getZones();
  var bType = b.type || 'bacterie';
  var isYeast = bType === 'levure';
  var isMold = bType === 'moisissure';
  var isFungal = isYeast || isMold;
  var gramColor, gramBg, gramSymbol, gramLabel;
  if (isFungal) {
    gramColor = '#3b82f6'; gramBg = 'rgba(59,130,246,0.15)';
    gramSymbol = isYeast ? 'L' : 'M';
    gramLabel = isYeast ? 'Levure' : 'Moisissure';
  } else {
    gramColor = b.gram === 'positif' ? '#8b5cf6' : b.gram === 'négatif' ? '#ec4899' : '#f59e0b';
    gramBg = b.gram === 'positif' ? 'rgba(139,92,246,0.15)' : b.gram === 'négatif' ? 'rgba(236,72,153,0.15)' : 'rgba(245,158,11,0.15)';
    gramSymbol = b.gram === 'positif' ? '+' : b.gram === 'négatif' ? '−' : '±';
    gramLabel = 'Gram';
  }
  
  function testDot(label, value, helpKey) {
    var isPos = value === true;
    var color = isPos ? '#22c55e' : '#6b7280';
    var bg = isPos ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.1)';
    var sym = isPos ? '+' : '−';
    return '<div class="test-dot">' +
      '<span class="test-dot-circle" style="background:' + bg + ';border-color:' + color + ';color:' + color + '">' + sym + '</span>' +
      '<span class="test-dot-label">' + escapeHtml(label) + '</span>' +
      (helpKey ? helpIcon(helpKey) : '') +
    '</div>';
  }
  
  // Gram tag for header
  var gramTag = isFungal
    ? '<span class="tag" style="background:rgba(59,130,246,0.12);color:#3b82f6;border:1px solid #3b82f6">' + gramLabel + '</span>'
    : '<span class="tag tag-gram-' + (b.gram === 'positif' ? 'pos' : b.gram === 'négatif' ? 'neg' : 'var') + '">Gram ' + gramSymbol + '</span>';
  
  return '\
    <div class="nav-toolbar">\
      <button class="btn btn-sm" onclick="' + (state.currentZone ? "navigate('zone')" : "navigate('home')") + '">\
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>\
        ' + (state.currentZone ? 'Retour zone' : 'Vue anatomique') + '\
      </button>\
    </div>\
    <div class="detail-card">\
      <div class="detail-header">\
        <div class="dh-gram-circle" style="background:' + gramBg + ';border-color:' + gramColor + ';color:' + gramColor + '">\
          ' + getMorphologySVG(b, 46) + '\
          <span class="dh-gram-label">' + gramLabel + ' ' + gramSymbol + '</span>\
        </div>\
        <div class="dh-info">\
          <h2>' + escapeHtml(b.nom) + '</h2>\
          <div class="dh-tags">\
            ' + gramTag + '\
            <span class="tag tag-morpho">' + escapeHtml(b.morphologie) + '</span>\
            ' + (b.groupement ? '<span class="bc-tag-light">' + escapeHtml(b.groupement) + '</span>' : '') + '\
            ' + (b.aerobiose ? '<span class="bc-tag-light">' + escapeHtml(b.aerobiose) + '</span>' : '') + '\
          </div>\
          <div class="dh-alerts">\
            ' + (b.alertes && b.alertes.urgence ? '<span class="badge-alert badge-urgence">Urgence clinique</span>' + helpIcon('Urgence clinique') : '') + '\
            ' + (b.alertes && b.alertes.bsl3 ? '<span class="badge-alert badge-bsl3">BSL-3</span>' + helpIcon('BSL-3') : '') + '\
            ' + (b.alertes && b.alertes.declaration ? '<span class="badge-alert badge-declaration">Déclaration obligatoire</span>' + helpIcon('Déclaration obligatoire') : '') + '\
          </div>\
        </div>\
      </div>' +
      (b.images && b.images.length > 0 ?
      '<div class="detail-section detail-images-hero">\
        <h4>Aspect morphologique ' + helpIcon('Images') + '</h4>\
        <div class="image-gallery image-gallery-hero">' +
          b.images.map(function(img) {
            var url = typeof img === 'string' ? img : (img.url || img.path || '');
            var legende = typeof img === 'string' ? '' : (img.legende || img.caption || '');
            return '<div class="gallery-item" onclick="openLightbox(\'' + escapeHtml(url) + '\',\'' + escapeHtml(legende) + '\')">' +
              '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(legende) + '" onerror="this.parentNode.classList.add(\'gallery-error\');this.style.display=\'none\'"/>' +
              '<div class="gi-error-icon">⚠<br><small>' + escapeHtml(url) + '</small></div>' +
              (legende ? '<div class="gi-label">' + escapeHtml(legende) + '</div>' : '') +
            '</div>';
          }).join('') +
        '</div>\
      </div>' : '') +
      '<div class="detail-section">\
        <h4>Tests rapides</h4>\
        <div class="test-dots-row">\
          ' + testDot('Catalase', b.catalase, 'Catalase') + '\
          ' + testDot('Oxydase', b.oxydase, 'Oxydase') + '\
          ' + testDot('Coagulase', b.coagulase, 'Coagulase') + '\
          ' + testDot('Sporulation', b.sporulation, 'Sporulation') + '\
        </div>\
      </div>\
      <div class="detail-section">\
        <h4>Milieux de culture ' + helpIcon('Milieux de culture') + '</h4>\
        <div class="milieu-cards">' +
          (b.milieux && b.milieux.length > 0 ? b.milieux.map(function(m) {
            return '<div class="milieu-card"><div class="milieu-card-text">' + annotateText(m) + '</div></div>';
          }).join('') : '<p class="text-muted">Aucun milieu renseigné.</p>') +
        '</div>\
      </div>\
      <div class="detail-section">\
        <h4>Identification au laboratoire ' + helpIcon('Identification au laboratoire') + '</h4>\
        <p>' + annotateText(b.identification) + '</p>\
      </div>\
      <div class="detail-section">\
        <h4>Résistances naturelles ' + helpIcon('Résistances naturelles') + '</h4>\
        <p>' + annotateText(b.resistancesNaturelles) + '</p>\
      </div>\
      <div class="detail-section">\
        <h4>Résistances acquises ' + helpIcon('Résistances acquises') + '</h4>\
        <div class="tags-list">' + annotateTags(b.resistancesAcquises) + '</div>\
      </div>\
      <div class="detail-section">\
        <h4>Facteurs de virulence ' + helpIcon('Facteurs de virulence') + '</h4>\
        <div class="tags-list">' + annotateTags(b.virulence) + '</div>\
      </div>\
      <div class="detail-section">\
        <h4>Signification clinique ' + helpIcon('Signification clinique') + '</h4>\
        <p>' + annotateText(b.clinique) + '</p>\
      </div>' +
      (b.populationsRisque ? '<div class="detail-section">\
        <h4>Populations à risque ' + helpIcon('Populations à risque') + '</h4>\
        <p>' + annotateText(b.populationsRisque) + '</p>\
      </div>' : '') +
      '<div class="detail-section">\
        <h4>Antibiothérapie probabiliste ' + helpIcon('Antibiothérapie probabiliste') + '</h4>\
        <p>' + annotateText(b.antibiotherapie) + '</p>\
      </div>\
      <div class="detail-section">\
        <h4>Sites anatomiques ' + helpIcon('Sites anatomiques') + '</h4>\
        <div class="site-links">' +
          b.sites.map(function(s) {
            var z = zones[s];
            return z ? '<span class="site-link" onclick="navigateZone(\'' + s + '\')">' + escapeHtml(z.nom) + (b.frequence[s] ? ' (' + b.frequence[s] + ')' : '') + (b.floreNormale[s] ? ' [flore]' : '') + '</span>' : '';
          }).join('') +
        '</div>\
      </div>' +
      (b.commentaire ? '<div class="detail-section detail-section-note">\
        <h4>Remarques</h4>\
        <p>' + escapeHtml(b.commentaire) + '</p>\
      </div>' : '') +
    '</div>';
}



function renderComparison() {
  const bacts = getBacteries().filter(b => state.comparisonList.includes(b.nom));
  if (bacts.length < 2) return '<p class="text-muted">Sélectionnez au moins 2 bactéries pour comparer.</p>';
  
  const fields = [
    { key: 'gram', label: 'Gram' },
    { key: 'morphologie', label: 'Morphologie' },
    { key: 'groupement', label: 'Groupement' },
    { key: 'aerobiose', label: 'Aérobiose' },
    { key: 'sporulation', label: 'Sporulation', format: function(v) { return v ? 'Oui' : 'Non'; } },
    { key: 'catalase', label: 'Catalase', format: function(v) { return v ? '+' : '−'; } },
    { key: 'oxydase', label: 'Oxydase', format: function(v) { return v ? '+' : '−'; } },
    { key: 'coagulase', label: 'Coagulase', format: function(v) { return v ? '+' : '−'; } },
    { key: 'milieux', label: 'Milieux', format: function(v) { return (v||[]).join(', '); } },
    { key: 'resistancesNaturelles', label: 'R. naturelles' },
    { key: 'resistancesAcquises', label: 'R. acquises', format: function(v) { return (v||[]).join(', '); } },
    { key: 'virulence', label: 'Virulence', format: function(v) { return (v||[]).join(', '); } },
    { key: 'clinique', label: 'Clinique' },
    { key: 'antibiotherapie', label: 'Traitement' }
  ];
  
  // Compute similarity for each field
  function getDisplayValue(b, f) {
    var val = b[f.key];
    if (f.format) val = f.format(val);
    return val || '';
  }
  
  function allSame(f) {
    var first = getDisplayValue(bacts[0], f);
    return bacts.every(function(b) { return getDisplayValue(b, f) === first; });
  }
  
  // Count similarities
  var sameCount = fields.filter(function(f) { return allSame(f); }).length;
  var diffCount = fields.length - sameCount;
  
  // Color for gram in header
  function gramHeaderStyle(b) {
    var color = b.gram === 'positif' ? '#8b5cf6' : b.gram === 'négatif' ? '#ec4899' : '#f59e0b';
    return 'border-bottom: 3px solid ' + color;
  }
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="navigate('home')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Retour
      </button>
      <button class="btn btn-sm" onclick="clearComparison()">Vider la comparaison</button>
    </div>
    <h2 style="font-size:1.1rem;margin-bottom:6px">Comparaison de ${bacts.length} bactéries</h2>
    <div class="comp-summary">
      <span class="comp-badge comp-badge-same">${sameCount} similaire${sameCount > 1 ? 's' : ''}</span>
      <span class="comp-badge comp-badge-diff">${diffCount} différence${diffCount > 1 ? 's' : ''}</span>
    </div>
    <div class="comp-legend">
      <span class="comp-legend-item"><span class="comp-dot comp-dot-same"></span> Identique</span>
      <span class="comp-legend-item"><span class="comp-dot comp-dot-diff"></span> Différent</span>
    </div>
    <div style="overflow-x:auto">
      <table class="comparison-table">
        <thead><tr>
          <th>Caractéristique</th>
          ${bacts.map(function(b) { return '<th style="font-style:italic;' + gramHeaderStyle(b) + '">' + escapeHtml(b.nom) + '</th>'; }).join('')}
        </tr></thead>
        <tbody>
          ${fields.map(function(f) {
            var same = allSame(f);
            var rowClass = same ? 'comp-row-same' : 'comp-row-diff';
            return '<tr class="' + rowClass + '">' +
              '<td class="comp-field-label">' + f.label + '</td>' +
              bacts.map(function(b) {
                var val = getDisplayValue(b, f);
                var cellClass = same ? 'comp-cell-same' : 'comp-cell-diff';
                return '<td class="' + cellClass + '">' + escapeHtml(val) + '</td>';
              }).join('') +
            '</tr>';
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderQuiz() {
  const cases = getQuiz();
  if (cases.length === 0) return '<p class="text-muted">Aucun cas clinique disponible.</p>';
  
  const idx = state.quizCurrentIndex % cases.length;
  const c = cases[idx];
  const bacts = getBacteries();
  
  // Generate options: correct answer + 3 random distractors
  let options = [c.reponse];
  const others = bacts.filter(b => b.nom !== c.reponse).map(b => b.nom);
  while (options.length < 4 && others.length > 0) {
    const ri = Math.floor(Math.random() * others.length);
    options.push(others.splice(ri, 1)[0]);
  }
  // Shuffle
  if (!state.quizAnswered) {
    options.sort(() => Math.random() - 0.5);
    state._quizOptions = options;
  } else {
    options = state._quizOptions || options;
  }
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="navigate('home')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Retour
      </button>
    </div>
    <div class="quiz-score">
      Score : ${state.quizScore.correct} / ${state.quizScore.total} &nbsp;|&nbsp; Cas ${idx + 1} / ${cases.length}
    </div>
    <div class="quiz-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3>${c.titre}</h3>
        <span class="quiz-difficulty ${c.difficulte}">${c.difficulte}</span>
      </div>
      <div class="quiz-scenario">${c.scenario}</div>
      <div class="quiz-indices">
        ${c.indices.map(i => `<span class="quiz-index-tag">${i}</span>`).join('')}
      </div>
      <div class="quiz-options" id="quiz-options">
        ${options.map(o => {
          let cls = '';
          if (state.quizAnswered) {
            if (o === c.reponse) cls = 'correct';
            else if (o === state._quizSelected && o !== c.reponse) cls = 'wrong';
            else cls = 'disabled';
          }
          return `<div class="quiz-option ${cls}" onclick="answerQuiz('${escapeHtml(o)}')">${o}</div>`;
        }).join('')}
      </div>
      <div class="quiz-explanation ${state.quizAnswered ? 'visible' : ''}" id="quiz-explanation">
        ${c.explication}
      </div>
      ${state.quizAnswered ? `<button class="btn btn-accent mt-16" onclick="nextQuiz()">Cas suivant</button>` : ''}
    </div>`;
}

function renderAdmin() {
  if (!state.adminLoggedIn) {
    return `
      <div class="admin-login">
        <h3>Panneau d'administration</h3>
        <p class="text-muted" style="margin-top:8px">Entrez le mot de passe pour acc\u00e9der au panneau admin.</p>
        <input type="password" id="admin-pwd" placeholder="Mot de passe" onkeydown="if(event.key==='Enter')loginAdmin()"/>
        <button class="btn btn-accent" onclick="loginAdmin()" style="width:100%">Connexion</button>
      </div>`;
  }
  
  return `
    <div class="admin-panel">
      <div class="nav-toolbar">
        <button class="btn btn-sm" onclick="navigate('home')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour
        </button>
        <button class="btn btn-sm" onclick="exportData()">Exporter JSON</button>
        <button class="btn btn-sm" onclick="document.getElementById('import-file').click()">Importer JSON</button>
        <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)"/>
        <button class="btn btn-sm" onclick="state.adminLoggedIn=false;render()">D\u00e9connexion</button>
      </div>
      
      <div class="admin-tabs">
        <button class="admin-tab ${state.adminTab==='bacteries'?'active':''}" onclick="state.adminTab='bacteries';state.adminEditingBacteria=null;render()">Bact\u00e9ries</button>
        <button class="admin-tab ${state.adminTab==='zones'?'active':''}" onclick="state.adminTab='zones';render()">Zones anatomiques</button>
        <button class="admin-tab ${state.adminTab==='quiz'?'active':''}" onclick="state.adminTab='quiz';state.adminEditingQuiz=null;render()">Cas cliniques</button>
      </div>
      
      ${state.adminTab === 'bacteries' ? renderAdminBacteries() : ''}
      ${state.adminTab === 'zones' ? renderAdminZones() : ''}
      ${state.adminTab === 'quiz' ? renderAdminQuiz() : ''}
    </div>`;
}

function renderAdminBacteries() {
  const bacts = getBacteries();
  
  if (state.adminEditingBacteria !== null) {
    const b = state.adminEditingBacteria === 'new' ? getEmptyBacteria() : bacts.find(x => x.nom === state.adminEditingBacteria);
    if (!b) return '<p>Bact\u00e9rie non trouv\u00e9e</p>';
    return renderBacteriaForm(b);
  }
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="font-size:1rem">${bacts.length} bact\u00e9ries</h3>
      <button class="btn btn-accent btn-sm" onclick="state.adminEditingBacteria='new';render()">+ Ajouter</button>
    </div>
    <div class="admin-bacteria-list">
      ${bacts.map(b => `
        <div class="admin-bacteria-item">
          <span class="abi-name" onclick="state.adminEditingBacteria='${escapeHtml(b.nom)}';render()">${b.nom}</span>
          <span class="tag tag-gram-${b.gram==='positif'?'pos':'neg'}" style="font-size:0.66rem">Gram ${b.gram==='positif'?'+':'-'}</span>
          <span class="tag tag-morpho" style="font-size:0.66rem">${b.morphologie}</span>
          <button class="btn btn-sm" style="color:var(--danger)" onclick="deleteBacteria('${escapeHtml(b.nom)}')">Suppr.</button>
        </div>
      `).join('')}
    </div>`;
}

function renderBacteriaForm(b) {
  const zones = getZones();
  const isNew = state.adminEditingBacteria === 'new';
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="font-size:1rem">${isNew ? 'Nouvelle bact\u00e9rie' : 'Modifier : ' + b.nom}</h3>
      <button class="btn btn-sm" onclick="state.adminEditingBacteria=null;render()">Annuler</button>
    </div>
    <div class="admin-form" id="bacteria-form">
      <div class="form-row">
        <div class="form-group">
          <label>Nom (Genre espèce)</label>
          <input type="text" id="f-nom" value="${escapeHtml(b.nom)}"/>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="f-type">
            <option value="bacterie" ${(b.type||'bacterie')==='bacterie'?'selected':''}>Bactérie</option>
            <option value="levure" ${b.type==='levure'?'selected':''}>Levure</option>
            <option value="moisissure" ${b.type==='moisissure'?'selected':''}>Moisissure</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Gram</label>
          <select id="f-gram">
            <option value="positif" ${b.gram==='positif'?'selected':''}>Positif</option>
            <option value="négatif" ${b.gram==='négatif'?'selected':''}>Négatif</option>
            <option value="variable" ${b.gram==='variable'?'selected':''}>Variable</option>
            <option value="na" ${b.gram==='na'?'selected':''}>N/A (levure/moisissure)</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Morphologie</label>
          <select id="f-morphologie">
            <option value="coque" ${b.morphologie==='coque'?'selected':''}>Coque</option>
            <option value="bacille" ${b.morphologie==='bacille'?'selected':''}>Bacille</option>
            <option value="coccobacille" ${b.morphologie==='coccobacille'?'selected':''}>Coccobacille</option>
            <option value="spiral\u00e9" ${b.morphologie==='spiralé'?'selected':''}>Spiral\u00e9</option>
            <option value="filamenteux" ${b.morphologie==='filamenteux'?'selected':''}>Filamenteux</option>
          </select>
        </div>
        <div class="form-group">
          <label>Groupement</label>
          <input type="text" id="f-groupement" value="${escapeHtml(b.groupement)}"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>A\u00e9robiose</label>
          <select id="f-aerobiose">
            <option value="a\u00e9robie strict" ${b.aerobiose==='aérobie strict'?'selected':''}>A\u00e9robie strict</option>
            <option value="ana\u00e9robie strict" ${b.aerobiose==='anaérobie strict'?'selected':''}>Ana\u00e9robie strict</option>
            <option value="a\u00e9ro-ana\u00e9robie facultatif" ${b.aerobiose==='aéro-anaérobie facultatif'?'selected':''}>A\u00e9ro-ana\u00e9robie facultatif</option>
            <option value="microa\u00e9rophile" ${b.aerobiose==='microaérophile'?'selected':''}>Microa\u00e9rophile</option>
          </select>
        </div>
        <div class="form-group">
          <label>Options</label>
          <div style="display:flex;gap:16px;padding:8px 0">
            <div class="toggle-group"><div class="toggle ${b.sporulation?'on':''}" id="f-sporulation" onclick="this.classList.toggle('on')"></div><span class="toggle-label">Sporulation</span></div>
            <div class="toggle-group"><div class="toggle ${b.catalase?'on':''}" id="f-catalase" onclick="this.classList.toggle('on')"></div><span class="toggle-label">Catalase</span></div>
            <div class="toggle-group"><div class="toggle ${b.oxydase?'on':''}" id="f-oxydase" onclick="this.classList.toggle('on')"></div><span class="toggle-label">Oxydase</span></div>
            <div class="toggle-group"><div class="toggle ${b.coagulase?'on':''}" id="f-coagulase" onclick="this.classList.toggle('on')"></div><span class="toggle-label">Coagulase</span></div>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label>Milieux de culture (un par ligne)</label>
        <textarea id="f-milieux" rows="4">${(b.milieux||[]).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>Identification</label>
        <textarea id="f-identification">${escapeHtml(b.identification)}</textarea>
      </div>
      <div class="form-group">
        <label>R\u00e9sistances naturelles</label>
        <textarea id="f-resistancesNaturelles">${escapeHtml(b.resistancesNaturelles)}</textarea>
      </div>
      <div class="form-group">
        <label>R\u00e9sistances acquises (une par ligne)</label>
        <textarea id="f-resistancesAcquises" rows="3">${(b.resistancesAcquises||[]).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>Facteurs de virulence (un par ligne)</label>
        <textarea id="f-virulence" rows="3">${(b.virulence||[]).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>Clinique</label>
        <textarea id="f-clinique">${escapeHtml(b.clinique)}</textarea>
      </div>
      <div class="form-group">
        <label>Antibiothérapie</label>
        <textarea id="f-antibiotherapie">${escapeHtml(b.antibiotherapie)}</textarea>
      </div>
      <div class="form-group">
        <label>Populations à risque <span class="text-muted" style="font-weight:normal;font-size:0.7rem">(optionnel)</span></label>
        <textarea id="f-populationsRisque" rows="2" placeholder="Ex : Immunodéprimés, mucoviscidose, grands brûlés, nouveau-nés...">${escapeHtml(b.populationsRisque || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Remarques / commentaire <span class="text-muted" style="font-weight:normal;font-size:0.7rem">(optionnel)</span></label>
        <textarea id="f-commentaire" rows="2" placeholder="Informations supplémentaires hors catégorie...">${escapeHtml(b.commentaire || '')}</textarea>
      </div>
      
      <div class="form-group">
        <label>Sites anatomiques</label>
        <div class="zone-checkboxes">
          ${Object.entries(zones).map(([id, z]) => {
            const hasSubZones = z.sousZones && Object.keys(z.sousZones).length > 0;
            const currentSubs = (b.sousZones && b.sousZones[id]) || [];
            const isFlore = b.floreNormale && b.floreNormale[id];
            return `
            <div class="zone-checkbox-wrapper">
              <div class="zone-checkbox-row">
                <label class="zone-checkbox">
                  <input type="checkbox" data-zone-id="${id}" ${b.sites.includes(id)?'checked':''}/>
                  ${z.nom}
                  <select class="zone-freq-select" data-freq-zone="${id}">
                    <option value="fréquent" ${(b.frequence||{})[id]==='fréquent'?'selected':''}>Fréquent</option>
                    <option value="occasionnel" ${(b.frequence||{})[id]==='occasionnel'?'selected':''}>Occasionnel</option>
                    <option value="rare" ${(b.frequence||{})[id]==='rare'?'selected':''}>Rare</option>
                  </select>
                </label>
                <label class="flore-checkbox" title="Cocher si cette bactérie fait partie de la flore normale/commensale de cette zone">
                  <input type="checkbox" data-flore-zone="${id}" ${isFlore?'checked':''}/>
                  <span class="flore-label">flore</span>
                </label>
              </div>
              ${hasSubZones ? `
                <div class="subzone-checkboxes" data-parent-zone="${id}">
                  <span class="subzone-checkboxes-label">Sous-zones (optionnel) :</span>
                  ${Object.entries(z.sousZones).map(([sid, s]) => `
                    <label class="subzone-checkbox">
                      <input type="checkbox" data-sub-zone="${id}:${sid}" ${currentSubs.includes(sid)?'checked':''}/>
                      ${escapeHtml(s.nom || sid)}
                    </label>
                  `).join('')}
                  <div class="subzone-checkboxes-hint">Laisse tout décoché = bactérie générale de la zone (visible dans toutes les sous-zones).</div>
                </div>
              ` : ''}
            </div>
          `;}).join('')}
        </div>
      </div>
      
      <div class="form-group">
        <label>Images de la bactérie</label>
        <textarea id="f-images" rows="3" placeholder="images/staph_aureus_gram.jpg | Coloration Gram, amas de coques
images/staph_aureus_colonies.jpg | Colonies sur gélose sang">${(b.images||[]).map(img => {
  if (typeof img === 'string') return img;
  const url = img.url || img.path || '';
  const legende = img.legende || img.caption || '';
  return legende ? url + ' | ' + legende : url;
}).join('\n')}</textarea>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;line-height:1.5">
          Un chemin par ligne. Format : <code>images/nom_fichier.jpg</code> ou <code>images/nom_fichier.jpg | Légende de l'image</code>.<br>
          Place les fichiers dans le dossier <code>images/</code> à côté de l'application.
        </div>
      </div>
      
      <div class="form-group">
        <label>Alertes</label>
        <div style="display:flex;gap:16px;padding:8px 0">
          <div class="toggle-group"><div class="toggle ${b.alertes.urgence?'on':''}" id="f-urgence" onclick="this.classList.toggle('on')"></div><span class="toggle-label">Urgence clinique</span></div>
          <div class="toggle-group"><div class="toggle ${b.alertes.bsl3?'on':''}" id="f-bsl3" onclick="this.classList.toggle('on')"></div><span class="toggle-label">BSL-3</span></div>
          <div class="toggle-group"><div class="toggle ${b.alertes.declaration?'on':''}" id="f-declaration" onclick="this.classList.toggle('on')"></div><span class="toggle-label">D\u00e9claration obligatoire</span></div>
        </div>
      </div>
      
      <div style="display:flex;gap:8px;margin-top:20px">
        <button class="btn btn-accent" onclick="saveBacteriaForm(${isNew})">Enregistrer</button>
        <button class="btn" onclick="state.adminEditingBacteria=null;render()">Annuler</button>
      </div>
    </div>`;
}

function renderAdminZones() {
  const zones = getZones();
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="font-size:1rem">${Object.keys(zones).length} zones anatomiques</h3>
      <button class="btn btn-accent btn-sm" onclick="addNewZone()">+ Ajouter une zone</button>
    </div>
    ${Object.entries(zones).map(([id, z]) => {
      const subEntries = z.sousZones ? Object.entries(z.sousZones) : [];
      const bactCount = getBacteries().filter(b => b.sites.includes(id)).length;
      return `
      <div class="detail-card" style="padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div>
            <h4 style="color:var(--accent);margin-bottom:2px">${escapeHtml(z.nom)} <span class="text-muted text-mono" style="font-size:0.72rem">(${id})</span></h4>
            <div class="text-muted" style="font-size:0.74rem">${bactCount} bactérie(s) rattachée(s)</div>
          </div>
          <button class="btn btn-sm" style="color:var(--danger)" onclick="deleteZone('${escapeHtml(id)}')">Supprimer</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nom affiché</label>
            <input type="text" id="zone-nom-${id}" value="${escapeHtml(z.nom || '')}"/>
          </div>
          <div class="form-group">
            <label>Sous-titre</label>
            <input type="text" id="zone-sousnom-${id}" value="${escapeHtml(z.sousNom || '')}"/>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="zone-desc-${id}" rows="2">${escapeHtml(z.description || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Prélèvements (un par ligne)</label>
          <textarea id="zone-prel-${id}" rows="3">${escapeHtml((z.prelevements || []).join('\n'))}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Transport / conservation</label>
            <input type="text" id="zone-transport-${id}" value="${escapeHtml(z.transport || '')}"/>
          </div>
          <div class="form-group">
            <label>Commentaire pédagogique</label>
            <input type="text" id="zone-commentaire-${id}" value="${escapeHtml(z.commentaire || '')}"/>
          </div>
        </div>
        
        <!-- Sous-zones -->
        <div class="form-group" style="margin-top:16px">
          <label style="display:flex;align-items:center;gap:8px">
            Sous-zones de prélèvement
            <span class="text-muted text-mono" style="font-size:0.7rem;font-weight:normal">(optionnel)</span>
          </label>
          <div id="subzones-list-${id}" class="subzones-admin-list">
            ${subEntries.length === 0
              ? '<p class="text-muted" style="font-size:0.8rem;padding:6px 0">Aucune sous-zone.</p>'
              : subEntries.map(([sid, sub]) => renderSubZoneEditor(id, sid, sub)).join('')}
          </div>
          <button class="btn btn-sm" style="margin-top:8px" onclick="addSubZone('${id}')">+ Ajouter une sous-zone</button>
        </div>
        
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-accent" onclick="saveZoneEdit('${escapeHtml(id)}')">Enregistrer</button>
        </div>
      </div>
    `;}).join('')}`;
}

// Rendu d'un éditeur de sous-zone (dans l'admin)
function renderSubZoneEditor(zoneId, subId, sub) {
  const safeSubId = escapeHtml(subId);
  return `
    <div class="subzone-admin-item" data-sub-id="${safeSubId}">
      <div class="sza-head">
        <span class="text-mono text-muted" style="font-size:0.72rem">ID: ${safeSubId}</span>
        <button class="btn btn-sm" style="color:var(--danger)" onclick="removeSubZone('${zoneId}','${safeSubId}')">Supprimer</button>
      </div>
      <div class="form-row" style="margin-top:6px">
        <div class="form-group" style="margin-bottom:6px">
          <label style="font-size:0.7rem">Nom affiché</label>
          <input type="text" class="sza-nom" value="${escapeHtml(sub.nom || '')}"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:6px">
        <label style="font-size:0.7rem">Prélèvements (un par ligne)</label>
        <textarea class="sza-prelevements" rows="2">${escapeHtml((sub.prelevements || []).join('\n'))}</textarea>
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label style="font-size:0.7rem">Commentaire</label>
        <textarea class="sza-commentaire" rows="2">${escapeHtml(sub.commentaire || '')}</textarea>
      </div>
    </div>`;
}

// Ajoute une sous-zone vide à la zone en édition
function addSubZone(zoneId) {
  const slug = prompt('Identifiant court de la sous-zone (ex: "gorge", "nez") :\n\nLettres minuscules et "_" uniquement, pas d\'espaces.');
  if (!slug) return;
  const cleaned = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
  if (!cleaned) { alert('Identifiant invalide.'); return; }
  
  const zones = { ...getZones() };
  const z = { ...zones[zoneId] };
  z.sousZones = { ...(z.sousZones || {}) };
  if (z.sousZones[cleaned]) { alert('Cette sous-zone existe déjà.'); return; }
  z.sousZones[cleaned] = { nom: slug, prelevements: [], commentaire: '' };
  zones[zoneId] = z;
  saveZones(zones);
  render();
}

// Supprime une sous-zone
function removeSubZone(zoneId, subId) {
  if (!confirm('Supprimer la sous-zone "' + subId + '" ?\n\nLes bactéries qui y étaient rattachées resteront dans la zone principale.')) return;
  const zones = { ...getZones() };
  const z = { ...zones[zoneId] };
  if (z.sousZones) {
    const newSubs = { ...z.sousZones };
    delete newSubs[subId];
    z.sousZones = Object.keys(newSubs).length > 0 ? newSubs : undefined;
  }
  zones[zoneId] = z;
  saveZones(zones);
  
  // Nettoyer aussi les références dans les bactéries
  const bacts = getBacteries().map(b => {
    if (b.sousZones && b.sousZones[zoneId]) {
      const newSubs = b.sousZones[zoneId].filter(s => s !== subId);
      const newSousZones = { ...b.sousZones };
      if (newSubs.length === 0) delete newSousZones[zoneId];
      else newSousZones[zoneId] = newSubs;
      return { ...b, sousZones: newSousZones };
    }
    return b;
  });
  saveBacteries(bacts);
  render();
}

function renderAdminQuiz() {
  const cases = getQuiz();
  
  if (state.adminEditingQuiz !== null) {
    var isNew = state.adminEditingQuiz === 'new';
    var c = isNew ? { titre: '', scenario: '', indices: [], reponse: '', explication: '', difficulte: 'facile' } : cases[state.adminEditingQuiz];
    if (!c) { state.adminEditingQuiz = null; return renderAdminQuiz(); }
    
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-size:1rem">${isNew ? 'Nouveau cas clinique' : 'Modifier : ' + escapeHtml(c.titre)}</h3>
        <button class="btn btn-sm" onclick="state.adminEditingQuiz=null;render()">Annuler</button>
      </div>
      <div class="admin-form">
        <div class="form-group">
          <label>Titre du cas</label>
          <input type="text" id="fq-titre" value="${escapeHtml(c.titre)}" placeholder="Ex : Infection urinaire communautaire"/>
        </div>
        <div class="form-group">
          <label>Scénario clinique</label>
          <textarea id="fq-scenario" rows="5" placeholder="Décrivez le cas clinique : contexte, symptômes, résultats du Gram...">${escapeHtml(c.scenario)}</textarea>
        </div>
        <div class="form-group">
          <label>Indices (un par ligne)</label>
          <textarea id="fq-indices" rows="3" placeholder="Gram négatif&#10;Bacille&#10;Lactose +&#10;Indole +">${(c.indices || []).join('\n')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Réponse correcte (nom exact de la bactérie)</label>
            <input type="text" id="fq-reponse" value="${escapeHtml(c.reponse)}" placeholder="Ex : Escherichia coli"/>
          </div>
          <div class="form-group">
            <label>Difficulté</label>
            <select id="fq-difficulte">
              <option value="facile" ${c.difficulte === 'facile' ? 'selected' : ''}>Facile</option>
              <option value="moyen" ${c.difficulte === 'moyen' ? 'selected' : ''}>Moyen</option>
              <option value="difficile" ${c.difficulte === 'difficile' ? 'selected' : ''}>Difficile</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Explication (affichée après la réponse)</label>
          <textarea id="fq-explication" rows="4" placeholder="Pourquoi c'est cette bactérie ? Points clés pour l'apprentissage...">${escapeHtml(c.explication)}</textarea>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-accent" onclick="saveQuizCase(${isNew ? -1 : state.adminEditingQuiz})">Enregistrer</button>
          <button class="btn" onclick="state.adminEditingQuiz=null;render()">Annuler</button>
        </div>
      </div>`;
  }
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="font-size:1rem">${cases.length} cas clinique(s)</h3>
      <button class="btn btn-accent btn-sm" onclick="state.adminEditingQuiz='new';render()">+ Ajouter un cas</button>
    </div>
    ${cases.map(function(c, i) { return `
      <div class="detail-card" style="padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${escapeHtml(c.titre)}</strong>
          <span class="quiz-difficulty ${c.difficulte}">${c.difficulte}</span>
        </div>
        <p class="text-muted" style="font-size:0.82rem;margin-top:4px">${escapeHtml(c.scenario.substring(0, 150))}...</p>
        <p style="font-size:0.82rem;margin-top:4px">Réponse : <em>${escapeHtml(c.reponse)}</em></p>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-sm" onclick="state.adminEditingQuiz=${i};render()">Modifier</button>
          <button class="btn btn-sm" style="color:var(--danger)" onclick="deleteQuizCase(${i})">Supprimer</button>
        </div>
      </div>
    `; }).join('')}`;
}

function saveQuizCase(index) {
  var c = {
    titre: document.getElementById('fq-titre').value.trim(),
    scenario: document.getElementById('fq-scenario').value.trim(),
    indices: document.getElementById('fq-indices').value.split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; }),
    reponse: document.getElementById('fq-reponse').value.trim(),
    explication: document.getElementById('fq-explication').value.trim(),
    difficulte: document.getElementById('fq-difficulte').value
  };
  if (!c.titre || !c.reponse) { alert('Le titre et la réponse sont obligatoires.'); return; }
  
  var cases = getQuiz().slice();
  if (index < 0) {
    cases.push(c);
  } else {
    cases[index] = c;
  }
  saveQuiz(cases);
  state.adminEditingQuiz = null;
  render();
}

function deleteQuizCase(index) {
  var cases = getQuiz();
  if (!confirm('Supprimer le cas "' + cases[index].titre + '" ?')) return;
  var newCases = cases.filter(function(_, i) { return i !== index; });
  saveQuiz(newCases);
  render();
}

function renderComparisonBar() {
  if (state.comparisonList.length === 0) return '';
  return `
    <div class="comparison-bar ${state.comparisonList.length > 0 ? 'active' : ''}">
      <div class="cb-items">
        <span class="text-mono" style="font-size:0.78rem;color:var(--text-muted)">Comparer :</span>
        ${state.comparisonList.map(nom => `
          <span class="cb-item">${nom} <span class="cb-remove" onclick="toggleComparison('${escapeHtml(nom)}')">\u00d7</span></span>
        `).join('')}
      </div>
      <div style="display:flex;gap:6px">
        ${state.comparisonList.length >= 2 ? '<button class="btn btn-accent btn-sm" onclick="navigate(\'comparison\')">Comparer</button>' : ''}
        <button class="btn btn-sm" onclick="clearComparison()">Vider</button>
      </div>
    </div>`;
}

// ==================== NAVIGATION ====================

function navigate(view) {
  state.currentView = view;
  state.focusedZone = null;
  if (view === 'home') { state.currentZone = null; state.currentSubZone = null; state.currentBacteria = null; }
  render();
  window.scrollTo(0, 0);
}

function navigateZone(zoneId, subZoneId) {
  state.currentView = 'zone';
  state.currentZone = zoneId;
  state.currentSubZone = subZoneId || null;
  state.focusedZone = null;
  render();
  window.scrollTo(0, 0);
}

function navigateDetail(nom) {
  state.currentView = 'detail';
  state.currentBacteria = nom;
  state.focusedZone = null;
  render();
  window.scrollTo(0, 0);
}

// ==================== SOUS-ZONES (ZOOM-FOCUS) ====================
// Au clic sur une bulle de zone avec sous-zones, la vue d'accueil
// se transforme : la bulle zoomée à gauche, sous-bulles à droite.

function onZoneClick(zoneId, evt) {
  const zones = getZones();
  const zone = zones[zoneId];
  if (!zone || !zone.sousZones || Object.keys(zone.sousZones).length === 0) {
    navigateZone(zoneId);
    return;
  }
  // Activer le mode "zone focus"
  state.focusedZone = zoneId;
  renderZoneFocus();
}

function closeZoneFocus() {
  state.focusedZone = null;
  render();
}

function renderZoneFocus() {
  const app = document.getElementById('app');
  const zones = getZones();
  const bacts = getBacteries();
  const zoneId = state.focusedZone;
  const zone = zones[zoneId];
  if (!zone) return;
  
  const subEntries = Object.entries(zone.sousZones || {});
  const totalCount = bacts.filter(b => b.sites.includes(zoneId)).length;
  
  // Find zone color from zonesDef
  const zonesDef = getZonesDef();
  const zDef = zonesDef.find(z => z.id === zoneId) || { color: 'var(--accent)' };
  const color = zDef.color;
  
  // Apply same faint tinted gradient background as renderZone (light mode only)
  if (color && color.charAt(0) === '#' && state.theme !== 'dark') {
    document.body.style.background = 'linear-gradient(180deg, ' + hexToRgba(color, 0.10) + ' 0%, ' + hexToRgba(color, 0.04) + ' 50%, var(--bg-primary) 100%)';
  } else {
    document.body.style.background = '';
  }
  
  let html = renderHeader();
  
  html += `
    <div class="zone-focus-overlay" onclick="if(event.target===this)closeZoneFocus()">
      <div class="zone-focus-container">
        
        <!-- LEFT: Main zone bubble zoomed -->
        <div class="zf-main" style="--zf-color: ${color}; --zf-color-light: ${hexToRgba(color, 0.35)}; --zf-color-faint: ${hexToRgba(color, 0.12)}; --zf-color-med: ${hexToRgba(color, 0.22)}">
          <div class="zf-bubble">
            <div class="zf-bubble-ring"></div>
            <div class="zf-bubble-inner">
              <div class="zf-bubble-label">${escapeHtml(zDef.label || zone.nom)}</div>
              <div class="zf-bubble-sub">${escapeHtml(zone.sousNom || '')}</div>
              <div class="zf-bubble-count">${totalCount} bactéries</div>
            </div>
          </div>
          <p class="zf-desc">${escapeHtml(zone.description || '')}</p>
          <button class="zf-all-btn" onclick="navigateZone('${escapeHtml(zoneId)}')">
            Voir toute la zone →
          </button>
        </div>
        
        <!-- RIGHT: Sub-zone bubbles -->
        <div class="zf-subs">
          <div class="zf-subs-title">Zones de prélèvement</div>
          <div class="zf-subs-grid">
            ${subEntries.map(([sid, sub], i) => {
              const count = bacts.filter(b => {
                if (!b.sites.includes(zoneId)) return false;
                const subs = (b.sousZones && b.sousZones[zoneId]) || [];
                return subs.length === 0 || subs.includes(sid);
              }).length;
              return `
                <button class="zf-sub-bubble" onclick="navigateZone('${escapeHtml(zoneId)}','${escapeHtml(sid)}')"
                        style="--zf-delay: ${0.15 + i * 0.08}s; --zf-color: ${color}">
                  <div class="zf-sub-circle">
                    <span class="zf-sub-count">${count}</span>
                  </div>
                  <div class="zf-sub-name">${escapeHtml(sub.nom || sid)}</div>
                  ${sub.prelevements && sub.prelevements.length ? `<div class="zf-sub-prel">${escapeHtml(sub.prelevements[0])}${sub.prelevements.length > 1 ? ' +' + (sub.prelevements.length - 1) : ''}</div>` : ''}
                </button>`;
            }).join('')}
          </div>
        </div>
        
        <!-- Close button -->
        <button class="zf-close" onclick="closeZoneFocus()" aria-label="Fermer" title="Retour à la carte">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>`;
  
  app.innerHTML = html;
  bindEvents();
}

// Helper to get zonesDef colors (used by zone focus view)
function getZonesDef() {
  var ZONE_COLORS = [
    '#8b5cf6', '#0ea5e9', '#06b6d4', '#14b8a6', '#84cc16',
    '#ef4444', '#f59e0b', '#eab308', '#f97316', '#ec4899',
    '#a855f7', '#3b82f6', '#22c55e', '#f43f5e', '#d946ef'
  ];
  var zones = getZones();
  return Object.entries(zones).map(function(entry, i) {
    var id = entry[0], z = entry[1];
    return { id: id, label: z.nom || id, sub: z.sousNom || '', color: ZONE_COLORS[i % ZONE_COLORS.length] };
  });
}

// Remove old popover functions (replaced by zone focus)
function closeSubZonePopover() {}
function outsideSubZonePopoverClick() {}

// ==================== SEARCH ====================

function onSearch(query) {
  state.searchQuery = query;
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  
  if (!query || query.length < 2) {
    dropdown.classList.remove('active');
    return;
  }
  
  const q = query.toLowerCase();
  const results = getBacteries().filter(b => 
    b.nom.toLowerCase().includes(q) ||
    b.morphologie.toLowerCase().includes(q) ||
    b.gram.toLowerCase().includes(q) ||
    b.clinique.toLowerCase().includes(q)
  ).slice(0, 8);
  
  if (results.length === 0) {
    dropdown.innerHTML = '<div class="search-result-item"><span class="text-muted">Aucun r\u00e9sultat</span></div>';
  } else {
    dropdown.innerHTML = results.map(b => `
      <div class="search-result-item" onmousedown="navigateDetail('${escapeHtml(b.nom)}')">
        <div class="sr-name">${b.nom}</div>
        <div class="sr-info">Gram ${b.gram === 'positif' ? '+' : '-'} \u2022 ${b.morphologie} \u2022 ${b.aerobiose}</div>
      </div>
    `).join('');
  }
  dropdown.classList.add('active');
}

function onSearchFocus() {
  if (state.searchQuery && state.searchQuery.length >= 2) {
    onSearch(state.searchQuery);
  }
}

function closeSearchDropdown() {
  const d = document.getElementById('search-dropdown');
  if (d) d.classList.remove('active');
}

// ==================== FILTERS ====================

function setFilter(key, value) {
  state.filters[key] = value;
  render();
}

function clearFilters() {
  state.filters = { gram: '', morphologie: '', aerobiose: '', catalase: '', oxydase: '' };
  render();
}

// ==================== THEME ====================

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  safeStorageSet('bacteriomap-theme', state.theme);
  render();
}

// ==================== COMPARISON ====================

function toggleComparison(nom) {
  const idx = state.comparisonList.indexOf(nom);
  if (idx >= 0) {
    state.comparisonList.splice(idx, 1);
  } else if (state.comparisonList.length < 3) {
    state.comparisonList.push(nom);
  }
  render();
}

function clearComparison() {
  state.comparisonList = [];
  if (state.currentView === 'comparison') state.currentView = 'home';
  render();
}

// ==================== QUIZ ====================

function answerQuiz(answer) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;
  state._quizSelected = answer;
  const cases = getQuiz();
  const c = cases[state.quizCurrentIndex % cases.length];
  state.quizScore.total++;
  var isCorrect = answer === c.reponse;
  if (isCorrect) state.quizScore.correct++;
  render();
  
  // Trigger animation after render
  setTimeout(function() {
    var optionsEl = document.getElementById('quiz-options');
    if (!optionsEl) return;
    if (isCorrect) {
      optionsEl.classList.add('quiz-anim-correct');
    } else {
      optionsEl.classList.add('quiz-anim-wrong');
    }
  }, 50);
}

function nextQuiz() {
  state.quizCurrentIndex++;
  state.quizAnswered = false;
  state._quizSelected = null;
  state._quizOptions = null;
  render();
}

// ==================== ADMIN ====================

function loginAdmin() {
  const pwd = document.getElementById('admin-pwd');
  if (pwd && pwd.value === 'microlab2025') {
    state.adminLoggedIn = true;
    render();
  } else {
    alert('Mot de passe incorrect');
  }
}

function getEmptyBacteria() {
  return {
    nom: '', type: 'bacterie', gram: 'positif', morphologie: 'coque', groupement: '', aerobiose: 'aéro-anaérobie facultatif',
    sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: [], identification: '', resistancesNaturelles: '', resistancesAcquises: [],
    virulence: [], clinique: '', antibiotherapie: '', populationsRisque: '', commentaire: '',
    sites: [], frequence: {}, floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: false }, images: []
  };
}

function saveBacteriaForm(isNew) {
  const bacts = [...getBacteries()];
  const b = {};
  
  b.nom = document.getElementById('f-nom').value.trim();
  if (!b.nom) { alert('Le nom est obligatoire'); return; }
  
  var typeEl = document.getElementById('f-type');
  b.type = typeEl ? typeEl.value : 'bacterie';
  b.gram = document.getElementById('f-gram').value;
  b.morphologie = document.getElementById('f-morphologie').value;
  b.groupement = document.getElementById('f-groupement').value;
  b.aerobiose = document.getElementById('f-aerobiose').value;
  b.sporulation = document.getElementById('f-sporulation').classList.contains('on');
  b.catalase = document.getElementById('f-catalase').classList.contains('on');
  b.oxydase = document.getElementById('f-oxydase').classList.contains('on');
  b.coagulase = document.getElementById('f-coagulase').classList.contains('on');
  b.milieux = document.getElementById('f-milieux').value.split('\n').filter(x => x.trim());
  b.identification = document.getElementById('f-identification').value;
  b.resistancesNaturelles = document.getElementById('f-resistancesNaturelles').value;
  b.resistancesAcquises = document.getElementById('f-resistancesAcquises').value.split('\n').filter(x => x.trim());
  b.virulence = document.getElementById('f-virulence').value.split('\n').filter(x => x.trim());
  b.clinique = document.getElementById('f-clinique').value;
  b.antibiotherapie = document.getElementById('f-antibiotherapie').value;
  var popEl = document.getElementById('f-populationsRisque');
  b.populationsRisque = popEl ? popEl.value.trim() : '';
  var comEl = document.getElementById('f-commentaire');
  b.commentaire = comEl ? comEl.value.trim() : '';
  
  // Sites & frequencies & flore normale
  b.sites = [];
  b.frequence = {};
  b.floreNormale = {};
  document.querySelectorAll('[data-zone-id]').forEach(cb => {
    if (cb.checked) {
      const zid = cb.getAttribute('data-zone-id');
      b.sites.push(zid);
      const sel = document.querySelector(`[data-freq-zone="${zid}"]`);
      if (sel) b.frequence[zid] = sel.value;
      const floreCb = document.querySelector(`[data-flore-zone="${zid}"]`);
      if (floreCb && floreCb.checked) b.floreNormale[zid] = true;
    }
  });
  
  // Sous-zones : format "zoneId:subId"
  b.sousZones = {};
  document.querySelectorAll('[data-sub-zone]').forEach(cb => {
    if (cb.checked) {
      const key = cb.getAttribute('data-sub-zone');
      const parts = key.split(':');
      if (parts.length === 2) {
        const [zid, sid] = parts;
        // N'ajouter que si la zone parente est cochée
        if (b.sites.indexOf(zid) !== -1) {
          if (!b.sousZones[zid]) b.sousZones[zid] = [];
          b.sousZones[zid].push(sid);
        }
      }
    }
  });
  // Si aucune sous-zone cochée, on retire la propriété
  if (Object.keys(b.sousZones).length === 0) delete b.sousZones;
  
  b.alertes = {
    urgence: document.getElementById('f-urgence').classList.contains('on'),
    bsl3: document.getElementById('f-bsl3').classList.contains('on'),
    declaration: document.getElementById('f-declaration').classList.contains('on')
  };
  
  // Parse images field: one per line, format "path" or "path | caption"
  const imagesText = (document.getElementById('f-images').value || '').trim();
  b.images = imagesText ? imagesText.split('\n').map(line => {
    line = line.trim();
    if (!line) return null;
    const parts = line.split('|');
    const url = parts[0].trim();
    const legende = parts.length > 1 ? parts.slice(1).join('|').trim() : '';
    return legende ? { url, legende } : url;
  }).filter(x => x) : [];
  
  if (isNew) {
    bacts.push(b);
  } else {
    const idx = bacts.findIndex(x => x.nom === state.adminEditingBacteria);
    if (idx >= 0) bacts[idx] = b;
  }
  
  saveBacteries(bacts);
  state.adminEditingBacteria = null;
  render();
}

function deleteBacteria(nom) {
  if (!confirm(`Supprimer ${nom} ?`)) return;
  const bacts = getBacteries().filter(b => b.nom !== nom);
  saveBacteries(bacts);
  render();
}

function saveZoneEdit(id) {
  const zones = { ...getZones() };
  const z = { ...(zones[id] || {}) };
  var nomEl = document.getElementById('zone-nom-' + id);
  var sousNomEl = document.getElementById('zone-sousnom-' + id);
  var prelEl = document.getElementById('zone-prel-' + id);
  var commentaireEl = document.getElementById('zone-commentaire-' + id);
  
  z.id = id;
  z.nom = nomEl ? nomEl.value.trim() : (z.nom || id);
  z.sousNom = sousNomEl ? sousNomEl.value.trim() : (z.sousNom || '');
  z.description = document.getElementById('zone-desc-' + id).value;
  z.prelevements = prelEl ? prelEl.value.split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : (z.prelevements || []);
  z.transport = document.getElementById('zone-transport-' + id).value.trim();
  z.commentaire = commentaireEl ? commentaireEl.value.trim() : (z.commentaire || '');
  
  // Lire les sous-zones modifiées dans le DOM
  var listEl = document.getElementById('subzones-list-' + id);
  if (listEl) {
    var subItems = listEl.querySelectorAll('.subzone-admin-item');
    if (subItems.length === 0) {
      delete z.sousZones;
    } else {
      var newSubs = {};
      subItems.forEach(function(item) {
        var subId = item.getAttribute('data-sub-id');
        var nom = item.querySelector('.sza-nom').value.trim();
        var prelevementsRaw = item.querySelector('.sza-prelevements').value;
        var commentaire = item.querySelector('.sza-commentaire').value.trim();
        var prelevements = prelevementsRaw.split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
        newSubs[subId] = { nom: nom || subId, prelevements: prelevements, commentaire: commentaire };
      });
      z.sousZones = newSubs;
    }
  }
  
  zones[id] = z;
  saveZones(zones);
  alert('Zone "' + z.nom + '" enregistrée');
}

function addNewZone() {
  var slug = prompt('Identifiant de la nouvelle zone (lettres minuscules, pas d\'espaces) :\n\nExemples : urinaire, digestif, genital');
  if (!slug) return;
  var cleaned = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
  if (!cleaned) { alert('Identifiant invalide.'); return; }
  
  var zones = { ...getZones() };
  if (zones[cleaned]) { alert('Une zone avec cet identifiant existe déjà.'); return; }
  
  var nom = prompt('Nom affiché de la zone :\n\nExemple : Système urinaire') || cleaned;
  
  zones[cleaned] = {
    id: cleaned,
    nom: nom,
    sousNom: '',
    description: '',
    prelevements: [],
    transport: '',
    commentaire: ''
  };
  saveZones(zones);
  render();
}

function deleteZone(zoneId) {
  var zones = getZones();
  var zone = zones[zoneId];
  var bactCount = getBacteries().filter(function(b) { return b.sites.includes(zoneId); }).length;
  
  var msg = 'Supprimer la zone "' + (zone ? zone.nom : zoneId) + '" ?';
  if (bactCount > 0) {
    msg += '\n\nAttention : ' + bactCount + ' bactérie(s) rattachées seront détachées (pas supprimées).';
  }
  if (!confirm(msg)) return;
  
  var newZones = { ...zones };
  delete newZones[zoneId];
  saveZones(newZones);
  
  // Nettoyer les bactéries
  var bacts = getBacteries().map(function(b) {
    if (!b.sites.includes(zoneId)) return b;
    var newB = { ...b };
    newB.sites = newB.sites.filter(function(s) { return s !== zoneId; });
    if (newB.frequence) { newB.frequence = { ...newB.frequence }; delete newB.frequence[zoneId]; }
    if (newB.floreNormale) { newB.floreNormale = { ...newB.floreNormale }; delete newB.floreNormale[zoneId]; }
    if (newB.sousZones) { newB.sousZones = { ...newB.sousZones }; delete newB.sousZones[zoneId]; }
    return newB;
  });
  saveBacteries(bacts);
  render();
}

// ==================== IMPORT/EXPORT ====================

function exportData() {
  const data = { bacteries: getBacteries(), zones: getZones(), quiz: getQuiz() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bacteriomap-data.json'; a.click();
  URL.revokeObjectURL(url);
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.bacteries) saveBacteries(data.bacteries);
      if (data.zones) saveZones(data.zones);
      if (data.quiz) saveQuiz(data.quiz);
      alert('Donn\u00e9es import\u00e9es avec succ\u00e8s');
      render();
    } catch(err) {
      alert('Erreur lors de l\'importation : ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ==================== LIGHTBOX ====================

function openLightbox(url, caption) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (lb && img && cap) {
    img.src = url;
    cap.textContent = caption;
    lb.classList.add('active');
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
}

// ==================== UTILITIES ====================

// Convert hex color to rgba with alpha (Edge-compatible, no color-mix needed)
function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function bindEvents() {
  // No more SVG template injection needed — SVG is generated inline by renderHome()
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
  // Apply theme
  document.documentElement.setAttribute('data-theme', state.theme);
  // Initial render
  render();
});
