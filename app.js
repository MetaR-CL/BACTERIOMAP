/* ============================================================
   BACTERIOMAP — app.js
   Atlas bactériologique interactif par site anatomique
   CHUV Lausanne — Service de microbiologie
   ============================================================ */

// ==================== DATABASE ====================

const zonesData = {
  snc: {
    id: "snc", nom: "Système nerveux central", sousNom: "LCR / Méninges",
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
    commentaire: "Flore commensale abondante. Recherche ciblée de pathogènes (SGA, diphtérie, etc.)."
  },
  respiratoire: {
    id: "respiratoire", nom: "Voies respiratoires", sousNom: "Poumons / Bronches",
    description: "Prélèvements respiratoires hauts et bas. La qualité du prélèvement est essentielle (score de Bartlett pour les expectorations).",
    prelevements: ["Expectoration", "Aspiration bronchique", "LBA (lavage broncho-alvéolaire)", "Brosse protégée"],
    transport: "Acheminement rapide (< 2h). Ne pas réfrigérer les prélèvements pour culture de mycobactéries.",
    commentaire: "Contamination fréquente par la flore oropharyngée. Évaluation cytologique obligatoire pour les expectorations."
  },
  os_articulations: {
    id: "os_articulations", nom: "Os et articulations", sousNom: "Liquide articulaire / Biopsies osseuses",
    description: "Sites normalement stériles. Tout germe isolé est significatif. Prélèvements multiples recommandés (≥3-5 biopsies).",
    prelevements: ["Liquide articulaire (ponction)", "Biopsies osseuses peropératoires", "Sonication de matériel prothétique"],
    transport: "Acheminement immédiat. Flacons d'hémoculture pour liquide articulaire si suspicion d'infection.",
    commentaire: "Site stérile. Prélèvements multiples indispensables pour distinguer contaminant de pathogène (règle ≥2/5 positifs)."
  },
  cardiovasculaire: {
    id: "cardiovasculaire", nom: "Système cardiovasculaire", sousNom: "Hémocultures",
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
    id: "peau", nom: "Peau et tissus mous", sousNom: "Plaies, abcès, brûlures",
    description: "La peau possède une flore résidente riche. Interprétation en fonction du site, du type de prélèvement et du contexte clinique.",
    prelevements: ["Écouvillon de plaie (superficiel)", "Ponction d'abcès", "Biopsie tissulaire", "Prélèvement de brûlure"],
    transport: "Milieu de transport (Amies). Acheminement rapide. Ponction d'abcès en seringue capped.",
    commentaire: "Flore cutanée résidente abondante. Privilégier les prélèvements profonds (ponction, biopsie) aux écouvillons superficiels."
  },
  genital: {
    id: "genital", nom: "Système génital", sousNom: "Masculin / Féminin",
    description: "Flore vaginale dominée par les lactobacilles (flore de Döderlein). Recherche ciblée de pathogènes spécifiques.",
    prelevements: ["Écouvillon vaginal", "Écouvillon endocervical", "Écouvillon urétral", "Prélèvement de liquide prostatique"],
    transport: "Milieu de transport adapté. Acheminement rapide pour N. gonorrhoeae (fragile).",
    commentaire: "Flore vaginale riche dominée par les lactobacilles. Score de Nugent pour évaluer la flore. Recherche ciblée de pathogènes."
  }
};

