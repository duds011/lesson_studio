/**
 * French (France) — generated from messages/en.ts by scripts/translate.mjs.
 *
 * Edit en.ts and re-run rather than editing this file: a hand-fix here is
 * lost the next time the English changes, and the shape is checked against
 * English on the way in so the two cannot drift apart silently.
 */
import type { Messages } from "./en"

export const fr: Messages = {
  "common": {
    "save": "Enregistrer",
    "saving": "Enregistrement…",
    "saved": "Enregistré",
    "cancel": "Annuler",
    "close": "Fermer",
    "delete": "Supprimer",
    "edit": "Modifier",
    "back": "Retour",
    "next": "Suivant",
    "done": "Terminé",
    "loading": "Chargement…",
    "retry": "Réessayer",
    "signOut": "Se déconnecter",
    "somethingWrong": "Une erreur est survenue. Réessayez dans un instant."
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "Espace enseignant",
    "overviewAria": "Présentation de Lesson Studio",
    "navAria": "Navigation de l’espace enseignant",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu",
    "expand": "Développer la navigation",
    "collapse": "Réduire la navigation",
    "sectionWorkspace": "Espace",
    "sectionManage": "Gérer",
    "overview": "Présentation",
    "students": "Élèves",
    "notes": "Notes",
    "materials": "Supports",
    "studentView": "Vue élève",
    "availability": "Disponibilités",
    "settings": "Paramètres",
    "calendarConnected": "Agenda connecté",
    "setupNeeded": "Configuration requise",
    "recordingsOnly": "Enregistrements uniquement",
    "studentPortal": "Portail élève"
  },
  "platforms": [
    "Google Meet",
    "Zoom",
    "Preply",
    "italki",
    "Une autre plateforme"
  ],
  "calendarModes": [
    {
      "label": "Oui — elles sont sur mon Google Agenda",
      "hint": "Nous lisons vos cours, prenons les réservations et envoyons l’enregistreur"
    },
    {
      "label": "Non — je planifie ailleurs",
      "hint": "Les cours arrivent en tant qu’enregistrements ; rien de lié à un agenda n’est affiché"
    }
  ],
  "auth": {
    "language": "Langue",
    "emailLabel": "Adresse e-mail",
    "emailPlaceholder": "vous@exemple.com",
    "passwordLabel": "Mot de passe",
    "signInTitle": "Se connecter",
    "signInSub": "Bon retour. Connectez-vous pour voir vos cours, progrès et comptes rendus.",
    "signInExpired": "Votre session a expiré. Connectez-vous et nous vous y ramenons aussitôt.",
    "signInAction": "Se connecter",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau sur la plateforme ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "Configuration gratuite, et vous pouvez ajouter un premier élève tout de suite.",
    "studentQuestion": "Vous êtes élève ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d'invitation — ouvrez-le et choisissez votre e-mail et mot de passe. Ensuite, connectez-vous ici.",
    "signInHeadline": "Chaque cours, rédigé.",
    "signInAside": "Lesson Studio transforme chaque heure en compte rendu, graphique de progression et exercices — pour l’enseignant et pour l’élève concerné.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Démarrez votre espace Koku Library pour élèves, comptes rendus, réservations et suivi de progression.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "Au moins 6 caractères",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Déjà un compte ?",
    "signUpHeadline": "Toute votre activité d’enseignement, au même endroit.",
    "signUpAside": "Configuration en quelques minutes. Ajoutez un élève, enregistrez votre prochain cours, et le reste se construit automatiquement."
  },
  "aside": {
    "slides": [
      {
        "title": "Le cours s’écrit tout seul",
        "body": "Une extension Chrome enregistre les deux voix. Le compte rendu est généré — à vous de le relire et publier."
      },
      {
        "title": "Une progression visible",
        "body": "Notes, temps de parole et vocabulaire suivis d’un cours à l’autre, sur une page pensée pour l’élève."
      },
      {
        "title": "Quelle que soit la langue enseignée",
        "body": "Japonais, français, coréen, espagnol et trente autres — corrigés dans la langue du cours, expliqués dans celle de votre élève."
      },
      {
        "title": "De la pratique à partir de leurs mots",
        "body": "Cartes-mémoire et tests oraux créés à partir du vocabulaire du cours."
      },
      {
        "title": "Un portail élève à votre nom",
        "body": "Vos couleurs, vos formulations, et seulement les sections qui servent à vos cours."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos cours",
      "Où vous donnez cours",
      "Votre agenda",
      "Vue élève",
      "Votre enregistreur"
    ],
    "sideTitle": "Configurons votre studio.",
    "sideBody": "Quatre étapes rapides et vos élèves auront leur portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Terminer la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Enregistrement impossible",
    "couldNotFinish": "Finalisation impossible",
    "pickTeaching": "Choisissez la langue que vous enseignez.",
    "pickSpoken": "Choisissez la langue parlée lors des cours.",
    "pickCalendar": "Indiquez-nous si vos cours sont sur un agenda.",
    "pickPortalName": "Donnez un nom au portail — vos élèves le verront.",
    "teachAria": "La langue que vous enseignez",
    "iTeach": "J’enseigne",
    "teachHint": "Les comptes rendus et exercices sont générés pour cette langue. C’est la valeur par défaut pour chaque nouvel élève — chaque élève peut être changé individuellement plus tard.",
    "uiFollows": "Votre espace utilisera aussi cette langue, si elle est disponible — anglais, français ou japonais ; anglais sinon. Vous pouvez changer cela à tout moment dans les paramètres.",
    "spokenAria": "La langue parlée lors des cours",
    "spokenIn": "mes cours sont principalement en",
    "spokenHint": "Souvent ce n’est pas la langue apprise — une heure pour débutant se passe surtout dans la langue partagée. C’est ce que l’enregistreur écoute.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où rencontrez-vous vos élèves ?",
    "platformLead": "Sur Meet ou Zoom, nous créons le lien lors de la réservation. Sur une plateforme, le cours a déjà une salle : nous utilisons le lien existant.",
    "zoomLater": "Connecter Zoom plus tard dans les paramètres",
    "stayOutTitle": "Nous restons en dehors du cours lui-même",
    "stayOutBody": "Aucun lien créé, aucun bot envoyé. Vous enregistrez vous-même et le compte rendu, le vocabulaire et la pratique se construisent à partir de cela — pour vos élèves, tout fonctionne pareil.",
    "calendarTitle": "Où sont vos cours ?",
    "calendarLeadExternal": "Certains enseignants {platform} utilisent toujours Google Agenda, d’autres restent sur la plateforme. Votre choix détermine ce que nous affichons dans l’espace.",
    "calendarLead": "Si vos élèves sont sur votre Google Agenda, nous lisons la semaine, prenons les réservations et envoyons l’enregistreur. Si vous planifiez ailleurs, nous restons en dehors.",
    "googleConnected": "Google Agenda connecté",
    "googleConnectedSub": "Vous pouvez choisir dans les paramètres quel agenda contient vos cours.",
    "connectGoogle": "Connecter Google Agenda",
    "connectGoogleFine": "Vous serez redirigé vers Google pour autorisation, puis de retour ici. Vous pouvez continuer sans, mais réservation et enregistrement automatique seront désactivés jusqu’à connexion.",
    "recordTitle": "Enregistrez le cours",
    "recordBody": "Quel que soit le support utilisé, capturez le cours et importez l’enregistrement dans Lesson Studio.",
    "reviewTitle": "Relisez le compte rendu",
    "reviewBody": "Il arrive dans votre file d’examen comme tout autre cours. Publiez-le pour le rendre accessible à l’élève.",
    "noCalendarFine": "Pas d’agenda, pas de page de réservation, aucune relance — votre espace s’ouvre directement sur les cours et comptes rendus. Vous pouvez changer d’avis dans les paramètres.",
    "brandTitle": "Personnalisez-le",
    "brandLead": "Choisissez une couleur et un nom pour le portail de connexion de vos élèves. Tout peut être personnalisé plus tard.",
    "portalNameLabel": "Nom du portail élève",
    "portalNamePlaceholder": "ex. Sakura Japanese",
    "portalNameFine": "Ce nom apparaît en haut de chaque portail élève, et sur l’invitation qu’ils reçoivent. C’est le nom de votre studio, pas celui de la plateforme.",
    "accent": "Couleur d’accent",
    "previewTagline": "Apprenez aujourd’hui, réussissez demain !",
    "recorderTitle": "Installez l’enregistreur",
    "recorderLead": "C’est l’élément clé : une extension Chrome qui enregistre votre session et rédige le compte rendu. Aucun bot ne rejoint l’appel, rien à installer côté élève.",
    "recorderStep1": "**Ajoutez-le depuis le Chrome Web Store** — un clic, puis épinglez l’extension.",
    "recorderStep2": "**Connectez-vous dans l’extension** avec ce même e-mail et mot de passe. Rien à recopier.",
    "recorderStep3": "**Enregistrez un cours** : sélectionnez l’élève, démarrez, arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "recorderFine": "Vous préférez le tutoriel complet (droits micro, contenus enregistrés) ? C’est sur le {guide} — ou via **Paramètres → Enregistreur de cours** quand vous le souhaitez.",
    "recorderFineLink": "guide de configuration"
  },
  "overview": {
    "eyebrow": "Présentation",
    "title": "Votre agenda pédagogique",
    "manageConnections": "Gérer les connexions",
    "fixInSettings": "Corriger dans les paramètres",
    "summaryAria": "Résumé de cours",
    "upcoming": "Cours à venir",
    "drafts": "Brouillons à valider",
    "draftsSub": "comptes rendus en attente",
    "published": "Comptes rendus publiés",
    "publishedSub": "envoyés aux élèves",
    "writeUpsLeft": "Comptes rendus restants",
    "writeUpsAria": "Comptes rendus restants — en acheter",
    "usageTrial": "{used} utilisés sur vos {total} gratuits",
    "usageBought": "{used} générés · sans date limite",
    "lessonCalendar": "Agenda des cours",
    "primaryCalendar": "(principal)"
  },
  "connect": {
    "title": "Connecter votre Google Agenda",
    "body": "Reliez votre agenda pour que Lesson Studio voie vos prochains cours, prenne les réservations et enregistre chaque session.",
    "notConfigured": "Google OAuth n’est pas encore configuré. Ajoutez {id} et {secret} à l’environnement puis redémarrez.",
    "scopeRead": "**Lire votre agenda** — trouver les cours et les liens de salle",
    "scopeRecord": "**Enregistrer les cours** — capturer les sessions avec l’extension Lesson Studio",
    "scopeRecap": "**Générer des comptes rendus** — résumés AI à relire et partager",
    "continueGoogle": "Continuer avec Google",
    "fine": "Vous serez redirigé vers Google pour autorisation. Gérer cela plus tard dans les paramètres."
  },
  "settings": {
    "eyebrow": "Espace de travail",
    "title": "Paramètres",
    "sectionsAria": "Sections des paramètres",
    "tabs": [
      "Connexions",
      "Langues",
      "Portail élève"
    ],
    "recorderTitle": "Enregistreur de cours",
    "recorderDesc": "Extension Chrome qui enregistre la session et fournit un compte rendu. {guide}",
    "recorderGuide": "Guide pas à pas →",
    "replayTourHint": "Vous ne vous souvenez plus du rôle de cette page ? Refaire le tutoriel à partir d’ici.",
    "languageTitle": "Langue",
    "languageDesc": "Langue d’affichage de cet espace. Cela ne change pas la langue de vos comptes rendus — chaque élève choisit pour lui-même.",
    "connectionsTitle": "Connexions",
    "connectionsDesc": "Connectez les outils utiles à la planification, réunions et paiements.",
    "livesTitle": "Où vivent vos cours",
    "livesDesc": "En les gardant sur Google Agenda : page de réservation, plages libres et enregistrement automatique. Ailleurs : tout cela disparaît, l’espace fonctionne depuis les enregistrements.",
    "calendarTitle": "Agenda des cours",
    "calendarDesc": "Quel agenda contient les cours à lire par Lesson Studio ?",
    "primaryCalendar": "Agenda principal",
    "autoSendTitle": "Envoi des comptes rendus",
    "autoSendDesc": "Chaque compte rendu attend dans une file de relecture avant l’envoi. Si vous préférez ne pas les valider, ils peuvent partir directement à l’élève dès qu’ils sont rédigés — vous pourrez toujours le modifier ensuite, mais l’élève aura vu la première version.",
    "autoSendReview": "Je les valide avant",
    "autoSendReviewHint": "Ils attendent dans Brouillons à valider",
    "autoSendAuto": "Les envoyer automatiquement",
    "autoSendAutoHint": "L’élève le reçoit dès que c’est écrit",
    "speakingTitle": "Exercices oraux",
    "speakingDesc": "Chaque compte rendu se termine par trois exercices oraux. Vos élèves peuvent enregistrer leur réponse : leurs enregistrements sont visibles sous la phrase concernée et vous recevez un e-mail. Désactivez : ces trois exercices n’apparaîtront pas.",
    "speakingOn": "Autoriser l’enregistrement par l’élève",
    "speakingOnHint": "Vous écoutez sur la page du cours",
    "speakingOff": "Les retirer",
    "speakingOffHint": "Le compte rendu garde ses sept exercices écrits",
    "platformTitle": "Plateforme de réunion par défaut",
    "platformDesc": "Ce que crée chaque nouvelle réservation. Choisissez le dernier si votre activité se passe sur une marketplace et le lien est déjà disponible.",
    "meetLabel": "Google Meet",
    "meetHint": "Créé dans votre agenda",
    "ownLinkLabel": "Je fournis mon propre lien",
    "ownLinkHint": "Preply, italki ou une salle à vous"
  },
  "billing": {
    "eyebrow": "Comptes rendus",
    "title": "Achetez des cours. Utilisez-les à tout moment.",
    "buyMore": "Acheter plus de comptes rendus",
    "once": "paiement unique",
    "nWriteUps": "{n} comptes rendus",
    "packNames": [
      "10 cours",
      "40 cours",
      "100 cours"
    ],
    "neverTitle": "Rien ne se renouvelle",
    "neverBody": "Prenez congé en août, ils vous attendent en septembre. Pas de date limite, pas de renouvellement, aucune carte enregistrée.",
    "leftTitle": "Comptes rendus restants",
    "leftDesc": "Un est utilisé à chaque rédaction de cours. Ils n’expirent pas, rien n’est reconduit.",
    "ofFree": "sur vos {total} comptes rendus gratuits",
    "ofFreeUsed": "sur vos {total} gratuits · {used} utilisés",
    "builtSoFar": "{used} générés jusqu’ici",
    "emptyTrial": "Ce sont les gratuits utilisés. Un pack ci-dessous permet de continuer — pas d’abonnement, pas de date limite.",
    "emptyPaid": "Votre solde est vide. Un pack ci-dessous le recharge, et tout ce que vous n’utilisez pas reste disponible.",
    "addTitle": "Ajouter des comptes rendus",
    "addDesc": "Un seul paiement, aucun renouvellement. Les packs plus grands coûtent moins cher à l’unité — mais le petit n’est pas pénalisant : ce que vous achetez vous appartient jusqu’à usage.",
    "save": "économisez {pct} %",
    "neverExpires": "Jamais expiré",
    "buy": "Acheter {n}",
    "openingStripe": "Ouverture de Stripe…",
    "stripeUnreachable": "Impossible d’atteindre Stripe pour l’instant. Réessayez dans un instant.",
    "paidOnce": "Payé une fois, par carte, via Stripe. Aucune carte conservée ici et rien ne vous sera recrédité.",
    "packTags": [
      "Pour démarrer",
      "Rythme régulier",
      "Le plus fréquemment pris"
    ]
  },
  "recap": {
    "tabs": [
      "Progression",
      "Compte rendu",
      "Devoirs",
      "Vocabulaire"
    ],
    "tabsAria": "Sections du compte rendu",
    "eyebrow": "Relire avant d’envoyer",
    "title": "{name} · Compte rendu",
    "lessonFallback": "Cours",
    "sub": "revoyez chaque onglet puis envoyez à {first}.",
    "translate": "Traduire les explications",
    "translateTitle": "Réécrire les explications dans la langue de l’élève — supports et notes restent identiques",
    "working": "Traitement…",
    "rebuild": "Reconstruire depuis l’enregistrement",
    "rebuildTitle": "Régénérer depuis l’enregistrement avec le dernier AI + mesures",
    "rebuilding": "Régénération…",
    "deleteDraft": "Supprimer le brouillon",
    "deleting": "Suppression…",
    "saveDraft": "Enregistrer le brouillon",
    "approve": "Valider & envoyer",
    "sending": "Envoi…",
    "savedTick": "Enregistré ✓",
    "confirmRebuild": "Reconstruire ce compte rendu depuis l’enregistrement ? Cela régénère le résumé, les sections, les devoirs et les mesures, et supprime vos modifications manuelles.",
    "confirmTranslate": "Traduire les explications de ce compte rendu dans la langue utilisée pour cet élève ? Exemples, citations et notes restent inchangés.",
    "confirmDelete": "Supprimer le brouillon de {name} ? Il sera retiré de la file de relecture et cette action est définitive.",
    "promptLanguage": "Cet élève n’a pas encore de langue d’explication définie (réglez cela sur sa page). Traduire dans quelle langue ?",
    "rebuildFailed": "La régénération a échoué",
    "translationFailed": "La traduction a échoué",
    "deleteFailed": "Impossible de supprimer le compte rendu",
    "savingEdits": "Enregistrement de vos modifications…",
    "uploadingMemo": "Envoi du mémo vocal…",
    "uploadingFile": "Import de {name}…",
    "attachingMaterials": "Ajout de vos supports…",
    "attachmentFailed": "Compte rendu envoyé mais un fichier n’a pas pu être ajouté — ajoutez-le depuis la page du cours.",
    "suggestedScript": "Script suggéré"
  },
  "portal": {
    "slots": {
      "greeting": "Bon retour,",
      "tabOverview": "Vue d’ensemble",
      "tabLessons": "Cours",
      "tabProgress": "Progression",
      "tabPractice": "Pratique",
      "tabFiles": "Fichiers",
      "tabTests": "Tests",
      "statLessons": "Cours",
      "statScore": "Note moyenne",
      "statSpeaking": "Expression orale",
      "lessonsTitle": "Vos cours",
      "progressTitle": "Votre progression",
      "vocabTitle": "Vocabulaire",
      "milestoneTitle": "Étape suivante",
      "scoresTitle": "Dernières notes",
      "testsTitle": "Tests d’entraînement",
      "speakingTitle": "Habitudes orales",
      "filesTitle": "Fichiers du cours",
      "vocabTotalsTitle": "Progression du vocabulaire"
    },
    "tabsAria": "Sections du tableau de bord",
    "notLinked": "Compte non relié",
    "askTeacher": "Demandez à votre enseignant de lier votre compte.",
    "climbLed": "Vous êtes passé de l’écoute à {em}.",
    "climbLedEm": "mener la conversation",
    "climbMore": "Vous parlez {em} que quand vous avez commencé.",
    "climbMoreEm": "{delta} points de plus",
    "climbPlain": "Vous avez parlé pendant {em} de votre dernier cours.",
    "youSpoke": "Vous avez parlé",
    "acrossLessons": "Sur {n} cours",
    "acrossOneLesson": "Sur 1 cours",
    "climbSub": "La marque sur l’arc indique le début — {then}.",
    "climbDelta": "{delta} points depuis le 1er cours",
    "inLast30": "{n} ces 30 derniers jours",
    "totalLessons": "Cours complétés au total",
    "inAll": "{n} au total",
    "words": "{n} mots",
    "lastN": "Derniers {n}",
    "metricPace": "Allure",
    "metricThinking": "Temps réflexion",
    "metricShare": "Part de parole",
    "practiseTitle": "Révisez vos mots",
    "practiceHistory": "Pratique sur 2 semaines",
    "byKind": "Par type de mot",
    "byLesson": "Par cours",
    "practiseAnything": "Réviser tout",
    "practiseDue": "Réviser les rappels",
    "vocabKnown": "connu",
    "vocabLearning": "en apprentissage",
    "vocabNew": "non entamé",
    "download": "Télécharger"
  },
  "practice": {
    "emptyTitle": "Rien à réviser pour le moment",
    "emptyBody": "Les mots apparaitront ici une fois qu’un cours aura été publié.",
    "howMany": "Combien aujourd’hui ?",
    "doneTitle": "Fait — {n} cartes.",
    "doneOneTitle": "Fait — 1 carte.",
    "allFirstTime": "Tous pour la 1ère fois. Ils reviendront sous peu.",
    "someMissed": "{right} nouveaux, {missed} à revoir plus tôt.",
    "moreLeft": "{n} mots à voir plus tard, quand vous voulez.",
    "oneLeft": "1 mot à voir plus tard, quand vous voulez.",
    "wholePile": "C’est la totalité du lot.",
    "nextRound": "{n} de plus",
    "practiseAgain": "Revoir à nouveau",
    "backToPractice": "Retour à la pratique",
    "tapToSee": "Appuyez pour voir la signification",
    "again": "Encore",
    "knewIt": "Je le savais",
    "sayOutLoud": "Dites-le à haute voix avant de retourner la carte."
  },
  "rating": {
    "question": "Est-ce fidèle à votre cours ?",
    "yes": "Oui, c’était bien mon cours",
    "no": "Pas exactement",
    "thanksYes": "Vous avez indiqué que cela correspondait à votre cours. Merci — c’est noté.",
    "thanksNo": "Vous avez indiqué qu’il y avait une erreur. Merci — c’est ce qui aide.",
    "whatWasOff": "Qu’est-ce qui n’allait pas ? Cochez tout ce qui convient.",
    "notePlaceholder": "Si possible, précisez quoi — une phrase suffit.",
    "send": "Envoyer",
    "sending": "Envoi…",
    "didNotSave": "Ça n’a pas été enregistré.",
    "reasons": [
      "Des mots que je n’ai jamais dit",
      "Confusion sur qui a dit quoi",
      "Mauvais alphabet ou langue",
      "Trop facile ou trop difficile",
      "Autre"
    ]
  },
  "recapLanguage": {
    "question": "Mes comptes rendus sont rédigés en",
    "hint": "La langue que vous apprenez reste inchangée — c’est la langue d’explication autour.",
    "hintLearning": "Le {lang} que vous apprenez reste inchangé — c’est la langue d’explication autour.",
    "aria": "Langue d’explication des comptes rendus",
    "saved": "Enregistrée — à partir du prochain compte rendu.",
    "didNotSave": "Cela n’a pas été enregistré."
  },
  "studentSettings": {
    "eyebrow": "Votre compte",
    "title": "Paramètres",
    "back": "← Retour à vos cours",
    "languageTitle": "La langue de cette page",
    "languageDesc": "Boutons, titres, texte autour des cours. Cela ne change pas la langue de vos comptes rendus — c’est le réglage ci-dessous."
  },
  "lesson": {
    "railAria": "Sections du cours",
    "thisLesson": "Ce cours",
    "movements": [
      "Votre expression orale",
      "Ce que vous maîtrisez",
      "Axes à travailler",
      "Contenu abordé",
      "Mots du jour",
      "Pratique",
      "Fichiers & audio"
    ],
    "speakingBalance": "Équilibre de parole",
    "score": "Note",
    "grammarDensity": "Densité grammaticale",
    "corrections": "Corrections",
    "homework": "Devoirs",
    "noHomework": "Pas de devoirs pour ce cours.",
    "practiceExercises": "Exercices pratiques",
    "wordsFromLesson": "Mots de ce cours",
    "whoTalked": "Qui a parlé",
    "speakingMeasured": "Votre expression orale, mesurée",
    "yourTeacher": "Votre enseignant"
  },
  "join": {
    "setupFailed": "Impossible de configurer votre compte.",
    "acceptFailed": "Impossible d’accepter l’invitation.",
    "joining": "Adhésion…",
    "joinAs": "Rejoindre en tant que {name}",
    "notYou": "Ce n'est pas vous ? {signOut} puis ouvrez à nouveau ce lien.",
    "notYouLink": "Se déconnecter",
    "emailLabel": "Votre e-mail",
    "passwordLabel": "Choisissez un mot de passe",
    "passwordHint": "Au moins 8 caractères",
    "settingUp": "Configuration…",
    "createAccount": "Créer mon compte"
  },
  "speaking": {
    "cta": "Enregistrez votre réponse",
    "sendFailed": "Impossible d’envoyer cet enregistrement. Réessayez.",
    "recordAgain": "Réenregistrer",
    "sendToTeacher": "Envoyer à l’enseignant",
    "sending": "Envoi…",
    "tryAgain": "Réessayer",
    "keepSent": "Garder la version envoyée"
  },
  "exchange": {
    "recording": "Enregistrement",
    "download": "Télécharger",
    "nothingShared": "Rien partagé pour ce cours pour l’instant.",
    "noFiles": "Aucun fichier partagé. Importez un support ou PDF pour ce cours.",
    "audioIntro": "Entraînement libre enregistré par cet élève. Leurs réponses aux exercices oraux sont dans l’onglet Pratique.",
    "noAudio": "Aucun audio envoyé."
  },
  "charts": {
    "metrics": [
      {
        "label": "Note",
        "note": "Note de chaque cours sur dix."
      },
      {
        "label": "Vous parlez",
        "note": "Votre part du dialogue. Elle augmente avec la confiance."
      },
      {
        "label": "Allure",
        "note": "Mots par minute lorsque vous parliez."
      },
      {
        "label": "Réflexion",
        "note": "Temps avant de répondre. Plus court indique une meilleure maîtrise."
      },
      {
        "label": "Vocabulaire",
        "note": "Chaque mot vu en cours, cumulés."
      }
    ],
    "nothingYet": "Rien enregistré pour l’instant.",
    "sinceLesson": "depuis le cours {n}",
    "trendLater": "La tendance apparaît après votre prochain cours."
  },
  "tests": {
    "saveScoreFailed": "Impossible d’enregistrer votre note.",
    "finish": "Terminer — {pct} %",
    "allWords": "Tous vos mots"
  },
  "availability": {
    "days": [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche"
    ],
    "startTime": "Début",
    "endTime": "Fin",
    "removeRange": "Supprimer l’intervalle",
    "couldNotSave": "Impossible d’enregistrer",
    "saveChanges": "Enregistrer les modifications",
    "defaultsTitle": "Paramètres par défaut",
    "defaultsDesc": "Durée des cours et délai de réservation par élève.",
    "lessonName": "Nom du cours",
    "lessonNamePlaceholder": "Cours de langue",
    "lessonLength": "Durée du cours (min)",
    "slotInterval": "Intervalle (min)",
    "minNotice": "Préavis min. (h)",
    "bufferBefore": "Tampon avant (min)",
    "bufferAfter": "Tampon après (min)",
    "maxPerDay": "Cours max / jour",
    "bookingWindow": "Fenêtre de réservation (j)",
    "title": "Disponibilités",
    "copyMon": "Copier lun. → jours ouvrés",
    "copyMonTitle": "Copier les horaires du lundi sur mar–ven",
    "previewBooking": "Aperçu page de réservation ↗",
    "unavailable": "Indisponible",
    "dateOverrides": "Exceptions par date"
  },
  "recordings": {
    "eyebrow": "Présentation",
    "title": "Cours & comptes rendus",
    "settings": "Paramètres",
    "yourStudents": "Vos élèves",
    "publishedTitle": "Cours publiés",
    "publishedDesc": "Déjà accessible à vos élèves, du plus récent au plus ancien. Les brouillons attendent dans la file au-dessus.",
    "nothingPublished": "Rien de publié pour l’instant",
    "untitled": "Cours sans titre",
    "published": "Publié",
    "draft": "Brouillon",
    "summaryAria": "Résumé de cours",
    "students": "Élèves",
    "changedMind": "Changement d’avis ?",
    "connectCalendar": "Connecter un agenda"
  },
  "lessonRow": {
    "joinCall": "Rejoindre l’appel ↗",
    "viewRecap": "Voir le compte rendu",
    "reviewRecap": "Relire le compte rendu",
    "noLink": "Aucun lien",
    "eyebrow": "Relire avant publication",
    "recapTitle": "{title} · Compte rendu",
    "closeAria": "Fermer la relecture du compte rendu",
    "draftBanner": "Brouillon AI — vérifiez le contenu avant qu’il ne soit transmis à l’élève.",
    "score": "Note",
    "studentTalk": "Parole élève",
    "grammar": "Grammaire",
    "confidence": "Confiance",
    "homework": "Devoirs",
    "memoScript": "Script du mémo vocal",
    "teacherNote": "Note de l’enseignant",
    "editLater": "Modifier plus tard",
    "approveSend": "Valider & envoyer à l’élève"
  },
  "book": {
    "months": [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre"
    ],
    "loadFailed": "Impossible de charger les disponibilités.",
    "bookingFailed": "La réservation a échoué.",
    "bookingFailedRetry": "La réservation a échoué — réessayez.",
    "eyebrow": "Planifier un cours",
    "title": "Trouvez un créneau disponible",
    "sub": "Choisissez un jour, puis un horaire. Confirmation et détail du rendez-vous par e-mail.",
    "booked": "Réservé !",
    "invite": "Une invitation calendrier arrive sur {email}.",
    "openMeeting": "Ouvrir le lien de réunion",
    "noCalendar": "Disponibilité absente. L’agenda est-il connecté ?",
    "noTimes": "Aucun créneau dans les 30 prochains jours.",
    "pickDay": "Choisir un jour",
    "pickDayHint": "Un point indique des créneaux ouverts.",
    "yourDetails": "Vos informations",
    "confirmAt": "Confirmer {time}",
    "yourName": "Votre nom",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "Votre e-mail",
    "emailPlaceholder": "vous@email.com",
    "booking": "Réservation…",
    "bookAt": "Réserver · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "Présentation",
        "body": "Page d’accueil. Les comptes rendus arrivent ici pour validation, vos derniers cours sont listés dessous."
      },
      {
        "title": "Élèves",
        "body": "Ajoutez un élève ici. Ses cours, tests et progression sont rattachés à cette fiche — et il dispose de son propre portail."
      },
      {
        "title": "Notes",
        "body": "Un clic par cours donné : un calendrier mensuel qui sert aussi de journal d’enseignement."
      },
      {
        "title": "Vue élève",
        "body": "Ce que voit l’élève, avec votre personnalisation (couleurs, noms, sections). Ce n’est pas une démo : c’est réel."
      },
      {
        "title": "Paramètres",
        "body": "Votre agenda, l’enregistreur de cours et votre compte. Ce tutoriel est ici aussi, à tout moment."
      }
    ],
    "skip": "Passer le tour"
  },
  "languages": {
    "couldNotSave": "Impossible d’enregistrer",
    "title": "Vos langues",
    "desc": "Ce que vous enseignez et la langue de vos cours. Les nouveaux élèves partent de ces paramètres.",
    "youTeach": "Langue enseignée",
    "spokenIn": "Langue de vos cours",
    "fitTitle": "Comment les langues s’articulent",
    "fitDesc": "Trois réglages, trois fonctions différentes.",
    "fitLearning": "**Langue “apprise” de chaque élève** : détermine les comptes rendus et tests — {n} disponibles, du japonais à l’arabe. Réglé lors de l’ajout de l’élève, modifiable ensuite.",
    "fitExplained": "**Langue d’“explication”** : langue du texte du compte rendu et des consignes de tests — anglais par défaut sauf modification, également sur la fiche élève.",
    "fitSpoken": "**Langue “parlée en cours”** : sert à la transcription pendant le cours. Suit le paramètre principal sauf modification par élève — l’enregistreur ne redemande plus, car cette valeur reste fixe d’un cours à l’autre."
  },
  "notes": {
    "pickStudent": "Choisissez un élève",
    "empty": "Note vide",
    "couldNotSave": "Impossible d’enregistrer la note",
    "confirmDelete": "Supprimer cette note ?",
    "hoursTaught": "Heures enseignées",
    "recapsPublished": "Comptes rendus publiés",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun élève pour l’instant",
    "student": "Élève",
    "addNote": "Ajouter une note",
    "newNote": "Nouvelle note",
    "editNote": "Modifier la note"
  },
  "exercises": {
    "none": "Aucun exercice pour l’instant — saisissez vos propres exercices ci-dessous.",
    "instruction": "Consigne",
    "instructionPlaceholder": "Ce qui est demandé à l’élève",
    "focus": "Cible",
    "focusPlaceholder": "Ce que travaillent les phrases",
    "sentence": "Phrase",
    "meaning": "Signification",
    "removeSentence": "Supprimer la phrase",
    "removeOption": "Supprimer l’option",
    "questionTarget": "Question (langue cible)",
    "question": "Question"
  },
  "payments": {
    "selectStudent": "Sélectionner un élève",
    "amountTooLow": "Saisissez un montant supérieur à zéro",
    "saveFailed": "Échec de l’enregistrement",
    "thisMonth": "Ce mois-ci",
    "receivedAllTime": "Total reçu",
    "outstanding": "À recevoir",
    "currency": "Devise",
    "students": "Élèves",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun élève pour l’instant",
    "student": "Élève",
    "recent": "Paiements récents",
    "newPayment": "Nouveau paiement",
    "editPayment": "Modifier le paiement",
    "selectPlaceholder": "Sélectionnez…",
    "amount": "Montant ({symbol})",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "covers": "Correspond à",
    "coversPlaceholder": "ex. Pack juillet — 4 cours",
    "paymentDate": "Date du paiement",
    "dueDate": "Date d’échéance",
    "lessonsCovered": "Cours couverts",
    "lessonsPlaceholder": "ex. 4",
    "method": "Méthode",
    "methodPlaceholder": "Virement, Espèces, PayPal...",
    "confirmDelete": "Supprimer ce paiement ?"
  },
  "recapReview": {
    "vocab": "Vocabulaire",
    "summary": "Résumé",
    "summaryPlaceholder": "Résumé du cours…",
    "sectionTitle": "Titre de section",
    "sectionContent": "Contenu de la section…",
    "removeSection": "Supprimer la section",
    "homeworkTask": "Devoir à faire",
    "noteTitle": "Votre note à l’élève",
    "notePlaceholder": "Une note personnelle pour l’élève…"
  },
  "connectors": {
    "googleName": "Google Agenda",
    "googleDesc": "Lit vos cours et écrit les nouvelles réservations dans votre agenda.",
    "connect": "Connecter",
    "permissionNeeded": "Autorisation requise",
    "reconnect": "Reconnecter",
    "disconnect": "Déconnecter",
    "zoomDesc": "Crée automatiquement une salle Zoom pour chaque cours réservé.",
    "comingSoon": "Bientôt disponible",
    "stripeName": "Stripe",
    "stripeDesc": "Encaissez les paiements de packs — versements vers vous directement."
  },
  "student": {
    "notJoined": "Invité — pas encore inscrit",
    "avgScore": "Note moyenne",
    "latestTalk": "Dernier oral",
    "vocabItems": "Mots de vocabulaire",
    "creditsLeft": "{left} cours restants / {bought} achetés",
    "creditsOneLeft": "1 cours restant / {bought} achetés",
    "noCredits": "Aucun cours acheté pour l’instant",
    "managePayments": "Gérer les paiements →",
    "lessonsTitle": "Cours & comptes rendus",
    "noLessons": "Aucun cours pour l’instant",
    "noLessonsSub": "Les cours enregistrés pour cet élève apparaîtront ici.",
    "testsTitle": "Tests d’entraînement",
    "noTests": "Aucun test pour l’instant"
  },
  "addStudent": {
    "levels": [
      "Débutant",
      "Élémentaire",
      "Pré-intermédiaire",
      "Intermédiaire",
      "Intermédiaire avancé",
      "Avancé"
    ],
    "createFailed": "Échec de la création de l’élève",
    "aria": "Nouvel élève",
    "title": "Nouvel élève",
    "fullName": "Nom complet",
    "namePlaceholder": "Jane Doe",
    "level": "Niveau",
    "learning": "Langue apprise",
    "choose": "Choisir…",
    "recapLanguage": "Langue du compte rendu"
  },
  "calendar": {
    "months": [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre"
    ],
    "upcoming": "À venir",
    "today": "Aujourd’hui",
    "tomorrow": "Demain",
    "prev": "Précédent",
    "next": "Suivant",
    "fixInSettings": "Corriger dans les paramètres",
    "nothingOn": "Rien le {day}.",
    "noLessonsThatDay": "Aucun cours ce jour.",
    "agendaClear": "Votre agenda est vide.",
    "noUpcoming": "Aucun cours à venir sur cet agenda."
  },
  "forgot": {
    "title": "Réinitialiser votre mot de passe",
    "lead": "Entrez l’adresse e-mail utilisée lors de la connexion et nous vous enverrons un lien de modification.",
    "send": "Envoyer le lien",
    "sending": "Envoi…",
    "sent": "Si {email} a un compte, un lien de réinitialisation arrive. Ouvrez l’e-mail et suivez le lien pour choisir votre mot de passe — le lien expire sous une heure.",
    "spam": "Rien reçu ? Vérifiez vos spams ou essayez avec l’adresse utilisée à l’inscription.",
    "remembered": "Retrouvé ?",
    "backToSignIn": "Retour à la connexion"
  },
  "reset": {
    "tooShort": "Votre nouveau mot de passe doit contenir au moins 6 caractères.",
    "mismatch": "Les deux mots de passe ne correspondent pas — vérifiez-les.",
    "samePassword": "C’est le même mot de passe qu’avant — choisissez-en un nouveau.",
    "saveFailed": "Nous n’avons pas pu enregistrer ce mot de passe. Essayez encore.",
    "title": "Choisissez un nouveau mot de passe",
    "expired": "Ce lien est expiré ou déjà utilisé. Demandez-en un nouveau et réessayez.",
    "noToken": "Cette page ne fonctionne qu’avec le lien reçu par e-mail de réinitialisation. Demandez un lien et nous vous l’enverrons.",
    "lead": "Choisissez un nouveau mot de passe. Vous serez connecté dès qu'il est enregistré.",
    "newPassword": "Nouveau mot de passe",
    "repeat": "Répétez-le"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "Note moyenne",
        "sub": "Sur 10, pour chaque cours noté."
      },
      {
        "label": "Part de parole",
        "sub": "Part du cours où l’élève a pris la parole."
      },
      {
        "label": "Allure orale",
        "sub": "Mots par minute pendant qu’il s’exprime. Une hausse indique un progrès."
      },
      {
        "label": "Temps de réflexion",
        "sub": "Secondes entre la fin de votre phrase et le début de la sienne. Une pause n'est pas une faute."
      },
      {
        "label": "Mots par prise de parole",
        "sub": "Volume d’une prise de parole. Brèves + rapide = réponse, plus qu’échange."
      },
      {
        "label": "Mots bouche-trous",
        "sub": "Ex. “euh” par cours. À lire avec l’allure — vite avec hésitations n’est pas pareil que lent et fluide."
      }
    ],
    "totalLessons": "Cours total",
    "acrossStudents": "pour {n} élèves",
    "mostActive": "Le plus actif",
    "nLessons": "{n} cours",
    "nothingRecorded": "rien enregistré pour l’instant",
    "vocabMet": "Mots rencontrés",
    "wordsAcross": "mots tous cours confondus",
    "notSeenLately": "Pas vu récemment",
    "everyoneCurrent": "tous à jour",
    "measureAria": "Indicateur",
    "nothingMeasured": "Aucune donnée pour le moment — elles arriveront avec les cours.",
    "perStudent": "{measure} — élève par élève",
    "perStudentSub": "Leurs propres cours dans l’ordre. La flèche va du 1er au dernier.",
    "prevMeasure": "Indicateur précédent",
    "nextMeasure": "Indicateur suivant"
  },
  "test": {
    "heading": "Test d’entraînement {level}",
    "published": "Publié",
    "draftOnlyYou": "Brouillon — visible uniquement par vous",
    "basedOn": "Fondé sur",
    "lessonN": "Cours {n}",
    "script": "Écriture",
    "scriptBeginner": "Hiragana + romaji",
    "scriptHiragana": "Hiragana",
    "scriptKanji": "Kanji + kana",
    "created": "Créé",
    "status": "Statut",
    "speakingAnswer": "Réponse orale",
    "unplayable": "Enregistrement existant mais non lisible."
  },
  "trial": {
    "aria": "Bienvenue sur Lesson Studio",
    "kicker": "Bienvenue sur Lesson Studio",
    "title": "Vos {n} premiers comptes rendus sont offerts.",
    "sub": "Installez l’enregistreur, donnez un cours et voyez-le rédigé — sans carte ni engagement. Convaincu ? Choisissez une formule.",
    "showMe": "Visite guidée",
    "exploreMyself": "Je découvre seul",
    "setUpFirst": "Ou installer l’enregistreur d’abord →"
  },
  "reviewQueue": {
    "title": "Comptes rendus à valider",
    "desc": "Générés à partir de vos enregistrements. Rien n’atteint un élève sans votre validation.",
    "moveFailed": "Impossible de déplacer ce compte rendu",
    "serverUnreachable": "Impossible d’accéder au serveur",
    "rebuildFailed": "Impossible de reconstruire ce compte rendu",
    "deleteFailed": "Impossible de supprimer le compte rendu"
  },
  "recorderMissing": {
    "title": "Ajoutez l’enregistreur pour commencer",
    "body": "Lesson Studio rédige des comptes rendus à partir de vos cours ; l’extension Chrome réalise les enregistrements. Si elle n’est pas installée et connectée, rien n’apparait ici — il n’y a pas d’autre moyen d’importer un cours."
  },
  "pending": {
    "chooseStudent": "Choisissez d’abord avec quel élève vous avez fait ce cours.",
    "fileFailed": "Impossible d’enregistrer cet enregistrement.",
    "confirmDelete": "Supprimer cet enregistrement ? Le fichier audio sera effacé.",
    "studentAria": "Élève",
    "choosePlaceholder": "Choisir un élève",
    "filing": "Archivage…",
    "buildRecap": "Générer le compte rendu"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "Débutant",
        "sub": "Hiragana + romaji"
      },
      {
        "label": "Hiragana",
        "sub": "Kana, sans romaji"
      },
      {
        "label": "Kanji + kana",
        "sub": "Kanji avec lecture"
      }
    ],
    "failed": "Échec de la génération",
    "needLesson": "Publiez d’abord un compte rendu de cours",
    "title": "Générer un test d’entraînement",
    "explanationLanguage": "Langue d’explication"
  },
  "guide": {
    "eyebrow": "Enregistreur de cours",
    "title": "Enregistrez un cours, recevez un compte rendu",
    "sub": "Une extension Chrome qui enregistre l’onglet du cours et votre micro sur deux pistes séparées puis restitue un brouillon ici. Aucun bot n’entre dans l’appel, rien n’est installé côté élève — ça fonctionne sur Preply, italki, Google Meet, Zoom, tout onglet où le cours a lieu.",
    "step1Title": "Installez-le depuis le Chrome Web Store",
    "step1Body": "Un clic, pas de réglage. Puis épinglez-le — cliquez sur la pièce de puzzle à droite de la barre d’adresse puis sur l’épingle — le K reste accessible en cours.",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Ajouter à Chrome",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "betaNote": "**Vous avez testé la version bêta depuis un dossier ?** Supprimez-la d’abord ({path} → Supprimer). Un seul exemplaire peut enregistrer un onglet à la fois.",
    "step2Title": "Connectez-vous — une fois",
    "step2Body": "Ouvrez l’extension et connectez-vous avec les mêmes identifiants qu’ici. C’est toute la configuration : l’extension sait qui vous êtes, quels élèves vous appartiennent, et quelle langue vous enseignez.",
    "signIn": "Connexion",
    "step3Title": "Ouvrez l’onglet et lancez l’enregistrement",
    "step3Body": "Positionnez-vous dans l’onglet où le cours a lieu : salle Preply, appel Meet... Cliquez sur le K, choisissez l’élève, appuyez sur **Démarrer l’enregistrement**. La première fois, Chrome demande le micro : acceptez. Fermez la pop-up et donnez cours — l’enregistrement continue.",
    "studentLabel": "Élève :",
    "step4Title": "Arrêtez, puis envoyez",
    "step4Body": "Quand le cours est terminé, ouvrez la pop-up, appuyez sur **Arrêter l’enregistrement** puis sur **Envoyer à Lesson Studio**. Aucun transfert sans appuyer sur envoyer.",
    "sendButton": "Envoyer à Lesson Studio →",
    "step5Title": "Relisez le compte rendu généré",
    "step5Body": "En quelques minutes, le brouillon attend dans **Comptes rendus à valider** — résumé, vocabulaire, devoirs, dans la langue de l’élève. Modifiez ce que vous voulez, envoyez, et cela arrive sur leur portail.",
    "reviewAndSend": "Relire & envoyer",
    "consentTitle": "Avant d’enregistrer quelqu’un",
    "consentBody": "Prévenez votre élève de l’enregistrement et obtenez son accord. Certaines législations l’exigent pour tous les participants ; Preply et italki ont aussi leurs propres règles sur l’enregistrement — à consulter avant d’adopter cet usage.",
    "dataBody": "L’enregistreur capture les deux voix. Rien ne part sans appuyer sur **Envoyer à Lesson Studio**, l’audio est transcrit pour générer le compte rendu, et les fichiers sont supprimés au bout de 30 jours. Voir les détails dans notre {policy}.",
    "privacyLink": "politique de confidentialité"
  },
  "lessonExercises": {
    "none": "Aucun exercice pratique pour ce cours.",
    "recordReading": "Enregistrez-vous en train de lire ces phrases",
    "notRecorded": "Pas encore enregistré."
  },
  "lessonTools": {
    "lessonIsWith": "Ce cours est avec",
    "notLinked": "Non relié (test / pas d’élève)",
    "hint": "Reliez un élève pour que le compte rendu lui soit transmis. Laissez vide pour un test."
  },
  "memo": {
    "back15": "Reculer 15 s",
    "forward15": "Avancer 15 s",
    "seek": "Aller à"
  },
  "joinInvalid": {
    "title": "Ce lien n’est pas valide",
    "body": "Il a peut-être déjà servi, ou votre enseignant l’a remplacé. Demandez-lui un nouveau lien.",
    "goSignIn": "Aller à la connexion"
  },
  "dashboard": {
    "students": "Élèves",
    "withLogin": "Avec compte",
    "lessonsRecorded": "Cours enregistrés",
    "noStudents": "Aucun élève pour l’instant",
    "notJoined": "Invité — pas encore inscrit",
    "lessons": "Cours",
    "overview": "Présentation"
  },
  "misc": {
    "outOfTen": "SUR 10",
    "dashboardBack": "Tableau de bord",
    "backToOverview": "Retour à la présentation",
    "recapGone": "Ce compte rendu n’est plus disponible.",
    "timesShared": "Fois partagées",
    "languageGroup": "Langue",
    "extConfirmReset": "Déconnecter l’enregistreur sur tous les appareils ? L’enregistrement s’arrête jusqu’à reconnexion dans l’extension.",
    "extResetFailed": "Impossible de réinitialiser la connexion de l’enregistreur.",
    "extSigningOut": "Déconnexion…",
    "extSignOutEverywhere": "Déconnecter l’enregistreur partout",
    "howTitle": "Comment vos cours arrivent",
    "howLead": "Vous enseignez sur {platform}, rien n’est planifié ici. Un cours entre dans Lesson Studio dès que son enregistrement est importé.",
    "howSteps": [
      {
        "title": "Enregistrez le cours",
        "body": "Utilisez l’enregistreur du navigateur, ou importez le fichier fourni par la plateforme."
      },
      {
        "title": "Nous rédigeons le compte rendu",
        "body": "Résumé, vocabulaire, corrections et exercices, issus de la transcription."
      },
      {
        "title": "Vous relisez et publiez",
        "body": "Vous pouvez tout modifier, puis envoyer — l’élève retrouve tout sur son portail."
      }
    ],
    "instrStudentChose": "Votre élève a choisi cette langue lui-même. Vous pouvez la changer, mais c’est son choix.",
    "instrHint": "Langue d’explication des comptes rendus et tests — cliquez pour modifier",
    "matLinkFailed": "Impossible d’enregistrer ce lien",
    "matLinksFailed": "Impossible d’enregistrer ces liens",
    "matAddLink": "Ajouter un lien",
    "confirmDeleteStudent": "Supprimer cet élève et tous ses cours ? Cette action est irréversible.",
    "resetPassword": "Réinitialiser le mot de passe",
    "inviteLink": "Lien d’invitation",
    "uploadFailed": "Échec de l’envoi",
    "micBlocked": "Microphone bloqué — autorisez l'accès dans le navigateur.",
    "micBlockedBar": "Microphone bloqué — autorisez l'accès dans la barre d’adresse puis réessayez.",
    "uploadAFile": "Importer un fichier",
    "submitToTeacher": "Soumettre à l’enseignant",
    "discardRedo": "Annuler & recommencer",
    "sendToStudent": "Envoyer à l’élève",
    "sendThisAnswer": "Envoyer cette réponse",
    "sentTick": "Envoyé ✓",
    "vocabByLevelAria": "Vocabulaire par niveau",
    "vocabTapHint": "Tapez un niveau pour voir ces mots et où ils sont apparus.",
    "firstSeenIn": "Vu pour la 1e fois au cours {n}",
    "firstSeen": "Vu pour la 1e fois",
    "wordsIntroduced": "Mots introduits",
    "fromTheLesson": "Du cours",
    "goAgain": "Recommencer",
    "showWord": "Voir le mot",
    "showMeaning": "Voir le sens",
    "correction": "Correction",
    "correctionsAria": "Corrections",
    "noLessonsYet": "Pas encore de cours"
  }
} as const
