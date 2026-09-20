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
    "saved": "保存しました",
    "cancel": "キャンセル",
    "close": "閉じる",
    "delete": "削除",
    "edit": "編集",
    "back": "戻る",
    "next": "次へ",
    "done": "完了",
    "loading": "読み込み中…",
    "retry": "もう一度試す",
    "signOut": "サインアウト",
    "somethingWrong": "問題が発生しました。少し待ってから再度お試しください。"
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "講師用ワークスペース",
    "overviewAria": "Lesson Studio の概要",
    "navAria": "講師用ワークスペースナビゲーション",
    "openMenu": "メニューを開く",
    "closeMenu": "メニューを閉じる",
    "expand": "ナビゲーションを展開",
    "collapse": "ナビゲーションを折りたたむ",
    "sectionWorkspace": "ワークスペース",
    "sectionManage": "管理",
    "overview": "概要",
    "students": "生徒",
    "notes": "ノート",
    "materials": "教材",
    "studentView": "生徒ビュー",
    "availability": "空き状況",
    "settings": "設定",
    "calendarConnected": "カレンダー接続済み",
    "setupNeeded": "セットアップが必要です",
    "recordingsOnly": "録音のみ",
    "studentPortal": "生徒ポータル"
  },
  "platforms": [
    "Google Meet",
    "Zoom",
    "Preply",
    "italki",
    "他のプラットフォーム"
  ],
  "calendarModes": [
    {
      "label": "はい — Googleカレンダーにあります",
      "hint": "レッスンを読み込み、予約受付、録音のお知らせを送ります"
    },
    {
      "label": "いいえ — 他でスケジュールしています",
      "hint": "レッスンは録音として届きます。カレンダー機能は表示されません"
    }
  ],
  "auth": {
    "language": "言語",
    "emailLabel": "メールアドレス",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "パスワード",
    "signInTitle": "サインイン",
    "signInSub": "お帰りなさい。レッスン、進捗、要約を確認できます。",
    "signInExpired": "セッションがタイムアウトしました。サインイン後すぐ元の画面へ戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めてご利用ですか？",
    "createAccountLink": "講師アカウント作成",
    "freeToSetUp": "セットアップは無料です。すぐに生徒を追加できます。",
    "studentQuestion": "生徒の方ですか？",
    "studentAnswer": "講師から招待リンクを受け取ります。開いて、ご自身のメール・パスワードを決めてください。その後、同じ場所からサインインします。",
    "signInHeadline": "すべてのレッスンを書き起こし。",
    "signInAside": "Lesson Studio は、1時間ごとに要約・進捗・練習問題を作成します。担当した講師と、受けた生徒用です。",
    "signUpTitle": "講師アカウントを作成",
    "signUpSub": "Koku Library のワークスペースを作成し、生徒管理・レッスン要約・予約・進捗管理ができます。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウント作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウントを作成できませんでした。",
    "createdNowSignIn": "アカウント作成完了 — サインインしてください。",
    "haveAccount": "既にアカウントをお持ちですか？",
    "signUpHeadline": "教える仕事を、ひとつに。",
    "signUpAside": "数分で始められます。生徒追加・レッスン録音をすると、その後は自動で整います。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンの記録が自動で書かれる",
        "body": "Chrome拡張が両者の音声を録音。要約は下書きで戻ります—編集して公開できます。"
      },
      {
        "title": "見える進捗",
        "body": "スコア・発話時間・語彙を毎回記録。生徒専用ページに反映されます。"
      },
      {
        "title": "どんな言語のレッスンでも",
        "body": "日本語、フランス語、韓国語、スペイン語など30言語以上。レッスンの言語で表記、学習者の理解できる言語で説明します。"
      },
      {
        "title": "生徒の発言から練習問題",
        "body": "その時間に出た語彙からフラッシュカードや口頭テストを作成。"
      },
      {
        "title": "名前入りの生徒ポータル",
        "body": "色や表現は自由、必要なセクションだけを使えます。"
      }
    ]
  },
  "onboarding": {
    "steps": [
      "レッスン内容",
      "生徒との場所",
      "カレンダー連携",
      "生徒ビュー",
      "録音ツール"
    ],
    "sideTitle": "スタジオを設定しましょう。",
    "sideBody": "4つのステップで、生徒用ポータルが作れます。",
    "stepCount": "ステップ {n}/{total}",
    "choose": "選択…",
    "continueAction": "次へ",
    "finish": "セットアップを終了",
    "finishing": "終了中…",
    "couldNotSave": "保存できませんでした",
    "couldNotFinish": "完了できませんでした",
    "pickTeaching": "教える言語を選んでください。",
    "pickSpoken": "レッスンで主に使う言語を選んでください。",
    "pickCalendar": "レッスンがカレンダーにあるか教えてください。",
    "pickPortalName": "ポータルの名前を決めてください。生徒に表示されます。",
    "teachAria": "教える言語",
    "iTeach": "教える言語:",
    "teachHint": "要約・練習問題はこの言語で作られます。追加した生徒のデフォルト値ですが、生徒ごとに後から変更可能です。",
    "spokenAria": "レッスンで使う言語",
    "spokenIn": "レッスンは主に",
    "spokenHint": "学習言語とは限りません。初心者用の授業は共通言語で進行することも多いです。録音はこの言語で認識します。",
    "timezone": "タイムゾーン",
    "platformTitle": "どこで生徒と会いますか？",
    "platformLead": "MeetやZoomなら予約時にリンクを作成します。マーケットプレイス内なら既存の部屋リンクをそのまま利用します。",
    "zoomLater": "Zoomはあとから設定可能です",
    "stayOutTitle": "レッスン自体には介入しません",
    "stayOutBody": "リンク作成やボットは送りません。録音したファイルから要約・語彙・練習を作成します。生徒側の利用は変わりません。",
    "calendarTitle": "レッスンの管理場所",
    "calendarLeadExternal": "一部の{platform}講師はGoogleカレンダーを並行利用しています。選択内容によって表示内容が変わります。",
    "calendarLead": "生徒がGoogleカレンダーにいる場合、予定を自動で読み取り予約や録音も手配します。他で管理ならこちらには干渉しません。",
    "googleConnected": "Googleカレンダー接続済み",
    "googleConnectedSub": "どのカレンダーを使うかは設定から選べます。",
    "connectGoogle": "Googleカレンダーと連携",
    "connectGoogleFine": "Googleの認証画面へ移動し、完了後戻ります。連携しなくても使えますが、予約や自動録音はオフのままです。",
    "recordTitle": "レッスンを録音",
    "recordBody": "どの部屋でも録音して、Lesson Studioに提出してください。",
    "reviewTitle": "要約を確認",
    "reviewBody": "他のレッスンと同様、レビューキューに入ります。公開すると生徒に届きます。",
    "noCalendarFine": "カレンダー・予約ページ無し、催促もありません。ワークスペースはレッスンと要約がメインとなります。設定でいつでも変更可能です。",
    "brandTitle": "あなたのものにする",
    "brandLead": "生徒がサインインするポータルの色と名前を決めましょう。後から細部も編集できます。",
    "portalNameLabel": "生徒ポータル名",
    "portalNamePlaceholder": "例）Sakura Japanese",
    "portalNameFine": "生徒ポータル上部や招待案内に表示されます。あなたのスタジオ名です。",
    "accent": "アクセントカラー",
    "previewTagline": "今日学び、明日につなげよう！",
    "recorderTitle": "録音ツールをインストール",
    "recorderLead": "録音と要約作成を担うChrome拡張機能です。ボットは会議に入りませんし、生徒側にインストールも不要です。",
    "recorderStep1": "**Chromeウェブストアから追加** — 1クリック後、ツールバーにピン留めしてください。",
    "recorderStep2": "**拡張機能内でサインイン** — 同じメール・パスワードを使います。持ち越しはありません。",
    "recorderStep3": "**レッスンを録音** — 生徒を選び、録音開始、終了したら停止です。",
    "addToChrome": "Chromeに追加 — 無料 ↗",
    "recorderFine": "全手順（マイク許可や録音範囲など）は{guide}に掲載。**設定 → レッスン録音ツール**からも確認できます。",
    "recorderFineLink": "セットアップガイド"
  },
  "overview": {
    "eyebrow": "概要",
    "title": "あなたのレッスンカレンダー",
    "manageConnections": "接続を管理",
    "fixInSettings": "設定で修正",
    "summaryAria": "レッスン要約",
    "upcoming": "今後のレッスン",
    "drafts": "要確認の下書き",
    "draftsSub": "要約が確認待ちです",
    "published": "公開済み要約",
    "publishedSub": "生徒に送信済み",
    "writeUpsLeft": "残りの要約数",
    "writeUpsAria": "残り要約数 — 追加購入",
    "usageTrial": "{total}件の無料分中{used}件利用",
    "usageBought": "{used}件 作成済み · 有効期限なし",
    "lessonCalendar": "レッスンカレンダー",
    "primaryCalendar": "（メイン）"
  },
  "connect": {
    "title": "Googleカレンダーと連携",
    "body": "カレンダーを連携し、Lesson Studioが今後のレッスン・予約・録音を管理できるようにします。",
    "notConfigured": "Google OAuthがまだ設定されていません。{id} と {secret} を環境変数に追加し再起動してください。",
    "scopeRead": "**カレンダーの読み取り** — レッスンと会議リンクを取得",
    "scopeRecord": "**レッスンの録音** — Lesson Studio拡張で授業録音",
    "scopeRecap": "**要約作成** — AIによる要約をレビュー・共有",
    "continueGoogle": "Googleで続行",
    "fine": "Googleの認証画面へ移動します。後で設定から管理可能です。"
  },
  "settings": {
    "eyebrow": "ワークスペース",
    "title": "設定",
    "sectionsAria": "設定セクション",
    "tabs": [
      "接続",
      "言語",
      "生徒ポータル"
    ],
    "recorderTitle": "レッスン録音ツール",
    "recorderDesc": "Chrome拡張でレッスンを録音し、要約に変換します。{guide}",
    "recorderGuide": "手順ガイド →",
    "replayTourHint": "各ページの用途を忘れた場合、ここから再度チュートリアルを開始できます。",
    "languageTitle": "言語",
    "languageDesc": "このワークスペースの表示言語。要約の記述言語は変わりません—生徒ごとに設定できます。",
    "connectionsTitle": "接続",
    "connectionsDesc": "予約・ミーティング・決済の各ツールを連携します。",
    "livesTitle": "レッスン管理場所",
    "livesDesc": "Googleカレンダー管理なら、予約ページ・空きスケジュール・自動録音機能付き。他で管理の場合、録音ベースで機能します。",
    "calendarTitle": "レッスンカレンダー",
    "calendarDesc": "Lesson Studioが参照すべきレッスンのカレンダーはどれですか？",
    "primaryCalendar": "メインカレンダー",
    "autoSendTitle": "要約の送信",
    "autoSendDesc": "各要約は確認キューで止まります。自動送信にすると、作成と同時に生徒に届きます。後から編集も可能ですが、初版は生徒に表示されます。",
    "autoSendReview": "まず自分で確認",
    "autoSendReviewHint": "要約確認画面で停止",
    "autoSendAuto": "自動的に送る",
    "autoSendAutoHint": "作成直後に生徒へ届く",
    "speakingTitle": "スピーキング課題",
    "speakingDesc": "各要約の最後に、3つのスピーキング課題が入ります。生徒が録音し、回答がレッスンページに集まります。オンにすると録音可能・オフで課題自体がなくなります。",
    "speakingOn": "生徒に録音を許可",
    "speakingOnHint": "レッスンページで再生可能",
    "speakingOff": "課題を出さない",
    "speakingOffHint": "要約は7つの筆記課題のみ",
    "platformTitle": "デフォルト会議プラットフォーム",
    "platformDesc": "予約時に作成されるリンクの種類。マーケットプレイス利用なら最後を選択してください。",
    "meetLabel": "Google Meet",
    "meetHint": "カレンダー上に作成されます",
    "ownLinkLabel": "独自リンクを共有",
    "ownLinkHint": "Preply、italkiや独自ルームなど"
  },
  "billing": {
    "eyebrow": "要約作成",
    "title": "レッスンを購入。いつでも利用可能。",
    "buyMore": "要約を追加購入",
    "once": "一度きり",
    "nWriteUps": "{n}件の要約",
    "packNames": [
      "10レッスン",
      "40レッスン",
      "100レッスン"
    ],
    "neverTitle": "自動更新なし",
    "neverBody": "8月に休講しても、9月まで残っています。有効期限・自動更新・カード情報の保存はありません。",
    "leftTitle": "残り要約数",
    "leftDesc": "要約作成のたびに1件消費。期限切れはありません。自動更新もありません。",
    "ofFree": "無料{total}件中",
    "ofFreeUsed": "無料{total}件中 · {used}件使用",
    "builtSoFar": "これまでに{used}件作成",
    "emptyTrial": "無料分を利用済みです。下記のパック購入で要約作成を継続できます。サブスクリプションも更新期限もありません。",
    "emptyPaid": "残高がありません。下記のパック追加で補充できます。使わなかった分も残ります。",
    "addTitle": "要約を追加",
    "addDesc": "1回払い・自動更新なし。大きいパックは割安ですが、小さいパックでも損はありません。購入分は使うまで有効です。",
    "save": "{pct}%割引",
    "neverExpires": "有効期限なし",
    "buy": "{n}を購入",
    "openingStripe": "Stripeを開いています…",
    "stripeUnreachable": "Stripeに接続できません。少し待って再試行してください。",
    "paidOnce": "カード一括払い。Stripe経由。カード情報は保存されず、追加請求もありません。",
    "packTags": [
      "最初の一歩",
      "安定したスケジュール",
      "人気"
    ]
  },
  "recap": {
    "tabs": [
      "進捗",
      "要約",
      "宿題",
      "語彙"
    ],
    "tabsAria": "要約セクション",
    "eyebrow": "送信前に確認",
    "title": "{name} · レッスン要約",
    "lessonFallback": "レッスン",
    "sub": "各タブを確認後、{first}に送信します。",
    "translate": "説明を翻訳",
    "translateTitle": "生徒の言語に説明文を変換します — 材料やスコアはそのままです",
    "working": "処理中…",
    "rebuild": "録音から再作成",
    "rebuildTitle": "最新のAIと指標で録音から再作成します",
    "rebuilding": "再作成中…",
    "deleteDraft": "下書きを削除",
    "deleting": "削除中…",
    "saveDraft": "下書きを保存",
    "approve": "承認して送信",
    "sending": "送信中…",
    "savedTick": "保存しました ✓",
    "confirmRebuild": "この要約を録音から再作成しますか？要約・各セクション・宿題・流暢さの指標が再生成され、編集内容は破棄されます。",
    "confirmTranslate": "この要約の説明を、生徒に指導する言語に翻訳しますか？例文や引用、スコアは変更しません。",
    "confirmDelete": "{name}の下書き要約を削除しますか？要約確認画面から消え、元に戻せません。",
    "promptLanguage": "この生徒の説明言語が未設定です（生徒ページで設定可）。どの言語に翻訳しますか？",
    "rebuildFailed": "再作成に失敗しました",
    "translationFailed": "翻訳に失敗しました",
    "deleteFailed": "要約を削除できませんでした",
    "savingEdits": "編集内容を保存中…",
    "uploadingMemo": "音声メモをアップロード中…",
    "uploadingFile": "{name}をアップロード中…",
    "attachingMaterials": "教材を添付中…",
    "attachmentFailed": "要約は送信されましたが、添付に失敗しました—レッスンページから再度追加してください。",
    "suggestedScript": "提案されたスクリプト"
  },
  "portal": {
    "slots": {
      "greeting": "お帰りなさい、",
      "tabOverview": "概要",
      "tabLessons": "レッスン",
      "tabProgress": "進捗",
      "tabPractice": "練習",
      "tabFiles": "ファイル",
      "tabTests": "テスト",
      "statLessons": "レッスン",
      "statScore": "平均スコア",
      "statSpeaking": "スピーキング",
      "lessonsTitle": "あなたのレッスン",
      "progressTitle": "進捗状況",
      "vocabTitle": "語彙",
      "milestoneTitle": "次の到達点",
      "scoresTitle": "最近のスコア",
      "testsTitle": "練習テスト",
      "speakingTitle": "話し方の傾向",
      "filesTitle": "レッスンファイル",
      "vocabTotalsTitle": "語彙の増加"
    },
    "tabsAria": "ダッシュボードセクション",
    "notLinked": "アカウントはまだ連携されていません",
    "askTeacher": "講師にアカウント連携を依頼してください。",
    "climbLed": "リスニングから{em}まで伸びました。",
    "climbLedEm": "会話のリード",
    "climbMore": "開始時より{em}話しています。",
    "climbMoreEm": "{delta}ポイント増",
    "climbPlain": "前回のレッスンでは{em}話しました。",
    "youSpoke": "あなたの発話量",
    "acrossLessons": "{n}レッスン分",
    "acrossOneLesson": "1レッスン分",
    "climbSub": "アーク上のマークが開始時点 — {then}。",
    "climbDelta": "1回目から{delta}ポイント増",
    "inLast30": "直近30日で{n}回",
    "totalLessons": "累計レッスン回数",
    "inAll": "合計{n}回",
    "words": "{n}語",
    "lastN": "直近{n}回",
    "metricPace": "ペース",
    "metricThinking": "思考時間",
    "metricShare": "発話割合",
    "practiseTitle": "語彙を練習",
    "practiceHistory": "過去2週間の練習履歴",
    "byKind": "単語の種類別",
    "byLesson": "レッスン別",
    "practiseAnything": "何でも練習",
    "practiseDue": "期限になった語彙を練習",
    "vocabKnown": "習得済み",
    "vocabLearning": "学習中",
    "vocabNew": "未学習",
    "download": "ダウンロード"
  },
  "practice": {
    "emptyTitle": "まだ練習するものがありません",
    "emptyBody": "講師がレッスン要約を公開すると語彙が表示されます。",
    "howMany": "今日は何問にしますか？",
    "doneTitle": "終了 — {n}枚。",
    "doneOneTitle": "終了 — 1枚。",
    "allFirstTime": "すべて初回です。数日後にまた出てきます。",
    "someMissed": "{right}回初回正解、{missed}回は早めに再出題されます。",
    "moreLeft": "この山にはあと{n}語あります。好きな時に練習できます。",
    "oneLeft": "この山にあと1語あります。好きな時に練習できます。",
    "wholePile": "これで全部です。",
    "nextRound": "あと{n}語",
    "practiseAgain": "もう一度練習",
    "backToPractice": "練習に戻る",
    "tapToSee": "タップで意味を表示",
    "again": "もう一度",
    "knewIt": "知っていた",
    "sayOutLoud": "めくる前に声に出しましょう。"
  },
  "rating": {
    "question": "この内容はレッスンに合っていましたか？",
    "yes": "はい、レッスン通りでした",
    "no": "少し違いました",
    "thanksYes": "「合っていた」とお答えいただきました。内容は既読となります。",
    "thanksNo": "「少し違う」とのご回答、ありがとうございます。とても参考になります。",
    "whatWasOff": "どこが違いましたか？該当するものを選んでください。",
    "notePlaceholder": "具体的にあればご記入ください。1文で結構です。",
    "send": "送信",
    "sending": "送信中…",
    "didNotSave": "保存できませんでした。",
    "reasons": [
      "話していない単語が含まれる",
      "だれの発言かが混在している",
      "文字や言語が違う",
      "自分には難しすぎるか簡単すぎる",
      "その他"
    ]
  },
  "recapLanguage": {
    "question": "自分の要約の記述言語",
    "hint": "学習中の言語自体は変わらず、その周囲の説明語が変わります。",
    "hintLearning": "あなたが学習している{lang}は変わらず、その周りの説明語がこれになります。",
    "aria": "要約の説明言語",
    "saved": "保存しました — 次回以降の要約から適用されます。",
    "didNotSave": "保存できませんでした。"
  },
  "studentSettings": {
    "eyebrow": "アカウント情報",
    "title": "設定",
    "back": "← レッスンへ戻る",
    "languageTitle": "このページの言語",
    "languageDesc": "ボタンや見出し、レッスン周辺の文言です。要約記述言語は下の設定で変更してください。"
  },
  "lesson": {
    "railAria": "レッスンセクション",
    "thisLesson": "このレッスン",
    "movements": [
      "話し方について",
      "できたこと",
      "直す点",
      "内容まとめ",
      "今日の単語",
      "練習",
      "ファイル＆音声"
    ],
    "speakingBalance": "発話バランス",
    "score": "スコア",
    "grammarDensity": "文法密度",
    "corrections": "修正箇所",
    "homework": "宿題",
    "noHomework": "このレッスンには宿題はありません。",
    "practiceExercises": "練習課題",
    "wordsFromLesson": "このレッスンで出た単語",
    "whoTalked": "話者の割合",
    "speakingMeasured": "発話を数値化",
    "yourTeacher": "担当講師"
  },
  "join": {
    "setupFailed": "アカウント設定に失敗しました。",
    "acceptFailed": "招待を承認できませんでした。",
    "joining": "参加中…",
    "joinAs": "{name}として参加",
    "notYou": "別の方ですか？{signOut}してからこのリンクを開いてください。",
    "notYouLink": "サインアウト",
    "emailLabel": "メールアドレス",
    "passwordLabel": "パスワードを決める",
    "passwordHint": "8文字以上",
    "settingUp": "設定中…",
    "createAccount": "アカウント作成"
  },
  "speaking": {
    "cta": "録音する",
    "sendFailed": "録音を送信できませんでした。再度お試しください。",
    "recordAgain": "録音し直す",
    "sendToTeacher": "講師に送信",
    "sending": "送信中…",
    "tryAgain": "もう一度試す",
    "keepSent": "送ったものをそのままにする"
  },
  "exchange": {
    "recording": "録音",
    "download": "ダウンロード",
    "nothingShared": "このレッスンに共有されたものはまだありません。",
    "noFiles": "まだファイルは共有されていません。資料やPDFをアップロードしてください。",
    "audioIntro": "この生徒が練習用に録音した音声です。スピーキング問題の回答は「練習」タブに表示されます。",
    "noAudio": "音声はまだ提出されていません。"
  },
  "charts": {
    "metrics": [
      {
        "label": "スコア",
        "note": "各レッスンの10点満点評価です。"
      },
      {
        "label": "あなたの発話量",
        "note": "会話で自分が話した割合。自信が付くほど増えていきます。"
      },
      {
        "label": "ペース",
        "note": "発話時の1分あたりの語数です。"
      },
      {
        "label": "思考時間",
        "note": "回答までの時間。短いほどスムーズです。"
      },
      {
        "label": "語彙数",
        "note": "全レッスン累計の語彙数です。"
      }
    ],
    "nothingYet": "まだ記録がありません。",
    "sinceLesson": "レッスン{n}以降",
    "trendLater": "次回のレッスン後に傾向グラフが表示されます。"
  },
  "tests": {
    "saveScoreFailed": "スコアを保存できませんでした。",
    "finish": "終了 — {pct}%",
    "allWords": "すべての単語"
  },
  "availability": {
    "days": [
      "月曜",
      "火曜",
      "水曜",
      "木曜",
      "金曜",
      "土曜",
      "日曜"
    ],
    "startTime": "開始時刻",
    "endTime": "終了時刻",
    "removeRange": "時間帯を削除",
    "couldNotSave": "保存できませんでした",
    "saveChanges": "変更を保存",
    "defaultsTitle": "レッスン既定値",
    "defaultsDesc": "レッスン時間や予約受入れ期間の設定です。",
    "lessonName": "レッスン名",
    "lessonNamePlaceholder": "語学レッスン",
    "lessonLength": "レッスン時間（分）",
    "slotInterval": "枠間隔（分）",
    "minNotice": "最短通知時間（時間）",
    "bufferBefore": "前後余裕（前・分）",
    "bufferAfter": "前後余裕（後・分）",
    "maxPerDay": "1日あたり最大レッスン数",
    "bookingWindow": "予約受入期間（日）",
    "title": "空き状況",
    "copyMon": "月曜→平日反映",
    "copyMonTitle": "月曜日の時間帯を火〜金に適用",
    "previewBooking": "予約ページを確認 ↗",
    "unavailable": "利用不可",
    "dateOverrides": "日付ごとの例外"
  },
  "recordings": {
    "eyebrow": "概要",
    "title": "レッスン＆要約",
    "settings": "設定",
    "yourStudents": "あなたの生徒",
    "publishedTitle": "公開済みレッスン",
    "publishedDesc": "生徒がすでに見られる内容です。新しい順に表示。下書きは上部の確認キューにあります。",
    "nothingPublished": "まだ公開されていません",
    "untitled": "タイトル未設定レッスン",
    "published": "公開済み",
    "draft": "下書き",
    "summaryAria": "レッスン要約",
    "students": "生徒",
    "changedMind": "やっぱりやめますか？",
    "connectCalendar": "カレンダー連携"
  },
  "lessonRow": {
    "joinCall": "通話に参加 ↗",
    "viewRecap": "要約を見る",
    "reviewRecap": "要約を確認",
    "noLink": "リンクなし",
    "eyebrow": "公開前確認",
    "recapTitle": "{title} · レッスン要約",
    "closeAria": "要約確認を閉じる",
    "draftBanner": "AI下書きです — 生徒に届く前に内容を確認してください。",
    "score": "スコア",
    "studentTalk": "生徒発話量",
    "grammar": "文法",
    "confidence": "自信度",
    "homework": "宿題",
    "memoScript": "ボイスメモ用スクリプト",
    "teacherNote": "講師メモ",
    "editLater": "後で編集",
    "approveSend": "承認して生徒に送信"
  },
  "book": {
    "months": [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月"
    ],
    "loadFailed": "空き状況を読み込めませんでした。",
    "bookingFailed": "予約に失敗しました。",
    "bookingFailedRetry": "予約に失敗しました — もう一度お試しください。",
    "eyebrow": "レッスン予約",
    "title": "都合の良い時間を探す",
    "sub": "日にちを選び、さらに時間を指定。確定と会議詳細はメールで届きます。",
    "booked": "予約が完了しました！",
    "invite": "カレンダー招待を{email}に送信中です。",
    "openMeeting": "会議リンクを開く",
    "noCalendar": "空き状況を表示できません。カレンダーは接続済みですか？",
    "noTimes": "今後30日以内に空き枠がありません。",
    "pickDay": "日付を選択",
    "pickDayHint": "●印がある日に空き枠があります。",
    "yourDetails": "ご自身の情報",
    "confirmAt": "{time}を確定",
    "yourName": "お名前",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "メールアドレス",
    "emailPlaceholder": "you@email.com",
    "booking": "予約処理中…",
    "bookAt": "レッスン予約 · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "概要",
        "body": "ホーム画面です。要約の下書きをここで確認・送信できます。最新のレッスン情報も一覧で表示されます。",
        "wait": ""
      },
      {
        "title": "生徒管理",
        "body": "あなたの生徒が一覧で表示されます。各生徒のレッスン・テスト・進捗へここから移動できます。ポータルも自動作成されます。",
        "wait": ""
      },
      {
        "title": "ノート",
        "body": "レッスンごとにワンクリックで記録。月ごとの一覧にもなり、指導日記として活用できます。",
        "wait": ""
      },
      {
        "title": "生徒ビュー",
        "body": "生徒が実際に見る画面です。あなたの色・表現で表示されます。これはデモではなく、実際の機能です。",
        "wait": ""
      },
      {
        "title": "設定",
        "body": "カレンダーや録音ツール、アカウント情報などはこちらで管理します。チュートリアルも再体験できます。",
        "wait": ""
      },
      {
        "title": "生徒を追加しましょう",
        "body": "これでツアーは終わりです。生徒がいないと他は使えません。まず「生徒管理」へ進みましょう。",
        "wait": "生徒管理を開く"
      },
      {
        "title": "最初の生徒を追加",
        "body": "名前と学ぶ内容だけでOKです。メール情報は不要。招待リンクが最後に発行されます。",
        "wait": "生徒追加を押す"
      },
      {
        "title": "名前と言語だけ",
        "body": "レベルは仮設定で構いません。要約の言語も後から変更可能なので、迷わなくてOKです。",
        "wait": "入力して保存"
      },
      {
        "title": "このリンクを送信",
        "body": "この招待リンクだけで引き継ぎ完了。生徒は自分でパスワードを決め、すぐにポータルが有効化されます。",
        "wait": ""
      }
    ],
    "skip": "スキップ",
    "replay": "✨ もう一度ガイドを見る"
  },
  "languages": {
    "couldNotSave": "保存できませんでした",
    "title": "あなたの言語",
    "desc": "教える言語・レッスンで話す言語を設定します。新しい生徒はここから始まります。",
    "youTeach": "教える言語",
    "spokenIn": "レッスンで話す言語",
    "fitTitle": "言語の役割",
    "fitDesc": "3つの設定、それぞれ役割が異なります。",
    "fitLearning": "**生徒ごとの「学習言語」** — 要約やテストの生成基準。{n}種類対応、日本語・韓国語・スペイン語・アラビア語など。追加時に設定し、生徒ページで変更可。",
    "fitExplained": "**生徒ごとの「説明言語」** — 要約やテスト指示文の記述言語。初期設定は英語。生徒ページで変更可能です。",
    "fitSpoken": "**生徒ごとの「レッスン話者」** — 録音の文字起こし処理時の言語。上記の設定を反映します。録音ごとに毎回設定は不要です。"
  },
  "notes": {
    "pickStudent": "生徒を選択",
    "empty": "ノートは空です",
    "couldNotSave": "ノートを保存できませんでした",
    "confirmDelete": "このノートを削除しますか？",
    "hoursTaught": "指導時間",
    "recapsPublished": "公開要約数",
    "prevMonth": "前の月",
    "nextMonth": "次の月",
    "today": "今日",
    "noStudents": "生徒なし",
    "student": "生徒",
    "addNote": "ノート追加",
    "newNote": "新規ノート",
    "editNote": "ノート編集"
  },
  "exercises": {
    "none": "課題はまだありません。下に追加してください。",
    "instruction": "指示文",
    "instructionPlaceholder": "生徒への指示内容",
    "focus": "重点",
    "focusPlaceholder": "センテンスが練習する内容",
    "sentence": "文",
    "meaning": "意味",
    "removeSentence": "文を削除",
    "removeOption": "選択肢を削除",
    "questionTarget": "質問（ターゲット言語）",
    "question": "質問"
  },
  "payments": {
    "selectStudent": "生徒を選択",
    "amountTooLow": "1以上の金額を入力してください",
    "saveFailed": "保存できませんでした",
    "thisMonth": "今月",
    "receivedAllTime": "累計受領",
    "outstanding": "未収",
    "currency": "通貨",
    "students": "生徒",
    "prevMonth": "前の月",
    "nextMonth": "次の月",
    "today": "今日",
    "noStudents": "生徒なし",
    "student": "生徒",
    "recent": "最近の入金",
    "newPayment": "新規入金記録",
    "editPayment": "入金編集",
    "selectPlaceholder": "選択…",
    "amount": "金額（{symbol}）",
    "status": "状態",
    "paid": "支払済み",
    "pending": "未払い",
    "covers": "適用内容",
    "coversPlaceholder": "例）7月分パッケージ — 4回分",
    "paymentDate": "入金日",
    "dueDate": "期日",
    "lessonsCovered": "対象レッスン数",
    "lessonsPlaceholder": "例）4",
    "method": "方法",
    "methodPlaceholder": "銀行振込・現金・PayPal等",
    "confirmDelete": "この入金記録を削除しますか？"
  },
  "recapReview": {
    "vocab": "語彙",
    "summary": "要約",
    "summaryPlaceholder": "レッスン要約…",
    "sectionTitle": "セクションタイトル",
    "sectionContent": "セクション内容…",
    "removeSection": "セクション削除",
    "homeworkTask": "宿題課題",
    "noteTitle": "生徒へのメモ",
    "notePlaceholder": "生徒への個人メッセージ…"
  },
  "connectors": {
    "googleName": "Googleカレンダー",
    "googleDesc": "レッスン予定を読み込み、新規予約をカレンダーに直接記載します。",
    "connect": "接続",
    "permissionNeeded": "権限が必要です",
    "reconnect": "再接続",
    "disconnect": "切断",
    "zoomDesc": "予約時にZoomルームを自動生成します。",
    "comingSoon": "近日対応予定",
    "stripeName": "Stripe",
    "stripeDesc": "レッスンパッケージのカード決済対応。入金は直接あなたへ。"
  },
  "student": {
    "notJoined": "招待済み — まだ未登録",
    "avgScore": "平均スコア",
    "latestTalk": "最新の発話記録",
    "vocabItems": "語彙数",
    "creditsLeft": "残り{left}回 / 購入{bought}回",
    "creditsOneLeft": "残り1回 / 購入{bought}回",
    "noCredits": "まだレッスンは購入されていません",
    "managePayments": "入金管理 →",
    "lessonsTitle": "レッスン＆要約",
    "noLessons": "まだレッスンなし",
    "noLessonsSub": "この生徒の録音済みレッスンがここに表示されます。",
    "testsTitle": "練習テスト",
    "noTests": "テストはまだありません"
  },
  "addStudent": {
    "levels": [
      "初心者",
      "初級",
      "準中級",
      "中級",
      "中上級",
      "上級"
    ],
    "createFailed": "生徒を作成できませんでした",
    "aria": "新規生徒",
    "title": "新規生徒",
    "fullName": "氏名",
    "namePlaceholder": "Jane Doe",
    "level": "レベル",
    "learning": "学習言語",
    "choose": "選択…",
    "recapLanguage": "要約記述言語",
    "trigger": "+ 生徒追加",
    "inviteTitle": "{name}の招待リンク",
    "inviteBody": "普段のやり取り方法でこのリンクを送ってください。生徒がメールとパスワードを設定後、すでにあなたのワークスペースで使えます。",
    "addAnother": "他の生徒を追加",
    "copyAgain": "このリンクは{name}の行からいつでも再取得できます。"
  },
  "calendar": {
    "months": [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月"
    ],
    "upcoming": "今後",
    "today": "今日",
    "tomorrow": "明日",
    "prev": "前へ",
    "next": "次へ",
    "fixInSettings": "設定で修正",
    "nothingOn": "{day}の予定はありません。",
    "noLessonsThatDay": "その日にレッスンはありません。",
    "agendaClear": "予定はありません。",
    "noUpcoming": "このカレンダーに今後のレッスンはありません。"
  },
  "forgot": {
    "title": "パスワード再設定",
    "lead": "サインイン時のメールアドレスを入力してください。新しいパスワード設定用のリンクを送信します。",
    "send": "再設定リンク送信",
    "sending": "送信中…",
    "sent": "{email}にアカウントがある場合、リセット用リンクを送信しました。メールを確認し、1時間以内に手続きをお願いします。",
    "spam": "メールが届かない場合は迷惑メールを確認するか、登録メールアドレスで再度お試しください。",
    "remembered": "思い出しましたか？",
    "backToSignIn": "サインインに戻る"
  },
  "reset": {
    "tooShort": "新しいパスワードは6文字以上必要です。",
    "mismatch": "2つのパスワードが一致しません。ご確認ください。",
    "samePassword": "前回と同じパスワードです。別のものをご利用ください。",
    "saveFailed": "パスワードを保存できませんでした。再度お試しください。",
    "title": "新しいパスワードの入力",
    "expired": "このリセットリンクは期限切れか既に使用済みです。新しいリンクを申請し直してください。",
    "noToken": "このページはパスワード再設定メールのリンクからのみ利用できます。申請し直してください。",
    "lead": "新しいパスワードを設定します。保存後は自動でサインインされます。",
    "newPassword": "新しいパスワード",
    "repeat": "再入力"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "平均スコア",
        "sub": "全レッスンの10点満点平均。"
      },
      {
        "label": "発話割合",
        "sub": "レッスン内で生徒が話した割合。"
      },
      {
        "label": "発話ペース",
        "sub": "話しているときの1分あたり語数。伸びていれば流暢さUP。"
      },
      {
        "label": "思考時間",
        "sub": "先生が終わってから生徒が話し始めるまでの秒数。長い時間も努力の証です。"
      },
      {
        "label": "ターンあたりの語数",
        "sub": "話し始めごとの発話量。短く早い場合は答え→会話になりやすいです。"
      },
      {
        "label": "フィラー語",
        "sub": "1レッスンあたりの「あー」「えー」など。速いのに多い vs ゆっくりで無い、で意味が違います。"
      }
    ],
    "totalLessons": "レッスン合計",
    "acrossStudents": "{n}名分",
    "mostActive": "最も活動的",
    "nLessons": "{n}回",
    "nothingRecorded": "まだ記録がありません",
    "vocabMet": "学習語彙",
    "wordsAcross": "全レッスン合計語数",
    "notSeenLately": "最近来ていない",
    "everyoneCurrent": "全員最新",
    "measureAria": "指標",
    "nothingMeasured": "まだ記録がありません。録音済みレッスンで順次反映されます。",
    "perStudent": "{measure} — 生徒ごと",
    "perStudentSub": "自分の受講履歴順。矢印は最初のレッスン→最新。",
    "prevMeasure": "前の指標",
    "nextMeasure": "次の指標"
  },
  "test": {
    "heading": "{level} 練習テスト",
    "published": "公開済み",
    "draftOnlyYou": "下書き — あなただけが見られます",
    "basedOn": "元レッスン",
    "lessonN": "レッスン{n}",
    "script": "文字体系",
    "scriptBeginner": "ひらがな＋ローマ字",
    "scriptHiragana": "ひらがな",
    "scriptKanji": "漢字＋かな",
    "created": "作成日",
    "status": "ステータス",
    "speakingAnswer": "スピーキング回答",
    "unplayable": "録音は存在しますが再生用署名を取得できませんでした。"
  },
  "trial": {
    "aria": "Lesson Studioへようこそ",
    "kicker": "Lesson Studioへようこそ",
    "title": "最初の{n}件の要約は無料です",
    "sub": "録音ツールをインストール・レッスンを指導・要約が自動返却。カード情報も不要です。納得したらプラン選択へ。",
    "showMe": "案内を見る",
    "exploreMyself": "自分で見てみる",
    "setUpFirst": "まず録音ツールを設定 →"
  },
  "reviewQueue": {
    "title": "要約のレビュー",
    "desc": "録音から構築。あなたが確認・送信するまで生徒には表示されません。",
    "moveFailed": "要約を移動できませんでした",
    "serverUnreachable": "サーバーに接続できませんでした",
    "rebuildFailed": "要約を再作成できませんでした",
    "deleteFailed": "要約を削除できませんでした"
  },
  "recorderMissing": {
    "title": "録音ツール追加が必要です",
    "body": "Lesson Studioはあなたのレッスンから要約を作成します。その録音はChrome拡張が担っています。インストール・サインイン完了までこのページに何も届きません。他の手段でレッスンを追加することはできません。"
  },
  "pending": {
    "chooseStudent": "まずレッスン相手を選んでください。",
    "fileFailed": "録音ファイルの処理に失敗しました。",
    "confirmDelete": "この録音を削除しますか？音声ファイルも同時に削除されます。",
    "studentAria": "生徒",
    "choosePlaceholder": "生徒を選択",
    "filing": "ファイル中…",
    "buildRecap": "要約作成"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "初心者",
        "sub": "ひらがな＋ローマ字"
      },
      {
        "label": "ひらがな",
        "sub": "かなのみ・ローマ字なし"
      },
      {
        "label": "漢字＋かな",
        "sub": "漢字とふりがな"
      }
    ],
    "failed": "作成失敗",
    "needLesson": "まずレッスン要約を公開してください",
    "title": "練習テストを作成",
    "explanationLanguage": "説明言語"
  },
  "guide": {
    "eyebrow": "レッスン録音ツール",
    "title": "レッスンを録音し要約を受け取る",
    "sub": "Chrome拡張でレッスンタブ・マイク音声を2系統録音し、ここで要約下書きを作成。ボット招待や生徒PCへのインストールは不要。Preply・italki・Google Meet・Zoom等、タブ内ならどこでも利用可能。",
    "step1Title": "Chromeウェブストアからインストール",
    "step1Body": "1クリック、初期設定不要。次にパズルアイコン→ピン留めで、常にKマークが見えるようにします。",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Chromeに追加",
    "addToChrome": "Chromeに追加 — 無料 ↗",
    "betaNote": "**フォルダーからベータ版を試した方へ**：そちらを先に削除してください（{path} → 削除）。同時に複数は記録できません。",
    "step2Title": "サインイン — 最初のみ",
    "step2Body": "拡張を開き、ここで使うメールとパスワードでサインイン。設定はこれだけ。講師・生徒・指導言語が自動反映されます。",
    "signIn": "サインイン",
    "step3Title": "レッスンタブを開いて録音開始",
    "step3Body": "実際のレッスンが行われるタブ（Preply、Meetなど）でKアイコンをクリック→生徒を選択→**録音開始**。初回のみChromeがマイク許可を尋ねます。ポップアップは閉じてOK、そのまま授業を続けてください。",
    "studentLabel": "生徒：",
    "step4Title": "停止後、送信",
    "step4Body": "レッスンが終わったらポップアップを開き**録音停止**を押し、**Lesson Studioへ送信**を選択。送信するまでファイルはアップロードされません。",
    "sendButton": "Lesson Studioへ送信→",
    "step5Title": "できあがった要約を確認",
    "step5Body": "数分後、「要約レビュー」に下書きが届きます。要約・語彙・宿題も生徒の希望言語で表示。編集後に送信するとすぐにポータルで公開されます。",
    "reviewAndSend": "レビュー＆送信",
    "consentTitle": "録音の同意取得について",
    "consentBody": "生徒へ録音を伝え、同意を得てください。一部の地域や、Preply・italkiでは各プラットフォーム規約があります。録音利用前にご確認をおすすめします。",
    "dataBody": "録音は両者の声を記録。**Lesson Studioへ送信**まではアップロードされません。要約用に文字起こし後、ファイルは30日で削除されます。詳細は{policy}をご参照ください。",
    "privacyLink": "プライバシーポリシー"
  },
  "lessonExercises": {
    "none": "このレッスンに練習課題はありません。",
    "recordReading": "この文を読み上げて録音する",
    "notRecorded": "まだ録音されていません。"
  },
  "lessonTools": {
    "lessonIsWith": "このレッスンの相手：",
    "notLinked": "未連携（テスト/生徒なし）",
    "hint": "生徒を紐付けると要約を届けられます。テスト通話の場合は未連携のままでも構いません。"
  },
  "memo": {
    "back15": "15秒戻る",
    "forward15": "15秒進む",
    "seek": "移動"
  },
  "joinInvalid": {
    "title": "このリンクは有効ではありません",
    "body": "すでに使われたか、講師側で新しいものに変わった可能性があります。新しいリンクを講師にご依頼ください。",
    "goSignIn": "サインイン画面へ"
  },
  "dashboard": {
    "students": "生徒",
    "withLogin": "ログイン済み",
    "lessonsRecorded": "録音済みレッスン",
    "noStudents": "生徒がまだいません",
    "notJoined": "招待済み — まだ未登録",
    "lessons": "レッスン",
    "overview": "概要"
  },
  "misc": {
    "outOfTen": "10点満点",
    "dashboardBack": "ダッシュボード",
    "backToOverview": "概要に戻る",
    "recapGone": "この要約情報はもう利用できません。",
    "timesShared": "共有回数",
    "languageGroup": "言語",
    "extConfirmReset": "全てのパソコンで録音ツールからサインアウトしますか？サインインするまで録音は不可です。",
    "extResetFailed": "録音ツールとの接続をリセットできませんでした。",
    "extSigningOut": "サインアウト中…",
    "extSignOutEverywhere": "全端末から録音ツールをサインアウト",
    "howTitle": "レッスンが届く仕組み",
    "howLead": "{platform}で指導するため、Lesson Studio上での予定作成はありません。録音ファイルが届いた時点でレッスンが登録されます。",
    "howSteps": [
      {
        "title": "レッスンを録音",
        "body": "ブラウザ録音ツールか、プラットフォームから録音ファイルをアップロードしてください。"
      },
      {
        "title": "要約を作成",
        "body": "文字起こしから、まとめ・語彙・修正点・練習問題を生成します。"
      },
      {
        "title": "内容を確認して公開",
        "body": "編集の上送信すれば、生徒側ポータルに反映されます。"
      }
    ],
    "instrStudentChose": "この言語は生徒が自身で選びました。変更はできますが、本人の希望です。",
    "instrHint": "要約・テストの説明言語 — クリックで変更可",
    "matLinkFailed": "リンクを保存できませんでした",
    "matLinksFailed": "複数リンクの保存に失敗しました",
    "matAddLink": "リンク追加",
    "confirmDeleteStudent": "この生徒と全レッスンを削除しますか？元に戻せません。",
    "resetPassword": "パスワード再設定",
    "inviteLink": "招待リンク",
    "uploadFailed": "アップロードに失敗しました",
    "micBlocked": "マイクがブロックされています。ブラウザで許可してください。",
    "micBlockedBar": "マイクがブロックされています。アドレスバー横から許可し、再試行してください。",
    "uploadAFile": "ファイルをアップロード",
    "submitToTeacher": "講師に提出",
    "discardRedo": "破棄してやり直し",
    "sendToStudent": "生徒へ送信",
    "sendThisAnswer": "この回答を送信",
    "sentTick": "送信済み ✓",
    "vocabByLevelAria": "レベル別語彙表",
    "vocabTapHint": "レベルをタップすると該当語・出現レッスンが見られます。",
    "firstSeenIn": "初出：レッスン{n}",
    "firstSeen": "初出",
    "wordsIntroduced": "追加語彙",
    "fromTheLesson": "レッスンから",
    "goAgain": "もう一度",
    "showWord": "単語を表示",
    "showMeaning": "意味を表示",
    "correction": "修正",
    "correctionsAria": "修正内容",
    "noLessonsYet": "まだレッスンがありません"
  }
} as const
