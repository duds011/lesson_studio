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
    "somethingWrong": "Une erreur s’est produite. Réessayez dans un instant."
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "Espace enseignant",
    "overviewAria": "Aperçu Lesson Studio",
    "navAria": "Navigation espace enseignant",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu",
    "expand": "Développer la navigation",
    "collapse": "Réduire la navigation",
    "sectionWorkspace": "Espace",
    "sectionManage": "Gérer",
    "overview": "Aperçu",
    "students": "Élèves",
    "notes": "Notes",
    "materials": "Supports",
    "studentView": "Vue élève",
    "availability": "Disponibilités",
    "settings": "Paramètres",
    "calendarConnected": "Agenda connecté",
    "setupNeeded": "Configuration à faire",
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
      "hint": "Nous lisons vos cours, acceptons les réservations et envoyons l’enregistreur"
    },
    {
      "label": "Non — j’organise ailleurs",
      "hint": "Les cours arrivent sous forme d’enregistrements ; aucun agenda ne s’affiche"
    }
  ],
  "auth": {
    "language": "Langue",
    "emailLabel": "Adresse e-mail",
    "emailPlaceholder": "vous@example.com",
    "passwordLabel": "Mot de passe",
    "signInTitle": "Connexion",
    "signInSub": "Bienvenue. Connectez-vous pour voir vos cours, votre progression et vos comptes-rendus.",
    "signInExpired": "La session a expiré. Connectez-vous et nous vous ramènerons ici.",
    "signInAction": "Connexion",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau ici ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "Configuration gratuite et premier élève ajoutable immédiatement.",
    "studentQuestion": "Vous êtes élève ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d’invitation — ouvrez-le et choisissez votre email et votre mot de passe. Après, connectez-vous ici.",
    "signInHeadline": "Chaque cours, rédigé.",
    "signInAside": "Lesson Studio transforme chaque heure en compte-rendu, tableau de progression et exercices — pour l’enseignant qui l’a animé et l’élève présent.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Démarrez votre espace Koku Library pour élèves, comptes-rendus, réservations et suivi.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "Au moins 6 caractères",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Déjà un compte ?",
    "signUpHeadline": "Toute votre activité d’enseignement, au même endroit.",
    "signUpAside": "Installation en quelques minutes. Ajoutez un élève, enregistrez votre prochain cours, le reste se construit."
  },
  "aside": {
    "slides": [
      {
        "title": "Le compte-rendu s’écrit tout seul",
        "body": "Une extension Chrome enregistre les deux voix. Le compte-rendu revient en brouillon — vous corrigez et publiez."
      },
      {
        "title": "Une progression visible",
        "body": "Scores, temps de parole et vocabulaire suivis d’un cours à l’autre, sur une page dédiée à l’élève."
      },
      {
        "title": "Toutes les langues enseignées",
        "body": "Japonais, français, coréen, espagnol et trente autres — corrigé dans la langue du cours, expliqué dans celle de l’élève."
      },
      {
        "title": "S’exercer à partir de ses propres mots",
        "body": "Flashcards et tests oraux créés à partir du vocabulaire vu en cours."
      },
      {
        "title": "Un portail élève à votre nom",
        "body": "Vos couleurs, vos textes, et uniquement les sections que vous utilisez."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos cours",
      "Où vous donnez cours",
      "Votre agenda",
      "Vue côté élève",
      "Votre enregistreur"
    ],
    "sideTitle": "Configurons votre studio.",
    "sideBody": "Quatre étapes rapides et vos élèves auront leur propre portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Terminer la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Impossible d’enregistrer",
    "couldNotFinish": "Échec de finalisation",
    "pickTeaching": "Choisissez la langue que vous enseignez.",
    "pickSpoken": "Choisissez la langue parlée en cours.",
    "pickCalendar": "Dites-nous si vos cours sont dans un agenda.",
    "pickPortalName": "Donnez un nom au portail — vos élèves le verront.",
    "teachAria": "Langue que vous enseignez",
    "iTeach": "J’enseigne",
    "teachHint": "Les comptes-rendus et exercices sont créés dans cette langue. C’est le réglage par défaut pour chaque nouvel élève — modifiable pour chacun ensuite.",
    "uiFollows": "Votre espace sera dans cette langue aussi, si disponible — anglais, français ou japonais, et anglais pour le reste. Modifiable plus tard dans Paramètres.",
    "spokenAria": "Langue parlée en cours",
    "spokenIn": "mes cours sont principalement en",
    "spokenHint": "Souvent, ce n’est pas la langue apprise — avec un débutant, la langue partagée sert de relais. L’enregistreur la détecte.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où rencontrez-vous vos élèves ?",
    "platformLead": "Sur Meet ou Zoom, le lien est créé à la réservation. Sur une marketplace, un salon existe déjà : on récupère le lien en place.",
    "zoomLater": "Connecter Zoom plus tard, dans Paramètres",
    "stayOutTitle": "Nous restons hors du cours lui-même",
    "stayOutBody": "Aucun lien créé, aucun robot envoyé. Vous enregistrez vous-même, et compte-rendu, vocabulaire, exercices se construisent à partir de ça — vos élèves voient la même chose.",
    "calendarTitle": "Où vivent vos cours ?",
    "calendarLeadExternal": "Certains enseignants {platform} utilisent toujours Google Agenda, d’autres restent sur la plateforme. Votre réponse détermine l’affichage.",
    "calendarLead": "Si vos élèves sont sur votre Google Agenda, nous pouvons lire votre semaine, prendre les réservations et envoyer l’enregistreur. Sinon, nous ne nous en mêlons pas.",
    "googleConnected": "Google Agenda connecté",
    "googleConnectedSub": "Vous pouvez choisir l’agenda qui contient vos cours dans les Paramètres.",
    "connectGoogle": "Connecter Google Agenda",
    "connectGoogleFine": "Vous serez redirigé vers Google puis revenu ici. Cela reste facultatif, mais réservations et enregistrements automatiques ne seront pas disponibles tant que ce n’est pas fait.",
    "recordTitle": "Enregistrez le cours",
    "recordBody": "Quelle que soit la salle, capturez-la et confiez l’enregistrement à Lesson Studio.",
    "reviewTitle": "Revoyez le compte-rendu",
    "reviewBody": "Il arrive dans votre file de révision comme les autres. Publiez-le, l’élève le reçoit.",
    "noCalendarFine": "Pas d’agenda, pas de page de réservation, aucune relance — l’espace s’ouvre sur vos cours et comptes-rendus. Vous pouvez changer d’avis plus tard dans Paramètres.",
    "brandTitle": "Personnalisez votre portail",
    "brandLead": "Choisissez une couleur et un nom pour le portail de vos élèves. Tout est ajustable par la suite.",
    "portalNameLabel": "Nom du portail élève",
    "portalNamePlaceholder": "ex : Sakura Japonais",
    "portalNameFine": "S’affiche en haut du portail de chaque élève et dans l’invitation. Votre propre nom, pas le nôtre.",
    "accent": "Couleur d’accent",
    "previewTagline": "Apprenez aujourd’hui, avancez demain !",
    "recorderTitle": "Installer l’enregistreur",
    "recorderLead": "C’est la partie qui fait le travail : une extension Chrome qui enregistre le cours et rédige le compte-rendu. Aucun robot n’entre en salle, rien à installer côté élève.",
    "recorderStep1": "**Ajoutez-le depuis le Chrome Web Store** — un clic, puis épinglez-le dans votre barre.",
    "recorderStep2": "**Connectez-vous dans l’extension** avec le même email et mot de passe. Rien à transférer.",
    "recorderStep3": "**Enregistrez un cours** : choisissez l’élève, lancez, arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "recorderFine": "Vous préférez le guide complet (micro, ce qui est enregistré…) ? Tout est sur le {guide} — également en **Paramètres → Enregistreur de cours** quand vous voulez.",
    "recorderFineLink": "guide d’installation"
  },
  "overview": {
    "eyebrow": "Aperçu",
    "title": "Votre calendrier de cours",
    "manageConnections": "Gérer les connexions",
    "fixInSettings": "Corrigez dans Paramètres",
    "summaryAria": "Résumé de cours",
    "upcoming": "Cours à venir",
    "drafts": "Brouillons à revoir",
    "draftsSub": "comptes-rendus en attente de votre action",
    "published": "Comptes-rendus publiés",
    "publishedSub": "envoyés aux élèves",
    "writeUpsLeft": "Comptes-rendus restants",
    "writeUpsAria": "Comptes-rendus restants — en acheter plus",
    "usageTrial": "{used} utilisés sur vos {total} gratuits",
    "usageBought": "{used} créés · pas d’expiration",
    "lessonCalendar": "Agenda des cours",
    "primaryCalendar": "(principal)"
  },
  "connect": {
    "title": "Connectez votre Google Agenda",
    "body": "Liez votre agenda pour que Lesson Studio voie vos cours à venir, accepte les réservations et enregistre chaque leçon.",
    "notConfigured": "Google OAuth n’est pas encore configuré. Ajoutez {id} et {secret} dans l’environnement, puis redémarrez.",
    "scopeRead": "**Lire votre agenda** — repérer vos cours et leurs liens",
    "scopeRecord": "**Enregistrer les cours** — capturer les cours via l’extension Lesson Studio",
    "scopeRecap": "**Créer les comptes-rendus** — résumés rédigés par IA à relire et partager",
    "continueGoogle": "Continuer avec Google",
    "fine": "Vous serez envoyé sur Google pour autoriser. Modifiable ensuite dans Paramètres."
  },
  "settings": {
    "eyebrow": "Espace",
    "title": "Paramètres",
    "sectionsAria": "Sections des paramètres",
    "tabs": [
      "Connexions",
      "Langues",
      "Portail élève"
    ],
    "recorderTitle": "Enregistreur de cours",
    "recorderDesc": "L’extension Chrome qui enregistre un cours et en fait un compte-rendu. {guide}",
    "recorderGuide": "Guide pas à pas →",
    "replayTourHint": "Vous avez oublié le but d’une page ? Le tutoriel est relançable ici.",
    "languageTitle": "Langue",
    "languageDesc": "Ce que cet espace vous affiche. Cela ne change pas la langue des comptes-rendus — chaque élève choisit la sienne.",
    "connectionsTitle": "Connexions",
    "connectionsDesc": "Connectez les outils pour planifier, rencontrer, et recevoir les paiements.",
    "livesTitle": "Où se trouvent vos cours",
    "livesDesc": "Sur Google Agenda, vous disposez d’une page de réservation, créneaux libres et enregistrements automatiques. Organisez ailleurs et seuls les enregistrements sont pris en compte.",
    "calendarTitle": "Agenda des cours",
    "calendarDesc": "Quel agenda contient les cours à lire par Lesson Studio ?",
    "primaryCalendar": "Agenda principal",
    "autoSendTitle": "Envoi des comptes-rendus",
    "autoSendDesc": "Chaque compte-rendu attend dans votre file de révision avant d’être envoyé. Si vous ne souhaitez pas relire, ils peuvent être envoyés à l’élève dès leur rédaction — vous pourrez toujours modifier plus tard, mais l’élève verra la première version.",
    "autoSendReview": "Je les relis d’abord",
    "autoSendReviewHint": "Ils patientent dans Comptes-rendus à revoir",
    "autoSendAuto": "Envoyer automatiquement",
    "autoSendAutoHint": "L’élève le reçoit dès qu’il est rédigé",
    "speakingTitle": "Exercices oraux",
    "speakingDesc": "Chaque compte-rendu se termine par trois exercices oraux. Laissez vos élèves enregistrer leurs réponses, visibles sur la page cours sous la phrase concernée — et vous recevez un email à chaque soumission. Désactivez pour que ces trois exercices disparaissent du compte-rendu.",
    "speakingOn": "Autoriser l’enregistrement des élèves",
    "speakingOnHint": "Vous écoutez sur la page du cours",
    "speakingOff": "Sans exercice oral",
    "speakingOffHint": "Le compte-rendu garde ses sept exercices écrits",
    "platformTitle": "Plateforme de réunion par défaut",
    "platformDesc": "Ce que crée une nouvelle réservation. Choisissez la dernière option si vos cours sont sur une marketplace qui gère déjà le lien.",
    "meetLabel": "Google Meet",
    "meetHint": "Créé dans votre agenda",
    "ownLinkLabel": "Je partage mon propre lien",
    "ownLinkHint": "Preply, italki ou salon personnel"
  },
  "billing": {
    "eyebrow": "Comptes-rendus",
    "title": "Achetez des cours. Utilisez-les quand vous voulez.",
    "buyMore": "Acheter plus de comptes-rendus",
    "once": "unique",
    "nWriteUps": "{n} comptes-rendus",
    "packNames": [
      "10 cours",
      "40 cours",
      "100 cours"
    ],
    "neverTitle": "Rien ne se renouvelle",
    "neverBody": "Prenez congé en août, ils seront toujours là en septembre. Pas de limite de temps, pas de renouvellement, pas de carte enregistrée.",
    "leftTitle": "Comptes-rendus restants",
    "leftDesc": "Un est décompté à chaque rédaction. Pas d’expiration, pas de renouvellement.",
    "ofFree": "sur vos {total} comptes-rendus gratuits",
    "ofFreeUsed": "sur {total} gratuits · {used} utilisés",
    "builtSoFar": "{used} créés jusque-là",
    "emptyTrial": "Ce sont les gratuits utilisés. Un pack ci-dessous permet de continuer à rédiger vos comptes-rendus — il n’y a pas d’abonnement ni de date limite.",
    "emptyPaid": "Votre solde est à zéro. Un pack ci-dessous le recharge, ce que vous n’utilisez pas reste disponible.",
    "addTitle": "Ajouter des comptes-rendus",
    "addDesc": "Un paiement, aucun renouvellement. Les packs plus gros sont moins chers — mais le petit n’est pas pénalisant, et ce que vous achetez reste à vous.",
    "save": "économisez {pct} %",
    "neverExpires": "Pas de date limite",
    "buy": "Acheter {n}",
    "openingStripe": "Ouverture Stripe…",
    "stripeUnreachable": "Impossible de contacter Stripe pour le moment. Réessayez bientôt.",
    "paidOnce": "Payé une seule fois, par carte, via Stripe. Aucune carte n’est enregistrée et aucun prélèvement automatique.",
    "packTags": [
      "Pour commencer",
      "Régulier",
      "Le plus choisi"
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
    "eyebrow": "Relisez avant d’envoyer",
    "title": "{name} · Compte-rendu du cours",
    "lessonFallback": "Cours",
    "sub": "revoyez chaque onglet, puis envoyez-le à {first}.",
    "translate": "Traduire les explications",
    "translateTitle": "Réécrire les explications dans la langue de l’élève — le support du cours et les scores ne bougent pas",
    "working": "Traitement…",
    "rebuild": "Recréer depuis l’enregistrement",
    "rebuildTitle": "Régénérer à partir de l’enregistrement avec l’IA et les métriques à jour",
    "rebuilding": "Génération en cours…",
    "deleteDraft": "Supprimer le brouillon",
    "deleting": "Suppression…",
    "saveDraft": "Enregistrer le brouillon",
    "approve": "Valider et envoyer",
    "sending": "Envoi…",
    "savedTick": "Enregistré ✓",
    "confirmRebuild": "Recréer ce compte-rendu à partir de l’enregistrement ? Cela régénère le résumé, les sections, les devoirs et les indicateurs, et supprime toutes les modifications manuelles.",
    "confirmTranslate": "Traduire les explications de ce compte-rendu dans la langue d’explication de cet élève ? Les exemples, citations et scores ne changent pas.",
    "confirmDelete": "Supprimer le brouillon du compte-rendu de {name} ? Cela l’efface de la file à revoir et est irréversible.",
    "promptLanguage": "Aucune langue d’explication définie pour cet élève (modifiable sur sa fiche). Traduire les explications dans quelle langue ?",
    "rebuildFailed": "Échec de la régénération",
    "translationFailed": "Traduction impossible",
    "deleteFailed": "Impossible de supprimer le compte-rendu",
    "savingEdits": "Enregistrement de vos modifications…",
    "uploadingMemo": "Envoi de votre mémo vocal…",
    "uploadingFile": "Téléversément de {name}…",
    "attachingMaterials": "Ajout de vos supports…",
    "attachmentFailed": "Compte-rendu envoyé, mais une pièce jointe n’a pas pu être ajoutée — ajoutez-la depuis la page du cours.",
    "suggestedScript": "Script proposé"
  },
  "portal": {
    "slots": {
      "greeting": "Bon retour,",
      "tabOverview": "Aperçu",
      "tabLessons": "Cours",
      "tabProgress": "Progression",
      "tabPractice": "Entraînement",
      "tabFiles": "Fichiers",
      "tabTests": "Tests",
      "statLessons": "Cours",
      "statScore": "Moyenne",
      "statSpeaking": "Oral",
      "lessonsTitle": "Vos cours",
      "progressTitle": "Votre progression",
      "vocabTitle": "Vocabulaire",
      "milestoneTitle": "Prochaine étape",
      "scoresTitle": "Scores récents",
      "testsTitle": "Tests d’entraînement",
      "speakingTitle": "Pratiques orales",
      "filesTitle": "Fichiers de cours",
      "vocabTotalsTitle": "Evolution du vocabulaire"
    },
    "tabsAria": "Sections du tableau de bord",
    "notLinked": "Compte non relié",
    "askTeacher": "Demandez à votre enseignant de lier votre compte.",
    "climbLed": "Vous êtes passé de l’écoute à {em}.",
    "climbLedEm": "mener la conversation",
    "climbMore": "Vous parlez {em} qu’au début.",
    "climbMoreEm": "{delta} points de plus",
    "climbPlain": "Vous avez parlé {em} lors du dernier cours.",
    "youSpoke": "Vous avez parlé",
    "acrossLessons": "Sur {n} cours",
    "acrossOneLesson": "Sur 1 cours",
    "climbSub": "La marque sur l’arc indique votre point de départ — {then}.",
    "climbDelta": "{delta} points depuis le premier cours",
    "inLast30": "{n} sur les 30 derniers jours",
    "totalLessons": "Cours suivis au total",
    "inAll": "{n} au total",
    "words": "{n} mots",
    "lastN": "Derniers {n}",
    "metricPace": "Rythme",
    "metricThinking": "Temps de réflexion",
    "metricShare": "Votre part",
    "practiseTitle": "Exercez vos mots",
    "practiceHistory": "Entraînement, deux dernières semaines",
    "byKind": "Par type de mot",
    "byLesson": "Par cours",
    "practiseAnything": "S’exercer sur tout",
    "practiseDue": "S’exercer sur ce qui est à réviser",
    "vocabKnown": "connu",
    "vocabLearning": "en cours",
    "vocabNew": "pas commencé",
    "download": "Télécharger"
  },
  "practice": {
    "emptyTitle": "Rien à réviser pour l’instant",
    "emptyBody": "Les mots apparaissent ici une fois qu’un compte-rendu de cours est publié.",
    "howMany": "Combien aujourd’hui ?",
    "doneTitle": "Terminé — {n} cartes.",
    "doneOneTitle": "Terminé — 1 carte.",
    "allFirstTime": "Toutes vues pour la première fois. Elles reviendront bientôt.",
    "someMissed": "{right} premières fois, {missed} à réviser plus tôt.",
    "moreLeft": "{n} mots restants dans ce lot, quand vous voulez.",
    "oneLeft": "1 mot restant dans ce lot, quand vous voulez.",
    "wholePile": "C’est tout ce lot.",
    "nextRound": "{n} de plus",
    "practiseAgain": "Revoir",
    "backToPractice": "Revenir à l’entraînement",
    "tapToSee": "Tapez pour voir la signification",
    "again": "Encore",
    "knewIt": "Je le savais",
    "sayOutLoud": "Dites-le à voix haute avant de retourner la carte."
  },
  "rating": {
    "question": "Ce compte-rendu correspond-il à votre cours ?",
    "yes": "Oui, c’était mon cours",
    "no": "Pas tout à fait",
    "thanksYes": "Vous avez dit que le compte-rendu correspondait. Merci – votre retour est enregistré.",
    "thanksNo": "Vous avez signalé un écart. Merci – c’est ce qui nous aide.",
    "whatWasOff": "Où était-ce faux ? Sélectionnez ce qui convient.",
    "notePlaceholder": "Si possible, indiquez la partie concernée — une phrase suffit.",
    "send": "Envoyer",
    "sending": "Envoi…",
    "didNotSave": "Non enregistré.",
    "reasons": [
      "Des mots que je n’ai pas dits",
      "Confusion sur qui a dit quoi",
      "Mauvaise écriture ou langue",
      "Trop facile ou trop difficile",
      "Autre chose"
    ]
  },
  "recapLanguage": {
    "question": "Mes comptes-rendus sont rédigés en",
    "hint": "La langue que vous apprenez reste telle quelle — autour, les explications sont dans cette langue.",
    "hintLearning": "Le {lang} que vous apprenez reste tel quel — toutes les explications autour seront dans cette langue.",
    "aria": "Langue d’explication de mes comptes-rendus",
    "saved": "Enregistré — à partir du prochain compte-rendu.",
    "didNotSave": "Impossible d’enregistrer."
  },
  "studentSettings": {
    "eyebrow": "Votre compte",
    "title": "Paramètres",
    "back": "← Retour à vos cours",
    "languageTitle": "Langue de cette page",
    "languageDesc": "Boutons, titres et textes autour des cours. Cela ne change pas la langue du compte-rendu — voir ci-dessous."
  },
  "lesson": {
    "railAria": "Sections du cours",
    "thisLesson": "Ce cours",
    "movements": [
      "Comment vous avez parlé",
      "Ce que vous avez bien réussi",
      "Ce qu’il reste à travailler",
      "Ce qui a été traité",
      "Mots du jour",
      "Exercices",
      "Fichiers & audio"
    ],
    "speakingBalance": "Répartition de la parole",
    "score": "Score",
    "grammarDensity": "Densité grammaticale",
    "corrections": "Corrections",
    "homework": "Devoirs",
    "noHomework": "Aucun devoir pour ce cours.",
    "practiceExercises": "Exercices d’entraînement",
    "wordsFromLesson": "Mots de ce cours",
    "whoTalked": "Qui a parlé",
    "speakingMeasured": "Votre oral, mesuré",
    "yourTeacher": "Votre enseignant"
  },
  "join": {
    "setupFailed": "Impossible de créer votre compte.",
    "acceptFailed": "Impossible d’accepter l’invitation.",
    "joining": "Connexion…",
    "joinAs": "Rejoindre en tant que {name}",
    "notYou": "Ce n’est pas vous ? {signOut} et ouvrez ce lien de nouveau.",
    "notYouLink": "Déconnexion",
    "emailLabel": "Votre adresse e-mail",
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
    "keepSent": "Conserver celui que j’ai envoyé"
  },
  "exchange": {
    "recording": "Enregistrement",
    "download": "Télécharger",
    "nothingShared": "Rien partagé pour ce cours.",
    "noFiles": "Aucun fichier partagé. Ajoutez une présentation ou un PDF pour ce cours.",
    "audioIntro": "Pratique libre enregistrée par cet élève pour le cours. Leurs réponses aux exercices oraux se trouvent dans l’onglet Entraînement.",
    "noAudio": "Aucun audio déposé pour le moment."
  },
  "charts": {
    "metrics": [
      {
        "label": "Score",
        "note": "Note sur 10 à chaque cours."
      },
      {
        "label": "Vous parlez",
        "note": "Votre part de parole. Elle progresse avec votre assurance."
      },
      {
        "label": "Rythme",
        "note": "Nombre de mots par minute durant votre prise de parole."
      },
      {
        "label": "Réflexion",
        "note": "Temps avant de répondre. Plus c’est court, plus la parole vient vite."
      },
      {
        "label": "Vocabulaire",
        "note": "Tous les mots de tous vos cours, cumulés."
      }
    ],
    "nothingYet": "Aucune donnée pour l’instant.",
    "sinceLesson": "depuis le cours {n}",
    "trendLater": "La tendance apparaîtra après votre prochain cours."
  },
  "tests": {
    "saveScoreFailed": "Impossible d’enregistrer votre score.",
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
    "removeRange": "Supprimer cette plage",
    "couldNotSave": "Impossible d’enregistrer",
    "saveChanges": "Enregistrer les modifications",
    "defaultsTitle": "Paramètres par défaut",
    "defaultsDesc": "Durée des cours et délai d’anticipation pour les réservations.",
    "lessonName": "Nom du cours",
    "lessonNamePlaceholder": "Cours de langue",
    "lessonLength": "Durée du cours (min)",
    "slotInterval": "Intervalle entre créneaux (min)",
    "minNotice": "Préavis minimum (h)",
    "bufferBefore": "Pause avant (min)",
    "bufferAfter": "Pause après (min)",
    "maxPerDay": "Max cours/jour",
    "bookingWindow": "Fenêtre de réservation (jours)",
    "title": "Disponibilités",
    "copyMon": "Copier lundi → jours de la semaine",
    "copyMonTitle": "Copier les horaires du lundi sur mar–ven",
    "previewBooking": "Voir la page de réservation ↗",
    "unavailable": "Indisponible",
    "dateOverrides": "Exceptions par date"
  },
  "recordings": {
    "eyebrow": "Aperçu",
    "title": "Cours & comptes-rendus",
    "settings": "Paramètres",
    "yourStudents": "Vos élèves",
    "publishedTitle": "Cours publiés",
    "publishedDesc": "Tout ce que vos élèves voient déjà, du plus récent au plus ancien. Les brouillons patientent ci-dessus.",
    "nothingPublished": "Rien de publié pour l’instant",
    "untitled": "Cours sans titre",
    "published": "Publié",
    "draft": "Brouillon",
    "summaryAria": "Résumé du cours",
    "students": "Élèves",
    "changedMind": "Vous changez d’avis ?",
    "connectCalendar": "Connecter un agenda"
  },
  "lessonRow": {
    "joinCall": "Rejoindre l’appel ↗",
    "viewRecap": "Voir le compte-rendu",
    "reviewRecap": "Revoir le compte-rendu",
    "noLink": "Aucun lien",
    "eyebrow": "Relisez avant publication",
    "recapTitle": "{title} · Compte-rendu du cours",
    "closeAria": "Fermer la relecture du compte-rendu",
    "draftBanner": "Brouillon IA — vérifiez le contenu ci-dessous avant qu’il n’atteigne l’élève.",
    "score": "Score",
    "studentTalk": "Parole élève",
    "grammar": "Grammaire",
    "confidence": "Confiance",
    "homework": "Devoirs",
    "memoScript": "Script du mémo vocal",
    "teacherNote": "Note enseignant",
    "editLater": "Modifier plus tard",
    "approveSend": "Valider et envoyer à l’élève"
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
    "bookingFailedRetry": "Échec de la réservation — réessayez.",
    "eyebrow": "Planifier un cours",
    "title": "Trouvez un créneau adapté",
    "sub": "Choisissez un jour puis une heure. Confirmation et détails de réunion envoyés par e-mail.",
    "booked": "Réservation effectuée !",
    "invite": "Une invitation agenda a été envoyée à {email}.",
    "openMeeting": "Ouvrir le lien de réunion",
    "noCalendar": "Disponibilités indisponibles. L’agenda est-il connecté ?",
    "noTimes": "Aucun créneau disponible dans les 30 prochains jours.",
    "pickDay": "Choisissez un jour",
    "pickDayHint": "Les jours avec un point ont des créneaux ouverts.",
    "yourDetails": "Vos informations",
    "confirmAt": "Confirmer {time}",
    "yourName": "Votre nom",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "Votre e-mail",
    "emailPlaceholder": "vous@email.com",
    "booking": "Réservation…",
    "bookAt": "Réserver le cours · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "Commencez par un élève",
        "body": "Tout part de là : cours, comptes-rendus, son portail dédié. Ouvrez Élèves et nous ajouterons le premier.",
        "wait": "Ouvrir Élèves"
      },
      {
        "title": "Ajoutez votre premier élève",
        "body": "Il suffit du nom et de ce qu’il apprend. Pas d’e-mail encore — un lien vous sera donné à la fin.",
        "wait": "Appuyez sur Ajouter un élève"
      },
      {
        "title": "Juste le nom et la langue",
        "body": "Le niveau est une première estimation, la langue du compte-rendu détermine les explications. Les deux sont modifiables par la suite.",
        "wait": "Remplir et enregistrer"
      },
      {
        "title": "Envoyez-lui ce lien",
        "body": "C’est tout ce qu’il faut. L’élève ouvre, choisit son mot de passe, et le portail est prêt — cours, vocabulaire, progression, tout sous votre nom de studio.",
        "wait": ""
      }
    ],
    "skip": "Passer",
    "replay": "✨ Revoir le tutoriel"
  },
  "languages": {
    "couldNotSave": "Impossible d’enregistrer",
    "title": "Vos langues",
    "desc": "Ce que vous enseignez et la langue parlée. Nouveaux élèves démarrent sur ces réglages.",
    "youTeach": "Langue enseignée",
    "spokenIn": "Langue parlée lors des cours",
    "fitTitle": "Comment les langues s’articulent",
    "fitDesc": "Trois réglages, trois rôles différents.",
    "fitLearning": "**Langue « apprise » par l’élève** : ce choix détermine la génération des comptes-rendus et tests — {n} langues disponibles, du japonais à l’arabe. Sélectionnée lors de l’ajout, modifiable ensuite.",
    "fitExplained": "**Langue « explications » pour l’élève** : c’est la langue des explications et consignes des comptes-rendus et tests — anglais par défaut, modifiable à tout moment.",
    "fitSpoken": "**Langue « parlée en cours » pour l’élève** : c’est celle détectée par la transcription. Suive le réglage ci-dessus tant que vous ne changez pas sur la fiche élève — l’enregistreur ne redemande pas, car ça ne change pas d’un cours à l’autre."
  },
  "notes": {
    "pickStudent": "Sélectionnez un élève",
    "empty": "Note vide",
    "couldNotSave": "Impossible d’enregistrer la note",
    "confirmDelete": "Supprimer cette note ?",
    "hoursTaught": "Heures enseignées",
    "recapsPublished": "Comptes-rendus publiés",
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
    "none": "Aucun exercice pour l’instant — ajoutez-en ci-dessous.",
    "instruction": "Consigne",
    "instructionPlaceholder": "Ce qui est demandé à l’élève",
    "focus": "Cible",
    "focusPlaceholder": "Ce que les phrases travaillent",
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
    "receivedAllTime": "Reçu au total",
    "outstanding": "Restant dû",
    "currency": "Devise",
    "students": "Élèves",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun élève pour l’instant",
    "student": "Élève",
    "recent": "Règlements récents",
    "newPayment": "Nouveau paiement",
    "editPayment": "Modifier le paiement",
    "selectPlaceholder": "Choisir…",
    "amount": "Montant ({symbol})",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "covers": "Couvre",
    "coversPlaceholder": "ex : pack juillet — 4 cours",
    "paymentDate": "Date du paiement",
    "dueDate": "À régler avant",
    "lessonsCovered": "Cours couverts",
    "lessonsPlaceholder": "ex : 4",
    "method": "Mode",
    "methodPlaceholder": "Virement, Espèces, PayPal…",
    "confirmDelete": "Supprimer ce paiement ?"
  },
  "recapReview": {
    "vocab": "Vocabulaire",
    "summary": "Résumé",
    "summaryPlaceholder": "Résumé du cours…",
    "sectionTitle": "Titre de la section",
    "sectionContent": "Contenu de la section…",
    "removeSection": "Supprimer la section",
    "homeworkTask": "Tâche à faire à la maison",
    "noteTitle": "Note à l’élève",
    "notePlaceholder": "Un mot personnel pour l’élève…"
  },
  "connectors": {
    "googleName": "Google Agenda",
    "googleDesc": "Lit vos cours et y inscrit les nouveaux rendez-vous.",
    "connect": "Connecter",
    "permissionNeeded": "Permission requise",
    "reconnect": "Reconnecter",
    "disconnect": "Déconnecter",
    "zoomDesc": "Crée automatiquement une salle Zoom unique pour chaque réservation.",
    "comingSoon": "Bientôt disponible",
    "stripeName": "Stripe",
    "stripeDesc": "Encaissez les paiements CB pour des packs de cours — virements directs vers vous."
  },
  "student": {
    "notJoined": "Invité — pas encore inscrit",
    "avgScore": "Moyenne",
    "latestTalk": "Dernière prise de parole",
    "vocabItems": "Entrées de vocabulaire",
    "creditsLeft": "{left} cours restants / {bought} achetés",
    "creditsOneLeft": "1 cours restant / {bought} achetés",
    "noCredits": "Aucun cours acheté pour l’instant",
    "managePayments": "Gérer les paiements →",
    "lessonsTitle": "Cours & comptes-rendus",
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
      "Intermédiaire supérieur",
      "Avancé"
    ],
    "createFailed": "Impossible de créer l’élève",
    "aria": "Nouvel élève",
    "title": "Nouvel élève",
    "fullName": "Nom complet",
    "namePlaceholder": "Jane Doe",
    "level": "Niveau",
    "learning": "Langue apprise",
    "choose": "Choisir…",
    "recapLanguage": "Langue du compte-rendu",
    "trigger": "+ Ajouter un élève",
    "inviteTitle": "Lien d’invitation pour {name}",
    "inviteBody": "Envoyez-le comme d’habitude. L’élève ouvre le lien, choisit son e-mail et mot de passe, et entre dans votre espace prêt à commencer.",
    "addAnother": "Ajouter un autre élève",
    "copyAgain": "Vous pouvez le copier à nouveau depuis la fiche de {name}."
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
    "fixInSettings": "Réglez dans Paramètres",
    "nothingOn": "Rien le {day}.",
    "noLessonsThatDay": "Aucun cours prévu ce jour-là.",
    "agendaClear": "Votre agenda est vide.",
    "noUpcoming": "Aucun cours à venir sur cet agenda."
  },
  "forgot": {
    "title": "Réinitialiser votre mot de passe",
    "lead": "Entrez l’e-mail utilisé lors de l’inscription et nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    "send": "Envoyer le lien",
    "sending": "Envoi…",
    "sent": "Si {email} a un compte, un lien de réinitialisation est en route. Ouvrez l’e-mail et suivez le lien : il expire sous une heure.",
    "spam": "Rien reçu ? Consultez vos spams ou réessayez avec l’adresse d’inscription.",
    "remembered": "Vous l’avez retrouvé ?",
    "backToSignIn": "Retour à la connexion"
  },
  "reset": {
    "tooShort": "Votre nouveau mot de passe doit comporter au moins 6 caractères.",
    "mismatch": "Les deux mots de passe ne correspondent pas — vérifiez-les.",
    "samePassword": "C’est le même mot de passe que précédemment — choisissez-en un autre.",
    "saveFailed": "Impossible d’enregistrer ce mot de passe. Réessayez.",
    "title": "Choisissez un nouveau mot de passe",
    "expired": "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.",
    "noToken": "Cette page ne s’ouvre qu’avec le lien de réinitialisation reçu par e-mail. Demandez-en un et nous l’enverrons.",
    "lead": "Choisissez un nouveau mot de passe pour votre compte. Vous serez connecté dès que c’est enregistré.",
    "newPassword": "Nouveau mot de passe",
    "repeat": "Ressaisissez-le"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "Moyenne",
        "sub": "Sur 10, tous les cours notés confondus."
      },
      {
        "label": "Part de parole",
        "sub": "Temps de parole de l’élève pendant le cours."
      },
      {
        "label": "Vitesse orale",
        "sub": "Mots/minute lors de la prise de parole. Une hausse signale la progression orale."
      },
      {
        "label": "Temps de réflexion",
        "sub": "Secondes entre la fin de la consigne et le début de la réponse. Une pause longue montre le travail, ce n’est pas une erreur."
      },
      {
        "label": "Mots par intervention",
        "sub": "Longueur des prises de parole. Des interventions brèves mais fréquentes, c’est répondre, pas converser."
      },
      {
        "label": "Mots de remplissage",
        "sub": "Mots de remplissage (euh, hum…) par cours. À lire avec la vitesse : rapide ET plein de « euh » ce n’est pas la même difficulté que lent et fluide."
      }
    ],
    "totalLessons": "Cours suivis",
    "acrossStudents": "sur {n} élèves",
    "mostActive": "Le plus actif",
    "nLessons": "{n} cours",
    "nothingRecorded": "rien d’enregistré",
    "vocabMet": "Vocabulaire rencontré",
    "wordsAcross": "mots sur l’ensemble des cours",
    "notSeenLately": "Absent récemment",
    "everyoneCurrent": "tout le monde est à jour",
    "measureAria": "Indicateur",
    "nothingMeasured": "Rien mesuré pour l’instant — cela avance à mesure des enregistrements.",
    "perStudent": "{measure} — par élève",
    "perStudentSub": "Leurs cours dans l’ordre. La flèche va du premier au dernier.",
    "prevMeasure": "Indicateur précédent",
    "nextMeasure": "Indicateur suivant"
  },
  "test": {
    "heading": "Test d’entraînement {level}",
    "published": "Publié",
    "draftOnlyYou": "Brouillon — visible de vous seul",
    "basedOn": "Basé sur",
    "lessonN": "Cours {n}",
    "script": "Système d’écriture",
    "scriptBeginner": "Hiragana + rōmaji",
    "scriptHiragana": "Hiragana",
    "scriptKanji": "Kanji + kana",
    "created": "Créé",
    "status": "Statut",
    "speakingAnswer": "Réponse orale",
    "unplayable": "Un enregistrement existe mais ne peut pas être lu."
  },
  "trial": {
    "aria": "Bienvenue sur Lesson Studio",
    "kicker": "Bienvenue sur Lesson Studio",
    "title": "Vos {n} premiers comptes-rendus sont offerts.",
    "sub": "Installez l’enregistreur, donnez un cours, et voyez le texte s’écrire — pas de carte, pas d’engagement. Après essai, choisissez un pack.",
    "showMe": "Visitez guidée",
    "exploreMyself": "Je découvre seul",
    "setUpFirst": "Ou installez l’enregistreur d’abord →"
  },
  "reviewQueue": {
    "title": "Comptes-rendus à revoir",
    "desc": "Générés à partir de vos enregistrements. Rien n’ira à un élève sans votre validation.",
    "moveFailed": "Impossible de déplacer ce compte-rendu",
    "serverUnreachable": "Impossible de joindre le serveur",
    "rebuildFailed": "Impossible de régénérer ce compte-rendu",
    "deleteFailed": "Impossible de supprimer le compte-rendu"
  },
  "recorderMissing": {
    "title": "Ajoutez l’enregistreur pour commencer",
    "body": "Lesson Studio rédige des comptes-rendus depuis vos cours, et l’extension Chrome sert à les enregistrer. Tant qu’elle n’est pas installée et connectée, rien n’arrivera ici — aucune autre façon d’ajouter un cours."
  },
  "pending": {
    "chooseStudent": "Sélectionnez d’abord avec quel élève était ce cours.",
    "fileFailed": "Impossible d’archiver cet enregistrement.",
    "confirmDelete": "Supprimer cet enregistrement ? L’audio sera effacé.",
    "studentAria": "Élève",
    "choosePlaceholder": "Choisissez un élève",
    "filing": "Archivage…",
    "buildRecap": "Créer le compte-rendu"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "Débutant",
        "sub": "Hiragana + rōmaji"
      },
      {
        "label": "Hiragana",
        "sub": "Kana, pas de rōmaji"
      },
      {
        "label": "Kanji + kana",
        "sub": "Kanji avec lectures"
      }
    ],
    "failed": "Échec de la génération",
    "needLesson": "Publiez d’abord un compte-rendu de cours",
    "title": "Générer un test d’entraînement",
    "explanationLanguage": "Langue d’explication"
  },
  "guide": {
    "eyebrow": "Enregistreur de cours",
    "title": "Enregistrez un cours, recevez un compte-rendu",
    "sub": "Une extension Chrome qui enregistre votre onglet de cours et votre micro sur deux pistes séparées, puis transforme cela en brouillon de compte-rendu ici. Aucun robot ne rejoint l’appel, rien n’est installé côté élève — fonctionne sur Preply, italki, Google Meet, Zoom, partout où votre cours a lieu dans un onglet.",
    "step1Title": "Installez-le depuis le Chrome Web Store",
    "step1Body": "Un clic, aucun réglage. Puis épinglez-le — cliquez sur la pièce de puzzle à côté de la barre d’adresse puis sur l’épingle — ainsi le K reste prêt si besoin.",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Ajouter à Chrome",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "betaNote": "**Vous avez testé la bêta depuis un dossier ?** Supprimez d’abord cette copie ({path} → Supprimer). Une seule copie peut enregistrer un onglet à la fois.",
    "step2Title": "Connectez-vous — une fois pour toutes",
    "step2Body": "Ouvrez l’extension et connectez-vous avec le même email et mot de passe qu’ici. Rien d’autre à faire : elle sait qui vous êtes, qui sont vos élèves et la langue que vous enseignez.",
    "signIn": "Se connecter",
    "step3Title": "Ouvrez l’onglet du cours et lancez l’enregistrement",
    "step3Body": "Placez-vous dans l’onglet du cours réel — la classe Preply, l’appel Meet. Cliquez sur le K, sélectionnez l’élève, appuyez sur **Démarrer l’enregistrement**. La première fois, Chrome demande le micro : autorisez. Puis fermez la fenêtre et enseignez — l’enregistrement continue.",
    "studentLabel": "Élève :",
    "step4Title": "Arrêtez puis envoyez",
    "step4Body": "À la fin du cours, rouvrez la fenêtre, cliquez sur **Arrêter l’enregistrement**, puis **Envoyer vers Lesson Studio**. Rien n’est envoyé avant d’avoir cliqué.",
    "sendButton": "Envoyer vers Lesson Studio →",
    "step5Title": "Relisez le compte-rendu généré",
    "step5Body": "Quelques minutes plus tard, le brouillon vous attend dans **Comptes-rendus à revoir** dans votre aperçu — résumé, vocabulaire, devoirs, dans la langue de l’élève. Modifiez si besoin, envoyez, l’élève le reçoit dans son portail.",
    "reviewAndSend": "Relire et envoyer",
    "consentTitle": "Avant d’enregistrer quelqu’un",
    "consentBody": "Prévenez votre élève et obtenez son accord pour l’enregistrement. Certaines juridictions l’exigent, Preply et italki ont aussi leurs propres règles — consultez-les avant d’adopter cet usage.",
    "dataBody": "L’enregistreur saisit les deux voix. Rien n’est transféré tant que vous n’appuyez pas sur **Envoyer vers Lesson Studio**, l’audio est transcrit pour rédiger le compte-rendu, et effacé 30 jours plus tard. Tous les détails sont dans notre {policy}.",
    "privacyLink": "politique de confidentialité"
  },
  "lessonExercises": {
    "none": "Aucun exercice écrit pour ce cours.",
    "recordReading": "Enregistrez-vous en train de dire ces phrases",
    "notRecorded": "Pas encore enregistré."
  },
  "lessonTools": {
    "lessonIsWith": "Ce cours est avec",
    "notLinked": "Non relié (test / pas d’élève)",
    "hint": "Liez un élève pour que le compte-rendu lui soit attribué. Laissez vide pour un appel test."
  },
  "memo": {
    "back15": "Reculer de 15 s",
    "forward15": "Avancer de 15 s",
    "seek": "Se positionner"
  },
  "joinInvalid": {
    "title": "Ce lien n’est pas valide",
    "body": "Il a peut-être déjà servi, ou votre enseignant l’a remplacé. Demandez un nouveau lien.",
    "goSignIn": "Aller à la connexion"
  },
  "dashboard": {
    "students": "Élèves",
    "withLogin": "Avec connexion",
    "lessonsRecorded": "Cours enregistrés",
    "noStudents": "Aucun élève",
    "notJoined": "Invité — pas encore inscrit",
    "lessons": "Cours",
    "overview": "Aperçu"
  },
  "misc": {
    "outOfTen": "SUR 10",
    "dashboardBack": "Tableau de bord",
    "backToOverview": "Retour à l’aperçu",
    "recapGone": "Ce compte-rendu n’est plus disponible.",
    "timesShared": "Partages",
    "languageGroup": "Langue",
    "extConfirmReset": "Déconnecter l’enregistreur partout ? L’enregistrement s’arrêtera jusqu’à reconnexion dans l’extension.",
    "extResetFailed": "Impossible de réinitialiser la connexion avec l’enregistreur.",
    "extSigningOut": "Déconnexion…",
    "extSignOutEverywhere": "Déconnecter l’enregistreur partout",
    "howTitle": "Comment vos cours vous parviennent",
    "howLead": "Vous enseignez sur {platform}, donc rien n’est planifié ici. Un cours entre dans Lesson Studio dès que son enregistrement y est déposé.",
    "howSteps": [
      {
        "title": "Enregistrez le cours",
        "body": "Utilisez l’enregistreur du navigateur ou téléversez le fichier remis par la plateforme."
      },
      {
        "title": "Nous construisons le compte-rendu",
        "body": "Résumé, vocabulaire, corrections, exercices, rédigés à partir de la transcription."
      },
      {
        "title": "Vous relisez et publiez",
        "body": "Modifiez ce que vous voulez puis envoyez — l’élève le trouve dans son portail."
      }
    ],
    "instrStudentChose": "Votre élève a choisi lui-même cette langue. Vous pouvez la changer, mais c’est son choix.",
    "instrHint": "Langue d’explication des comptes-rendus et tests — cliquez pour modifier",
    "matLinkFailed": "Impossible d’enregistrer ce lien",
    "matLinksFailed": "Impossible d’enregistrer ces liens",
    "matAddLink": "Ajouter un lien",
    "confirmDeleteStudent": "Supprimer cet élève et tous ses cours ? Cette action est irréversible.",
    "resetPassword": "Réinitialiser le mot de passe",
    "inviteLink": "Lien d’invitation",
    "uploadFailed": "Échec de l’envoi",
    "micBlocked": "Micro bloqué — autorisez le micro dans le navigateur.",
    "micBlockedBar": "Micro bloqué — autorisez dans la barre d’adresse puis réessayez.",
    "uploadAFile": "Téléverser un fichier",
    "submitToTeacher": "Soumettre à l’enseignant",
    "discardRedo": "Recommencer",
    "sendToStudent": "Envoyer à l’élève",
    "sendThisAnswer": "Envoyer cette réponse",
    "sentTick": "Envoyé ✓",
    "vocabByLevelAria": "Vocabulaire par niveau",
    "vocabTapHint": "Tapez sur un niveau pour voir les mots et leur premier cours.",
    "firstSeenIn": "Vu d’abord dans le cours {n}",
    "firstSeen": "Vu pour la première fois",
    "wordsIntroduced": "Mots introduits",
    "fromTheLesson": "Du cours",
    "goAgain": "Refaire",
    "showWord": "Afficher le mot",
    "showMeaning": "Afficher la signification",
    "correction": "Correction",
    "correctionsAria": "Corrections",
    "noLessonsYet": "Aucun cours pour l’instant"
  }
} as const