const bacteriesData = [
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
const quizCases = [
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

// ==================== STATE ====================
let state = {
  currentView: 'home', // home, zone, detail, comparison, idtree, quiz, admin
  currentZone: null,
  currentBacteria: null,
  comparisonList: [],
  quizScore: { correct: 0, total: 0 },
  quizCurrentIndex: 0,
  quizAnswered: false,
  adminLoggedIn: false,
  adminTab: 'bacteries',
  adminEditingBacteria: null,
  idTreeFilters: { gram: null, morphologie: null, catalase: null, oxydase: null, aerobiose: null },
  searchQuery: '',
  filters: { gram: '', morphologie: '', aerobiose: '', catalase: '', oxydase: '' },
  theme: localStorage.getItem('bacteriomap-theme') || 'light'
};

// Load custom data from localStorage
let customBacteries = JSON.parse(localStorage.getItem('bacteriomap-bacteries') || 'null');
let customZones = JSON.parse(localStorage.getItem('bacteriomap-zones') || 'null');
let customQuiz = JSON.parse(localStorage.getItem('bacteriomap-quiz') || 'null');

function getBacteries() { return customBacteries || bacteriesData; }
function getZones() { return customZones || zonesData; }
function getQuiz() { return customQuiz || quizCases; }

function saveBacteries(data) { customBacteries = data; localStorage.setItem('bacteriomap-bacteries', JSON.stringify(data)); }
function saveZones(data) { customZones = data; localStorage.setItem('bacteriomap-zones', JSON.stringify(data)); }
function saveQuiz(data) { customQuiz = data; localStorage.setItem('bacteriomap-quiz', JSON.stringify(data)); }

// ==================== RENDERING ====================

function render() {
  const app = document.getElementById('app');
  document.documentElement.setAttribute('data-theme', state.theme);
  
  let html = renderHeader();
  
  switch(state.currentView) {
    case 'home': html += renderHome(); break;
    case 'zone': html += renderZone(); break;
    case 'detail': html += renderDetail(); break;
    case 'comparison': html += renderComparison(); break;
    case 'idtree': html += renderIdTree(); break;
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
      <div class="app-brand" role="link" tabindex="0" title="Retour \u00e0 l'accueil" aria-label="Retour \u00e0 l'accueil" onclick="navigate('home')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navigate('home');}">
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
  
  // Zone definitions with assigned accent colors for visual variety
  const zonesDef = [
    { id: 'snc',              label: 'SNC',          sub: 'LCR / Méninges',   color: '#8b5cf6' }, // violet
    { id: 'yeux',             label: 'Yeux',         sub: 'Conjonctive',      color: '#0ea5e9' }, // sky
    { id: 'orl',              label: 'ORL',          sub: 'Gorge · Sinus',    color: '#06b6d4' }, // cyan
    { id: 'respiratoire',     label: 'Respiratoire', sub: 'Poumons',          color: '#14b8a6' }, // teal
    { id: 'os_articulations', label: 'Os · Artic.',  sub: 'Articulations',    color: '#84cc16' }, // lime
    { id: 'cardiovasculaire', label: 'Cardiovasc.',  sub: 'Hémocultures',     color: '#ef4444' }, // red
    { id: 'digestif',         label: 'Digestif',     sub: 'Selles',           color: '#f59e0b' }, // amber
    { id: 'urinaire',         label: 'Urinaire',     sub: 'Urines',           color: '#eab308' }, // yellow
    { id: 'peau',             label: 'Peau',         sub: 'Plaies · Abcès',   color: '#f97316' }, // orange
    { id: 'genital',          label: 'Génital',      sub: 'Masc. · Fém.',     color: '#ec4899' }  // pink
  ];
  
  const cx = 400, cy = 400;
  const radius = 260;
  const bubbleR = 58;
  
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
      <g class="zone-bubble" data-zone="${z.id}" onclick="onZoneClick('${z.id}')" 
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
      <button class="pill-btn" onclick="navigate('idtree')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-10"/></svg>
        Arbre d'identification
      </button>
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
  if (!zone) return '<p>Zone non trouv\u00e9e</p>';
  
  const bacts = getBacteries();
  const pathogenes = bacts.filter(b => b.sites.includes(state.currentZone) && !b.floreNormale[state.currentZone]);
  const flore = bacts.filter(b => b.sites.includes(state.currentZone) && b.floreNormale[state.currentZone]);
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="navigate('home')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Vue anatomique
      </button>
    </div>
    <div class="zone-header">
      <h2>${zone.nom}</h2>
      <div class="zone-sous-nom">${zone.sousNom || ''}</div>
      <div class="zone-description">${zone.description}</div>
      <div class="zone-info-pills">
        ${(zone.prelevements||[]).map(p => `<span class="zone-info-pill">${p}</span>`).join('')}
      </div>
      ${zone.transport ? `<p class="text-muted mt-8" style="font-size:0.8rem"><strong>Transport :</strong> ${zone.transport}</p>` : ''}
      ${zone.commentaire ? `<p class="text-muted mt-8" style="font-size:0.8rem;font-style:italic">${zone.commentaire}</p>` : ''}
    </div>
    
    <div class="section-header">
      <h3>Pathog\u00e8nes</h3>
      <span class="badge-count">${pathogenes.length}</span>
    </div>
    <div class="bacteria-list">
      ${pathogenes.map(b => renderBacteriaItem(b, state.currentZone)).join('')}
      ${pathogenes.length === 0 ? '<p class="text-muted" style="padding:10px">Aucun pathog\u00e8ne r\u00e9f\u00e9renc\u00e9 pour cette zone.</p>' : ''}
    </div>
    
    <div class="section-header">
      <h3>Flore normale / commensale</h3>
      <span class="badge-count">${flore.length}</span>
    </div>
    <div class="bacteria-list">
      ${flore.map(b => renderBacteriaItem(b, state.currentZone)).join('')}
      ${flore.length === 0 ? '<p class="text-muted" style="padding:10px">Aucune flore commensale r\u00e9f\u00e9renc\u00e9e pour cette zone.</p>' : ''}
    </div>`;
}

function renderBacteriaItem(b, zoneId) {
  const freq = zoneId && b.frequence[zoneId] ? b.frequence[zoneId] : '';
  const isInComparison = state.comparisonList.includes(b.nom);
  return `
    <div class="bacteria-item" onclick="navigateDetail('${escapeHtml(b.nom)}')">
      <span class="bi-name">${b.nom}</span>
      <div class="bi-tags">
        <span class="tag tag-gram-${b.gram === 'positif' ? 'pos' : b.gram === 'négatif' ? 'neg' : 'var'}">Gram ${b.gram === 'positif' ? '+' : b.gram === 'négatif' ? '-' : '±'}</span>
        <span class="tag tag-morpho">${b.morphologie}</span>
        ${freq ? `<span class="tag tag-freq-${freq}">${freq}</span>` : ''}
        ${b.alertes.urgence ? '<span class="badge-alert badge-urgence">Urgence</span>' : ''}
        ${b.alertes.bsl3 ? '<span class="badge-alert badge-bsl3">BSL-3</span>' : ''}
        ${b.alertes.declaration ? '<span class="badge-alert badge-declaration">D\u00e9claration</span>' : ''}
      </div>
      <button class="btn btn-sm" onclick="event.stopPropagation();toggleComparison('${escapeHtml(b.nom)}')" style="${isInComparison?'color:var(--accent);border-color:var(--accent)':''}">${isInComparison ? '- Retirer' : '+ Comparer'}</button>
    </div>`;
}

function renderDetail() {
  const b = getBacteries().find(x => x.nom === state.currentBacteria);
  if (!b) return '<p>Bact\u00e9rie non trouv\u00e9e</p>';
  const zones = getZones();
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="${state.currentZone ? "navigate('zone')" : "navigate('home')"}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        ${state.currentZone ? 'Retour zone' : 'Vue anatomique'}
      </button>
    </div>
    <div class="detail-card">
      <h2>${b.nom}</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">
        <span class="tag tag-gram-${b.gram === 'positif' ? 'pos' : b.gram === 'négatif' ? 'neg' : 'var'}">Gram ${b.gram === 'positif' ? '+' : '-'}</span>
        <span class="tag tag-morpho">${b.morphologie}</span>
        ${b.alertes.urgence ? '<span class="badge-alert badge-urgence">Urgence clinique</span>' : ''}
        ${b.alertes.bsl3 ? '<span class="badge-alert badge-bsl3">BSL-3</span>' : ''}
        ${b.alertes.declaration ? '<span class="badge-alert badge-declaration">D\u00e9claration obligatoire</span>' : ''}
      </div>
      
      <div class="detail-grid">
        <div class="detail-field"><div class="df-label">Gram</div><div class="df-value">${b.gram}</div></div>
        <div class="detail-field"><div class="df-label">Morphologie</div><div class="df-value">${b.morphologie}</div></div>
        <div class="detail-field"><div class="df-label">Groupement</div><div class="df-value">${b.groupement}</div></div>
        <div class="detail-field"><div class="df-label">A\u00e9robiose</div><div class="df-value">${b.aerobiose}</div></div>
        <div class="detail-field"><div class="df-label">Sporulation</div><div class="df-value">${b.sporulation ? 'Oui' : 'Non'}</div></div>
        <div class="detail-field"><div class="df-label">Catalase</div><div class="df-value">${b.catalase ? '+' : '-'}</div></div>
        <div class="detail-field"><div class="df-label">Oxydase</div><div class="df-value">${b.oxydase ? '+' : '-'}</div></div>
        <div class="detail-field"><div class="df-label">Coagulase</div><div class="df-value">${b.coagulase ? '+' : '-'}</div></div>
      </div>
      
      ${b.images && b.images.length > 0 ? `
      <div class="detail-section">
        <h4>Images</h4>
        <div class="image-gallery">
          ${b.images.map((img, i) => `
            <div class="gallery-item" onclick="openLightbox('${escapeHtml(img.url)}','${escapeHtml(img.legende)}')">
              <img src="${img.url}" alt="${escapeHtml(img.legende)}" onerror="this.style.display='none'"/>
              <div class="gi-label">${escapeHtml(img.legende)}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
      
      <div class="detail-section">
        <h4>Milieux de culture</h4>
        <ul>${b.milieux.map(m => `<li>${m}</li>`).join('')}</ul>
      </div>
      
      <div class="detail-section">
        <h4>Identification au laboratoire</h4>
        <p>${b.identification}</p>
      </div>
      
      <div class="detail-section">
        <h4>R\u00e9sistances naturelles</h4>
        <p>${b.resistancesNaturelles}</p>
      </div>
      
      <div class="detail-section">
        <h4>R\u00e9sistances acquises</h4>
        <div class="tags-list">${(b.resistancesAcquises||[]).map(r => `<span class="tag-item">${r}</span>`).join('')}</div>
      </div>
      
      <div class="detail-section">
        <h4>Facteurs de virulence</h4>
        <div class="tags-list">${(b.virulence||[]).map(v => `<span class="tag-item">${v}</span>`).join('')}</div>
      </div>
      
      <div class="detail-section">
        <h4>Signification clinique</h4>
        <p>${b.clinique}</p>
      </div>
      
      <div class="detail-section">
        <h4>Antibioth\u00e9rapie probabiliste</h4>
        <p>${b.antibiotherapie}</p>
      </div>
      
      <div class="detail-section">
        <h4>Sites anatomiques</h4>
        <div class="site-links">
          ${b.sites.map(s => {
            const z = zones[s];
            return z ? `<span class="site-link" onclick="navigateZone('${s}')">${z.nom}${b.frequence[s] ? ' (' + b.frequence[s] + ')' : ''}${b.floreNormale[s] ? ' [flore]' : ''}</span>` : '';
          }).join('')}
        </div>
      </div>
    </div>`;
}

function renderComparison() {
  const bacts = getBacteries().filter(b => state.comparisonList.includes(b.nom));
  if (bacts.length < 2) return '<p class="text-muted">S\u00e9lectionnez au moins 2 bact\u00e9ries pour comparer.</p>';
  
  const fields = [
    { key: 'gram', label: 'Gram' },
    { key: 'morphologie', label: 'Morphologie' },
    { key: 'groupement', label: 'Groupement' },
    { key: 'aerobiose', label: 'A\u00e9robiose' },
    { key: 'sporulation', label: 'Sporulation', format: v => v ? 'Oui' : 'Non' },
    { key: 'catalase', label: 'Catalase', format: v => v ? '+' : '-' },
    { key: 'oxydase', label: 'Oxydase', format: v => v ? '+' : '-' },
    { key: 'coagulase', label: 'Coagulase', format: v => v ? '+' : '-' },
    { key: 'milieux', label: 'Milieux', format: v => (v||[]).join('<br>') },
    { key: 'resistancesNaturelles', label: 'R. naturelles' },
    { key: 'resistancesAcquises', label: 'R. acquises', format: v => (v||[]).join('<br>') },
    { key: 'clinique', label: 'Clinique' },
    { key: 'antibiotherapie', label: 'Traitement' }
  ];
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="navigate('home')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Retour
      </button>
      <button class="btn btn-sm" onclick="clearComparison()">Vider la comparaison</button>
    </div>
    <h2 style="font-size:1.1rem;margin-bottom:12px">Comparaison</h2>
    <div style="overflow-x:auto">
      <table class="comparison-table">
        <thead><tr><th>Caract\u00e9ristique</th>${bacts.map(b => `<th style="font-style:italic">${b.nom}</th>`).join('')}</tr></thead>
        <tbody>
          ${fields.map(f => `<tr><td style="font-weight:600">${f.label}</td>${bacts.map(b => {
            let val = b[f.key];
            if (f.format) val = f.format(val);
            return `<td>${val}</td>`;
          }).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderIdTree() {
  const f = state.idTreeFilters;
  const bacts = getBacteries().filter(b => {
    if (f.gram && b.gram !== f.gram) return false;
    if (f.morphologie && b.morphologie !== f.morphologie) return false;
    if (f.catalase !== null && b.catalase !== f.catalase) return false;
    if (f.oxydase !== null && b.oxydase !== f.oxydase) return false;
    if (f.aerobiose && b.aerobiose !== f.aerobiose) return false;
    return true;
  });
  
  return `
    <div class="nav-toolbar">
      <button class="btn btn-sm" onclick="navigate('home')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Retour
      </button>
      <button class="btn btn-sm" onclick="resetIdTree()">R\u00e9initialiser</button>
    </div>
    <h2 style="font-size:1.1rem;margin-bottom:16px">Arbre d'identification rapide</h2>
    
    <div class="id-tree-step">
      <h4>1. Coloration de Gram</h4>
      <div class="id-tree-options">
        <div class="id-tree-option ${f.gram==='positif'?'selected':''}" onclick="setIdFilter('gram','positif')">Gram +</div>
        <div class="id-tree-option ${f.gram==='négatif'?'selected':''}" onclick="setIdFilter('gram','n\u00e9gatif')">Gram -</div>
      </div>
    </div>
    
    <div class="id-tree-step">
      <h4>2. Morphologie</h4>
      <div class="id-tree-options">
        <div class="id-tree-option ${f.morphologie==='coque'?'selected':''}" onclick="setIdFilter('morphologie','coque')">Coque</div>
        <div class="id-tree-option ${f.morphologie==='bacille'?'selected':''}" onclick="setIdFilter('morphologie','bacille')">Bacille</div>
        <div class="id-tree-option ${f.morphologie==='coccobacille'?'selected':''}" onclick="setIdFilter('morphologie','coccobacille')">Coccobacille</div>
      </div>
    </div>
    
    <div class="id-tree-step">
      <h4>3. Catalase</h4>
      <div class="id-tree-options">
        <div class="id-tree-option ${f.catalase===true?'selected':''}" onclick="setIdFilter('catalase',true)">Catalase +</div>
        <div class="id-tree-option ${f.catalase===false?'selected':''}" onclick="setIdFilter('catalase',false)">Catalase -</div>
      </div>
    </div>
    
    <div class="id-tree-step">
      <h4>4. Oxydase</h4>
      <div class="id-tree-options">
        <div class="id-tree-option ${f.oxydase===true?'selected':''}" onclick="setIdFilter('oxydase',true)">Oxydase +</div>
        <div class="id-tree-option ${f.oxydase===false?'selected':''}" onclick="setIdFilter('oxydase',false)">Oxydase -</div>
      </div>
    </div>
    
    <div class="id-tree-step">
      <h4>5. A\u00e9robiose</h4>
      <div class="id-tree-options">
        <div class="id-tree-option ${f.aerobiose==='aérobie strict'?'selected':''}" onclick="setIdFilter('aerobiose','a\u00e9robie strict')">A\u00e9robie strict</div>
        <div class="id-tree-option ${f.aerobiose==='anaérobie strict'?'selected':''}" onclick="setIdFilter('aerobiose','ana\u00e9robie strict')">Ana\u00e9robie strict</div>
        <div class="id-tree-option ${f.aerobiose==='aéro-anaérobie facultatif'?'selected':''}" onclick="setIdFilter('aerobiose','a\u00e9ro-ana\u00e9robie facultatif')">Facultatif</div>
        <div class="id-tree-option ${f.aerobiose==='microaérophile'?'selected':''}" onclick="setIdFilter('aerobiose','microa\u00e9rophile')">Microa\u00e9rophile</div>
      </div>
    </div>
    
    <div class="id-tree-results">
      <div class="id-tree-result-count">${bacts.length} bact\u00e9rie(s) correspondante(s) sur ${getBacteries().length}</div>
      <div class="bacteria-list">
        ${bacts.map(b => renderBacteriaItem(b, null)).join('')}
      </div>
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
        <button class="admin-tab ${state.adminTab==='quiz'?'active':''}" onclick="state.adminTab='quiz';render()">Cas cliniques</button>
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
          <label>Gram</label>
          <select id="f-gram">
            <option value="positif" ${b.gram==='positif'?'selected':''}>Positif</option>
            <option value="n\u00e9gatif" ${b.gram==='négatif'?'selected':''}>N\u00e9gatif</option>
            <option value="variable" ${b.gram==='variable'?'selected':''}>Variable</option>
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
        <label>Antibioth\u00e9rapie</label>
        <textarea id="f-antibiotherapie">${escapeHtml(b.antibiotherapie)}</textarea>
      </div>
      
      <div class="form-group">
        <label>Sites anatomiques</label>
        <div class="zone-checkboxes">
          ${Object.entries(zones).map(([id, z]) => `
            <label class="zone-checkbox">
              <input type="checkbox" data-zone-id="${id}" ${b.sites.includes(id)?'checked':''}/>
              ${z.nom}
              <select class="zone-freq-select" data-freq-zone="${id}">
                <option value="fr\u00e9quent" ${(b.frequence||{})[id]==='fréquent'?'selected':''}>Fr\u00e9quent</option>
                <option value="occasionnel" ${(b.frequence||{})[id]==='occasionnel'?'selected':''}>Occasionnel</option>
                <option value="rare" ${(b.frequence||{})[id]==='rare'?'selected':''}>Rare</option>
              </select>
            </label>
          `).join('')}
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
    <h3 style="font-size:1rem;margin-bottom:12px">Zones anatomiques</h3>
    ${Object.entries(zones).map(([id, z]) => `
      <div class="detail-card" style="padding:16px;margin-bottom:12px">
        <h4 style="color:var(--accent)">${z.nom} <span class="text-muted text-mono" style="font-size:0.72rem">(${id})</span></h4>
        <div class="form-group mt-8">
          <label>Description</label>
          <textarea id="zone-desc-${id}" rows="2">${escapeHtml(z.description)}</textarea>
        </div>
        <div class="form-group">
          <label>Transport</label>
          <input type="text" id="zone-transport-${id}" value="${escapeHtml(z.transport || '')}"/>
        </div>
        <button class="btn btn-sm" onclick="saveZoneEdit('${id}')">Enregistrer</button>
      </div>
    `).join('')}`;
}

function renderAdminQuiz() {
  const cases = getQuiz();
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="font-size:1rem">${cases.length} cas cliniques</h3>
    </div>
    ${cases.map((c, i) => `
      <div class="detail-card" style="padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${c.titre}</strong>
          <span class="quiz-difficulty ${c.difficulte}">${c.difficulte}</span>
        </div>
        <p class="text-muted" style="font-size:0.82rem;margin-top:4px">${c.scenario.substring(0, 120)}...</p>
        <p style="font-size:0.82rem;margin-top:4px">R\u00e9ponse : <em>${c.reponse}</em></p>
      </div>
    `).join('')}`;
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
  if (view === 'home') { state.currentZone = null; state.currentBacteria = null; }
  render();
  window.scrollTo(0, 0);
}

function navigateZone(zoneId) {
  state.currentView = 'zone';
  state.currentZone = zoneId;
  render();
  window.scrollTo(0, 0);
}

function navigateDetail(nom) {
  state.currentView = 'detail';
  state.currentBacteria = nom;
  render();
  window.scrollTo(0, 0);
}

function onZoneClick(zoneId) {
  navigateZone(zoneId);
}

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
  localStorage.setItem('bacteriomap-theme', state.theme);
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

// ==================== ID TREE ====================

function setIdFilter(key, value) {
  if (state.idTreeFilters[key] === value) {
    state.idTreeFilters[key] = null;
  } else {
    state.idTreeFilters[key] = value;
  }
  render();
}

function resetIdTree() {
  state.idTreeFilters = { gram: null, morphologie: null, catalase: null, oxydase: null, aerobiose: null };
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
  if (answer === c.reponse) state.quizScore.correct++;
  render();
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
    nom: '', gram: 'positif', morphologie: 'coque', groupement: '', aerobiose: 'aéro-anaérobie facultatif',
    sporulation: false, catalase: false, oxydase: false, coagulase: false,
    milieux: [], identification: '', resistancesNaturelles: '', resistancesAcquises: [],
    virulence: [], clinique: '', antibiotherapie: '',
    sites: [], frequence: {}, floreNormale: {},
    alertes: { urgence: false, bsl3: false, declaration: false }, images: []
  };
}

function saveBacteriaForm(isNew) {
  const bacts = [...getBacteries()];
  const b = {};
  
  b.nom = document.getElementById('f-nom').value.trim();
  if (!b.nom) { alert('Le nom est obligatoire'); return; }
  
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
  
  // Sites & frequencies
  b.sites = [];
  b.frequence = {};
  b.floreNormale = {};
  document.querySelectorAll('[data-zone-id]').forEach(cb => {
    if (cb.checked) {
      const zid = cb.getAttribute('data-zone-id');
      b.sites.push(zid);
      const sel = document.querySelector(`[data-freq-zone="${zid}"]`);
      if (sel) b.frequence[zid] = sel.value;
    }
  });
  
  b.alertes = {
    urgence: document.getElementById('f-urgence').classList.contains('on'),
    bsl3: document.getElementById('f-bsl3').classList.contains('on'),
    declaration: document.getElementById('f-declaration').classList.contains('on')
  };
  
  // Preserve images from existing
  const existing = bacts.find(x => x.nom === state.adminEditingBacteria);
  b.images = existing ? existing.images : [];
  
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
  const z = { ...zones[id] };
  z.description = document.getElementById(`zone-desc-${id}`).value;
  z.transport = document.getElementById(`zone-transport-${id}`).value;
  zones[id] = z;
  saveZones(zones);
  alert('Zone enregistr\u00e9e');
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
