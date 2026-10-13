// Configuration de l'espace membre.
// Pour ajouter un secteur : ajoute une entrée ici et crée le dossier content/<slug>/.
// Pour ajouter un chapitre : dépose un fichier .md dans le dossier du secteur (voir README).

export default {
  brand: '100% REQUIN',
  title: 'Espace membre',
  tagline: 'La formation complète pour lancer, vendre et structurer ton activité en ligne.',
  author: '100% REQUIN',
  discord: 'https://discord.gg/4xzmPTQWx',
  lang: 'fr',

  sectors: [
    {
      slug: 'demarrer',
      title: 'Démarrer ici',
      short: 'Démarrer',
      icon: 'compass',
      description:
        "Comprendre comment la formation est construite, choisir ton parcours et passer à l'action dès aujourd'hui.",
      modules: [
        { id: 'bienvenue', title: 'Bienvenue', description: 'Le mode d’emploi de la plateforme.' },
        {
          id: 'action',
          title: 'Passer à l’action',
          description: 'Le plan 30 jours, les questions fréquentes et le vocabulaire.',
        },
      ],
    },
    {
      slug: 'smma',
      title: 'SMMA — Agence de marketing digital',
      short: 'SMMA',
      icon: 'target',
      description:
        'Construire, vendre et gérer une agence qui apporte de la visibilité aux entreprises locales : de la première liste de prospects au client fidélisé.',
      modules: [
        {
          id: 'parcours',
          title: 'Le parcours et la méthode',
          description:
            'Une histoire réelle, la méthode en 4 puis en 10 étapes, et les chiffres derrière.',
        },
        {
          id: 'fondations',
          title: 'Fondations, niche et offres',
          description:
            'Comprendre le modèle, choisir ta niche, valider la demande et construire des offres qui se vendent.',
        },
        {
          id: 'prospection',
          title: 'Prospection et acquisition',
          description:
            'Trouver, organiser, auditer et contacter des prospects qualifiés — sans harceler.',
        },
        {
          id: 'vente',
          title: 'Vente et closing',
          description:
            'Mener le rendez-vous, présenter une proposition, fixer ton prix et te protéger.',
        },
        {
          id: 'livraison',
          title: 'Livraison et fidélisation',
          description:
            'Livrer proprement, organiser la production, mesurer et transformer un client en revenu récurrent.',
        },
        {
          id: 'ia',
          title: 'Outils, IA et automatisation',
          description: 'Gagner du temps avec l’IA et des workflows reproductibles (n8n, no-code).',
        },
        {
          id: 'gestion',
          title: 'Gestion et rentabilité',
          description:
            'Coûts, marges, tarifs, indicateurs : développer l’agence sans dégrader la qualité.',
        },
      ],
    },
    {
      slug: 'fiscalite',
      title: 'Fiscalité & cadre juridique',
      short: 'Fiscalité',
      icon: 'scale',
      description:
        'Choisir ton statut, créer ta structure, comprendre impôts, cotisations et TVA, facturer correctement et rester en règle — y compris avant 18 ans.',
      modules: [
        {
          id: 'cadre',
          title: 'Le cadre légal et le statut',
          description:
            'Ce que la loi autorise selon ton âge, le choix du statut et les formalités de création.',
        },
        {
          id: 'impots',
          title: 'Impôts, cotisations et TVA',
          description: 'Ce que tu paies, quand, et pourquoi — avec des exemples chiffrés.',
        },
        {
          id: 'gestion',
          title: 'Facturer, gérer et rester en règle',
          description:
            'Factures, justificatifs, contrats, obligations de la vente en ligne et checklists.',
        },
      ],
    },
  ],
}
