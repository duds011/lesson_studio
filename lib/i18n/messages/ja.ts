/**
 * Japanese — generated from messages/en.ts by scripts/translate.mjs.
 *
 * Edit en.ts and re-run rather than editing this file: a hand-fix here is
 * lost the next time the English changes, and the shape is checked against
 * English on the way in so the two cannot drift apart silently.
 */
import type { Messages } from "./en"

export const ja: Messages = {
  "common": {
    "save": "保存",
    "saving": "保存中…",
    "saved": "保存済み",
    "cancel": "キャンセル",
    "close": "閉じる",
    "delete": "削除",
    "edit": "編集",
    "back": "戻る",
    "next": "次へ",
    "done": "完了",
    "loading": "読み込み中…",
    "retry": "再試行",
    "signOut": "サインアウト",
    "somethingWrong": "問題が発生しました。しばらくしてから再試行してください。"
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "講師用ワークスペース",
    "overviewAria": "Lesson Studioの概要",
    "navAria": "講師用ワークスペースナビゲーション",
    "openMenu": "メニューを開く",
    "closeMenu": "メニューを閉じる",
    "expand": "ナビゲーションを展開",
    "collapse": "ナビゲーションを折りたたむ",
    "sectionWorkspace": "ワークスペース",
    "sectionManage": "管理",
    "overview": "概要",
    "students": "生徒",
    "notes": "メモ",
    "materials": "教材",
    "studentView": "生徒用表示",
    "payments": "支払い",
    "availability": "予約設定",
    "settings": "設定",
    "calendarConnected": "カレンダー接続済み",
    "setupNeeded": "設定が必要です",
    "recordingsOnly": "録音のみ",
    "studentPortal": "生徒用ポータル"
  },
  "auth": {
    "language": "言語",
    "emailLabel": "メールアドレス",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "パスワード",
    "signInTitle": "サインイン",
    "signInSub": "お帰りなさい。レッスンや進捗、レッスンまとめを確認できます。",
    "signInExpired": "セッションの有効期限が切れました。再度サインインすると、直前の画面へ戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めての方はこちら",
    "createAccountLink": "講師アカウント作成",
    "freeToSetUp": "無料ですぐに始められます。生徒の追加もすぐにできます。",
    "studentQuestion": "生徒の方ですか？",
    "studentAnswer": "講師から招待リンクが届きます。リンクを開いて、メールアドレスとパスワードを設定してください。その後はここからサインインできます。",
    "signInHeadline": "毎回のレッスンを書き起こし。",
    "signInAside": "Lesson Studio は、レッスン1時間をまとめ、進捗表や練習問題にします。講師と生徒それぞれに提供されます。",
    "signUpTitle": "講師アカウント作成",
    "signUpSub": "Koku Libraryのワークスペースを作成して、生徒用まとめや予約、進捗管理を始めましょう。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウント作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウントを作成できませんでした。",
    "createdNowSignIn": "アカウントが作成されました。サインインしてください。",
    "haveAccount": "すでにアカウントをお持ちですか？",
    "signUpHeadline": "指導すべてを一ヶ所で。",
    "signUpAside": "数分で始められます。生徒を追加し、レッスンを録音すると自動で記録されます。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンのまとめが自動で作成されます",
        "body": "Chrome拡張機能が両方の音声を録音します。まとめ原稿が返ってくるので、編集して公開します。"
      },
      {
        "title": "進捗が目で見える形に",
        "body": "得点、発話量、語彙をレッスンごとに記録。生徒用のページで確認できます。"
      },
      {
        "title": "どんな言語でも対応",
        "body": "日本語、フランス語、韓国語、スペイン語ほか30種類以上。レッスンの言語で訂正し、生徒の母語で解説します。"
      },
      {
        "title": "生徒自身の言葉で練習",
        "body": "その時間に出てきた語彙から単語カードや会話テストを作成します。"
      },
      {
        "title": "あなたの名前入り生徒用ポータル",
        "body": "色や言葉遣いも自由に。教える内容だけを表示します。"
      }
    ]
  }
} as const
