/* =============================================================================
   CASTEL STUDIO — configuration
   Le SEUL fichier à modifier après la mise en ligne.

   Tant qu'une valeur est vide, la fonction correspondante bascule sur un
   repli propre : rien n'a l'air cassé sur le site.
   ========================================================================== */
window.CASTEL = {

  /* ── Le paiement (Stripe Payment Links) ────────────────────────────────
     Stripe → Catalogue de produits → Liens de paiement → Créer.
     setup1x : la mise en place 990 € HT en une fois.
     setup2x : la première échéance de 495 € HT (la seconde est facturée à la
               mise en service).
     Dans chaque lien, réglez « Après le paiement » sur une redirection vers
     https://castelstudio.netlify.app/bienvenue.html
     Vide → les boutons de paiement mènent au formulaire de contact, offre
     pré-cochée.                                                              */
  stripe: {
    setup1x: "",
    setup2x: ""
  },

  /* ── L'offre de lancement « agences fondatrices » ──────────────────────
     Premier mois d'abonnement offert aux premières agences. Mettez à jour
     « restantes » à chaque signature ; à 0 (ou actif: false), le bandeau
     disparaît partout. Ne l'affichez que si c'est vrai.                     */
  fondateurs: { actif: true, places: 5, restantes: 5 },

  /* ── La prise de rendez-vous ────────────────────────────────────────────
     Lien public de votre agenda (Calendly, Cal.com, Google Agenda…) pour
     l'appel de 20 minutes. Vide → formulaire de contact.                     */
  reservation: "",

  /* ── La vidéo de démonstration ──────────────────────────────────────────
     Une adresse MP4 (ex. "assets/video/demo.mp4"), YouTube ou Vimeo.
     Vide → le lecteur joue le film animé maison (film.html), sans fichier.   */
  videoDemo: "",

  /* ── L'assistant ────────────────────────────────────────────────────────
     URL du webhook « Production » du workflow n8n de l'assistant.
     Vide → l'assistant répond avec ses réponses préparées, sans IA.          */
  webhookAssistant: "",

  /* ── Les données (Supabase) ─────────────────────────────────────────────
     Settings → API. La clé « anon public » est publique par nature : la
     sécurité vient des règles RLS (voir supabase/01-securite.sql).           */
  supabaseUrl: "https://ponwkdlasixpmxagxlxk.supabase.co",
  supabaseCle: "sb_publishable_cie2Hn8IQSIPo2vac7-5QA_8dtNRssz",

  /* ── La voix de l'assistant (navigateur, gratuit) ───────────────────── */
  voix: true,

  /* ── Statistiques ───────────────────────────────────────────────────────
     Identifiant Google Analytics 4 (« G-XXXXXXXXXX »). Chargé uniquement si
     le visiteur accepte les cookies. Vide → aucun script de mesure.          */
  gaId: ""
};
