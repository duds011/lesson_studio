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
    "overviewAria": "Vue d’ensemble de Lesson Studio",
    "navAria": "Navigation espace enseignant",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu",
    "expand": "Développer la navigation",
    "collapse": "Réduire la navigation",
    "sectionWorkspace": "Espace",
    "sectionManage": "Gérer",
    "overview": "Vue d’ensemble",
    "students": "Élèves",
    "notes": "Notes",
    "materials": "Supports",
    "studentView": "Vue élève",
    "payments": "Paiements",
    "availability": "Disponibilités",
    "settings": "Paramètres",
    "calendarConnected": "Calendrier connecté",
    "setupNeeded": "Configuration requise",
    "recordingsOnly": "Enregistrements uniquement",
    "studentPortal": "Accès élève"
  },
  "auth": {
    "language": "Langue",
    "emailLabel": "Adresse e-mail",
    "emailPlaceholder": "vous@example.com",
    "passwordLabel": "Mot de passe",
    "signInTitle": "Connexion",
    "signInSub": "Bon retour. Connectez-vous pour voir vos leçons, votre progression et vos récapitulatifs.",
    "signInExpired": "Votre session a expiré. Connectez-vous, vous reviendrez directement ici.",
    "signInAction": "Se connecter",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau ici ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "Configuration gratuite, et vous pouvez ajouter un premier élève tout de suite.",
    "studentQuestion": "Vous êtes élève ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d’inscription — ouvrez-le, choisissez votre e-mail et mot de passe. Ensuite, connectez-vous ici.",
    "signInHeadline": "Chaque leçon, rédigée.",
    "signInAside": "Lesson Studio transforme chaque heure en un récapitulatif écrit, un suivi de progression et des exercices — pour l’enseignant comme pour l’élève.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Créez votre espace Koku Library pour vos élèves, les récapitulatifs, les réservations et le suivi.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "Au moins 6 caractères",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Vous avez déjà un compte ?",
    "signUpHeadline": "Toute votre pratique d’enseignement, au même endroit.",
    "signUpAside": "Réglez tout en quelques minutes. Ajoutez un élève, enregistrez la prochaine leçon, le reste se construit tout seul."
  },
  "aside": {
    "slides": [
      {
        "title": "La leçon s’écrit toute seule",
        "body": "Une extension Chrome enregistre les deux voix. Le récapitulatif revient rédigé — vous relisez et publiez."
      },
      {
        "title": "Ils voient vraiment leur progression",
        "body": "Scores, temps de parole et vocabulaire suivis d’une leçon à l’autre, sur une page conçue pour l’élève."
      },
      {
        "title": "Quelle que soit la langue enseignée",
        "body": "Japonais, français, coréen, espagnol et une trentaine d’autres — corrigés dans la langue de la leçon, expliqués dans celle de l’élève."
      },
      {
        "title": "S’exercer à partir de leurs propres mots",
        "body": "Cartes mémoire et tests oraux générés à partir du vocabulaire vu pendant l’heure."
      },
      {
        "title": "Un portail élève à votre nom",
        "body": "Vos couleurs, vos mots, et uniquement les sections utilisées en cours."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos leçons",
      "Où vous donnez cours",
      "Votre calendrier",
      "Vue élève",
      "Votre enregistreur"
    ],
    "sideTitle": "Installons votre studio.",
    "sideBody": "Quatre étapes rapides et vos élèves auront leur propre portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Terminer la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Impossible d’enregistrer",
    "couldNotFinish": "Impossible de finir",
    "pickTeaching": "Choisissez la langue enseignée.",
    "pickSpoken": "Choisissez la langue dans laquelle les leçons sont données.",
    "pickCalendar": "Dites-nous si vos leçons sont dans un calendrier.",
    "pickPortalName": "Donnez un nom au portail — vos élèves le verront.",
    "teachAria": "Langue enseignée",
    "iTeach": "J’enseigne",
    "teachHint": "Le récapitulatif et les exercices sont construits pour cette langue. C’est le choix par défaut pour chaque nouvel élève — on peut ensuite le changer directement sur leur fiche.",
    "spokenAria": "Langue dans laquelle les leçons sont données",
    "spokenIn": "mes leçons sont surtout en",
    "spokenHint": "Souvent différente de la langue apprise — pour les débutants, on parle surtout la langue commune. C’est la langue écoutée par l’enregistreur.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où recevez-vous vos élèves ?",
    "platformLead": "Sur Meet ou Zoom, le lien est créé à chaque réservation. Sur une marketplace, la leçon a déjà sa salle, donc nous gardons le lien existant.",
    "zoomLater": "Relier Zoom plus tard dans les Paramètres",
    "stayOutTitle": "Nous restons en dehors du cours en direct",
    "stayOutBody": "Aucun lien créé, aucun bot envoyé. Vous enregistrez vous-même le cours, puis le récapitulatif, le vocabulaire et les exercices sont générés à partir de celui-ci — la même présentation pour vos élèves.",
    "calendarTitle": "Où se trouvent vos leçons ?",
    "calendarLeadExternal": "Certains professeurs {platform} utilisent encore Google Calendar ; d’autres se contentent de la plateforme. Votre réponse détermine l’affichage dans l’espace enseignant.",
    "calendarLead": "Si vos élèves sont sur votre Google Calendar, nous pouvons lire la semaine, prendre des réservations et envoyer l’enregistreur. Sinon, nous n’intervenons pas.",
    "googleConnected": "Google Calendar connecté",
    "googleConnectedSub": "Vous pouvez choisir plus tard le bon calendrier dans les Paramètres.",
    "connectGoogle": "Connecter Google Calendar",
    "connectGoogleFine": "Vous serez dirigé vers la page de consentement Google puis de retour ici. Vous pouvez continuer sans, mais les réservations et l’enregistrement automatique resteront inactifs jusqu’à connexion.",
    "recordTitle": "Enregistrer le cours",
    "recordBody": "Dans n’importe quelle salle, capturez le cours et envoyez l’enregistrement à Lesson Studio.",
    "reviewTitle": "Relire le récapitulatif",
    "reviewBody": "Il s’ajoute à votre file de relecture comme n’importe quelle leçon. Publiez-le pour l’élève.",
    "noCalendarFine": "Sans calendrier, pas de page de réservation ni de rappels — votre espace affichera les cours et récapitulatifs. Vous pourrez changer d’avis à tout moment dans Paramètres.",
    "brandTitle": "Personnalisez-le",
    "brandLead": "Choisissez une couleur et un nom pour le portail auquel vos élèves se connectent. Vous pourrez affiner le tout ensuite.",
    "portalNameLabel": "Nom du portail élève",
    "portalNamePlaceholder": "ex : Sakura Japanese",
    "portalNameFine": "C’est le nom affiché en haut du portail élève et dans le lien d’invitation. C’est votre nom, pas celui de notre outil.",
    "accent": "Couleur d’accentuation",
    "previewTagline": "Apprendre aujourd’hui, réussir demain !",
    "recorderTitle": "Installez l’enregistreur",
    "recorderLead": "C’est l’outil essentiel : une extension Chrome qui enregistre vos cours et écrit le récapitulatif. Aucun bot ne rejoint l’appel, rien n’est installé du côté élève.",
    "recorderStep1": "**Ajoutez-la depuis le Chrome Web Store** — un clic, puis épinglez-la dans la barre d’outils.",
    "recorderStep2": "**Connectez-vous dans l’extension** avec ce même e-mail et mot de passe. Rien à recopier.",
    "recorderStep3": "**Enregistrez un cours** : choisissez l’élève, lancez, arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — c’est gratuit ↗",
    "recorderFine": "Vous préférez une présentation complète (autorisation micro, détails sur l’enregistrement) ? Tout est dans le {guide} — aussi via **Paramètres → Enregistreur de leçon** quand vous le souhaitez.",
    "recorderFineLink": "guide d’installation"
  },
  "overview": {
    "eyebrow": "Vue d’ensemble",
    "title": "Votre calendrier d’enseignement",
    "manageConnections": "Gérer les connexions",
    "fixInSettings": "Voir dans Paramètres",
    "summaryAria": "Résumé de la leçon",
    "upcoming": "Prochaines leçons",
    "drafts": "Brouillons à relire",
    "draftsSub": "récapitulatifs prêts à relire",
    "published": "Récapitulatifs publiés",
    "publishedSub": "envoyés aux élèves",
    "writeUpsLeft": "Récapitulatifs restants",
    "writeUpsAria": "Récapitulatifs restants — acheter plus",
    "usageTrial": "{used} utilisé(s) sur vos {total} gratuits",
    "usageBought": "{used} construits · n’expirent pas",
    "lessonCalendar": "Calendrier des leçons",
    "primaryCalendar": "(principal)"
  },
  "connect": {
    "title": "Connectez votre Google Calendar",
    "body": "Reliez votre calendrier afin que Lesson Studio voie vos prochaines leçons, prenne des réservations et enregistre chaque cours.",
    "notConfigured": "Google OAuth n’est pas encore configuré. Ajoutez {id} et {secret} à l’environnement, puis redémarrez.",
    "scopeRead": "**Lire votre calendrier** — trouver les leçons et les liens de réunion",
    "scopeRecord": "**Enregistrer les leçons** — capturer les cours avec l’extension Lesson Studio",
    "scopeRecap": "**Générer les récapitulatifs** — résumés AI à relire et partager",
    "continueGoogle": "Continuer avec Google",
    "fine": "Vous serez redirigé vers l’écran de consentement Google. Vous pourrez gérer cela plus tard dans Paramètres."
  },
  "settings": {
    "eyebrow": "Espace",
    "title": "Paramètres",
    "recorderTitle": "Enregistreur de leçon",
    "recorderDesc": "L’extension Chrome qui enregistre le cours et en fait un récapitulatif. {guide}",
    "recorderGuide": "Guide pas à pas →",
    "replayTourHint": "Vous ne savez plus à quoi sert une page ? Reprendre la visite ici.",
    "languageTitle": "Langue",
    "languageDesc": "La langue utilisée dans cet espace. Cela ne change pas la langue des récapitulatifs — chaque élève choisit la sienne.",
    "connectionsTitle": "Connexions",
    "connectionsDesc": "Connectez les outils pour la planification, les réunions et les paiements.",
    "livesTitle": "Où se trouvent vos cours",
    "livesDesc": "Gardez-les sur Google Calendar pour avoir une page de réservation, gestion des créneaux et enregistrement auto. Sinon, l’espace ne montre que les enregistrements.",
    "calendarTitle": "Calendrier des leçons",
    "calendarDesc": "Quel calendrier doit être lu par Lesson Studio ?",
    "primaryCalendar": "Calendrier principal",
    "speakingTitle": "Exercices oraux",
    "speakingDesc": "Chaque récapitulatif se termine par trois exercices oraux. Vos élèves peuvent enregistrer leurs réponses, qui arrivent sur la page du cours sous la phrase correspondante — vous êtes notifié par e-mail. Désactivez pour retirer ces trois exercices du récapitulatif.",
    "speakingOn": "Laisser les élèves enregistrer",
    "speakingOnHint": "Vous écoutez dans la page du cours",
    "speakingOff": "Ne pas inclure",
    "speakingOffHint": "Le récapitulatif garde ses sept exercices écrits",
    "platformTitle": "Plateforme de réunion par défaut",
    "platformDesc": "Ce qu’une nouvelle réservation crée. Choisissez la dernière option si vos cours sont sur une marketplace et que le lien existe déjà.",
    "meetLabel": "Google Meet",
    "meetHint": "Créé dans votre calendrier",
    "ownLinkLabel": "Je partage mon propre lien",
    "ownLinkHint": "Preply, italki, ou une salle à vous"
  },
  "billing": {
    "leftTitle": "Récapitulatifs restants",
    "leftDesc": "Un récapitulatif utilisé à chaque fois qu’une leçon est rédigée. Aucune expiration, aucun renouvellement.",
    "ofFree": "sur vos {total} récapitulatifs gratuits",
    "ofFreeUsed": "sur vos {total} gratuits · {used} utilisés",
    "builtSoFar": "{used} construits depuis le début",
    "emptyTrial": "Les gratuits sont tous utilisés. Un pack ci-dessous garde vos leçons rédigées — sans abonnement ni renouvellement.",
    "emptyPaid": "Votre solde est vide. Un pack ci-dessous le recharge, et tout crédit non utilisé reste disponible.",
    "addTitle": "Acheter des récapitulatifs",
    "addDesc": "Un paiement, pas de renouvellement. Les packs plus gros reviennent moins cher — mais le petit n’est pas une pénalité, tout ce que vous achetez vous appartient jusqu’à utilisation.",
    "lessonsWrittenUp": "leçons rédigées",
    "save": "économisez {pct}%",
    "neverExpires": "N’expire jamais",
    "buy": "Acheter {n}",
    "paidOnce": "Paiement unique, par carte, via Stripe. Aucune carte n’est conservée ici, aucun prélèvement récurrent.",
    "packTags": [
      "Pour démarrer",
      "Régulier",
      "Le plus courant"
    ]
  },
  "recap": {
    "tabs": [
      "Progression",
      "Récapitulatif",
      "Devoirs",
      "Vocabulaire"
    ],
    "tabsAria": "Sections du récapitulatif",
    "eyebrow": "Relire avant d’envoyer",
    "title": "{name} · Récapitulatif de leçon",
    "lessonFallback": "Leçon",
    "sub": "relisez chaque onglet, puis envoyez à {first}.",
    "translate": "Traduire les explications",
    "translateTitle": "Réécrire les explications dans la langue de l’élève — les supports du cours et les scores sont inchangés",
    "working": "Traitement…",
    "rebuild": "Reconstruire à partir de l’enregistrement",
    "rebuildTitle": "Régénérer depuis l’enregistrement avec la dernière IA + métriques",
    "rebuilding": "Régénération…",
    "deleteDraft": "Supprimer le brouillon",
    "deleting": "Suppression…",
    "saveDraft": "Enregistrer le brouillon",
    "approve": "Valider & envoyer",
    "sending": "Envoi…",
    "savedTick": "Enregistré ✓",
    "confirmRebuild": "Reconstruire ce récapitulatif depuis l’enregistrement ? Cela recommence le résumé, les sections, les devoirs et les mesures orales, et efface vos modifications.",
    "confirmTranslate": "Traduire les explications de ce récapitulatif dans la langue utilisée avec cet élève ? Exemples, citations et scores restent inchangés.",
    "confirmDelete": "Supprimer le brouillon de récapitulatif de {name} ? Il sera retiré de la file à relire et cette action est définitive.",
    "promptLanguage": "Aucune langue d’explication n’est encore définie pour cet élève (vous pouvez la fixer sur sa fiche). Traduire les explications en quelle langue ?",
    "rebuildFailed": "Échec de la régénération",
    "translationFailed": "Échec de la traduction",
    "deleteFailed": "Impossible de supprimer le récapitulatif",
    "savingEdits": "Enregistrement de vos modifications…",
    "uploadingMemo": "Envoi du mémo vocal…",
    "uploadingFile": "Envoi de {name}…",
    "attachingMaterials": "Ajout des supports…",
    "attachmentFailed": "Récapitulatif envoyé, mais un support n’a pas pu être ajouté — ajoutez-le depuis la page du cours.",
    "suggestedScript": "Script suggéré"
  },
  "portal": {
    "slots": {
      "greeting": "Bon retour,",
      "tabOverview": "Vue d’ensemble",
      "tabLessons": "Leçons",
      "tabProgress": "Progression",
      "tabPractice": "Entraînement",
      "tabFiles": "Fichiers",
      "tabTests": "Tests",
      "statLessons": "Leçons",
      "statScore": "Score moy.",
      "statSpeaking": "Expression orale",
      "lessonsTitle": "Vos leçons",
      "progressTitle": "Votre progression",
      "vocabTitle": "Vocabulaire",
      "milestoneTitle": "Prochaine étape",
      "scoresTitle": "Scores récents",
      "testsTitle": "Tests d’entraînement",
      "speakingTitle": "Habitudes orales",
      "filesTitle": "Fichiers du cours",
      "vocabTotalsTitle": "Évolution du vocabulaire"
    },
    "tabsAria": "Sections du tableau de bord",
    "notLinked": "Compte non encore lié",
    "askTeacher": "Demandez à votre enseignant de relier votre compte.",
    "climbLed": "Vous êtes passé de l’écoute à {em}.",
    "climbLedEm": "mener la discussion",
    "climbMore": "Vous parlez {em} qu’au début.",
    "climbMoreEm": "{delta} points de plus",
    "climbPlain": "Vous avez parlé {em} lors de votre dernière leçon.",
    "youSpoke": "Vous avez parlé",
    "acrossLessons": "Sur {n} leçons",
    "acrossOneLesson": "Sur 1 leçon",
    "climbSub": "Le point sur l’arc, c’est là où vous avez commencé — {then}.",
    "climbDelta": "{delta} points depuis la leçon 1",
    "inLast30": "{n} sur les 30 derniers jours",
    "totalLessons": "Nombre total de leçons suivies",
    "inAll": "{n} au total",
    "words": "{n} mots",
    "lastN": "{n} derniers",
    "metricPace": "Rythme",
    "metricThinking": "Temps réflexion",
    "metricShare": "Votre part",
    "practiseTitle": "Entraînez vos mots",
    "practiceHistory": "Exercices, deux dernières semaines",
    "byKind": "Par type de mot",
    "byLesson": "Par leçon",
    "practiseAnything": "S’entraîner sur tout",
    "practiseDue": "S’entraîner sur ce qu’il faut revoir",
    "vocabKnown": "connu",
    "vocabLearning": "en cours",
    "vocabNew": "non commencé",
    "download": "Télécharger"
  },
  "practice": {
    "emptyTitle": "Rien à réviser pour l’instant",
    "emptyBody": "Les mots apparaîtront ici quand votre enseignant publiera un récapitulatif de leçon.",
    "howMany": "Combien aujourd’hui ?",
    "doneTitle": "Terminé — {n} cartes.",
    "doneOneTitle": "Terminé — 1 carte.",
    "allFirstTime": "Tout est nouveau. Ils reviendront dans quelques jours.",
    "someMissed": "{right} nouveaux, {missed} à revoir plus vite.",
    "moreLeft": "{n} mots restants à revoir, quand vous voulez.",
    "oneLeft": "1 mot restant à revoir, quand vous voulez.",
    "wholePile": "C’est toute la pile.",
    "nextRound": "{n} de plus",
    "practiseAgain": "Revoir encore",
    "backToPractice": "Retour à l’entraînement",
    "tapToSee": "Touchez pour voir la signification",
    "again": "Encore",
    "knewIt": "Connu",
    "sayOutLoud": "Dites-le à voix haute avant de retourner la carte."
  },
  "rating": {
    "question": "Cela correspond-il à votre leçon ?",
    "yes": "Oui, c’était ma leçon",
    "no": "Pas tout à fait",
    "thanksYes": "Vous avez indiqué que cela correspondait à votre leçon. Merci, c’est noté.",
    "thanksNo": "Vous avez indiqué que ce n’était pas exact. Merci — ce sont les retours utiles.",
    "whatWasOff": "Qu’est-ce qui n’allait pas ? Sélectionnez ce qui convient.",
    "notePlaceholder": "Si possible, précisez quelle partie — une phrase suffit.",
    "send": "Envoyer",
    "sending": "Envoi…",
    "didNotSave": "Échec de l’enregistrement.",
    "reasons": [
      "Des mots que je n’ai pas dits",
      "Les rôles sont confondus",
      "Mauvais script ou langue",
      "Trop facile ou trop difficile",
      "Autre chose"
    ]
  },
  "recapLanguage": {
    "question": "Mes récapitulatifs sont rédigés en",
    "hint": "La langue apprise reste la même — celle-ci concerne les explications et instructions autour.",
    "aria": "Langue des explications des récapitulatifs",
    "saved": "Enregistré — à partir du prochain récapitulatif.",
    "didNotSave": "Échec de l’enregistrement."
  },
  "lesson": {
    "railAria": "Sections de la leçon",
    "thisLesson": "Cette leçon",
    "movements": [
      "Votre expression",
      "Ce que vous avez réussi",
      "À corriger",
      "Contenu travaillé",
      "Mots du jour",
      "Entraînement",
      "Fichiers & audio"
    ],
    "speakingBalance": "Répartition de la parole",
    "score": "Score",
    "grammarDensity": "Densité grammaticale",
    "corrections": "Corrections",
    "homework": "Devoirs",
    "noHomework": "Aucun devoir pour cette leçon.",
    "practiceExercises": "Exercices d’entraînement",
    "wordsFromLesson": "Mots de cette leçon",
    "whoTalked": "Répartition des paroles",
    "speakingMeasured": "Votre expression orale, mesurée",
    "yourTeacher": "Votre enseignant"
  },
  "join": {
    "setupFailed": "Impossible de configurer votre compte.",
    "acceptFailed": "Impossible d’accepter l’invitation.",
    "joining": "Inscription…",
    "joinAs": "Rejoindre en tant que {name}",
    "notYou": "Ce n’est pas vous ? {signOut} puis rouvrez ce lien.",
    "notYouLink": "Se déconnecter",
    "emailLabel": "Votre adresse e-mail",
    "passwordLabel": "Choisir un mot de passe",
    "passwordHint": "Au moins 8 caractères",
    "settingUp": "Configuration…",
    "createAccount": "Créer mon compte"
  },
  "speaking": {
    "cta": "Enregistrez votre réponse",
    "sendFailed": "Impossible d’envoyer l’enregistrement. Veuillez réessayer.",
    "recordAgain": "Réenregistrer",
    "sendToTeacher": "Envoyer à l’enseignant",
    "sending": "Envoi…",
    "tryAgain": "Réessayer",
    "keepSent": "Garder l’envoi"
  },
  "exchange": {
    "recording": "Enregistrement",
    "download": "Télécharger",
    "nothingShared": "Rien de partagé pour cette leçon.",
    "noFiles": "Aucun fichier partagé. Déposez ici une présentation ou un PDF pour ce cours.",
    "audioIntro": "Entraînement oral enregistré par l'élève pour le cours. Leurs réponses aux exercices oraux sont dans l’onglet Entraînement.",
    "noAudio": "Aucun audio reçu pour l’instant."
  },
  "charts": {
    "metrics": [
      {
        "label": "Score",
        "note": "Note de chaque leçon sur dix."
      },
      {
        "label": "Votre parole",
        "note": "Votre part des interventions. Plus vous prenez confiance, plus la part augmente."
      },
      {
        "label": "Rythme",
        "note": "Mots par minute lorsque vous parlez."
      },
      {
        "label": "Temps réflexion",
        "note": "Délai avant de répondre. Plus court = plus automatique."
      },
      {
        "label": "Vocabulaire",
        "note": "Tous les mots rencontrés, cumulés."
      }
    ],
    "nothingYet": "Aucun enregistrement pour l’instant.",
    "sinceLesson": "depuis la leçon {n}",
    "trendLater": "La tendance apparaît après la prochaine leçon."
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
    "startTime": "Heure de début",
    "endTime": "Heure de fin",
    "removeRange": "Supprimer la plage",
    "couldNotSave": "Impossible d’enregistrer",
    "saveChanges": "Enregistrer les modifications",
    "defaultsTitle": "Paramètres par défaut du cours",
    "defaultsDesc": "Durée des cours et délai minimal d’anticipation pour réserver.",
    "lessonName": "Nom du cours",
    "lessonNamePlaceholder": "Cours de langue",
    "lessonLength": "Durée du cours (min)",
    "slotInterval": "Intervalle entre créneaux (min)",
    "minNotice": "Préavis min. (heures)",
    "bufferBefore": "Pause avant (min)",
    "bufferAfter": "Pause après (min)",
    "maxPerDay": "Cours max / jour",
    "bookingWindow": "Fenêtre de réservation (jours)",
    "title": "Disponibilités",
    "copyMon": "Copier lun → en semaine",
    "copyMonTitle": "Copier les horaires du lundi du mardi au vendredi",
    "previewBooking": "Voir la page de réservation ↗",
    "unavailable": "Indisponible",
    "dateOverrides": "Exceptions dates"
  },
  "recordings": {
    "eyebrow": "Vue d’ensemble",
    "title": "Leçons & récapitulatifs",
    "settings": "Paramètres",
    "yourStudents": "Vos élèves",
    "publishedTitle": "Leçons publiées",
    "publishedDesc": "Ce que vos élèves peuvent déjà voir, plus récentes en haut. Les brouillons attendent dans la file ci-dessus.",
    "nothingPublished": "Rien de publié pour l’instant",
    "untitled": "Leçon sans titre",
    "published": "Publié",
    "draft": "Brouillon",
    "summaryAria": "Résumé de la leçon",
    "students": "Élèves",
    "changedMind": "Vous avez changé d’avis ?",
    "connectCalendar": "Connecter un calendrier"
  },
  "lessonRow": {
    "joinCall": "Rejoindre l’appel ↗",
    "viewRecap": "Voir le récapitulatif",
    "reviewRecap": "Relire le récapitulatif",
    "noLink": "Pas de lien",
    "eyebrow": "Relire avant publication",
    "recapTitle": "{title} · Récapitulatif de leçon",
    "closeAria": "Fermer la relecture du récapitulatif",
    "draftBanner": "Brouillon AI — lisez le contenu ci-dessous avant qu’il soit envoyé à l’élève.",
    "score": "Score",
    "studentTalk": "Parole élève",
    "grammar": "Grammaire",
    "confidence": "Confiance",
    "homework": "Devoirs",
    "memoScript": "Script mémo vocal",
    "teacherNote": "Note à l’élève",
    "editLater": "Modifier plus tard",
    "approveSend": "Valider & envoyer à l’élève"
  },
  "book": {
    "months": [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre"
    ],
    "loadFailed": "Impossible de charger les disponibilités.",
    "bookingFailed": "La réservation a échoué.",
    "bookingFailedRetry": "Réservation échouée — réessayez.",
    "eyebrow": "Planifier une leçon",
    "title": "Trouvez un créneau disponible",
    "sub": "Choisissez un jour puis une heure. La confirmation et le lien de réunion sont envoyés par e-mail.",
    "booked": "Réservation enregistrée !",
    "invite": "Une invitation de calendrier sera envoyée à {email}.",
    "openMeeting": "Ouvrir le lien de réunion",
    "noCalendar": "Disponibilités non disponibles. Le calendrier est-il connecté ?",
    "noTimes": "Aucun créneau ouvert dans les 30 prochains jours.",
    "pickDay": "Choisir un jour",
    "pickDayHint": "Les jours avec un point ont des créneaux disponibles.",
    "yourDetails": "Vos informations",
    "confirmAt": "Confirmer {time}",
    "yourName": "Votre nom",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "Votre e-mail",
    "emailPlaceholder": "vous@email.com",
    "booking": "Réservation…",
    "bookAt": "Réserver leçon · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "Vue d’ensemble",
        "body": "Tableau de bord. Les récapitulatifs attendent ici votre relecture, suivis des dernières leçons enregistrées."
      },
      {
        "title": "Élèves",
        "body": "Ajoutez chaque élève ici. Leurs leçons, tests et progression sont rattachés à cette liste — et chacun a son accès dédié."
      },
      {
        "title": "Notes",
        "body": "Un clic par leçon : calendrier mensuel qui sert aussi de journal de bord enseignant."
      },
      {
        "title": "Vue élève",
        "body": "Ce que voient réellement vos élèves, adapté à vos choix — couleurs, noms, sections. Ce n’est pas une démo : c’est la vraie vue."
      },
      {
        "title": "Paiements",
        "body": "Notez ce que chaque élève a payé et combien de leçons cela couvre. Les crédits sont débités à chaque publication de récapitulatif."
      },
      {
        "title": "Paramètres",
        "body": "Votre calendrier, l’enregistreur de leçon, votre compte. La visite se relance d’ici à tout moment."
      }
    ],
    "skip": "Passer la visite"
  },
  "languages": {
    "couldNotSave": "Impossible d’enregistrer",
    "title": "Vos langues",
    "desc": "Langues enseignées et langues d’expression du cours. Les nouveaux élèves partent de ces réglages.",
    "youTeach": "Langue enseignée",
    "spokenIn": "Langue parlée lors des cours",
    "fitTitle": "Comment s’articulent les langues",
    "fitDesc": "Trois réglages, trois usages différents.",
    "fitLearning": "**La langue “apprise” de chaque élève** détermine la langue des récapitulatifs et des tests — {n} langues prises en charge, du japonais à l’arabe. Fixée à l’ajout de l’élève, modifiable sur sa fiche.",
    "fitExplained": "**La langue “explications” de chaque élève** est celle des textes d’explication et des consignes — anglais par défaut, modifiable sur la fiche aussi.",
    "fitSpoken": "**La langue “parlée en cours” de chaque élève** est celle détectée par la transcription de l’enregistreur. Elle suit le paramètre ci-dessus tant qu’on ne la change pas sur la fiche — l’enregistreur ne posera donc plus la question à chaque fois."
  },
  "notes": {
    "pickStudent": "Sélectionnez un élève",
    "empty": "La note est vide",
    "couldNotSave": "Impossible d’enregistrer la note",
    "confirmDelete": "Supprimer cette note ?",
    "hoursTaught": "Heures enseignées",
    "recapsPublished": "Récapitulatifs publiés",
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
    "instructionPlaceholder": "Ce que l’élève doit faire",
    "focus": "Focus",
    "focusPlaceholder": "Ce que les phrases entraînent",
    "sentence": "Phrase",
    "meaning": "Sens",
    "removeSentence": "Supprimer la phrase",
    "removeOption": "Supprimer",
    "questionTarget": "Question (langue cible)",
    "question": "Question"
  },
  "payments": {
    "selectStudent": "Sélectionner un élève",
    "amountTooLow": "Saisissez un montant supérieur à zéro",
    "saveFailed": "Échec de l’enregistrement",
    "thisMonth": "Ce mois-ci",
    "receivedAllTime": "Reçus — cumulés",
    "outstanding": "À recevoir",
    "currency": "Devise",
    "students": "Élèves",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun élève pour l’instant",
    "student": "Élève",
    "recent": "Derniers paiements",
    "newPayment": "Nouveau paiement",
    "editPayment": "Modifier le paiement",
    "selectPlaceholder": "Sélectionner…",
    "amount": "Montant ({symbol})",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "covers": "Ce que cela couvre",
    "coversPlaceholder": "ex : pack juillet — 4 leçons",
    "paymentDate": "Date de paiement",
    "dueDate": "Échéance",
    "lessonsCovered": "Leçons incluses",
    "lessonsPlaceholder": "ex : 4",
    "method": "Moyen",
    "methodPlaceholder": "Virement, Espèces, PayPal…",
    "confirmDelete": "Supprimer ce paiement ?"
  },
  "recapReview": {
    "vocab": "Vocabulaire",
    "summary": "Résumé",
    "summaryPlaceholder": "Résumé de la leçon…",
    "sectionTitle": "Titre de section",
    "sectionContent": "Contenu de section…",
    "removeSection": "Supprimer la section",
    "homeworkTask": "Travail à faire",
    "noteTitle": "Votre note à l’élève",
    "notePlaceholder": "Une note personnelle à l’élève…"
  },
  "connectors": {
    "googleName": "Google Calendar",
    "googleDesc": "Lit vos leçons et inscrit les réservations dans votre calendrier.",
    "connect": "Connecter",
    "permissionNeeded": "Autorisation requise",
    "reconnect": "Reconnecter",
    "disconnect": "Déconnecter",
    "zoomDesc": "Crée automatiquement une salle Zoom unique pour chaque leçon réservée.",
    "comingSoon": "Bientôt disponible",
    "stripeName": "Stripe",
    "stripeDesc": "Recevez les paiements par carte pour les packs de cours — versements directs sur votre compte."
  },
  "student": {
    "notJoined": "Invité — pas encore inscrit",
    "avgScore": "Score moyen",
    "latestTalk": "Dernière prise de parole",
    "vocabItems": "Entrées vocabulaire",
    "creditsLeft": "{left} leçons restantes / {bought} achetées",
    "creditsOneLeft": "1 leçon restante / {bought} achetées",
    "noCredits": "Aucune leçon achetée pour l’instant",
    "managePayments": "Gérer les paiements →",
    "lessonsTitle": "Leçons & récapitulatifs",
    "noLessons": "Pas encore de leçon",
    "noLessonsSub": "Les leçons enregistrées pour cet élève s’afficheront ici.",
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
    "createFailed": "Impossible de créer l’élève",
    "aria": "Nouvel élève",
    "title": "Nouvel élève",
    "fullName": "Nom complet",
    "namePlaceholder": "Jane Doe",
    "level": "Niveau",
    "learning": "Langue apprise",
    "choose": "Choisir…",
    "recapLanguage": "Langue du récapitulatif"
  },
  "calendar": {
    "months": [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre"
    ],
    "upcoming": "À venir",
    "today": "Aujourd’hui",
    "tomorrow": "Demain",
    "prev": "Précédent",
    "next": "Suivant",
    "fixInSettings": "Voir dans Paramètres",
    "nothingOn": "Rien le {day}.",
    "noLessonsThatDay": "Aucune leçon prévue ce jour-là.",
    "agendaClear": "Votre agenda est libre.",
    "noUpcoming": "Aucune leçon à venir sur ce calendrier."
  },
  "forgot": {
    "title": "Réinitialiser le mot de passe",
    "lead": "Saisissez votre adresse e-mail de connexion, nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    "send": "Envoyer le lien de réinitialisation",
    "sending": "Envoi…",
    "sent": "Si {email} possède un compte, un lien de réinitialisation va arriver. Ouvrez l’e-mail et suivez le lien pour choisir un mot de passe — il expire dans une heure.",
    "spam": "Rien reçu ? Vérifiez les spams ou essayez avec l’adresse utilisée lors de l’inscription.",
    "remembered": "Finalement retrouvé ?",
    "backToSignIn": "Retour à la connexion"
  },
  "reset": {
    "tooShort": "Votre nouveau mot de passe doit comporter au moins 6 caractères.",
    "mismatch": "Les deux saisies ne correspondent pas — vérifiez encore.",
    "samePassword": "C’est le même mot de passe qu’avant — choisissez-en un nouveau.",
    "saveFailed": "Impossible d’enregistrer le mot de passe. Veuillez réessayer.",
    "title": "Choisissez un nouveau mot de passe",
    "expired": "Ce lien de réinitialisation a expiré ou a déjà servi. Demandez-en un nouveau puis réessayez.",
    "noToken": "Cette page ne fonctionne qu’avec le lien reçu par e-mail. Demandez-en un et nous l’enverrons.",
    "lead": "Choisissez un nouveau mot de passe pour votre compte. Vous serez connecté dès qu’il sera enregistré.",
    "newPassword": "Nouveau mot de passe",
    "repeat": "Répétez-le"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "Score moyen",
        "sub": "Sur 10, sur toutes les leçons notées."
      },
      {
        "label": "Part de parole",
        "sub": "Part de la leçon parlée par l’élève."
      },
      {
        "label": "Rythme oral",
        "sub": "Mots par minute lors de leur intervention. Progresser = plus fluide."
      },
      {
        "label": "Temps de réflexion",
        "sub": "Secondes entre la fin de l’enseignant et leur début de réponse. Un temps long indique le travail, ce n’est pas un défaut."
      },
      {
        "label": "Mots par tour",
        "sub": "Volume à chaque prise de parole. Réponses brèves mais rapides : réponses, pas conversation."
      },
      {
        "label": "Mots de remplissage",
        "sub": "Hésitations par leçon. À comparer au rythme — rapide mais plein de fillers ou lent et bien articulé, ce n’est pas la même difficulté."
      }
    ],
    "totalLessons": "Nombre total de leçons",
    "acrossStudents": "pour {n} élèves",
    "mostActive": "Le plus actif",
    "nLessons": "{n} leçons",
    "nothingRecorded": "aucun enregistrement",
    "vocabMet": "Vocabulaire rencontré",
    "wordsAcross": "mots sur tous les cours",
    "notSeenLately": "Peu présent ces temps-ci",
    "everyoneCurrent": "tous à jour",
    "measureAria": "Mesure",
    "nothingMeasured": "Aucune donnée pour le moment — cela viendra au fil des cours enregistrés.",
    "perStudent": "{measure} — par élève",
    "perStudentSub": "Leurs propres leçons dans l’ordre. La flèche va de la première à la dernière.",
    "prevMeasure": "Mesure précédente",
    "nextMeasure": "Mesure suivante"
  },
  "test": {
    "heading": "Test d’entraînement niveau {level}",
    "published": "Publié",
    "draftOnlyYou": "Brouillon — visible par vous seul",
    "basedOn": "Basé sur",
    "lessonN": "Leçon {n}",
    "script": "Système d’écriture",
    "scriptBeginner": "Hiragana + romaji",
    "scriptHiragana": "Hiragana",
    "scriptKanji": "Kanji + kana",
    "created": "Créé",
    "status": "Statut",
    "speakingAnswer": "Réponse orale",
    "unplayable": "Un enregistrement existe mais la lecture n’a pas été autorisée."
  },
  "trial": {
    "aria": "Bienvenue sur Lesson Studio",
    "kicker": "Bienvenue sur Lesson Studio",
    "title": "Vos {n} premiers récapitulatifs sont offerts.",
    "sub": "Installez l’enregistreur, faites un cours, et voyez-le revenir rédigé — sans carte, sans piège. Convaincu ? Choisissez un pack.",
    "showMe": "Visite guidée",
    "exploreMyself": "Je préfère explorer",
    "setUpFirst": "Ou configurez d’abord l’enregistreur →"
  },
  "reviewQueue": {
    "title": "Récapitulatifs à relire",
    "desc": "Créés à partir de vos enregistrements. Rien n’est envoyé à un élève sans votre validation.",
    "moveFailed": "Impossible de déplacer ce récapitulatif",
    "serverUnreachable": "Impossible de joindre le serveur",
    "rebuildFailed": "Impossible de régénérer ce récapitulatif",
    "deleteFailed": "Impossible de supprimer le récapitulatif"
  },
  "recorderMissing": {
    "title": "Ajoutez l’enregistreur pour débuter",
    "body": "Lesson Studio génère des récapitulatifs à partir de vos cours, et l’extension Chrome les enregistre. Si elle n’est pas installée et connectée, rien n’apparaîtra ici — c’est le seul moyen d’importer un cours."
  },
  "pending": {
    "chooseStudent": "Commencez par choisir l’élève concerné.",
    "fileFailed": "Impossible de classer cet enregistrement.",
    "confirmDelete": "Supprimer cet enregistrement ? L’audio sera supprimé également.",
    "studentAria": "Élève",
    "choosePlaceholder": "Choisissez un élève",
    "filing": "Classement…",
    "buildRecap": "Générer le récapitulatif"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "Débutant",
        "sub": "Hiragana + romaji"
      },
      {
        "label": "Hiragana",
        "sub": "Kana, pas de romaji"
      },
      {
        "label": "Kanji + kana",
        "sub": "Kanji avec lectures"
      }
    ],
    "failed": "Échec de la génération",
    "needLesson": "Publiez d’abord un récapitulatif de leçon",
    "title": "Générer un test d’entraînement",
    "explanationLanguage": "Langue des explications"
  },
  "guide": {
    "eyebrow": "Enregistreur de leçon",
    "title": "Enregistrez un cours, obtenez un récapitulatif",
    "sub": "Une extension Chrome enregistre l’onglet du cours et votre micro sur deux pistes séparées, puis rédige ici un brouillon de récapitulatif. Aucun bot ne rejoint l’appel, rien n’est installé côté élève : fonctionne sur Preply, italki, Google Meet, Zoom, partout où la leçon se passe dans un onglet.",
    "step1Title": "Installez-la via le Chrome Web Store",
    "step1Body": "Un clic, aucun réglage. Puis épinglez-la : cliquez sur la pièce de puzzle à côté de la barre d'adresse puis sur l’épingle — le K reste alors accessible pendant vos cours.",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Ajouter à Chrome",
    "addToChrome": "Ajouter à Chrome — c’est gratuit ↗",
    "betaNote": "**Déjà testé la bêta depuis un dossier ?** Retirez cette copie d’abord ({path} → Supprimer). Une seule extension peut enregistrer un onglet à la fois.",
    "step2Title": "Connectez-vous — une seule fois",
    "step2Body": "Ouvrez l’extension et utilisez le même e-mail et mot de passe qu’ici. C’est tout : elle saura qui vous êtes, vos élèves, la langue enseignée.",
    "signIn": "Se connecter",
    "step3Title": "Ouvrez l’onglet du cours et lancez l’enregistrement",
    "step3Body": "Soyez bien dans l’onglet où la leçon se déroule — la classe Preply, l’appel Meet… Cliquez sur le K, choisissez l’élève, appuyez sur **Démarrer l’enregistrement**. Au premier essai, Chrome demandera le micro : acceptez. Fermez la fenêtre et enseignez : l’enregistrement continue.",
    "studentLabel": "Élève :",
    "step4Title": "Arrêtez, puis envoyez",
    "step4Body": "En fin de leçon, ouvrez l’extension, appuyez sur **Arrêter l’enregistrement**, puis **Envoyer à Lesson Studio**. Rien n’est transmis tant que vous n’appuyez pas sur envoyer.",
    "sendButton": "Envoyer à Lesson Studio →",
    "step5Title": "Relisez le récapitulatif généré",
    "step5Body": "Quelques minutes plus tard, le brouillon vous attend sous **Récapitulatifs à relire** — résumé, vocabulaire, devoirs, le tout dans la langue de l’élève. Modifiez au besoin, envoyez, cela s’affiche dans l’espace élève.",
    "reviewAndSend": "Relire & envoyer",
    "consentTitle": "Avant d’enregistrer quelqu’un",
    "consentBody": "Informez votre élève de l’enregistrement et obtenez son accord. Certains pays exigent l’accord explicite pour tous les participants ; Preply et italki ont aussi leurs propres règles — pensez à les vérifier avant d’en faire une habitude.",
    "dataBody": "L’enregistreur capte les deux voix. Aucun fichier n’est transmis tant que vous n’appuyez pas sur **Envoyer à Lesson Studio** ; l’audio est transcrit pour rédiger le récapitulatif, et les fichiers sont supprimés sous 30 jours. Les détails complets sont dans notre {policy}.",
    "privacyLink": "politique de confidentialité"
  },
  "lessonExercises": {
    "none": "Aucun exercice oral pour cette leçon.",
    "recordReading": "Enregistrez-vous sur ces phrases",
    "notRecorded": "Pas encore enregistré."
  },
  "lessonTools": {
    "lessonIsWith": "Cette leçon est avec",
    "notLinked": "Non reliée (test / sans élève)",
    "hint": "Liez un élève pour que le récapitulatif soit transmis. Laissez sans pour un test."
  },
  "memo": {
    "back15": "Retour 15 s",
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
    "withLogin": "Avec accès",
    "lessonsRecorded": "Leçons enregistrées",
    "noStudents": "Aucun élève pour l’instant",
    "notJoined": "Invité — pas encore inscrit",
    "lessons": "Leçons",
    "overview": "Vue d’ensemble"
  }
} as const
