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
    "somethingWrong": "Une erreur est survenue. Veuillez réessayer dans un instant."
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "Espace enseignant",
    "overviewAria": "Aperçu Lesson Studio",
    "navAria": "Navigation de l’espace enseignant",
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
    "payments": "Paiements",
    "availability": "Disponibilité",
    "settings": "Paramètres",
    "calendarConnected": "Agenda connecté",
    "setupNeeded": "Configuration requise",
    "recordingsOnly": "Enregistrements seuls",
    "studentPortal": "Portail élève"
  },
  "auth": {
    "language": "Langue",
    "emailLabel": "Adresse email",
    "emailPlaceholder": "vous@example.com",
    "passwordLabel": "Mot de passe",
    "signInTitle": "Connexion",
    "signInSub": "Content de vous revoir. Connectez-vous pour voir vos leçons, progrès et bilans.",
    "signInExpired": "Votre session a expiré. Connectez-vous et nous vous ramenons directement.",
    "signInAction": "Se connecter",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau ici ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "La configuration est gratuite ; ajoutez votre premier élève dès maintenant.",
    "studentQuestion": "Vous êtes élève ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d’invitation : ouvrez-le, puis choisissez votre email et mot de passe. Ensuite, connectez-vous ici.",
    "signInHeadline": "Chaque leçon, rédigée.",
    "signInAside": "Lesson Studio transforme chaque heure en bilan écrit, graphique de progression et exercices — pour l’enseignant et pour l’élève.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Créez votre espace Koku Library : élèves, bilans de leçons, réservations et suivi de progression.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "6 caractères minimum",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Vous avez déjà un compte ?",
    "signUpHeadline": "Toute votre activité d’enseignement, au même endroit.",
    "signUpAside": "Configuration en quelques minutes. Ajoutez un élève, enregistrez votre prochaine leçon, et tout se met en place tout seul."
  },
  "aside": {
    "slides": [
      {
        "title": "La leçon s’écrit toute seule",
        "body": "Une extension Chrome enregistre les deux voix. Le bilan revient déjà rédigé — vous relisez et publiez."
      },
      {
        "title": "Des progrès vraiment visibles",
        "body": "Scores, temps de parole, vocabulaire suivis d’une leçon à l’autre, sur une page faite pour l’élève."
      },
      {
        "title": "La langue que vous enseignez",
        "body": "Japonais, français, coréen, espagnol et trente autres — corrigés dans la langue de la leçon, expliqués dans celle de l’élève."
      },
      {
        "title": "Pratiquer avec leurs propres mots",
        "body": "Cartes mémoire et tests oraux tirés du vocabulaire rencontré pendant l’heure."
      },
      {
        "title": "Un portail élève à votre nom",
        "body": "Vos couleurs, vos textes, et seulement les sections utiles à votre enseignement."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos leçons",
      "Où vous vous retrouvez",
      "Votre agenda",
      "Vue élève",
      "Votre enregistreur"
    ],
    "sideTitle": "Configurons votre studio.",
    "sideBody": "Quatre étapes et vos élèves ont leur propre portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Terminer la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Impossible d’enregistrer",
    "couldNotFinish": "Impossible de terminer",
    "pickTeaching": "Choisissez la langue que vous enseignez.",
    "pickSpoken": "Choisissez la langue parlée pendant vos leçons.",
    "pickCalendar": "Indiquez si vos leçons figurent sur un agenda.",
    "pickPortalName": "Nommez le portail — vos élèves verront ce nom.",
    "teachAria": "La langue que vous enseignez",
    "iTeach": "J’enseigne",
    "teachHint": "Les bilans et exercices sont faits pour cette langue. Ce sera le choix par défaut pour chaque nouvel élève — vous pourrez changer pour chaque élève par la suite.",
    "spokenAria": "La langue parlée pendant vos leçons",
    "spokenIn": "mes leçons sont surtout en",
    "spokenHint": "Souvent différente de la langue apprise — une leçon de débutant se déroule en grande partie dans une langue que vous partagez. L’enregistreur écoute celle-ci.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où rencontrez-vous vos élèves ?",
    "platformLead": "Sur Meet ou Zoom, nous créons le lien à la réservation. Sur une marketplace, la leçon a déjà une salle, nous utilisons donc ce lien.",
    "zoomLater": "Connecter Zoom plus tard dans Paramètres",
    "stayOutTitle": "Nous restons en dehors de la salle de leçon",
    "stayOutBody": "Aucun lien créé, aucun robot envoyé. Vous enregistrez la leçon vous-même : le bilan, le vocabulaire et la pratique sont générés à partir de cet enregistrement — tout fonctionne de la même façon côté élève.",
    "calendarTitle": "Où sont vos leçons ?",
    "calendarLeadExternal": "Certains enseignants {platform} utilisent Google Agenda, d’autres restent sur la plateforme. Votre choix change l’affichage de l’espace de travail.",
    "calendarLead": "Si vos élèves apparaissent sur votre Google Agenda, nous pouvons lire la semaine, gérer les réservations et envoyer l’enregistreur. Sinon, nous n’intervenons pas.",
    "googleConnected": "Google Agenda connecté",
    "googleConnectedSub": "Vous pouvez choisir l’agenda utilisé pour vos leçons dans Paramètres.",
    "connectGoogle": "Connecter Google Agenda",
    "connectGoogleFine": "Vous serez redirigé vers l’écran Google, puis de retour ici. Ce n’est pas obligatoire, mais les réservations et l’enregistrement automatique restent inactifs tant que ce n’est pas fait.",
    "recordTitle": "Enregistrez la leçon",
    "recordBody": "Dans n’importe quelle salle, capturez la leçon et transmettez l’enregistrement à Lesson Studio.",
    "reviewTitle": "Relisez le bilan",
    "reviewBody": "Il rejoint votre file d’attente comme une leçon standard. Publiez-le et l’élève y accède.",
    "noCalendarFine": "Pas d’agenda, pas de page de réservation, pas de rappels — votre espace s’ouvre sur les leçons et les bilans. Modifiable à tout moment dans Paramètres.",
    "brandTitle": "Personnalisez-le",
    "brandLead": "Choisissez une couleur et un nom pour le portail élève. Vous pourrez tout ajuster par la suite.",
    "portalNameLabel": "Nom du portail élève",
    "portalNamePlaceholder": "ex. Sakura Japonais",
    "portalNameFine": "Ce nom apparaît en haut du portail élève et dans l’invitation. C’est le nom de votre studio, pas le nôtre.",
    "accent": "Couleur d’accent",
    "previewTagline": "Apprendre aujourd’hui, réussir demain !",
    "recorderTitle": "Installez l’enregistreur",
    "recorderLead": "C’est l’outil clé : une extension Chrome qui enregistre la leçon et rédige le bilan. Aucun robot ne rejoint l’appel, rien n’est installé côté élève.",
    "recorderStep1": "**Ajoutez-le depuis le Chrome Web Store** — un clic, puis épinglez-le dans la barre d’outils.",
    "recorderStep2": "**Connectez-vous dans l’extension** avec le même email et mot de passe. Aucun transfert à faire.",
    "recorderStep3": "**Enregistrez une leçon** : choisissez l’élève, démarrez, arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "recorderFine": "Vous voulez le guide complet (droits micro, ce qui s’enregistre) ? Consultez le {guide} — toujours disponible dans **Paramètres → Enregistreur de leçon**.",
    "recorderFineLink": "guide d’installation"
  },
  "overview": {
    "eyebrow": "Aperçu",
    "title": "Votre agenda pédagogique",
    "manageConnections": "Gérer les connexions",
    "fixInSettings": "Corriger dans Paramètres",
    "summaryAria": "Résumé de leçon",
    "upcoming": "Leçons à venir",
    "drafts": "Brouillons à relire",
    "draftsSub": "bilans en attente de vous",
    "published": "Bilans publiés",
    "publishedSub": "envoyés aux élèves",
    "writeUpsLeft": "Bilans restants",
    "writeUpsAria": "Bilans restants — en acheter plus",
    "usageTrial": "{used} utilisé sur vos {total} gratuits",
    "usageBought": "{used} créés · pas d’expiration",
    "lessonCalendar": "Agenda des leçons",
    "primaryCalendar": "(principal)"
  },
  "connect": {
    "title": "Connecter Google Agenda",
    "body": "Liez votre agenda pour permettre à Lesson Studio de voir vos futures leçons, prendre des réservations et enregistrer chaque cours.",
    "notConfigured": "Google OAuth n’est pas encore configuré. Ajoutez {id} et {secret} à l’environnement, puis redémarrez.",
    "scopeRead": "**Lire votre agenda** — trouver les leçons et leurs liens",
    "scopeRecord": "**Enregistrer les leçons** — capturer les cours avec l’extension Lesson Studio",
    "scopeRecap": "**Créer des bilans** — résumés de leçon par IA à relire et partager",
    "continueGoogle": "Continuer avec Google",
    "fine": "Vous serez redirigé vers l’écran d’autorisation Google. Vous pourrez gérer ça dans Paramètres ensuite."
  },
  "settings": {
    "eyebrow": "Espace de travail",
    "title": "Paramètres",
    "recorderTitle": "Enregistreur de leçon",
    "recorderDesc": "L’extension Chrome qui enregistre la leçon et génère un bilan. {guide}",
    "recorderGuide": "Guide pas à pas →",
    "replayTourHint": "Vous ne vous souvenez plus de la fonction d’une page ? Le guide s’affiche à nouveau ici.",
    "languageTitle": "Langue",
    "languageDesc": "Ce que cet espace de travail vous affiche. Cela ne change pas la langue de rédaction des bilans — chaque élève la configure lui-même.",
    "connectionsTitle": "Connexions",
    "connectionsDesc": "Connectez les outils utiles à la planification, aux réunions et aux paiements.",
    "livesTitle": "Où se trouvent vos leçons",
    "livesDesc": "Sur Google Agenda : réservation, créneau libre et enregistrement auto possibles. Ailleurs : le workspace ignore tout cela, juste vos enregistrements.",
    "calendarTitle": "Agenda des leçons",
    "calendarDesc": "Lequel de vos agendas contient les leçons à lire par Lesson Studio ?",
    "primaryCalendar": "Agenda principal",
    "speakingTitle": "Exercices oraux",
    "speakingDesc": "Chaque bilan se termine par trois exercices oraux. Les élèves peuvent enregistrer leur réponse : vous recevez les prises sur la page de la leçon et une notification email. Désactivez pour retirer ces trois exercices du bilan.",
    "speakingOn": "Autoriser l’enregistrement",
    "speakingOnHint": "À écouter sur la page de la leçon",
    "speakingOff": "Les retirer",
    "speakingOffHint": "Le bilan conserve ses sept exercices écrits",
    "platformTitle": "Plateforme de réunion par défaut",
    "platformDesc": "Créée à chaque réservation. Choisissez la dernière si vos leçons ont déjà un lien (marketplace).",
    "meetLabel": "Google Meet",
    "meetHint": "Créé sur votre agenda",
    "ownLinkLabel": "Je partage mon propre lien",
    "ownLinkHint": "Preply, italki ou salle privée"
  },
  "billing": {
    "leftTitle": "Bilans restants",
    "leftDesc": "Un est consommé à chaque rédaction de leçon. Pas de date d’expiration, pas de renouvellement.",
    "ofFree": "sur vos {total} bilans gratuits",
    "ofFreeUsed": "sur vos {total} gratuits · {used} utilisés",
    "builtSoFar": "{used} générés jusqu’ici",
    "emptyTrial": "Vous avez utilisé vos bilans gratuits. Achetez un lot ci-dessous pour continuer à générer vos bilans — pas d’abonnement, pas de renouvellement automatique.",
    "emptyPaid": "Votre solde est vide. Un lot ci-dessous permet de recréditer, ce qui n’est pas utilisé reste disponible.",
    "addTitle": "Ajouter des bilans",
    "addDesc": "Un paiement, pas de renouvellement. Les lots plus grands coûtent moins par bilan — mais le plus petit n’est pas pénalisant et ce que vous achetez vous appartient jusqu’à utilisation.",
    "lessonsWrittenUp": "leçons rédigées",
    "save": "économisez {pct}%",
    "neverExpires": "Pas d’expiration",
    "buy": "Acheter {n}",
    "paidOnce": "Paiement unique, par carte, via Stripe. Aucune carte n’est conservée ici, pas de prélèvement ultérieur.",
    "packTags": [
      "Pour démarrer",
      "Rythme régulier",
      "Le plus acheté"
    ]
  },
  "recap": {
    "tabs": [
      "Progression",
      "Bilan",
      "Devoirs",
      "Vocabulaire"
    ],
    "tabsAria": "Sections du bilan",
    "eyebrow": "Relire avant d’envoyer",
    "title": "{name} · Bilan de leçon",
    "lessonFallback": "Leçon",
    "sub": "relisez chaque onglet puis envoyez à {first}.",
    "translate": "Traduire les explications",
    "translateTitle": "Réécrire les explications dans la langue de l’élève — contenu de la leçon et scores inchangés",
    "working": "Traitement…",
    "rebuild": "Refaire depuis l’enregistrement",
    "rebuildTitle": "Régénérer à partir de l’enregistrement avec la dernière version de l’IA + des mesures",
    "rebuilding": "Réécriture…",
    "deleteDraft": "Supprimer le brouillon",
    "deleting": "Suppression…",
    "saveDraft": "Enregistrer le brouillon",
    "approve": "Valider & envoyer",
    "sending": "Envoi…",
    "savedTick": "Enregistré ✓",
    "confirmRebuild": "Refaire ce bilan depuis l’enregistrement ? Cela régénère le résumé, les sections, les devoirs et les mesures de fluidité, et écarte toute modification manuelle.",
    "confirmTranslate": "Traduire les explications de ce bilan dans la langue de l’élève ? Les exemples, citations et scores restent inchangés.",
    "confirmDelete": "Supprimer le brouillon de {name} ? Il sera retiré des bilans à relire, action irréversible.",
    "promptLanguage": "Aucune langue fixée pour les explications de cet élève (modifiable sur sa page). Dans quelle langue traduire les explications ?",
    "rebuildFailed": "Échec de la régénération",
    "translationFailed": "Échec de la traduction",
    "deleteFailed": "Impossible de supprimer le bilan",
    "savingEdits": "Enregistrement de vos modifications…",
    "uploadingMemo": "Envoi de votre mémo vocal…",
    "uploadingFile": "Envoi de {name}…",
    "attachingMaterials": "Ajout des supports…",
    "attachmentFailed": "Bilan envoyé, mais un fichier n’a pas pu être ajouté — à joindre depuis la page de la leçon.",
    "suggestedScript": "Script suggéré"
  },
  "portal": {
    "slots": {
      "greeting": "Bon retour,",
      "tabOverview": "Aperçu",
      "tabLessons": "Leçons",
      "tabProgress": "Progrès",
      "tabPractice": "Pratique",
      "tabFiles": "Fichiers",
      "tabTests": "Tests",
      "statLessons": "Leçons",
      "statScore": "Moy. score",
      "statSpeaking": "Expression orale",
      "lessonsTitle": "Vos leçons",
      "progressTitle": "Votre progression",
      "vocabTitle": "Vocabulaire",
      "milestoneTitle": "Prochain étape",
      "scoresTitle": "Scores récents",
      "testsTitle": "Tests de pratique",
      "speakingTitle": "Habitudes orales",
      "filesTitle": "Fichiers de leçon",
      "vocabTotalsTitle": "Évolution du vocabulaire"
    },
    "tabsAria": "Sections du tableau de bord",
    "notLinked": "Compte non lié",
    "askTeacher": "Demandez à votre professeur de lier votre compte.",
    "climbLed": "Vous êtes passé de l’écoute à {em}.",
    "climbLedEm": "mener la conversation",
    "climbMore": "Vous parlez {em} qu’au début.",
    "climbMoreEm": "{delta} points de plus",
    "climbPlain": "Vous avez parlé {em} à votre dernière leçon.",
    "youSpoke": "Vous avez parlé",
    "acrossLessons": "Sur {n} leçons",
    "acrossOneLesson": "Sur 1 leçon",
    "climbSub": "Le repère sur l’arc, c’est votre départ — {then}.",
    "climbDelta": "{delta} points depuis la leçon 1",
    "inLast30": "{n} au cours des 30 derniers jours",
    "totalLessons": "Nombre total de leçons terminées",
    "inAll": "{n} au total",
    "words": "{n} mots",
    "lastN": "Derniers {n}",
    "metricPace": "Rythme",
    "metricThinking": "Temps de réflexion",
    "metricShare": "Votre part",
    "practiseTitle": "Pratiquez vos mots",
    "practiceHistory": "Pratique, deux dernières semaines",
    "byKind": "Par type de mot",
    "byLesson": "Par leçon",
    "practiseAnything": "Pratiquer tout",
    "practiseDue": "Pratiquer ce qui est à revoir",
    "vocabKnown": "connu",
    "vocabLearning": "en apprentissage",
    "vocabNew": "non commencé",
    "download": "Télécharger"
  },
  "practice": {
    "emptyTitle": "Rien à pratiquer pour l’instant",
    "emptyBody": "Les mots apparaîtront ici une fois qu’un bilan de leçon sera publié.",
    "howMany": "Combien aujourd’hui ?",
    "doneTitle": "Terminé — {n} cartes.",
    "doneOneTitle": "Terminé — 1 carte.",
    "allFirstTime": "Toutes pour la première fois. Elles reviendront dans quelques jours.",
    "someMissed": "{right} première fois, {missed} à revoir rapidement.",
    "moreLeft": "Encore {n} mots dans ce lot, à votre rythme.",
    "oneLeft": "Encore 1 mot dans ce lot, à votre rythme.",
    "wholePile": "C’est tout le lot.",
    "nextRound": "{n} de plus",
    "practiseAgain": "Repratiquer",
    "backToPractice": "Retour à la pratique",
    "tapToSee": "Appuyez pour voir le sens",
    "again": "Encore",
    "knewIt": "Je le savais",
    "sayOutLoud": "Dites-le à voix haute avant de retourner la carte."
  },
  "rating": {
    "question": "Cette rédaction correspond-elle à votre leçon ?",
    "yes": "Oui, c’était ma leçon",
    "no": "Pas vraiment",
    "thanksYes": "Vous avez indiqué que cela correspondait. Merci — c’est noté.",
    "thanksNo": "Vous avez dit que cela ne correspondait pas. Merci — c’est le retour le plus utile.",
    "whatWasOff": "Qu’est-ce qui n’allait pas ? Choisissez ce qui s’applique.",
    "notePlaceholder": "Précisez si possible — une phrase suffit.",
    "send": "Envoyer",
    "sending": "Envoi…",
    "didNotSave": "Enregistrement impossible.",
    "reasons": [
      "Des mots que je n’ai jamais dits",
      "Confusion sur qui a dit quoi",
      "Mauvaise écriture ou langue",
      "Trop facile ou trop difficile pour moi",
      "Autre"
    ]
  },
  "recapLanguage": {
    "question": "Mes bilans sont rédigés en",
    "hint": "La langue que vous apprenez ne change pas — tout ce qui entoure sera expliqué dans celle-ci.",
    "aria": "Langue des explications du bilan",
    "saved": "Enregistré — à partir du prochain bilan.",
    "didNotSave": "Enregistrement impossible."
  },
  "lesson": {
    "railAria": "Sections de la leçon",
    "thisLesson": "Cette leçon",
    "movements": [
      "Comment vous avez parlé",
      "Ce que vous avez réussi",
      "Points à améliorer",
      "Ce que nous avons vu",
      "Mots du jour",
      "Exercices",
      "Fichiers & audio"
    ],
    "speakingBalance": "Équilibre de parole",
    "score": "Score",
    "grammarDensity": "Densité grammaticale",
    "corrections": "Corrections",
    "homework": "Devoirs",
    "noHomework": "Pas de devoir pour cette leçon.",
    "practiceExercises": "Exercices de pratique",
    "wordsFromLesson": "Mots de cette leçon",
    "whoTalked": "Répartition des paroles",
    "speakingMeasured": "Votre expression, mesurée",
    "yourTeacher": "Votre enseignant"
  },
  "join": {
    "setupFailed": "Impossible de configurer votre compte.",
    "acceptFailed": "Impossible d’accepter l’invitation.",
    "joining": "Connexion…",
    "joinAs": "Rejoindre en tant que {name}",
    "notYou": "Ce n’est pas vous ? {signOut} puis rouvrez ce lien.",
    "notYouLink": "Déconnexion",
    "emailLabel": "Votre adresse email",
    "passwordLabel": "Choisissez un mot de passe",
    "passwordHint": "8 caractères minimum",
    "settingUp": "Configuration…",
    "createAccount": "Créer mon compte"
  },
  "speaking": {
    "cta": "Enregistrer votre réponse",
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
    "nothingShared": "Rien partagé pour cette leçon pour l’instant.",
    "noFiles": "Aucun fichier partagé pour l’instant. Ajoutez une présentation ou un PDF pour cette leçon.",
    "audioIntro": "Pratique orale libre enregistrée par l’élève pour cette leçon. Les réponses aux exercices oraux sont dans l’onglet Pratique.",
    "noAudio": "Aucun audio soumis."
  },
  "charts": {
    "metrics": [
      {
        "label": "Score",
        "note": "Note attribuée à chaque leçon sur dix."
      },
      {
        "label": "Vous parlez",
        "note": "Votre part de parole. Elle augmente avec la confiance."
      },
      {
        "label": "Rythme",
        "note": "Mots par minute lorsque vous parliez."
      },
      {
        "label": "Réflexion",
        "note": "Temps avant de répondre. Plus court = réponse plus fluide."
      },
      {
        "label": "Vocabulaire",
        "note": "Tous les mots vus en leçon, cumulés."
      }
    ],
    "nothingYet": "Rien d’enregistré pour l’instant.",
    "sinceLesson": "depuis la leçon {n}",
    "trendLater": "Une tendance apparaît après votre prochaine leçon."
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
    "removeRange": "Supprimer la plage",
    "couldNotSave": "Impossible d’enregistrer",
    "saveChanges": "Enregistrer les modifications",
    "defaultsTitle": "Paramètres par défaut des leçons",
    "defaultsDesc": "Durée et délai d’ouverture des réservations.",
    "lessonName": "Nom de la leçon",
    "lessonNamePlaceholder": "Cours de langue",
    "lessonLength": "Durée de la leçon (min)",
    "slotInterval": "Intervalle (min)",
    "minNotice": "Préavis (heures)",
    "bufferBefore": "Tampon avant (min)",
    "bufferAfter": "Tampon après (min)",
    "maxPerDay": "Max leçons / jour",
    "bookingWindow": "Fenêtre de réservation (jours)",
    "title": "Disponibilité",
    "copyMon": "Copier lun → jours ouvrés",
    "copyMonTitle": "Copier les horaires du lundi sur mar–ven",
    "previewBooking": "Aperçu de la page de réservation ↗",
    "unavailable": "Indisponible",
    "dateOverrides": "Exceptions de date"
  },
  "recordings": {
    "eyebrow": "Aperçu",
    "title": "Leçons & bilans",
    "settings": "Paramètres",
    "yourStudents": "Vos élèves",
    "publishedTitle": "Leçons publiées",
    "publishedDesc": "Déjà accessibles à vos élèves, de la plus récente à la plus ancienne. Les brouillons attendent dans la file au-dessus.",
    "nothingPublished": "Rien publié pour l’instant",
    "untitled": "Leçon sans titre",
    "published": "Publié",
    "draft": "Brouillon",
    "summaryAria": "Résumé de la leçon",
    "students": "Élèves",
    "changedMind": "Vous avez changé d’avis ?",
    "connectCalendar": "Connecter un agenda"
  },
  "lessonRow": {
    "joinCall": "Rejoindre l’appel ↗",
    "viewRecap": "Voir le bilan",
    "reviewRecap": "Relire le bilan",
    "noLink": "Aucun lien",
    "eyebrow": "Relire avant publication",
    "recapTitle": "{title} · Bilan de leçon",
    "closeAria": "Fermer la relecture du bilan",
    "draftBanner": "Brouillon IA — vérifiez le contenu avant que l’élève ne le reçoive.",
    "score": "Score",
    "studentTalk": "Paroles élève",
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
    "loadFailed": "Impossible de charger la disponibilité.",
    "bookingFailed": "Échec de la réservation.",
    "bookingFailedRetry": "Réservation échouée — réessayez.",
    "eyebrow": "Planifier une leçon",
    "title": "Trouvez un créneau qui convient",
    "sub": "Choisissez un jour, puis une heure. Confirmation et lien de réunion envoyés par email.",
    "booked": "C’est réservé !",
    "invite": "Une invitation calendrier est en route vers {email}.",
    "openMeeting": "Ouvrir le lien de la réunion",
    "noCalendar": "Disponibilité non accessible. L’agenda est-il connecté ?",
    "noTimes": "Aucun créneau ouvert dans les 30 prochains jours.",
    "pickDay": "Choisir un jour",
    "pickDayHint": "Les jours avec un point ont des créneaux ouverts.",
    "yourDetails": "Vos coordonnées",
    "confirmAt": "Confirmer {time}",
    "yourName": "Votre nom",
    "namePlaceholder": "Jane Dupont",
    "yourEmail": "Votre email",
    "emailPlaceholder": "vous@email.com",
    "booking": "Réservation…",
    "bookAt": "Réserver · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "Aperçu",
        "body": "Votre base. Les bilans apparaissent ici pour relecture, et vos dernières leçons s’empilent dessous."
      },
      {
        "title": "Élèves",
        "body": "Ajoutez chaque élève ici. Leçons, tests, progression — tout part de cette liste et chacun a son propre portail."
      },
      {
        "title": "Notes",
        "body": "Un clic par leçon : un calendrier mensuel qui fait aussi journal d’enseignement."
      },
      {
        "title": "Vue élève",
        "body": "Exactement ce que voit l’élève, à vos couleurs — noms, sections, etc. C’est le vrai portail."
      },
      {
        "title": "Paiements",
        "body": "Consignez les paiements de chaque élève et pour combien de leçons cela couvre. Le solde baisse au fil des bilans envoyés."
      },
      {
        "title": "Paramètres",
        "body": "Votre agenda, l’enregistreur, et votre compte. Le guide se trouve ici, si besoin ultérieurement."
      }
    ],
    "skip": "Ignorer la visite"
  },
  "languages": {
    "couldNotSave": "Impossible d’enregistrer",
    "title": "Vos langues",
    "desc": "Ce que vous enseignez, et la langue parlée dans vos leçons. Les nouveaux élèves commencent avec ces réglages.",
    "youTeach": "Langue enseignée",
    "spokenIn": "Langue parlée en cours",
    "fitTitle": "Comment s’articulent les langues",
    "fitDesc": "Trois paramètres, trois rôles distincts.",
    "fitLearning": "**La langue “Apprise” de chaque élève** détermine le contenu des bilans et des tests — {n} langues possibles, du japonais à l’arabe. Paramétrable à l’ajout, modifiable plus tard sur la page de l’élève.",
    "fitExplained": "**La langue “Explications” de chaque élève** détermine la langue dans laquelle sont rédigés les bilans et instructions des tests — anglais par défaut, modifiable sur la page de l’élève.",
    "fitSpoken": "**La langue “Parlée en cours” de chaque élève** : celle que reconnaît le transcripteur pendant la leçon. Suit le choix par défaut jusqu’à modification sur la page élève — l’enregistreur ne reposera plus la question à chaque leçon."
  },
  "notes": {
    "pickStudent": "Choisir un élève",
    "empty": "La note est vide",
    "couldNotSave": "Impossible d’enregistrer la note",
    "confirmDelete": "Supprimer cette note ?",
    "hoursTaught": "Heures enseignées",
    "recapsPublished": "Bilans publiés",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Pas encore d’élève",
    "student": "Élève",
    "addNote": "Ajouter une note",
    "newNote": "Nouvelle note",
    "editNote": "Modifier la note"
  },
  "exercises": {
    "none": "Aucun exercice pour l’instant — ajoutez-en ci-dessous.",
    "instruction": "Consigne",
    "instructionPlaceholder": "Ce à quoi l’élève doit répondre",
    "focus": "Point visé",
    "focusPlaceholder": "Ce que travaillent les phrases",
    "sentence": "Phrase",
    "meaning": "Sens",
    "removeSentence": "Supprimer la phrase",
    "removeOption": "Enlever cette option",
    "questionTarget": "Question (langue cible)",
    "question": "Question"
  },
  "payments": {
    "selectStudent": "Sélectionner un élève",
    "amountTooLow": "Indiquez un montant supérieur à zéro",
    "saveFailed": "Enregistrement échoué",
    "thisMonth": "Ce mois-ci",
    "receivedAllTime": "Reçu tout le temps",
    "outstanding": "En attente",
    "currency": "Devise",
    "students": "Élèves",
    "prevMonth": "Mois précédent",
    "nextMonth": "Mois suivant",
    "today": "Aujourd’hui",
    "noStudents": "Pas encore d’élève",
    "student": "Élève",
    "recent": "Paiements récents",
    "newPayment": "Nouveau paiement",
    "editPayment": "Modifier paiement",
    "selectPlaceholder": "Sélectionner…",
    "amount": "Montant ({symbol})",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "covers": "Ce que cela couvre",
    "coversPlaceholder": "ex. forfait juillet — 4 leçons",
    "paymentDate": "Date de paiement",
    "dueDate": "Date d’échéance",
    "lessonsCovered": "Leçons incluses",
    "lessonsPlaceholder": "ex. 4",
    "method": "Moyen",
    "methodPlaceholder": "Virement, Espèces, PayPal…",
    "confirmDelete": "Supprimer ce paiement ?"
  },
  "recapReview": {
    "vocab": "Vocabulaire",
    "summary": "Résumé",
    "summaryPlaceholder": "Résumé de la leçon…",
    "sectionTitle": "Titre de la section",
    "sectionContent": "Contenu de la section…",
    "removeSection": "Retirer la section",
    "homeworkTask": "Consigne de devoir",
    "noteTitle": "Votre note à l’élève",
    "notePlaceholder": "Note personnelle à l’élève…"
  },
  "connectors": {
    "googleName": "Google Agenda",
    "googleDesc": "Lit vos leçons et ajoute les réservations directement sur votre agenda.",
    "connect": "Connecter",
    "permissionNeeded": "Permission requise",
    "reconnect": "Reconnecter",
    "disconnect": "Déconnecter",
    "zoomDesc": "Crée une salle Zoom unique pour chaque leçon réservée.",
    "comingSoon": "Bientôt disponible",
    "stripeName": "Stripe",
    "stripeDesc": "Encaissez les paiements par carte pour vos forfaits de cours — versements directement sur votre compte."
  },
  "student": {
    "notJoined": "Invité — pas encore inscrit",
    "avgScore": "Moy. score",
    "latestTalk": "Dernière expression",
    "vocabItems": "Éléments de vocabulaire",
    "creditsLeft": "{left} leçons restantes / {bought} achetées",
    "creditsOneLeft": "1 leçon restante / {bought} achetées",
    "noCredits": "Aucune leçon achetée",
    "managePayments": "Gérer les paiements →",
    "lessonsTitle": "Leçons & bilans",
    "noLessons": "Aucune leçon pour l’instant",
    "noLessonsSub": "Les leçons enregistrées pour cet élève apparaîtront ici.",
    "testsTitle": "Tests de pratique",
    "noTests": "Aucun test pour l’instant"
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
    "learning": "Apprentissage",
    "choose": "Choisir…",
    "recapLanguage": "Langue du bilan"
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
    "fixInSettings": "Corriger dans Paramètres",
    "nothingOn": "Rien le {day}.",
    "noLessonsThatDay": "Aucune leçon prévue ce jour.",
    "agendaClear": "Votre agenda est vide.",
    "noUpcoming": "Aucune leçon à venir sur cet agenda."
  },
  "forgot": {
    "title": "Réinitialisez votre mot de passe",
    "lead": "Saisissez l’adresse email utilisée à l’inscription et nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    "send": "Envoyer le lien",
    "sending": "Envoi…",
    "sent": "Si {email} a un compte, un lien de réinitialisation a été envoyé. Ouvrez l’email et suivez le lien pour choisir un nouveau mot de passe — le lien expire au bout d’une heure.",
    "spam": "Rien reçu ? Vérifiez vos spams, ou réessayez avec votre adresse d’inscription.",
    "remembered": "Vous l’avez retrouvé ?",
    "backToSignIn": "Retour à la connexion"
  },
  "reset": {
    "tooShort": "Votre nouveau mot de passe doit contenir au moins 6 caractères.",
    "mismatch": "Les deux mots de passe ne correspondent pas — vérifiez-les.",
    "samePassword": "C’est le même mot de passe — choisissez-en un nouveau.",
    "saveFailed": "Impossible d’enregistrer ce mot de passe. Réessayez.",
    "title": "Choisissez un nouveau mot de passe",
    "expired": "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau et recommencez.",
    "noToken": "Cette page n’est accessible que via le lien reçu dans l’email de réinitialisation. Demandez-en un et nous vous l’enverrons.",
    "lead": "Choisissez un nouveau mot de passe pour votre compte. Vous serez connecté dès qu’il est enregistré.",
    "newPassword": "Nouveau mot de passe",
    "repeat": "Répétez-le"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "Moyenne",
        "sub": "Sur 10, pour chaque leçon notée."
      },
      {
        "label": "Part de parole",
        "sub": "Temps pendant lequel l'élève parle dans la leçon."
      },
      {
        "label": "Vitesse orale",
        "sub": "Mots par minute lorsqu’il parle. Une hausse indique plus de fluidité."
      },
      {
        "label": "Temps de réflexion",
        "sub": "Secondes entre votre fin de phrase et son début. Un silence long n’est pas un problème."
      },
      {
        "label": "Mots par prise de parole",
        "sub": "Quantité de mots par intervention. De courtes prises rapides équivalent à une question/réponse, pas une conversation."
      },
      {
        "label": "Mots bouche-trou",
        "sub": "“Euh”, “ben” par leçon. À mettre en regard du rythme — rapide + beaucoup d’hésitations ≠ lent et propre."
      }
    ],
    "totalLessons": "Total de leçons",
    "acrossStudents": "sur {n} élèves",
    "mostActive": "Le plus actif",
    "nLessons": "{n} leçons",
    "nothingRecorded": "rien enregistré encore",
    "vocabMet": "Vocabulaire vu",
    "wordsAcross": "mots sur l’ensemble des leçons",
    "notSeenLately": "Pas vu récemment",
    "everyoneCurrent": "tout le monde est à jour",
    "measureAria": "Mesure",
    "nothingMeasured": "Aucune donnée pour l’instant — elles s’ajoutent à mesure que les leçons se déroulent.",
    "perStudent": "{measure} — par élève",
    "perStudentSub": "Ses propres leçons dans l’ordre. La flèche va de la première à la dernière.",
    "prevMeasure": "Mesure précédente",
    "nextMeasure": "Mesure suivante"
  },
  "test": {
    "heading": "Test d’entraînement {level}",
    "published": "Publié",
    "draftOnlyYou": "Brouillon — visible uniquement par vous",
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
    "title": "Vos {n} premiers bilans sont offerts.",
    "sub": "Installez l’enregistreur, faites une leçon ; voyez-la revenir rédigée — pas de CB, aucun engagement. Quand vous êtes convaincu, choisissez un forfait.",
    "showMe": "Me faire visiter",
    "exploreMyself": "Je découvre seul",
    "setUpFirst": "Ou configurer l’enregistreur d’abord →"
  },
  "reviewQueue": {
    "title": "Bilans à relire",
    "desc": "Crée à partir de vos enregistrements. Rien n’arrive à l’élève tant que vous n’avez pas validé.",
    "moveFailed": "Impossible de déplacer ce bilan",
    "serverUnreachable": "Serveur inaccessible",
    "rebuildFailed": "Impossible de régénérer ce bilan",
    "deleteFailed": "Impossible de supprimer le bilan"
  },
  "recorderMissing": {
    "title": "Ajoutez l’enregistreur pour commencer",
    "body": "Lesson Studio crée les bilans à partir de vos leçons, avec l’extension Chrome pour tout enregistrer. Tant qu’elle n’est pas installée et activée, rien n’arrivera ici — aucune autre méthode pour renseigner une leçon."
  },
  "pending": {
    "chooseStudent": "Choisissez d’abord l’élève concerné.",
    "fileFailed": "Impossible de classer cet enregistrement.",
    "confirmDelete": "Supprimer cet enregistrement ? L’audio sera effacé.",
    "studentAria": "Élève",
    "choosePlaceholder": "Choisir un élève",
    "filing": "Classement…",
    "buildRecap": "Générer le bilan"
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
    "needLesson": "Publiez un bilan de leçon d’abord",
    "title": "Générer un test de pratique",
    "explanationLanguage": "Langue des explications"
  },
  "guide": {
    "eyebrow": "Enregistreur de leçon",
    "title": "Enregistrez une leçon, obtenez un bilan",
    "sub": "Extension Chrome qui enregistre votre onglet de cours et le micro sur deux pistes séparées, puis prépare le brouillon de bilan ici. Aucun robot ne rejoint l’appel, rien n’est installé chez l’élève — cela fonctionne sur Preply, italki, Google Meet, Zoom, tout ce qui fonctionne dans un onglet.",
    "step1Title": "Installez-le depuis le Chrome Web Store",
    "step1Body": "Un clic, rien à configurer. Épinglez-le dans la barre d’outils — cliquez sur le puzzle à côté de l’adresse puis sur la punaise — le K sera toujours accessible pendant le cours.",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Ajouter à Chrome",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "betaNote": "**Vous avez testé la bêta ?** Supprimez d’abord cette copie ({path} → Supprimer). Un seul enregistreur actif par onglet.",
    "step2Title": "Connectez-vous — une fois",
    "step2Body": "Ouvrez l’extension et connectez-vous avec le même email et mot de passe. C’est tout : elle sait qui vous êtes, quels sont vos élèves, et quelle langue vous enseignez.",
    "signIn": "Se connecter",
    "step3Title": "Ouvrez l’onglet leçon et lancez l’enregistrement",
    "step3Body": "Allez dans l’onglet utilisé pour la leçon — la salle Preply, l’appel Meet, etc. Cliquez sur le K, choisissez l’élève, démarrez l’enregistrement. La première fois, Chrome demande l’accès micro : autorisez. Fermez la fenêtre puis enseignez normalement — l’enregistrement continue.",
    "studentLabel": "Élève :",
    "step4Title": "Arrêtez et envoyez",
    "step4Body": "À la fin de la leçon, ouvrez de nouveau, appuyez sur **Arrêter l’enregistrement**, puis **Envoyer à Lesson Studio**. Rien n’est envoyé tant que vous ne confirmez pas.",
    "sendButton": "Envoyer à Lesson Studio →",
    "step5Title": "Relisez le bilan généré",
    "step5Body": "Quelques minutes plus tard, le brouillon attend dans **Bilans à relire** sur l’aperçu — résumé, vocabulaire, devoirs, dans la langue de l’élève. Éditez, envoyez : il est publié sur son portail.",
    "reviewAndSend": "Relire & envoyer",
    "consentTitle": "Avant d’enregistrer quelqu’un",
    "consentBody": "Prévenez votre élève que la séance est enregistrée et obtenez son accord. Certains pays exigent l’accord de tous les participants, et Preply/italki ont leurs propres règles — consultez-les avant d’en faire une habitude.",
    "dataBody": "L’enregistreur capture les deux voix. Rien n’est envoyé tant que vous n’appuyez pas sur **Envoyer à Lesson Studio**, l’audio sert uniquement à rédiger le bilan et les fichiers sont supprimés 30 jours plus tard. Plus de détails dans notre {policy}.",
    "privacyLink": "politique de confidentialité"
  },
  "lessonExercises": {
    "none": "Aucun exercice de pratique pour cette leçon.",
    "recordReading": "Enregistrez-vous en lisant ces phrases",
    "notRecorded": "Pas encore enregistré."
  },
  "lessonTools": {
    "lessonIsWith": "Cette leçon est avec",
    "notLinked": "Non lié (test / aucun élève)",
    "hint": "Liez un élève pour que le bilan lui soit transmis. Laissez non lié pour un appel test."
  },
  "memo": {
    "back15": "Retour de 15 sec",
    "forward15": "Avancer de 15 sec",
    "seek": "Aller à"
  },
  "joinInvalid": {
    "title": "Ce lien n’est pas valide",
    "body": "Il a peut-être déjà servi ou votre enseignant a pu le remplacer. Demandez-lui un nouveau lien.",
    "goSignIn": "Aller à la connexion"
  },
  "dashboard": {
    "students": "Élèves",
    "withLogin": "Avec login",
    "lessonsRecorded": "Leçons enregistrées",
    "noStudents": "Pas encore d’élève",
    "notJoined": "Invité — pas encore inscrit",
    "lessons": "Leçons",
    "overview": "Aperçu"
  },
  "misc": {
    "outOfTen": "SUR 10",
    "dashboardBack": "Tableau de bord",
    "backToOverview": "Retour à l’aperçu",
    "recapGone": "Ce bilan n’est plus disponible.",
    "timesShared": "Partages",
    "languageGroup": "Langue",
    "extConfirmReset": "Déconnecter l’enregistreur sur tous les appareils ? L’enregistrement s’arrête partout tant que vous n’êtes pas reconnecté dans l’extension.",
    "extResetFailed": "Impossible de réinitialiser la connexion à l’enregistreur.",
    "extSigningOut": "Déconnexion…",
    "extSignOutEverywhere": "Déconnecter l’enregistreur partout",
    "howTitle": "Comment vos leçons arrivent ici",
    "howLead": "Vous enseignez sur {platform}, donc aucune planification ici. Une leçon entre dans Lesson Studio lorsque son enregistrement y est ajouté.",
    "howSteps": [
      {
        "title": "Enregistrez la leçon",
        "body": "Utilisez l’enregistreur du navigateur ou importez un fichier fourni par la plateforme."
      },
      {
        "title": "Nous créons le bilan",
        "body": "Résumé, vocabulaire, corrections et exercices, rédigés depuis la transcription."
      },
      {
        "title": "Vous relisez et publiez",
        "body": "Modifiez si besoin, puis envoyez : l’élève le voit sur son portail."
      }
    ],
    "instrStudentChose": "Votre élève a choisi cette langue lui-même. Vous pouvez en changer, mais c’est son choix.",
    "instrHint": "Langue des explications des bilans et tests — cliquez pour modifier",
    "matLinkFailed": "Lien non enregistré",
    "matLinksFailed": "Ces liens n’ont pas pu être enregistrés",
    "matAddLink": "Ajouter un lien",
    "confirmDeleteStudent": "Supprimer cet élève et toutes ses leçons ? Action irréversible.",
    "resetPassword": "Réinitialiser le mot de passe",
    "inviteLink": "Lien d’invitation",
    "uploadFailed": "Échec de l’envoi",
    "micBlocked": "Microphone bloqué — autorisez le micro dans le navigateur.",
    "micBlockedBar": "Microphone bloqué — autorisez l’accès micro dans la barre d’adresse et réessayez.",
    "uploadAFile": "Téléverser un fichier",
    "submitToTeacher": "Envoyer à l’enseignant",
    "discardRedo": "Annuler & recommencer",
    "sendToStudent": "Envoyer à l’élève",
    "sendThisAnswer": "Envoyer cette réponse",
    "sentTick": "Envoyé ✓",
    "vocabByLevelAria": "Vocabulaire par niveau",
    "vocabTapHint": "Appuyez sur un niveau pour voir ces mots et leur origine.",
    "firstSeenIn": "Vu d’abord en leçon {n}",
    "firstSeen": "Vu pour la première fois",
    "wordsIntroduced": "Mots introduits",
    "fromTheLesson": "Tiré de la leçon",
    "goAgain": "Recommencer",
    "showWord": "Voir le mot",
    "showMeaning": "Voir le sens",
    "correction": "Correction",
    "correctionsAria": "Corrections",
    "noLessonsYet": "Pas encore de leçons"
  }
} as const
