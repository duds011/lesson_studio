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
    "somethingWrong": "Un problème est survenu. Veuillez réessayer dans un instant."
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "Espace enseignant",
    "overviewAria": "Vue d’ensemble de Lesson Studio",
    "navAria": "Navigation de l’espace enseignant",
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
    "signInSub": "Bon retour. Connectez-vous pour accéder à vos cours, vos progrès et vos comptes rendus.",
    "signInExpired": "Votre session a expiré. Connectez-vous et nous vous ramènerons directement ici.",
    "signInAction": "Connexion",
    "signingIn": "Connexion…",
    "passwordDots": "••••••••",
    "forgotPassword": "Mot de passe oublié ?",
    "newHere": "Nouveau ici ?",
    "createAccountLink": "Créer un compte enseignant",
    "freeToSetUp": "Configuration gratuite, vous pouvez ajouter directement votre premier élève.",
    "studentQuestion": "Vous êtes élève ?",
    "studentAnswer": "Votre enseignant vous envoie un lien d’invitation — ouvrez-le, choisissez votre e-mail et votre mot de passe. Ensuite, connectez-vous ici.",
    "signInHeadline": "Chaque leçon, rédigée.",
    "signInAside": "Lesson Studio transforme chaque heure en compte rendu, graphique de progression et exercices — pour l’enseignant et l’élève.",
    "signUpTitle": "Créer un compte enseignant",
    "signUpSub": "Lancez votre espace Koku Library — pour vos élèves, comptes rendus, réservations et suivi des progrès.",
    "fullNameLabel": "Nom complet",
    "passwordHint": "6 caractères minimum",
    "createAccount": "Créer le compte",
    "creatingAccount": "Création du compte…",
    "createFailed": "Impossible de créer votre compte.",
    "createdNowSignIn": "Compte créé — veuillez vous connecter.",
    "haveAccount": "Vous avez déjà un compte ?",
    "signUpHeadline": "Toute votre activité d’enseignement, réunie.",
    "signUpAside": "Configuration en quelques minutes. Ajoutez un élève, enregistrez la prochaine leçon, et la suite s’organise toute seule."
  },
  "aside": {
    "slides": [
      {
        "title": "La leçon s’écrit toute seule",
        "body": "Une extension Chrome enregistre les deux voix. Le compte rendu revient rédigé — vous relisez puis publiez."
      },
      {
        "title": "Progrès visibles",
        "body": "Scores, temps de parole et vocabulaire suivis d’une leçon à l’autre, sur une page pensée pour l’élève."
      },
      {
        "title": "Quelle que soit la langue enseignée",
        "body": "Japonais, français, coréen, espagnol et une trentaine d’autres — corrigés dans la langue du cours, expliqués dans celle de l’élève."
      },
      {
        "title": "S’exercer sur leurs propres mots",
        "body": "Fiches et tests oraux à partir du vocabulaire issu de la séance."
      },
      {
        "title": "Un portail élève à votre nom",
        "body": "Vos couleurs, vos formulations, et seulement les sections utiles à votre enseignement."
      }
    ]
  },
  "onboarding": {
    "steps": [
      "Vos leçons",
      "Où vous enseignez",
      "Votre agenda",
      "Vue côté élève",
      "Votre enregistreur"
    ],
    "sideTitle": "Configurons votre studio.",
    "sideBody": "Quatre étapes rapides et vos élèves disposent de leur portail.",
    "stepCount": "Étape {n} sur {total}",
    "choose": "choisir…",
    "continueAction": "Continuer",
    "finish": "Terminer la configuration",
    "finishing": "Finalisation…",
    "couldNotSave": "Impossible d’enregistrer",
    "couldNotFinish": "Impossible de terminer",
    "pickTeaching": "Choisissez la langue que vous enseignez.",
    "pickSpoken": "Choisissez la langue parlée pendant vos cours.",
    "pickCalendar": "Indiquez si vos leçons figurent sur un agenda.",
    "pickPortalName": "Nommez le portail — ce sera visible par vos élèves.",
    "teachAria": "Langue enseignée",
    "iTeach": "J’enseigne",
    "teachHint": "Les comptes rendus et exercices seront créés pour cette langue. C’est le choix par défaut pour chaque élève ajouté — il reste possible de modifier individuellement ensuite.",
    "spokenAria": "Langue parlée lors des cours",
    "spokenIn": "mes cours sont principalement en",
    "spokenHint": "Souvent ce n’est pas la langue en apprentissage — un débutant suit surtout dans la langue que vous partagez. C’est celle qui sera écoutée par l’enregistreur.",
    "timezone": "Votre fuseau horaire",
    "platformTitle": "Où avez-vous cours avec vos élèves ?",
    "platformLead": "Sur Meet ou Zoom, le lien est créé lors de la réservation. Sur une plateforme, la leçon a déjà un salon, nous récupérons alors ce lien.",
    "zoomLater": "Connecter Zoom plus tard dans Paramètres",
    "stayOutTitle": "Nous restons en dehors du cours en direct",
    "stayOutBody": "Pas de lien créé, ni de bot. Vous enregistrez vous-même le cours puis comptes rendus, vocabulaire et exercices sont générés à partir de l’enregistrement — tout ce que voit l’élève reste inchangé.",
    "calendarTitle": "Où figurent vos leçons ?",
    "calendarLeadExternal": "Certains enseignants sur {platform} utilisent encore Google Agenda, d’autres restent sur la plateforme. Votre choix modifie l’affichage de l’espace.",
    "calendarLead": "Si vos élèves sont présents sur Google Agenda, nous pouvons lire leur planning, gérer les réservations et envoyer l’enregistreur. Si vous planifiez ailleurs, aucune action de notre part.",
    "googleConnected": "Agenda Google connecté",
    "googleConnectedSub": "Vous pouvez choisir l’agenda où se trouvent vos cours dans Paramètres.",
    "connectGoogle": "Connecter Google Agenda",
    "connectGoogleFine": "Vous serez redirigé(e) vers la page d’autorisation Google, puis ramené ici. Vous pouvez poursuivre sans, mais réservations et enregistreurs automatiques restent désactivés tant que ce n’est pas connecté.",
    "recordTitle": "Enregistrez le cours",
    "recordBody": "Dans la salle de votre choix, capturez la séance et transmettez l’enregistrement à Lesson Studio.",
    "reviewTitle": "Relisez le compte rendu",
    "reviewBody": "Il rejoint votre file de relecture comme toute autre leçon. Publiez-le, l’élève y accède.",
    "noCalendarFine": "Pas d’agenda, pas de page de réservation, pas de rappels — votre espace s’ouvre directement sur les leçons et comptes rendus. Vous pouvez changer ce choix à tout moment dans Paramètres.",
    "brandTitle": "Personnalisez",
    "brandLead": "Choisissez une couleur et un nom pour le portail où vos élèves se connectent. Tout pourra être ajusté plus tard.",
    "portalNameLabel": "Nom du portail élève",
    "portalNamePlaceholder": "exemple : Sakura Japanese",
    "portalNameFine": "C’est le nom tout en haut du portail élève et sur le lien d’invitation. Le vôtre, pas le nôtre.",
    "accent": "Couleur d’accent",
    "previewTagline": "Apprenez aujourd’hui, réussissez demain !",
    "recorderTitle": "Installer l’enregistreur",
    "recorderLead": "C’est la partie clé : une extension Chrome qui enregistre vos cours et rédige le compte rendu. Aucun bot ne rejoint l’appel, rien n’est installé côté élève.",
    "recorderStep1Bold": "Ajoutez-le depuis le Chrome Web Store",
    "recorderStep1": " — un clic, puis épinglez-le dans votre barre.",
    "recorderStep2Bold": "Connectez-vous dans l’extension",
    "recorderStep2": " avec ce même e-mail et mot de passe. Rien à recopier.",
    "recorderStep3Bold": "Enregistrez une séance",
    "recorderStep3": " : choisissez l’élève, lancez puis arrêtez à la fin.",
    "addToChrome": "Ajouter à Chrome — gratuit ↗",
    "recorderFinePre": "Vous préférez un guide complet (autorisations micro, ce qui est enregistré) ? Rendez-vous sur le ",
    "recorderFineLink": "guide d’installation",
    "recorderFineMid": " — également dans ",
    "recorderFineBold": "Paramètres → Enregistreur de leçon",
    "recorderFinePost": " quand vous serez prêt."
  }
} as const
