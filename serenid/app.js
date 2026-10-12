/* =========================================================
   Sérénid — application (vanilla JS)
   Site fictif réalisé dans le cadre d’un projet scolaire.
   Aucun appel réseau : panier, commande et formulaires sont simulés.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Utilitaires ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMQ = window.matchMedia('(min-width: 1000px)');
  const reduced = () => reduceMQ.matches;
  const hasGSAP = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animOK = () => hasGSAP() && !reduced();
  const round2 = (n) => Math.round(n * 100) / 100;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = (n) => {
    const v = round2(n);
    const d = Number.isInteger(v) ? 0 : 2;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  };
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible : on continue en mémoire */ } },
  };

  if (hasGSAP()) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    if (!reduced()) document.documentElement.classList.add('anim');
  } else {
    document.documentElement.classList.remove('anim');
  }

  /* ---------- Catalogue (prix provisoires) ---------- */
  const FREE_SHIP = 200;
  const SHIPPING = {
    relais: { label: 'Point relais', delay: '3 à 5 jours ouvrés', price: 4.9, freeable: true },
    domicile: { label: 'Domicile', delay: '2 à 3 jours ouvrés', price: 6.9, freeable: true },
    express: { label: 'Express', delay: '24 h ouvrées', price: 12.9, freeable: false },
  };
  const PROMOS = { BIENVENUE10: { rate: 0.1, label: 'BIENVENUE10 · −10 %' } };

  const FINISH = { label: 'Finition des Pastilles', options: [
    { id: 'coquille', name: 'Coquille', swatch: '#F7F5F1' },
    { id: 'brume', name: 'Brume', swatch: '#C9DBE6' },
  ] };

  const INSTALL = [
    ['Placez le Nid', 'À 1,6 – 2 m de hauteur, face à la pièce principale, branché en USB-C.'],
    ['Appairez', 'Scannez le QR code au dos du Nid avec l’application Sérénid.'],
    ['Collez les Pastilles', 'Dégraissez la surface, pressez 30 secondes, attendez une heure avant la première utilisation.'],
    ['Dessinez vos zones', 'Indiquez sur le plan les zones sensibles et le rayon d’approche souhaité.'],
    ['Testez', 'Approchez-vous de la zone, puis ouvrez avec la Clé Sérénid pour vérifier.'],
  ];

  const NID_SPECS = [
    ['Détection', 'Radar à ondes millimétriques 60 GHz, sans caméra ni micro'],
    ['Portée', '≈ 8 m, jusqu’à 60 m² dégagés par Nid'],
    ['Traitement', '100 % local, dans le boîtier'],
    ['Alimentation', 'USB-C 5 V + batterie de secours (≈ 8 h)'],
    ['Dimensions', '96 × 96 × 44 mm · 160 g'],
    ['Finition', 'Coque blanc coquille, voyant LED abricot'],
  ];
  const PASTILLE_SPECS = [
    ['Fixation', 'Adhésif haute tenue, sans perçage, retrait sans trace sur surfaces lisses'],
    ['Sécurité', 'Fail-secure : reste fermée en cas de panne'],
    ['Ouverture', 'Application, montre connectée ou Clé Sérénid magnétique'],
    ['Pile', 'CR2477 remplaçable, ≈ 2 ans, alerte à 20 %'],
    ['Dimensions', '58 × 34 × 14 mm'],
  ];
  const COMMON_SPECS = [
    ['Connectivité', 'Bluetooth Low Energy, Thread, Matter'],
    ['Conformité', 'Marquage CE, directive RED 2014/53/UE, RGPD'],
    ['Garantie', '2 ans'],
  ];

  const PRODUCTS = {
    'kit-famille': {
      id: 'kit-famille', name: 'Kit Famille', category: 'kits', order: 1, feature: true,
      price: round2(329 * 0.85), compareAt: 329, badges: [['-15 %', ''], ['Le plus choisi', 'encre']],
      short: '1 Nid, 10 Pastilles et 2 Clés pour une maison de plain-pied ou un grand appartement.',
      contents: { nids: 1, pastilles: 10, cles: 2 }, rating: 4.7, reviews: 486, variants: FINISH,
      gallery: ['kit', 'nid', 'scene', 'cle'],
      description: [
        'Le Kit Famille couvre les pièces de vie d’un logement sur un niveau : cuisine, salle de bain, entrée et fenêtres. Le Nid perçoit votre enfant, les Pastilles ne se ferment qu’à son approche.',
        'Deux Clés Sérénid sont incluses, pour les grands-parents et la personne qui garde votre enfant.',
      ],
      highlights: ['Couvre jusqu’à 60 m² sur un niveau', '10 zones sensibles sécurisées', 'Offre de lancement −15 %'],
      specs: [['Contenu', '1 Nid, 10 Pastilles, 2 Clés Sérénid, câble USB-C, adhésifs de rechange']].concat(NID_SPECS.slice(0, 4), PASTILLE_SPECS.slice(2, 4), COMMON_SPECS),
      faq: [
        ['10 Pastilles, est-ce suffisant ?', 'Pour un appartement familial ou une maison de plain-pied, c’est le cas le plus courant. Le Diagnostic de la maison vous le confirme en deux minutes.'],
        ['Puis-je ajouter des Pastilles plus tard ?', 'Oui, un Nid pilote jusqu’à 24 Pastilles. Elles s’ajoutent depuis l’application en quelques secondes.'],
      ],
    },
    'kit-decouverte': {
      id: 'kit-decouverte', name: 'Kit Découverte', category: 'kits', order: 2,
      price: 189, badges: [],
      short: '1 Nid, 4 Pastilles et 1 Clé : l’essentiel pour un appartement ou une première pièce.',
      contents: { nids: 1, pastilles: 4, cles: 1 }, rating: 4.6, reviews: 212, variants: FINISH,
      gallery: ['kit', 'nid', 'scene', 'pastille'],
      description: [
        'Le Kit Découverte réunit tout ce qu’il faut pour commencer : un Nid pour percevoir, quatre Pastilles pour les zones les plus sensibles et une Clé Sérénid pour vos proches.',
        'Idéal pour sécuriser d’abord la cuisine et la salle de bain, puis compléter au fil du temps avec des packs de Pastilles.',
      ],
      highlights: ['Couvre une pièce de vie et ses abords', 'Installation sans perçage', 'Application gratuite incluse'],
      specs: [['Contenu', '1 Nid, 4 Pastilles, 1 Clé Sérénid, câble USB-C']].concat(NID_SPECS.slice(0, 4), PASTILLE_SPECS.slice(2, 4), COMMON_SPECS),
      faq: [
        ['Est-ce adapté à une location ?', 'Oui. Rien n’est percé, et les Pastilles se retirent sans trace sur la plupart des surfaces lisses.'],
        ['Puis-je passer au Kit Famille ensuite ?', 'Il suffit d’ajouter un ou deux packs de 4 Pastilles : votre Nid les reconnaît immédiatement.'],
      ],
    },
    'kit-maison': {
      id: 'kit-maison', name: 'Kit Maison', category: 'kits', order: 3,
      price: 549, badges: [['2 étages', 'soft']],
      short: '2 Nids, 16 Pastilles et 3 Clés pour une maison sur deux niveaux, escalier compris.',
      contents: { nids: 2, pastilles: 16, cles: 3 }, rating: 4.5, reviews: 138, variants: FINISH,
      gallery: ['kit', 'nid', 'scene', 'cle'],
      description: [
        'Le Kit Maison place un Nid à chaque niveau. Ensemble, ils suivent votre enfant d’un étage à l’autre et sécurisent l’escalier, les salles de bain et les fenêtres.',
        'Trois Clés Sérénid sont incluses pour toute la famille élargie.',
      ],
      highlights: ['Deux niveaux couverts', 'Portillon d’escalier sécurisé', '16 zones sensibles'],
      specs: [['Contenu', '2 Nids, 16 Pastilles, 3 Clés Sérénid, 2 câbles USB-C, adhésifs de rechange']].concat(NID_SPECS.slice(0, 4), PASTILLE_SPECS.slice(2, 4), COMMON_SPECS),
      faq: [
        ['Les deux Nids communiquent-ils entre eux ?', 'Oui, via Thread. Le passage d’un étage à l’autre est continu sur la carte d’atteinte.'],
        ['Et pour trois niveaux ?', 'Ajoutez un Nid supplémentaire : le Diagnostic de la maison calcule la configuration adaptée.'],
      ],
    },
    'pastilles-4': {
      id: 'pastilles-4', name: 'Pack de 4 Pastilles', category: 'accessoires', order: 4,
      price: 59, badges: [],
      short: 'Quatre serrures adhésives supplémentaires pour placards, tiroirs, portes ou fenêtres.',
      contents: { pastilles: 4 }, rating: 4.4, reviews: 171, variants: FINISH,
      gallery: ['pastille', 'scene', 'pack'],
      description: [
        'Ajoutez des zones sensibles à votre installation. Chaque Pastille se colle sans perçage et ne se ferme qu’à l’approche de votre enfant.',
        'Conception fail-secure : en cas de coupure ou de pile faible, une Pastille verrouillée reste verrouillée.',
      ],
      highlights: ['Pose en 30 secondes', 'Pile ≈ 2 ans', 'Fail-secure'],
      specs: [['Contenu', '4 Pastilles, 4 adhésifs de rechange']].concat(PASTILLE_SPECS, COMMON_SPECS),
      faq: [
        ['Sur quelles surfaces coller les Pastilles ?', 'Surfaces lisses et propres : laqué, mélaminé, verre, métal peint. Sur bois brut, faites un test discret au préalable.'],
        ['Comment changer la pile ?', 'Le compartiment s’ouvre avec un petit tournevis fourni. L’application vous prévient à 20 %.'],
      ],
    },
    'nid': {
      id: 'nid', name: 'Nid supplémentaire', category: 'accessoires', order: 5,
      price: 99, badges: [],
      short: 'Un Nid de plus pour couvrir un étage, un sous-sol ou une grande pièce ouverte.',
      contents: { nids: 1 }, rating: 4.6, reviews: 94, variants: null,
      gallery: ['nid', 'nid-side'],
      description: [
        'Le Nid perçoit la position et le mouvement de votre enfant grâce à un radar 60 GHz. Aucune image, aucun son : un simple point sur votre plan.',
        'Ajoutez-en un par niveau ou pour une pièce de plus de 60 m².',
      ],
      highlights: ['Radar 60 GHz', 'Traitement 100 % local', 'Batterie de secours'],
      specs: NID_SPECS.concat(COMMON_SPECS),
      faq: [
        ['Où placer le Nid ?', 'À 1,6 – 2 m de hauteur, sur un mur dégagé face à la zone de vie. Évitez l’arrière d’un meuble.'],
        ['Le radar est-il sans risque ?', 'Le Nid émet à très faible puissance dans la bande 60 GHz, dans le respect des limites fixées par la directive européenne RED.'],
      ],
    },
    'cle': {
      id: 'cle', name: 'Clé Sérénid', category: 'accessoires', order: 6,
      price: 15, badges: [],
      short: 'La clé magnétique pour ouvrir sans téléphone : grands-parents, nounou, invités.',
      contents: { cles: 1 }, rating: 4.8, reviews: 63,
      variants: { label: 'Couleur', options: [
        { id: 'coquille', name: 'Coquille', swatch: '#F7F5F1' },
        { id: 'encre', name: 'Encre', swatch: '#1F3A4D' },
      ] },
      gallery: ['cle', 'scene'],
      description: [
        'Posée contre une Pastille, la Clé Sérénid l’ouvre immédiatement. Sans pile, sans appairage, sans code à retenir.',
        'Elle ouvre aussi en cas de coupure de courant : c’est le complément naturel de la conception fail-secure.',
      ],
      highlights: ['Aucune pile', 'Fonctionne sans réseau', 'Anneau porte-clés'],
      specs: [['Principe', 'Aimant encapsulé, reconnu par toutes les Pastilles'], ['Alimentation', 'Aucune'], ['Dimensions', '42 × 30 × 9 mm · 14 g'], ['Garantie', '2 ans']],
      faq: [
        ['Une Clé peut-elle être perdue sans risque ?', 'Elle n’ouvre que lorsqu’on la pose contre une Pastille, à hauteur d’adulte. Rangez-la hors de portée, comme une clé ordinaire.'],
      ],
    },
    'serenid-plus': {
      id: 'serenid-plus', name: 'Sérénid+', category: 'services', order: 7, recurring: true,
      price: 3.99, unit: '/mois', badges: [['Nouveau', 'soft']],
      short: 'Historique sur 12 mois, plusieurs domiciles et assistance prioritaire. Sans engagement.',
      contents: {}, rating: 4.3, reviews: 58, variants: null,
      gallery: ['plus', 'app'],
      description: [
        'L’application Sérénid est gratuite et complète. Sérénid+ ajoute ce qui sert aux familles qui veulent aller plus loin : historique long, rapports détaillés, plusieurs domiciles.',
        'Sans engagement : vous arrêtez quand vous voulez depuis l’application.',
      ],
      highlights: ['Historique 12 mois', 'Jusqu’à 3 domiciles', 'Assistance prioritaire'],
      specs: [['Prix', '3,99 € par mois, sans engagement'], ['Historique', '12 mois (contre 30 jours en gratuit)'], ['Rapports', 'Hebdomadaires et mensuels détaillés'], ['Domiciles', 'Jusqu’à 3 (vacances, grands-parents…)'], ['Assistance', 'Prioritaire, par chat et e-mail'], ['Garantie', 'Extension d’un an sur le matériel']],
      install: [['Ouvrez l’application', 'Rendez-vous dans Réglages, puis Sérénid+.'], ['Activez', 'L’option s’active immédiatement sur tous vos domiciles.'], ['Arrêtez quand vous voulez', 'Sans frais, depuis le même écran.']],
      faq: [
        ['L’application gratuite est-elle limitée ?', 'Non : carte d’atteinte, alertes, rapport hebdomadaire et déverrouillage progressif sont inclus gratuitement.'],
      ],
    },
  };

  /* ---------- Avis fictifs (plausibles) ---------- */
  const REVIEWS = [
    { p: 'kit-famille', r: 5, t: 'Elle explore, on souffle', x: 'Notre fille de 14 mois circule partout dans le salon. Seul le placard sous l’évier se ferme quand elle s’en approche. On ne reviendrait pas en arrière.', a: 'Camille R.', c: 'Tours', d: '12 sept. 2026', wide: true },
    { p: 'kit-decouverte', r: 5, t: 'Installation en vingt minutes', x: 'Les Pastilles tiennent bien sur nos placards laqués. L’appairage dans l’application est clair, même pour moi qui ne suis pas très technique.', a: 'Julien M.', c: 'Châteauroux', d: '3 oct. 2026' },
    { p: 'pastilles-4', r: 3, t: 'Adhésif à surveiller sur bois brut', x: 'Sur une porte en chêne non vernie, une Pastille s’est décollée au bout de trois semaines. L’assistance m’a envoyé des adhésifs de rechange rapidement, mais il faut vraiment bien dégraisser avant.', a: 'Sophie D.', c: 'Bourges', d: '28 août 2026' },
    { p: 'cle', r: 5, t: 'Pratique pour les grands-parents', x: 'Je n’ai pas de smartphone récent. Avec la Clé, j’ouvre le placard comme avant, sans chercher de code.', a: 'Monique L.', c: 'Issoudun', d: '19 sept. 2026' },
    { p: 'kit-famille', r: 4, t: 'Très bien, l’appli peut progresser', x: 'Le rapport hebdomadaire est une jolie idée. J’aimerais pouvoir renommer les pièces plus facilement et exporter l’historique.', a: 'Thomas B.', c: 'Orléans', d: '7 oct. 2026' },
    { p: 'nid', r: 4, t: 'Bien choisir l’emplacement', x: 'Au début, j’avais posé le Nid trop bas et il couvrait mal le couloir. Une fois remonté à 1,80 m comme conseillé, tout fonctionne comme prévu.', a: 'Inès K.', c: 'Limoges', d: '15 sept. 2026' },
    { p: 'kit-decouverte', r: 5, t: 'Enfin, pas de caméra', x: 'C’était notre critère numéro un. Savoir que rien ne filme dans la chambre de notre fils compte beaucoup pour nous.', a: 'Léa et Karim', c: 'Blois', d: '30 sept. 2026', wide: true },
    { p: 'kit-maison', r: 4, t: 'Un budget, mais cohérent', x: 'C’est un investissement pour une maison sur deux niveaux. Comparé à des barrières et bloqueurs pour toute la maison, l’écart est moins grand qu’on le pensait.', a: 'Antoine P.', c: 'Poitiers', d: '22 sept. 2026' },
    { p: 'pastilles-4', r: 4, t: 'Pile un peu longue à changer', x: 'Il faut un petit tournevis pour ouvrir le compartiment. Rien de compliqué, mais un clip aurait été plus simple.', a: 'Hugo F.', c: 'Tours', d: '9 sept. 2026' },
    { p: 'serenid-plus', r: 4, t: 'Utile pour la maison de vacances', x: 'Le multi-domicile nous sert chez les grands-parents l’été. Pour un seul logement, l’application gratuite suffit largement.', a: 'Nadia S.', c: 'Vierzon', d: '2 oct. 2026' },
    { p: 'kit-maison', r: 5, t: 'Les deux étages couverts', x: 'Le portillon de l’escalier se ferme quand notre fils s’en approche et reste ouvert pour nous le reste du temps. C’est ce que nous cherchions.', a: 'Mathieu G.', c: 'Angers', d: '11 oct. 2026' },
    { p: 'pastilles-4', r: 5, t: 'Discrètes', x: 'En finition Brume, elles se fondent sur nos meubles. Les invités ne les remarquent même pas.', a: 'Claire V.', c: 'Nevers', d: '26 sept. 2026' },
  ];

  /* ---------- FAQ ---------- */
  const FAQ = [
    ['Le produit', [
      ['Comment le Nid sait-il où se trouve mon enfant ?', 'Grâce à un radar à ondes millimétriques 60 GHz. Il mesure la distance, l’angle et la vitesse de ce qui bouge et en déduit une position, ainsi que la taille approximative de la silhouette.'],
      ['Le Nid fait-il la différence entre un adulte et un enfant ?', 'Oui, en se basant sur la taille de la silhouette et sa façon de se déplacer. Les adultes peuvent aussi être reconnus par leur téléphone ou leur montre, pour plus de précision.'],
      ['Combien de Pastilles un Nid peut-il piloter ?', 'Jusqu’à 24 Pastilles par Nid, et jusqu’à 4 Nids par domicile.'],
      ['Sérénid remplace-t-il la surveillance d’un adulte ?', 'Non. Sérénid est une aide pour aménager la maison : la présence et l’attention des adultes restent essentielles.'],
    ]],
    ['Installation', [
      ['Faut-il percer ?', 'Non. Le Nid se pose ou se fixe avec l’adhésif fourni, les Pastilles se collent. Tout se retire sans trace sur les surfaces lisses.'],
      ['Combien de temps prend l’installation ?', 'Comptez une vingtaine de minutes pour une première pièce, puis quelques minutes par Pastille.'],
      ['Est-ce compatible avec ma maison connectée ?', 'Sérénid est compatible Matter et Thread. Il fonctionne aussi parfaitement seul, sans autre équipement.'],
    ]],
    ['Vie privée & sécurité', [
      ['Y a-t-il une caméra ou un micro ?', 'Non, aucun. Le Nid ne peut ni filmer ni écouter.'],
      ['Où sont traitées les données ?', 'Dans le Nid lui-même. Votre téléphone ne reçoit que des événements chiffrés, comme « placard verrouillé à 14 h 32 ».'],
      ['Que se passe-t-il en cas de panne ?', 'Les Pastilles sont fail-secure : verrouillées, elles le restent. La Clé Sérénid magnétique les ouvre toujours, même sans courant ni réseau.'],
    ]],
    ['Commande & livraison', [
      ['Quels sont les délais de livraison ?', 'Expédition sous 24 h ouvrées, puis 2 à 5 jours selon le mode choisi. La livraison est offerte dès 200 € d’achat.'],
      ['Puis-je retourner mon kit ?', 'Oui, sous 30 jours après réception, même ouvert. Le remboursement intervient sous 14 jours.'],
      ['Ce site vend-il vraiment des produits ?', 'Non. Ce site est fictif et réalisé dans le cadre d’un projet scolaire : aucune commande n’est traitée.'],
    ]],
    ['Sérénid+', [
      ['Que contient Sérénid+ ?', 'Historique sur 12 mois, rapports détaillés, jusqu’à 3 domiciles, assistance prioritaire et un an de garantie supplémentaire.'],
      ['Puis-je arrêter à tout moment ?', 'Oui, Sérénid+ est sans engagement et se résilie en deux touches depuis l’application.'],
    ]],
  ];

  /* ---------- Illustrations produit ---------- */
  const useArt = (id, label, style = '') =>
    `<svg viewBox="0 0 240 240" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} ${style ? `style="${style}"` : ''}><use href="#${id}"/></svg>`;

  function finishStyle(p, variant) {
    if (!variant) return '';
    if (p.id === 'cle' && variant === 'encre') return '--fob:url(#g-shell-encre);--fob-mark:#4F7A96';
    if (variant === 'brume') return '--shell:url(#g-shell-brume)';
    return '';
  }

  function kitArt(c, label, style = '') {
    const nids = c.nids || 0, pas = c.pastilles || 0, keys = c.cles || 0;
    let s = `<svg viewBox="0 0 400 300" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} style="${style}">`;
    s += '<ellipse cx="200" cy="272" rx="178" ry="14" fill="url(#g-shadow)"/>';
    s += '<rect x="20" y="28" width="360" height="232" rx="36" fill="#F7F5F1" stroke="#C9DBE6" stroke-width="1.5"/>';
    for (let i = 0; i < Math.min(pas, 10); i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = 56 + col * 46, cy = (pas > 6 ? 58 : 84) + row * (pas > 6 ? 38 : 46);
      s += `<use href="#ill-pastille" x="${cx - 30}" y="${cy - 34}" width="60" height="60"/>`;
    }
    if (nids === 1) s += '<use href="#ill-nid" x="118" y="44" width="172" height="172"/>';
    if (nids >= 2) s += '<use href="#ill-nid" x="112" y="70" width="118" height="118"/><use href="#ill-nid" x="186" y="56" width="118" height="118"/>';
    for (let i = 10; i < pas; i++) {
      const j = i - 10, col = j % 2, row = Math.floor(j / 2);
      s += `<use href="#ill-pastille" x="${300 + col * 40 - 26}" y="${54 + row * 34 - 30}" width="52" height="52"/>`;
    }
    for (let i = 0; i < keys; i++) {
      s += `<use href="#ill-cle" x="${(pas > 10 ? 262 : 280) + i * 24}" y="${pas > 10 ? 150 : 120}" width="${pas > 10 ? 84 : 92}" height="${pas > 10 ? 84 : 92}"/>`;
    }
    return s + '</svg>';
  }

  function sceneArt(label) {
    return `<svg viewBox="0 0 240 240" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>
      <rect x="18" y="44" width="204" height="12" rx="3" fill="#1F3A4D"/>
      <rect x="28" y="56" width="184" height="140" rx="6" fill="#F7F5F1" stroke="#4F7A96" stroke-width="2"/>
      <path d="M120 56v140" stroke="#4F7A96" stroke-width="2"/>
      <rect x="104" y="112" width="5" height="26" rx="2.5" fill="#4F7A96"/><rect x="131" y="112" width="5" height="26" rx="2.5" fill="#4F7A96"/>
      <path d="M8 206h224" stroke="#C9DBE6" stroke-width="3" stroke-linecap="round"/>
      <circle cx="120" cy="74" r="40" fill="none" stroke="#E8A07A" stroke-width="2" stroke-dasharray="4 6"/>
      <use href="#ill-pastille" x="88" y="40" width="64" height="64"/>
      <circle cx="58" cy="196" r="14" fill="#E8A07A" opacity=".25"/><circle cx="58" cy="196" r="7" fill="#E8A07A"/>
    </svg>`;
  }

  function productArt(p, view = 'main', variant) {
    const st = finishStyle(p, variant);
    const label = `${p.name}`;
    switch (view) {
      case 'kit': return kitArt(p.contents, `${label} : composition du kit`, st);
      case 'pack': return kitArt({ pastilles: 4 }, `${label} : 4 Pastilles`, st);
      case 'nid': return useArt('ill-nid', `${label} : le Nid`);
      case 'nid-side': return `<svg viewBox="0 0 240 240" role="img" aria-label="Le Nid posé sur une étagère"><rect x="20" y="168" width="200" height="10" rx="3" fill="#1F3A4D"/><use href="#ill-nid" x="40" y="10" width="160" height="160"/><path d="M48 80a76 76 0 0 1 0 0" /><circle cx="120" cy="90" r="70" fill="none" stroke="#4F7A96" stroke-width="1.5" stroke-dasharray="3 8" opacity=".6"/></svg>`;
      case 'pastille': return useArt('ill-pastille', `${label} : une Pastille`, st);
      case 'cle': return useArt('ill-cle', `${label} : la Clé Sérénid`, p.id === 'cle' ? st : '');
      case 'scene': return sceneArt(`${label} : Pastille posée sur un placard`);
      case 'app': return useArt('ill-phone', 'Application Sérénid');
      case 'plus': return useArt('ill-plus', 'Sérénid+');
      default: {
        const v = p.gallery[0];
        return productArt(p, v, variant);
      }
    }
  }
  const thumbArt = (p, variant) => {
    if (p.category === 'kits') return useArt('ill-nid', '');
    if (p.id === 'pastilles-4') return useArt('ill-pastille', '', finishStyle(p, variant));
    if (p.id === 'cle') return useArt('ill-cle', '', finishStyle(p, variant));
    if (p.id === 'serenid-plus') return useArt('ill-plus', '');
    return useArt('ill-nid', '');
  };
  const viewName = { kit: 'Composition', pack: 'Le pack', nid: 'Le Nid', 'nid-side': 'En situation', pastille: 'La Pastille', cle: 'La Clé', scene: 'En situation', app: 'Application', plus: 'Sérénid+' };

  const starsHTML = (r) => {
    let s = '<span class="stars" aria-hidden="true">';
    for (let i = 1; i <= 5; i++) {
      const cls = r >= i ? '' : r >= i - 0.5 ? 'half' : 'off';
      s += `<svg class="${cls}"><use href="#i-star"/></svg>`;
    }
    return s + '</span>';
  };
  const ratingFR = (r) => r.toLocaleString('fr-FR', { minimumFractionDigits: 1 });
  const badgeHTML = (b) => `<span class="badge${b[1] ? ' badge--' + b[1] : ''}">${esc(b[0])}</span>`;
  const priceHTML = (p) => `<span class="price">${euro(p.price)}${p.unit ? `<small>${p.unit}</small>` : ''}${p.compareAt ? `<s aria-label="Prix initial ${euro(p.compareAt)}">${euro(p.compareAt)}</s>` : ''}</span>`;
  const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  /* ---------- Panier ---------- */
  const CART_KEY = 'serenid-cart-v1';
  const cart = Object.assign({ items: [], promo: null }, store.get(CART_KEY, {}));
  cart.items = (cart.items || []).filter((i) => PRODUCTS[i.id]);
  const saveCart = () => store.set(CART_KEY, { items: cart.items, promo: cart.promo });

  function lineKey(id, variant) { return id + '|' + (variant || ''); }
  function addToCart(id, qty = 1, variant = null, opts = {}) {
    const p = PRODUCTS[id];
    if (!p) return;
    if (p.variants && !variant) variant = p.variants.options[0].id;
    const key = lineKey(id, variant);
    const line = cart.items.find((i) => lineKey(i.id, i.variant) === key);
    if (line) line.qty = p.recurring ? 1 : clamp(line.qty + qty, 1, 20);
    else cart.items.push({ id, variant, qty: p.recurring ? 1 : clamp(qty, 1, 20) });
    saveCart();
    renderCart();
    bumpCount();
    if (opts.from) flyToCart(opts.from);
    if (!opts.silent) toast(`${p.name} ajouté au panier`);
  }
  function setQty(key, qty) {
    const line = cart.items.find((i) => lineKey(i.id, i.variant) === key);
    if (!line) return;
    if (qty <= 0) cart.items = cart.items.filter((i) => i !== line);
    else line.qty = PRODUCTS[line.id].recurring ? 1 : clamp(qty, 1, 20);
    saveCart();
    renderCart();
  }

  function totals(shipMode = 'domicile') {
    let goods = 0, recurring = 0, count = 0;
    cart.items.forEach((i) => {
      const p = PRODUCTS[i.id];
      const v = p.price * i.qty;
      if (p.recurring) recurring += v; else goods += v;
      count += i.qty;
    });
    goods = round2(goods);
    const promo = cart.promo && PROMOS[cart.promo];
    const discount = promo ? round2(goods * promo.rate) : 0;
    const shippable = goods > 0;
    const free = goods >= FREE_SHIP;
    const m = SHIPPING[shipMode] || SHIPPING.domicile;
    const shipping = !shippable ? 0 : (free && m.freeable ? 0 : m.price);
    const total = round2(goods - discount + recurring + shipping);
    return { goods, recurring, discount, shipping, total, free, shippable, count, promo };
  }

  function totalsHTML(t, shipLabel) {
    let h = `<dt>Sous-total</dt><dd>${euro(t.goods + t.recurring)}</dd>`;
    if (t.discount) h += `<dt class="is-discount">Code ${esc(cart.promo)}</dt><dd class="is-discount">−${euro(t.discount)}</dd>`;
    if (t.shippable) h += `<dt>Livraison${shipLabel ? ' · ' + esc(shipLabel) : ''}</dt><dd>${t.shipping ? euro(t.shipping) : 'Offerte'}</dd>`;
    h += `<dt class="is-total">Total</dt><dd class="is-total">${euro(t.total)}</dd>`;
    if (t.recurring) h += '<dt class="muted" style="grid-column:1/-1;font-size:.8rem">Sérénid+ : 1er mois inclus, puis 3,99 €/mois sans engagement</dt>';
    return h;
  }

  function renderCart() {
    const t = totals();
    const list = $('[data-cart-items]');
    list.innerHTML = cart.items.map((i) => {
      const p = PRODUCTS[i.id];
      const key = lineKey(i.id, i.variant);
      const vName = p.variants && i.variant ? p.variants.options.find((o) => o.id === i.variant)?.name : null;
      return `<li class="cart-item" data-key="${esc(key)}">
        <div class="cart-item__media">${thumbArt(p, i.variant)}</div>
        <div>
          <a class="cart-item__title" href="#/produit/${p.id}">${esc(p.name)}</a>
          <p class="cart-item__variant">${vName ? esc(p.variants.label) + ' : ' + esc(vName) : (p.recurring ? 'Abonnement mensuel' : '&nbsp;')}</p>
          ${p.recurring ? '' : `<div class="qty qty--sm">
            <button type="button" data-qty="-1" aria-label="Retirer un ${esc(p.name)}">${icon('i-minus')}</button>
            <input type="number" min="1" max="20" value="${i.qty}" aria-label="Quantité de ${esc(p.name)}" data-qty-input>
            <button type="button" data-qty="1" aria-label="Ajouter un ${esc(p.name)}">${icon('i-plus')}</button>
          </div>`}
        </div>
        <div class="cart-item__price">${euro(p.price * i.qty)}${p.unit ? '<small class="muted">' + p.unit + '</small>' : ''}
          <button type="button" class="cart-item__remove" data-remove aria-label="Supprimer ${esc(p.name)} du panier">Supprimer</button>
        </div>
      </li>`;
    }).join('');
    const empty = cart.items.length === 0;
    $('[data-cart-empty]').hidden = !empty;
    $('[data-cart-foot]').hidden = empty;
    $('[data-ship-meter]').hidden = empty || !t.shippable;
    $('[data-cart-totals]').innerHTML = totalsHTML(t, 'domicile');
    const meter = $('[data-ship-meter]');
    const left = round2(FREE_SHIP - t.goods);
    meter.classList.toggle('is-free', left <= 0);
    $('[data-ship-text]').innerHTML = left > 0 ? `Plus que <strong>${euro(left)}</strong> pour la livraison offerte.` : '<strong>La livraison vous est offerte.</strong>';
    $('[data-ship-bar]').style.transform = `scaleX(${clamp(t.goods / FREE_SHIP, 0, 1)})`;
    const promoMsg = $('[data-promo-msg]');
    if (cart.promo && t.promo) promoMsg.textContent = `Code ${cart.promo} appliqué : −10 % sur le matériel.`;
    const n = t.count;
    $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.classList.toggle('has-items', n > 0); });
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-label', `Ouvrir le panier, ${n} article${n > 1 ? 's' : ''}`));
    if (currentRoute.name === 'commande') renderCheckoutSummary();
  }

  function bumpCount() {
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }

  function flyToCart(fromEl) {
    if (reduced()) return;
    const target = $('.cart-toggle');
    if (!target || !fromEl) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly-dot';
    dot.style.left = a.left + a.width / 2 + 'px';
    dot.style.top = a.top + a.height / 2 + 'px';
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(1.2)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.4)`, opacity: 0.2 },
    ], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = () => dot.remove();
  }

  /* Tiroir : ouverture, fermeture, piège de focus */
  const drawer = $('#cart-drawer');
  const backdrop = $('[data-cart-backdrop]');
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    closeMenu();
    drawer.hidden = false; backdrop.hidden = false;
    requestAnimationFrame(() => { drawer.classList.add('is-open'); backdrop.classList.add('is-open'); });
    document.documentElement.style.overflow = 'hidden';
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    setTimeout(() => $('[data-cart-close]', drawer).focus(), 60);
  }
  function closeCart(restore = true) {
    if (drawer.hidden) return;
    drawer.classList.remove('is-open'); backdrop.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    setTimeout(() => { drawer.hidden = true; backdrop.hidden = true; }, reduced() ? 0 : 300);
    if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function trapFocus(e, root) {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', root).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove('is-visible'); setTimeout(() => { if (!t.classList.contains('is-visible')) t.textContent = ''; }, 400); }, 2600);
  }

  /* ---------- Compte à rebours fictif (fin du dimanche suivant) ---------- */
  function deadline() {
    const d = new Date();
    const add = (7 - d.getDay()) % 7;
    d.setDate(d.getDate() + add);
    d.setHours(23, 59, 59, 0);
    if (d - Date.now() < 3600e3) d.setDate(d.getDate() + 7);
    return d;
  }
  const offerEnd = deadline();
  function tickCountdown() {
    const ms = Math.max(0, offerEnd - Date.now());
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
    const txt = `${d} j ${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min`;
    $$('[data-countdown]').forEach((el) => { el.textContent = txt; });
  }

  /* ---------- Découpage des titres (animation par mots) ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="split-line" aria-hidden="true" style="display:inline-block"><span>${esc(w)}</span></span>`).join(' ');
    if (animOK()) window.gsap.set($$('.split-line > span', el), { yPercent: 110 });
    el.style.visibility = 'visible';
  }
  function animateSplit(el, delay = 0) {
    const inner = $$('.split-line > span', el);
    window.gsap.fromTo(inner, { yPercent: 110 }, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.06, delay });
  }

  /* ---------- Révélations au scroll ---------- */
  function setupReveals(root, cleanups) {
    if (!animOK()) return;
    const { gsap, ScrollTrigger } = window;
    const els = $$('[data-reveal]', root).filter((el) => !el.dataset.revealed);
    if (els.length) {
      const triggers = ScrollTrigger.batch(els, {
        start: 'top 90%', once: true,
        onEnter: (batch) => gsap.fromTo(batch, { opacity: 0, y: 32 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
          onComplete: () => batch.forEach((b) => { b.dataset.revealed = '1'; }),
        }),
      });
      cleanups.push(() => triggers.forEach((t) => t.kill()));
    }
    $$('[data-split]', root).forEach((el) => {
      splitWords(el);
      if (el.dataset.splitPlayed) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) { el.dataset.splitPlayed = '1'; animateSplit(el, 0.1); return; }
      gsap.set($$('.split-line > span', el), { yPercent: 110 });
      const st = ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => { el.dataset.splitPlayed = '1'; animateSplit(el); } });
      cleanups.push(() => { st.kill(); if (!el.dataset.splitPlayed) gsap.set($$('.split-line > span', el), { yPercent: 0 }); });
    });
    $$('[data-count]', root).forEach((el) => {
      const target = +el.dataset.count;
      if (!target) return;
      const o = { v: 0 };
      el.textContent = '0';
      const st = ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
      cleanups.push(() => { st.kill(); el.textContent = target; });
    });
  }

  /* ---------- Onglets accessibles (générique) ---------- */
  function initTabs(list, onChange) {
    if (!list || list.dataset.bound) return;
    list.dataset.bound = '1';
    const tabs = $$('[role="tab"]', list);
    const vertical = list.getAttribute('aria-orientation') === 'vertical';
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel && t.getAttribute('aria-controls') !== tab.getAttribute('aria-controls')) panel.hidden = true;
      });
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) { panel.hidden = false; panel.setAttribute('aria-labelledby', tab.id); }
      if (focus) tab.focus();
      if (onChange) onChange(tab);
    };
    tabs.forEach((t) => t.addEventListener('click', () => select(t)));
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const next = vertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight'];
      const prev = vertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft'];
      let j = null;
      if (next.includes(e.key)) j = (i + 1) % tabs.length;
      else if (prev.includes(e.key)) j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
    return select;
  }

  /* ---------- Accordéons (délégation) ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.acc__btn');
    if (!btn) return;
    const acc = btn.closest('.acc');
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open);
    acc.classList.toggle('is-open', open);
  });
  const accHTML = (id, q, a) => `<div class="acc" data-q="${esc((q + ' ' + a).toLowerCase())}">
    <h3><button class="acc__btn" aria-expanded="false" aria-controls="${id}" id="${id}-b">${esc(q)}${icon('i-plus')}</button></h3>
    <div class="acc__panel" id="${id}" role="region" aria-labelledby="${id}-b"><div><p>${esc(a)}</p></div></div>
  </div>`;

  /* =========================================================
     Hero 3D : le Nid (three.js r128, chargé à la demande)
     ========================================================= */
  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const hero3D = { started: false, setActive: () => {} };
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function webglOK() {
    try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  }
  function initHero3D() {
    if (hero3D.started) return;
    hero3D.started = true;
    const stage = $('#nid-stage');
    if (!stage || !webglOK()) return;
    loadScript(THREE_URL).then(() => buildNid(stage, $('#nid-canvas'))).catch(() => { /* repli SVG conservé */ });
  }
  function radialTexture(T, stops) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const tex = new T.CanvasTexture(c);
    tex.encoding = T.sRGBEncoding;
    return tex;
  }
  function buildNid(stage, canvas) {
    const T = window.THREE;
    if (!T) return;
    try {
      const lin = (hex) => new T.Color(hex).convertSRGBToLinear();
      const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(27, 1, 0.1, 60);
      camera.position.set(0, 1.75, 8.6);
      camera.lookAt(0, 0.18, 0);

      scene.add(new T.HemisphereLight(lin(0xF7F5F1), lin(0xC9DBE6), 0.95));
      const key = new T.DirectionalLight(lin(0xF7F5F1), 1.25); key.position.set(-3.5, 5, 4.5); scene.add(key);
      const rim = new T.DirectionalLight(lin(0xC9DBE6), 1.1); rim.position.set(4, 1.2, -3.5); scene.add(rim);
      const front = new T.DirectionalLight(lin(0xF7F5F1), 0.18); front.position.set(-1.5, 2.5, 6); scene.add(front);

      const world = new T.Group(); scene.add(world);
      const nid = new T.Group(); world.add(nid);

      // Profil du galet : dôme doux, base aplatie (superellipse)
      const R = 1.3, HT = 1.04, HB = 0.34;
      const prof = (a) => {
        const c = Math.cos(a), s = Math.sin(a), top = s >= 0;
        const e = 2 / (top ? 2.3 : 4.4);
        return [R * Math.pow(Math.max(c, 0), e), (top ? HT : HB) * Math.sign(s) * Math.pow(Math.abs(s), e)];
      };
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        const [x, y] = prof(-Math.PI / 2 + (Math.PI * i) / 80);
        pts.push(new T.Vector2(Math.max(x, 0.0001), y));
      }
      const body = new T.Mesh(
        new T.LatheGeometry(pts, 160),
        new T.MeshPhysicalMaterial({ color: lin(0xF7F5F1), roughness: 0.46, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.55 })
      );
      nid.add(body);
      const seam = new T.Mesh(new T.TorusGeometry(R + 0.004, 0.013, 12, 200), new T.MeshStandardMaterial({ color: lin(0xC9DBE6), roughness: 0.55 }));
      seam.rotation.x = Math.PI / 2; seam.position.y = -0.05; nid.add(seam);

      // Voyant LED abricot
      const aL = 0.5;
      const [lx, ly] = prof(aL), [lx2, ly2] = prof(aL + 0.01);
      const tl = Math.hypot(lx2 - lx, ly2 - ly);
      const nrm = new T.Vector3(0, -(lx2 - lx) / tl, (ly2 - ly) / tl).normalize();
      const ledPos = new T.Vector3(0, ly, lx);
      const led = new T.Mesh(new T.CircleGeometry(0.075, 48), new T.MeshBasicMaterial({ color: lin(0xE8A07A), toneMapped: false }));
      led.position.copy(ledPos).addScaledVector(nrm, 0.008); led.lookAt(led.position.clone().add(nrm)); nid.add(led);
      const lens = new T.Mesh(new T.TorusGeometry(0.13, 0.009, 10, 72), new T.MeshStandardMaterial({ color: lin(0xC9DBE6), roughness: 0.45 }));
      lens.position.copy(ledPos).addScaledVector(nrm, 0.003); lens.lookAt(lens.position.clone().add(nrm)); nid.add(lens);
      // Halo posé à plat sur la coque (plan tangent : il ne traverse jamais le dôme)
      const glow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({
        map: radialTexture(T, [[0, 'rgba(232,160,122,0.85)'], [0.28, 'rgba(232,160,122,0.38)'], [1, 'rgba(232,160,122,0)']]),
        transparent: true, depthWrite: false, toneMapped: false,
      }));
      glow.position.copy(ledPos).addScaledVector(nrm, 0.012); glow.lookAt(glow.position.clone().add(nrm)); nid.add(glow);

      // Ombre douce au sol
      const floorY = -HB - 0.01;
      const shadow = new T.Mesh(new T.PlaneGeometry(4.6, 4.6), new T.MeshBasicMaterial({
        map: radialTexture(T, [[0, 'rgba(31,58,77,0.42)'], [0.42, 'rgba(31,58,77,0.14)'], [1, 'rgba(31,58,77,0)']]),
        transparent: true, depthWrite: false,
      }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = floorY; world.add(shadow);

      // Ondes radar au sol
      const waves = [];
      for (let i = 0; i < 3; i++) {
        const m = new T.Mesh(new T.RingGeometry(0.985, 1, 160), new T.MeshBasicMaterial({ color: lin(0x4F7A96), transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide }));
        m.rotation.x = -Math.PI / 2; m.position.y = floorY + 0.002; world.add(m); waves.push(m);
      }

      // Le point abricot : l’enfant qui explore
      const child = new T.Group(); world.add(child);
      const childDot = new T.Mesh(new T.SphereGeometry(0.1, 32, 24), new T.MeshStandardMaterial({ color: lin(0xE8A07A), roughness: 0.5, emissive: lin(0xE8A07A), emissiveIntensity: 0.25 }));
      childDot.position.y = floorY + 0.1; child.add(childDot);
      const childShadow = new T.Mesh(new T.PlaneGeometry(0.6, 0.6), new T.MeshBasicMaterial({
        map: radialTexture(T, [[0, 'rgba(232,160,122,0.55)'], [1, 'rgba(232,160,122,0)']]), transparent: true, depthWrite: false,
      }));
      childShadow.rotation.x = -Math.PI / 2; childShadow.position.y = floorY + 0.003; child.add(childShadow);

      // Interaction
      const target = { rx: 0, ry: 0 }, cur = { rx: 0, ry: 0 };
      const onMove = (e) => {
        const r = stage.getBoundingClientRect();
        target.ry = clamp(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 1.4, -0.6, 0.6);
        target.rx = clamp(((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 0.35, -0.15, 0.15);
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      const resize = () => {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        if (!raf) renderer.render(scene, camera);
      };
      new ResizeObserver(resize).observe(stage);

      const clock = new T.Clock();
      let raf = 0, visible = true, active = true, intro = 0;
      const update = (t) => {
        intro = Math.min(1, intro + 0.018);
        const ei = 1 - Math.pow(1 - intro, 3);
        cur.rx += (target.rx - cur.rx) * 0.05;
        cur.ry += (target.ry - cur.ry) * 0.05;
        const scrollP = clamp(window.scrollY / (stage.offsetHeight || 600), 0, 1);
        world.rotation.y = cur.ry + Math.sin(t * 0.25) * 0.12 - scrollP * 0.5;
        world.rotation.x = cur.rx;
        nid.position.y = 0.06 + Math.sin(t * 1.1) * 0.045 + (1 - ei) * -0.35;
        nid.scale.setScalar(0.86 + 0.14 * ei);
        shadow.scale.setScalar(1 - Math.sin(t * 1.1) * 0.03);
        const b = (Math.sin(t * 1.9) + 1) / 2; // respiration du voyant
        glow.scale.setScalar(0.62 + b * 0.42);
        glow.material.opacity = 0.55 + b * 0.45;
        waves.forEach((w, i) => {
          const ph = ((t * 0.32) + i / 3) % 1;
          const s = 1.3 + ph * 2.6;
          w.scale.set(s, s, 1);
          w.material.opacity = Math.sin(ph * Math.PI) * 0.5 * ei;
        });
        const a = t * 0.32;
        child.position.set(Math.cos(a) * 2.15, 0, Math.sin(a) * 1.25 + 0.35);
        childDot.position.y = floorY + 0.1 + Math.abs(Math.sin(t * 5)) * 0.03;
      };
      const frame = () => {
        raf = requestAnimationFrame(frame);
        update(clock.getElapsedTime());
        renderer.render(scene, camera);
      };
      const start = () => { if (!raf && visible && active && !reduced() && !document.hidden) { clock.start(); frame(); } };
      const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
      const renderStatic = () => { intro = 1; update(1.2); renderer.render(scene, camera); };

      new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(stage);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
      reduceMQ.addEventListener('change', () => { if (reduced()) { stop(); renderStatic(); } else start(); });
      hero3D.setActive = (on) => { active = on; on ? start() : stop(); };

      resize();
      if (reduced()) renderStatic(); else start();
      stage.classList.add('is-3d');
    } catch (err) {
      stage.classList.remove('is-3d');
    }
  }

  /* =========================================================
     Accueil
     ========================================================= */
  let homeBound = false;
  function initHome(cleanups) {
    initHero3D();
    hero3D.setActive(true);
    cleanups.push(() => hero3D.setActive(false));

    if (!homeBound) {
      homeBound = true;
      bindKit();
      renderHomeReviews();
      bindRail();
      fillCompare();
    }

    // Intro du hero (une fois)
    const hero = $('.hero');
    if (animOK() && !hero.dataset.played) {
      hero.dataset.played = '1';
      const { gsap } = window;
      const h1 = $('#hero-title');
      splitWords(h1);
      h1.dataset.splitPlayed = '1';
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo('[data-hero-in]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.25)
        .fromTo($$('.split-line > span', h1), { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.07 }, 0.1)
        .fromTo('.hero__stage', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.15)
        .fromTo('.float-card', { opacity: 0, y: 20, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.15 }, 0.9);
      $$('.float-card').forEach((c, i) => gsap.to(c, { y: i % 2 ? 9 : -9, duration: 3 + i * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 }));
    } else {
      $$('[data-hero-in]').forEach((el) => { el.style.opacity = 1; });
    }

    setupHow(cleanups);
    setupReveals($('[data-page="home"]'), cleanups);

    if (animOK()) {
      const { gsap, ScrollTrigger } = window;
      const t = gsap.fromTo('.kit__item', { opacity: 0, y: 30, scale: 0.94 }, {
        opacity: (i, el) => (el.closest('.has-focus') && !el.classList.contains('is-focus') ? 0.32 : 1),
        y: 0, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.1, clearProps: 'opacity,transform',
        scrollTrigger: { trigger: '.kit__visual', start: 'top 80%', once: true },
      });
      const p = gsap.to('.hero__waves', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      cleanups.push(() => { t.scrollTrigger && t.scrollTrigger.kill(); p.scrollTrigger && p.scrollTrigger.kill(); });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  /* Comment ça marche : maison en coupe */
  function setupHow(cleanups) {
    let local = [];
    const run = () => { local.forEach((fn) => fn()); local = []; buildHow(local); };
    run();
    const onMQ = () => { run(); if (hasGSAP()) window.ScrollTrigger.refresh(); };
    desktopMQ.addEventListener('change', onMQ);
    cleanups.push(() => { local.forEach((fn) => fn()); local = []; desktopMQ.removeEventListener('change', onMQ); });
  }
  function buildHow(cleanups) {
    const sec = $('#comment');
    const path = $('#hw-path', sec);
    const child = $('#hw-child', sec);
    const len = path.getTotalLength();
    const pads = $$('.hw-p', sec).map((g) => {
      const m = /translate\(([\d.]+)[ ,]+([\d.]+)\)/.exec(g.getAttribute('transform'));
      return { el: g, id: g.dataset.p, x: +m[1], y: +m[2], r: +$('.hw-p__zone', g).getAttribute('r'), locked: false, li: $(`[data-how-status] [data-p="${g.dataset.p}"]`, sec) };
    });
    const steps = $$('[data-how-steps] li', sec);
    const bar = $('[data-how-bar]', sec);
    let lastStep = -1;
    const setProgress = (p) => {
      const pt = path.getPointAtLength(clamp(p, 0, 1) * len);
      child.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      pads.forEach((P) => {
        const lock = Math.hypot(pt.x - P.x, pt.y - P.y) < P.r;
        if (lock !== P.locked) {
          P.locked = lock;
          P.el.classList.toggle('is-locked', lock);
          if (P.li) { P.li.classList.toggle('is-locked', lock); $('b', P.li).textContent = lock ? 'Verrouillé' : 'Ouvert'; }
        }
      });
      const step = p < 0.12 ? 0 : p < 0.42 ? 1 : p < 0.7 ? 2 : 3;
      if (step !== lastStep) { lastStep = step; steps.forEach((s, i) => s.classList.toggle('is-active', i === step)); }
      if (bar) bar.style.transform = `scaleX(${p})`;
    };

    if (!animOK()) {
      setProgress(0.24);
      steps.forEach((s) => s.classList.add('is-active'));
      cleanups.push(() => steps.forEach((s, i) => s.classList.toggle('is-active', i === 0)));
      return;
    }
    const { gsap } = window;
    const state = { p: 0 };
    if (desktopMQ.matches) {
      sec.classList.add('is-pinned');
      const tw = gsap.to(state, {
        p: 1, ease: 'none', onUpdate: () => setProgress(state.p),
        scrollTrigger: { trigger: $('.how__pin', sec), start: 'top top+=' + ($('[data-header]').offsetHeight || 76), end: '+=170%', pin: true, scrub: 0.8, anticipatePin: 1 },
      });
      setProgress(0);
      cleanups.push(() => { sec.classList.remove('is-pinned'); tw.scrollTrigger.kill(true); tw.kill(); });
    } else {
      let raf = 0, t0 = 0;
      const loop = (ts) => {
        if (!t0) t0 = ts;
        setProgress(((ts - t0) / 14000) % 1);
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([en]) => {
        if (en.isIntersecting && !raf) raf = requestAnimationFrame(loop);
        else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      });
      io.observe($('.house', sec));
      setProgress(0);
      cleanups.push(() => { io.disconnect(); cancelAnimationFrame(raf); raf = 0; });
    }
  }

  function bindKit() {
    const visual = $('[data-kit-visual]');
    const focusItem = (key) => {
      visual.classList.add('has-focus');
      $$('.kit__item', visual).forEach((g) => g.classList.toggle('is-focus', g.dataset.kitItem === key));
      $$('.hotspot', visual).forEach((h) => h.classList.toggle('is-active', h.dataset.hotspot === key));
    };
    const select = initTabs($('[data-tabs="kit"]'), (tab) => focusItem(tab.dataset.kitKey));
    $$('.hotspot', visual).forEach((h) => h.addEventListener('click', () => select($(`[data-kit-key="${h.dataset.hotspot}"]`))));
    focusItem('nid');
  }

  function reviewCard(rv) {
    const p = PRODUCTS[rv.p];
    return `<li class="review-card${rv.wide ? ' review-card--wide' : ''}">
      <div>${starsHTML(rv.r)}<span class="sr-only">Note : ${rv.r} sur 5</span></div>
      <h3>${esc(rv.t)}</h3>
      <p class="review-card__text">${esc(rv.x)}</p>
      <p class="review-card__product">${esc(p.name)}</p>
      <div class="review-card__meta"><span class="avatar" aria-hidden="true">${esc(rv.a[0])}</span><span>${esc(rv.a)} · ${esc(rv.c)}<br>${esc(rv.d)}</span></div>
    </li>`;
  }
  function renderHomeReviews() {
    const order = [0, 1, 2, 3, 6, 4, 5, 7, 8, 10];
    $('[data-reviews-home]').innerHTML = order.map((i) => reviewCard(REVIEWS[i])).join('');
  }
  function bindRail() {
    const rail = $('[data-reviews-rail]');
    const step = () => ($('.review-card', rail)?.offsetWidth || 360) + 20;
    $('[data-rail-prev]').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }));
    $('[data-rail-next]').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }));
    // Glisser à la souris
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-dragging'); }
      rail.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', () => { down = false; rail.classList.remove('is-dragging'); });
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step() }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step() }); }
    });
  }
  function fillCompare() {
    const map = { yes: ['i-check', 'Oui'], part: ['i-partial', 'En partie'], no: ['i-dash', 'Non'] };
    $$('.compare__table td[data-v]').forEach((td) => {
      const m = map[td.dataset.v];
      if (!m) return;
      const note = td.textContent.trim();
      td.innerHTML = `${icon(m[0])}<span class="sr-only">${m[1]}</span>${note ? `<small>${esc(note)}</small>` : ''}`;
    });
  }

  /* =========================================================
     Boutique
     ========================================================= */
  const shopState = { filter: 'all', sort: 'reco' };
  function productCard(p, feature) {
    return `<li class="product-card${feature ? ' product-card--feature' : ''}">
      <div class="product-card__media">
        ${p.badges.length ? `<div class="product-card__badges">${p.badges.map(badgeHTML).join('')}</div>` : ''}
        ${productArt(p, feature || p.category === 'kits' ? 'kit' : 'main')}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title"><a href="#/produit/${p.id}">${esc(p.name)}</a></h3>
        <p class="product-card__desc">${esc(p.short)}</p>
        <p class="product-card__rating">${starsHTML(p.rating)}<span>${ratingFR(p.rating)} · ${p.reviews} avis</span></p>
        <div class="product-card__foot">
          ${priceHTML(p)}
          <button class="btn btn--primary btn--sm" type="button" data-quick-add="${p.id}" aria-label="Ajouter ${esc(p.name)} au panier">${icon('i-plus')}Ajouter</button>
        </div>
      </div>
    </li>`;
  }
  function renderShop() {
    let list = Object.values(PRODUCTS);
    if (shopState.filter !== 'all') list = list.filter((p) => p.category === shopState.filter);
    const s = shopState.sort;
    list.sort((a, b) => s === 'price-asc' ? a.price - b.price : s === 'price-desc' ? b.price - a.price : s === 'rating' ? b.rating - a.rating : a.order - b.order);
    const featureOK = s === 'reco' && (shopState.filter === 'all' || shopState.filter === 'kits');
    $('[data-product-grid]').innerHTML = list.map((p) => productCard(p, featureOK && p.feature)).join('');
    $('[data-shop-count]').textContent = `${list.length} produit${list.length > 1 ? 's' : ''}`;
    if (animOK()) window.gsap.fromTo('[data-product-grid] > li', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
  }
  function bindShop() {
    const filters = $('[data-filters]');
    if (filters.dataset.bound) return;
    filters.dataset.bound = '1';
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      shopState.filter = b.dataset.filter;
      $$('[data-filter]', filters).forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', on); });
      renderShop();
    });
    $('[data-sort]').addEventListener('change', (e) => { shopState.sort = e.target.value; renderShop(); });
  }

  /* =========================================================
     Fiche produit
     ========================================================= */
  function renderProduct(id, cleanups) {
    const p = PRODUCTS[id];
    const root = $('[data-product-root]');
    if (!p) { root.innerHTML = ''; return false; }
    document.title = `${p.name} — Sérénid`;
    const variant = p.variants ? p.variants.options[0].id : null;
    const views = p.gallery;
    const reviews = REVIEWS.filter((r) => r.p === id);
    const others = reviews.length >= 2 ? reviews : reviews.concat(REVIEWS.filter((r) => r.p !== id).slice(0, 3 - reviews.length));
    const related = Object.values(PRODUCTS).filter((x) => x.id !== id).sort((a, b) => (a.category === p.category ? -1 : 0) - (b.category === p.category ? -1 : 0) || a.order - b.order).slice(0, 3);
    const contents = [];
    if (p.contents.nids) contents.push(['i-radar', `${p.contents.nids} Nid${p.contents.nids > 1 ? 's' : ''}`]);
    if (p.contents.pastilles) contents.push(['i-lock', `${p.contents.pastilles} Pastilles`]);
    if (p.contents.cles) contents.push(['i-key', `${p.contents.cles} Clé${p.contents.cles > 1 ? 's' : ''}`]);
    const install = p.install || INSTALL;
    const dist = [[5, 0.66], [4, 0.24], [3, 0.07], [2, 0.02], [1, 0.01]];

    root.innerHTML = `
    <section class="pdp">
      <div class="container">
        <nav aria-label="Fil d’Ariane"><ol class="breadcrumb"><li><a href="#/">Accueil</a></li><li><a href="#/boutique">Boutique</a></li><li aria-current="page">${esc(p.name)}</li></ol></nav>
        <div class="pdp__grid">
          <div class="gallery">
            <div class="gallery__main" data-gallery-main>
              ${views.map((v, i) => `<div class="gallery__view${i === 0 ? ' is-active' : ''}" data-view="${v}" ${i ? 'aria-hidden="true"' : ''}>${productArt(p, v, variant)}</div>`).join('')}
              <span class="gallery__caption" data-gallery-caption>${esc(viewName[views[0]])}</span>
            </div>
            ${views.length > 1 ? `<div class="gallery__thumbs" role="group" aria-label="Vues du produit">
              ${views.map((v, i) => `<button type="button" class="gallery__thumb" data-thumb="${i}" aria-current="${i === 0}" aria-label="Afficher : ${esc(viewName[v])}">${productArt(p, v, variant).replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"')}</button>`).join('')}
            </div>` : ''}
          </div>
          <div class="pdp__info">
            <div class="product-card__badges" style="position:static">${p.badges.map(badgeHTML).join('')}</div>
            <h1 class="h1">${esc(p.name)}</h1>
            <a class="pdp__rating" href="#pdp-reviews" data-scroll-to="pdp-reviews">${starsHTML(p.rating)}<span><strong>${ratingFR(p.rating)}</strong> · ${p.reviews} avis</span></a>
            <p class="lead">${esc(p.short)}</p>
            <div class="pdp__price">${priceHTML(p)}</div>
            <p class="pdp__tax">${p.recurring ? 'TTC, sans engagement · résiliable à tout moment' : 'TTC · Livraison offerte dès 200 €'}</p>
            ${p.compareAt ? `<div class="pdp__offer"><span class="announce__dot" aria-hidden="true"></span><span>Offre de lancement −15 %, encore <strong data-countdown></strong></span></div>` : ''}
            ${contents.length ? `<ul class="pdp__contents" aria-label="Contenu">${contents.map((c) => `<li>${icon(c[0])}${c[1]}</li>`).join('')}</ul>` : ''}
            ${p.variants ? `<fieldset class="variant"><legend>${esc(p.variants.label)} : <span data-variant-name>${esc(p.variants.options[0].name)}</span></legend><div class="swatches">
              ${p.variants.options.map((o, i) => `<label class="swatch"><input type="radio" name="variant" value="${o.id}" ${i === 0 ? 'checked' : ''}><span><i style="background:${o.swatch}"></i>${esc(o.name)}</span></label>`).join('')}
            </div></fieldset>` : ''}
            <div class="buy-row">
              ${p.recurring ? '' : `<div class="qty"><button type="button" data-pdp-qty="-1" aria-label="Diminuer la quantité">${icon('i-minus')}</button><input type="number" min="1" max="20" value="1" aria-label="Quantité" data-pdp-qty-input><button type="button" data-pdp-qty="1" aria-label="Augmenter la quantité">${icon('i-plus')}</button></div>`}
              <button class="btn btn--primary btn--lg" type="button" data-pdp-add>${p.recurring ? 'Activer Sérénid+' : 'Ajouter au panier'} ${icon('i-arrow')}</button>
            </div>
            <ul class="assure">
              <li>${icon('i-truck')}Expédié sous 24 h ouvrées · offert dès 200 €</li>
              <li>${icon('i-return')}Retours gratuits sous 30 jours</li>
              <li>${icon('i-shield')}Garantie 2 ans · assistance en français</li>
            </ul>
          </div>
        </div>

        <div class="tabs">
          <div class="tabs__list" role="tablist" aria-label="Informations produit" data-tabs="pdp">
            <button class="tabs__tab" role="tab" id="pt-desc" aria-controls="pp-desc" aria-selected="true">Description</button>
            <button class="tabs__tab" role="tab" id="pt-spec" aria-controls="pp-spec" aria-selected="false" tabindex="-1">Caractéristiques</button>
            <button class="tabs__tab" role="tab" id="pt-inst" aria-controls="pp-inst" aria-selected="false" tabindex="-1">${p.recurring ? 'Activation' : 'Installation'}</button>
            <button class="tabs__tab" role="tab" id="pt-faq" aria-controls="pp-faq" aria-selected="false" tabindex="-1">FAQ</button>
          </div>
          <div class="tabs__panel" role="tabpanel" id="pp-desc" aria-labelledby="pt-desc" tabindex="0">
            ${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}
            <ul class="spec-list">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          </div>
          <div class="tabs__panel" role="tabpanel" id="pp-spec" aria-labelledby="pt-spec" tabindex="0" hidden>
            <table class="spec-table"><caption class="sr-only">Caractéristiques de ${esc(p.name)}</caption><tbody>${p.specs.map((s) => `<tr><th scope="row">${esc(s[0])}</th><td>${esc(s[1])}</td></tr>`).join('')}</tbody></table>
          </div>
          <div class="tabs__panel" role="tabpanel" id="pp-inst" aria-labelledby="pt-inst" tabindex="0" hidden>
            <ol class="steps-list">${install.map((s) => `<li><span><strong>${esc(s[0])}</strong>${esc(s[1])}</span></li>`).join('')}</ol>
          </div>
          <div class="tabs__panel" role="tabpanel" id="pp-faq" aria-labelledby="pt-faq" tabindex="0" hidden>
            <div class="accordion">${p.faq.map((f, i) => accHTML(`pf-${i}`, f[0], f[1])).join('')}</div>
          </div>
        </div>

        <section class="pdp-reviews" id="pdp-reviews" aria-labelledby="pr-title">
          <div>
            <h2 class="h2" id="pr-title">Avis</h2>
            <p class="rating-summary__score" style="margin-top:16px">${ratingFR(p.rating)}<span>/5</span></p>
            ${starsHTML(p.rating)}
            <p class="muted" style="margin-top:8px">${p.reviews} avis de familles</p>
            <ul class="rating-bars" aria-label="Répartition des notes">${dist.map(([n, w]) => `<li><span>${n}</span><span class="bar"><i style="--w:${Math.round(w * 100)}%"></i></span><span>${Math.round(w * 100)} %</span></li>`).join('')}</ul>
          </div>
          <div class="pdp-reviews__list">
            ${others.map((r) => `<article class="pdp-review">${starsHTML(r.r)}<span class="sr-only">Note : ${r.r} sur 5</span><h3>${esc(r.t)}</h3><p>${esc(r.x)}</p><p class="pdp-review__meta"><span class="avatar" aria-hidden="true" style="width:28px;height:28px;font-size:.75rem">${esc(r.a[0])}</span>${esc(r.a)} · ${esc(r.c)} · ${esc(r.d)}${r.p !== id ? ' · à propos de ' + esc(PRODUCTS[r.p].name) : ''}</p></article>`).join('')}
          </div>
        </section>

        <section class="related" aria-labelledby="rel-title">
          <h2 class="h2" id="rel-title">Vous aimerez aussi</h2>
          <ul class="product-grid">${related.map((r) => productCard(r, false)).join('')}</ul>
        </section>
      </div>
    </section>
    <div class="sticky-buy" data-sticky-buy aria-hidden="true"><strong>${esc(p.name)} · ${euro(p.price)}${p.unit || ''}</strong><button class="btn btn--light btn--sm" type="button" tabindex="-1" data-pdp-add-sticky>Ajouter</button></div>`;

    tickCountdown();
    const pdp = $('.pdp', root);
    let current = variant;
    // Galerie
    const showView = (i) => {
      $$('.gallery__view', pdp).forEach((v, k) => { v.classList.toggle('is-active', k === i); v.setAttribute('aria-hidden', k !== i); });
      $$('.gallery__thumb', pdp).forEach((t, k) => t.setAttribute('aria-current', k === i));
      $('[data-gallery-caption]', pdp).textContent = viewName[views[i]];
    };
    $$('.gallery__thumb', pdp).forEach((t) => t.addEventListener('click', () => showView(+t.dataset.thumb)));
    // Variantes : on régénère les visuels
    $$('input[name="variant"]', pdp).forEach((r) => r.addEventListener('change', () => {
      current = r.value;
      $('[data-variant-name]', pdp).textContent = p.variants.options.find((o) => o.id === current).name;
      $$('.gallery__view', pdp).forEach((v) => { v.innerHTML = productArt(p, v.dataset.view, current); });
      $$('.gallery__thumb', pdp).forEach((t, k) => { t.innerHTML = productArt(p, views[k], current).replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"'); });
    }));
    // Quantité
    const qInput = $('[data-pdp-qty-input]', pdp);
    $$('[data-pdp-qty]', pdp).forEach((b) => b.addEventListener('click', () => { qInput.value = clamp((+qInput.value || 1) + +b.dataset.pdpQty, 1, 20); }));
    if (qInput) qInput.addEventListener('change', () => { qInput.value = clamp(Math.round(+qInput.value) || 1, 1, 20); });
    const add = (from) => {
      addToCart(id, qInput ? +qInput.value : 1, current, { from, silent: true });
      openCart();
    };
    const mainAdd = $('[data-pdp-add]', pdp);
    mainAdd.addEventListener('click', () => add(mainAdd));
    const sticky = $('[data-sticky-buy]');
    $('[data-pdp-add-sticky]').addEventListener('click', (e) => add(e.currentTarget));
    const io = new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', !show);
      $('button', sticky).tabIndex = show ? 0 : -1;
    });
    io.observe(mainAdd);
    cleanups.push(() => io.disconnect());
    initTabs($('[data-tabs="pdp"]', pdp));
    if (animOK()) {
      const { gsap } = window;
      gsap.fromTo($$('.pdp__info > *', pdp), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.04 });
      gsap.fromTo('.gallery__main', { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' });
    }
    return true;
  }

  /* =========================================================
     Diagnostic de la maison
     ========================================================= */
  const diag = { step: 1, max: 5 };
  function bindDiag() {
    const form = $('[data-diag-form]');
    if (form.dataset.bound) return;
    form.dataset.bound = '1';
    const err = $('.diag__error', form);
    const show = (n) => {
      diag.step = n;
      $$('.diag__step', form).forEach((f) => { f.hidden = +f.dataset.step !== n; });
      $('[data-diag-prev]').disabled = n === 1;
      $('[data-diag-next]').innerHTML = n === diag.max ? `Voir ma recommandation ${icon('i-arrow')}` : `Continuer ${icon('i-arrow')}`;
      $('[data-diag-bar]').style.width = (n / diag.max) * 100 + '%';
      $$('[data-diag-nav] li').forEach((li, i) => { li.classList.toggle('is-done', i + 1 < n); li.classList.toggle('is-current', i + 1 === n); });
      err.textContent = '';
      const fs = $(`[data-step="${n}"]`, form);
      if (animOK()) window.gsap.fromTo(fs, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    };
    const valid = (n) => {
      const fs = $(`[data-step="${n}"]`, form);
      if (n === 4 && !$$('input[name="zones"]:checked', form).length) return 'Choisissez au moins une zone à sécuriser.';
      const radios = $$('input[type="radio"]', fs);
      if (radios.length && !radios.some((r) => r.checked)) return 'Choisissez une réponse pour continuer.';
      return '';
    };
    form.addEventListener('change', (e) => {
      if (e.target.name === 'logement') {
        const lv = $(`input[name="niveaux"][value="${e.target.value === 'appartement' ? 1 : 2}"]`, form);
        if (!$('input[name="niveaux"]:checked', form)) lv.checked = true;
      }
      err.textContent = '';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = valid(diag.step);
      if (msg) { err.textContent = msg; return; }
      if (diag.step < diag.max) { show(diag.step + 1); $(`[data-step="${diag.step}"] input`, form).focus(); return; }
      showDiagResult(form);
    });
    $('[data-diag-prev]').addEventListener('click', () => { if (diag.step > 1) show(diag.step - 1); });
    diag.show = show;
    show(1);
  }
  function showDiagResult(form) {
    const fd = new FormData(form);
    const niveaux = fd.get('logement') === 'appartement' ? Math.min(+fd.get('niveaux'), 2) : +fd.get('niveaux');
    const age = +fd.get('age');
    const zones = $$('input[name="zones"]:checked', form);
    const need = Math.max(2, zones.reduce((s, z) => s + +z.dataset.p, 0));
    const keysNeed = 1 + fd.getAll('acces').length;
    const kitId = niveaux >= 2 ? 'kit-maison' : need <= 4 ? 'kit-decouverte' : 'kit-famille';
    const kit = PRODUCTS[kitId];
    const lines = [{ id: kitId, qty: 1 }];
    const xN = Math.max(0, niveaux - kit.contents.nids);
    const xP = Math.ceil(Math.max(0, need - kit.contents.pastilles) / 4);
    const xK = Math.max(0, keysNeed - kit.contents.cles);
    if (xN) lines.push({ id: 'nid', qty: xN });
    if (xP) lines.push({ id: 'pastilles-4', qty: xP });
    if (xK) lines.push({ id: 'cle', qty: xK });
    const total = lines.reduce((s, l) => s + PRODUCTS[l.id].price * l.qty, 0);
    const ageTips = [
      'Toutes les zones sensibles en verrouillage à l’approche, alertes discrètes.',
      'Verrouillage à l’approche partout ; le placard à casseroles peut passer en simple alerte.',
      'Placard à goûters en simple alerte, le reste verrouillé à l’approche.',
      'Escalier et goûters en alerte ou libres de jour ; produits ménagers et pharmacie toujours verrouillés.',
    ];
    const zoneNames = zones.map((z) => z.closest('.option').querySelector('strong').textContent.toLowerCase());
    const res = $('[data-diag-result]');
    form.hidden = true;
    $('.diag__progress').hidden = true;
    $$('[data-diag-nav] li').forEach((li) => { li.classList.add('is-done'); li.classList.remove('is-current'); });
    res.hidden = false;
    res.innerHTML = `<div class="result">
      <div class="result__head">
        <div>
          <p class="eyebrow eyebrow--light">Notre recommandation</p>
          <h2 class="h2">${esc(kit.name)}${lines.length > 1 ? ' + compléments' : ''}</h2>
          <p>Pour ${niveaux} niveau${niveaux > 1 ? 'x' : ''}, environ ${need} zone${need > 1 ? 's' : ''} sensibles et ${keysNeed} personne${keysNeed > 1 ? 's' : ''} équipée${keysNeed > 1 ? 's' : ''} d’une Clé.</p>
        </div>
        ${kitArt(kit.contents, '')}
      </div>
      <ul class="result__lines">
        ${lines.map((l) => { const p = PRODUCTS[l.id]; return `<li><span><strong>${l.qty} × ${esc(p.name)}</strong><small>${esc(p.short)}</small></span><b>${euro(p.price * l.qty)}</b></li>`; }).join('')}
      </ul>
      <p class="result__total"><span>Total estimé</span><span>${euro(total)}</span></p>
      <div class="result__why">
        <h3>Pourquoi cette configuration</h3>
        <ul>
          <li>${icon('i-radar')}<span>${niveaux > 1 ? `Un Nid par niveau, soit ${niveaux} Nids au total.` : 'Un seul Nid couvre votre niveau de vie.'}</span></li>
          <li>${icon('i-lock')}<span>Zones retenues : ${esc(zoneNames.join(', '))}.</span></li>
          <li>${icon('i-grow')}<span>Réglage conseillé pour son âge : ${ageTips[age]}</span></li>
        </ul>
      </div>
      <div class="result__actions">
        <button class="btn btn--primary btn--lg" type="button" data-diag-add>Ajouter la sélection au panier ${icon('i-arrow')}</button>
        <a class="btn btn--ghost btn--lg" href="#/produit/${kitId}">Voir le ${esc(kit.name)}</a>
        <button class="btn-link" type="button" data-diag-restart>Recommencer</button>
      </div>
      <p class="form-note">Estimation indicative. Vous pourrez ajuster votre installation à tout moment.</p>
    </div>`;
    res.focus();
    if (animOK()) window.gsap.fromTo($$('.result > *', res), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 });
    window.scrollTo({ top: res.getBoundingClientRect().top + window.scrollY - 120, behavior: reduced() ? 'auto' : 'smooth' });
    $('[data-diag-add]', res).addEventListener('click', (e) => {
      lines.forEach((l) => addToCart(l.id, l.qty, null, { silent: true }));
      flyToCart(e.currentTarget); bumpCount();
      openCart();
    });
    $('[data-diag-restart]', res).addEventListener('click', resetDiag);
  }
  function resetDiag() {
    const form = $('[data-diag-form]');
    form.reset();
    form.hidden = false;
    $('.diag__progress').hidden = false;
    const res = $('[data-diag-result]');
    res.hidden = true; res.innerHTML = '';
    if (diag.show) diag.show(1);
  }

  /* =========================================================
     Technologie
     ========================================================= */
  function canvasLoop(canvas, draw, cleanups) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0, vis = false;
    const size = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) draw(ctx, w, h, 2.4);
    };
    const loop = (ts) => { draw(ctx, w, h, ts / 1000); raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(size); ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => {
      vis = en.isIntersecting;
      if (vis && !raf && !reduced()) raf = requestAnimationFrame(loop);
      if (!vis && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(canvas);
    size();
    cleanups.push(() => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); raf = 0; });
  }
  const C = { encre: '31,58,77', bleu: '79,122,150', brume: '201,219,230', abricot: '232,160,122', coquille: '247,245,241' };
  const rgba = (c, a) => `rgba(${C[c]},${a})`;

  function drawRadar(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.84, R = Math.min(w, h) * 0.78;
    const a0 = Math.PI * 1.17, a1 = Math.PI * 1.83;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, (R * i) / 5, a0, a1);
      ctx.strokeStyle = rgba('brume', 0.13); ctx.lineWidth = 1; ctx.stroke();
    }
    [a0, (a0 + a1) / 2, a1].forEach((a) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.strokeStyle = rgba('brume', 0.1); ctx.stroke(); });
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.28 + k / 3) % 1;
      ctx.beginPath(); ctx.arc(cx, cy, R * ph, a0, a1);
      ctx.strokeStyle = rgba('brume', 0.55 * (1 - ph)); ctx.lineWidth = 1.5; ctx.stroke();
    }
    const px = cx + Math.sin(t * 0.45) * R * 0.42, py = cy - R * (0.5 + Math.sin(t * 0.31) * 0.14);
    const d = Math.hypot(px - cx, py - cy);
    const hit = Math.max(0, 1 - Math.abs(((t * 0.28) % 1) * R - d) / 40);
    ctx.beginPath(); ctx.arc(px, py, 18 + hit * 10, 0, Math.PI * 2); ctx.fillStyle = rgba('abricot', 0.16 + hit * 0.2); ctx.fill();
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = rgba('abricot', 1); ctx.fill();
    ctx.font = '600 12px "Hanken Grotesk", sans-serif'; ctx.fillStyle = rgba('brume', 0.9);
    const ang = Math.round((Math.atan2(cx - px, cy - py) * 180) / Math.PI);
    ctx.fillText(`${(d / R * 8).toFixed(1).replace('.', ',')} m · ${ang}°`, px + 16, py - 12);
    // Le Nid
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 34, 9, 0, 0, Math.PI * 2); ctx.fillStyle = rgba('encre', 0.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 32, cy + 2); ctx.bezierCurveTo(cx - 32, cy - 30, cx + 32, cy - 30, cx + 32, cy + 2); ctx.closePath();
    ctx.fillStyle = rgba('coquille', 1); ctx.fill();
    const b = (Math.sin(t * 2) + 1) / 2;
    ctx.beginPath(); ctx.arc(cx, cy - 12, 9 + b * 5, 0, Math.PI * 2); ctx.fillStyle = rgba('abricot', 0.2 + b * 0.2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy - 12, 4, 0, Math.PI * 2); ctx.fillStyle = rgba('abricot', 1); ctx.fill();
  }

  const cloud = Array.from({ length: 46 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.pow(Math.random(), 0.7), s: 0.5 + Math.random() }));
  function drawCloud(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const gap = 22;
    ctx.fillStyle = rgba('brume', 0.13);
    for (let x = gap / 2; x < w; x += gap) for (let y = gap / 2; y < h; y += gap) { ctx.fillRect(x, y, 1.5, 1.5); }
    const cx = w * (0.5 + Math.sin(t * 0.35) * 0.28), cy = h * (0.52 + Math.sin(t * 0.52) * 0.22);
    const spread = Math.min(w, h) * 0.09;
    cloud.forEach((p) => {
      const j = Math.sin(t * 3 * p.s + p.a) * 3;
      const x = cx + Math.cos(p.a + t * 0.2) * p.r * spread + j, y = cy + Math.sin(p.a) * p.r * spread * 1.3 + j;
      ctx.beginPath(); ctx.arc(x, y, 1.6 + p.s, 0, Math.PI * 2); ctx.fillStyle = rgba('brume', 0.35 + 0.4 * (1 - p.r)); ctx.fill();
    });
    ctx.strokeStyle = rgba('brume', 0.3); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fillStyle = rgba('abricot', 0.22); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 6.5, 0, Math.PI * 2); ctx.fillStyle = rgba('abricot', 1); ctx.fill();
    const mx = ((cx / w) * 6).toFixed(2).replace('.', ','), my = ((cy / h) * 4.5).toFixed(2).replace('.', ',');
    ctx.font = '600 12px "Hanken Grotesk", sans-serif'; ctx.fillStyle = rgba('coquille', 0.95);
    const label = `x ${mx} m · y ${my} m`;
    const tx = cx + 22 + 150 > w ? cx - 22 - ctx.measureText(label).width : cx + 22;
    ctx.fillText(label, tx, cy - 14);
  }

  const AGE_LABELS = ['6 mois', '1 an', '18 mois', '2 ans', '3 ans', '4 ans et plus'];
  const AGE_ZONES = [
    ['Produits ménagers', ['lock', 'lock', 'lock', 'lock', 'lock', 'lock']],
    ['Armoire à pharmacie', ['lock', 'lock', 'lock', 'lock', 'lock', 'lock']],
    ['Tiroir à ustensiles', ['lock', 'lock', 'lock', 'lock', 'lock', 'alert']],
    ['Portillon d’escalier', ['lock', 'lock', 'lock', 'lock', 'alert', 'free']],
    ['Porte du jardin', ['lock', 'lock', 'lock', 'lock', 'alert', 'alert']],
    ['Placard à casseroles', ['lock', 'alert', 'alert', 'free', 'free', 'free']],
    ['Placard à goûters', ['lock', 'lock', 'alert', 'alert', 'free', 'free']],
    ['Coffre à jouets', ['free', 'free', 'free', 'free', 'free', 'free']],
  ];
  const Z_LABEL = { lock: 'Verrouillée', alert: 'Alerte', free: 'Libre' };
  function bindAgeTool() {
    const range = $('[data-age-range]');
    if (range.dataset.bound) return;
    range.dataset.bound = '1';
    const out = $('[data-age-out]'), list = $('[data-age-zones]');
    list.innerHTML = AGE_ZONES.map(([n]) => `<li class="age-zone"><span>${esc(n)}</span><b class="z"></b></li>`).join('');
    const update = () => {
      const i = +range.value;
      out.textContent = AGE_LABELS[i];
      range.setAttribute('aria-valuetext', AGE_LABELS[i]);
      range.style.setProperty('--p', (i / 5) * 100 + '%');
      $$('.age-zone', list).forEach((li, k) => {
        const st = AGE_ZONES[k][1][i];
        const b = $('b', li);
        if (b.dataset.st !== st) {
          b.dataset.st = st; b.className = 'z z--' + st; b.textContent = Z_LABEL[st];
          if (animOK()) window.gsap.fromTo(b, { scale: 0.85, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
        }
      });
    };
    range.addEventListener('input', update);
    update();
  }
  function bindFail() {
    const btn = $('[data-fail-btn]');
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const off = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', off);
      $('[data-fail-figure]').classList.toggle('is-off', off);
      $('[data-fail-nid]').textContent = off ? 'Batterie' : 'Secteur';
      btn.lastChild.textContent = off ? ' Rétablir le courant' : ' Simuler une coupure';
      $('[data-fail-msg]').textContent = off ? 'Coupure simulée : le Nid passe sur batterie, la Pastille reste verrouillée.' : 'Courant : normal.';
    });
  }
  function initTech(cleanups) {
    const rv = $('[data-radar-viz] canvas');
    canvasLoop(rv, drawRadar, cleanups);
    const pc = $('[data-pointcloud]');
    if (!$('canvas', pc)) pc.appendChild(document.createElement('canvas'));
    canvasLoop($('canvas', pc), drawCloud, cleanups);
    bindAgeTool();
    bindFail();
    // Sous-navigation active
    const links = $$('.subnav a');
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.dataset.scrollTo === en.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('.tech-block').forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());
    setupReveals($('[data-page="technologie"]'), cleanups);
  }

  /* =========================================================
     Application
     ========================================================= */
  function initApp(cleanups) {
    const phone = $('#ap-screens');
    initTabs($('[data-tabs="app"]'), (tab) => {
      $$('[data-screen-panel]', phone).forEach((s) => s.classList.toggle('is-active', s.dataset.screenPanel === tab.dataset.screen));
      phone.setAttribute('aria-labelledby', tab.id);
    });
    if (animOK()) {
      const { gsap } = window;
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
      tl.to('[data-map-child]', { left: '30%', top: '30%', duration: 2.4 })
        .to('[data-map-child]', { left: '48%', top: '58%', duration: 2.6 })
        .to('[data-map-child]', { left: '56%', top: '34%', duration: 2.2 });
      const intro = gsap.fromTo('.phone', { y: 40, opacity: 0, rotate: -4 }, { y: 0, opacity: 1, rotate: 0, duration: 1.2, ease: 'expo.out' });
      cleanups.push(() => { tl.kill(); intro.kill(); });
    }
    setupReveals($('[data-page="application"]'), cleanups);
  }

  /* =========================================================
     FAQ
     ========================================================= */
  function renderFaq() {
    const root = $('[data-faq-root]');
    if (root.dataset.done) return;
    root.dataset.done = '1';
    let n = 0;
    root.innerHTML = FAQ.map(([cat, qs]) => `<div class="faq-group"><h2>${esc(cat)}</h2><div class="accordion">${qs.map(([q, a]) => accHTML(`fq-${n++}`, q, a)).join('')}</div></div>`).join('');
    const input = $('[data-faq-search]');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      let any = false;
      $$('.faq-group', root).forEach((g) => {
        let vis = 0;
        $$('.acc', g).forEach((a) => {
          const hay = a.dataset.q.normalize('NFD').replace(/[̀-ͯ]/g, '');
          const ok = !q || hay.includes(q);
          a.hidden = !ok; if (ok) vis++;
        });
        g.hidden = !vis; if (vis) any = true;
      });
      $('[data-faq-empty]').hidden = any;
    });
  }

  /* =========================================================
     Commande (simulée)
     ========================================================= */
  const co = { step: 1, ship: 'domicile' };
  let lastOrder = null;
  function renderCheckoutSummary() {
    const t = totals(co.ship);
    $('[data-summary-items]').innerHTML = cart.items.map((i) => {
      const p = PRODUCTS[i.id];
      const vName = p.variants && i.variant ? p.variants.options.find((o) => o.id === i.variant)?.name : '';
      return `<li><span class="thumb">${thumbArt(p, i.variant)}<em>${i.qty}</em></span><span><strong>${esc(p.name)}</strong><small>${esc(vName || (p.recurring ? 'Abonnement mensuel' : ''))}</small></span><b>${euro(p.price * i.qty)}</b></li>`;
    }).join('');
    $('[data-summary-totals]').innerHTML = totalsHTML(t, SHIPPING[co.ship].label);
    const opts = $('[data-ship-options]');
    opts.innerHTML = Object.entries(SHIPPING).map(([k, m]) => {
      const price = !t.shippable ? 0 : t.free && m.freeable ? 0 : m.price;
      return `<label class="ship-opt"><input type="radio" name="ship" value="${k}" ${co.ship === k ? 'checked' : ''}><span><strong>${esc(m.label)}</strong><small>${esc(m.delay)}</small><b>${price ? euro(price) : 'Offerte'}</b></span></label>`;
    }).join('');
  }
  function bindCheckout() {
    const form = $('[data-checkout-form]');
    if (form.dataset.bound) return;
    form.dataset.bound = '1';
    const err = $('[data-co-error]');
    const labels = ['Continuer vers la livraison', 'Continuer vers le paiement', 'Valider la commande (simulation)'];
    const show = (n) => {
      co.step = n;
      $$('.co-step', form).forEach((f) => { f.hidden = +f.dataset.coStep !== n; });
      $('[data-co-prev]').hidden = n === 1;
      $('[data-co-next]').textContent = labels[n - 1];
      $$('[data-stepper] li').forEach((li, i) => {
        li.classList.toggle('is-done', i + 1 < n);
        li.classList.toggle('is-current', i + 1 === n);
        if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      err.textContent = '';
    };
    co.show = show;
    const check = (n) => {
      const fs = $(`[data-co-step="${n}"]`, form);
      let first = null;
      $$('input[required]', fs).forEach((inp) => {
        const ok = inp.type === 'checkbox' ? inp.checked : inp.checkValidity() && inp.value.trim() !== '';
        if (inp.type !== 'checkbox') inp.setAttribute('aria-invalid', !ok);
        if (!ok && !first) first = inp;
      });
      if (first) {
        err.textContent = first.type === 'checkbox' ? 'Merci de confirmer que vous avez compris le caractère fictif de la commande.' : 'Merci de compléter correctement les champs indiqués.';
        first.focus();
        return false;
      }
      return true;
    };
    form.addEventListener('change', (e) => {
      if (e.target.name === 'ship') { co.ship = e.target.value; renderCheckoutSummary(); }
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'false');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!cart.items.length) return;
      if (!check(co.step)) return;
      if (co.step < 3) { show(co.step + 1); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); return; }
      const t = totals(co.ship);
      lastOrder = {
        no: 'SRN-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        total: t.total, count: t.count, ship: SHIPPING[co.ship].label,
        lines: cart.items.map((i) => `${i.qty} × ${PRODUCTS[i.id].name}`),
      };
      cart.items = []; cart.promo = null; saveCart(); renderCart();
      form.reset(); $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
      co.ship = 'domicile';
      show(1);
      location.hash = '#/confirmation';
    });
    $('[data-co-prev]').addEventListener('click', () => show(Math.max(1, co.step - 1)));
    $('[data-fill-demo]').addEventListener('click', () => {
      const demo = { first: 'Camille', last: 'Exemple', email: 'camille@exemple.fr', address: '12 rue des Tilleuls', zip: '36000', city: 'Châteauroux' };
      Object.entries(demo).forEach(([k, v]) => { const i = form.elements[k]; if (i) { i.value = v; i.setAttribute('aria-invalid', 'false'); } });
      toast('Données fictives ajoutées');
    });
    show(1);
  }
  function initCheckout() {
    bindCheckout();
    const empty = !cart.items.length;
    const form = $('[data-checkout-form]');
    $('.checkout__grid').hidden = empty;
    $('[data-stepper]').hidden = empty;
    let note = $('[data-co-empty]');
    if (empty && !note) {
      note = document.createElement('div');
      note.dataset.coEmpty = '';
      note.className = 'notice';
      note.innerHTML = `${icon('i-info')}<p>Votre panier est vide. <a href="#/boutique">Découvrir la boutique</a></p>`;
      form.closest('.container').appendChild(note);
    }
    if (note) note.hidden = !empty;
    if (!empty) renderCheckoutSummary();
  }
  function initConfirmation() {
    const card = $('[data-confirm-card]');
    if (lastOrder) {
      card.innerHTML = `<p class="order-no"><span>Commande n° ${esc(lastOrder.no)}</span><span>${euro(lastOrder.total)}</span></p><p class="muted" style="margin:0">${esc(lastOrder.lines.join(' · '))} — livraison : ${esc(lastOrder.ship)}</p>`;
      $('[data-confirm-text]').textContent = 'Votre commande fictive a bien été simulée. Votre panier a été vidé.';
    } else {
      card.innerHTML = '';
      $('[data-confirm-text]').textContent = 'Aucune commande récente : ce site est une simulation.';
    }
  }

  /* =========================================================
     Formulaires simulés (newsletter, contact)
     ========================================================= */
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-fake-form]');
    if (!form) return;
    e.preventDefault();
    const msg = $('.form-msg', form);
    let bad = null;
    $$('[required]', form).forEach((i) => {
      const ok = i.checkValidity() && i.value.trim() !== '';
      i.setAttribute('aria-invalid', !ok);
      if (!ok && !bad) bad = i;
    });
    msg.classList.remove('is-ok');
    if (bad) { msg.textContent = bad.type === 'email' ? 'Merci d’indiquer une adresse e-mail valide.' : 'Merci de compléter les champs requis.'; bad.focus(); return; }
    form.reset();
    $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
    msg.classList.add('is-ok');
    msg.textContent = form.dataset.fakeForm === 'newsletter'
      ? 'Merci ! Inscription simulée : aucune adresse n’a été enregistrée.'
      : 'Merci ! Message simulé : rien n’a été envoyé ni conservé.';
  });

  /* =========================================================
     Routeur (navigation SPA par hash)
     ========================================================= */
  const TITLES = {
    home: 'Sérénid — Protéger sans enfermer',
    boutique: 'Boutique — Sérénid',
    diagnostic: 'Diagnostic de la maison — Sérénid',
    technologie: 'Technologie — Sérénid',
    application: 'Application — Sérénid',
    histoire: 'Notre histoire — Sérénid',
    faq: 'Questions fréquentes — Sérénid',
    livraison: 'Livraison & retours — Sérénid',
    contact: 'Contact — Sérénid',
    mentions: 'Mentions légales — Sérénid',
    commande: 'Commande — Sérénid',
    confirmation: 'Confirmation — Sérénid',
    404: 'Page introuvable — Sérénid',
  };
  let currentRoute = { name: null, param: null };
  let cleanups = [];
  let firstRoute = true;

  function parseHash() {
    const raw = decodeURIComponent(location.hash || '');
    if (!raw || raw === '#' || raw === '#/') return { name: 'home' };
    if (!raw.startsWith('#/')) return { name: 'home', anchor: raw.slice(1) };
    const [name, param] = raw.slice(2).split('/');
    if (name === 'produit') return PRODUCTS[param] ? { name, param } : { name: '404' };
    return TITLES[name] && name !== '404' ? { name } : { name: '404' };
  }

  function router(force = false) {
    const r = parseHash();
    const same = r.name === currentRoute.name && r.param === currentRoute.param;
    if (same && !force) { if (r.anchor) scrollToId(r.anchor); return; }

    cleanups.forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
    cleanups = [];
    closeMenu(); closeCart(false);

    $$('.page').forEach((p) => { const on = p.dataset.page === r.name; p.hidden = !on; p.classList.remove('is-entering'); });
    const page = $(`.page[data-page="${r.name}"]`);
    currentRoute = r;
    document.title = TITLES[r.name] || TITLES.home;
    $$('[data-nav]').forEach((a) => { if (a.dataset.nav.split(' ').includes(r.name)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const sticky = $('[data-sticky-buy]'); if (sticky && r.name !== 'produit') sticky.remove();

    if (!same || force) window.scrollTo(0, 0);
    if (!firstRoute && !reduced()) { void page.offsetWidth; page.classList.add('is-entering'); }

    switch (r.name) {
      case 'home': initHome(cleanups); break;
      case 'boutique': bindShop(); renderShop(); setupReveals(page, cleanups); break;
      case 'produit': renderProduct(r.param, cleanups); break;
      case 'diagnostic': bindDiag(); break;
      case 'technologie': initTech(cleanups); break;
      case 'application': initApp(cleanups); break;
      case 'faq': renderFaq(); break;
      case 'commande': initCheckout(); break;
      case 'confirmation': initConfirmation(); break;
      default: break;
    }
    if (r.name !== 'home' && r.name !== 'technologie' && r.name !== 'application' && r.name !== 'boutique') setupReveals(page, cleanups);
    if (hasGSAP()) requestAnimationFrame(() => window.ScrollTrigger.refresh());

    if (!firstRoute) {
      const h = $('h1', page);
      const target = h || $('#main');
      if (h && !h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    if (r.anchor) setTimeout(() => scrollToId(r.anchor), 80);
    firstRoute = false;
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const head = $('[data-header]').offsetHeight || 76;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - head - 12, behavior: reduced() ? 'auto' : 'smooth' });
  }

  /* ---------- Menu mobile ---------- */
  const menu = $('#mobile-menu');
  const menuBtn = $('[data-menu-toggle]');
  function openMenu() {
    menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Fermer le menu');
    $('use', menuBtn).setAttribute('href', '#i-close');
    document.documentElement.style.overflow = 'hidden';
    $('[data-header]').classList.add('is-scrolled');
  }
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true; menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Ouvrir le menu');
    $('use', menuBtn).setAttribute('href', '#i-menu');
    if (drawer.hidden) document.documentElement.style.overflow = '';
    onScroll();
  }

  /* ---------- En-tête au scroll ---------- */
  const header = $('[data-header]');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8 || !menu.hidden); }

  /* ---------- Micro-interactions : bouton magnétique + halo ---------- */
  function bindPointerFX() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.addEventListener('pointermove', (e) => {
      const b = e.target.closest && e.target.closest('.btn--primary');
      if (b) {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', e.clientX - r.left + 'px');
        b.style.setProperty('--my', e.clientY - r.top + 'px');
      }
    }, { passive: true });
    if (reduced()) return;
    $$('[data-magnetic]').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- Événements globaux ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-cart-open]')) { e.preventDefault(); openCart(); return; }
    if (t.closest('[data-cart-close]')) { closeCart(!t.closest('a')); return; }
    if (t.closest('[data-menu-toggle]')) { menu.hidden ? openMenu() : closeMenu(); return; }
    const qa = t.closest('[data-quick-add]');
    if (qa) { e.preventDefault(); addToCart(qa.dataset.quickAdd, 1, null, { from: qa }); return; }
    const st = t.closest('[data-scroll-to]');
    if (st) { e.preventDefault(); scrollToId(st.dataset.scrollTo); return; }
    const item = t.closest('.cart-item');
    if (item) {
      const key = item.dataset.key;
      const line = cart.items.find((i) => lineKey(i.id, i.variant) === key);
      if (t.closest('[data-remove]')) { setQty(key, 0); toast('Article retiré du panier'); $('[data-cart-close]', drawer).focus(); return; }
      const q = t.closest('[data-qty]');
      if (q && line) {
        setQty(key, line.qty + +q.dataset.qty);
        const again = $(`.cart-item[data-key="${CSS.escape(key)}"] [data-qty="${q.dataset.qty}"]`, drawer);
        (again || $('[data-cart-close]', drawer)).focus();
      }
    }
    const a = t.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') === location.hash) router(true);
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-qty-input]')) {
      const key = e.target.closest('.cart-item').dataset.key;
      setQty(key, Math.round(+e.target.value) || 1);
    }
  });
  backdrop.addEventListener('click', () => closeCart());
  drawer.addEventListener('keydown', (e) => trapFocus(e, drawer));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!drawer.hidden) closeCart();
    else if (!menu.hidden) { closeMenu(); menuBtn.focus(); }
  });
  $('[data-promo-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#promo-code');
    const code = input.value.trim().toUpperCase();
    const msg = $('[data-promo-msg]');
    if (PROMOS[code]) { cart.promo = code; saveCart(); renderCart(); input.value = ''; }
    else { msg.textContent = code ? `Le code « ${code} » n’est pas valide.` : 'Saisissez un code promo.'; }
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', () => router());

  /* ---------- Marquee : duplication pour une boucle continue ---------- */
  function initMarquee() {
    const track = $('.marquee__track');
    if (!track || track.dataset.dup) return;
    track.dataset.dup = '1';
    $$('li', track).forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
  }

  /* ---------- Démarrage ---------- */
  initMarquee();
  renderCart();
  tickCountdown();
  setInterval(tickCountdown, 20000);
  bindPointerFX();
  onScroll();
  router();
})();
