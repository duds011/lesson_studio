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
    "somethingWrong": "問題が発生しました。少し待ってから再度お試しください。"
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "講師ワークスペース",
    "overviewAria": "Lesson Studio 概要",
    "navAria": "講師ワークスペースのナビゲーション",
    "openMenu": "メニューを開く",
    "closeMenu": "メニューを閉じる",
    "expand": "ナビゲーションを拡げる",
    "collapse": "ナビゲーションをたたむ",
    "sectionWorkspace": "ワークスペース",
    "sectionManage": "管理",
    "overview": "概要",
    "students": "生徒",
    "notes": "メモ",
    "materials": "教材",
    "studentView": "生徒画面",
    "payments": "支払い",
    "availability": "空き状況",
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
    "signInSub": "お帰りなさい。サインインするとレッスン、進捗、レッスンまとめが確認できます。",
    "signInExpired": "セッションがタイムアウトしました。再度サインインしてください。元の画面に戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めてご利用ですか？",
    "createAccountLink": "講師アカウントを作成",
    "freeToSetUp": "設定無料ですぐに最初の生徒を追加できます。",
    "studentQuestion": "生徒の方ですか？",
    "studentAnswer": "講師から招待リンクが届きます。リンクを開き、メールアドレスとパスワードを自分で設定します。その後、この画面からサインインします。",
    "signInHeadline": "すべてのレッスンを記録で残します。",
    "signInAside": "Lesson Studioは毎回のレッスンを記録化し、まとめ、進捗表、練習を作成します。講師・生徒のどちらにも表示されます。",
    "signUpTitle": "講師アカウントを作成",
    "signUpSub": "Koku Libraryのワークスペースを作成し、生徒管理・レッスンまとめ・予約・進捗確認を始めましょう。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウントを作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウント作成ができませんでした。",
    "createdNowSignIn": "アカウント作成完了 — サインインしてください。",
    "haveAccount": "すでにアカウントをお持ちですか？",
    "signUpHeadline": "指導のすべてを、ひとつの場所に。",
    "signUpAside": "数分で準備ができます。生徒を追加し、次回レッスンを録音すれば、あとは自動で構築されます。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンは自動でまとめになります",
        "body": "Chrome拡張が双方の音声を録音します。まとめが下書きとして届きます—編集して公開します。"
      },
      {
        "title": "進捗が「見える化」されます",
        "body": "スコア、発話時間、語彙をレッスンごとに記録。生徒のページに集約されます。"
      },
      {
        "title": "どんな言語にも対応",
        "body": "日本語やフランス語、韓国語、スペイン語など30種類以上—レッスンの言語で添削、学習者の言語で解説されます。"
      },
      {
        "title": "生徒自身の言葉で練習",
        "body": "レッスン中に出た語彙から単語カードとスピーキングテストを自動生成します。"
      },
      {
        "title": "自分の名前が入った生徒ポータル",
        "body": "色や表記、必要なセクションのみ表示できます。"
      }
    ]
  },
  "onboarding": {
    "steps": [
      "あなたのレッスン",
      "会う場所",
      "カレンダー",
      "生徒ビュー",
      "録音ツール"
    ],
    "sideTitle": "スタジオの初期設定をします。",
    "sideBody": "4ステップで生徒専用のポータルができます。",
    "stepCount": "ステップ {n} / {total}",
    "choose": "選択…",
    "continueAction": "続ける",
    "finish": "設定を完了",
    "finishing": "完了中…",
    "couldNotSave": "保存できませんでした",
    "couldNotFinish": "完了できませんでした",
    "pickTeaching": "教える言語を選択してください。",
    "pickSpoken": "レッスンで使う話し言葉を選んでください。",
    "pickCalendar": "レッスン予定の管理について教えてください。",
    "pickPortalName": "ポータルの名前を設定してください（生徒に表示されます）。",
    "teachAria": "教える言語",
    "iTeach": "教える言語：",
    "teachHint": "まとめや練習問題はこの言語用に作成されます。新規追加の生徒はこの設定が初期値になりますが、生徒ごとに後から変更可能です。",
    "spokenAria": "レッスン中の話し言葉",
    "spokenIn": "主に話す言語：",
    "spokenHint": "学習対象言語とは限りません。初級者は共通の言語で進むことがあります。録音もこの言語で分析します。",
    "timezone": "タイムゾーン",
    "platformTitle": "生徒と会う場所は？",
    "platformLead": "MeetやZoomでは予約時にリンクを生成します。マーケットプレイスなら部屋自体が既存なので、既存リンクをそのまま使います。",
    "zoomLater": "Zoomは後で設定で接続可能です",
    "stayOutTitle": "レッスン自体には関与しません",
    "stayOutBody": "リンク生成やbot送信なし。ご自身でレッスンを録音し、まとめ・語彙・練習がそこから作られます。生徒体験は同じです。",
    "calendarTitle": "レッスン管理方法",
    "calendarLeadExternal": "{platform}を使っていてもGoogleカレンダーを利用する講師もいれば、ずっとプラットフォーム内で管理する方もいます。選択内容で画面表示が変わります。",
    "calendarLead": "生徒との予定がGoogleカレンダーに登録されていれば週を読み込み、予約や自動録音が行なえます。他で管理している場合、カレンダー連携機能は使用しません。",
    "googleConnected": "Googleカレンダー接続済み",
    "googleConnectedSub": "どのカレンダーを利用するかは設定で選べます。",
    "connectGoogle": "Googleカレンダーに接続",
    "connectGoogleFine": "Googleの画面へ移動して同意後に戻ります。接続しなくても利用できますが、予約や自動録音はこの時点では無効となります。",
    "recordTitle": "レッスンを録音",
    "recordBody": "どの環境でも、レッスンを録音しLesson Studioへ渡します。",
    "reviewTitle": "まとめを確認",
    "reviewBody": "まとめは他のレッスン同様にレビュー待ちの一覧に入ります。公開すると生徒に届きます。",
    "noCalendarFine": "カレンダーがなければ予約・催促は無し。初期画面はレッスンとまとめだけです。変更は設定からいつでも可能です。",
    "brandTitle": "名前や色を決める",
    "brandLead": "生徒がログインするポータルの色・名前をお選びください。細かな調整は後から可能です。",
    "portalNameLabel": "生徒用ポータル名",
    "portalNamePlaceholder": "例）さくら日本語",
    "portalNameFine": "生徒ポータルの上部や招待メールに表示される名前です。ご自身の教室名を自由に設定できます。",
    "accent": "アクセントカラー",
    "previewTagline": "Learn today, succeed tomorrow!",
    "recorderTitle": "録音ツールのインストール",
    "recorderLead": "主な作業はここです。Chrome拡張がレッスンを録音しまとめを書きます。botは参加せず、生徒側にも何もインストール不要です。",
    "recorderStep1": "**Chromeウェブストアから追加** — 1クリック後、ツールバーへピン留め。",
    "recorderStep2": "**拡張機能内でサインイン** — 本サイトと同じメール・パスワードを入力。何も移す必要はありません。",
    "recorderStep3": "**レッスンを録音** — 生徒を選び、開始、終了で停止します。",
    "addToChrome": "Chromeに追加 — 無料 ↗",
    "recorderFine": "詳細な手順（マイク許可や録音内容）は{guide}をご参照ください。**設定 → レッスン録音**でも後から確認できます。",
    "recorderFineLink": "セットアップガイド"
  },
  "overview": {
    "eyebrow": "概要",
    "title": "講師カレンダー",
    "manageConnections": "接続を管理",
    "fixInSettings": "設定で修正",
    "summaryAria": "レッスン要約",
    "upcoming": "今後のレッスン",
    "drafts": "レビュー待ち下書き",
    "draftsSub": "あなたによる承認待ちまとめ",
    "published": "公開済みまとめ",
    "publishedSub": "生徒に送信済み",
    "writeUpsLeft": "まとめ残数",
    "writeUpsAria": "まとめ残数 — 追加購入",
    "usageTrial": "{total}件中{used}件利用済み",
    "usageBought": "{used}件作成済み · 期限なし",
    "lessonCalendar": "レッスンカレンダー",
    "primaryCalendar": "（主要）"
  },
  "connect": {
    "title": "Googleカレンダーに接続",
    "body": "カレンダーを接続すると今後のレッスン確認・予約・自動録音ができます。",
    "notConfigured": "Google OAuthが未設定です。{id}と{secret}を環境に追加し、再起動してください。",
    "scopeRead": "**カレンダーを読み取り** — レッスンやリンクを取得します",
    "scopeRecord": "**レッスン録音** — Lesson Studio拡張で録音します",
    "scopeRecap": "**まとめ作成** — AIによるまとめを提出・共有できます",
    "continueGoogle": "Googleで続行",
    "fine": "Googleの同意画面に遷移します。この設定は後から変更できます。"
  },
  "settings": {
    "eyebrow": "ワークスペース",
    "title": "設定",
    "recorderTitle": "レッスン録音",
    "recorderDesc": "レッスンを録音しまとめにするChrome拡張です。{guide}",
    "recorderGuide": "手順ガイド →",
    "replayTourHint": "各ページの使い方を忘れた時は、ここから再度見ることができます。",
    "languageTitle": "言語",
    "languageDesc": "このワークスペース表示言語です。まとめの言語設定には影響しません。生徒ごとに別途設定できます。",
    "connectionsTitle": "連携サービス",
    "connectionsDesc": "スケジュール・会議・支払いの各種サービスを連携します。",
    "livesTitle": "レッスンの管理方法",
    "livesDesc": "Googleカレンダー管理の場合、予約ページや空きスロット管理・自動録音が利用可能。他サービス利用時はこうした機能は非表示となり、録音から運用します。",
    "calendarTitle": "レッスンカレンダー",
    "calendarDesc": "Lesson Studioが読む対象カレンダーを選択してください。",
    "primaryCalendar": "メインカレンダー",
    "speakingTitle": "スピーキング課題",
    "speakingDesc": "すべてのまとめの最後に3つのスピーキング課題があります。生徒は録音で提出でき、あなたのレッスンページ下に表示。提出時メール通知も可能。無効にするとこれら3課題がまとめから削除されます。",
    "speakingOn": "生徒による録音を許可",
    "speakingOnHint": "レッスンページで録音を再生できます",
    "speakingOff": "課題を出さない",
    "speakingOffHint": "まとめは7問の筆記課題のみになります",
    "platformTitle": "デフォルト会議サービス",
    "platformDesc": "新規予約で生成されるサービスです。マーケットプレイスを使う場合は最後を選択してください（既存リンク利用）。",
    "meetLabel": "Google Meet",
    "meetHint": "カレンダー上で自動生成されます",
    "ownLinkLabel": "独自リンクの共有",
    "ownLinkHint": "Preplyやitalki、独自ルーム利用"
  },
  "billing": {
    "leftTitle": "まとめ残数",
    "leftDesc": "まとめ作成1回ごとに1つ消費します。期限なし、自動更新もありません。",
    "ofFree": "無料まとめ{total}件中",
    "ofFreeUsed": "無料まとめ{total}件中 · {used}件利用",
    "builtSoFar": "これまでに{used}件作成",
    "emptyTrial": "無料分を使い切りました。下記からまとめを追加購入できます。サブスクリプションや自動更新はありません。",
    "emptyPaid": "残高が空です。下記のパックから追加購入でき、未使用分は残ります。",
    "addTitle": "まとめを追加購入",
    "addDesc": "一括払い、更新なし。大きいパックほど割安ですが、小パックでも損はなく、まとめは消えることはありません。",
    "lessonsWrittenUp": "まとめ作成レッスン数",
    "save": "{pct}%お得",
    "neverExpires": "有効期限なし",
    "buy": "{n}件購入",
    "paidOnce": "Stripe経由のカード一括払い。カード情報は保存されず、追加請求もありません。",
    "packTags": [
      "初めての方",
      "安定した予定用",
      "人気"
    ]
  },
  "recap": {
    "tabs": [
      "進捗",
      "まとめ",
      "宿題",
      "語彙"
    ],
    "tabsAria": "まとめ内セクション",
    "eyebrow": "送信前の確認",
    "title": "{name} · レッスンまとめ",
    "lessonFallback": "レッスン",
    "sub": "各タブを確認し、{first}に送信してください。",
    "translate": "解説を翻訳",
    "translateTitle": "解説部分のみ生徒の言語で表示。レッスン内容やスコアは変更されません",
    "working": "処理中…",
    "rebuild": "録音から再生成",
    "rebuildTitle": "最新AI＋指標で録音から再作成",
    "rebuilding": "再生成中…",
    "deleteDraft": "下書きを削除",
    "deleting": "削除中…",
    "saveDraft": "下書きを保存",
    "approve": "承認・送信",
    "sending": "送信中…",
    "savedTick": "保存済み ✓",
    "confirmRebuild": "このまとめを録音から再生成しますか？ 要約、各セクション、宿題や流暢さの指標をごっそり再作成します。手動編集は消えます。",
    "confirmTranslate": "このまとめの解説部分を生徒の理解言語に翻訳しますか？ 例文・引用・スコアには影響しません。",
    "confirmDelete": "{name}さんの下書きまとめを削除しますか？「まとめレビュー待ち」から消去され、元に戻せません。",
    "promptLanguage": "この生徒には解説言語が未設定です（生徒ページで設定可能）。どの言語に翻訳しますか？",
    "rebuildFailed": "再生成に失敗しました",
    "translationFailed": "翻訳に失敗しました",
    "deleteFailed": "まとめを削除できませんでした",
    "savingEdits": "編集内容を保存中…",
    "uploadingMemo": "ボイスメモをアップロード中…",
    "uploadingFile": "{name}をアップロード中…",
    "attachingMaterials": "教材を添付中…",
    "attachmentFailed": "まとめは送信されましたが、添付に失敗しました。レッスンページから再追加してください。",
    "suggestedScript": "推奨スクリプト"
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
      "statLessons": "レッスン数",
      "statScore": "平均スコア",
      "statSpeaking": "発話量",
      "lessonsTitle": "あなたのレッスン",
      "progressTitle": "進捗",
      "vocabTitle": "語彙",
      "milestoneTitle": "次の到達目標",
      "scoresTitle": "最近のスコア",
      "testsTitle": "練習テスト",
      "speakingTitle": "発話の傾向",
      "filesTitle": "レッスンファイル",
      "vocabTotalsTitle": "語彙の増加"
    },
    "tabsAria": "ダッシュボードのセクション",
    "notLinked": "アカウントはまだ連携されていません",
    "askTeacher": "講師にアカウント連携を依頼してください。",
    "climbLed": "「聞くだけ」から{em}になりました。",
    "climbLedEm": "会話の主導権を取る",
    "climbMore": "開始時より{em}発話しています。",
    "climbMoreEm": "{delta}ポイント増",
    "climbPlain": "前回レッスンで{em}発話しました。",
    "youSpoke": "あなたの発話量",
    "acrossLessons": "{n}回のレッスンで",
    "acrossOneLesson": "1回のレッスンで",
    "climbSub": "弧上の印は開始時（{then}）です。",
    "climbDelta": "レッスン1回目から{delta}ポイント",
    "inLast30": "直近30日で{n}回",
    "totalLessons": "累計レッスン修了数",
    "inAll": "合計{n}回",
    "words": "{n}語",
    "lastN": "直近{n}回",
    "metricPace": "話す速さ",
    "metricThinking": "考えた時間",
    "metricShare": "自分の発話比率",
    "practiseTitle": "語彙の練習",
    "practiceHistory": "過去2週間分の練習",
    "byKind": "単語種別ごと",
    "byLesson": "レッスンごと",
    "practiseAnything": "全て練習",
    "practiseDue": "復習が必要な語彙のみ",
    "vocabKnown": "習得済み",
    "vocabLearning": "学習中",
    "vocabNew": "未学習",
    "download": "ダウンロード"
  },
  "practice": {
    "emptyTitle": "まだ練習するものがありません",
    "emptyBody": "講師がまとめを公開すると、ここに単語が表示されます。",
    "howMany": "今日は何語練習しますか？",
    "doneTitle": "完了 — {n}枚カード",
    "doneOneTitle": "完了 — 1枚のカード",
    "allFirstTime": "すべて初回分です。数日後にまた表示されます。",
    "someMissed": "{right}語は初回クリア、{missed}語は再出題されます。",
    "moreLeft": "この束にはあと{n}語残っています。好きな時に練習できます。",
    "oneLeft": "この束にはあと1語残っています。好きな時に練習できます。",
    "wholePile": "これで全て練習しました。",
    "nextRound": "次の{n}語",
    "practiseAgain": "もう一度練習",
    "backToPractice": "練習へ戻る",
    "tapToSee": "意味を見るにはタップしてください",
    "again": "再度",
    "knewIt": "できた",
    "sayOutLoud": "裏返す前に声に出して言ってみましょう。"
  },
  "rating": {
    "question": "このまとめはレッスン内容と合っていましたか？",
    "yes": "はい、私のレッスンでした",
    "no": "少し違いました",
    "thanksYes": "一致したとご回答いただきました。確認済みとします。",
    "thanksNo": "一致しなかったとご回答いただきました。貴重なご意見ありがとうございます。",
    "whatWasOff": "違った内容は？該当するものを選択してください。",
    "notePlaceholder": "可能なら具体的な箇所を教えてください（1文でも十分です）",
    "send": "送信",
    "sending": "送信中…",
    "didNotSave": "保存できませんでした。",
    "reasons": [
      "話していない単語が含まれている",
      "発話者が正しく識別されていない",
      "スクリプトや言語が違う",
      "難易度が合っていない",
      "その他"
    ]
  },
  "recapLanguage": {
    "question": "まとめの解説言語",
    "hint": "学習中言語はそのまま。周囲の説明文のみこの言語に変わります。",
    "aria": "まとめ解説の言語選択",
    "saved": "保存済み — 次回まとめから有効です。",
    "didNotSave": "保存できませんでした。"
  },
  "lesson": {
    "railAria": "レッスンの各セクション",
    "thisLesson": "このレッスン",
    "movements": [
      "発話の様子",
      "できたこと",
      "今後の課題",
      "今回扱った内容",
      "今日出た単語",
      "練習",
      "ファイル・音声"
    ],
    "speakingBalance": "発話バランス",
    "score": "スコア",
    "grammarDensity": "文法密度",
    "corrections": "添削",
    "homework": "宿題",
    "noHomework": "今回のレッスンには宿題はありません。",
    "practiceExercises": "練習課題",
    "wordsFromLesson": "このレッスンで出た単語",
    "whoTalked": "誰が話したか",
    "speakingMeasured": "測定された発話内容",
    "yourTeacher": "講師"
  },
  "join": {
    "setupFailed": "アカウントの初期設定ができませんでした。",
    "acceptFailed": "招待を受け入れられませんでした。",
    "joining": "参加中…",
    "joinAs": "{name} として参加",
    "notYou": "他の方ですか？{signOut}してリンクを再度開いてください。",
    "notYouLink": "サインアウト",
    "emailLabel": "メールアドレス",
    "passwordLabel": "パスワードを設定",
    "passwordHint": "8文字以上",
    "settingUp": "設定中…",
    "createAccount": "アカウントを作成"
  },
  "speaking": {
    "cta": "録音して答える",
    "sendFailed": "録音を送信できませんでした。もう一度お試しください。",
    "recordAgain": "もう一度録音",
    "sendToTeacher": "講師に送信",
    "sending": "送信中…",
    "tryAgain": "再試行",
    "keepSent": "送信済みを残す"
  },
  "exchange": {
    "recording": "録音",
    "download": "ダウンロード",
    "nothingShared": "このレッスン用に共有されたものはまだありません。",
    "noFiles": "まだファイルがありません。発表資料やPDFなどをアップロードしてください。",
    "audioIntro": "生徒がこのレッスンのために録音した自由練習です。課題への回答は練習タブにあります。",
    "noAudio": "まだ音声が提出されていません。"
  },
  "charts": {
    "metrics": [
      {
        "label": "スコア",
        "note": "各レッスンが10点満点中で評価されます。"
      },
      {
        "label": "あなたの発話量",
        "note": "レッスン内の発話割合。自信がついてくると割合が増えます。"
      },
      {
        "label": "話す速さ",
        "note": "話している間の1分あたりの単語数。"
      },
      {
        "label": "考えた時間",
        "note": "返答までの間隔。短いほど言葉が素早く出ています。"
      },
      {
        "label": "語彙数",
        "note": "全レッスンの単語を合計した数。"
      }
    ],
    "nothingYet": "まだ記録がありません。",
    "sinceLesson": "レッスン{n}以降",
    "trendLater": "次回以降データ推移が表示されます。"
  },
  "tests": {
    "saveScoreFailed": "スコアを保存できませんでした。",
    "finish": "完了 — {pct}%",
    "allWords": "今までの全語彙"
  },
  "availability": {
    "days": [
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
      "日曜日"
    ],
    "startTime": "開始時刻",
    "endTime": "終了時刻",
    "removeRange": "範囲を削除",
    "couldNotSave": "保存できませんでした",
    "saveChanges": "変更を保存",
    "defaultsTitle": "レッスン初期設定",
    "defaultsDesc": "レッスンの長さや予約受付期間の初期値です。",
    "lessonName": "レッスン名",
    "lessonNamePlaceholder": "語学レッスン",
    "lessonLength": "レッスン時間（分）",
    "slotInterval": "枠間隔（分）",
    "minNotice": "最短事前通知（時間）",
    "bufferBefore": "前バッファ（分）",
    "bufferAfter": "後バッファ（分）",
    "maxPerDay": "1日最大数",
    "bookingWindow": "予約期間（営業日）",
    "title": "空き状況",
    "copyMon": "月曜→平日へコピー",
    "copyMonTitle": "月曜日の時間帯を火〜金曜日に同じ内容でコピー",
    "previewBooking": "予約ページをプレビュー ↗",
    "unavailable": "予約不可",
    "dateOverrides": "日程の上書き"
  },
  "recordings": {
    "eyebrow": "概要",
    "title": "レッスン・まとめ",
    "settings": "設定",
    "yourStudents": "担当生徒",
    "publishedTitle": "公開済みレッスン",
    "publishedDesc": "生徒が既に閲覧できるもの（最新順）。下書きは上のレビュー待ちに表示。",
    "nothingPublished": "まだ公開されていません",
    "untitled": "無題レッスン",
    "published": "公開済み",
    "draft": "下書き",
    "summaryAria": "レッスン要約",
    "students": "生徒",
    "changedMind": "内容を変更したい場合",
    "connectCalendar": "カレンダーを接続"
  },
  "lessonRow": {
    "joinCall": "通話に参加 ↗",
    "viewRecap": "まとめを見る",
    "reviewRecap": "まとめを確認",
    "noLink": "リンクなし",
    "eyebrow": "公開前の確認",
    "recapTitle": "{title} · レッスンまとめ",
    "closeAria": "まとめ確認画面を閉じる",
    "draftBanner": "AI下書き — 生徒に届く前に内容を確認・編集してください。",
    "score": "スコア",
    "studentTalk": "生徒発話量",
    "grammar": "文法",
    "confidence": "自信度",
    "homework": "宿題",
    "memoScript": "ボイスメモ用スクリプト",
    "teacherNote": "講師メモ",
    "editLater": "後で編集",
    "approveSend": "承認して生徒へ送信"
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
    "eyebrow": "レッスン予約",
    "title": "都合の良い時間を探す",
    "sub": "日付を選択し、時間を選んでください。詳細と確認はメールで届きます。",
    "booked": "予約が完了しました！",
    "invite": "カレンダーへの招待が{email}に送信されました。",
    "openMeeting": "ミーティングリンクを開く",
    "noCalendar": "空き状況が取得できません。カレンダーが接続されていますか？",
    "noTimes": "30日以内に空いているレッスン枠がありません。",
    "pickDay": "日付を選ぶ",
    "pickDayHint": "ドットが表示されている日は予約可能です。",
    "yourDetails": "ご本人情報",
    "confirmAt": "{time}で確定",
    "yourName": "お名前",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "メールアドレス",
    "emailPlaceholder": "you@email.com",
    "booking": "予約中…",
    "bookAt": "レッスン予約 · {time}"
  },
  "tour": {
    "steps": [
      {
        "title": "概要",
        "body": "ホーム画面です。まとめはここへ届きます。下に最新レッスンも表示されます。"
      },
      {
        "title": "生徒",
        "body": "担当生徒をここで追加。各生徒のレッスン・テスト・進捗は一覧から確認できます。また生徒ごとのポータルで管理可能です。"
      },
      {
        "title": "メモ",
        "body": "レッスンごとに1クリックで記録。月別カレンダーには指導日誌として使えます。"
      },
      {
        "title": "生徒画面",
        "body": "生徒から見た画面そのものです。色・名称・見せる項目を自由にカスタマイズ。本物の画面です。"
      },
      {
        "title": "支払い",
        "body": "生徒からの支払い記録と、それが何回分かの管理。まとめが公開されるごとに残高が減ります。"
      },
      {
        "title": "設定",
        "body": "カレンダー、録音ツール、アカウント設定。ツアーもここに再表示できます。"
      }
    ],
    "skip": "ツアーをスキップ"
  },
  "languages": {
    "couldNotSave": "保存できませんでした",
    "title": "あなたの言語設定",
    "desc": "教える言語、レッスン中に話す言語。新しい生徒の初期設定になります。",
    "youTeach": "教える言語",
    "spokenIn": "レッスン中の会話言語",
    "fitTitle": "言語設定の役割",
    "fitDesc": "3つの設定、それぞれ異なる役割です。",
    "fitLearning": "**「学習言語」**はまとめやテストの生成時に使う言語です。日本語・韓国語からスペイン語・アラビア語まで{n}言語対応。生徒追加時に設定し、後から変更も可能です。",
    "fitExplained": "**「解説言語」**はまとめ本文やテスト指示文に使う言語です。デフォルトは英語ですが、生徒ページで変更できます。",
    "fitSpoken": "**「レッスン内の会話言語」**は録音内容をAIが認識する対象言語です。上で選んだ設定が適用され、個別生徒ページで変更もできます。毎回の確認は不要です。"
  },
  "notes": {
    "pickStudent": "生徒を選択してください",
    "empty": "メモはありません",
    "couldNotSave": "メモを保存できませんでした",
    "confirmDelete": "このメモを削除しますか？",
    "hoursTaught": "指導時間",
    "recapsPublished": "公開まとめ数",
    "prevMonth": "前月",
    "nextMonth": "次月",
    "today": "今日",
    "noStudents": "生徒がいません",
    "student": "生徒",
    "addNote": "メモを追加",
    "newNote": "新規メモ",
    "editNote": "メモを編集"
  },
  "exercises": {
    "none": "課題はまだありません。下欄から追加できます。",
    "instruction": "指示文",
    "instructionPlaceholder": "生徒への課題内容",
    "focus": "重点項目",
    "focusPlaceholder": "この文で練習させるもの",
    "sentence": "文",
    "meaning": "意味",
    "removeSentence": "文を削除",
    "removeOption": "選択肢を削除",
    "questionTarget": "質問（学習言語）",
    "question": "質問"
  },
  "payments": {
    "selectStudent": "生徒を選択",
    "amountTooLow": "1以上の金額を入力してください",
    "saveFailed": "保存できませんでした",
    "thisMonth": "今月",
    "receivedAllTime": "累計受領額",
    "outstanding": "未収",
    "currency": "通貨",
    "students": "生徒",
    "prevMonth": "前月",
    "nextMonth": "次月",
    "today": "今日",
    "noStudents": "生徒がいません",
    "student": "生徒",
    "recent": "最近の支払い",
    "newPayment": "新規支払い",
    "editPayment": "支払いを編集",
    "selectPlaceholder": "選択…",
    "amount": "金額（{symbol}）",
    "status": "ステータス",
    "paid": "支払い済み",
    "pending": "保留中",
    "covers": "対象内容",
    "coversPlaceholder": "例：7月パック — 4回分",
    "paymentDate": "支払い日",
    "dueDate": "支払期限",
    "lessonsCovered": "回数",
    "lessonsPlaceholder": "例：4",
    "method": "支払い方法",
    "methodPlaceholder": "銀行振込・現金・PayPalなど",
    "confirmDelete": "この支払い情報を削除しますか？"
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
    "googleName": "Googleカレンダー",
    "googleDesc": "レッスンの読み出しや新規予約の書き込みを自動化します。",
    "connect": "接続",
    "permissionNeeded": "許可が必要です",
    "reconnect": "再接続",
    "disconnect": "切断",
    "zoomDesc": "予約ごとに固有のZoom会議室を自動生成します。",
    "comingSoon": "近日公開予定",
    "stripeName": "Stripe",
    "stripeDesc": "レッスンパックのカード決済を受け付けます — 売上は直接着金します。"
  },
  "student": {
    "notJoined": "招待済み — まだ参加していません",
    "avgScore": "平均スコア",
    "latestTalk": "最新の発話量",
    "vocabItems": "語彙アイテム数",
    "creditsLeft": "残り{left}回 / {bought}回購入済み",
    "creditsOneLeft": "残り1回 / {bought}回購入済み",
    "noCredits": "まだ購入実績がありません",
    "managePayments": "支払い管理 →",
    "lessonsTitle": "レッスン・まとめ",
    "noLessons": "レッスンはありません",
    "noLessonsSub": "この生徒の録音済レッスンがここに表示されます。",
    "testsTitle": "練習テスト",
    "noTests": "テストはありません"
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
    "recapLanguage": "まとめ解説言語"
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
    "nothingOn": "{day}は予定がありません。",
    "noLessonsThatDay": "この日はレッスンの予定がありません。",
    "agendaClear": "予定はありません。",
    "noUpcoming": "このカレンダーには今後のレッスンがありません。"
  },
  "forgot": {
    "title": "パスワードをリセット",
    "lead": "サインインに使用したメールアドレスを入力してください。リセット用リンクを送信します。",
    "send": "リセットリンクを送信",
    "sending": "送信中…",
    "sent": "{email}にアカウントがあれば、リセット用リンクを送信しました。メールの案内に従い1時間以内にリセットを完了してください。",
    "spam": "届かない場合は迷惑メールもご確認ください。または登録アドレスでもう一度お試しください。",
    "remembered": "パスワードを思い出しましたか？",
    "backToSignIn": "サインイン画面へ戻る"
  },
  "reset": {
    "tooShort": "新しいパスワードは6文字以上必要です。",
    "mismatch": "2つのパスワードが一致しません。再度ご確認ください。",
    "samePassword": "以前と同じパスワードです。新しいものを設定してください。",
    "saveFailed": "パスワードを保存できませんでした。再度お試しください。",
    "title": "新しいパスワードを設定",
    "expired": "このリセットリンクは有効期限切れ、または既に使用済みです。新たにリクエストしてやり直してください。",
    "noToken": "このページは、パスワードリセットメール内のリンクからのみ有効です。新たにリクエストしてください。",
    "lead": "新しいパスワードを設定すると同時にサインインされます。",
    "newPassword": "新しいパスワード",
    "repeat": "もう一度入力"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "平均スコア",
        "sub": "全レッスン10点満点の平均値"
      },
      {
        "label": "発話の割合",
        "sub": "レッスン中に生徒がどのくらい話していたか"
      },
      {
        "label": "話す速さ",
        "sub": "発話時の1分あたりの単語数。上昇は流暢さの証です。"
      },
      {
        "label": "考えた時間",
        "sub": "講師の発話終了から生徒返答までの秒数。長い間も大切な学習時間です。"
      },
      {
        "label": "1ターンあたり単語数",
        "sub": "生徒が1回の発話で話す単語数。短く速いと反射的な答え、長いと会話です。"
      },
      {
        "label": "フィラー単語",
        "sub": "1レッスンあたりの「えー」「あのー」など。速さとセットで見ると問題点が分かります。"
      }
    ],
    "totalLessons": "合計レッスン数",
    "acrossStudents": "{n}人の生徒について",
    "mostActive": "最も活動的",
    "nLessons": "{n}回のレッスン",
    "nothingRecorded": "まだ記録なし",
    "vocabMet": "出会った語彙数",
    "wordsAcross": "全レッスン合計語数",
    "notSeenLately": "最近受講なし",
    "everyoneCurrent": "全員最新状況です",
    "measureAria": "指標",
    "nothingMeasured": "まだ記録がありません。レッスン録音で自動記録されます。",
    "perStudent": "{measure} — 生徒ごと",
    "perStudentSub": "各生徒のレッスン順。矢印は最初→最新。",
    "prevMeasure": "前指標",
    "nextMeasure": "次指標"
  },
  "test": {
    "heading": "{level} 練習テスト",
    "published": "公開済み",
    "draftOnlyYou": "下書き — あなたのみ閲覧可",
    "basedOn": "基準",
    "lessonN": "レッスン{n}",
    "script": "スクリプト",
    "scriptBeginner": "ひらがな＋ローマ字",
    "scriptHiragana": "ひらがな",
    "scriptKanji": "漢字＋かな",
    "created": "作成日時",
    "status": "公開状況",
    "speakingAnswer": "スピーキング解答",
    "unplayable": "録音がありますが再生用署名を生成できませんでした。"
  },
  "trial": {
    "aria": "Lesson Studio へようこそ",
    "kicker": "Lesson Studio へようこそ",
    "title": "最初の{n}件のまとめは無料です。",
    "sub": "録音ツールを入れてレッスンをしてみてください。まとめが自動で届きます。カード不要・追加料金無し。必要性を感じた時にプランを選べます。",
    "showMe": "案内を見る",
    "exploreMyself": "自分で試す",
    "setUpFirst": "または録音ツールを先に設定 →"
  },
  "reviewQueue": {
    "title": "まとめレビュー待ち",
    "desc": "録音から生成。レビュー・送信しない限り生徒に届きません。",
    "moveFailed": "まとめの移動ができませんでした",
    "serverUnreachable": "サーバに接続できませんでした",
    "rebuildFailed": "まとめの再生成ができませんでした",
    "deleteFailed": "まとめを削除できませんでした"
  },
  "recorderMissing": {
    "title": "録音ツールの追加が必要です",
    "body": "Lesson Studioでまとめを作るにはChrome拡張（録音ツール）が必要です。インストール・サインインするまで何も届きません。他の方法でレッスンを追加することはできません。"
  },
  "pending": {
    "chooseStudent": "誰とのレッスンかをまず選択してください。",
    "fileFailed": "この録音の登録ができませんでした。",
    "confirmDelete": "この録音を削除しますか？音声ファイルも消去されます。",
    "studentAria": "生徒",
    "choosePlaceholder": "生徒を選ぶ",
    "filing": "登録中…",
    "buildRecap": "まとめ作成"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "初心者",
        "sub": "ひらがな＋ローマ字"
      },
      {
        "label": "ひらがな",
        "sub": "かなのみ（ローマ字なし）"
      },
      {
        "label": "漢字＋かな",
        "sub": "漢字＋読み"
      }
    ],
    "failed": "生成失敗",
    "needLesson": "まとめ公開が必要です",
    "title": "練習テストを自動生成",
    "explanationLanguage": "解説言語"
  },
  "guide": {
    "eyebrow": "レッスン録音",
    "title": "レッスンを録音し、まとめを受け取る",
    "sub": "Chrome拡張がレッスン用タブ・マイクを別々に録音し、ここでまとめ下書きを自動生成します。botは参加せず生徒側へインストール不要。Preply・italki・Google Meet・Zoom等のブラウザレッスンに対応。",
    "step1Title": "Chromeウェブストアから追加",
    "step1Body": "1クリックで設定不要。パズルアイコンをクリックしKマークをツールバーにピン留めしておくと便利です。",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Chromeに追加",
    "addToChrome": "Chromeに追加 — 無料 ↗",
    "betaNote": "**フォルダのベータ版をお試しですか？** 先にそのコピーを削除してください（{path} → 削除）。同時に1つのみ録音可能です。",
    "step2Title": "サインイン — 1度のみ",
    "step2Body": "拡張機能を開き、本サイトと同じメール・パスワードでサインイン。これで設定完了です。講師・生徒・言語データも自動連携されます。",
    "signIn": "サインイン",
    "step3Title": "レッスンタブを開き録音開始",
    "step3Body": "実際のレッスンが行われるタブ（例：Preply教室やMeetの通話）を開き、Kアイコンをクリック → 生徒選択 → **録音開始** を押します。初回時のみマイク許可が求められます。許可後はポップアップを閉じてレッスン続行。録音は継続されます。",
    "studentLabel": "生徒：",
    "step4Title": "終了時に送信",
    "step4Body": "レッスン終了後にポップアップを開き、**録音停止**→**Lesson Studioへ送信**と進めてください。送信を押すまで何もアップロードされません。",
    "sendButton": "Lesson Studioへ送信 →",
    "step5Title": "自動生成されたまとめを確認",
    "step5Body": "数分後、「まとめレビュー待ち」一覧に下書きが届きます。要約・語彙・宿題が生徒の理解言語で用意されています。内容を編集し送信すると生徒のポータルに反映されます。",
    "reviewAndSend": "確認・送信",
    "consentTitle": "録音の前に同意を得てください",
    "consentBody": "録音の旨を生徒に伝え、同意を取ってください。国・サービスによって録音時のルールが異なりますので（Preply・italkiも各規約あり）、必ずご確認ください。",
    "dataBody": "録音は両者の音声を保存します。**Lesson Studioへ送信**を押すまで何もアップロードされません。まとめ作成後、音声ファイルは30日後削除されます。詳細は{policy}をご覧ください。",
    "privacyLink": "プライバシーポリシー"
  },
  "lessonExercises": {
    "none": "このレッスンには練習課題がありません。",
    "recordReading": "これらの文の音読を録音してください",
    "notRecorded": "まだ録音がありません。"
  },
  "lessonTools": {
    "lessonIsWith": "このレッスンの相手：",
    "notLinked": "未連携（テスト／生徒なし）",
    "hint": "この生徒と紐付けると、まとめがその生徒のポータルに反映されます。テスト通話は未紐付けのままで結構です。"
  },
  "memo": {
    "back15": "15秒戻る",
    "forward15": "15秒進む",
    "seek": "シーク"
  },
  "joinInvalid": {
    "title": "このリンクは無効です",
    "body": "既に使用済みか、講師が新しいリンクを送っている場合があります。再度講師へご確認ください。",
    "goSignIn": "サインイン画面へ"
  },
  "dashboard": {
    "students": "生徒",
    "withLogin": "ログイン済み",
    "lessonsRecorded": "録音済みレッスン",
    "noStudents": "生徒がいません",
    "notJoined": "招待済み—未参加",
    "lessons": "レッスン",
    "overview": "概要"
  },
  "misc": {
    "outOfTen": "10点満点中",
    "dashboardBack": "ダッシュボードに戻る",
    "backToOverview": "概要へ戻る",
    "recapGone": "このまとめは既に利用できません。",
    "timesShared": "共有回数",
    "languageGroup": "言語",
    "extConfirmReset": "全端末で録音ツールをサインアウトしますか？サインインするまで録音はできません。",
    "extResetFailed": "録音ツールのリセットに失敗しました。",
    "extSigningOut": "サインアウト中…",
    "extSignOutEverywhere": "全端末でサインアウト",
    "howTitle": "まとめ作成までの流れ",
    "howLead": "{platform}でレッスンを行うため、ここでのスケジュール設定はありません。録音がLesson Studioに届いた時点でまとめを作成します。",
    "howSteps": [
      {
        "title": "レッスンを録音",
        "body": "ブラウザ録音またはプラットフォームの録音ファイルをアップロードします。"
      },
      {
        "title": "まとめを作成",
        "body": "要約・語彙・添削・練習課題を自動で下書きします。"
      },
      {
        "title": "確認し公開",
        "body": "内容を編集後に送信 — 生徒のポータルで見られるようになります。"
      }
    ],
    "instrStudentChose": "この言語は生徒が自分で選びました。講師として変更は可能ですが、本人による選択です。",
    "instrHint": "まとめ・テスト解説用の言語です — クリックすると変更可",
    "matLinkFailed": "リンク保存に失敗しました",
    "matLinksFailed": "複数リンク保存に失敗しました",
    "matAddLink": "リンクを追加",
    "confirmDeleteStudent": "この生徒と全レッスンを削除します。本操作は元に戻せません。",
    "resetPassword": "パスワードをリセット",
    "inviteLink": "招待リンク",
    "uploadFailed": "アップロード失敗",
    "micBlocked": "マイクがブロックされています。ブラウザのマイク許可を有効にしてください。",
    "micBlockedBar": "マイクがブロック中 — アドレスバーでマイク許可→再試行してください。",
    "uploadAFile": "ファイルをアップロード",
    "submitToTeacher": "講師に提出",
    "discardRedo": "破棄してやり直し",
    "sendToStudent": "生徒へ送信",
    "sendThisAnswer": "この回答を送信",
    "sentTick": "送信済み ✓",
    "vocabByLevelAria": "語彙のレベル別表示",
    "vocabTapHint": "レベルをタップで該当単語と出現レッスンを見ることができます。",
    "firstSeenIn": "最初に登場：レッスン{n}",
    "firstSeen": "最初の登場",
    "wordsIntroduced": "新出単語",
    "fromTheLesson": "このレッスンから",
    "goAgain": "もう一度やる",
    "showWord": "単語を見る",
    "showMeaning": "意味を見る",
    "correction": "添削",
    "correctionsAria": "添削内容",
    "noLessonsYet": "まだレッスンがありません"
  }
} as const
