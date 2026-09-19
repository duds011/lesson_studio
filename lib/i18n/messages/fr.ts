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
    "signOut": "Déconnexion",
    "somethingWrong": "Un problème est survenu. Réessayez dans un instant."
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "Espace enseignant",
    "overviewAria": "Vue d'ensemble de Lesson Studio",
    "navAria": "Navigation de l’espace enseignant",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu",
    "expand": "Développer la navigation",
    "collapse": "Réduire la navigation",
    "sectionWorkspace": "Espace",
    "sectionManage": "Gérer",
    "overview": "Vue d'ensemble",
    "students": "Étudiants",
    "notes": "Notes",
    "materials": "Documents",
    "studentView": "Vue étudiant",
    "payments": "Paiements",
    "availability": "Disponibilités",
    "settings": "Paramètres",
    "calendarConnected": "Agenda connecté",
    "setupNeeded": "Configuration requise",
    "recordingsOnly": "Enregistrements uniquement",
    "studentPortal": "Portail étudiant"
  },
  "auth": {
    "language": "Langue",
    "emailLabel": "Adresse e-mail",
    "emailPlaceholder": "vous@example.com",
    "passwordLabel": "Mot de passe",
    "signInTitle": "Connexion",
    "signInSub": "Bon retour. Connectez-vous pour voir vos cours, vos progrès et les comptes rendus.",
    "signInExpired": "Votre session a expiré. Connectez-vous et nous vous y ramenons directement.",
    "signInAction": "Connexion",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau ici ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "Configuration gratuite, vous pouvez ajouter votre premier étudiant immédiatement.",
    "studentQuestion": "Vous êtes étudiant ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d’invitation — ouvrez-le et choisissez votre propre e-mail et mot de passe. Ensuite, vous vous connectez ici même.",
    "signInHeadline": "Chaque cours, résumé par écrit.",
    "signInAside": "Lesson Studio transforme chaque heure en écrit : compte rendu, courbe de progrès et exercices — pour l’enseignant comme pour l’étudiant.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Lancez votre espace Koku Library pour étudiants, comptes rendus, réservations et suivi de progrès.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "6 caractères minimum",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Vous avez déjà un compte ?",
    "signUpHeadline": "Toute votre activité d’enseignement, en un seul endroit.",
    "signUpAside": "Configuration en quelques minutes. Ajoutez un étudiant, enregistrez votre prochain cours, le reste suivra automatiquement."
  },
  "aside": {
    "slides": [
      {
        "title": "Le cours s’écrit tout seul",
        "body": "Une extension Chrome enregistre les deux voix. Le compte rendu arrive en brouillon — il suffit de relire et publier."
      },
      {
        "title": "Les progrès sont visibles",
        "body": "Scores, temps de parole et vocabulaire suivis de cours en cours, sur une page faite pour l’étudiant."
      },
      {
        "title": "La langue de votre choix",
        "body": "Japonais, français, coréen, espagnol et une trentaine d’autres — corrigé dans la langue du cours, expliqué dans celle de l’étudiant."
      },
      {
        "title": "S’exercer avec leurs propres mots",
        "body": "Cartes mémoire et oraux créés à partir du vocabulaire abordé pendant l’heure."
      },
      {
        "title": "Un portail étudiant à votre nom",
        "body": "Vos couleurs, vos termes et uniquement les rubriques que vous utilisez en cours."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos leçons",
      "Où vous vous retrouvez",
      "Votre agenda",
      "Vue étudiant",
      "Votre enregistreur"
    ],
    "sideTitle": "Installons votre studio.",
    "sideBody": "Quatre étapes rapides et vos élèves auront leur propre portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Finir la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Enregistrement impossible",
    "couldNotFinish": "Impossible de finaliser",
    "pickTeaching": "Choisissez la langue que vous enseignez.",
    "pickSpoken": "Choisissez la langue de vos leçons.",
    "pickCalendar": "Dites-nous si vos leçons sont dans un agenda.",
    "pickPortalName": "Nommez le portail — vos étudiants le verront.",
    "teachAria": "Langue enseignée",
    "iTeach": "J’enseigne",
    "teachHint": "Les comptes rendus et tests sont créés pour cette langue. Valeur par défaut pour chaque nouvel étudiant — vous pourrez le changer élève par élève.",
    "spokenAria": "Langue parlée pendant vos leçons",
    "spokenIn": "mes leçons sont majoritairement en",
    "spokenHint": "Souvent pas la langue apprise — pour les débutants, on parle surtout dans la langue partagée. C’est celle que l’enregistreur attend.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où rencontrez-vous vos étudiants ?",
    "platformLead": "Sur Meet ou Zoom, nous créons le lien à la réservation. Sur une marketplace le cours a déjà sa salle, donc on reprend votre lien.",
    "zoomLater": "Connecter Zoom plus tard dans Paramètres",
    "stayOutTitle": "Nous restons hors du cours lui-même",
    "stayOutBody": "Aucun lien créé, aucun bot envoyé. Vous enregistrez le cours vous-même et le compte rendu, le vocabulaire et les exercices se créent à partir de cela — côté étudiant tout reste identique.",
    "calendarTitle": "Où sont vos leçons ?",
    "calendarLeadExternal": "Certains enseignants {platform} notent encore leur semaine sur Google Agenda, d’autres restent sur la marketplace. Votre choix change ce qui s’affiche dans l’espace.",
    "calendarLead": "Si vos étudiants sont présents sur Google Agenda nous pouvons lire la semaine, prendre les réservations et envoyer l’enregistreur. Sinon, on s’efface complètement.",
    "googleConnected": "Google Agenda connecté",
    "googleConnectedSub": "Vous pouvez choisir l’agenda principal dans Paramètres.",
    "connectGoogle": "Connecter Google Agenda",
    "connectGoogleFine": "Vous serez redirigé vers l’écran de Google puis revenu ici. Vous pouvez continuer sans, mais la réservation et l’enregistrement automatique resteront désactivés.",
    "recordTitle": "Enregistrez la leçon",
    "recordBody": "Quelle que soit la salle, capturez et envoyez l’enregistrement à Lesson Studio.",
    "reviewTitle": "Relisez le compte rendu",
    "reviewBody": "Il rejoint votre file d’attente comme les autres. Publiez et l’étudiant retrouve tout.",
    "noCalendarFine": "Pas d’agenda, pas de page de réservation, pas de rappels : l’espace s’ouvre sur les leçons et comptes rendus. Vous pouvez changer d’avis à tout moment dans les Paramètres.",
    "brandTitle": "Personnalisez-le",
    "brandLead": "Choisissez une couleur et un nom pour le portail où vos étudiants se connectent. Tout se paramètre ensuite.",
    "portalNameLabel": "Nom du portail étudiant",
    "portalNamePlaceholder": "ex : Sakura Japanese",
    "portalNameFine": "Le nom affiché en haut du portail étudiant et sur l’invitation. Le nom de votre studio, pas le nôtre.",
    "accent": "Couleur d’accent",
    "previewTagline": "Apprenez aujourd’hui, progressez demain !",
    "recorderTitle": "Installez l’enregistreur",
    "recorderLead": "C’est l’outil principal : une extension Chrome qui enregistre le cours et écrit le compte rendu. Aucun bot ne rejoint l’appel, rien à installer côté étudiant.",
    "recorderStep1": "**Ajoutez-la depuis le Chrome Web Store** — un clic, puis épinglez-la dans votre barre d’outils.",
    "recorderStep2": "**Connectez-vous dans l’extension** avec la même adresse et le même mot de passe. Rien à recopier.",
    "recorderStep3": "**Enregistrez une leçon** : choisissez l’étudiant, cliquez sur démarrer, puis arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "recorderFine": "Vous préférez la procédure complète (accès micro, ce qui est enregistré) ? C’est sur le {guide} — aussi depuis **Paramètres → Enregistreur de cours** quand vous voulez.",
    "recorderFineLink": "guide de configuration"
  },
  "overview": {
    "eyebrow": "Vue d'ensemble",
    "title": "Votre agenda d’enseignement",
    "manageConnections": "Gérer les connexions",
    "fixInSettings": "Corriger dans les Paramètres",
    "summaryAria": "Résumé de la leçon",
    "upcoming": "Leçons à venir",
    "drafts": "Brouillons à relire",
    "draftsSub": "comptes rendus en attente",
    "published": "Comptes rendus publiés",
    "publishedSub": "envoyés aux étudiants",
    "writeUpsLeft": "Comptes rendus restants",
    "writeUpsAria": "Comptes rendus restants — en acheter",
    "usageTrial": "{used} utilisés sur vos {total} gratuits",
    "usageBought": "{used} créés · n’expirent pas",
    "lessonCalendar": "Agenda de cours",
    "primaryCalendar": "(principal)"
  },
  "connect": {
    "title": "Connectez votre Google Agenda",
    "body": "Liez votre agenda pour que Lesson Studio puisse voir les cours, prendre les réservations et enregistrer chaque séance.",
    "notConfigured": "Google OAuth non configuré. Ajoutez {id} et {secret} à l’environnement, puis redémarrez.",
    "scopeRead": "**Lire votre agenda** — retrouver les cours et leurs liens",
    "scopeRecord": "**Enregistrer les cours** — capturer les séances via l’extension Lesson Studio",
    "scopeRecap": "**Créer des comptes rendus** — synthèses automatiques pour relecture puis partage",
    "continueGoogle": "Continuer avec Google",
    "fine": "Vous serez redirigé vers l’écran Google. Vous pourrez gérer cela plus tard dans Paramètres."
  },
  "settings": {
    "eyebrow": "Espace",
    "title": "Paramètres",
    "recorderTitle": "Enregistreur de cours",
    "recorderDesc": "L’extension Chrome qui enregistre votre cours et en fait un compte rendu. {guide}",
    "recorderGuide": "Guide pas à pas →",
    "replayTourHint": "Vous avez oublié à quoi sert cette page ? Le guide se relance d’ici.",
    "languageTitle": "Langue",
    "languageDesc": "La langue affichée dans cet espace. Elle ne change pas la langue d’écriture des comptes rendus — chaque étudiant la choisi.",
    "connectionsTitle": "Connexions",
    "connectionsDesc": "Connectez les outils pour la réservation, les appels et les paiements.",
    "livesTitle": "Où se passent vos leçons",
    "livesDesc": "Agenda Google : une page de réservation, gestion automatique. Ailleurs : tout part de l’enregistrement.",
    "calendarTitle": "Agenda de cours",
    "calendarDesc": "Quel agenda contient les leçons à lire par Lesson Studio ?",
    "primaryCalendar": "Agenda principal",
    "speakingTitle": "Exercices oraux",
    "speakingDesc": "Chaque compte rendu se termine par trois exercices oraux. Les étudiants peuvent enregistrer leurs réponses, qui sont déposées sur la page du cours — avec une notification mail pour vous. Désactivez-les et ils n’apparaîtront plus.",
    "speakingOn": "Autoriser l’enregistrement",
    "speakingOnHint": "Vous les écoutez sur la page du cours",
    "speakingOff": "Ne pas les inclure",
    "speakingOffHint": "Le compte rendu conserve ses sept exercices écrits",
    "platformTitle": "Plateforme d’appel par défaut",
    "platformDesc": "Crée un type d’appel sur chaque nouvelle réservation. Choisissez la dernière option si vos leçons sont sur une marketplace.",
    "meetLabel": "Google Meet",
    "meetHint": "Créé sur votre agenda",
    "ownLinkLabel": "Je partage mon propre lien",
    "ownLinkHint": "Preply, italki, ou votre propre salle"
  },
  "billing": {
    "leftTitle": "Comptes rendus restants",
    "leftDesc": "Un compte rendu est utilisé à chaque synthèse. Pas d’expiration, pas de renouvellement automatique.",
    "ofFree": "sur vos {total} comptes rendus gratuits",
    "ofFreeUsed": "sur vos {total} gratuits · {used} utilisés",
    "builtSoFar": "{used} créés jusqu’ici",
    "emptyTrial": "Vos comptes rendus gratuits sont utilisés. Achetez un pack ci-dessous pour continuer — pas d’abonnement, pas de renouvellement.",
    "emptyPaid": "Votre solde est vide. Un pack ci-dessous le recharge, tout ce que vous n’utilisez pas reste.",
    "addTitle": "Acheter des comptes rendus",
    "addDesc": "Paiement unique, aucun renouvellement. Plus le pack est grand, plus c’est avantageux — mais le petit n’est pas une punition, et tout reste sur votre compte.",
    "lessonsWrittenUp": "leçons synthétisées",
    "save": "économisez {pct}%",
    "neverExpires": "N’expire jamais",
    "buy": "Acheter {n}",
    "paidOnce": "Payé une fois, par carte, via Stripe. Aucune carte enregistrée, rien ne repaiera automatiquement.",
    "packTags": [
      "Pour débuter",
      "Rythme régulier",
      "Le plus choisi"
    ]
  },
  "recap": {
    "tabs": [
      "Progrès",
      "Compte rendu",
      "Devoirs",
      "Vocabulaire"
    ],
    "tabsAria": "Sections du compte rendu",
    "eyebrow": "Relire avant d’envoyer",
    "title": "{name} · Compte rendu de la leçon",
    "lessonFallback": "Leçon",
    "sub": "revoyez chaque onglet, puis envoyez à {first}.",
    "translate": "Traduire les explications",
    "translateTitle": "Réécrivez les explications dans la langue de l’étudiant — supports et scores restent identiques",
    "working": "Traitement…",
    "rebuild": "Refaire à partir de l’enregistrement",
    "rebuildTitle": "Régénérer depuis l’enregistrement avec la dernière version et les dernières données",
    "rebuilding": "Reconstruction…",
    "deleteDraft": "Supprimer le brouillon",
    "deleting": "Suppression…",
    "saveDraft": "Enregistrer le brouillon",
    "approve": "Valider et envoyer",
    "sending": "Envoi…",
    "savedTick": "Enregistré ✓",
    "confirmRebuild": "Refaire ce compte rendu à partir de l’enregistrement ? Le résumé, les rubriques, les devoirs et les mesures seront régénérés. Vos modifications manuelles seront perdues.",
    "confirmTranslate": "Traduire les explications de ce compte rendu dans la langue utilisée pour l’étudiant ? Les exemples, citations et scores restent inchangés.",
    "confirmDelete": "Supprimer le brouillon de {name} ? Il sera retiré de la relecture et cela ne peut pas être annulé.",
    "promptLanguage": "Cet étudiant n’a pas encore de langue d’explication définie (à choisir sur sa page). Traduire les explications vers quelle langue ?",
    "rebuildFailed": "Échec de la reconstruction",
    "translationFailed": "Échec de la traduction",
    "deleteFailed": "Impossible de supprimer le compte rendu",
    "savingEdits": "Enregistrement de vos modifications…",
    "uploadingMemo": "Envoi de votre mémo vocal…",
    "uploadingFile": "Envoi de {name}…",
    "attachingMaterials": "Ajout des documents…",
    "attachmentFailed": "Compte rendu envoyé, mais un document n’a pas pu être chargé — ajoutez-le depuis la page de la leçon.",
    "suggestedScript": "Graphie suggérée"
  },
  "portal": {
    "slots": {
      "greeting": "Bon retour,",
      "tabOverview": "Vue",
      "tabLessons": "Leçons",
      "tabProgress": "Progrès",
      "tabPractice": "Entraînement",
      "tabFiles": "Fichiers",
      "tabTests": "Tests",
      "statLessons": "Leçons",
      "statScore": "Moyenne",
      "statSpeaking": "Expression orale",
      "lessonsTitle": "Vos leçons",
      "progressTitle": "Vos progrès",
      "vocabTitle": "Vocabulaire",
      "milestoneTitle": "Étape suivante",
      "scoresTitle": "Dernières notes",
      "testsTitle": "Tests d’entraînement",
      "speakingTitle": "Habitudes orales",
      "filesTitle": "Fichiers du cours",
      "vocabTotalsTitle": "Évolution du vocabulaire"
    },
    "tabsAria": "Sections du tableau de bord",
    "notLinked": "Compte pas encore relié",
    "askTeacher": "Demandez à votre enseignant de le relier.",
    "climbLed": "Vous êtes passé de l’écoute à {em}.",
    "climbLedEm": "mener la conversation",
    "climbMore": "Vous parlez {em} qu’au départ.",
    "climbMoreEm": "{delta} points de plus",
    "climbPlain": "Vous avez parlé {em} lors de votre dernier cours.",
    "youSpoke": "Vous avez parlé",
    "acrossLessons": "Sur {n} cours",
    "acrossOneLesson": "Sur 1 cours",
    "climbSub": "Le point de départ est marqué sur l’arc — {then}.",
    "climbDelta": "{delta} points depuis la leçon 1",
    "inLast30": "{n} sur les 30 derniers jours",
    "totalLessons": "Total de leçons terminées",
    "inAll": "{n} au total",
    "words": "{n} mots",
    "lastN": "Derniers {n}",
    "metricPace": "Débit",
    "metricThinking": "Temps de réflexion",
    "metricShare": "Votre part",
    "practiseTitle": "Entraînez vos mots",
    "practiceHistory": "Entraînement, 15 derniers jours",
    "byKind": "Par type de mot",
    "byLesson": "Par leçon",
    "practiseAnything": "S’entraîner librement",
    "practiseDue": "S’entraîner sur le dû",
    "vocabKnown": "connu",
    "vocabLearning": "en cours",
    "vocabNew": "non débuté",
    "download": "Télécharger"
  },
  "practice": {
    "emptyTitle": "Rien à entraîner pour le moment",
    "emptyBody": "Les mots apparaîtront ici après la publication d’un compte rendu.",
    "howMany": "Combien aujourd’hui ?",
    "doneTitle": "Terminé — {n} cartes.",
    "doneOneTitle": "Terminé — 1 carte.",
    "allFirstTime": "Tous pour la première fois. Ils réapparaîtront dans quelques jours.",
    "someMissed": "{right} pour la première fois, {missed} à revoir plus tôt.",
    "moreLeft": "{n} mots restants dans ce lot, quand vous voulez.",
    "oneLeft": "Encore 1 mot dans ce lot, quand vous voulez.",
    "wholePile": "C’était tout pour ce lot.",
    "nextRound": "{n} de plus",
    "practiseAgain": "Réviser encore",
    "backToPractice": "Retour à l’entraînement",
    "tapToSee": "Touchez pour voir la signification",
    "again": "Encore",
    "knewIt": "Je le savais",
    "sayOutLoud": "Dites-le à voix haute avant de retourner la carte."
  },
  "rating": {
    "question": "Ce compte rendu correspond-il à votre cours ?",
    "yes": "Oui, c’était mon cours",
    "no": "Pas tout à fait",
    "thanksYes": "Vous avez indiqué que ce compte rendu est fidèle. Merci — il est pris en compte.",
    "thanksNo": "Vous avez indiqué que ce compte rendu était à côté. Merci — c’est le retour utile.",
    "whatWasOff": "Qu’est-ce qui n’allait pas ? Cochez ce qui convient.",
    "notePlaceholder": "Si possible, précisez quelle partie — une phrase suffit.",
    "send": "Envoyer",
    "sending": "Envoi…",
    "didNotSave": "Non enregistré.",
    "reasons": [
      "Des mots jamais dits",
      "Confusion sur qui a dit quoi",
      "Mauvaise graphie ou langue",
      "Trop facile ou difficile",
      "Autre"
    ]
  },
  "recapLanguage": {
    "question": "Mes comptes rendus sont écrits en",
    "hint": "La langue que vous apprenez reste inchangée — ici, vous choisissez la langue des explications.",
    "aria": "Langue des explications de mes comptes rendus",
    "saved": "Enregistré — dès le prochain compte rendu.",
    "didNotSave": "Non enregistré."
  },
  "lesson": {
    "railAria": "Sections de la leçon",
    "thisLesson": "Ce cours",
    "movements": [
      "Comment vous avez parlé",
      "Ce que vous avez acquis",
      "À retravailler",
      "Ce qu’on a couvert",
      "Mots du jour",
      "Entraînement",
      "Fichiers & audio"
    ],
    "speakingBalance": "Répartition parole",
    "score": "Note",
    "grammarDensity": "Richesse grammaticale",
    "corrections": "Corrections",
    "homework": "Devoirs",
    "noHomework": "Aucun devoir pour ce cours.",
    "practiceExercises": "Exercices d’entraînement",
    "wordsFromLesson": "Mots de cette leçon",
    "whoTalked": "Qui a parlé",
    "speakingMeasured": "Votre expression, mesurée",
    "yourTeacher": "Votre enseignant"
  },
  "join": {
    "setupFailed": "Impossible de configurer votre compte.",
    "acceptFailed": "Impossible d’accepter l’invitation.",
    "joining": "Adhésion…",
    "joinAs": "Adhérer en tant que {name}",
    "notYou": "Ce n’est pas vous ? {signOut} puis ouvrez à nouveau ce lien.",
    "notYouLink": "Déconnexion",
    "emailLabel": "Votre adresse e-mail",
    "passwordLabel": "Choisissez un mot de passe",
    "passwordHint": "8 caractères minimum",
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
    "keepSent": "Garder celui que j’ai envoyé"
  },
  "exchange": {
    "recording": "Enregistrement",
    "download": "Télécharger",
    "nothingShared": "Rien partagé pour ce cours pour l’instant.",
    "noFiles": "Aucun fichier partagé. Chargez une présentation ou un PDF pour ce cours.",
    "audioIntro": "Entraînement libre enregistré par l’étudiant. Leurs réponses aux oraux se trouvent dans l’onglet Entraînement.",
    "noAudio": "Aucun audio reçu pour l’instant."
  },
  "charts": {
    "metrics": [
      {
        "label": "Note",
        "note": "La note sur dix donnée à chaque séance."
      },
      {
        "label": "Votre parole",
        "note": "Votre part dans la discussion. Elle grandit au fil de la confiance."
      },
      {
        "label": "Débit",
        "note": "Nombre de mots par minute pendant que vous parliez."
      },
      {
        "label": "Réflexion",
        "note": "Temps avant de répondre. Plus c’est court, plus les mots viennent facilement."
      },
      {
        "label": "Vocabulaire",
        "note": "Total de tous les mots rencontrés au fil des cours."
      }
    ],
    "nothingYet": "Rien enregistré pour le moment.",
    "sinceLesson": "depuis la leçon {n}",
    "trendLater": "La tendance apparaîtra après votre prochain cours."
  },
  "tests": {
    "saveScoreFailed": "Impossible d’enregistrer votre note.",
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
    "defaultsTitle": "Paramètres par défaut",
    "defaultsDesc": "Durée des séances et délai minimal pour réserver.",
    "lessonName": "Nom de la leçon",
    "lessonNamePlaceholder": "Cours de langue",
    "lessonLength": "Durée de la leçon (min)",
    "slotInterval": "Intervalle des créneaux (min)",
    "minNotice": "Préavis minimum (h)",
    "bufferBefore": "Marge avant (min)",
    "bufferAfter": "Marge après (min)",
    "maxPerDay": "Max de cours / jour",
    "bookingWindow": "Fenêtre de réservation (jours)",
    "title": "Disponibilités",
    "copyMon": "Copier lundi → jours ouvrés",
    "copyMonTitle": "Copier les horaires du lundi sur mardi–vendredi",
    "previewBooking": "Aperçu de la page de réservation ↗",
    "unavailable": "Indisponible",
    "dateOverrides": "Exceptions calendrier"
  },
  "recordings": {
    "eyebrow": "Vue d'ensemble",
    "title": "Leçons & comptes rendus",
    "settings": "Paramètres",
    "yourStudents": "Vos étudiants",
    "publishedTitle": "Leçons publiées",
    "publishedDesc": "Ce que les étudiants peuvent déjà voir, trié du plus récent. Les brouillons attendent en haut.",
    "nothingPublished": "Rien publié pour le moment",
    "untitled": "Leçon sans titre",
    "published": "Publié",
    "draft": "Brouillon",
    "summaryAria": "Résumé de la leçon",
    "students": "Étudiants",
    "changedMind": "Vous avez changé d’avis ?",
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
    "draftBanner": "Brouillon IA — relisez le contenu ci-dessous avant qu’il ne soit visible étudiant.",
    "score": "Note",
    "studentTalk": "Parole étudiant",
    "grammar": "Grammaire",
    "confidence": "Confiance",
    "homework": "Devoirs",
    "memoScript": "Script du mémo vocal",
    "teacherNote": "Note de l’enseignant",
    "editLater": "Modifier plus tard",
    "approveSend": "Valider et envoyer à l’étudiant"
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
    "bookingFailed": "Erreur de réservation.",
    "bookingFailedRetry": "Réservation échouée — réessayez.",
    "eyebrow": "Planifier un cours",
    "title": "Trouvez un créneau adapté",
    "sub": "Choisissez un jour puis un horaire. Confirmation et détails par e-mail.",
    "booked": "Vous êtes réservé !",
    "invite": "Une invitation agenda sera envoyée à {email}.",
    "openMeeting": "Ouvrir le lien d’appel",
    "noCalendar": "Disponibilité indisponible. Cet agenda est-il connecté ?",
    "noTimes": "Aucun créneau ouvert dans les 30 prochains jours.",
    "pickDay": "Choisissez un jour",
    "pickDayHint": "Les jours marqués d’un point ont des créneaux disponibles.",
    "yourDetails": "Vos coordonnées",
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
        "title": "Vue générale",
        "body": "Votre point de départ. Les comptes rendus à relire arrivent ici, vos dernières leçons s’affichent en dessous."
      },
      {
        "title": "Étudiants",
        "body": "Ajoutez chaque étudiant ici. Leurs cours, tests et progrès sont visibles dans cette liste — chacun a son propre portail."
      },
      {
        "title": "Notes",
        "body": "Un clic par cours donné : un calendrier qui devient aussi journal de bord."
      },
      {
        "title": "Vue étudiant",
        "body": "Exactement ce que voit l’étudiant, personnalisé à votre image — couleurs, noms, rubriques. Ce n’est pas un modèle : c’est en direct."
      },
      {
        "title": "Paiements",
        "body": "Notez ce que chaque étudiant a payé et combien de séances cela couvre. Le solde évolue à chaque compte rendu publié."
      },
      {
        "title": "Paramètres",
        "body": "Votre agenda, l’enregistreur de cours et votre compte. Le guide se trouve ici aussi, quand vous le souhaitez."
      }
    ],
    "skip": "Passer le guide"
  },
  "languages": {
    "couldNotSave": "Impossible d’enregistrer",
    "title": "Vos langues",
    "desc": "Ce que vous enseignez et dans quelle langue vos cours sont menés. Les nouveaux étudiants démarrent ainsi.",
    "youTeach": "Langue enseignée",
    "spokenIn": "Langue parlée pendant les cours",
    "fitTitle": "Comment ces paramètres s’articulent",
    "fitDesc": "Trois réglages, trois rôles différents.",
    "fitLearning": "**La langue “apprise” de chaque étudiant** détermine la création des comptes rendus et des tests — {n} sont supportées, du japonais à l’arabe. À choisir à la création, modifiable ensuite.",
    "fitExplained": "**La langue “explications”** est celle des textes des comptes rendus et instructions des tests — anglais par défaut, modifiable aussi ensuite.",
    "fitSpoken": "**La langue ‘parlée en cours’** est celle reconnue par l’enregistreur pendant la séance. Suit votre choix initial jusqu’à modification pour l’élève ; elle n’est plus demandée à chaque cours."
  },
  "notes": {
    "pickStudent": "Choisissez un étudiant",
    "empty": "La note est vide",
    "couldNotSave": "Impossible d’enregistrer la note",
    "confirmDelete": "Supprimer cette note ?",
    "hoursTaught": "Heures enseignées",
    "recapsPublished": "Comptes rendus publiés",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun étudiant pour l’instant",
    "student": "Étudiant",
    "addNote": "Ajouter une note",
    "newNote": "Nouvelle note",
    "editNote": "Modifier la note"
  },
  "exercises": {
    "none": "Aucun exercice pour l’instant — ajoutez-en ci-dessous.",
    "instruction": "Consigne",
    "instructionPlaceholder": "Ce qui est demandé à l’étudiant",
    "focus": "Point visé",
    "focusPlaceholder": "Axe de l’exercice",
    "sentence": "Phrase",
    "meaning": "Signification",
    "removeSentence": "Retirer la phrase",
    "removeOption": "Retirer l’option",
    "questionTarget": "Question (langue ciblée)",
    "question": "Question"
  },
  "payments": {
    "selectStudent": "Sélectionner un étudiant",
    "amountTooLow": "Saisissez un montant supérieur à zéro",
    "saveFailed": "Échec d’enregistrement",
    "thisMonth": "Ce mois-ci",
    "receivedAllTime": "Total reçu",
    "outstanding": "En attente",
    "currency": "Devise",
    "students": "Étudiants",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Aucun étudiant pour l’instant",
    "student": "Étudiant",
    "recent": "Paiements récents",
    "newPayment": "Nouveau paiement",
    "editPayment": "Modifier le paiement",
    "selectPlaceholder": "Sélectionner…",
    "amount": "Montant ({symbol})",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "covers": "Ce que cela couvre",
    "coversPlaceholder": "ex : Forfait juillet — 4 leçons",
    "paymentDate": "Date du paiement",
    "dueDate": "Échéance",
    "lessonsCovered": "Leçons couvertes",
    "lessonsPlaceholder": "ex : 4",
    "method": "Mode",
    "methodPlaceholder": "Virement bancaire, Espèces, PayPal…",
    "confirmDelete": "Supprimer ce paiement ?"
  },
  "recapReview": {
    "vocab": "Vocabulaire",
    "summary": "Résumé",
    "summaryPlaceholder": "Résumé de la leçon…",
    "sectionTitle": "Titre de la section",
    "sectionContent": "Contenu de la section…",
    "removeSection": "Retirer la section",
    "homeworkTask": "Tâche à faire",
    "noteTitle": "Votre note à l’étudiant",
    "notePlaceholder": "Un mot personnel pour l’étudiant…"
  },
  "connectors": {
    "googleName": "Google Agenda",
    "googleDesc": "Lit vos leçons et inscrit les nouvelles séances sur votre agenda.",
    "connect": "Connecter",
    "permissionNeeded": "Permission requise",
    "reconnect": "Reconnecter",
    "disconnect": "Déconnecter",
    "zoomDesc": "Crée une salle Zoom unique pour chaque cours réservé.",
    "comingSoon": "Bientôt disponible",
    "stripeName": "Stripe",
    "stripeDesc": "Acceptez les paiements par carte pour vos forfaits — tout va directement sur votre compte."
  },
  "student": {
    "notJoined": "Invité — pas encore inscrit",
    "avgScore": "Moyenne",
    "latestTalk": "Dernière parole",
    "vocabItems": "Entrées vocabulaire",
    "creditsLeft": "{left} cours restants / {bought} achetés",
    "creditsOneLeft": "1 cours restant / {bought} achetés",
    "noCredits": "Aucun cours acheté pour l’instant",
    "managePayments": "Gérer les paiements →",
    "lessonsTitle": "Leçons & comptes rendus",
    "noLessons": "Aucun cours pour l’instant",
    "noLessonsSub": "Les cours enregistrés pour cet étudiant s’afficheront ici.",
    "testsTitle": "Tests d’entraînement",
    "noTests": "Aucun test pour l’instant"
  },
  "addStudent": {
    "levels": [
      "Débutant",
      "Elémentaire",
      "Pré-intermédiaire",
      "Intermédiaire",
      "Intermédiaire supérieur",
      "Avancé"
    ],
    "createFailed": "Échec de création",
    "aria": "Nouvel étudiant",
    "title": "Nouvel étudiant",
    "fullName": "Nom complet",
    "namePlaceholder": "Jane Doe",
    "level": "Niveau",
    "learning": "Apprentissage",
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
    "fixInSettings": "Corriger dans les Paramètres",
    "nothingOn": "Rien le {day}.",
    "noLessonsThatDay": "Aucune leçon prévue ce jour.",
    "agendaClear": "Votre agenda est vide.",
    "noUpcoming": "Aucune leçon prévue sur cet agenda."
  },
  "forgot": {
    "title": "Réinitialiser votre mot de passe",
    "lead": "Indiquez l’adresse e-mail utilisée pour vous connecter, nous vous enverrons un lien pour le modifier.",
    "send": "Envoyer le lien",
    "sending": "Envoi…",
    "sent": "Si {email} a un compte, un lien de réinitialisation est en route. Ouvrez l’e-mail et suivez le lien pour choisir un nouveau mot de passe — il expire au bout d’une heure.",
    "spam": "Rien reçu ? Vérifiez vos spams ou essayez une autre adresse.",
    "remembered": "Finalement vous vous souvenez ?",
    "backToSignIn": "Retour à la connexion"
  },
  "reset": {
    "tooShort": "Le nouveau mot de passe doit comporter au moins 6 caractères.",
    "mismatch": "Les mots de passe ne correspondent pas — vérifiez-les.",
    "samePassword": "Identique à l’ancien — choisissez-en un nouveau.",
    "saveFailed": "Impossible d’enregistrer ce mot de passe. Merci de réessayer.",
    "title": "Choisissez un nouveau mot de passe",
    "expired": "Ce lien de réinitialisation a expiré ou a déjà été utilisé. Demandez un nouveau lien puis réessayez.",
    "noToken": "Cette page ne fonctionne qu’à partir du lien dans le mail de réinitialisation. Faites la demande et nous vous l’enverrons.",
    "lead": "Choisissez un nouveau mot de passe. Vous serez connecté dès qu’il sera enregistré.",
    "newPassword": "Nouveau mot de passe",
    "repeat": "Retapez-le"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "Moyenne",
        "sub": "Sur 10, tous les cours notés."
      },
      {
        "label": "Part de parole",
        "sub": "Combien de temps l’étudiant parlait dans le cours."
      },
      {
        "label": "Débit oral",
        "sub": "Mots par minute lorsqu’il/elle parlait. Plus c’est haut, plus la fluidité progresse."
      },
      {
        "label": "Temps réflexion",
        "sub": "Secondes entre la fin de la consigne et le début de la réponse. Une longue pause signifie qu’on réfléchit, ce n’est pas une erreur."
      },
      {
        "label": "Mots par intervention",
        "sub": "Combien l’étudiant dit à chaque prise de parole. Courtes répliques dites vite, c’est répondre, pas converser."
      },
      {
        "label": "Mots de remplissage",
        "sub": "“Euh”, “ben”, par leçon. À comparer au débit — rapide avec beaucoup de tics n’est pas pareil que lent et fluide."
      }
    ],
    "totalLessons": "Total de séances",
    "acrossStudents": "chez {n} étudiants",
    "mostActive": "Le plus actif",
    "nLessons": "{n} cours",
    "nothingRecorded": "rien enregistré pour l’instant",
    "vocabMet": "Vocabulaire rencontré",
    "wordsAcross": "mots sur tous les cours",
    "notSeenLately": "Absent ces derniers temps",
    "everyoneCurrent": "tout le monde est à jour",
    "measureAria": "Mesure",
    "nothingMeasured": "Aucune donnée pour l’instant — cela se complète au fur et à mesure.",
    "perStudent": "{measure} — chaque étudiant",
    "perStudentSub": "Ses cours dans l’ordre. La flèche va du premier au dernier.",
    "prevMeasure": "Mesure précédente",
    "nextMeasure": "Mesure suivante"
  },
  "test": {
    "heading": "Test d’entraînement {level}",
    "published": "Publié",
    "draftOnlyYou": "Brouillon — visible seulement pour vous",
    "basedOn": "Basé sur",
    "lessonN": "Leçon {n}",
    "script": "Graphie",
    "scriptBeginner": "Hiragana + romaji",
    "scriptHiragana": "Hiragana",
    "scriptKanji": "Kanji + kana",
    "created": "Créé",
    "status": "Statut",
    "speakingAnswer": "Réponse orale",
    "unplayable": "L’enregistrement existe mais est non accessible à la lecture."
  },
  "trial": {
    "aria": "Bienvenue sur Lesson Studio",
    "kicker": "Bienvenue sur Lesson Studio",
    "title": "Vos {n} premiers comptes rendus sont offerts.",
    "sub": "Installez l’enregistreur, donnez une leçon, et voyez le compte rendu s’écrire — pas de carte, pas d’engagement. Convaincu ou non, choisissez ensuite le pack qui vous convient.",
    "showMe": "Me faire visiter",
    "exploreMyself": "Je visite moi-même",
    "setUpFirst": "Ou installez l’enregistreur d’abord →"
  },
  "reviewQueue": {
    "title": "Comptes rendus à relire",
    "desc": "Créés à partir de vos enregistrements. Rien n’est publié sans votre validation.",
    "moveFailed": "Impossible de déplacer ce compte rendu",
    "serverUnreachable": "Serveur inaccessible",
    "rebuildFailed": "Impossible de reconstruire ce compte rendu",
    "deleteFailed": "Impossible de supprimer le compte rendu"
  },
  "recorderMissing": {
    "title": "Ajoutez l’enregistreur pour commencer",
    "body": "Lesson Studio crée les comptes rendus depuis vos cours, et c’est l’extension Chrome qui les enregistre. Tant qu’elle n’est pas installée et connectée, rien n’arrivera ici — il n’y a pas d’autre manière d’ajouter un cours."
  },
  "pending": {
    "chooseStudent": "Choisissez d’abord avec qui était ce cours.",
    "fileFailed": "Impossible d’archiver cet enregistrement.",
    "confirmDelete": "Supprimer cet enregistrement ? L’audio sera effacé aussi.",
    "studentAria": "Étudiant",
    "choosePlaceholder": "Choisir un étudiant",
    "filing": "Archivage…",
    "buildRecap": "Créer le compte rendu"
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
    "needLesson": "Publiez d’abord un compte rendu",
    "title": "Créer un test d’entraînement",
    "explanationLanguage": "Langue des explications"
  },
  "guide": {
    "eyebrow": "Enregistreur de cours",
    "title": "Enregistrez une leçon, recevez un compte rendu",
    "sub": "Une extension Chrome qui enregistre l’onglet du cours et votre micro sur deux pistes séparées, puis rédige un brouillon ici. Aucun bot ne rejoint l’appel, rien n’est installé côté étudiant — fonctionne sur Preply, italki, Google Meet, Zoom, partout où le cours est dans un onglet.",
    "step1Title": "Installez-la depuis le Chrome Web Store",
    "step1Body": "Un clic, aucune option. Puis épinglez-la — cliquez la pièce à puzzle en haut à droite et activez l’épingle — le K reste ainsi accessible pendant le cours.",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Ajouter à Chrome",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "betaNote": "**Testé une version bêta (dossier) ?** Retirez-la d’abord ({path} → Supprimer). Seule une version peut enregistrer un onglet à la fois.",
    "step2Title": "Connectez-vous — une seule fois",
    "step2Body": "Ouvrez l’extension et connectez-vous avec la même adresse et mot de passe que sur ce site. Tout est déjà prêt ainsi : les étudiants, la langue enseignée, etc.",
    "signIn": "Connexion",
    "step3Title": "Ouvrez l’onglet du cours et lancez l’enregistrement",
    "step3Body": "Soyez dans l’onglet où le cours a lieu — salle Preply, appel Meet… Cliquez le K, choisissez l’étudiant, puis **Démarrer l’enregistrement**. La première fois, Chrome demande accès au micro : autorisez. Refermez la fenêtre et enseignez — l’enregistrement tourne.",
    "studentLabel": "Étudiant :",
    "step4Title": "Arrêter puis envoyer",
    "step4Body": "À la fin, rouvrez la fenêtre, cliquez **Arrêter l’enregistrement**, puis **Envoyer à Lesson Studio**. Rien n’est envoyé tant que vous ne cliquez pas sur envoyer.",
    "sendButton": "Envoyer à Lesson Studio →",
    "step5Title": "Relisez le brouillon généré",
    "step5Body": "Après quelques minutes le brouillon apparaît sous **Comptes rendus à relire** — résumé, vocabulaire, exercices, dans la langue de votre élève. Modifiez ce que vous voulez, validez, il est dans leur portail.",
    "reviewAndSend": "Relire & envoyer",
    "consentTitle": "Avant d’enregistrer quelqu’un",
    "consentBody": "Prévenez votre élève et obtenez son accord. Certains pays exigent le consentement de chaque participant, Preply et italki ont aussi leurs propres règles sur l’enregistrement — à vérifier avant de l’intégrer.",
    "dataBody": "L’enregistreur capture les deux voix. Rien n’est transmis avant le clic **Envoyer à Lesson Studio**, l’audio est transcrit pour le compte rendu puis supprimé au bout de 30 jours. Tous les détails figurent dans notre {policy}.",
    "privacyLink": "politique de confidentialité"
  },
  "lessonExercises": {
    "none": "Aucun exercice oral pour ce cours.",
    "recordReading": "Enregistrez-vous sur ces phrases",
    "notRecorded": "Pas encore enregistré."
  },
  "lessonTools": {
    "lessonIsWith": "Ce cours est avec",
    "notLinked": "Non lié (test / pas d’étudiant)",
    "hint": "Liez un étudiant pour que le compte rendu lui soit envoyé. Laissez non lié pour une session test."
  },
  "memo": {
    "back15": "Reculer de 15 sec",
    "forward15": "Avancer de 15 sec",
    "seek": "Se déplacer"
  },
  "joinInvalid": {
    "title": "Ce lien n’est pas valide",
    "body": "Il a peut-être déjà servi ou votre enseignant l’a remplacé. Demandez-lui un nouveau lien.",
    "goSignIn": "Aller à la connexion"
  },
  "dashboard": {
    "students": "Étudiants",
    "withLogin": "Avec connexion",
    "lessonsRecorded": "Cours enregistrés",
    "noStudents": "Aucun étudiant pour l’instant",
    "notJoined": "Invité — pas encore inscrit",
    "lessons": "Cours",
    "overview": "Vue d'ensemble"
  },
  "misc": {
    "outOfTen": "SUR 10",
    "dashboardBack": "Tableau de bord",
    "backToOverview": "Retour à la vue",
    "recapGone": "Ce compte rendu n’est plus disponible.",
    "timesShared": "Partages",
    "languageGroup": "Langue",
    "extConfirmReset": "Déconnecter l’enregistreur sur tous les ordinateurs ? L’enregistrement s’arrêtera jusqu’à reconnexion dans l’extension.",
    "extResetFailed": "Impossible de réinitialiser la connexion de l’enregistreur.",
    "extSigningOut": "Déconnexion…",
    "extSignOutEverywhere": "Déconnecter partout l’enregistreur",
    "howTitle": "Comment vos cours arrivent ici",
    "howLead": "Vous enseignez sur {platform}, donc rien n’est réservé ici. Un cours entre dans Lesson Studio au moment où on l’enregistre.",
    "howSteps": [
      {
        "title": "Enregistrez le cours",
        "body": "Utilisez l’enregistreur du navigateur ou importez le fichier fourni par votre plateforme."
      },
      {
        "title": "Nous créons le compte rendu",
        "body": "Résumé, vocabulaire, corrections et exercices, tous générés à partir de la transcription."
      },
      {
        "title": "Vous relisez et publiez",
        "body": "Modifiez ce que vous voulez, puis envoyez : l’élève le retrouve sur son portail."
      }
    ],
    "instrStudentChose": "Votre élève a choisi lui-même cette langue. Vous pouvez la changer, mais c’est son choix.",
    "instrHint": "Langue des explications de comptes rendus et tests — cliquez pour changer",
    "matLinkFailed": "Impossible d’enregistrer ce lien",
    "matLinksFailed": "Impossible d’enregistrer ces liens",
    "matAddLink": "Ajouter un lien",
    "confirmDeleteStudent": "Supprimer cet étudiant et tous ses cours ? Ceci est irréversible.",
    "resetPassword": "Réinitialiser le mot de passe",
    "inviteLink": "Lien d’invitation",
    "uploadFailed": "Échec de l’envoi",
    "micBlocked": "Micro bloqué — autorisez l’accès dans le navigateur.",
    "micBlockedBar": "Micro bloqué — autorisez-le près de la barre d’adresse puis réessayez.",
    "uploadAFile": "Télécharger un fichier",
    "submitToTeacher": "Transmettre à l’enseignant",
    "discardRedo": "Annuler & refaire",
    "sendToStudent": "Envoyer à l’étudiant",
    "sendThisAnswer": "Envoyer cette réponse",
    "sentTick": "Envoyé ✓",
    "vocabByLevelAria": "Vocabulaire par niveau",
    "vocabTapHint": "Touchez un niveau pour voir les mots et où vous les avez appris.",
    "firstSeenIn": "Vu pour la première fois lors de la leçon {n}",
    "firstSeen": "Vu pour la première fois",
    "wordsIntroduced": "Mots introduits",
    "fromTheLesson": "Du cours",
    "goAgain": "Recommencer",
    "showWord": "Voir le mot",
    "showMeaning": "Voir la signification",
    "correction": "Correction",
    "correctionsAria": "Corrections",
    "noLessonsYet": "Aucun cours pour l’instant"
  }
} as const
