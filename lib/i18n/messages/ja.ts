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
    "somethingWrong": "問題が発生しました。しばらくしてからもう一度お試しください。"
  },
  "nav": {
    "appName": "Lesson Studio",
    "workspace": "講師ワークスペース",
    "overviewAria": "Lesson Studio 概要",
    "navAria": "講師ワークスペースナビゲーション",
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
    "studentView": "生徒画面",
    "payments": "支払い",
    "availability": "スケジュール",
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
    "signInSub": "お帰りなさい。レッスンや進捗、要約を確認するにはサインインしてください。",
    "signInExpired": "セッションがタイムアウトしました。サインイン後、元の場所に戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めての方ですか？",
    "createAccountLink": "講師アカウントを作成",
    "freeToSetUp": "初期費用はかかりません。すぐに最初の生徒を追加できます。",
    "studentQuestion": "生徒の方ですか？",
    "studentAnswer": "先生から招待リンクが届きますので、そこから自分のメールアドレスとパスワードを選択してください。その後、ここからサインインできます。",
    "signInHeadline": "毎回のレッスンが書き起こしに。",
    "signInAside": "Lesson Studioは、1時間のレッスンを要約・進捗チャート・練習問題に変換します——教えた先生も受けた生徒も利用できます。",
    "signUpTitle": "講師アカウントを作成",
    "signUpSub": "Koku Libraryワークスペースを開始し、生徒管理・レッスン要約・予約・進捗管理にお使いください。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウント作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウントを作成できませんでした。",
    "createdNowSignIn": "アカウントが作成されました。サインインしてください。",
    "haveAccount": "すでにアカウントをお持ちですか？",
    "signUpHeadline": "教える活動を一か所に。",
    "signUpAside": "2〜3分のセットアップですぐ開始。生徒を追加し、レッスンを録音すれば、あとは自動で整います。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンが自動で文章になります",
        "body": "Chrome拡張機能が双方の音声を録音します。要約は下書きで届くので、編集して公開します。"
      },
      {
        "title": "見える進捗",
        "body": "点数・話した時間・語彙をレッスンごとに集計し、生徒のためのページにまとめます。"
      },
      {
        "title": "教える言語は問いません",
        "body": "日本語・フランス語・韓国語・スペイン語など30種類以上に対応。レッスン言語で修正し、生徒母語で説明します。"
      },
      {
        "title": "自分の言葉で練習",
        "body": "その時間の中で出てきた語彙から、単語カードと発話テストを自動作成。"
      },
      {
        "title": "自分専用の生徒ポータル",
        "body": "色や表現、必要なセクションだけ選んで生徒に案内できます。"
      }
    ]
  },
  "onboarding": {
    "steps": [
      "あなたのレッスン",
      "どこで行うか",
      "カレンダー",
      "生徒の表示",
      "録音ツール"
    ],
    "sideTitle": "スタジオの準備をしましょう。",
    "sideBody": "4ステップで生徒専用ポータルができます。",
    "stepCount": "ステップ {n} / {total}",
    "choose": "選択…",
    "continueAction": "続ける",
    "finish": "設定を完了する",
    "finishing": "完了中…",
    "couldNotSave": "保存できませんでした",
    "couldNotFinish": "完了できませんでした",
    "pickTeaching": "教える言語を選択してください。",
    "pickSpoken": "レッスンで主に使う言語を選択してください。",
    "pickCalendar": "レッスンの予定管理方法を教えてください。",
    "pickPortalName": "ポータルの名前を決めてください（生徒側に表示されます）。",
    "teachAria": "教える言語",
    "iTeach": "私は",
    "teachHint": "要約と練習テストはこの言語用に生成されます。生徒ごとに個別変更できますが、最初はここで選んだ言語が初期設定になります。",
    "spokenAria": "主に話す言語",
    "spokenIn": "レッスンで主に話すのは",
    "spokenHint": "学ぶ言語と異なる場合も多いです。共通言語が授業の中心ということも。録音ツールが聞き取る対象です。",
    "timezone": "タイムゾーン",
    "platformTitle": "生徒との場所はどこですか？",
    "platformLead": "MeetやZoomの場合、予約時にリンクを自動作成します。マーケットプレイスでは部屋が決まっているのでリンクはそのまま使います。",
    "zoomLater": "Zoomは後で設定で連携",
    "stayOutTitle": "レッスン自体には介入しません",
    "stayOutBody": "リンク自動作成もボット参加もありません。録音データだけを使い、要約・語彙・練習問題を作成します。生徒側の体験も変わりません。",
    "calendarTitle": "レッスンはどこで管理していますか？",
    "calendarLeadExternal": "{platform}の先生でもGoogleカレンダーで予定を管理する方や、すべてプラットフォーム上で済ませる方がいます。どちらかにより表示が変わります。",
    "calendarLead": "Googleカレンダー上で管理している場合はこちらから予定を読み取り、予約や自動録音ができます。他で管理する場合はこれらの機能は使いません。",
    "googleConnected": "Googleカレンダー接続済み",
    "googleConnectedSub": "どのカレンダーでレッスンを管理するか、設定で選択できます。",
    "connectGoogle": "Googleカレンダーと連携",
    "connectGoogleFine": "Googleの認証画面に遷移します。未設定でも利用できますが、予約・自動録音は接続するまで使えません。",
    "recordTitle": "レッスンを録音する",
    "recordBody": "どのオンラインルームでも録音し、Lesson Studioに渡してください。",
    "reviewTitle": "要約を確認する",
    "reviewBody": "ほかのレッスン同様、レビューキューに届きます。公開すれば生徒に表示されます。",
    "noCalendarFine": "カレンダー無しの場合、予約ページは作成されずナビゲーションもシンプルになります。設定でいつでも切替可能です。",
    "brandTitle": "ブランド設定",
    "brandLead": "生徒用ポータルの色と名前を選んでください。細かい部分は後から調整できます。",
    "portalNameLabel": "生徒ポータル名",
    "portalNamePlaceholder": "例：さくら日本語",
    "portalNameFine": "この名称が生徒ポータルの上部や招待リンクで表示されます。あなた自身のスタジオ名です。",
    "accent": "アクセントカラー",
    "previewTagline": "今日学ぶ、明日につなげる！",
    "recorderTitle": "録音ツールをインストール",
    "recorderLead": "Chrome拡張機能が録音と要約作成を担います。ボット参加や生徒側のインストールは不要です。",
    "recorderStep1": "**Chrome ウェブストアから追加**—1クリック、ツールバーにピン留めします。",
    "recorderStep2": "**拡張機能上でサインイン**—同じメールとパスワードを使います。データ移行作業はありません。",
    "recorderStep3": "**レッスンを録音**：生徒を選び、開始・終了を押します。",
    "addToChrome": "Chrome に追加（無料）↗",
    "recorderFine": "マイク権限や録音範囲など、詳しい手順は{guide}または「設定→レッスン録音」からご覧いただけます。",
    "recorderFineLink": "セットアップガイド"
  },
  "overview": {
    "eyebrow": "概要",
    "title": "あなたのレッスンカレンダー",
    "manageConnections": "連携管理",
    "fixInSettings": "設定で修正",
    "summaryAria": "レッスン要約",
    "upcoming": "今後のレッスン",
    "drafts": "レビュー待ち下書き",
    "draftsSub": "要約：確認が必要",
    "published": "公開済み要約",
    "publishedSub": "生徒へ送信済み",
    "writeUpsLeft": "残り作成数",
    "writeUpsAria": "残り作成数—追加購入",
    "usageTrial": "{total} 無料分のうち{used}使用済み",
    "usageBought": "{used} 件作成済み · 有効期限なし",
    "lessonCalendar": "レッスンカレンダー",
    "primaryCalendar": "（メイン）"
  },
  "connect": {
    "title": "Googleカレンダーと連携",
    "body": "カレンダーを連携すると、Lesson Studioがレッスン予定を確認し、予約や録音を自動で行えます。",
    "notConfigured": "Google OAuthが未設定です。{id}と{secret}を環境変数に追加し、再起動してください。",
    "scopeRead": "**カレンダーの読み取り**—レッスンや会議リンクを特定",
    "scopeRecord": "**レッスン録音**—拡張機能で録音ファイルを取得",
    "scopeRecap": "**要約作成**—AIでレッスン要約生成（要確認・共有）",
    "continueGoogle": "Googleで続ける",
    "fine": "Googleの認証画面へ遷移します。管理は設定画面からできます。"
  },
  "settings": {
    "eyebrow": "ワークスペース",
    "title": "設定",
    "recorderTitle": "レッスン録音ツール",
    "recorderDesc": "Chrome拡張機能でレッスンを録音し、要約に変換します。{guide}",
    "recorderGuide": "手順ガイド →",
    "replayTourHint": "使い方を忘れた場合はここから再度説明を表示できます。",
    "languageTitle": "表示言語",
    "languageDesc": "ワークスペースで表示される言語です。要約文の言語には影響しません（生徒ごとに設定）。",
    "connectionsTitle": "連携",
    "connectionsDesc": "スケジューリング・会議・支払い機能の連携設定。",
    "livesTitle": "レッスン管理先",
    "livesDesc": "Google カレンダーに登録すれば予約・自動録音可能。他で管理の場合は録音ファイルのアップロードのみ対応します。",
    "calendarTitle": "レッスンカレンダー",
    "calendarDesc": "Lesson Studioが参照するレッスン予定のカレンダーを選択します。",
    "primaryCalendar": "メインカレンダー",
    "speakingTitle": "発話課題",
    "speakingDesc": "全ての要約の最後に発話課題を3つ掲載します。生徒が回答を録音すると、レッスンページの該当文の下に届き、通知メールが送信されます。無効にするとこれらは表示されません。",
    "speakingOn": "生徒による録音を許可",
    "speakingOnHint": "回答はレッスンページで再生可",
    "speakingOff": "課題なし",
    "speakingOffHint": "要約の筆記課題（7つ）のみ掲載",
    "platformTitle": "予約時の会議プラットフォーム",
    "platformDesc": "新規予約時に使用するものです。最後の選択肢はマーケットプレイス等リンク自作の場合。",
    "meetLabel": "Google Meet",
    "meetHint": "カレンダーに自動作成",
    "ownLinkLabel": "独自リンクを共有",
    "ownLinkHint": "Preply、italki、独自部屋等"
  },
  "billing": {
    "leftTitle": "残り作成数",
    "leftDesc": "1回の要約作成ごとに消費します。有効期限や自動更新はありません。",
    "ofFree": "{total}無料分のうち",
    "ofFreeUsed": "{total}無料分中 · {used}使用済み",
    "builtSoFar": "これまでに{used}件作成",
    "emptyTrial": "無料分の残高はゼロです。下記パック購入で引き続き要約作成が可能です——サブスクリプション・更新日はありません。",
    "emptyPaid": "残高がありません。下記パック購入で補充できます。未使用分に期限はありません。",
    "addTitle": "作成数を追加",
    "addDesc": "都度支払い、更新なし。大きいパックほど単価は安くなります。少量でも割高にはなりません。購入分は無期限で有効です。",
    "lessonsWrittenUp": "作成済みレッスン",
    "save": "{pct}%お得",
    "neverExpires": "有効期限なし",
    "buy": "{n}購入",
    "paidOnce": "1回のみStripe決済。カード情報は保存されず、追加請求もありません。",
    "packTags": [
      "初めての方に",
      "安定した計画ペース",
      "最も利用されています"
    ]
  },
  "recap": {
    "tabs": [
      "進捗",
      "要約",
      "宿題",
      "語彙"
    ],
    "tabsAria": "要約の各セクション",
    "eyebrow": "送信前に確認",
    "title": "{name} · レッスン要約",
    "lessonFallback": "レッスン",
    "sub": "各タブを確認後、{first} に送信してください。",
    "translate": "解説の翻訳",
    "translateTitle": "解説部分を生徒の言語で書き直します——教材・点数は変更しません",
    "working": "処理中…",
    "rebuild": "録音から再生成",
    "rebuildTitle": "録音・最新AI・メトリクスで再生成",
    "rebuilding": "再生成中…",
    "deleteDraft": "下書き削除",
    "deleting": "削除中…",
    "saveDraft": "下書き保存",
    "approve": "承認して送信",
    "sending": "送信中…",
    "savedTick": "保存済み ✓",
    "confirmRebuild": "この要約を録音から再生成しますか？要約・各セクション・宿題・フルーエンシーメトリクスが再作成され、手動編集は失われます。",
    "confirmTranslate": "この要約の解説部分を、生徒の説明用言語に翻訳しますか？例文・引用・点数はそのまま残ります。",
    "confirmDelete": "{name} さんの要約下書きを削除しますか？「レビュー待ち」から消去され、元に戻せません。",
    "promptLanguage": "この生徒は解説用言語がまだ未設定です（生徒ページで設定可能）。どの言語に解説を翻訳しますか？",
    "rebuildFailed": "再生成に失敗しました",
    "translationFailed": "翻訳に失敗しました",
    "deleteFailed": "要約を削除できませんでした",
    "savingEdits": "編集内容を保存中…",
    "uploadingMemo": "音声メモをアップロード中…",
    "uploadingFile": "{name} をアップロード中…",
    "attachingMaterials": "教材を添付中…",
    "attachmentFailed": "要約は送信されましたが、添付ファイルのアップロードに失敗しました。レッスンページから再度追加できます。",
    "suggestedScript": "推奨スクリプト"
  },
  "portal": {
    "slots": {
      "greeting": "お帰りなさい,",
      "tabOverview": "概要",
      "tabLessons": "レッスン",
      "tabProgress": "進捗",
      "tabPractice": "練習",
      "tabFiles": "ファイル",
      "tabTests": "テスト",
      "statLessons": "レッスン",
      "statScore": "平均点",
      "statSpeaking": "発話",
      "lessonsTitle": "あなたのレッスン",
      "progressTitle": "進捗",
      "vocabTitle": "語彙",
      "milestoneTitle": "次の到達目標",
      "scoresTitle": "最近のスコア",
      "testsTitle": "練習テスト",
      "speakingTitle": "発話傾向",
      "filesTitle": "レッスンファイル",
      "vocabTotalsTitle": "語彙の増加"
    },
    "tabsAria": "ダッシュボード各部",
    "notLinked": "アカウントが未リンクです",
    "askTeacher": "先生にアカウントのリンクを依頼してください。",
    "climbLed": "聞き役から{em}まで成長しました。",
    "climbLedEm": "話をリードする側に",
    "climbMore": "スタート時より{em}話しています。",
    "climbMoreEm": "{delta}ポイント増えました",
    "climbPlain": "前回レッスンで{em}話しました。",
    "youSpoke": "話した割合",
    "acrossLessons": "{n}回のレッスンで",
    "acrossOneLesson": "1回のレッスンで",
    "climbSub": "弧上の印が開始時点（{then}）です。",
    "climbDelta": "レッスン1回目から{delta}ポイント",
    "inLast30": "ここ30日で{n}回",
    "totalLessons": "累計完了レッスン",
    "inAll": "合計{n}回",
    "words": "{n}語",
    "lastN": "直近{n}回",
    "metricPace": "ペース",
    "metricThinking": "考える時間",
    "metricShare": "発話割合",
    "practiseTitle": "単語を練習する",
    "practiceHistory": "過去2週間の練習",
    "byKind": "語種別",
    "byLesson": "レッスン別",
    "practiseAnything": "全て練習する",
    "practiseDue": "復習が必要なもの",
    "vocabKnown": "習得済み",
    "vocabLearning": "学習中",
    "vocabNew": "未学習",
    "download": "ダウンロード"
  },
  "practice": {
    "emptyTitle": "練習項目がありません",
    "emptyBody": "先生がレッスン要約を公開すると語彙がここに表示されます。",
    "howMany": "今日は何枚やりますか？",
    "doneTitle": "完了—{n}枚。",
    "doneOneTitle": "完了—1枚。",
    "allFirstTime": "すべて初回分です。数日後にもう一度出ます。",
    "someMissed": "{right}枚初回クリア、{missed}枚は早めに再復習。",
    "moreLeft": "このセットにあと{n}語あります。好きな時に続けられます。",
    "oneLeft": "残り1語、このセットで練習可能です。",
    "wholePile": "これが全てです。",
    "nextRound": "あと{n}語",
    "practiseAgain": "再度練習",
    "backToPractice": "練習に戻る",
    "tapToSee": "タップすると意味が表示されます",
    "again": "もう一度",
    "knewIt": "正解",
    "sayOutLoud": "めくる前に声に出して読みましょう。"
  },
  "rating": {
    "question": "この内容は実際のレッスンに合っていましたか？",
    "yes": "はい、合っていました",
    "no": "少し違います",
    "thanksYes": "一致していたと回答いただきました。確認済みです。",
    "thanksNo": "合っていなかったと回答いただきました。ご意見ありがとうございます。",
    "whatWasOff": "どこが違いましたか？該当があれば選択してください。",
    "notePlaceholder": "気になる点があれば一文でご記入ください。",
    "send": "送信",
    "sending": "送信中…",
    "didNotSave": "保存できませんでした。",
    "reasons": [
      "言っていない語句が含まれていた",
      "発話者が混同されている",
      "スクリプトや言語が間違っている",
      "難易度が合っていない",
      "その他"
    ]
  },
  "recapLanguage": {
    "question": "要約の説明言語",
    "hint": "学習言語には影響しません——まわりの解説のみです。",
    "aria": "要約の解説言語",
    "saved": "保存されました—次回以降の要約で反映されます。",
    "didNotSave": "保存できませんでした。"
  },
  "lesson": {
    "railAria": "レッスンセクション",
    "thisLesson": "このレッスン",
    "movements": [
      "話し方",
      "できたこと",
      "修正点",
      "学習内容",
      "このレッスンの語彙",
      "練習",
      "ファイル・音声"
    ],
    "speakingBalance": "話した比率",
    "score": "スコア",
    "grammarDensity": "文法密度",
    "corrections": "修正内容",
    "homework": "宿題",
    "noHomework": "このレッスンに宿題はありません。",
    "practiceExercises": "練習課題",
    "wordsFromLesson": "このレッスンの語彙",
    "whoTalked": "話した人",
    "speakingMeasured": "あなたの発話量（自動計測）",
    "yourTeacher": "担当講師"
  },
  "join": {
    "setupFailed": "アカウントのセットアップに失敗しました。",
    "acceptFailed": "招待を承認できませんでした。",
    "joining": "参加中…",
    "joinAs": "{name} として参加",
    "notYou": "別の方ですか？{signOut}してこのリンクを開き直してください。",
    "notYouLink": "サインアウト",
    "emailLabel": "メールアドレス",
    "passwordLabel": "パスワード設定",
    "passwordHint": "8文字以上",
    "settingUp": "セットアップ中…",
    "createAccount": "アカウントを作成する"
  },
  "speaking": {
    "cta": "回答を録音",
    "sendFailed": "録音の送信に失敗しました。再試行してください。",
    "recordAgain": "もう一度録音",
    "sendToTeacher": "先生に送信",
    "sending": "送信中…",
    "tryAgain": "再試行",
    "keepSent": "送信済みのままにする"
  },
  "exchange": {
    "recording": "録音",
    "download": "ダウンロード",
    "nothingShared": "このレッスンにはまだ共有済みデータがありません。",
    "noFiles": "まだファイルは共有されていません。資料やPDFなどをアップロードしてください。",
    "audioIntro": "この生徒が自由に録音した練習音声です。課題への回答は［練習］タブにあります。",
    "noAudio": "音声はまだ提出されていません。"
  },
  "charts": {
    "metrics": [
      {
        "label": "スコア",
        "note": "各レッスンでの10点満点の評価。"
      },
      {
        "label": "自分の発話",
        "note": "会話全体のうち、どれだけ自分が話したか。自信がつくと割合が増えます。"
      },
      {
        "label": "ペース",
        "note": "発話中の1分あたりの語数。"
      },
      {
        "label": "考える時間",
        "note": "発話までの間。短いほど言葉が出やすい状態。"
      },
      {
        "label": "語彙数",
        "note": "全レッスンの語彙数合計。"
      }
    ],
    "nothingYet": "まだ記録がありません。",
    "sinceLesson": "レッスン{n}以降",
    "trendLater": "次回以降に推移グラフが見られます。"
  },
  "tests": {
    "saveScoreFailed": "スコア保存に失敗しました。",
    "finish": "完了——{pct}%",
    "allWords": "全語彙"
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
    "removeRange": "この枠を削除",
    "couldNotSave": "保存できませんでした",
    "saveChanges": "変更を保存",
    "defaultsTitle": "レッスン初期設定",
    "defaultsDesc": "レッスン時間や予約可能期間の上限など。",
    "lessonName": "レッスン名",
    "lessonNamePlaceholder": "語学レッスン",
    "lessonLength": "レッスン長さ（分）",
    "slotInterval": "予約枠間隔（分）",
    "minNotice": "直前予約不可時間（時間）",
    "bufferBefore": "前の空き（分）",
    "bufferAfter": "後の空き（分）",
    "maxPerDay": "1日最大レッスン数",
    "bookingWindow": "予約受付日数",
    "title": "スケジュール",
    "copyMon": "月曜 → 平日全体にコピー",
    "copyMonTitle": "月曜の時間割を火〜金にコピー",
    "previewBooking": "予約ページを確認 ↗",
    "unavailable": "受付不可",
    "dateOverrides": "日付ごとの変更"
  },
  "recordings": {
    "eyebrow": "概要",
    "title": "レッスンと要約",
    "settings": "設定",
    "yourStudents": "あなたの生徒",
    "publishedTitle": "公開済みレッスン",
    "publishedDesc": "すでに生徒に公開された内容です（新着順）。下書きはレビュー待ちにあります。",
    "nothingPublished": "公開済みはまだありません",
    "untitled": "タイトル未設定レッスン",
    "published": "公開済み",
    "draft": "下書き",
    "summaryAria": "レッスン要約",
    "students": "生徒",
    "changedMind": "変更しますか？",
    "connectCalendar": "カレンダーと連携"
  },
  "lessonRow": {
    "joinCall": "通話に参加 ↗",
    "viewRecap": "要約を見る",
    "reviewRecap": "要約を確認",
    "noLink": "リンクなし",
    "eyebrow": "公開前の確認",
    "recapTitle": "{title} · レッスン要約",
    "closeAria": "要約確認を閉じる",
    "draftBanner": "AI下書き—内容を確認してから生徒へ送信してください。",
    "score": "スコア",
    "studentTalk": "生徒の発話",
    "grammar": "文法",
    "confidence": "自信度",
    "homework": "宿題",
    "memoScript": "音声メモ用スクリプト",
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
    "loadFailed": "スケジュールの読み込みに失敗しました。",
    "bookingFailed": "予約に失敗しました。",
    "bookingFailedRetry": "予約に失敗しました。再試行してください。",
    "eyebrow": "レッスン予約",
    "title": "都合の良い時間を探す",
    "sub": "日付・時間を選ぶと、確認メール・会議詳細が届きます。",
    "booked": "予約済みです！",
    "invite": "カレンダー招待が{email}宛に送信されました。",
    "openMeeting": "ミーティングリンクを開く",
    "noCalendar": "スケジュール情報が利用できません。カレンダー接続済みですか？",
    "noTimes": "今後30日で空きレッスン枠がありません。",
    "pickDay": "日付を選択",
    "pickDayHint": "ドットがある日には空き時間があります。",
    "yourDetails": "ご自身の情報",
    "confirmAt": "{time} を確定",
    "yourName": "お名前",
    "namePlaceholder": "Jane Doe",
    "yourEmail": "メールアドレス",
    "emailPlaceholder": "you@email.com",
    "booking": "予約中…",
    "bookAt": "{time} レッスン予約"
  },
  "tour": {
    "steps": [
      {
        "title": "概要",
        "body": "ホーム画面です。要約のレビュー待ち一覧と、最近のレッスンがここに積み重なります。"
      },
      {
        "title": "生徒",
        "body": "生徒ごとに追加します。レッスン・テスト・進捗すべてここに紐付き、各生徒ごとに専用ポータルが作成されます。"
      },
      {
        "title": "メモ",
        "body": "レッスンごとに1クリックで記録できる月間グリッド—教える日記にもなります。"
      },
      {
        "title": "生徒画面",
        "body": "生徒側の表示です。色や表示名、内容を調整できます。モックではなく実際のものです。"
      },
      {
        "title": "支払い",
        "body": "生徒ごとの支払い履歴とカバーするレッスン数を管理できます。要約公開ごとに残高が減ります。"
      },
      {
        "title": "設定",
        "body": "カレンダー、録音ツール、アカウント管理ページです。再度説明が必要ならここからいつでも確認できます。"
      }
    ],
    "skip": "ツアーをスキップ"
  },
  "languages": {
    "couldNotSave": "保存できませんでした",
    "title": "あなたの言語設定",
    "desc": "教える言語、レッスン時に話す言語の初期値。新しい生徒もここから開始されます。",
    "youTeach": "教える言語",
    "spokenIn": "レッスンで話す言語",
    "fitTitle": "言語設定の役割",
    "fitDesc": "3つの設定、3つの役割があります。",
    "fitLearning": "「学習している言語」が、その生徒の要約やテストの生成元——日本語・韓国語・スペイン語・アラビア語など{n}言語に対応。生徒追加時に選び、生徒ページからいつでも変更可能です。",
    "fitExplained": "「解説用言語」は要約文・テスト説明文の書き言葉を決定します——初期設定は英語ですが、生徒ごとに個別変更できます。",
    "fitSpoken": "「レッスンで話す言語」は録音による文字起こしの対象です。ここで設定した値が生徒設定にも反映され、その後変更がなければ都度尋ねられることはありません。"
  },
  "notes": {
    "pickStudent": "生徒を選択",
    "empty": "メモは空です",
    "couldNotSave": "メモの保存に失敗しました",
    "confirmDelete": "このメモを削除しますか？",
    "hoursTaught": "指導時間",
    "recapsPublished": "要約公開数",
    "prevMonth": "前月",
    "nextMonth": "翌月",
    "today": "今日",
    "noStudents": "生徒はいません",
    "student": "生徒",
    "addNote": "メモ追加",
    "newNote": "新規メモ",
    "editNote": "メモ編集"
  },
  "exercises": {
    "none": "課題はまだありません。下で追加してください。",
    "instruction": "指示",
    "instructionPlaceholder": "生徒に求める内容",
    "focus": "練習項目",
    "focusPlaceholder": "この課題が鍛える内容",
    "sentence": "文",
    "meaning": "意味",
    "removeSentence": "文を削除",
    "removeOption": "選択肢を削除",
    "questionTarget": "問題（学習言語）",
    "question": "問題"
  },
  "payments": {
    "selectStudent": "生徒を選択",
    "amountTooLow": "1以上の金額を入力してください",
    "saveFailed": "保存に失敗しました",
    "thisMonth": "今月",
    "receivedAllTime": "累積受領額",
    "outstanding": "未決済",
    "currency": "通貨",
    "students": "生徒",
    "prevMonth": "前月",
    "nextMonth": "翌月",
    "today": "今日",
    "noStudents": "生徒はいません",
    "student": "生徒",
    "recent": "最近の支払い",
    "newPayment": "新規支払い追加",
    "editPayment": "支払い編集",
    "selectPlaceholder": "選択…",
    "amount": "金額（{symbol}）",
    "status": "ステータス",
    "paid": "支払い済み",
    "pending": "未決済",
    "covers": "対象範囲",
    "coversPlaceholder": "例：7月パック—4回分",
    "paymentDate": "支払日",
    "dueDate": "期日",
    "lessonsCovered": "対象レッスン数",
    "lessonsPlaceholder": "例：4",
    "method": "方法",
    "methodPlaceholder": "銀行振込、現金、PayPalなど",
    "confirmDelete": "この支払いを削除しますか？"
  },
  "recapReview": {
    "vocab": "語彙",
    "summary": "要約",
    "summaryPlaceholder": "レッスン要約…",
    "sectionTitle": "セクション名",
    "sectionContent": "内容入力…",
    "removeSection": "セクション削除",
    "homeworkTask": "宿題内容",
    "noteTitle": "生徒へのメモ",
    "notePlaceholder": "生徒への個別メッセージ…"
  },
  "connectors": {
    "googleName": "Googleカレンダー",
    "googleDesc": "レッスン予定を読み取り、新規予約をカレンダーに書き込みます。",
    "connect": "連携",
    "permissionNeeded": "権限が必要です",
    "reconnect": "再連携",
    "disconnect": "連携解除",
    "zoomDesc": "予約ごとに固有のZoomルームを自動作成します。",
    "comingSoon": "近日対応予定",
    "stripeName": "Stripe",
    "stripeDesc": "レッスンパックのカード決済受付——売上は直接支払われます。"
  },
  "student": {
    "notJoined": "招待済み—未登録",
    "avgScore": "平均点",
    "latestTalk": "直近発話",
    "vocabItems": "語彙数",
    "creditsLeft": "残り{left}回／購入{bought}回",
    "creditsOneLeft": "残り1回／購入{bought}回",
    "noCredits": "未購入",
    "managePayments": "支払い管理 →",
    "lessonsTitle": "レッスン・要約",
    "noLessons": "レッスンなし",
    "noLessonsSub": "この生徒に録音したレッスンはここに表示されます。",
    "testsTitle": "練習テスト",
    "noTests": "テスト未作成"
  },
  "addStudent": {
    "levels": [
      "初級",
      "初中級",
      "中級前",
      "中級",
      "中上級",
      "上級"
    ],
    "createFailed": "生徒の作成に失敗しました",
    "aria": "新規生徒",
    "title": "新規生徒",
    "fullName": "氏名",
    "namePlaceholder": "Jane Doe",
    "level": "レベル",
    "learning": "学習言語",
    "choose": "選択…",
    "recapLanguage": "要約説明言語"
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
    "noLessonsThatDay": "この日はレッスンがありません。",
    "agendaClear": "本日の予定はありません。",
    "noUpcoming": "このカレンダーに今後のレッスン予定はありません。"
  },
  "forgot": {
    "title": "パスワード再設定",
    "lead": "サインインに使用しているメールアドレスを入力してください。新しいパスワード選択用リンクをお送りします。",
    "send": "再設定リンク送信",
    "sending": "送信中…",
    "sent": "{email} のアカウントが見つかれば再設定リンクをお送りします。メール内のリンクから新しいパスワードを設定してください（1時間有効）。",
    "spam": "届かない場合は迷惑メールもご確認ください。サインアップ時のアドレスでやり直すこともできます。",
    "remembered": "思い出しましたか？",
    "backToSignIn": "サインイン画面へ戻る"
  },
  "reset": {
    "tooShort": "新しいパスワードは6文字以上必要です。",
    "mismatch": "2つのパスワードが一致しません。再度ご確認ください。",
    "samePassword": "前回と同じパスワードです。新しいものを設定してください。",
    "saveFailed": "パスワードの保存に失敗しました。再試行してください。",
    "title": "新しいパスワードを設定",
    "expired": "このリセットリンクは期限切れか既に利用されています。再度ご請求ください。",
    "noToken": "このページは再設定メール内からのみ利用可能です。新しいリンクを請求してください。",
    "lead": "新しいパスワードを設定すると、すぐにサインイン状態になります。",
    "newPassword": "新しいパスワード",
    "repeat": "再入力"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "平均スコア",
        "sub": "全ての評価付きレッスンの10点満点平均。"
      },
      {
        "label": "発話シェア",
        "sub": "その生徒がレッスン中に話していた割合。"
      },
      {
        "label": "発話ペース",
        "sub": "1分あたり語数（発話時）。習熟と共に上昇します。"
      },
      {
        "label": "思考時間",
        "sub": "講師発話終了から生徒開始までの秒数。長い間も必要なプロセスです。"
      },
      {
        "label": "平均発話量",
        "sub": "1ターンで発した語数平均。短い応答でテンポが良過ぎると会話になりません。"
      },
      {
        "label": "フィラー語",
        "sub": "1レッスン当たりの「えー」「あの」等。ペースとの比率で傾向を読みます。"
      }
    ],
    "totalLessons": "レッスン総数",
    "acrossStudents": "{n}名の生徒集計",
    "mostActive": "最も活動的",
    "nLessons": "{n}レッスン",
    "nothingRecorded": "記録がありません",
    "vocabMet": "確認した語彙",
    "wordsAcross": "全レッスンでの語数",
    "notSeenLately": "最近学習のない生徒",
    "everyoneCurrent": "全員最新です",
    "measureAria": "分析項目",
    "nothingMeasured": "計測データがまだありません。レッスン記録後に反映されます。",
    "perStudent": "{measure}—生徒ごと",
    "perStudentSub": "各生徒のレッスン推移。矢印は開始→最新まで。",
    "prevMeasure": "前の項目",
    "nextMeasure": "次の項目"
  },
  "test": {
    "heading": "{level}練習テスト",
    "published": "公開済み",
    "draftOnlyYou": "下書き—自分のみ閲覧可",
    "basedOn": "基準元",
    "lessonN": "レッスン{n}",
    "script": "スクリプト",
    "scriptBeginner": "ひらがな＋ローマ字",
    "scriptHiragana": "ひらがな",
    "scriptKanji": "漢字＋かな",
    "created": "作成日",
    "status": "状態",
    "speakingAnswer": "音声解答",
    "unplayable": "録音がありますが再生用署名を発行できません。"
  },
  "trial": {
    "aria": "Lesson Studioへようこそ",
    "kicker": "Lesson Studioへようこそ",
    "title": "最初の{n}回分の要約は無料です。",
    "sub": "録音ツールをインストールし、レッスンをして、自動で要約が届く様子を試してください——カード不要・条件なし。納得されたらプランをご検討ください。",
    "showMe": "簡単に説明を見る",
    "exploreMyself": "自分で見てみる",
    "setUpFirst": "または録音ツールから始める→"
  },
  "reviewQueue": {
    "title": "要約：レビュー待ち",
    "desc": "録音データから作成されています。確認・送信が完了するまで生徒側には表示されません。",
    "moveFailed": "この要約の移動に失敗しました",
    "serverUnreachable": "サーバーに接続できませんでした",
    "rebuildFailed": "この要約の再生成に失敗しました",
    "deleteFailed": "要約を削除できませんでした"
  },
  "recorderMissing": {
    "title": "録音ツールを追加してください",
    "body": "Lesson Studioはレッスンから要約を書き起こします。そのためにはChrome拡張機能による録音が必要です。インストール・サインインが済むまで、このページには何も表示されません。"
  },
  "pending": {
    "chooseStudent": "まず誰とのレッスンか選択してください。",
    "fileFailed": "この録音の整理に失敗しました。",
    "confirmDelete": "この録音を削除しますか？音声ファイルも同時に削除されます。",
    "studentAria": "生徒",
    "choosePlaceholder": "生徒を選択",
    "filing": "整理中…",
    "buildRecap": "要約を作成"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "初心者",
        "sub": "ひらがな＋ローマ字"
      },
      {
        "label": "ひらがな",
        "sub": "かな、ローマ字なし"
      },
      {
        "label": "漢字＋かな",
        "sub": "読み付きの漢字"
      }
    ],
    "failed": "生成に失敗しました",
    "needLesson": "まずレッスン要約を公開してください",
    "title": "練習テストを生成",
    "explanationLanguage": "説明言語"
  },
  "guide": {
    "eyebrow": "レッスン録音",
    "title": "録音から要約を作成",
    "sub": "Chrome拡張機能が、レッスンタブとマイク音声をそれぞれ分けて録音し、下書き要約にします。ボット参加や生徒側のインストール不要——Preply, italki, Google Meet, Zoomなど、どのタブでも利用可能。",
    "step1Title": "Chromeウェブストアからインストール",
    "step1Body": "ワンクリックで設定不要。その後、アドレスバー横のパズルピースからKにピン留めすると便利です。",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Chromeに追加",
    "addToChrome": "Chromeに追加（無料）↗",
    "betaNote": "**ベータ版をフォルダからインストールしていた場合**、まずそのコピーを削除({path}→削除)してください。同時に1つの拡張しか録音できません。",
    "step2Title": "サインイン（1回のみ）",
    "step2Body": "拡張機能を開き、ここで登録したメール・パスワードでサインインします。これだけでセットアップ完了です。あなたの生徒・教科も紐付きます。",
    "signIn": "サインイン",
    "step3Title": "レッスンタブを開き録音開始",
    "step3Body": "Preply教室やMeet通話など、実際にレッスンをするタブでご利用ください。Kアイコンから生徒を選び、**録音開始**を押します。初回はChromeがマイク権限を求めますので許可してください。ポップアップを閉じれば録音が続きます。",
    "studentLabel": "生徒：",
    "step4Title": "終了したら送信",
    "step4Body": "レッスン終了後にポップアップを開き、**録音停止**→**Lesson Studioに送信**を押してください。アップロードは送信ボタンを押すまで行われません。",
    "sendButton": "Lesson Studioに送信 →",
    "step5Title": "要約を確認",
    "step5Body": "数分後、下書き要約が「レビュー待ち」に現れます——要約・語彙・宿題など、生徒の言語で表示されます。編集して送信すれば生徒ポータルに反映されます。",
    "reviewAndSend": "確認して送信",
    "consentTitle": "録音時に同意を得ること",
    "consentBody": "録音する旨を生徒に伝え、合意を得てください。国やサービスによって録音同意が必要な場合があります。Preplyやitalkiでも録音利用の条件が明記されていますので事前にご確認ください。",
    "dataBody": "録音は両者の音声を取得します。**Lesson Studioに送信**を押すまでアップロードされず、音声は要約作成のために書き起こしされ、ファイルは30日後に削除されます。詳細は{policy}をご覧ください。",
    "privacyLink": "プライバシーポリシー"
  },
  "lessonExercises": {
    "none": "このレッスン用の練習課題はありません。",
    "recordReading": "以下の文を音読録音",
    "notRecorded": "録音未提出"
  },
  "lessonTools": {
    "lessonIsWith": "このレッスンの相手",
    "notLinked": "リンクなし（テスト用等）",
    "hint": "生徒を紐付けると要約が生徒側に送信されます。テストコールは未リンクでもかまいません。"
  },
  "memo": {
    "back15": "15秒戻る",
    "forward15": "15秒進む",
    "seek": "移動"
  },
  "joinInvalid": {
    "title": "このリンクは無効です",
    "body": "すでに利用されたか、先生が新しいリンクを発行した可能性があります。新しいリンクを依頼してください。",
    "goSignIn": "サインイン画面へ"
  },
  "dashboard": {
    "students": "生徒",
    "withLogin": "ログイン済み",
    "lessonsRecorded": "録音済みレッスン",
    "noStudents": "生徒はいません",
    "notJoined": "招待済み—未登録",
    "lessons": "レッスン",
    "overview": "概要"
  }
} as const
