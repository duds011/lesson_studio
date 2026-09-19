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
    "somethingWrong": "Une erreur s'est produite. Réessayez dans un instant."
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "Espace enseignant",
    "overviewAria": "Vue d'ensemble de Lesson Studio",
    "navAria": "Navigation de l'espace enseignant",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu",
    "expand": "Développer la navigation",
    "collapse": "Réduire la navigation",
    "sectionWorkspace": "Espace",
    "sectionManage": "Gérer",
    "overview": "Vue d'ensemble",
    "students": "Élèves",
    "notes": "Notes",
    "materials": "Supports",
    "studentView": "Vue élève",
    "payments": "Paiements",
    "availability": "Disponibilités",
    "settings": "Paramètres",
    "calendarConnected": "Agenda connecté",
    "setupNeeded": "Configuration nécessaire",
    "recordingsOnly": "Enregistrements uniquement",
    "studentPortal": "Portail élève"
  },
  "auth": {
    "language": "Langue",
    "emailLabel": "Adresse e-mail",
    "emailPlaceholder": "vous@example.com",
    "passwordLabel": "Mot de passe",
    "signInTitle": "Connexion",
    "signInSub": "Bienvenue. Connectez-vous pour voir vos cours, votre progression et les comptes-rendus.",
    "signInExpired": "Votre session a expiré. Connectez-vous pour reprendre.",
    "signInAction": "Se connecter",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau ici ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "Mise en place gratuite, ajoutez un élève dès maintenant.",
    "studentQuestion": "Vous êtes élève ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d'invitation — ouvrez-le puis choisissez votre e-mail et mot de passe. Après cela, connectez-vous ici.",
    "signInHeadline": "Chaque leçon, rédigée.",
    "signInAside": "Lesson Studio transforme chaque heure en compte-rendu, suivi de progression et exercices — pour l’enseignant comme pour l’élève.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Créez votre espace Koku Library pour les élèves, comptes-rendus de cours, réservations et suivi.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "Au moins 6 caractères",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Déjà un compte ?",
    "signUpHeadline": "Toute votre pratique d’enseignement, au même endroit.",
    "signUpAside": "Configuration en quelques minutes. Ajoutez un élève, enregistrez un cours, et le reste suit."
  },
  "aside": {
    "slides": [
      {
        "title": "La leçon se rédige toute seule",
        "body": "Une extension Chrome enregistre les deux voix. Le compte-rendu revient déjà rédigé — vous relisez et publiez."
      },
      {
        "title": "Des progrès visibles",
        "body": "Scores, temps de parole et vocabulaire suivis d’un cours à l’autre, sur une page conçue pour l’élève."
      },
      {
        "title": "La langue que vous enseignez",
        "body": "Japonais, français, coréen, espagnol, et une trentaine d’autres — corrigé dans la langue de la leçon, expliqué dans celle de l’élève."
      },
      {
        "title": "Exercices avec leurs propres mots",
        "body": "Cartes mémoire et tests oraux à partir du vocabulaire abordé pendant l’heure."
      },
      {
        "title": "Un portail élève à votre nom",
        "body": "Vos couleurs, vos textes, et uniquement les sections que vous utilisez."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos leçons",
      "Où vous rencontrez",
      "Votre agenda",
      "Vue élève",
      "Votre enregistreur"
    ],
    "sideTitle": "Configurons votre studio.",
    "sideBody": "Quatre étapes et vos élèves disposent de leur propre portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Terminer la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Impossible d'enregistrer",
    "couldNotFinish": "Impossible de terminer",
    "pickTeaching": "Choisissez la langue que vous enseignez.",
    "pickSpoken": "Indiquez la langue parlée pendant vos leçons.",
    "pickCalendar": "Dites-nous si vos cours figurent sur un agenda.",
    "pickPortalName": "Nommez le portail — vos élèves verront ce nom.",
    "teachAria": "La langue que vous enseignez",
    "iTeach": "J’enseigne",
    "teachHint": "Les comptes-rendus et exercices sont générés pour cette langue. C’est le choix par défaut à l’ajout d’un élève — chaque élève peut être modifié ensuite.",
    "spokenAria": "La langue parlée lors des leçons",
    "spokenIn": "mes leçons se passent principalement en",
    "spokenHint": "Souvent différente de la langue apprise — avec un débutant, la leçon se passe surtout dans votre langue commune. C'est ce que l'enregistreur écoute.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où rencontrez-vous les élèves ?",
    "platformLead": "Sur Meet ou Zoom nous créons le lien lors d’une réservation. Sur une marketplace la salle existe déjà : nous ne créons rien, on utilise le lien existant.",
    "zoomLater": "Connecter Zoom plus tard dans Paramètres",
    "stayOutTitle": "Nous restons en dehors du cours lui-même",
    "stayOutBody": "Pas de création de lien, pas de bot envoyé. Vous enregistrez le cours vous-même et le compte-rendu, le vocabulaire et les exercices sont générés à partir de cela — l’élève voit la même chose.",
    "calendarTitle": "Où vivent vos leçons ?",
    "calendarLeadExternal": "Certains professeurs {platform} planifient encore leur semaine sur Google Agenda, d'autres travaillent uniquement sur la plateforme. Votre choix détermine ce que l’espace vous affiche.",
    "calendarLead": "Si vos élèves sont sur votre Google Agenda, nous pouvons lire la semaine, prendre des réservations et envoyer l’enregistreur. Sinon, nous restons en dehors.",
    "googleConnected": "Google Agenda connecté",
    "googleConnectedSub": "Vous pouvez choisir l’agenda utilisé pour les leçons dans Paramètres.",
    "connectGoogle": "Connecter Google Agenda",
    "connectGoogleFine": "Vous allez être dirigé vers Google pour donner votre accord, puis vous reviendrez ici. Vous pouvez continuer sans, mais la réservation et l’enregistrement automatique resteront inactifs.",
    "recordTitle": "Enregistrer le cours",
    "recordBody": "Quel que soit l’outil ou la salle, enregistrez et transmettez à Lesson Studio.",
    "reviewTitle": "Relire le compte-rendu",
    "reviewBody": "Il arrive dans votre file de relecture. Publiez-le, et l'élève y accède.",
    "noCalendarFine": "Pas d’agenda : pas de page réservations, pas de rappels — votre espace s’ouvre sur vos leçons et comptes-rendus. Modifiez ceci quand vous voulez dans Paramètres.",
    "brandTitle": "Personnalisez",
    "brandLead": "Choisissez une couleur et un nom pour le portail où vos élèves se connecteront. Tout peut être ajusté ensuite.",
    "portalNameLabel": "Nom du portail élève",
    "portalNamePlaceholder": "ex. Sakura Japonais",
    "portalNameFine": "Ce nom apparaît en haut du portail de chaque élève et sur leur invitation. C’est le nom de votre studio, pas le nôtre.",
    "accent": "Couleur d’accent",
    "previewTagline": "Apprenez aujourd’hui, progressez demain !",
    "recorderTitle": "Installez l’enregistreur",
    "recorderLead": "C’est l’outil qui fait le travail : extension Chrome qui enregistre la leçon et rédige le compte-rendu. Aucun bot ne rejoint l’appel, rien n’est installé côté élève.",
    "recorderStep1": "**Ajoutez-la depuis le Chrome Web Store** — un clic, puis épinglez-la sur la barre d’outils.",
    "recorderStep2": "**Connectez-vous dans l’extension** avec ce même e-mail et mot de passe. Rien à recopier.",
    "recorderStep3": "**Enregistrez une leçon** : choisissez l'élève, lancez l’enregistrement, arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "recorderFine": "Préférez le guide complet (accès micro, contenu enregistré) ? Tout est expliqué sur le {guide} — aussi accessible dans **Paramètres → Enregistreur de leçons**.",
    "recorderFineLink": "guide de configuration"
  },
  "overview": {
    "eyebrow": "Vue d’ensemble",
    "title": "Votre agenda d’enseignement",
    "manageConnections": "Gérer les connexions",
    "fixInSettings": "Corriger dans les paramètres",
    "summaryAria": "Résumé de la leçon",
    "upcoming": "Cours à venir",
    "drafts": "Brouillons à valider",
    "draftsSub": "comptes-rendus en attente de vous",
    "published": "Comptes-rendus publiés",
    "publishedSub": "envoyés aux élèves",
    "writeUpsLeft": "Crédits de comptes-rendus",
    "writeUpsAria": "Crédits restants — en acheter plus",
    "usageTrial": "{used} utilisés sur vos {total} gratuits",
    "usageBought": "{used} produits · n’expirent pas",
    "lessonCalendar": "Agenda des cours",
    "primaryCalendar": "(principal)"
  },
  "connect": {
    "title": "Connecter votre Google Agenda",
    "body": "Liez votre agenda pour que Lesson Studio puisse voir vos cours à venir, gérer les réservations et enregistrer chaque séance.",
    "notConfigured": "Google OAuth n’est pas encore configuré. Ajoutez {id} et {secret} à l’environnement et redémarrez.",
    "scopeRead": "**Lire votre agenda** — trouver les cours et leurs liens",
    "scopeRecord": "**Enregistrer les cours** — saisir les séances avec l’extension Lesson Studio",
    "scopeRecap": "**Créer des comptes-rendus** — synthèses automatiques à relire et partager",
    "continueGoogle": "Continuer avec Google",
    "fine": "Vous passerez par l’écran de consentement Google. Modifiable ensuite dans Paramètres."
  },
  "settings": {
    "eyebrow": "Espace",
    "title": "Paramètres",
    "recorderTitle": "Enregistreur de leçon",
    "recorderDesc": "Extension Chrome qui enregistre un cours et en fait un compte-rendu. {guide}",
    "recorderGuide": "Guide étape par étape →",
    "replayTourHint": "Vous avez oublié à quoi sert une page ? Le tutoriel repart d’ici.",
    "languageTitle": "Langue",
    "languageDesc": "La langue de cet espace enseignant. Cela ne modifie pas la langue des comptes-rendus — chaque élève choisit la sienne.",
    "connectionsTitle": "Connexions",
    "connectionsDesc": "Liez les outils pour la planification, les réunions et les paiements.",
    "livesTitle": "Où vivent vos cours",
    "livesDesc": "Si vos cours sont sur Google Agenda, créez une page réservations et activez l’enregistrement automatique. Sinon, l’espace ne garde que les enregistrements.",
    "calendarTitle": "Agenda de cours",
    "calendarDesc": "Quel agenda contient les cours à lire dans Lesson Studio ?",
    "primaryCalendar": "Agenda principal",
    "speakingTitle": "Exercices oraux",
    "speakingDesc": "Chaque compte-rendu finit par trois exercices oraux. Les élèves peuvent enregistrer leurs réponses et elles s’affichent sur la page de la leçon, sous la phrase concernée — vous recevez un e-mail quand ils le font. Si vous désactivez, ces trois exercices disparaissent du compte-rendu.",
    "speakingOn": "Autoriser l’enregistrement élève",
    "speakingOnHint": "Vous les écoutez sur la page du cours",
    "speakingOff": "Ne pas inclure",
    "speakingOffHint": "Le compte-rendu garde ses sept exercices écrits",
    "platformTitle": "Plateforme de réunion par défaut",
    "platformDesc": "Ce que crée une nouvelle réservation. Choisissez la dernière option si vos cours sont sur une marketplace et que le lien existe déjà.",
    "meetLabel": "Google Meet",
    "meetHint": "Créé sur votre agenda",
    "ownLinkLabel": "Je fournis mon propre lien",
    "ownLinkHint": "Preply, italki, ou une salle à vous"
  },
  "billing": {
    "leftTitle": "Crédits restants",
    "leftDesc": "Un crédit utilisé à chaque compte-rendu. Aucun n’expire, rien n'est renouvelé.",
    "ofFree": "sur vos {total} comptes-rendus gratuits",
    "ofFreeUsed": "sur vos {total} gratuits · {used} utilisés",
    "builtSoFar": "{used} produits",
    "emptyTrial": "Gratuits écoulés. Un pack ci-dessous permet de continuer à rédiger — pas d’abonnement ni de date butoir.",
    "emptyPaid": "Votre solde est vide. Un pack ci-dessous permet de le recharger, et les crédits non utilisés restent.",
    "addTitle": "Acheter des comptes-rendus",
    "addDesc": "Un paiement, aucun renouvellement automatique. Plus le pack est grand, plus le prix unitaire baisse — mais le petit pack n’est pas plus cher au total et vos crédits vous appartiennent jusqu’à leur usage.",
    "lessonsWrittenUp": "leçons rédigées",
    "save": "économisez {pct}%",
    "neverExpires": "N’expire jamais",
    "buy": "Acheter {n}",
    "paidOnce": "Payé une fois, par carte, via Stripe. Aucun numéro gardé, pas de prélèvement futur.",
    "packTags": [
      "Pour débuter",
      "Rythme régulier",
      "Plus courant"
    ]
  },
  "recap": {
    "tabs": [
      "Progression",
      "Compte-rendu",
      "Devoirs",
      "Vocabulaire"
    ],
    "tabsAria": "Sections du compte-rendu",
    "eyebrow": "Relire avant d’envoyer",
    "title": "{name} · Compte-rendu de leçon",
    "lessonFallback": "Leçon",
    "sub": "relisez chaque onglet, puis envoyez à {first}.",
    "translate": "Traduire les explications",
    "translateTitle": "Réécrire les explications dans la langue de l’élève — contenu et scores inchangés",
    "working": "Traitement…",
    "rebuild": "Regénérer depuis l’enregistrement",
    "rebuildTitle": "Régénérer à partir de l’enregistrement avec l’IA et les métriques à jour",
    "rebuilding": "Regénération…",
    "deleteDraft": "Supprimer le brouillon",
    "deleting": "Suppression…",
    "saveDraft": "Enregistrer le brouillon",
    "approve": "Valider & envoyer",
    "sending": "Envoi…",
    "savedTick": "Enregistré ✓",
    "confirmRebuild": "Regénérer ce compte-rendu à partir de l’enregistrement ? Cela refait le résumé, les sections, les devoirs et les métriques, et efface vos modifications manuelles.",
    "confirmTranslate": "Traduire les explications de ce compte-rendu dans la langue de ce groupe d’élève ? Les exemples, citations et notes restent inchangés.",
    "confirmDelete": "Supprimer le brouillon pour {name} ? Il sera retiré de la file d’attente et c’est irréversible.",
    "promptLanguage": "Aucune langue d’explication définie pour cet élève (réglable sur la page élève). Traduire les explications dans quelle langue ?",
    "rebuildFailed": "La régénération a échoué",
    "translationFailed": "La traduction a échoué",
    "deleteFailed": "Impossible de supprimer le compte-rendu",
    "savingEdits": "Enregistrement des modifications…",
    "uploadingMemo": "Envoi de votre mémo vocal…",
    "uploadingFile": "Envoi de {name}…",
    "attachingMaterials": "Ajout de vos supports…",
    "attachmentFailed": "Compte-rendu envoyé, mais un support n’a pas été ajouté — ajoutez-le depuis la leçon.",
    "suggestedScript": "Script suggéré"
  },
  "portal": {
    "slots": {
      "greeting": "Bon retour,",
      "tabOverview": "Vue d’ensemble",
      "tabLessons": "Leçons",
      "tabProgress": "Progression",
      "tabPractice": "Exercices",
      "tabFiles": "Fichiers",
      "tabTests": "Tests",
      "statLessons": "Leçons",
      "statScore": "Note moy.",
      "statSpeaking": "Oral",
      "lessonsTitle": "Vos leçons",
      "progressTitle": "Votre progression",
      "vocabTitle": "Vocabulaire",
      "milestoneTitle": "Prochaine étape",
      "scoresTitle": "Scores récents",
      "testsTitle": "Tests d’entraînement",
      "speakingTitle": "Participation orale",
      "filesTitle": "Fichiers de cours",
      "vocabTotalsTitle": "Évolution du vocabulaire"
    },
    "tabsAria": "Sections du tableau de bord",
    "notLinked": "Compte non encore relié",
    "askTeacher": "Demandez à votre enseignant de relier votre compte.",
    "climbLed": "Vous êtes passé de l’écoute à {em}.",
    "climbLedEm": "mener la conversation",
    "climbMore": "Vous parlez {em} qu’au début.",
    "climbMoreEm": "{delta} points en plus",
    "climbPlain": "Vous avez parlé {em} lors du dernier cours.",
    "youSpoke": "Vous avez parlé",
    "acrossLessons": "Sur {n} leçons",
    "acrossOneLesson": "Sur 1 leçon",
    "climbSub": "Le repère indique votre départ — {then}.",
    "climbDelta": "{delta} points depuis la leçon 1",
    "inLast30": "{n} ces 30 derniers jours",
    "totalLessons": "Nombre total de leçons",
    "inAll": "{n} au total",
    "words": "{n} mots",
    "lastN": "Derniers {n}",
    "metricPace": "Rythme",
    "metricThinking": "Temps de réflexion",
    "metricShare": "Votre part",
    "practiseTitle": "Entraînez votre vocabulaire",
    "practiceHistory": "Entraînement, deux dernières semaines",
    "byKind": "Par type de mots",
    "byLesson": "Par leçon",
    "practiseAnything": "Tout entraîner",
    "practiseDue": "À revoir aujourd’hui",
    "vocabKnown": "maîtrisé",
    "vocabLearning": "en cours",
    "vocabNew": "pas commencé",
    "download": "Télécharger"
  },
  "practice": {
    "emptyTitle": "Aucun exercice disponible",
    "emptyBody": "Vos mots apparaîtront ici lorsque votre enseignant publiera un compte-rendu.",
    "howMany": "Combien aujourd’hui ?",
    "doneTitle": "Terminé — {n} cartes.",
    "doneOneTitle": "Terminé — 1 carte.",
    "allFirstTime": "Tous pour une première fois. Ils reviendront d’ici quelques jours.",
    "someMissed": "{right} nouveaux, {missed} à revoir plus tôt.",
    "moreLeft": "{n} mots restants dans cette pile, quand vous voulez.",
    "oneLeft": "Encore 1 mot dans cette pile, quand vous voulez.",
    "wholePile": "C’est toute la pile.",
    "nextRound": "Encore {n}",
    "practiseAgain": "Recommencer",
    "backToPractice": "Retour aux exercices",
    "tapToSee": "Appuyez pour voir la signification",
    "again": "Encore",
    "knewIt": "Je savais",
    "sayOutLoud": "Dites-le à voix haute avant de retourner la carte."
  },
  "rating": {
    "question": "Cela correspond-t-il à votre leçon ?",
    "yes": "Oui, c’était ma leçon",
    "no": "Pas tout à fait",
    "thanksYes": "Vous confirmez que cela reflète votre leçon. Merci — c'est noté.",
    "thanksNo": "Vous indiquez que cela ne colle pas. Merci — c’est le retour utile.",
    "whatWasOff": "Qu’est-ce qui était incorrect ? Choisissez tout ce qui s’applique.",
    "notePlaceholder": "Si possible, précisez la partie — une phrase suffit.",
    "send": "Envoyer",
    "sending": "Envoi…",
    "didNotSave": "Échec de l’enregistrement.",
    "reasons": [
      "Des mots que je n’ai jamais dits",
      "Confusion des interlocuteurs",
      "Mauvaise langue ou écriture",
      "Trop facile ou trop difficile",
      "Autre raison"
    ]
  },
  "recapLanguage": {
    "question": "Mes comptes-rendus sont rédigés en",
    "hint": "La langue que vous apprenez reste inchangée — c’est la langue de l’explication autour.",
    "aria": "Langue d’explication du compte-rendu",
    "saved": "Enregistré — pris en compte aux prochains comptes-rendus.",
    "didNotSave": "Enregistrement impossible."
  },
  "lesson": {
    "railAria": "Sections de la leçon",
    "thisLesson": "Cette leçon",
    "movements": [
      "Comment vous avez parlé",
      "Ce que vous avez réussi",
      "À travailler",
      "Ce qu’on a abordé",
      "Mots du jour",
      "Exercices",
      "Fichiers & audio"
    ],
    "speakingBalance": "Équilibre oral",
    "score": "Score",
    "grammarDensity": "Densité grammaticale",
    "corrections": "Corrections",
    "homework": "Devoirs",
    "noHomework": "Aucun devoir pour cette leçon.",
    "practiceExercises": "Exercices pratiques",
    "wordsFromLesson": "Vocabulaire de la leçon",
    "whoTalked": "Répartition des prises de parole",
    "speakingMeasured": "Votre participation orale, analysée",
    "yourTeacher": "Votre enseignant"
  },
  "join": {
    "setupFailed": "Impossible de préparer votre compte.",
    "acceptFailed": "Impossible d’accepter l’invitation.",
    "joining": "Inscription…",
    "joinAs": "Rejoindre en tant que {name}",
    "notYou": "Ce n'est pas vous ? {signOut} puis rouvrez ce lien.",
    "notYouLink": "Se déconnecter",
    "emailLabel": "Votre adresse e-mail",
    "passwordLabel": "Choisissez un mot de passe",
    "passwordHint": "Au moins 8 caractères",
    "settingUp": "Mise en place…",
    "createAccount": "Créer mon compte"
  },
  "speaking": {
    "cta": "Enregistrez votre réponse",
    "sendFailed": "Impossible d’envoyer cet enregistrement. Réessayez.",
    "recordAgain": "Réenregistrer",
    "sendToTeacher": "Envoyer à l’enseignant",
    "sending": "Envoi…",
    "tryAgain": "Réessayer",
    "keepSent": "Garder l’envoi"
  },
  "exchange": {
    "recording": "Enregistrement",
    "download": "Télécharger",
    "nothingShared": "Rien partagé pour cette leçon pour le moment.",
    "noFiles": "Aucun fichier partagé. Ajoutez une présentation ou un PDF pour ce cours.",
    "audioIntro": "Entraînement libre enregistré par cet élève pour la leçon. Leurs réponses aux exercices oraux sont dans l’onglet Exercices.",
    "noAudio": "Aucun audio envoyé."
  },
  "charts": {
    "metrics": [
      {
        "label": "Score",
        "note": "Notation de chaque leçon sur dix."
      },
      {
        "label": "Vous parlez",
        "note": "Votre temps de parole. Plus il augmente, plus vous prenez confiance."
      },
      {
        "label": "Rythme",
        "note": "Nombre de mots à la minute pendant que vous parliez."
      },
      {
        "label": "Temps de réflexion",
        "note": "Temps de réponse. Plus il diminue, plus les mots viennent vite."
      },
      {
        "label": "Vocabulaire",
        "note": "Total de tous les mots rencontrés."
      }
    ],
    "nothingYet": "Aucune donnée pour l’instant.",
    "sinceLesson": "depuis la leçon {n}",
    "trendLater": "La tendance s’affichera après votre prochain cours."
  },
  "tests": {
    "saveScoreFailed": "Impossible d’enregistrer votre score.",
    "finish": "Terminer — {pct}%",
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
    "removeRange": "Supprimer ce créneau",
    "couldNotSave": "Impossible d’enregistrer",
    "saveChanges": "Enregistrer les modifications",
    "defaultsTitle": "Réglages par défaut",
    "defaultsDesc": "Durée des cours et délai de réservation.",
    "lessonName": "Nom du cours",
    "lessonNamePlaceholder": "Cours de langue",
    "lessonLength": "Durée du cours (min)",
    "slotInterval": "Intervalle de créneaux (min)",
    "minNotice": "Préavis minimum (h)",
    "bufferBefore": "Délai avant (min)",
    "bufferAfter": "Délai après (min)",
    "maxPerDay": "Max cours / jour",
    "bookingWindow": "Plage réservable (jours)",
    "title": "Disponibilités",
    "copyMon": "Copier lun. → jours ouvrés",
    "copyMonTitle": "Copier les horaires du lundi sur mar–ven",
    "previewBooking": "Prévisualiser la page de réservation ↗",
    "unavailable": "Indisponible",
    "dateOverrides": "Exceptions par date"
  },
  "recordings": {
    "eyebrow": "Vue d’ensemble",
    "title": "Leçons & comptes-rendus",
    "settings": "Paramètres",
    "yourStudents": "Vos élèves",
    "publishedTitle": "Leçons publiées",
    "publishedDesc": "Accessible par vos élèves, du plus récent au plus ancien. Les brouillons sont dans la file d’attente ci-dessus.",
    "nothingPublished": "Rien encore publié",
    "untitled": "Leçon sans titre",
    "published": "Publié",
    "draft": "Brouillon",
    "summaryAria": "Résumé de cours",
    "students": "Élèves",
    "changedMind": "Changé d'avis ?",
    "connectCalendar": "Connecter un agenda"
  },
  "lessonRow": {
    "joinCall": "Rejoindre l’appel ↗",
    "viewRecap": "Voir le compte-rendu",
    "reviewRecap": "Relire le compte-rendu",
    "noLink": "Aucun lien",
    "eyebrow": "Relire avant de publier",
    "recapTitle": "{title} · Compte-rendu",
    "closeAria": "Fermer la relecture",
    "draftBanner": "Brouillon IA — relisez bien avant d’envoyer à l’élève.",
    "score": "Score",
    "studentTalk": "Parole élève",
    "grammar": "Grammaire",
    "confidence": "Confiance",
    "homework": "Devoirs",
    "memoScript": "Script mémo vocal",
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
    "bookingFailed": "Échec de la réservation.",
    "bookingFailedRetry": "Échec — réessayez.",
    "eyebrow": "Planifier un cours",
    "title": "Trouvez un créneau",
    "sub": "Choisissez un jour puis une heure. Votre confirmation et le lien arrivent par e-mail.",
    "booked": "Cours réservé !",
    "invite": "Une invitation sera envoyée à {email}.",
    "openMeeting": "Ouvrir le lien de la réunion",
    "noCalendar": "Disponibilités indisponibles. L’agenda est-il connecté ?",
    "noTimes": "Aucun créneau disponible dans 30 jours.",
    "pickDay": "Choisir un jour",
    "pickDayHint": "Les jours avec un point offrent des possibilités.",
    "yourDetails": "Vos informations",
    "confirmAt": "Confirmer {time}",
    "yourName": "Votre nom",
    "namePlaceholder": "Jane Dupont",
    "yourEmail": "Votre e-mail",
    "emailPlaceholder": "vous@email.com",
    "booking": "Réservation…",
    "bookAt": "Réserver · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "Vue d’ensemble",
        "body": "Point de départ. Les comptes-rendus à relire arrivent ici, vos derniers cours sont en dessous."
      },
      {
        "title": "Élèves",
        "body": "Ajoutez chaque élève ici. Leur progression, leurs leçons, tests — tout part de cette liste — et chacun possède son propre portail."
      },
      {
        "title": "Notes",
        "body": "Un clic par cours donné : un calendrier mensuel qui joue le rôle de journal d’enseignement."
      },
      {
        "title": "Vue élève",
        "body": "Identique à ce que voient vos élèves, adapté à vos choix — couleurs, noms, sections. Ce n’est pas une maquette : c’est la vraie vue."
      },
      {
        "title": "Paiements",
        "body": "Notez ce que chaque élève a payé et de combien de leçons cela se compose. Le solde décroît à chaque compte-rendu publié."
      },
      {
        "title": "Paramètres",
        "body": "Votre agenda, l’enregistreur, votre compte. Ce tutoriel se trouve ici si vous souhaitez le revoir."
      }
    ],
    "skip": "Passer le tutoriel"
  },
  "languages": {
    "couldNotSave": "Impossible d’enregistrer",
    "title": "Vos langues",
    "desc": "Ce que vous enseignez et la langue de déroulement des cours. Nouveaux élèves par défaut sur ces réglages.",
    "youTeach": "Langue enseignée",
    "spokenIn": "Langue dans laquelle le cours est parlé",
    "fitTitle": "Comment les langues s’articulent",
    "fitDesc": "Trois réglages pour trois rôles différents.",
    "fitLearning": "**Pour chaque élève, la langue “apprise”** détermine la génération des comptes-rendus et des tests — {n} gérés, du japonais à l’arabe. Réglé à l’ajout, modifiable sur la page élève.",
    "fitExplained": "**La langue “explications” de l’élève** détermine la langue des textes et consignes — anglais par défaut, modifiable aussi sur la fiche élève.",
    "fitSpoken": "**La langue “parlée en cours”** guide la transcription par l’enregistreur. Elle suit votre choix ci-dessus, modifiable par élève ensuite — plus de question répétée par l’extension."
  },
  "notes": {
    "pickStudent": "Choisissez un élève",
    "empty": "La note est vide",
    "couldNotSave": "Impossible d’enregistrer la note",
    "confirmDelete": "Supprimer cette note ?",
    "hoursTaught": "Heures enseignées",
    "recapsPublished": "Comptes-rendus envoyés",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun élève encore",
    "student": "Élève",
    "addNote": "Ajouter une note",
    "newNote": "Nouvelle note",
    "editNote": "Modifier la note"
  },
  "exercises": {
    "none": "Aucun exercice — ajoutez-en un ci-dessous.",
    "instruction": "Consigne",
    "instructionPlaceholder": "Ce qui est demandé à l’élève",
    "focus": "Point ciblé",
    "focusPlaceholder": "Point de grammaire/lexique entraîné",
    "sentence": "Phrase",
    "meaning": "Traduction",
    "removeSentence": "Supprimer la phrase",
    "removeOption": "Supprimer l’option",
    "questionTarget": "Question (langue cible)",
    "question": "Question"
  },
  "payments": {
    "selectStudent": "Sélectionner un élève",
    "amountTooLow": "Indiquez un montant supérieur à zéro",
    "saveFailed": "Échec de l’enregistrement",
    "thisMonth": "Ce mois-ci",
    "receivedAllTime": "Reçus depuis le début",
    "outstanding": "Restant dû",
    "currency": "Devise",
    "students": "Élèves",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun élève encore",
    "student": "Élève",
    "recent": "Paiements récents",
    "newPayment": "Nouveau paiement",
    "editPayment": "Modifier le paiement",
    "selectPlaceholder": "Sélectionner…",
    "amount": "Montant ({symbol})",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "covers": "Pour",
    "coversPlaceholder": "ex. Pack juillet — 4 cours",
    "paymentDate": "Date de paiement",
    "dueDate": "Échéance",
    "lessonsCovered": "Cours inclus",
    "lessonsPlaceholder": "ex. 4",
    "method": "Moyen de paiement",
    "methodPlaceholder": "Virement, Espèces, PayPal…",
    "confirmDelete": "Supprimer ce paiement ?"
  },
  "recapReview": {
    "vocab": "Vocabulaire",
    "summary": "Résumé",
    "summaryPlaceholder": "Résumé du cours…",
    "sectionTitle": "Titre de section",
    "sectionContent": "Contenu de la section…",
    "removeSection": "Supprimer la section",
    "homeworkTask": "Devoir",
    "noteTitle": "Votre note à l’élève",
    "notePlaceholder": "Un mot personnel pour l’élève…"
  },
  "connectors": {
    "googleName": "Google Agenda",
    "googleDesc": "Lit vos cours et ajoute les réservations sur votre agenda.",
    "connect": "Connecter",
    "permissionNeeded": "Autorisation requise",
    "reconnect": "Reconnecter",
    "disconnect": "Déconnecter",
    "zoomDesc": "Crée automatiquement une salle Zoom pour chaque cours réservé.",
    "comingSoon": "Bientôt disponible",
    "stripeName": "Stripe",
    "stripeDesc": "Acceptez les paiements pour vos cours — les fonds sont versés directement."
  },
  "student": {
    "notJoined": "Invité — pas encore inscrit",
    "avgScore": "Moyenne",
    "latestTalk": "Participation récente",
    "vocabItems": "Éléments de vocabulaire",
    "creditsLeft": "{left} cours restants / {bought} achetés",
    "creditsOneLeft": "1 cours restant / {bought} achetés",
    "noCredits": "Aucun cours acheté",
    "managePayments": "Gérer les paiements →",
    "lessonsTitle": "Cours & comptes-rendus",
    "noLessons": "Aucun cours encore",
    "noLessonsSub": "Les cours enregistrés apparaîtront ici.",
    "testsTitle": "Tests d’entraînement",
    "noTests": "Aucun test encore"
  },
  "addStudent": {
    "levels": [
      "Débutant",
      "Elémentaire",
      "Pré-intermédiaire",
      "Intermédiaire",
      "Intermédiaire avancé",
      "Avancé"
    ],
    "createFailed": "Impossible de créer l’élève",
    "aria": "Nouvel élève",
    "title": "Nouvel élève",
    "fullName": "Nom complet",
    "namePlaceholder": "Jane Dupont",
    "level": "Niveau",
    "learning": "Langue apprise",
    "choose": "Choisir…",
    "recapLanguage": "Langue du compte-rendu"
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
    "noLessonsThatDay": "Aucun cours prévu ce jour-là.",
    "agendaClear": "Votre agenda est vide.",
    "noUpcoming": "Aucun cours à venir sur cet agenda."
  },
  "forgot": {
    "title": "Réinitialisez votre mot de passe",
    "lead": "Saisissez l’e-mail utilisé pour vous connecter et nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    "send": "Envoyer le lien",
    "sending": "Envoi…",
    "sent": "Si {email} est inscrit, un lien a été envoyé. Ouvrez l’e-mail et suivez le lien — il expire dans une heure.",
    "spam": "Rien reçu ? Vérifiez vos spams, ou essayez avec l’adresse utilisée à l’inscription.",
    "remembered": "Finalement retrouvé ?",
    "backToSignIn": "Retour à la connexion"
  },
  "reset": {
    "tooShort": "Le nouveau mot de passe doit contenir au moins 6 caractères.",
    "mismatch": "Les deux mots de passe diffèrent — vérifiez-les.",
    "samePassword": "C’est le même mot de passe qu’avant — choisissez-en un autre.",
    "saveFailed": "Mot de passe non sauvegardé. Veuillez réessayer.",
    "title": "Nouveau mot de passe",
    "expired": "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.",
    "noToken": "Cette page ne fonctionne qu’avec le lien de l’e-mail reçu. Demandez l’envoi d’un lien.",
    "lead": "Choisissez un nouveau mot de passe. Vous serez connecté dès que c’est fait.",
    "newPassword": "Nouveau mot de passe",
    "repeat": "Répétez-le"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "Moyenne",
        "sub": "Sur 10, tous les cours notés confondus."
      },
      {
        "label": "Part de parole",
        "sub": "Proportion de la leçon où l’élève parle."
      },
      {
        "label": "Rythme oral",
        "sub": "Mots à la minute lorsqu’il s’exprime. Plus c’est élevé, plus il est à l’aise."
      },
      {
        "label": "Temps de réflexion",
        "sub": "Secondes entre la fin de votre question et le début de sa réponse. Une longue pause indique l’effort, pas une erreur."
      },
      {
        "label": "Mots par tour",
        "sub": "Longueur moyenne des prises de parole. Courtes et fréquentes : bonnes réponses mais pas conversation."
      },
      {
        "label": "Mots parasites",
        "sub": "Ums et ahs par cours. À lire avec le rythme — rapide et rempli n’est pas pareil que lent et maîtrisé."
      }
    ],
    "totalLessons": "Nombre total de cours",
    "acrossStudents": "sur {n} élèves",
    "mostActive": "Plus actif",
    "nLessons": "{n} cours",
    "nothingRecorded": "rien enregistré",
    "vocabMet": "Vocabulaire rencontré",
    "wordsAcross": "mots sur tous les cours",
    "notSeenLately": "Pas vu récemment",
    "everyoneCurrent": "tout le monde est à jour",
    "measureAria": "Mesure",
    "nothingMeasured": "Aucune mesure pour l’instant — cela se remplit au fil des cours.",
    "perStudent": "{measure} — par élève",
    "perStudentSub": "Leurs cours dans l’ordre. La flèche va du premier au dernier.",
    "prevMeasure": "Mesure précédente",
    "nextMeasure": "Mesure suivante"
  },
  "test": {
    "heading": "Test d’entraînement niveau {level}",
    "published": "Publié",
    "draftOnlyYou": "Brouillon — seulement visible par vous",
    "basedOn": "Basé sur",
    "lessonN": "Leçon {n}",
    "script": "Écriture",
    "scriptBeginner": "Hiragana + romaji",
    "scriptHiragana": "Hiragana",
    "scriptKanji": "Kanji + kana",
    "created": "Créé",
    "status": "Statut",
    "speakingAnswer": "Réponse orale",
    "unplayable": "Enregistrement présent mais non lisible."
  },
  "trial": {
    "aria": "Bienvenue sur Lesson Studio",
    "kicker": "Bienvenue sur Lesson Studio",
    "title": "Vos {n} premiers comptes-rendus sont offerts.",
    "sub": "Installez l’enregistreur, donnez un cours, voyez-le revenir rédigé — pas de carte, rien à payer. Quand concluant, choisissez une offre.",
    "showMe": "Laissez-moi visiter",
    "exploreMyself": "J’explore seul",
    "setUpFirst": "Ou installez d’abord l’enregistreur →"
  },
  "reviewQueue": {
    "title": "Comptes-rendus à relire",
    "desc": "Issus de vos enregistrements. Rien n’est envoyé tant que vous n’avez pas relu et transmis.",
    "moveFailed": "Impossible de déplacer ce compte-rendu",
    "serverUnreachable": "Serveur injoignable",
    "rebuildFailed": "Impossible de régénérer ce compte-rendu",
    "deleteFailed": "Suppression impossible"
  },
  "recorderMissing": {
    "title": "Ajoutez l’enregistreur pour commencer",
    "body": "Lesson Studio génère les comptes-rendus à partir de vos leçons, l’extension Chrome les enregistre. Tant qu’elle n'est pas installée et connectée, rien n’arrivera ici — c’est le seul moyen d’ajouter un cours."
  },
  "pending": {
    "chooseStudent": "Choisissez d’abord avec qui était la leçon.",
    "fileFailed": "Impossible d’archiver cet enregistrement.",
    "confirmDelete": "Supprimer cet enregistrement ? L'audio sera supprimé aussi.",
    "studentAria": "Élève",
    "choosePlaceholder": "Choisir un élève",
    "filing": "Archivage…",
    "buildRecap": "Créer le compte-rendu"
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
        "sub": "Kanji avec lectures"
      }
    ],
    "failed": "Échec de la génération",
    "needLesson": "Publiez un compte-rendu d’abord",
    "title": "Générer un test d’entraînement",
    "explanationLanguage": "Langue d’explication"
  }
} as const
