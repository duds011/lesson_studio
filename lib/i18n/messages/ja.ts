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
    "somethingWrong": "問題が発生しました。少し待ってから再試行してください。"
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "講師ワークスペース",
    "overviewAria": "Lesson Studio の概要",
    "navAria": "講師ワークスペースのナビゲーション",
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
    "studentView": "生徒用画面",
    "availability": "空き状況",
    "settings": "設定",
    "calendarConnected": "カレンダー接続済み",
    "setupNeeded": "セットアップが必要です",
    "recordingsOnly": "録音のみ",
    "studentPortal": "生徒用ポータル"
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
      "label": "はい — Google カレンダーに入っています",
      "hint": "レッスンを読み取り、予約を受け付け、録音ツールを送信します"
    },
    {
      "label": "いいえ — 別の場所で管理しています",
      "hint": "レッスンは録音として届き、カレンダーは表示されません"
    }
  ],
  "auth": {
    "language": "言語",
    "emailLabel": "メールアドレス",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "パスワード",
    "signInTitle": "サインイン",
    "signInSub": "おかえりなさい。レッスン・進捗・記録が確認できます。",
    "signInExpired": "セッションの有効期限が切れました。サインイン後、元の場所に戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めてですか？",
    "createAccountLink": "講師アカウントを作成",
    "freeToSetUp": "セットアップは無料です。すぐに最初の生徒を追加できます。",
    "studentQuestion": "生徒ですか？",
    "studentAnswer": "講師から招待リンクが送られます。リンクを開いてメールアドレスとパスワードを決めてください。その後、ここからサインインできます。",
    "signInHeadline": "すべてのレッスンを書き起こし。",
    "signInAside": "Lesson Studio は各レッスンを要約・進捗・練習にまとめます。講師にも生徒にも。",
    "signUpTitle": "講師アカウントを作成",
    "signUpSub": "Koku Library ワークスペースを作り、生徒・レッスン記録・予約・進捗管理をはじめましょう。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウントを作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウントを作成できませんでした。",
    "createdNowSignIn": "アカウントが作成されました。サインインしてください。",
    "haveAccount": "すでにアカウントをお持ちですか？",
    "signUpHeadline": "指導のすべてを一箇所に。",
    "signUpAside": "数分で完了します。生徒を追加し次のレッスンを録音すれば、以降は自動で整理されます。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンが自動で書き起こし",
        "body": "Chrome拡張機能が両方の声を録音します。記録（要約）が下書きで届きます。編集して公開できます。"
      },
      {
        "title": "見える進捗",
        "body": "スコア、発話割合、語彙をレッスンごとに記録。生徒ごとのページで確認できます。"
      },
      {
        "title": "どんな言語でも対応",
        "body": "日本語、フランス語、韓国語、スペイン語ほか多数。レッスン通りの言語で訂正し、生徒が分かる言語で説明します。"
      },
      {
        "title": "自分の言葉から練習",
        "body": "その日の語彙をもとにフラッシュカードやスピーキングテストを作成します。"
      },
      {
        "title": "講師名入りの生徒ポータル",
        "body": "色や表記も自由に設定でき、必要なセクションだけで構成できます。"
      }
    ]
  },
  "onboarding": {
    "steps": [
      "あなたのレッスン",
      "会う場所",
      "カレンダー",
      "生徒用画面",
      "録音ツール"
    ],
    "sideTitle": "スタジオをセットアップしましょう。",
    "sideBody": "4ステップで生徒専用ポータルができます。",
    "stepCount": "ステップ {n} / {total}",
    "choose": "選択…",
    "continueAction": "続行",
    "finish": "セットアップを完了",
    "finishing": "完了中…",
    "couldNotSave": "保存できませんでした",
    "couldNotFinish": "完了できませんでした",
    "pickTeaching": "担当言語を選択してください。",
    "pickSpoken": "レッスンで使う言語を選んでください。",
    "pickCalendar": "レッスンをカレンダーで管理しているか教えてください。",
    "pickPortalName": "ポータルの名前をつけてください（生徒に表示されます）。",
    "teachAria": "担当する言語",
    "iTeach": "担当言語",
    "teachHint": "記録や練習テストはこの言語で作成されます。追加する生徒ごとのデフォルトですが、あとで個別に変更可能です。",
    "uiFollows": "ワークスペースの表示言語もこれに合わせます：日本語・英語・フランス語に対応。他は英語になります。設定で変更できます。",
    "spokenAria": "レッスンで使う言語",
    "spokenIn": "レッスンの主な使用言語",
    "spokenHint": "学習対象と異なる場合もあります（初級者には共通の言語で進行）。録音ツールが聞き取る言語です。",
    "timezone": "タイムゾーン",
    "platformTitle": "生徒と会う場所は？",
    "platformLead": "MeetやZoomの場合は生徒が予約時にリンクを作成します。マーケットプレイス型では既存の部屋リンクをそのまま利用します。",
    "zoomLater": "Zoom接続は後から設定できます",
    "stayOutTitle": "レッスン本体には関与しません",
    "stayOutBody": "リンク作成やボット送信も行いません。レッスンを自身で録音し、記録・語彙・練習問題を自動生成します。生徒側の表示も違いはありません。",
    "calendarTitle": "レッスンの管理場所",
    "calendarLeadExternal": "一部の{platform}講師はGoogleカレンダーで週を管理していますが、全てプラットフォームで完結している場合もあります。ここの回答によって表示内容が変わります。",
    "calendarLead": "Googleカレンダーに生徒が連携されていれば、レッスンの読取・予約受付・録音が自動化できます。別の方法なら、それらは表示しません。",
    "googleConnected": "Googleカレンダー接続済み",
    "googleConnectedSub": "どのカレンダーにレッスンが記録されているかは設定で選べます。",
    "connectGoogle": "Googleカレンダーを接続",
    "connectGoogleFine": "Googleの同意画面に移動します。連携しなくても続行可能ですが、予約や録音の自動化は接続までオフになります。",
    "recordTitle": "レッスンを録音",
    "recordBody": "どの部屋でも、録音してLesson Studioにファイルを渡せます。",
    "reviewTitle": "記録を確認",
    "reviewBody": "通常通りレビューキューに追加されます。公開すると生徒に送信されます。",
    "noCalendarFine": "カレンダーの連携なし：予約ページやリマインダーもなし。ワークスペースはレッスン・記録メインで開きます。いつでも設定から切り替えできます。",
    "brandTitle": "独自の名前に",
    "brandLead": "生徒がサインインするポータル用の色と名前を決めてください。細かい調整は後から可能です。",
    "portalNameLabel": "生徒ポータル名",
    "portalNamePlaceholder": "例: さくら日本語",
    "portalNameFine": "生徒ビューの上部や招待メールに表示されます。あなた自身のスタジオ名です（弊社名は出ません）。",
    "accent": "アクセントカラー",
    "previewTagline": "今日学び、明日につなげる！",
    "recorderTitle": "録音ツールをインストール",
    "recorderLead": "作業の要になる部分です。Chrome拡張として動作し、レッスンを録音・要約します。ボットが通話に参加することはなく、生徒側へのインストールも不要です。",
    "recorderStep1": "Chromeウェブストアから追加します（ワンクリックで完了）→ ツールバーにピン留め。",
    "recorderStep2": "拡張機能内で同じメール・パスワードでサインインします。移す操作はありません。",
    "recorderStep3": "レッスンを録音: 生徒を選び、開始・終了を押します。",
    "addToChrome": "Chromeに追加（無料）↗",
    "recorderFine": "手順を詳しく見たい方（マイク許可や録音範囲など）は{guide}をご参照ください。設定→Lesson recorderからもアクセスできます。",
    "recorderFineLink": "セットアップガイド"
  },
  "overview": {
    "eyebrow": "概要",
    "title": "指導カレンダー",
    "manageConnections": "接続を管理",
    "fixInSettings": "設定で修正",
    "summaryAria": "レッスン要約",
    "upcoming": "今後のレッスン",
    "drafts": "レビュー待ち下書き",
    "draftsSub": "要確認の記録",
    "published": "公開済み記録",
    "publishedSub": "生徒に送信済み",
    "writeUpsLeft": "残り記録数",
    "writeUpsAria": "残り記録数 — 追加購入",
    "usageTrial": "{total}回の無料のうち{used}回使用済み",
    "usageBought": "{used}件作成 · 有効期限なし",
    "lessonCalendar": "レッスンカレンダー",
    "primaryCalendar": "（メイン）"
  },
  "connect": {
    "title": "Googleカレンダーを接続",
    "body": "カレンダーを連携すると、Lesson Studioが今後のレッスン確認・予約受付・各レッスンの録音を行えます。",
    "notConfigured": "Google OAuthがまだ設定されていません。{id}と{secret}を環境に追加し、再起動してください。",
    "scopeRead": "カレンダーを読み取り — レッスンと会議リンクを特定",
    "scopeRecord": "レッスンを録音 — Lesson Studio拡張で録音",
    "scopeRecap": "記録を作成 — AIで要約してレビュー・共有",
    "continueGoogle": "Googleで続行",
    "fine": "Googleの同意画面に移動します。後から設定で管理可能です。"
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
    "recorderDesc": "Chrome拡張による録音と記録の作成。{guide}",
    "recorderGuide": "手順ガイド →",
    "replayTourHint": "このページの使い方をもう一度見たい場合はここから再実行できます。",
    "languageTitle": "言語",
    "languageDesc": "このワークスペースの表示言語です。記録の作成言語には影響しません（各生徒が個別設定します）。",
    "connectionsTitle": "接続",
    "connectionsDesc": "予約・会議・支払いに使うサービスを連携します。",
    "livesTitle": "レッスン管理場所",
    "livesDesc": "Google カレンダー利用時は予約ページ・空き枠予約・録音自動化が利用可能。他の場所で予約の場合は、録音ファイルを軸にワークスペースが動作します。",
    "calendarTitle": "レッスンカレンダー",
    "calendarDesc": "Lesson Studioが読み取る対象カレンダーを指定します。",
    "primaryCalendar": "メインカレンダー",
    "autoSendTitle": "記録の送信",
    "autoSendDesc": "全ての記録はレビューキューで一時停止します。レビューせず自動送信に設定も可能です（その場合も後から編集可能ですが、生徒には初版が届きます）。",
    "autoSendReview": "まずレビューする",
    "autoSendReviewHint": "記録確認に保留されます",
    "autoSendAuto": "自動で送信する",
    "autoSendAutoHint": "作成され次第生徒に送信されます",
    "speakingTitle": "発話練習",
    "speakingDesc": "各記録の末尾にスピーキング練習を3問追加します。生徒は回答を録音でき、回答はレッスンページ下部に表示されます。再生時にメールも届きます。オフにすると3問を非表示にできます。",
    "speakingOn": "生徒の録音を許可する",
    "speakingOnHint": "回答をレッスンページで再生できます",
    "speakingOff": "練習を除外する",
    "speakingOffHint": "記録は7問の筆記練習だけになります",
    "platformTitle": "デフォルト会議プラットフォーム",
    "platformDesc": "新規予約時に作成されます。既にリンクがある場合は一番下を選んでください。",
    "meetLabel": "Google Meet",
    "meetHint": "カレンダー上で作成されます",
    "ownLinkLabel": "自分のリンクを使う",
    "ownLinkHint": "Preply・italki、または独自の部屋"
  },
  "billing": {
    "eyebrow": "記録件数",
    "title": "レッスン数を購入。いつでも利用可能。",
    "buyMore": "記録を追加購入",
    "once": "1回限り",
    "nWriteUps": "{n}件の記録",
    "packNames": [
      "10レッスン分",
      "40レッスン分",
      "100レッスン分"
    ],
    "neverTitle": "自動更新なし",
    "neverBody": "8月に休んでも9月に持ち越せます。有効期限なし・更新なし・カード情報も保管されません。",
    "leftTitle": "残り記録数",
    "leftDesc": "レッスンを書き起こすたび1つ消費されます。有効期限なし・自動更新もなし。",
    "ofFree": "無料記録{total}件中",
    "ofFreeUsed": "無料記録{total}件中 · {used}件使用済み",
    "builtSoFar": "これまで{used}件作成",
    "emptyTrial": "無料分の上限に達しました。下記パック購入で書き起こしを継続できます。サブスクリプションや更新日はありません。",
    "emptyPaid": "残高がありません。下記パックを追加することで補充できます。未利用分は残ります。",
    "addTitle": "記録を追加",
    "addDesc": "1回のみの支払い。大きいパックほど割安ですが、小さなパック購入も割高ではありません。購入分は全て使い切るまで有効です。",
    "save": "{pct}%お得",
    "neverExpires": "有効期限なし",
    "buy": "{n}を購入",
    "openingStripe": "Stripeを開いています…",
    "stripeUnreachable": "Stripeに接続できません。少ししてからお試しください。",
    "paidOnce": "Stripe経由のカード一括払いのみ。カード情報は保存されず、継続請求もありません。",
    "packTags": [
      "はじめてに",
      "定期利用向け",
      "人気"
    ]
  },
  "recap": {
    "tabs": [
      "進捗",
      "記録",
      "宿題",
      "語彙"
    ],
    "tabsAria": "記録セクション",
    "eyebrow": "送信前に確認",
    "title": "{name} · レッスン記録",
    "lessonFallback": "レッスン",
    "sub": "各タブを確認後、{first}に送信します。",
    "translate": "説明文を翻訳",
    "translateTitle": "説明文のみ生徒の言語に書き換えます — レッスン資料やスコアはそのまま",
    "working": "処理中…",
    "rebuild": "録音から再生成",
    "rebuildTitle": "最新のAIと指標で録音から再生成します",
    "rebuilding": "再生成中…",
    "deleteDraft": "下書きを削除",
    "deleting": "削除中…",
    "saveDraft": "下書きを保存",
    "approve": "承認して送信",
    "sending": "送信中…",
    "savedTick": "保存済み ✓",
    "confirmRebuild": "この記録を録音から再生成しますか？要約・各セクション・宿題・流暢さ指標も再生成され、手動編集は破棄されます。",
    "confirmTranslate": "この記録の説明文をこの生徒が使う言語に翻訳しますか？例文・引用・スコアはそのままです。",
    "confirmDelete": "{name}の下書き記録を削除しますか？レビュー待ち一覧から消え、元に戻せません。",
    "promptLanguage": "この生徒の説明言語がまだ設定されていません（生徒ページで設定可）。説明文をどの言語に翻訳しますか？",
    "rebuildFailed": "再生成できませんでした",
    "translationFailed": "翻訳できませんでした",
    "deleteFailed": "記録を削除できませんでした",
    "savingEdits": "編集内容保存中…",
    "uploadingMemo": "音声メモをアップロード中…",
    "uploadingFile": "{name}をアップロード中…",
    "attachingMaterials": "教材の添付中…",
    "attachmentFailed": "記録は送信されましたが、添付ファイルの一部がアップロードできませんでした。レッスンページから再添付してください。",
    "suggestedScript": "おすすめスクリプト"
  },
  "portal": {
    "slots": {
      "greeting": "おかえりなさい、",
      "tabOverview": "概要",
      "tabLessons": "レッスン",
      "tabProgress": "進捗",
      "tabPractice": "練習",
      "tabFiles": "ファイル",
      "tabTests": "テスト",
      "statLessons": "レッスン",
      "statScore": "平均スコア",
      "statSpeaking": "発話",
      "lessonsTitle": "あなたのレッスン",
      "progressTitle": "進捗状況",
      "vocabTitle": "語彙",
      "milestoneTitle": "次の目標",
      "scoresTitle": "最近のスコア",
      "testsTitle": "練習テスト",
      "speakingTitle": "発話習慣",
      "filesTitle": "レッスンファイル",
      "vocabTotalsTitle": "語彙の増加"
    },
    "tabsAria": "ダッシュボードセクション",
    "notLinked": "アカウントがまだ連携されていません",
    "askTeacher": "講師にアカウント連携を依頼してください。",
    "climbLed": "リスニングから{em}まで成長しました。",
    "climbLedEm": "会話を主導",
    "climbMore": "開始時より{em}話すようになりました。",
    "climbMoreEm": "{delta}ポイント増",
    "climbPlain": "前回のレッスンで{em}話しました。",
    "youSpoke": "あなたの発話量",
    "acrossLessons": "{n}レッスン通算",
    "acrossOneLesson": "1レッスン通算",
    "climbSub": "弧上の印がスタート地点です — {then}。",
    "climbDelta": "第1回から{delta}ポイント増",
    "inLast30": "直近30日で{n}",
    "totalLessons": "完了レッスン総数",
    "inAll": "全{n}回",
    "words": "{n}語",
    "lastN": "直近{n}回",
    "metricPace": "ペース",
    "metricThinking": "考える時間",
    "metricShare": "発話占有率",
    "practiseTitle": "単語を練習する",
    "practiceHistory": "過去2週間の練習",
    "byKind": "単語の種類別",
    "byLesson": "レッスン別",
    "practiseAnything": "すべて練習",
    "practiseDue": "期限の単語を練習",
    "vocabKnown": "習得済み",
    "vocabLearning": "学習中",
    "vocabNew": "未開始",
    "download": "ダウンロード"
  },
  "practice": {
    "emptyTitle": "まだ練習する内容がありません",
    "emptyBody": "先生がレッスン記録を公開するとここに単語が表示されます。",
    "howMany": "今日は何単語？",
    "doneTitle": "完了 — {n}枚。",
    "doneOneTitle": "完了 — 1枚。",
    "allFirstTime": "全て初回です。数日後にまた復習できます。",
    "someMissed": "{right}枚は初回、{missed}枚は近日中に再復習。",
    "moreLeft": "この山にはあと{n}語残っています。いつでも続けられます。",
    "oneLeft": "この山にはあと1語残っています。いつでも続けられます。",
    "wholePile": "これで全部です。",
    "nextRound": "あと{n}語",
    "practiseAgain": "もう一度練習",
    "backToPractice": "練習一覧へ戻る",
    "tapToSee": "タップして意味を見る",
    "again": "もう一度",
    "knewIt": "できた",
    "sayOutLoud": "めくる前に声に出して言ってみましょう。"
  },
  "rating": {
    "question": "この内容はあなたのレッスンに合っていましたか？",
    "yes": "はい、それは私のレッスンです",
    "no": "少し違いました",
    "thanksYes": "一致していたとの回答、ありがとうございます。読み済みにします。",
    "thanksNo": "違っていたとの回答、ありがとうございます。参考になります。",
    "whatWasOff": "どの点が違っていましたか？該当するものを選んでください。",
    "notePlaceholder": "可能ならどの部分かご記入ください（一文で十分です）。",
    "send": "送信",
    "sending": "送信中…",
    "didNotSave": "保存できませんでした。",
    "reasons": [
      "自分が言っていない単語があった",
      "誰が話したか混ざっていた",
      "スクリプトや言語が違っていた",
      "自分には簡単すぎる・難しすぎる",
      "その他"
    ]
  },
  "recapLanguage": {
    "question": "記録の説明言語",
    "hint": "学んでいる言語はそのままです。まわりの説明だけがこの言語で書かれます。",
    "hintLearning": "学んでいる{lang}はそのまま。周囲の説明がこの言語になります。",
    "aria": "記録の説明言語",
    "saved": "保存済み — 次回以降の記録から反映されます。",
    "didNotSave": "保存できませんでした。"
  },
  "studentSettings": {
    "eyebrow": "アカウント情報",
    "title": "設定",
    "back": "← レッスン一覧へ戻る",
    "languageTitle": "このページの表示言語",
    "languageDesc": "ボタン・見出しなどレッスン周辺の表記言語です。記録の作成言語は個別設定です（下記をご確認ください）。"
  },
  "lesson": {
    "railAria": "レッスンセクション",
    "thisLesson": "このレッスン",
    "movements": [
      "発話の様子",
      "できたこと",
      "直すこと",
      "扱った内容",
      "今日の語彙",
      "練習",
      "ファイル・音声"
    ],
    "speakingBalance": "発話バランス",
    "score": "スコア",
    "grammarDensity": "文法密度",
    "corrections": "訂正内容",
    "homework": "宿題",
    "noHomework": "このレッスンの宿題はありません。",
    "practiceExercises": "練習問題",
    "wordsFromLesson": "このレッスンからの語彙",
    "whoTalked": "発話者",
    "speakingMeasured": "測定された発話量",
    "yourTeacher": "担当講師"
  },
  "join": {
    "setupFailed": "アカウントのセットアップができませんでした。",
    "acceptFailed": "招待を受け付けできませんでした。",
    "joining": "参加中…",
    "joinAs": "{name}として参加",
    "notYou": "あなたではありませんか？{signOut}して再度このリンクを開いてください。",
    "notYouLink": "サインアウト",
    "emailLabel": "メールアドレス",
    "passwordLabel": "パスワードを決める",
    "passwordHint": "8文字以上",
    "settingUp": "セットアップ中…",
    "createAccount": "アカウントを作成"
  },
  "speaking": {
    "cta": "回答を録音する",
    "sendFailed": "録音の送信に失敗しました。もう一度お試しください。",
    "recordAgain": "もう一度録音",
    "sendToTeacher": "先生に送信",
    "sending": "送信中…",
    "tryAgain": "再試行",
    "keepSent": "送信済みを保持"
  },
  "exchange": {
    "recording": "録音",
    "download": "ダウンロード",
    "nothingShared": "このレッスンでまだ共有されたものはありません。",
    "noFiles": "まだファイルがありません。プレゼンやPDFをアップロードできます。",
    "audioIntro": "この生徒がレッスン用に録音した自主練習。スピーキング練習の回答は[練習]タブにあります。",
    "noAudio": "まだ音声の提出がありません。"
  },
  "charts": {
    "metrics": [
      {
        "label": "スコア",
        "note": "各レッスンの10点満点での評価。"
      },
      {
        "label": "あなたの発話",
        "note": "会話全体のうち自分が話した割合。自信がつくほど高くなります。"
      },
      {
        "label": "ペース",
        "note": "発話時の1分あたり単語数。"
      },
      {
        "label": "考える時間",
        "note": "回答までの間。短いほど反応が早くなっています。"
      },
      {
        "label": "語彙数",
        "note": "すべてのレッスン累計の語数。"
      }
    ],
    "nothingYet": "まだ記録がありません。",
    "sinceLesson": "レッスン{n}以降",
    "trendLater": "次のレッスン後に推移が表示されます。"
  },
  "tests": {
    "saveScoreFailed": "スコアを保存できませんでした。",
    "finish": "終了 — {pct}%",
    "allWords": "すべての語彙"
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
    "defaultsTitle": "レッスン初期設定",
    "defaultsDesc": "レッスン時間や予約受付日数の設定。",
    "lessonName": "レッスン名",
    "lessonNamePlaceholder": "語学レッスン",
    "lessonLength": "レッスン時間（分）",
    "slotInterval": "時間間隔（分）",
    "minNotice": "最小通知時間（時）",
    "bufferBefore": "前の余裕（分）",
    "bufferAfter": "後の余裕（分）",
    "maxPerDay": "1日の最大数",
    "bookingWindow": "予約受付期間（日数）",
    "title": "空き状況",
    "copyMon": "月曜→平日にコピー",
    "copyMonTitle": "月曜の時刻を火〜金に反映",
    "previewBooking": "予約ページを確認 ↗",
    "unavailable": "受付不可",
    "dateOverrides": "日付ごとの上書き"
  },
  "recordings": {
    "eyebrow": "概要",
    "title": "レッスン・記録",
    "settings": "設定",
    "yourStudents": "あなたの生徒",
    "publishedTitle": "公開済みレッスン",
    "publishedDesc": "生徒に閲覧可なもの（新しい順）。レビュー待ちはこの上のキューに残ります。",
    "nothingPublished": "まだ公開済みはありません",
    "untitled": "タイトルなしレッスン",
    "published": "公開済み",
    "draft": "下書き",
    "summaryAria": "レッスン要約",
    "students": "生徒",
    "changedMind": "変更しましたか？",
    "connectCalendar": "カレンダーを接続"
  },
  "lessonRow": {
    "joinCall": "通話に参加 ↗",
    "viewRecap": "記録を見る",
    "reviewRecap": "記録をレビュー",
    "noLink": "リンクなし",
    "eyebrow": "公開前にレビュー",
    "recapTitle": "{title} · レッスン記録",
    "closeAria": "記録レビューを閉じる",
    "draftBanner": "AIによる下書きです。内容を確認してから生徒に送信してください。",
    "score": "スコア",
    "studentTalk": "生徒の発話",
    "grammar": "文法",
    "confidence": "自信度",
    "homework": "宿題",
    "memoScript": "音声メモ台本",
    "teacherNote": "先生メモ",
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
    "loadFailed": "空き状況の読み込みに失敗しました。",
    "bookingFailed": "予約できませんでした。",
    "bookingFailedRetry": "予約できませんでした — 再試行してください。",
    "eyebrow": "レッスンを予約",
    "title": "ご都合の良い時間を検索",
    "sub": "まず日付を、次に時間帯を選択。確認や会議情報はメールで届きます。",
    "booked": "予約が完了しました！",
    "invite": "カレンダー招待が{email}に送信されます。",
    "openMeeting": "会議リンクを開く",
    "noCalendar": "空き状況が取得できません。カレンダーは連携されていますか？",
    "noTimes": "今後30日間に空き時間がありません。",
    "pickDay": "日付を選択",
    "pickDayHint": "ドット付きの日は空きがあります。",
    "yourDetails": "あなたの情報",
    "confirmAt": "{time}で確定",
    "yourName": "あなたの名前",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "あなたのメールアドレス",
    "emailPlaceholder": "you@email.com",
    "booking": "予約中…",
    "bookAt": "レッスン予約 · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "まず生徒から",
        "body": "すべては生徒1人から始まります：レッスン・記録・専用ポータル。生徒を開き、最初の登録を行いましょう。",
        "wait": "生徒を開く"
      },
      {
        "title": "最初の生徒を追加",
        "body": "必要なのは名前と学習言語だけ。メールは不要です。最後に送信用リンクが発行されます。",
        "wait": "生徒を追加"
      },
      {
        "title": "名前と言語のみ",
        "body": "レベルは仮設定、記録の説明言語もここで選択。どちらも後から変更可能なので悩みすぎなくて大丈夫です。",
        "wait": "入力して保存"
      },
      {
        "title": "このリンクを送信",
        "body": "これで受け渡しは完了です。生徒が自身でパスワードを設定し、即時ポータル利用開始。レッスン・語彙・進捗すべてあなたのスタジオ名で表示されます。",
        "wait": ""
      }
    ],
    "skip": "スキップ",
    "replay": "✨ もう一度ガイドを見る"
  },
  "languages": {
    "couldNotSave": "保存できませんでした",
    "title": "あなたの言語設定",
    "desc": "何を教えるか、どの言語でレッスンをするか。新規生徒はここを初期設定にします。",
    "youTeach": "担当する言語",
    "spokenIn": "レッスンで使う言語",
    "fitTitle": "言語設定の重なり",
    "fitDesc": "3つの設定、それぞれ用途が異なります。",
    "fitLearning": "各生徒の「学習言語」で記録やテストが作られます。日本語や韓国語、スペイン語など計{n}言語。生徒追加時に設定、個別ページで変更できます。",
    "fitExplained": "各生徒の「説明言語」は記録本文やテスト指示の言語です。初期設定は英語、個別ページで変更可能。",
    "fitSpoken": "各生徒の「レッスン中の言語」は録音ツールの認識対象言語です。上記設定を引き継ぎますが、生徒ページでいつでも変更可。これ以降、レコーダーから都度確認されません。"
  },
  "notes": {
    "pickStudent": "生徒を選択",
    "empty": "ノートが空です",
    "couldNotSave": "ノートを保存できませんでした",
    "confirmDelete": "このノートを削除しますか？",
    "hoursTaught": "指導時間",
    "recapsPublished": "公開済み記録数",
    "prevMonth": "前の月",
    "nextMonth": "次の月",
    "today": "今日",
    "noStudents": "まだ生徒がいません",
    "student": "生徒",
    "addNote": "ノートを追加",
    "newNote": "新しいノート",
    "editNote": "ノートを編集"
  },
  "exercises": {
    "none": "まだ練習問題はありません。下に追加できます。",
    "instruction": "指示",
    "instructionPlaceholder": "生徒が行う内容",
    "focus": "ポイント",
    "focusPlaceholder": "練習する文法やテーマ",
    "sentence": "文",
    "meaning": "意味",
    "removeSentence": "文を削除",
    "removeOption": "選択肢を削除",
    "questionTarget": "出題文（目標言語）",
    "question": "質問"
  },
  "payments": {
    "selectStudent": "生徒を選択",
    "amountTooLow": "1以上の金額を入力してください",
    "saveFailed": "保存できませんでした",
    "thisMonth": "今月",
    "receivedAllTime": "累計受領額",
    "outstanding": "未払い",
    "currency": "通貨",
    "students": "生徒",
    "prevMonth": "前の月",
    "nextMonth": "次の月",
    "today": "今日",
    "noStudents": "まだ生徒がいません",
    "student": "生徒",
    "recent": "最近の支払い",
    "newPayment": "新しい支払い",
    "editPayment": "支払いを編集",
    "selectPlaceholder": "選択…",
    "amount": "金額（{symbol}）",
    "status": "ステータス",
    "paid": "支払済み",
    "pending": "未払い",
    "covers": "対象内容",
    "coversPlaceholder": "例: 7月パック — 4回分",
    "paymentDate": "支払日",
    "dueDate": "期限日",
    "lessonsCovered": "対象レッスン回数",
    "lessonsPlaceholder": "例: 4",
    "method": "方法",
    "methodPlaceholder": "銀行振込・現金・PayPalなど",
    "confirmDelete": "この支払いを削除しますか？"
  },
  "recapReview": {
    "vocab": "語彙",
    "summary": "要約",
    "summaryPlaceholder": "レッスン要約…",
    "sectionTitle": "セクションタイトル",
    "sectionContent": "セクション内容…",
    "removeSection": "セクションを削除",
    "homeworkTask": "宿題内容",
    "noteTitle": "生徒へのメモ",
    "notePlaceholder": "生徒への個別メッセージ…"
  },
  "connectors": {
    "googleName": "Google カレンダー",
    "googleDesc": "レッスンを読み取り、新しい予約を直接カレンダーへ追加します。",
    "connect": "接続",
    "permissionNeeded": "許可が必要です",
    "reconnect": "再接続",
    "disconnect": "接続解除",
    "zoomDesc": "予約ごとに専用Zoomリンクを自動作成します。",
    "comingSoon": "近日対応",
    "stripeName": "Stripe",
    "stripeDesc": "レッスンパッケージのカード決済を受付 — 直接入金されます。"
  },
  "student": {
    "notJoined": "招待済み（まだ参加していません）",
    "avgScore": "平均スコア",
    "latestTalk": "直近の発話",
    "vocabItems": "語彙数",
    "creditsLeft": "{bought}回中 残り{left}回",
    "creditsOneLeft": "{bought}回中 残り1回",
    "noCredits": "まだレッスン購入がありません",
    "managePayments": "支払い管理 →",
    "lessonsTitle": "レッスン・記録",
    "noLessons": "まだレッスンがありません",
    "noLessonsSub": "この生徒の録音済みレッスンがここに表示されます。",
    "testsTitle": "練習テスト",
    "noTests": "まだテストがありません"
  },
  "addStudent": {
    "levels": [
      "入門",
      "初級",
      "中級前半",
      "中級",
      "中上級",
      "上級"
    ],
    "createFailed": "生徒を作成できませんでした",
    "aria": "新規生徒",
    "title": "新しい生徒",
    "fullName": "氏名",
    "namePlaceholder": "Jane Doe",
    "level": "レベル",
    "learning": "学習言語",
    "choose": "選択…",
    "recapLanguage": "記録の説明言語",
    "trigger": "+ 生徒追加",
    "inviteTitle": "{name}への招待リンク",
    "inviteBody": "普段使っている方法でこのリンクを送信してください。生徒はリンクからメールアドレス・パスワードを設定し、ワークスペースに参加できます。",
    "addAnother": "さらに生徒を追加",
    "copyAgain": "このリンクは{name}の行からいつでも再コピーできます。"
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
    "upcoming": "今後の予定",
    "today": "今日",
    "tomorrow": "明日",
    "prev": "前へ",
    "next": "次へ",
    "fixInSettings": "設定で修正",
    "nothingOn": "{day}の予定はありません。",
    "noLessonsThatDay": "この日のレッスン予定はありません。",
    "agendaClear": "予定はありません。",
    "noUpcoming": "カレンダー上で今後のレッスンはありません。"
  },
  "forgot": {
    "title": "パスワードを再設定",
    "lead": "サインイン時に使用するメールアドレスを入力してください。再設定用のリンクを送信します。",
    "send": "再設定リンクを送信",
    "sending": "送信中…",
    "sent": "{email}にアカウントがあればリセット用リンクが送信されます。メール内リンクから新パスワードの設定を行ってください（1時間有効）。",
    "spam": "届かない場合は迷惑メールフォルダをご確認、もしくは登録アドレスで再試行してください。",
    "remembered": "思い出しましたか？",
    "backToSignIn": "サインイン画面へ戻る"
  },
  "reset": {
    "tooShort": "新しいパスワードは6文字以上にしてください。",
    "mismatch": "2つのパスワードが一致しません。ご確認ください。",
    "samePassword": "以前と同じパスワードは使えません。新しいものを設定してください。",
    "saveFailed": "パスワードを保存できませんでした。再度お試しください。",
    "title": "新しいパスワードを設定",
    "expired": "このリセットリンクは有効期限切れ、または既に使用済みです。新たにリセット申請してください。",
    "noToken": "このページはリセットメールのリンクからのみアクセス可能です。リクエストして受信したリンクを使用してください。",
    "lead": "アカウント用に新しいパスワードを設定してください。保存後すぐサインインされます。",
    "newPassword": "新しいパスワード",
    "repeat": "再入力"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "平均スコア",
        "sub": "すべての評価付きレッスンの10点満点平均。"
      },
      {
        "label": "発話シェア",
        "sub": "レッスン全体で生徒が話した割合。"
      },
      {
        "label": "発話ペース",
        "sub": "発話時の1分あたり単語数。増加が流暢さの目安。"
      },
      {
        "label": "考える時間",
        "sub": "先生の話が終わってから生徒が話し出すまでの秒数。長い間も成長の証です。"
      },
      {
        "label": "1ターンの語数",
        "sub": "1回の発話で話す語数。短い発話の連続は会話というより応答です。"
      },
      {
        "label": "フィラー単語",
        "sub": "1レッスンあたりの「あー」「えー」など。ペースと合わせて比較ください。速いがフィラー多は別の課題、遅くてきれいならまた別です。"
      }
    ],
    "totalLessons": "レッスン総数",
    "acrossStudents": "{n}名分合計",
    "mostActive": "最も活発",
    "nLessons": "{n}レッスン",
    "nothingRecorded": "記録はまだありません",
    "vocabMet": "遭遇した語彙",
    "wordsAcross": "全レッスン総語数",
    "notSeenLately": "最近未受講",
    "everyoneCurrent": "全員受講中",
    "measureAria": "指標",
    "nothingMeasured": "まだ測定データがありません。レッスン録音で追加されます。",
    "perStudent": "{measure} — 生徒別",
    "perStudentSub": "各自のレッスン順。矢印は1回目→最新。",
    "prevMeasure": "前の指標",
    "nextMeasure": "次の指標"
  },
  "test": {
    "heading": "{level}練習テスト",
    "published": "公開済み",
    "draftOnlyYou": "下書き — あなたのみ閲覧可",
    "basedOn": "基になった内容",
    "lessonN": "レッスン{n}",
    "script": "表記",
    "scriptBeginner": "ひらがな＋ローマ字",
    "scriptHiragana": "ひらがな",
    "scriptKanji": "漢字＋かな",
    "created": "作成日",
    "status": "ステータス",
    "speakingAnswer": "音声回答",
    "unplayable": "録音データがありますが再生権限がありません。"
  },
  "trial": {
    "aria": "Lesson Studioへようこそ",
    "kicker": "Lesson Studioへようこそ",
    "title": "最初の{n}件の記録は無料です。",
    "sub": "録音ツールを入れてレッスンを実施、そのまま記録が作成されます。カード登録不要で制限もありません。納得したらプランを選んでください。",
    "showMe": "サービス案内を見る",
    "exploreMyself": "自分で探索する",
    "setUpFirst": "または録音ツールを先に設定 →"
  },
  "reviewQueue": {
    "title": "要確認の記録",
    "desc": "録音から自動作成。あなたの確認・送信後のみ生徒に届きます。",
    "moveFailed": "この記録を移動できませんでした",
    "serverUnreachable": "サーバーへの接続に失敗しました",
    "rebuildFailed": "この記録を再生成できませんでした",
    "deleteFailed": "記録を削除できませんでした"
  },
  "recorderMissing": {
    "title": "録音ツールを追加してください",
    "body": "Lesson Studioはレッスンから記録を作成します。そのためにはChrome拡張の録音が必要です。インストール・サインインが完了するまで、ここは空のままです（他の方法でレッスンを取り込む手段はありません）。"
  },
  "pending": {
    "chooseStudent": "まずレッスン相手を選択してください。",
    "fileFailed": "録音の保存に失敗しました。",
    "confirmDelete": "この録音を削除しますか？音声ファイルも消去されます。",
    "studentAria": "生徒",
    "choosePlaceholder": "生徒を選択",
    "filing": "保存中…",
    "buildRecap": "記録を作成"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "入門",
        "sub": "ひらがな＋ローマ字"
      },
      {
        "label": "ひらがな",
        "sub": "かなのみ（ローマ字なし）"
      },
      {
        "label": "漢字＋かな",
        "sub": "漢字とその読み"
      }
    ],
    "failed": "作成に失敗しました",
    "needLesson": "まずレッスン記録を公開してください",
    "title": "練習テストを作成",
    "explanationLanguage": "説明言語"
  },
  "guide": {
    "eyebrow": "レッスン録音ツール",
    "title": "レッスンを録音し記録を得る",
    "sub": "Chrome拡張がレッスンタブとマイク音声を別々に録音し、下書き記録をここに送ります。ボットの通話参加も生徒側のインストールも不要。Preply、italki、Google Meet、Zoomなどあらゆるタブで使えます。",
    "step1Title": "Chromeウェブストアからインストール",
    "step1Body": "ワンクリックで設定完了。ピン留めも推奨（アドレスバー横のパズルアイコンからKをピン留め）— レッスン中もすぐアクセス可。",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Chromeに追加",
    "addToChrome": "Chromeに追加（無料）↗",
    "betaNote": "フォルダのbeta版でテストしましたか？先にそのコピーを削除してください（{path}→削除）。同時に複数の録音はできません。",
    "step2Title": "サインインは一度だけ",
    "step2Body": "拡張機能を開き、このサイトと同じメールとパスワードでサインイン。それだけで認証され、生徒や担当言語も同期されます。",
    "signIn": "サインイン",
    "step3Title": "レッスンタブを開いて録音開始",
    "step3Body": "実際にレッスンを行うタブ（Preply教室、Meet通話等）でKをクリック、生徒を選び、録音開始。初回はChromeからマイク許可を求められますので、許可してください。ポップアップを閉じてレッスンを始めてください—録音は継続します。",
    "studentLabel": "生徒：",
    "step4Title": "終了時に停止し送信",
    "step4Body": "レッスン終了後にポップアップを開き、“録音を停止”→“Lesson Studioに送信”をクリック。送信ボタンを押すまで音声はアップロードされません。",
    "sendButton": "Lesson Studioに送信 →",
    "step5Title": "記録のレビュー",
    "step5Body": "数分後、下書きが「要確認記録」に表示されます。要約・語彙・宿題など、生徒の言語でまとめられています。必要に応じて編集し、送信すると生徒ポータルに反映されます。",
    "reviewAndSend": "確認して送信",
    "consentTitle": "録音前に確認を",
    "consentBody": "生徒に録音する旨を伝え、同意を得てください。地域によっては参加者全員の同意が必要な場合があります。Preplyやitalkiも録音の規約がありますので、ご確認のうえご利用ください。",
    "dataBody": "録音ツールは両者の声を記録します。送信ボタンを押すまでは音声はアップロードされず、記録作成後ファイルは30日で削除されます。詳細は{policy}をご覧ください。",
    "privacyLink": "プライバシーポリシー"
  },
  "lessonExercises": {
    "none": "このレッスン用の練習はまだありません。",
    "recordReading": "これらを読んで録音",
    "notRecorded": "まだ録音がありません。"
  },
  "lessonTools": {
    "lessonIsWith": "このレッスンの相手：",
    "notLinked": "未連携（テスト/生徒なし）",
    "hint": "生徒と連携すると記録が配信されます。テストの場合は連携不要です。"
  },
  "memo": {
    "back15": "15秒戻る",
    "forward15": "15秒進む",
    "seek": "移動"
  },
  "joinInvalid": {
    "title": "このリンクは無効です",
    "body": "既に使用されたか、講師が新しいリンクを発行した可能性があります。講師に再発行を依頼してください。",
    "goSignIn": "サインイン画面へ"
  },
  "dashboard": {
    "students": "生徒",
    "withLogin": "ログイン済み",
    "lessonsRecorded": "録音済みレッスン",
    "noStudents": "まだ生徒がいません",
    "notJoined": "招待済み（未参加）",
    "lessons": "レッスン",
    "overview": "概要"
  },
  "misc": {
    "outOfTen": "10点満点",
    "dashboardBack": "ダッシュボード",
    "backToOverview": "概要へ戻る",
    "recapGone": "この記録はもう閲覧できません。",
    "timesShared": "共有回数",
    "languageGroup": "言語",
    "extConfirmReset": "全ての端末で録音ツールをサインアウトしますか？サインインし直すまで録音できません。",
    "extResetFailed": "録音ツールの接続をリセットできませんでした。",
    "extSigningOut": "サインアウト中…",
    "extSignOutEverywhere": "すべての録音ツールをサインアウト",
    "howTitle": "レッスンの受け取り方法",
    "howLead": "{platform}で指導するため、ここでは予約はできません。録音ファイルがLesson Studioに届いた時点で自動処理します。",
    "howSteps": [
      {
        "title": "レッスンを録音",
        "body": "ブラウザ録音ツールを利用、またはプラットフォームが出力するファイルをアップロードします。"
      },
      {
        "title": "記録（要約）の作成",
        "body": "要約・語彙・訂正・練習を文字起こしから下書きします。"
      },
      {
        "title": "内容をレビューして公開",
        "body": "必要に応じて編集し、生徒に送信。ポータルで閲覧できます。"
      }
    ],
    "instrStudentChose": "この言語は生徒が自分で選択しました。変更は可能ですが、生徒の選択を反映しています。",
    "instrHint": "記録とテストの説明言語（クリックで変更）",
    "matLinkFailed": "リンクを保存できませんでした",
    "matLinksFailed": "リンクを保存できませんでした",
    "matAddLink": "リンクを追加",
    "confirmDeleteStudent": "この生徒および全レッスンを削除しますか？元に戻せません。",
    "resetPassword": "パスワードを再設定",
    "inviteLink": "招待リンク",
    "uploadFailed": "アップロードに失敗しました",
    "micBlocked": "マイクがブロックされています。ブラウザでマイク許可の設定をしてください。",
    "micBlockedBar": "マイクがブロックされています。アドレスバーで許可し再試行してください。",
    "uploadAFile": "ファイルをアップロード",
    "submitToTeacher": "先生に提出",
    "discardRedo": "やり直す",
    "sendToStudent": "生徒に送信",
    "sendThisAnswer": "この回答を送る",
    "sentTick": "送信済み ✓",
    "vocabByLevelAria": "レベル別語彙",
    "vocabTapHint": "レベルをタップすると該当語彙とその出現レッスンが表示されます。",
    "firstSeenIn": "レッスン{n}で初登場",
    "firstSeen": "初出現",
    "wordsIntroduced": "導入語彙",
    "fromTheLesson": "このレッスンから",
    "goAgain": "もう一度",
    "showWord": "単語を表示",
    "showMeaning": "意味を表示",
    "correction": "訂正",
    "correctionsAria": "訂正内容",
    "noLessonsYet": "まだレッスンがありません"
  }
} as const
