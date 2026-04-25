/* ============================================================================
 * BACTERIOMAP — Base de données
 * ============================================================================
 *
 * Ce fichier contient TOUTES les données de l'application :
 *   - zonesData         : zones anatomiques (sites de prélèvement)
 *   - bacteriesData     : bactéries (Gram, morphologie, milieux, résistances...)
 *   - quizCases         : cas cliniques pour le module quiz
 *
 * MODIFIER LES DONNÉES :
 *   1. Ouvrir ce fichier dans VS Code ou Notepad
 *   2. Respecter la syntaxe JavaScript (virgules, guillemets, accolades)
 *   3. Sauvegarder et recharger l'application
 *
 *   Toujours faire une copie de sauvegarde avant modification.
 *
 * Dernière mise à jour : 2026-04-14
 * ============================================================================ */

// ==================== DATABASE ====================

window.BACTERIOMAP_DATA = window.BACTERIOMAP_DATA || {}; window.BACTERIOMAP_DATA.zones = {
  snc: {
    id: "snc", nom: "Système nerveux", sousNom: "LCR / Méninges",
    description: "Site normalement stérile. Tout germe isolé est significatif. L'analyse du LCR est une urgence diagnostique absolue nécessitant une prise en charge immédiate.",
    prelevements: ["LCR par ponction lombaire", "LCR par dérivation ventriculaire"],
    transport: "Acheminement immédiat au laboratoire (< 30 min). Ne jamais réfrigérer. Incubation rapide.",
    commentaire: "Site stérile — pas de flore normale. Urgence absolue : Gram + culture + antigènes solubles si suspicion méningite."
  },
  yeux: {
    id: "yeux", nom: "Yeux", sousNom: "Conjonctive / Cornée",
    description: "Prélèvements oculaires : conjonctivaux, cornéens, vitréens. La flore conjonctivale est pauvre et transitoire.",
    prelevements: ["Écouvillon conjonctival", "Grattage cornéen", "Ponction de chambre antérieure", "Biopsie vitréenne"],
    transport: "Acheminement rapide. Milieux d'ensemencement au lit du patient pour grattages cornéens.",
    commentaire: "Flore conjonctivale transitoire limitée. Tout germe isolé en culture pure est potentiellement significatif."
  },
  orl: {
    id: "orl", nom: "ORL", sousNom: "Oreilles, nez, gorge, sinus",
    description: "Sphère ORL : prélèvements de gorge, nasaux, auriculaires, sinusiens. Flore commensale riche, interprétation en contexte clinique.",
    prelevements: ["Écouvillon de gorge", "Prélèvement nasal", "Écouvillon auriculaire", "Ponction sinusienne"],
    transport: "Écouvillon en milieu de transport (Amies/Stuart). Acheminement < 2h.",
    commentaire: "Flore commensale abondante. Recherche ciblée de pathogènes (SGA, diphtérie, etc.).",
    // [EXEMPLE] Sous-zones ORL — à adapter selon vos pratiques CHUV.
    sousZones: {
      gorge: {
        nom: "Gorge / Pharynx",
        prelevements: ["Écouvillon de gorge", "TDR angine (Streptococcus pyogenes)"],
        commentaire: "Recherche d'angine à SGA en priorité. Flore commensale riche : ne pas sur-interpréter la présence de streptocoques viridans ou de staphylocoques."
      },
      nez: {
        nom: "Nez",
        prelevements: ["Écouvillon nasal antérieur", "Écouvillon rhinopharyngé"],
        commentaire: "Dépistage portage MRSA (narines). Rhinopharyngé pour recherche virale (grippe, VRS) ou bactérienne (coqueluche)."
      },
      oreille: {
        nom: "Oreille",
        prelevements: ["Écouvillon auriculaire", "Ponction tympanique (OMA)"],
        commentaire: "Otite externe : P. aeruginosa, S. aureus. Otite moyenne aiguë : S. pneumoniae, H. influenzae, M. catarrhalis."
      },
      sinus: {
        nom: "Sinus",
        prelevements: ["Ponction sinusienne", "Aspiration méatique"],
        commentaire: "Sinusite bactérienne : S. pneumoniae, H. influenzae. Sinusite chronique : anaérobies, S. aureus. Sinusite fongique (aspergillose) chez immunodéprimé."
      }
    }
  },
  respiratoire: {
    id: "respiratoire", nom: "Système respiratoire", sousNom: "Poumons / Bronches",
    description: "Prélèvements respiratoires hauts et bas. La qualité du prélèvement est essentielle (score de Bartlett pour les expectorations).",
    prelevements: ["Expectoration", "Aspiration bronchique", "LBA (lavage broncho-alvéolaire)", "Brosse protégée"],
    transport: "Acheminement rapide (< 2h). Ne pas réfrigérer les prélèvements pour culture de mycobactéries.",
    commentaire: "Contamination fréquente par la flore oropharyngée. Évaluation cytologique obligatoire pour les expectorations."
  },
  os_articulations: {
    id: "os_articulations", nom: "Système musculosquelettique", sousNom: "Os, articulations, prothèses",
    description: "Sites normalement stériles. Tout germe isolé est significatif. Prélèvements multiples recommandés (≥3-5 biopsies).",
    prelevements: ["Liquide articulaire (ponction)", "Biopsies osseuses peropératoires", "Sonication de matériel prothétique"],
    transport: "Acheminement immédiat. Flacons d'hémoculture pour liquide articulaire si suspicion d'infection.",
    commentaire: "Site stérile. Prélèvements multiples indispensables pour distinguer contaminant de pathogène (règle ≥2/5 positifs)."
  },
  cardiovasculaire: {
    id: "cardiovasculaire", nom: "Système circulatoire", sousNom: "Hémocultures",
    description: "Site normalement stérile. Tout germe isolé est potentiellement significatif (sauf contamination cutanée). Prélèvement : flacons aérobies + anaérobies, ponction veineuse.",
    prelevements: ["Hémocultures (flacons BACTEC)", "Cathéters (culture quantitative/semi-quantitative)"],
    transport: "Incubation immédiate dans automate BACTEC FX. Ne jamais réfrigérer.",
    commentaire: "Site stérile — pas de flore normale. Attention aux contaminations par staphylocoques à coagulase négative (SCN)."
  },
  digestif: {
    id: "digestif", nom: "Système digestif", sousNom: "Estomac, intestins, selles",
    description: "Flore intestinale extrêmement riche et diverse. Recherche ciblée de pathogènes entériques spécifiques.",
    prelevements: ["Coproculture (selles)", "Écouvillonnage rectal", "Biopsie gastrique (H. pylori)"],
    transport: "Acheminement < 2h ou milieu de transport Cary-Blair pour selles. Réfrigérer si délai.",
    commentaire: "Flore digestive très abondante (~10¹¹ bactéries/g de selles). Recherche ciblée uniquement."
  },
  urinaire: {
    id: "urinaire", nom: "Système urinaire", sousNom: "Reins, vessie, urines",
    description: "ECBU : examen le plus prescrit en microbiologie. Seuil de significativité ≥10³-10⁵ UFC/mL selon contexte clinique et type de prélèvement.",
    prelevements: ["ECBU (milieu de jet)", "Sondage urinaire", "Ponction sus-pubienne", "Uricult"],
    transport: "Acheminement < 2h ou réfrigération à +4°C (max 24h). Utilisation d'acide borique possible.",
    commentaire: "Urètre distal colonisé : flore cutanée et périnéale. Seuil de significativité variable selon le contexte."
  },
  peau: {
    id: "peau", nom: "Système tégumentaire", sousNom: "Peau, plaies, abcès, brûlures",
    description: "La peau possède une flore résidente riche. Interprétation en fonction du site, du type de prélèvement et du contexte clinique.",
    prelevements: ["Écouvillon de plaie (superficiel)", "Ponction d'abcès", "Biopsie tissulaire", "Prélèvement de brûlure"],
    transport: "Milieu de transport (Amies). Acheminement rapide. Ponction d'abcès en seringue capped.",
    commentaire: "Flore cutanée résidente abondante. Privilégier les prélèvements profonds (ponction, biopsie) aux écouvillons superficiels."
  },
  genital: {
    id: "genital", nom: "Système reproducteur", sousNom: "Masculin / Féminin",
    description: "Flore vaginale dominée par les lactobacilles (flore de Döderlein). Recherche ciblée de pathogènes spécifiques.",
    prelevements: ["Écouvillon vaginal", "Écouvillon endocervical", "Écouvillon urétral", "Prélèvement de liquide prostatique"],
    transport: "Milieu de transport adapté. Acheminement rapide pour N. gonorrhoeae (fragile).",
    commentaire: "Flore vaginale riche dominée par les lactobacilles. Score de Nugent pour évaluer la flore. Recherche ciblée de pathogènes.",
    sousZones: {
      masculin: {
        nom: "Masculin",
        prelevements: ["Écouvillon urétral", "Premier jet d'urine (PCR)", "Liquide prostatique"],
        commentaire: "Recherche IST : gonocoque, Chlamydia, Mycoplasma genitalium."
      },
      feminin: {
        nom: "Féminin",
        prelevements: ["Écouvillon vaginal", "Écouvillon endocervical", "Prélèvement endocol"],
        commentaire: "Recherche IST, vaginose bactérienne (score de Nugent), dépistage SGB chez la femme enceinte."
      }
    }
  }
};

window.BACTERIOMAP_DATA.bacteries = [
  // ===== GRAM + COQUES =====
  {
    nom: "Staphylococcus aureus", gram: "positif", morphologie: "coque", groupement: "amas (grappes de raisin)",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: true,
    milieux: ["Gélose sang (colonies dorées, β-hémolytiques)", "Chapman (mannitol +, colonies jaunes)", "Chromogène (rose/mauve selon marque)"],
    identification: "MALDI-TOF (score >2.0), coagulase +, catalase +, DNase +. Latex d'agglutination rapide.",
    resistancesNaturelles: "Aucune résistance naturelle notable",
    resistancesAcquises: ["MRSA (mecA → PLP2a, résistance β-lactamines)", "VISA/VRSA (rare, épaississement paroi)"],
    virulence: ["Protéine A", "Toxines (TSST-1, PVL, entérotoxines)", "Biofilm", "Coagulase"],
    clinique: "Infections cutanées (furoncles, impétigo), bactériémies, endocardites, ostéomyélites, pneumonies nécrosantes (PVL+), TIAC.",
    antibiotherapie: "MSSA : flucloxacilline/oxacilline. MRSA : vancomycine, daptomycine, linézolide. Selon antibiogramme.",
    sites: ["peau", "cardiovasculaire", "respiratoire", "os_articulations", "orl", "snc", "yeux"],
    frequence: { peau: "fréquent", cardiovasculaire: "fréquent", respiratoire: "occasionnel", os_articulations: "fréquent", orl: "occasionnel", snc: "rare", yeux: "occasionnel" },
    floreNormale: { peau: true, orl: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Staphylococcus epidermidis", gram: "positif", morphologie: "coque", groupement: "amas",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (petites colonies blanches, non hémolytiques)", "Chromogène (selon marque)"],
    identification: "MALDI-TOF (score >2.0). Coagulase -, catalase +. SCN (staphylocoque à coagulase négative).",
    resistancesNaturelles: "Aucune",
    resistancesAcquises: ["Méticilline-résistance fréquente (mecA)", "Multi-résistance fréquente"],
    virulence: ["Biofilm (infections sur matériel)", "Adhésines"],
    clinique: "Infections sur matériel (prothèses, cathéters, valves). Bactériémies nosocomiales. Contaminant fréquent d'hémocultures.",
    antibiotherapie: "Selon antibiogramme. Souvent vancomycine en empirique (forte prévalence méti-R). Retrait du matériel si possible.",
    sites: ["cardiovasculaire", "peau", "os_articulations", "yeux"],
    frequence: { cardiovasculaire: "fréquent", peau: "fréquent", os_articulations: "occasionnel", yeux: "occasionnel" },
    floreNormale: { peau: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Streptococcus pneumoniae", gram: "positif", morphologie: "coque", groupement: "diplocoques lancéolés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (colonies mucoïdes, α-hémolytiques avec zone verte)", "Gélose chocolat (meilleure croissance)"],
    identification: "MALDI-TOF. Sensibilité à l'optochine (zone ≥14mm). Lyse par les sels biliaires. Antigène urinaire (BinaxNOW).",
    resistancesNaturelles: "Aminosides (bas niveau)",
    resistancesAcquises: ["Pénicilline (altération PLP)", "Macrolides (erm, mef)", "Fluoroquinolones (rare)"],
    virulence: ["Capsule polysaccharidique", "Pneumolysine", "Autolysine", "IgA protéase"],
    clinique: "Pneumonies communautaires (1ère cause), méningites bactériennes (adulte), otites moyennes, sinusites, bactériémies.",
    antibiotherapie: "Amoxicilline (si sensible). Ceftriaxone pour méningites. Selon CMI pour les souches de sensibilité diminuée.",
    sites: ["respiratoire", "snc", "orl", "cardiovasculaire", "yeux"],
    frequence: { respiratoire: "fréquent", snc: "fréquent", orl: "fréquent", cardiovasculaire: "occasionnel", yeux: "occasionnel" },
    floreNormale: { orl: true },
    alertes: { urgence: true, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Streptococcus pyogenes", gram: "positif", morphologie: "coque", groupement: "chaînettes",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (grandes colonies, β-hémolyse franche)", "Gélose sang + ANC (sélectif)"],
    identification: "MALDI-TOF. Groupage Lancefield : groupe A. Test rapide antigénique (TDR angine). PYR +.",
    resistancesNaturelles: "Aucune résistance aux β-lactamines (toujours sensible)",
    resistancesAcquises: ["Macrolides (erm, mef)", "Tétracyclines", "Fluoroquinolones (rare)"],
    virulence: ["Protéine M", "Streptolysines O et S", "Exotoxines pyrogènes (SpeA, SpeB)", "Hyaluronidase", "Streptokinase"],
    clinique: "Angines, scarlatine, érysipèle, fasciite nécrosante, syndrome de choc toxique streptococcique, RAA, GNA post-streptococcique.",
    antibiotherapie: "Pénicilline/amoxicilline (1er choix, toujours sensible). Macrolides si allergie (vérifier sensibilité).",
    sites: ["orl", "peau", "cardiovasculaire", "genital"],
    frequence: { orl: "fréquent", peau: "fréquent", cardiovasculaire: "occasionnel", genital: "rare" },
    floreNormale: {},
    alertes: { urgence: true, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Streptococcus agalactiae", gram: "positif", morphologie: "coque", groupement: "chaînettes",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (petites colonies, β-hémolyse étroite)", "Milieu Granada (pigment orange)", "Chromogène GBS"],
    identification: "MALDI-TOF. Groupage Lancefield : groupe B. CAMP test +. Hippurate +.",
    resistancesNaturelles: "Aucune résistance aux β-lactamines",
    resistancesAcquises: ["Macrolides/clindamycine (erm, mef)", "Tétracyclines (fréquent)"],
    virulence: ["Capsule polysaccharidique", "Facteur CAMP", "Hémolysines"],
    clinique: "Infections néonatales (sepsis, méningite), infections urinaires de la femme enceinte, endométrite, infections cutanées du diabétique.",
    antibiotherapie: "Pénicilline/amoxicilline. Antibioprophylaxie per-partum si portage vaginal.",
    sites: ["genital", "snc", "cardiovasculaire", "urinaire", "peau"],
    frequence: { genital: "fréquent", snc: "occasionnel", cardiovasculaire: "occasionnel", urinaire: "occasionnel", peau: "occasionnel" },
    floreNormale: { genital: true },
    alertes: { urgence: true, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Enterococcus faecalis", gram: "positif", morphologie: "coque", groupement: "diplocoques ou courtes chaînettes",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (petites colonies, α ou non hémolytiques)", "Bile-esculine + (colonies noires)", "Gélose BEA"],
    identification: "MALDI-TOF. Bile-esculine +, NaCl 6.5% +, PYR +. Groupage Lancefield : groupe D.",
    resistancesNaturelles: "Céphalosporines, aminosides (bas niveau), clindamycine, cotrimoxazole",
    resistancesAcquises: ["Haut niveau aminosides (HNR)", "Vancomycine (VRE — vanA, vanB)"],
    virulence: ["Substance d'agrégation", "Gélatinase", "Cytolysine", "Biofilm"],
    clinique: "Infections urinaires nosocomiales, endocardites, infections intra-abdominales, bactériémies sur cathéter.",
    antibiotherapie: "Amoxicilline (si sensible). Endocardite : amoxicilline + gentamicine (synergie). VRE : linézolide, daptomycine.",
    sites: ["urinaire", "cardiovasculaire", "digestif"],
    frequence: { urinaire: "fréquent", cardiovasculaire: "occasionnel", digestif: "fréquent" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Enterococcus faecium", gram: "positif", morphologie: "coque", groupement: "diplocoques ou courtes chaînettes",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (petites colonies)", "Bile-esculine +", "Chromogène VRE"],
    identification: "MALDI-TOF. Bile-esculine +, NaCl 6.5% +. Différenciation de E. faecalis par MALDI-TOF ou biochimie.",
    resistancesNaturelles: "Céphalosporines, aminosides (bas niveau), souvent ampicilline-R (PLP5 altérée)",
    resistancesAcquises: ["Ampicilline (très fréquent)", "Vancomycine (VRE plus fréquent que E. faecalis)", "Haut niveau aminosides"],
    virulence: ["Biofilm", "Adhésines (Esp)"],
    clinique: "Infections nosocomiales : bactériémies, infections urinaires. Problématique VRE majeure en milieu hospitalier.",
    antibiotherapie: "Souvent multi-résistant. Linézolide, daptomycine, tigécycline. Avis infectiologique recommandé.",
    sites: ["urinaire", "cardiovasculaire", "digestif"],
    frequence: { urinaire: "occasionnel", cardiovasculaire: "occasionnel", digestif: "fréquent" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  // ===== GRAM - BACILLES =====
  {
    nom: "Escherichia coli", gram: "négatif", morphologie: "bacille", groupement: "isolés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (colonies lisses, grises)", "MacConkey (lactose +, colonies roses)", "Chromogène (rose/violet selon marque)", "EMB (reflet métallique vert)"],
    identification: "MALDI-TOF (score >2.0). Indole +, lactose +, citrate -, H₂S -. API 20E / VITEK 2.",
    resistancesNaturelles: "Aucune notable",
    resistancesAcquises: ["BLSE (CTX-M surtout)", "Carbapénémases (rare mais en augmentation)", "Fluoroquinolones", "Cotrimoxazole"],
    virulence: ["Adhésines (fimbriae P, type 1)", "Toxines (EHEC: Shiga-toxine, ETEC: LT/ST)", "Capsule K1 (méningites néonatales)", "Sidérophores"],
    clinique: "Infections urinaires (80% des IU communautaires), bactériémies, méningites néonatales, diarrhées (EHEC, ETEC, EIEC), infections intra-abdominales.",
    antibiotherapie: "IU simple : fosfomycine, nitrofurantoïne, pivmécillinam. IU compliquée : selon antibiogramme. Bactériémie : céphalosporine 3G ou carbapénème si BLSE.",
    sites: ["urinaire", "cardiovasculaire", "digestif", "snc", "respiratoire", "genital"],
    frequence: { urinaire: "fréquent", cardiovasculaire: "fréquent", digestif: "fréquent", snc: "occasionnel", respiratoire: "occasionnel", genital: "occasionnel" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Klebsiella pneumoniae", gram: "négatif", morphologie: "bacille", groupement: "isolés, capsulés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (colonies muqueuses, bombées)", "MacConkey (lactose +, colonies muqueuses roses)"],
    identification: "MALDI-TOF. Lactose +, indole -, citrate +, uréase +, immobile (vs Enterobacter).",
    resistancesNaturelles: "Ampicilline (pénicillinase chromosomique), ticarcilline, pipéracilline",
    resistancesAcquises: ["BLSE (très fréquent)", "Carbapénémases (KPC, NDM, OXA-48)", "Colistine-R (mcr)"],
    virulence: ["Capsule épaisse (hypermucoviscosité pour souches hypervirulentes)", "Sidérophores", "LPS"],
    clinique: "Pneumonies nosocomiales, infections urinaires, bactériémies, abcès hépatiques (souches hypervirulentes K1/K2).",
    antibiotherapie: "Selon antibiogramme. BLSE : carbapénèmes. Carbapénémase : association (ceftazidime-avibactam, méropénème-vaborbactam). Avis expert.",
    sites: ["respiratoire", "urinaire", "cardiovasculaire", "digestif"],
    frequence: { respiratoire: "fréquent", urinaire: "fréquent", cardiovasculaire: "occasionnel", digestif: "occasionnel" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Pseudomonas aeruginosa", gram: "négatif", morphologie: "bacille", groupement: "isolés",
    aerobiose: "aérobie strict", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose sang (colonies plates, irisées, odeur de seringa/raisin)", "MacConkey (lactose -, colonies incolores)", "Cétrimide (sélectif)", "Production de pigments : pyocyanine (bleu-vert), pyoverdine (jaune-vert)"],
    identification: "MALDI-TOF. Oxydase +, aérobie strict, pigments caractéristiques, odeur fruitée. Non fermentant.",
    resistancesNaturelles: "Ampicilline, amoxicilline-ac.clav., C1G, C2G, céfotaxime, ertapénème, cotrimoxazole, tétracyclines",
    resistancesAcquises: ["Céphalosporinase déréprimée", "Carbapénémases (VIM, IMP, GES)", "Perte porine OprD (imipénème-R)", "Efflux (MexAB-OprM)"],
    virulence: ["Biofilm", "Exotoxine A", "Élastase", "Pyocyanine", "Alginate (souches mucoïdes, mucoviscidose)"],
    clinique: "Infections nosocomiales : pneumonies acquises sous VM, infections urinaires sur sonde, infections de brûlures, otites externes. Infections chroniques chez mucoviscidose.",
    antibiotherapie: "Pipéracilline-tazobactam, ceftazidime, céfépime, carbapénèmes (méropénème), aminosides, ciprofloxacine. Bithérapie souvent recommandée.",
    sites: ["respiratoire", "urinaire", "peau", "orl", "cardiovasculaire", "yeux"],
    frequence: { respiratoire: "fréquent", urinaire: "occasionnel", peau: "fréquent", orl: "occasionnel", cardiovasculaire: "occasionnel", yeux: "occasionnel" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Proteus mirabilis", gram: "négatif", morphologie: "bacille", groupement: "isolés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (essaimage caractéristique en vagues concentriques)", "MacConkey (lactose -, colonies incolores)", "Odeur caractéristique (poisson pourri)"],
    identification: "MALDI-TOF. Essaimage, uréase +, H₂S +, indole -, phénylalanine désaminase +.",
    resistancesNaturelles: "Colistine, nitrofurantoïne, tétracyclines",
    resistancesAcquises: ["BLSE (possible)", "Ampicilline-R (pénicillinase)"],
    virulence: ["Uréase (alcalinisation, calculs)", "Flagelles (essaimage, colonisation cathéters)", "Fimbriae MR/P"],
    clinique: "Infections urinaires (surtout compliquées, sur sonde, lithiases), infections de plaies.",
    antibiotherapie: "Amoxicilline-ac.clav., céphalosporines, cotrimoxazole. Attention : résistance naturelle à la colistine et nitrofurantoïne.",
    sites: ["urinaire", "peau"],
    frequence: { urinaire: "fréquent", peau: "occasionnel" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Enterobacter cloacae", gram: "négatif", morphologie: "bacille", groupement: "isolés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (colonies muqueuses)", "MacConkey (lactose + variable)"],
    identification: "MALDI-TOF. Mobile, citrate +, VP +, ADH +, lysine décarboxylase -.",
    resistancesNaturelles: "Ampicilline, amoxicilline-ac.clav., C1G, C2G (céphalosporinase AmpC inductible)",
    resistancesAcquises: ["Dérépression AmpC (résistance C3G)", "BLSE", "Carbapénémases (rare)"],
    virulence: ["Biofilm", "Capsule"],
    clinique: "Infections nosocomiales : pneumonies, bactériémies, infections urinaires, infections de plaies chirurgicales.",
    antibiotherapie: "Céfépime ou carbapénèmes (éviter C3G si AmpC déréprimée). Fluoroquinolones si sensible.",
    sites: ["respiratoire", "urinaire", "cardiovasculaire", "peau"],
    frequence: { respiratoire: "occasionnel", urinaire: "occasionnel", cardiovasculaire: "occasionnel", peau: "occasionnel" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Serratia marcescens", gram: "négatif", morphologie: "bacille", groupement: "isolés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (colonies parfois pigmentées en rouge, surtout à 25°C)", "MacConkey (lactose - lent)"],
    identification: "MALDI-TOF. DNase +, lipase +, gélatinase +. Pigment rouge (prodigiosine) inconstant.",
    resistancesNaturelles: "Ampicilline, amoxicilline-ac.clav., C1G, colistine",
    resistancesAcquises: ["Dérépression AmpC", "BLSE", "Carbapénémases"],
    virulence: ["Protéases", "Biofilm", "Pigment (prodigiosine)"],
    clinique: "Infections nosocomiales : pneumonies, bactériémies, infections urinaires, infections oculaires (kératites). Épidémies hospitalières.",
    antibiotherapie: "Carbapénèmes, céfépime, fluoroquinolones selon antibiogramme.",
    sites: ["respiratoire", "urinaire", "cardiovasculaire", "yeux"],
    frequence: { respiratoire: "occasionnel", urinaire: "occasionnel", cardiovasculaire: "rare", yeux: "rare" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Acinetobacter baumannii", gram: "négatif", morphologie: "coccobacille", groupement: "diplocoques ou courtes chaînettes",
    aerobiose: "aérobie strict", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (colonies lisses, convexes, non hémolytiques)", "MacConkey (lactose -, colonies incolores à rosées)"],
    identification: "MALDI-TOF. Oxydase -, non fermentant, immobile. Coccobacille pouvant mimer un Gram+ au Gram.",
    resistancesNaturelles: "Nombreuses résistances naturelles",
    resistancesAcquises: ["Pan-résistance fréquente (XDR, PDR)", "Carbapénémases (OXA-23, OXA-24, OXA-58)", "Colistine-R émergente"],
    virulence: ["Biofilm", "Survie prolongée sur surfaces sèches", "Capsule", "Porines OmpA"],
    clinique: "Infections nosocomiales sévères : pneumonies acquises sous VM, bactériémies, infections de plaies. Pathogène nosocomial majeur en réanimation.",
    antibiotherapie: "Souvent pan-résistant. Colistine, sulbactam à haute dose, tigécycline. Associations nécessaires. Avis infectiologique indispensable.",
    sites: ["respiratoire", "cardiovasculaire", "peau"],
    frequence: { respiratoire: "occasionnel", cardiovasculaire: "rare", peau: "occasionnel" },
    floreNormale: {},
    alertes: { urgence: true, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Salmonella spp.", gram: "négatif", morphologie: "bacille", groupement: "isolés",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["SS (colonies H₂S + à centre noir)", "XLD (colonies rouges à centre noir)", "Hektoen", "MacConkey (lactose -)"],
    identification: "MALDI-TOF. H₂S +, lactose -, lysine +, citrate +. Sérotypage (antigènes O et H). API 20E.",
    resistancesNaturelles: "Colistine-S",
    resistancesAcquises: ["Fluoroquinolones (souches invasives)", "C3G (BLSE — S. typhimurium)", "Ampicilline"],
    virulence: ["Invasion cellulaire (SPI-1, SPI-2)", "Survie intracellulaire", "Endotoxine (LPS)", "Flagelles"],
    clinique: "Gastro-entérites (S. non typhi), fièvre typhoïde (S. Typhi), bactériémies, ostéomyélites (drépanocytose).",
    antibiotherapie: "Gastro-entérite : pas d'antibiothérapie sauf terrain fragile. Formes invasives : ceftriaxone ou fluoroquinolones.",
    sites: ["digestif", "cardiovasculaire"],
    frequence: { digestif: "fréquent", cardiovasculaire: "rare" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Shigella spp.", gram: "négatif", morphologie: "bacille", groupement: "isolés, immobiles",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["SS (colonies incolores, H₂S -)", "XLD (colonies incolores)", "MacConkey (lactose -)"],
    identification: "MALDI-TOF. Immobile, H₂S -, lactose -, lysine -, gaz -. Très proche de E. coli (génétiquement).",
    resistancesNaturelles: "Colistine (certaines espèces)",
    resistancesAcquises: ["Ampicilline", "Cotrimoxazole", "Fluoroquinolones (croissant)", "C3G (BLSE, rare)"],
    virulence: ["Invasion cellulaire (ipa genes)", "Shiga-toxine (S. dysenteriae)", "Endotoxine"],
    clinique: "Shigellose : dysenterie bacillaire avec fièvre, crampes, selles glairo-sanglantes. Très contagieuse (inoculum faible 10-100 bactéries).",
    antibiotherapie: "Azithromycine, ciprofloxacine, ceftriaxone selon antibiogramme. Hydratation.",
    sites: ["digestif"],
    frequence: { digestif: "occasionnel" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  // ===== GRAM - COQUES =====
  {
    nom: "Neisseria meningitidis", gram: "négatif", morphologie: "coque", groupement: "diplocoques en grains de café",
    aerobiose: "aérobie strict", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose chocolat + supplément (Polyvitex)", "Gélose sang + CO₂ 5%", "Bactérie fragile, exigeante"],
    identification: "MALDI-TOF. Oxydase +, catalase +, glucose + maltose +. Diplocoques Gram- intracellulaires au Gram direct du LCR.",
    resistancesNaturelles: "Colistine, vancomycine, lincosamides",
    resistancesAcquises: ["Pénicilline I/R (altération PLP2)", "Rarement : ciprofloxacine-R"],
    virulence: ["Capsule polysaccharidique (sérogroupes A, B, C, W135, Y)", "Pili", "Endotoxine (LOS)", "IgA protéase"],
    clinique: "Méningite purulente (urgence), méningococcémie, purpura fulminans. Portage nasopharyngé asymptomatique fréquent.",
    antibiotherapie: "Ceftriaxone (urgence). Chimioprophylaxie des contacts : rifampicine ou ciprofloxacine dose unique.",
    sites: ["snc", "cardiovasculaire", "orl"],
    frequence: { snc: "fréquent", cardiovasculaire: "occasionnel", orl: "fréquent" },
    floreNormale: { orl: true },
    alertes: { urgence: true, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Neisseria gonorrhoeae", gram: "négatif", morphologie: "coque", groupement: "diplocoques en grains de café",
    aerobiose: "aérobie strict", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose chocolat + Polyvitex + VCN (sélectif)", "Thayer-Martin", "Bactérie très fragile"],
    identification: "MALDI-TOF. Oxydase +, glucose + maltose -. PCR +++. Diplocoques Gram- intracellulaires (PNN).",
    resistancesNaturelles: "Colistine, vancomycine, lincosamides",
    resistancesAcquises: ["Pénicilline (pénicillinase TEM)", "Ciprofloxacine (très fréquent)", "Ceftriaxone (résistance émergente, surveillance mondiale)", "Azithromycine"],
    virulence: ["Pili (variation antigénique)", "Protéine Opa", "IgA protéase", "LOS"],
    clinique: "Urétrite, cervicite, salpingite, arthrite septique gonococcique, ophtalmie néonatale, pharyngite, anorectite.",
    antibiotherapie: "Ceftriaxone 1g IM dose unique (+ azithromycine selon recommandations locales). Toujours traiter Chlamydia en co-infection.",
    sites: ["genital", "orl", "yeux", "os_articulations"],
    frequence: { genital: "fréquent", orl: "rare", yeux: "rare", os_articulations: "rare" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Moraxella catarrhalis", gram: "négatif", morphologie: "coque", groupement: "diplocoques",
    aerobiose: "aérobie strict", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose sang (colonies lisses, en 'palet de hockey')", "Gélose chocolat"],
    identification: "MALDI-TOF. Oxydase +, catalase +. DNase +. Tributyrine +.",
    resistancesNaturelles: "Triméthoprime",
    resistancesAcquises: ["β-lactamase (BRO-1, BRO-2) — >90% des souches"],
    virulence: ["Adhésines (UspA)", "BRO β-lactamase", "LOS"],
    clinique: "Otites moyennes (enfant), sinusites, surinfections de BPCO, pneumonies (rare).",
    antibiotherapie: "Amoxicilline-ac.clav. (quasi toutes β-lactamase +). Macrolides, C2G/C3G.",
    sites: ["orl", "respiratoire"],
    frequence: { orl: "fréquent", respiratoire: "occasionnel" },
    floreNormale: { orl: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  // ===== GRAM + BACILLES =====
  {
    nom: "Listeria monocytogenes", gram: "positif", morphologie: "bacille", groupement: "isolés ou courtes chaînettes, petits bacilles",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (petites colonies, β-hémolyse étroite)", "Enrichissement au froid (+4°C)"],
    identification: "MALDI-TOF. Mobilité en 'culbuto' à 25°C (tumbling motility). Catalase +, esculine +. CAMP test + (en flèche avec S. aureus).",
    resistancesNaturelles: "Céphalosporines (toutes), fosfomycine",
    resistancesAcquises: ["Très rares"],
    virulence: ["Listériolysine O (LLO)", "InlA/InlB (internalines)", "ActA (mouvement intracellulaire)", "Survie intracellulaire"],
    clinique: "Méningite/méningo-encéphalite (immunodéprimés, nouveaux-nés, personnes âgées), septicémie, infection materno-fœtale. Contamination alimentaire.",
    antibiotherapie: "Amoxicilline + gentamicine (synergie). JAMAIS de céphalosporines (résistance naturelle). Cotrimoxazole si allergie.",
    sites: ["snc", "cardiovasculaire", "genital", "digestif"],
    frequence: { snc: "occasionnel", cardiovasculaire: "rare", genital: "rare", digestif: "rare" },
    floreNormale: {},
    alertes: { urgence: true, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Corynebacterium spp.", gram: "positif", morphologie: "bacille", groupement: "palissade, lettres chinoises",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (petites colonies)", "Tinsdale (C. diphtheriae)", "Löffler"],
    identification: "MALDI-TOF. Bacilles à Gram positif en palissade ou lettres chinoises. Catalase +. API Coryne.",
    resistancesNaturelles: "Variables selon espèce",
    resistancesAcquises: ["β-lactamines (certaines espèces)", "Macrolides"],
    virulence: ["Toxine diphtérique (C. diphtheriae uniquement)", "Biofilm (C. striatum)"],
    clinique: "C. diphtheriae : diphtérie. Autres : souvent contaminants. C. striatum/jeikeium : infections nosocomiales sur matériel, bactériémies.",
    antibiotherapie: "C. diphtheriae : pénicilline + antitoxine. Autres : vancomycine si multi-résistant. Selon antibiogramme.",
    sites: ["orl", "peau", "cardiovasculaire"],
    frequence: { orl: "occasionnel", peau: "fréquent", cardiovasculaire: "rare" },
    floreNormale: { peau: true, orl: true },
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Clostridioides difficile", gram: "positif", morphologie: "bacille", groupement: "isolés, sporulés",
    aerobiose: "anaérobie strict", sporulation: true, catalase: false, oxydase: false, coagulase: false,
    milieux: ["CCFA (cycloserine-cefoxitin-fructose agar)", "Gélose sang en anaérobiose", "Colonies à odeur de crottin de cheval"],
    identification: "MALDI-TOF. Test de toxines (GDH + toxines A/B, algorithme en 2 étapes). PCR tcdB. Culture toxigénique.",
    resistancesNaturelles: "La plupart des antibiotiques (problème : antibiotiques = facteur de risque)",
    resistancesAcquises: ["Fluoroquinolones (souches hypervirulentes ribotype 027)", "Rifampicine"],
    virulence: ["Toxine A (TcdA, entérotoxine)", "Toxine B (TcdB, cytotoxine)", "Toxine binaire CDT (souches hypervirulentes)", "Spores (persistance environnementale)"],
    clinique: "Colite pseudomembraneuse, diarrhées post-antibiotiques, mégacôlon toxique. Premier agent de diarrhées nosocomiales.",
    antibiotherapie: "Vancomycine PO ou fidaxomicine (épisode initial non sévère). Métronidazole PO si vancomycine non disponible. Fidaxomicine pour récidives. Transplantation fécale si récidives multiples.",
    sites: ["digestif"],
    frequence: { digestif: "fréquent" },
    floreNormale: {},
    alertes: { urgence: true, bsl3: false, declaration: true },
    images: []
  },
  // ===== ANAÉROBIES =====
  {
    nom: "Bacteroides fragilis", gram: "négatif", morphologie: "bacille", groupement: "isolés, pléomorphes",
    aerobiose: "anaérobie strict", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang + vitamine K + hémine (anaérobiose)", "BBE (bile-esculine pour Bacteroides)"],
    identification: "MALDI-TOF. Anaérobie strict, bile-résistant (caractéristique), catalase +. API 20A / VITEK ANC.",
    resistancesNaturelles: "Aminosides, vancomycine",
    resistancesAcquises: ["Pénicillines (β-lactamase quasi universelle)", "Clindamycine (20-30%)", "Carbapénémases (CfiA, rare)"],
    virulence: ["Capsule polysaccharidique", "Fragilysine (toxine)", "BFT (Bacteroides fragilis toxin)", "Biofilm"],
    clinique: "Infections intra-abdominales (péritonites, abcès), infections pelviennes, bactériémies, abcès cérébraux. Anaérobie pathogène le plus fréquent.",
    antibiotherapie: "Métronidazole, pipéracilline-tazobactam, carbapénèmes. Amoxicilline-ac.clav. (si sensible). Clindamycine (vérifier sensibilité).",
    sites: ["digestif", "genital", "cardiovasculaire"],
    frequence: { digestif: "fréquent", genital: "occasionnel", cardiovasculaire: "rare" },
    floreNormale: { digestif: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Clostridium perfringens", gram: "positif", morphologie: "bacille", groupement: "isolés, gros bacilles sporulés",
    aerobiose: "anaérobie strict", sporulation: true, catalase: false, oxydase: false, coagulase: false,
    milieux: ["Gélose sang (double hémolyse caractéristique)", "TSN (tryptose-sulfite-néomycine)", "Colonies en 'cible'"],
    identification: "MALDI-TOF. Double hémolyse (α + β), lécithinase + (test de Nagler), immobile (rare chez Clostridium). Gros bacilles Gram+ au Gram.",
    resistancesNaturelles: "Aminosides",
    resistancesAcquises: ["Tétracyclines", "Clindamycine (variable)"],
    virulence: ["α-toxine (lécithinase C, nécrosante)", "Entérotoxine CPE", "Nombreuses toxines (15+ toxines)", "Spores thermorésistantes"],
    clinique: "Gangrène gazeuse (myonécrose), TIAC (entérotoxine), entérocolite nécrosante, infections des tissus mous, bactériémies.",
    antibiotherapie: "Pénicilline G + clindamycine (inhibition de la synthèse de toxines). Débridement chirurgical essentiel pour gangrène gazeuse.",
    sites: ["peau", "digestif", "genital"],
    frequence: { peau: "occasionnel", digestif: "occasionnel", genital: "rare" },
    floreNormale: { digestif: true },
    alertes: { urgence: true, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Cutibacterium acnes", gram: "positif", morphologie: "bacille", groupement: "isolés, fins, pléomorphes",
    aerobiose: "anaérobie strict", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Gélose sang en anaérobiose (croissance lente, 5-7 jours)", "Incubation prolongée nécessaire"],
    identification: "MALDI-TOF. Anaérobie strict, croissance lente. Catalase +, indole +. Ancien nom : Propionibacterium acnes.",
    resistancesNaturelles: "Métronidazole",
    resistancesAcquises: ["Macrolides (topiques)", "Tétracyclines (rare)"],
    virulence: ["Lipase", "Biofilm", "Inflammation chronique"],
    clinique: "Acné vulgaire. Infections sur matériel (prothèses articulaires, dérivations ventriculaires, implants mammaires). Contaminant fréquent d'hémocultures. Endocardite (rare).",
    antibiotherapie: "Pénicilline/amoxicilline (sensible). Clindamycine. Durée prolongée si infection sur matériel.",
    sites: ["peau", "os_articulations", "snc", "cardiovasculaire"],
    frequence: { peau: "fréquent", os_articulations: "occasionnel", snc: "rare", cardiovasculaire: "rare" },
    floreNormale: { peau: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  // ===== AUTRES =====
  {
    nom: "Haemophilus influenzae", gram: "négatif", morphologie: "coccobacille", groupement: "isolés, pléomorphes",
    aerobiose: "aéro-anaérobie facultatif", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose chocolat (facteurs X = hémine et V = NAD nécessaires)", "Ne pousse PAS sur gélose sang (sauf autour de S. aureus = satellitisme)"],
    identification: "MALDI-TOF. Exigence en facteurs X et V. Satellitisme autour de S. aureus sur gélose sang.",
    resistancesNaturelles: "Aucune notable",
    resistancesAcquises: ["β-lactamase TEM (15-30% des souches)", "BLNAR (altération PLP3, ampicilline-R sans β-lactamase)"],
    virulence: ["Capsule (type b surtout)", "IgA protéase", "LOS", "Adhésines"],
    clinique: "Otites moyennes, sinusites, surinfections de BPCO, pneumonies, méningites (type b, rare depuis vaccination), épiglottite, conjonctivites.",
    antibiotherapie: "Amoxicilline-ac.clav. (si β-lactamase +). Amoxicilline (si sensible). C3G pour méningites.",
    sites: ["orl", "respiratoire", "snc", "yeux"],
    frequence: { orl: "fréquent", respiratoire: "fréquent", snc: "rare", yeux: "fréquent" },
    floreNormale: { orl: true, respiratoire: true },
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Campylobacter jejuni", gram: "négatif", morphologie: "bacille", groupement: "spiralés, en 'S' ou 'ailes de mouette'",
    aerobiose: "microaérophile", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose sang + Campylosel (sélectif, 42°C)", "Karmali", "Skirrow", "Incubation microaérophile (5% O₂, 10% CO₂)"],
    identification: "MALDI-TOF. Oxydase +, catalase +, mobilité en vrille, croissance à 42°C. Aspect en ailes de mouette au Gram.",
    resistancesNaturelles: "Céphalosporines, vancomycine, triméthoprime",
    resistancesAcquises: ["Fluoroquinolones (30-60%)", "Tétracyclines", "Macrolides (rare mais problématique)"],
    virulence: ["Invasion cellulaire", "Toxine CDT (cytolethal distending toxin)", "Flagelles", "LOS (mimétisme moléculaire → Guillain-Barré)"],
    clinique: "Gastro-entérite aiguë (1ère cause bactérienne dans pays développés), diarrhée sanglante, douleurs abdominales. Complications : Guillain-Barré, arthrites réactionnelles.",
    antibiotherapie: "Pas d'antibiothérapie si forme simple. Azithromycine si sévère ou terrain fragile. Fluoroquinolones déconseillées (résistance élevée).",
    sites: ["digestif"],
    frequence: { digestif: "fréquent" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: true },
    images: []
  },
  {
    nom: "Helicobacter pylori", gram: "négatif", morphologie: "bacille", groupement: "spiralés, incurvés",
    aerobiose: "microaérophile", sporulation: false, catalase: true, oxydase: true, coagulase: false,
    milieux: ["Gélose sang ou chocolat + antibiotiques (sélectif)", "Incubation microaérophile, 37°C, 3-7 jours", "Croissance lente"],
    identification: "MALDI-TOF. Uréase +++, oxydase +, catalase +. Biopsie gastrique : test rapide à l'uréase, histologie. Test respiratoire à l'urée ¹³C.",
    resistancesNaturelles: "Céphalosporines, vancomycine",
    resistancesAcquises: ["Clarithromycine (20-30%, problème majeur)", "Métronidazole (30-40%)", "Lévofloxacine", "Amoxicilline (rare)"],
    virulence: ["Uréase (neutralisation acidité)", "CagA (îlot de pathogénicité cag)", "VacA (vacuolating cytotoxin)", "Flagelles (mobilité dans le mucus)"],
    clinique: "Gastrite chronique, ulcères gastro-duodénaux, lymphome du MALT, adénocarcinome gastrique. Infection très fréquente (50% population mondiale).",
    antibiotherapie: "Trithérapie guidée par antibiogramme : IPP + amoxicilline + clarithromycine (ou métronidazole). Quadrithérapie bismuthée si résistance clarithromycine.",
    sites: ["digestif"],
    frequence: { digestif: "fréquent" },
    floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: false },
    images: []
  },
  {
    nom: "Mycobacterium tuberculosis", gram: "positif", morphologie: "bacille", groupement: "isolés, BAAR (bacilles acido-alcoolo-résistants)",
    aerobiose: "aérobie strict", sporulation: false, catalase: true, oxydase: false, coagulase: false,
    milieux: ["Löwenstein-Jensen (colonies en chou-fleur, 3-8 semaines)", "Milieux liquides MGIT (BACTEC MGIT 960)", "Croissance très lente (temps de doublement 20h)"],
    identification: "MALDI-TOF (après extraction). PCR (GeneXpert MTB/RIF = test rapide de référence). Ziehl-Neelsen ou auramine (BAAR). Culture = gold standard.",
    resistancesNaturelles: "β-lactamines (BlaC), glycopeptides, macrolides classiques",
    resistancesAcquises: ["Isoniazide (katG, inhA)", "Rifampicine (rpoB)", "MDR-TB (isoniazide + rifampicine)", "XDR-TB (MDR + fluoroquinolone + 1 injectable)"],
    virulence: ["Paroi riche en acides mycoliques", "Survie intramacrophagique", "Cord factor", "ESAT-6/CFP-10 (sécrétion ESX-1)"],
    clinique: "Tuberculose pulmonaire (toux chronique, hémoptysies, sueurs nocturnes), tuberculose extra-pulmonaire (méningée, osseuse, ganglionnaire, urogénitale, miliaire).",
    antibiotherapie: "Quadrithérapie 2 mois (isoniazide + rifampicine + pyrazinamide + éthambutol) puis bithérapie 4 mois (isoniazide + rifampicine). Total 6 mois minimum.",
    sites: ["respiratoire", "snc", "os_articulations", "urinaire", "cardiovasculaire", "digestif"],
    frequence: { respiratoire: "fréquent", snc: "rare", os_articulations: "rare", urinaire: "rare", cardiovasculaire: "rare", digestif: "rare" },
    floreNormale: {},
    alertes: { urgence: true, bsl3: true, declaration: true },
    images: []
  }
];

// ===== QUIZ CASES =====
window.BACTERIOMAP_DATA.quiz = [
  {
    titre: "Infection urinaire communautaire",
    scenario: "Femme de 30 ans, brûlures mictionnelles, pollakiurie depuis 2 jours. Pas de fièvre. ECBU : >10⁵ UFC/mL, bacille Gram négatif, lactose +, indole +.",
    indices: ["Gram négatif", "Bacille", "Lactose +", "Indole +", "Urinaire"],
    reponse: "Escherichia coli",
    explication: "E. coli est responsable de ~80% des infections urinaires communautaires. L'association lactose +/indole + est très évocatrice. C'est le premier germe à évoquer devant une cystite simple de la femme jeune.",
    difficulte: "facile"
  },
  {
    titre: "Méningite purulente de l'adulte",
    scenario: "Homme de 22 ans, céphalées intenses, raideur de nuque, fièvre 39.5°C, purpura des membres inférieurs. LCR : trouble, 2500 leucocytes/mm³ (95% PNN), glycorachie effondrée. Gram direct : diplocoques Gram négatif intracellulaires.",
    indices: ["Gram négatif", "Diplocoques", "LCR purulent", "Purpura", "Intracellulaires"],
    reponse: "Neisseria meningitidis",
    explication: "Le tableau associant méningite purulente + purpura est très évocateur de méningocoque. Les diplocoques Gram négatif en grain de café intracellulaires sont caractéristiques. Urgence absolue : ceftriaxone immédiate et déclaration obligatoire.",
    difficulte: "facile"
  },
  {
    titre: "Diarrhée post-antibiotique",
    scenario: "Patient de 75 ans hospitalisé, sous ceftriaxone IV depuis 10 jours pour pneumonie. Apparition de diarrhées liquides profuses (>6 selles/jour), fièvre 38.2°C, douleurs abdominales. Leucocytose à 18 G/L.",
    indices: ["Antibiotiques récents", "Diarrhée nosocomiale", "Personne âgée", "Fièvre", "Anaérobie strict"],
    reponse: "Clostridioides difficile",
    explication: "La triade 'antibiothérapie récente + diarrhée nosocomiale + personne âgée' est classique pour C. difficile. Le diagnostic repose sur la recherche de GDH et toxines A/B dans les selles. La ceftriaxone est un antibiotique particulièrement à risque.",
    difficulte: "facile"
  },
  {
    titre: "Pneumonie nosocomiale en réanimation",
    scenario: "Patient de 60 ans intubé-ventilé depuis 8 jours en réanimation. Sécrétions bronchiques verdâtres, abondantes, avec odeur fruitée. Fièvre 39°C. Aspiration bronchique : bacilles Gram négatif, >10⁶ UFC/mL, oxydase +, non fermentant.",
    indices: ["Gram négatif", "Bacille", "Oxydase +", "Non fermentant", "Pigment vert", "Nosocomial"],
    reponse: "Pseudomonas aeruginosa",
    explication: "L'association bacille Gram négatif oxydase + non fermentant + pigment vert (pyocyanine) + odeur fruitée est pathognomonique de P. aeruginosa. C'est l'agent majeur des pneumonies acquises sous ventilation mécanique (PAVM).",
    difficulte: "moyen"
  },
  {
    titre: "Endocardite sur valve prothétique",
    scenario: "Patient de 68 ans, porteur d'une valve aortique mécanique depuis 3 mois. Fièvre intermittente depuis 2 semaines, asthénie. Hémocultures : coques Gram positif en amas, catalase +, coagulase -, biofilm fort. 3/4 hémocultures positives au même germe.",
    indices: ["Gram positif", "Coques en amas", "Catalase +", "Coagulase -", "Matériel prothétique", "Biofilm"],
    reponse: "Staphylococcus epidermidis",
    explication: "S. epidermidis (SCN) est la 1ère cause d'endocardite sur valve prothétique précoce (<1 an). La positivité de 3/4 hémocultures au même germe élimine la contamination. Le biofilm permet la colonisation du matériel. Traitement : vancomycine + rifampicine + gentamicine ± remplacement valvulaire.",
    difficulte: "moyen"
  },
  {
    titre: "Gastro-entérite de retour de voyage",
    scenario: "Femme de 28 ans, retour de Thaïlande il y a 3 jours. Diarrhée aqueuse puis sanglante, crampes abdominales, fièvre 38.5°C. Coproculture sur milieu sélectif à 42°C : bacilles Gram négatif spiralés, oxydase +, catalase +.",
    indices: ["Gram négatif", "Spiralé", "Oxydase +", "42°C", "Diarrhée sanglante", "Voyage"],
    reponse: "Campylobacter jejuni",
    explication: "Campylobacter jejuni est la première cause bactérienne de gastro-entérite dans les pays développés. La croissance à 42°C en microaérophilie et la morphologie spiralée sont caractéristiques. La résistance aux fluoroquinolones est fréquente, l'azithromycine est le traitement de choix si nécessaire.",
    difficulte: "moyen"
  },
  {
    titre: "Infection ostéo-articulaire sur prothèse",
    scenario: "Homme de 72 ans, prothèse totale de hanche posée il y a 1 an. Douleur croissante depuis 3 mois, pas de fièvre. Sonication du matériel : bacille Gram positif fin, anaérobie strict, croissance à J5, catalase +, indole +.",
    indices: ["Gram positif", "Bacille fin", "Anaérobie strict", "Croissance lente", "Catalase +", "Matériel prothétique"],
    reponse: "Cutibacterium acnes",
    explication: "C. acnes (ex-Propionibacterium acnes) est une cause fréquente d'infections chroniques sur matériel ostéo-articulaire, en particulier les prothèses d'épaule et de hanche. Sa croissance très lente (5-14 jours) nécessite une incubation prolongée. La sonication du matériel augmente considérablement la sensibilité de détection.",
    difficulte: "difficile"
  }
];



// ==================== GLOSSAIRE DES TERMES TECHNIQUES ====================
//
// Liste de termes techniques automatiquement soulignés dans les textes
// des fiches bactéries. Au survol, une info-bulle affiche la définition.
//
// POUR AJOUTER UN TERME :
//   'NOM_DU_TERME': 'Définition courte qui s\'affichera au survol.',
//
// POUR SUPPRIMER UN TERME :
//   Soit supprimer la ligne entière, soit la commenter avec // devant.
//
// ATTENTION à la casse : les termes sont cherchés tels quels.
//   'MRSA'  ne matche PAS  'mrsa'  ni  'Mrsa'.
// Si tu veux qu'un terme matche dans plusieurs casses, mets-le plusieurs fois.
//
// Les termes les plus longs sont cherchés en premier (ex: "β-lactamines" avant
// "β-lactamases") pour éviter les doubles soulignements.

window.BACTERIOMAP_DATA.glossaire = {

  // ===== Résistances aux antibiotiques =====
  'MRSA': "Methicillin-Resistant Staphylococcus aureus — S. aureus résistant à la méticilline par acquisition du gène mecA codant pour une PLP2a (PLP de faible affinité). Résistant à toutes les β-lactamines sauf ceftaroline/ceftobiprole. Isolement contact obligatoire.",
  'MSSA': "Methicillin-Sensitive Staphylococcus aureus — S. aureus sensible à la méticilline, traitement de choix = flucloxacilline/oxacilline.",
  'VRE': "Vancomycin-Resistant Enterococcus — entérocoque résistant à la vancomycine (gènes vanA, vanB). Isolement contact obligatoire. Option thérapeutique : linézolide, daptomycine.",
  'BLSE': "β-Lactamase à Spectre Étendu — enzyme hydrolysant les pénicillines et céphalosporines (C1G à C4G) et l'aztréonam. CTX-M-15 la plus fréquente. Carbapénèmes = traitement de référence. Isolement contact.",
  'ESBL': "Extended-Spectrum β-Lactamase — équivalent anglais de BLSE (β-lactamase à spectre étendu).",
  'BMR': "Bactérie Multi-Résistante — bactérie résistante à plusieurs familles d'antibiotiques. Inclut MRSA, VRE, BLSE. Mesures d'isolement contact recommandées.",
  'BHRe': "Bactérie Hautement Résistante émergente — inclut les EPC (Entérobactéries productrices de carbapénémases) et les ERV (Entérocoques résistants à la vancomycine). Isolement strict, dépistage des contacts.",
  'EPC': "Entérobactérie Productrice de Carbapénémase — hydrolyse les carbapénèmes (imipénème, méropénème). Types : KPC, NDM, OXA-48, VIM, IMP. Traitement complexe, avis infectiologique impératif.",
  'KPC': "Klebsiella pneumoniae Carbapenemase — carbapénémase de classe A, principale en Amérique. Inhibée par l'acide boronique et l'avibactam.",
  'NDM': "New Delhi Métallo-β-lactamase — carbapénémase de classe B (métallo-enzyme à zinc), endémique en Inde et Asie. Non inhibée par les inhibiteurs classiques de β-lactamases.",
  'OXA-48': "Carbapénémase de classe D, endémique au Maghreb et en Turquie. Hydrolyse faiblement les carbapénèmes, souvent associée à une BLSE.",
  'AmpC': "Céphalosporinase chromosomique ou plasmidique. Hydrolyse pénicillines, C1G, C2G, C3G. Carbapénèmes et céfépime restent efficaces. Inductible chez Enterobacter, Citrobacter freundii, Serratia.",
  'VISA': "Vancomycin-Intermediate Staphylococcus aureus — S. aureus de sensibilité diminuée à la vancomycine (CMI 4-8 mg/L). Mécanisme : épaississement de la paroi.",
  'VRSA': "Vancomycin-Resistant Staphylococcus aureus — rare, CMI ≥16 mg/L, acquisition du gène vanA depuis les entérocoques.",
  'PLP': "Protéine de Liaison aux Pénicillines — cibles enzymatiques des β-lactamines, impliquées dans la synthèse du peptidoglycane.",
  'PLP2a': "Protéine de Liaison aux Pénicillines 2a — PLP de faible affinité codée par mecA, responsable de la résistance à la méticilline chez MRSA.",

  // ===== Facteurs de virulence et toxines =====
  'PVL': "Leucocidine de Panton-Valentine — toxine formant des pores dans les leucocytes. Marqueur de virulence chez certaines souches de S. aureus (MRSA communautaire). Associée aux infections cutanées récidivantes et pneumonies nécrosantes graves.",
  'TSST-1': "Toxic Shock Syndrome Toxin-1 — superantigène de S. aureus responsable du syndrome de choc toxique staphylococcique (historiquement lié aux tampons).",
  'LPS': "LipoPolySaccharide — endotoxine de la membrane externe des bactéries Gram négatif. Déclencheur majeur du choc septique.",
  'biofilm': "Communauté bactérienne adhérente à une surface, englobée dans une matrice extracellulaire. Réduit drastiquement l'efficacité des antibiotiques et du système immunitaire. Problème majeur sur matériel prothétique.",
  'SpeA': "Streptococcal Pyrogenic Exotoxin A — superantigène de S. pyogenes responsable de la scarlatine et du syndrome de choc toxique streptococcique.",
  'SpeB': "Streptococcal Pyrogenic Exotoxin B — cysteine-protéase sécrétée par S. pyogenes, impliquée dans l'invasion tissulaire et la fasciite nécrosante.",
  'pyocyanine': "Pigment bleu-vert produit par Pseudomonas aeruginosa, responsable de la coloration caractéristique des cultures et sécrétions (odeur fruitée). Facteur de virulence et marqueur d'identification.",
  'Shiga-toxine': "Toxine produite par certaines souches d'E. coli (EHEC, dont O157:H7) et Shigella dysenteriae. Responsable du syndrome hémolytique et urémique (SHU).",

  // ===== Tests biochimiques =====
  'MALDI-TOF': "Matrix-Assisted Laser Desorption/Ionization Time-Of-Flight — spectrométrie de masse qui identifie les bactéries par leur profil protéique en quelques minutes. Méthode standard actuelle au laboratoire.",
  'DNase': "Désoxyribonucléase — enzyme qui dégrade l'ADN. Test différentiel pour S. aureus (DNase +).",
  'indole': "Test de recherche de l'indole produit à partir du tryptophane. E. coli est indole +, Klebsiella pneumoniae indole -.",
  'uréase': "Enzyme qui hydrolyse l'urée en ammoniac + CO₂. Positive chez Proteus, Helicobacter pylori, Klebsiella, Cryptococcus.",
  'optochine': "Test à l'optochine (éthylhydrocupréine) : sensibilité (zone ≥14mm) = Streptococcus pneumoniae. Résistance = autres streptocoques α-hémolytiques.",
  'Lancefield': "Classification sérologique des streptocoques β-hémolytiques par leur polyoside C. Groupe A = S. pyogenes, groupe B = S. agalactiae, groupe D = entérocoques.",
  'coagulase': "Enzyme qui coagule le plasma. Test clé : S. aureus coagulase +, autres staphylocoques (SCN) coagulase -.",
  'SCN': "Staphylocoque à Coagulase Négative — inclut S. epidermidis, S. haemolyticus, S. saprophyticus. Flore cutanée, contaminants fréquents d'hémocultures, mais pathogènes sur matériel.",

  // ===== Milieux de culture et colorations =====
  'β-hémolyse': "Hémolyse complète autour des colonies sur gélose sang : zone claire, transparente. Caractéristique de S. pyogenes, S. aureus, S. agalactiae.",
  'α-hémolyse': "Hémolyse incomplète : zone verdâtre autour des colonies (oxydation de l'hémoglobine). Caractéristique de S. pneumoniae et streptocoques viridans.",
  'Chapman': "Gélose sélective pour staphylocoques (riche en NaCl). Mannitol + (jaune) = S. aureus.",
  'MacConkey': "Gélose sélective pour bacilles Gram négatif. Lactose + = colonies roses (E. coli, Klebsiella). Lactose - = colonies incolores (Salmonella, Shigella, Proteus).",
  'CCFA': "Cefoxitine-Cycloserine Fructose Agar — milieu sélectif pour Clostridioides difficile en anaérobiose.",
  'Hektoen': "Gélose sélective pour Salmonella et Shigella (coprocultures).",

  // ===== Familles d'antibiotiques =====
  'β-lactamines': "Famille d'antibiotiques comprenant pénicillines, céphalosporines, carbapénèmes et monobactames. Mécanisme : inhibition des PLP, donc de la synthèse du peptidoglycane.",
  'aminosides': "Famille (gentamicine, amikacine, tobramycine) active sur Gram -. Synergie avec β-lactamines pour les infections sévères. Toxicité rénale et auditive.",
  'glycopeptides': "Famille (vancomycine, teicoplanine) active uniquement sur Gram +. Traitement de référence pour MRSA et SCN méti-R.",
  'fluoroquinolones': "Famille (ciprofloxacine, lévofloxacine, moxifloxacine) à large spectre. Cible : ADN gyrase et topoisomérase IV. Résistance en augmentation.",
  'carbapénèmes': "Imipénème, méropénème, ertapénème. Spectre très large, utilisés en dernier recours pour BLSE et infections graves.",
  'céphalosporines': "Famille dérivée des β-lactamines classée en générations (C1G à C5G) selon leur spectre. C3G (ceftriaxone, céfotaxime) très utilisée en milieu hospitalier.",

  // ===== Divers =====
  'nosocomial': "Infection acquise en milieu hospitalier (apparaissant ≥48h après l'admission ou dans les 30 jours suivant une chirurgie).",
  'communautaire': "Infection acquise hors de l'hôpital, dans la population générale.",
  'PSM': "Poste de Sécurité Microbiologique — enceinte à flux laminaire protégeant le manipulateur (classe II) ou l'environnement (classe III) lors du travail avec des pathogènes.",
  'antibiogramme': "Test de sensibilité d'une bactérie aux antibiotiques, réalisé en méthode diffusion (disques) ou dilution (CMI). Guide le traitement adapté après 24-48h.",
  'CMI': "Concentration Minimale Inhibitrice — plus faible concentration d'antibiotique qui inhibe la croissance visible d'une bactérie in vitro.",
  'EUCAST': "European Committee on Antimicrobial Susceptibility Testing — référentiel européen d'interprétation des antibiogrammes utilisé au CHUV.",
  'SARM': "Staphylococcus Aureus Résistant à la Méticilline — équivalent français de MRSA.",

};
