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
    "expand": "ナビゲーションを展開",
    "collapse": "ナビゲーションを折りたたむ",
    "sectionWorkspace": "ワークスペース",
    "sectionManage": "管理",
    "overview": "概要",
    "students": "生徒",
    "notes": "ノート",
    "materials": "教材",
    "studentView": "生徒ビュー",
    "payments": "支払い",
    "availability": "空き状況",
    "settings": "設定",
    "calendarConnected": "カレンダー接続済み",
    "setupNeeded": "設定が必要です",
    "recordingsOnly": "録音のみ",
    "studentPortal": "生徒ポータル"
  },
  "auth": {
    "language": "言語",
    "emailLabel": "メールアドレス",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "パスワード",
    "signInTitle": "サインイン",
    "signInSub": "お帰りなさい。レッスンや進捗、要約を確認できます。",
    "signInExpired": "セッションがタイムアウトしました。サインインして元の画面に戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めてご利用ですか？",
    "createAccountLink": "講師アカウント作成",
    "freeToSetUp": "設定は無料です。生徒をすぐに追加できます。",
    "studentQuestion": "生徒ですか？",
    "studentAnswer": "教師から招待リンクが届きます。リンクを開いてご自身のメールとパスワードを決めてください。その後はこちらでサインインします。",
    "signInHeadline": "すべてのレッスン、書き起こしで。",
    "signInAside": "Lesson Studioは1時間ごとに要約・進捗表・練習課題を作成します。担当した講師と受講した生徒の両方のために。",
    "signUpTitle": "講師アカウントを作成",
    "signUpSub": "Koku Libraryのワークスペースを開始し、生徒管理、レッスン要約、予約、進捗管理を行えます。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウント作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウントを作成できませんでした。",
    "createdNowSignIn": "アカウントを作成しました。サインインしてください。",
    "haveAccount": "すでにアカウントをお持ちですか？",
    "signUpHeadline": "あなたの教室運営を、ひとつの場所で。",
    "signUpAside": "数分で初期設定が完了します。生徒を追加し、次のレッスンを録音するだけで仕組みが整います。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンが自動で要約される",
        "body": "Chrome拡張が両方の音声を録音します。要約は下書きとして届くので、編集して公開します。"
      },
      {
        "title": "進捗が可視化される",
        "body": "スコアや発話時間、語彙数がレッスンごとに記録され、生徒用ページで確認できます。"
      },
      {
        "title": "どんな言語でも対応",
        "body": "日本語、フランス語、韓国語、スペイン語など30言語以上。レッスンで使われた言語で添削し、生徒の母語で説明します。"
      },
      {
        "title": "自分の言葉で練習",
        "body": "1時間の中で出てきた語彙をもとに、フラッシュカードやスピーキングテストを自動作成。"
      },
      {
        "title": "自分の名前入りポータル",
        "body": "色や表記、必要なセクションだけを反映した生徒専用のページです。"
      }
    ]
  },
  "onboarding": {
    "steps": [
      "レッスン内容",
      "利用する場所",
      "カレンダー連携",
      "生徒ビュー",
      "録音ツール"
    ],
    "sideTitle": "スタジオの初期設定をしましょう。",
    "sideBody": "4つの簡単な設定で、生徒だけのポータルページが用意されます。",
    "stepCount": "ステップ {n} / {total}",
    "choose": "選択…",
    "continueAction": "続ける",
    "finish": "設定を完了",
    "finishing": "完了処理中…",
    "couldNotSave": "保存できませんでした",
    "couldNotFinish": "完了できませんでした",
    "pickTeaching": "教える言語を選択してください。",
    "pickSpoken": "レッスンが主に使われる言語を選択してください。",
    "pickCalendar": "レッスンをカレンダーで管理しているか教えてください。",
    "pickPortalName": "ポータルの名前を入力してください。生徒が見る名称です。",
    "teachAria": "教える言語",
    "iTeach": "私は",
    "teachHint": "要約や練習課題はこの言語で作成されます。追加した生徒は個別に切り替え可能です。",
    "spokenAria": "レッスンで使用する言語",
    "spokenIn": "レッスンは主に",
    "spokenHint": "学習言語とは限りません。初心者の場合は共通言語になることも多いです。録音もこの言語で聞き取ります。",
    "timezone": "タイムゾーン",
    "platformTitle": "どのツールで生徒と会いますか？",
    "platformLead": "MeetやZoomなら予約時にリンクを作成します。マーケットプレイス経由なら既存の部屋を利用し、リンクはそのまま使用します。",
    "zoomLater": "Zoomの接続は後から設定で可能",
    "stayOutTitle": "レッスン自体には介入しません",
    "stayOutBody": "リンク作成やBot送信はありません。自分で録音したファイルから要約・語彙・練習を生成します。生徒が閲覧する流れは同じです。",
    "calendarTitle": "レッスンはどこで管理していますか？",
    "calendarLeadExternal": "一部の{platform}講師はGoogleカレンダーで予定を管理し、他の方は全てプラットフォーム内で完結します。選択内容でワークスペースの表示が決まります。",
    "calendarLead": "Googleカレンダーでレッスンを管理していれば、予定確認・予約受付・録音の自動送信が可能です。他で管理する場合はワークスペースは録音記録のみになります。",
    "googleConnected": "Googleカレンダー接続済み",
    "googleConnectedSub": "どのカレンダーを使用するかは設定から変更できます。",
    "connectGoogle": "Googleカレンダーに接続",
    "connectGoogleFine": "Googleの認証画面に移動し、その後ここに戻ります。接続しなくても利用可能ですが、予約と自動録音はオフのままです。",
    "recordTitle": "レッスンを録音",
    "recordBody": "どのツールでも、その内容を録音してLesson Studioに渡せます。",
    "reviewTitle": "要約を確認",
    "reviewBody": "他のレッスンと同じく、要約レビューとして並びます。公開すれば生徒に届きます。",
    "noCalendarFine": "カレンダー連携なしの場合は、予約ページや通知は表示されません。ワークスペースはレッスンと要約が中心になります。設定からいつでも切り替えできます。",
    "brandTitle": "個別カスタマイズ",
    "brandLead": "生徒がログインするポータルの色や名前を選べます。後から細かく変更できます。",
    "portalNameLabel": "生徒ポータル名",
    "portalNamePlaceholder": "例：さくら日本語",
    "portalNameFine": "生徒用ポータルの上部や招待メールに表示される名前です。あなた独自のスタジオ名を設定してください。",
    "accent": "アクセントカラー",
    "previewTagline": "今日学んだことが、明日の力に！",
    "recorderTitle": "録音ツールをインストール",
    "recorderLead": "作業を実際に行う部分です。Chrome拡張がレッスンを録音し要約を書き起こします。Botは招待されず、生徒側へのインストールも不要です。",
    "recorderStep1": "**Chrome ウェブストアから追加** — クリック一つで、ツールバーへピン留めしてください。",
    "recorderStep2": "**拡張機能内でサインイン** — 同じメール・パスワードでログイン。データの移動やコピーは不要です。",
    "recorderStep3": "**レッスンを録音**：生徒を選び、開始ボタン、終了したら停止を押してください。",
    "addToChrome": "Chrome に追加 — 無料 ↗",
    "recorderFine": "詳しい手順（マイク許可・録音範囲）は{guide}にあります。**設定 → レッスン録音**からいつでも確認できます。",
    "recorderFineLink": "セットアップガイド"
  },
  "overview": {
    "eyebrow": "概要",
    "title": "あなたのレッスンカレンダー",
    "manageConnections": "連携を管理",
    "fixInSettings": "設定で修正",
    "summaryAria": "レッスン要約",
    "upcoming": "今後のレッスン",
    "drafts": "レビュー待ち下書き",
    "draftsSub": "要約があなたの確認待ち",
    "published": "公開済み要約",
    "publishedSub": "生徒に送信済み",
    "writeUpsLeft": "残りの要約数",
    "writeUpsAria": "残りの要約数 — 追加購入",
    "usageTrial": "{total}回分の無料のうち{used}回使用済み",
    "usageBought": "{used}件作成済み · 期限なし",
    "lessonCalendar": "レッスンカレンダー",
    "primaryCalendar": "（メイン）"
  },
  "connect": {
    "title": "Googleカレンダーに接続",
    "body": "カレンダーを連携するとLesson Studioが今後のレッスンを確認し、予約や録音が可能になります。",
    "notConfigured": "Google OAuth が未設定です。{id}と{secret}を環境に追加し、再起動してください。",
    "scopeRead": "**カレンダーの閲覧** — レッスンと会議リンクを取得",
    "scopeRecord": "**レッスン録音** — Lesson Studio拡張で録音",
    "scopeRecap": "**要約作成** — レッスン要約（AI）の下書きが作成されます",
    "continueGoogle": "Googleで続行",
    "fine": "Googleの認証画面に移動します。設定から後で変更できます。"
  },
  "settings": {
    "eyebrow": "ワークスペース",
    "title": "設定",
    "recorderTitle": "レッスン録音",
    "recorderDesc": "Chrome拡張で録音後、要約を生成します。{guide}",
    "recorderGuide": "手順ガイド →",
    "replayTourHint": "このページの使い方を忘れた場合、ここから再度案内が見られます。",
    "languageTitle": "表示言語",
    "languageDesc": "ワークスペースの表示言語。要約文の言語は変更されません（生徒ごとに指定可能）。",
    "connectionsTitle": "外部連携",
    "connectionsDesc": "スケジュール管理・ミーティング・決済のための外部ツール連携。",
    "livesTitle": "レッスン管理場所",
    "livesDesc": "Googleカレンダーを使えば予約ページ・空き枠管理・自動録音が有効です。他で管理の場合は録音記録のみ扱います。",
    "calendarTitle": "レッスンカレンダー",
    "calendarDesc": "Lesson Studioが読み取るカレンダーを選択",
    "primaryCalendar": "メインカレンダー",
    "speakingTitle": "スピーキング課題",
    "speakingDesc": "要約の最後にスピーキング課題を3つ追加します。生徒が録音すると、その音声はレッスンページ下部に表示され、提出時に通知が届きます。オフにすると、この3課題は要約から除外されます。",
    "speakingOn": "生徒の録音を許可",
    "speakingOnHint": "レッスンページで音声確認可能",
    "speakingOff": "除外する",
    "speakingOffHint": "要約は7つの筆記課題のみになります",
    "platformTitle": "標準のミーティングツール",
    "platformDesc": "新規予約の際に作成するものです。最後の項目は既存リンク（Preply・italki・独自ルーム用）です。",
    "meetLabel": "Google Meet",
    "meetHint": "カレンダー上で自動作成",
    "ownLinkLabel": "独自リンクを共有",
    "ownLinkHint": "Preply・italkiまたは独自の部屋"
  },
  "billing": {
    "leftTitle": "残りの要約数",
    "leftDesc": "1レッスン要約ごとに1件消費します。有効期限なし・自動更新なし。",
    "ofFree": "{total}回分の無料要約のうち",
    "ofFreeUsed": "{total}回分の無料要約のうち · {used}回使用済み",
    "builtSoFar": "ここまで{used}件作成済み",
    "emptyTrial": "無料分を使い切りました。下記から追加可能です。サブスクリプションや自動更新はありません。",
    "emptyPaid": "残高がありません。下記から追加購入してください。未使用分の消滅はありません。",
    "addTitle": "要約数を追加",
    "addDesc": "一回払い・自動更新なし。大きいパックは単価がお得ですが、少数パックも割高という訳ではありません。購入分は失効しません。",
    "lessonsWrittenUp": "要約済みレッスン数",
    "save": "{pct}% お得",
    "neverExpires": "有効期限なし",
    "buy": "{n}件を購入",
    "paidOnce": "Stripeによる一回払いのみ。カード情報を保持せず、自動請求もありません。",
    "packTags": [
      "はじめての方",
      "安定した継続用",
      "一番人気"
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
    "sub": "各タブを見直し、{first}に送信します。",
    "translate": "説明文を翻訳",
    "translateTitle": "説明文を生徒の母語に書き直します（教材やスコアはそのまま）",
    "working": "処理中…",
    "rebuild": "録音から再生成",
    "rebuildTitle": "最新AIと指標で録音から再生成",
    "rebuilding": "再生成中…",
    "deleteDraft": "下書きを削除",
    "deleting": "削除中…",
    "saveDraft": "下書きを保存",
    "approve": "承認して送信",
    "sending": "送信中…",
    "savedTick": "保存済み ✓",
    "confirmRebuild": "この要約を録音から再生成しますか？要約・セクション・宿題・流暢度指標が新しくなり、手動編集は失われます。",
    "confirmTranslate": "この要約の説明文を生徒に合わせた言語に翻訳しますか？例文・引用・スコアはそのままです。",
    "confirmDelete": "{name}の下書き要約を削除しますか？要約一覧から消え、元に戻せません。",
    "promptLanguage": "この生徒の説明用言語はまだ設定されていません（生徒ページで変更可）。説明文はどの言語で翻訳しますか？",
    "rebuildFailed": "再生成に失敗しました",
    "translationFailed": "翻訳に失敗しました",
    "deleteFailed": "要約を削除できませんでした",
    "savingEdits": "編集内容を保存中…",
    "uploadingMemo": "ボイスメモをアップロード中…",
    "uploadingFile": "{name} をアップロード中…",
    "attachingMaterials": "教材を添付中…",
    "attachmentFailed": "要約は送信されましたが、添付ファイルがアップロードできませんでした。レッスンページから追加してください。",
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
      "statLessons": "レッスン数",
      "statScore": "平均スコア",
      "statSpeaking": "発話量",
      "lessonsTitle": "あなたのレッスン",
      "progressTitle": "進捗状況",
      "vocabTitle": "語彙",
      "milestoneTitle": "次のマイルストーン",
      "scoresTitle": "最近のスコア",
      "testsTitle": "練習テスト",
      "speakingTitle": "発話習慣",
      "filesTitle": "レッスンファイル",
      "vocabTotalsTitle": "語彙の伸び"
    },
    "tabsAria": "ダッシュボードの各セクション",
    "notLinked": "アカウント未連携",
    "askTeacher": "講師にアカウント連携を依頼してください。",
    "climbLed": "リスニング中心から{em}に進みました。",
    "climbLedEm": "主導して会話",
    "climbMore": "開始時より{em}話しています。",
    "climbMoreEm": "{delta}点アップ",
    "climbPlain": "前回レッスンは{em}話しました。",
    "youSpoke": "話した割合",
    "acrossLessons": "{n}レッスン累計",
    "acrossOneLesson": "1レッスン累計",
    "climbSub": "円弧のマークがスタート地点（{then}）です。",
    "climbDelta": "初回から{delta}ポイント増",
    "inLast30": "直近30日で{n}回",
    "totalLessons": "受講済みレッスン数",
    "inAll": "合計{n}回",
    "words": "{n}語",
    "lastN": "直近{n}回",
    "metricPace": "話す速さ",
    "metricThinking": "考える時間",
    "metricShare": "発話シェア",
    "practiseTitle": "語彙で練習",
    "practiceHistory": "直近2週間の練習履歴",
    "byKind": "単語の種類別",
    "byLesson": "レッスン別",
    "practiseAnything": "自由に練習する",
    "practiseDue": "期限の単語で練習",
    "vocabKnown": "習得済み",
    "vocabLearning": "学習中",
    "vocabNew": "未着手",
    "download": "ダウンロード"
  },
  "practice": {
    "emptyTitle": "まだ練習できるものがありません",
    "emptyBody": "教師がレッスン要約を公開すると単語が表示されます。",
    "howMany": "今日は何枚やりますか？",
    "doneTitle": "完了 — {n}枚",
    "doneOneTitle": "完了 — 1枚",
    "allFirstTime": "すべて初回です。数日後にまた出てきます。",
    "someMissed": "{right}枚が初回で、{missed}枚は早めに再確認されます。",
    "moreLeft": "この山にあと{n}語あります。好きな時に続けられます。",
    "oneLeft": "あと1語この山に残っています。好きな時に続けられます。",
    "wholePile": "これで全てです。",
    "nextRound": "あと{n}語",
    "practiseAgain": "もう一度練習する",
    "backToPractice": "練習に戻る",
    "tapToSee": "意味を見るにはタップしてください",
    "again": "もう一度",
    "knewIt": "知っていた",
    "sayOutLoud": "カードをめくる前に声に出して言ってみましょう。"
  },
  "rating": {
    "question": "この要約は自分のレッスン内容に合っていますか？",
    "yes": "はい、これが私のレッスンです",
    "no": "ちょっと違う",
    "thanksYes": "「合っている」と回答いただきました。内容は確認済みとなります。",
    "thanksNo": "「違う」と回答いただきました。助かります。",
    "whatWasOff": "どこが違いましたか？該当するものを選んでください。",
    "notePlaceholder": "どの部分か書ける場合は一文で十分です。",
    "send": "送信",
    "sending": "送信中…",
    "didNotSave": "保存できませんでした。",
    "reasons": [
      "使っていない単語があった",
      "話者が入れ替わっている",
      "文字や言語が違う",
      "難易度が合っていない",
      "その他"
    ]
  },
  "recapLanguage": {
    "question": "要約の説明文の言語",
    "hint": "学習する言語自体はそのままです。ここで説明周りに使われる言語だけを変更します。",
    "aria": "要約説明文の言語",
    "saved": "保存済み（次回以降の要約から適用）",
    "didNotSave": "保存できませんでした。"
  },
  "lesson": {
    "railAria": "レッスン各セクション",
    "thisLesson": "このレッスン",
    "movements": [
      "発話の様子",
      "できたこと",
      "改善点",
      "扱った内容",
      "本日の単語",
      "練習",
      "ファイル・音声"
    ],
    "speakingBalance": "発話バランス",
    "score": "スコア",
    "grammarDensity": "文法密度",
    "corrections": "訂正",
    "homework": "宿題",
    "noHomework": "このレッスンの宿題はありません。",
    "practiceExercises": "練習問題",
    "wordsFromLesson": "このレッスンで出た単語",
    "whoTalked": "誰が話したか",
    "speakingMeasured": "発話データ",
    "yourTeacher": "あなたの先生"
  },
  "join": {
    "setupFailed": "アカウントを設定できませんでした。",
    "acceptFailed": "招待を受け入れられませんでした。",
    "joining": "参加中…",
    "joinAs": "{name}として参加",
    "notYou": "ご自身ではない場合、{signOut}後もう一度リンクを開いてください。",
    "notYouLink": "サインアウト",
    "emailLabel": "あなたのメールアドレス",
    "passwordLabel": "パスワードを決めてください",
    "passwordHint": "8文字以上",
    "settingUp": "設定中…",
    "createAccount": "アカウント作成"
  },
  "speaking": {
    "cta": "回答を録音",
    "sendFailed": "録音を送信できませんでした。再試行してください。",
    "recordAgain": "再録音",
    "sendToTeacher": "先生に送信",
    "sending": "送信中…",
    "tryAgain": "再試行",
    "keepSent": "送信済みのままにする"
  },
  "exchange": {
    "recording": "録音",
    "download": "ダウンロード",
    "nothingShared": "このレッスンにはまだ何も共有されていません。",
    "noFiles": "共有ファイルがありません。レッスン資料やPDFをアップロードしてください。",
    "audioIntro": "生徒がこのレッスンのために録音した練習です。スピーキング課題への回答は「練習」タブに表示されます。",
    "noAudio": "音声の提出はまだありません。"
  },
  "charts": {
    "metrics": [
      {
        "label": "スコア",
        "note": "各レッスンの10点満点での評価。"
      },
      {
        "label": "発話割合",
        "note": "自分が話した割合。自信がつくほど増えていきます。"
      },
      {
        "label": "話す速さ",
        "note": "話している時の1分あたり単語数。"
      },
      {
        "label": "考える時間",
        "note": "回答までにかかった秒数。短いほど反射的に言葉が出てきています。"
      },
      {
        "label": "語彙数",
        "note": "全レッスンの単語を合計した数。"
      }
    ],
    "nothingYet": "まだ記録がありません。",
    "sinceLesson": "レッスン{n}以降",
    "trendLater": "次回レッスン終了後に傾向が表示されます。"
  },
  "tests": {
    "saveScoreFailed": "スコアを保存できませんでした。",
    "finish": "終了 — {pct}%",
    "allWords": "全単語"
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
    "removeRange": "範囲を削除",
    "couldNotSave": "保存できませんでした",
    "saveChanges": "変更を保存",
    "defaultsTitle": "レッスン初期値",
    "defaultsDesc": "レッスン時間や予約受付の期間を設定します。",
    "lessonName": "レッスン名",
    "lessonNamePlaceholder": "語学レッスン",
    "lessonLength": "レッスン時間(分)",
    "slotInterval": "間隔(分)",
    "minNotice": "最短受付時間(時間)",
    "bufferBefore": "前の間隔(分)",
    "bufferAfter": "後の間隔(分)",
    "maxPerDay": "1日最大レッスン数",
    "bookingWindow": "予約受付期間(日)",
    "title": "空き状況",
    "copyMon": "月曜を平日へコピー →",
    "copyMonTitle": "月曜の時間を火～金にコピー",
    "previewBooking": "予約ページをプレビュー ↗",
    "unavailable": "受付不可",
    "dateOverrides": "特定日設定"
  },
  "recordings": {
    "eyebrow": "概要",
    "title": "レッスン & 要約",
    "settings": "設定",
    "yourStudents": "担当生徒",
    "publishedTitle": "公開済みレッスン",
    "publishedDesc": "生徒がすでに見られるもの。新しい順に表示。下書きは上のキューにあります。",
    "nothingPublished": "まだ公開されていません",
    "untitled": "タイトルなしレッスン",
    "published": "公開済み",
    "draft": "下書き",
    "summaryAria": "レッスン要約",
    "students": "生徒",
    "changedMind": "変更したい場合は？",
    "connectCalendar": "カレンダーに連携"
  },
  "lessonRow": {
    "joinCall": "通話に参加 ↗",
    "viewRecap": "要約を見る",
    "reviewRecap": "要約を確認",
    "noLink": "リンクなし",
    "eyebrow": "公開前に内容を確認",
    "recapTitle": "{title} · レッスン要約",
    "closeAria": "要約レビューを閉じる",
    "draftBanner": "AI下書きです。内容を見直してから生徒に届けてください。",
    "score": "スコア",
    "studentTalk": "生徒の話す割合",
    "grammar": "文法",
    "confidence": "自信度",
    "homework": "宿題",
    "memoScript": "ボイスメモスクリプト",
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
    "bookingFailedRetry": "予約に失敗しました — 再度お試しください。",
    "eyebrow": "レッスンを予約",
    "title": "都合のよい時間を探す",
    "sub": "日付を選択し、時間を決めてください。詳細はメールで届きます。",
    "booked": "予約完了しました！",
    "invite": "カレンダー招待が{email}宛に送信されます。",
    "openMeeting": "ミーティングリンクを開く",
    "noCalendar": "空き状況が取得できません。カレンダーは接続されていますか？",
    "noTimes": "30日以内に空きレッスン時間がありません。",
    "pickDay": "日付を選択",
    "pickDayHint": "点のついた日が空きありです。",
    "yourDetails": "あなたの情報",
    "confirmAt": "{time}を予約",
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
        "body": "ホーム画面です。要約はここに届き、最新のレッスンが下に並びます。"
      },
      {
        "title": "生徒",
        "body": "ここで生徒ごとに登録します。各生徒のレッスンやテスト、進捗を管理可能。それぞれに個別ポータルも付与されます。"
      },
      {
        "title": "ノート",
        "body": "レッスンごとにワンクリックで記録。カレンダー型の日誌です。"
      },
      {
        "title": "生徒ビュー",
        "body": "生徒側が実際に目にするものを、色や名前・表示セクションまで反映して確認できます。本物の画面で模擬ではありません。"
      },
      {
        "title": "支払い",
        "body": "生徒ごとの支払い履歴とレッスン回数を記録。公開ごとに残数がカウントダウンされます。"
      },
      {
        "title": "設定",
        "body": "カレンダー、録音ツール、アカウント管理はこちら。ガイド再表示もここから実施できます。"
      }
    ],
    "skip": "案内をスキップ"
  },
  "languages": {
    "couldNotSave": "保存できませんでした",
    "title": "対応言語",
    "desc": "教える言語・レッスンで使う言語を設定します。新しい生徒はここから初期値が適用されます。",
    "youTeach": "教える言語",
    "spokenIn": "レッスンで使う言語",
    "fitTitle": "言語設定の役割",
    "fitDesc": "3つの設定、それぞれ違う役割があります。",
    "fitLearning": "**生徒の「学習」言語**で要約・テストが生成されます（日本語や韓国語・スペイン語・アラビア語など{n}言語対応）。追加・切替とも生徒ページで可。",
    "fitExplained": "**生徒の「説明用」言語**は要約文やテスト指示の言語です。初期値は英語（変更可）。",
    "fitSpoken": "**生徒の「レッスンで使う」言語**は録音時の認識対象です。基本はこの画面で設定した内容が引き継がれます（今後レッスンごと再選択は不要）。"
  },
  "notes": {
    "pickStudent": "生徒を選択",
    "empty": "ノートは空です",
    "couldNotSave": "ノートを保存できませんでした",
    "confirmDelete": "このノートを削除しますか？",
    "hoursTaught": "指導時間",
    "recapsPublished": "公開済み要約数",
    "prevMonth": "前月",
    "nextMonth": "翌月",
    "today": "今日",
    "noStudents": "生徒がいません",
    "student": "生徒",
    "addNote": "ノートを追加",
    "newNote": "新しいノート",
    "editNote": "ノートを編集"
  },
  "exercises": {
    "none": "まだ練習問題がありません。下に追加してください。",
    "instruction": "指示文",
    "instructionPlaceholder": "生徒がすべき内容",
    "focus": "着目点",
    "focusPlaceholder": "この文で練習するポイント",
    "sentence": "文",
    "meaning": "意味",
    "removeSentence": "文を削除",
    "removeOption": "選択肢を削除",
    "questionTarget": "質問（対象言語）",
    "question": "質問"
  },
  "payments": {
    "selectStudent": "生徒を選択",
    "amountTooLow": "1より大きい金額を入力してください",
    "saveFailed": "保存に失敗しました",
    "thisMonth": "今月",
    "receivedAllTime": "合計受領額",
    "outstanding": "未払い",
    "currency": "通貨",
    "students": "生徒",
    "prevMonth": "前月",
    "nextMonth": "翌月",
    "today": "今日",
    "noStudents": "生徒がまだいません",
    "student": "生徒",
    "recent": "直近の支払い履歴",
    "newPayment": "新しい支払い",
    "editPayment": "支払い編集",
    "selectPlaceholder": "選択…",
    "amount": "金額({symbol})",
    "status": "ステータス",
    "paid": "支払い済み",
    "pending": "未払い",
    "covers": "対象",
    "coversPlaceholder": "例：7月パッケージ — 4回分",
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
    "sectionTitle": "セクションタイトル",
    "sectionContent": "セクション内容…",
    "removeSection": "セクションを削除",
    "homeworkTask": "宿題課題",
    "noteTitle": "生徒へのメモ",
    "notePlaceholder": "生徒への個別メモ…"
  },
  "connectors": {
    "googleName": "Googleカレンダー",
    "googleDesc": "レッスン予定を取得し、予約内容を書き込みます。",
    "connect": "接続",
    "permissionNeeded": "許可が必要です",
    "reconnect": "再接続",
    "disconnect": "切断",
    "zoomDesc": "予約済みレッスンごとにZoomルームを自動生成します。",
    "comingSoon": "近日公開",
    "stripeName": "Stripe",
    "stripeDesc": "レッスンパッケージのカード決済を受け付けます。振込は直接ご自身に。"
  },
  "student": {
    "notJoined": "招待済み — まだ参加していません",
    "avgScore": "平均スコア",
    "latestTalk": "直近会話データ",
    "vocabItems": "語彙アイテム",
    "creditsLeft": "残り{left}回/{bought}回購入済み",
    "creditsOneLeft": "残り1回/{bought}回購入済み",
    "noCredits": "未購入",
    "managePayments": "支払い管理 →",
    "lessonsTitle": "レッスン & 要約",
    "noLessons": "まだレッスンがありません",
    "noLessonsSub": "この生徒の録音レッスンがここに表示されます。",
    "testsTitle": "練習テスト",
    "noTests": "まだテストがありません"
  },
  "addStudent": {
    "levels": [
      "初心者",
      "初級",
      "中級前",
      "中級",
      "中上級",
      "上級"
    ],
    "createFailed": "生徒を追加できませんでした",
    "aria": "新規生徒",
    "title": "新しい生徒",
    "fullName": "氏名",
    "namePlaceholder": "Jane Doe",
    "level": "レベル",
    "learning": "学習言語",
    "choose": "選択…",
    "recapLanguage": "要約言語"
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
    "prev": "前",
    "next": "次",
    "fixInSettings": "設定で修正",
    "nothingOn": "{day}には予定がありません。",
    "noLessonsThatDay": "この日の予定はありません。",
    "agendaClear": "スケジュールは空です。",
    "noUpcoming": "このカレンダーに今後のレッスンはありません。"
  },
  "forgot": {
    "title": "パスワードをリセット",
    "lead": "サインイン時のメールアドレスを入力してください。新しいパスワード設定用のリンクをお送りします。",
    "send": "リセットリンク送信",
    "sending": "送信中…",
    "sent": "{email}にアカウントがある場合、リセットリンクを送付しました。メールを開き、1時間以内にリンクから新しいパスワードを設定してください。",
    "spam": "届かない場合は、迷惑メールや入力メールアドレスを再度ご確認ください。",
    "remembered": "思い出しましたか？",
    "backToSignIn": "サインインに戻る"
  },
  "reset": {
    "tooShort": "新しいパスワードは6文字以上である必要があります。",
    "mismatch": "2つのパスワードが一致しません。もう一度ご確認ください。",
    "samePassword": "以前と同じパスワードです。別のものを選択してください。",
    "saveFailed": "パスワードを保存できませんでした。再度お試しください。",
    "title": "新しいパスワードを設定",
    "expired": "このリセットリンクは有効期限切れまたはすでに使用済みです。再度申請してください。",
    "noToken": "このページはリセット用メールのリンクからのみ利用可能です。再度リクエストしてください。",
    "lead": "新しいパスワードを設定します。保存完了後、自動でサインインされます。",
    "newPassword": "新しいパスワード",
    "repeat": "確認用入力"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "平均スコア",
        "sub": "全てのスコア付きレッスンの平均（10点中）。"
      },
      {
        "label": "発話シェア",
        "sub": "レッスン中に生徒が話していた割合。"
      },
      {
        "label": "発話ペース",
        "sub": "発話時の1分あたり単語数。右肩上がりは流暢さ向上。"
      },
      {
        "label": "思考時間",
        "sub": "あなたが話し終えて生徒が話し始めるまでの秒数。長いほどトレーニング中で、悪いことではありません。"
      },
      {
        "label": "ターン単語数",
        "sub": "生徒が一度に話す単語数。短いターンで速い回答は受け答え、長いターンは会話。"
      },
      {
        "label": "フィラーワード",
        "sub": "1レッスンあたり話しながらの「えー」や「あー」の回数。速くて多い時と遅いけど少ない時は別の傾向です。"
      }
    ],
    "totalLessons": "総レッスン数",
    "acrossStudents": "{n}名分",
    "mostActive": "最もアクティブ",
    "nLessons": "{n}レッスン",
    "nothingRecorded": "記録はまだありません",
    "vocabMet": "出現単語数",
    "wordsAcross": "全レッスン合計単語",
    "notSeenLately": "最近受講なし",
    "everyoneCurrent": "全員最新です",
    "measureAria": "指標",
    "nothingMeasured": "測定データがありません。レッスンを記録すると表示されます。",
    "perStudent": "{measure} — 生徒ごと",
    "perStudentSub": "その生徒のレッスン順です。矢印は最初→最後。",
    "prevMeasure": "前の指標",
    "nextMeasure": "次の指標"
  },
  "test": {
    "heading": "{level} 練習テスト",
    "published": "公開済み",
    "draftOnlyYou": "下書き — あなたのみ表示",
    "basedOn": "出題元",
    "lessonN": "レッスン{n}",
    "script": "文字種",
    "scriptBeginner": "ひらがな + ローマ字",
    "scriptHiragana": "ひらがな",
    "scriptKanji": "漢字 + かな",
    "created": "作成日",
    "status": "ステータス",
    "speakingAnswer": "スピーキング回答",
    "unplayable": "録音データがありますが再生できませんでした。"
  },
  "trial": {
    "aria": "Lesson Studioへようこそ",
    "kicker": "Lesson Studioへようこそ",
    "title": "最初の{n}件の要約は無料です。",
    "sub": "録音ツールをインストールしてレッスンを実施すれば、自動で要約が届きます。クレジットカード不要です。ご納得いただければご購入ください。",
    "showMe": "案内を見る",
    "exploreMyself": "自分で見てみる",
    "setUpFirst": "あるいは録音ツールから始める →"
  },
  "reviewQueue": {
    "title": "要約レビュー待ち",
    "desc": "録音から自動生成。生徒への公開前に必ず確認・修正できます。",
    "moveFailed": "この要約を移動できませんでした",
    "serverUnreachable": "サーバーに接続できませんでした",
    "rebuildFailed": "要約の再生成に失敗しました",
    "deleteFailed": "要約を削除できませんでした"
  },
  "recorderMissing": {
    "title": "録音ツールの追加から開始",
    "body": "Lesson Studioはレッスンを要約します。そのための録音はChrome拡張で行います。これがインストール・サインインされるまでここの画面に何も表示されません。別の方法はありません。"
  },
  "pending": {
    "chooseStudent": "まずレッスン相手の生徒を選択してください。",
    "fileFailed": "この録音を保存できませんでした。",
    "confirmDelete": "この録音を削除しますか？音声データも消えます。",
    "studentAria": "生徒",
    "choosePlaceholder": "生徒を選択してください",
    "filing": "保存中…",
    "buildRecap": "要約を作成"
  },
  "generateTest": {
    "scripts": [
      {
        "label": "初心者",
        "sub": "ひらがな + ローマ字"
      },
      {
        "label": "ひらがな",
        "sub": "かな、ローマ字なし"
      },
      {
        "label": "漢字 + かな",
        "sub": "漢字と読み"
      }
    ],
    "failed": "生成に失敗しました",
    "needLesson": "まずレッスン要約を公開してください",
    "title": "練習テスト生成",
    "explanationLanguage": "説明文の言語"
  },
  "guide": {
    "eyebrow": "レッスン録音",
    "title": "レッスンを録音し、要約を得る",
    "sub": "Chrome拡張がレッスンのタブとマイクを別トラックで録音し、ここで要約の下書きを作ります。Botは呼ばれず、生徒側にインストールも不要。Preply・italki・Google Meet・Zoomなど、どのタブでも動作します。",
    "step1Title": "Chromeウェブストアからインストール",
    "step1Body": "ワンクリックで設定不要。アドレスバー横のパズルマークを押してKをピン留めすれば、途中でもすぐ使えます。",
    "storeName": "Lesson Studio Recorder",
    "addToChromeShort": "Chromeに追加",
    "addToChrome": "Chrome に追加 — 無料 ↗",
    "betaNote": "**フォルダからベータ版を試していた場合**は事前にそちらを削除してください（{path} → 削除）。同時に複数コピーを使うことはできません。",
    "step2Title": "サインインは最初だけ",
    "step2Body": "拡張を開き、こちらと同じメールアドレス・パスワードでログインします。これで準備完了。担当生徒や教える言語も自動で引き継がれます。",
    "signIn": "サインイン",
    "step3Title": "レッスンタブで録音を開始",
    "step3Body": "Preply教室・Meetなど該当のタブを開き、Kを押して生徒を選択、「録音開始」。初回のみChromeからマイク許可が求められます。許可後はウィンドウを閉じていつも通りレッスンを。録音はそのまま継続します。",
    "studentLabel": "生徒:",
    "step4Title": "終了したら送信",
    "step4Body": "レッスン終了後、再度ウィンドウを開き「録音停止」→「Lesson Studioに送信」。送信前にデータはアップロードされません。",
    "sendButton": "Lesson Studioへ送信 →",
    "step5Title": "要約レビューへ",
    "step5Body": "数分後には下書きが「要約レビュー待ち」に表示されます。サマリー・語彙・宿題・生徒の言語で自動生成。編集後送信すれば生徒のポータルに反映されます。",
    "reviewAndSend": "確認して送信",
    "consentTitle": "録音前に必ず同意を得てください",
    "consentBody": "相手に録音する旨と同意をとってください。国や地域によって通話録音の同意が必要な場合があります。Preply・italki独自の録音規約も各自ご確認ください。",
    "dataBody": "録音は両者の音声を取得します。**Lesson Studioに送信**ボタン押下まではアップロードなし、書き起こしにのみ利用、30日後自動消去です。詳細は{policy}をご覧ください。",
    "privacyLink": "プライバシーポリシー"
  },
  "lessonExercises": {
    "none": "このレッスンには練習問題がありません。",
    "recordReading": "これらを自分で音読してください",
    "notRecorded": "まだ録音されていません。"
  },
  "lessonTools": {
    "lessonIsWith": "このレッスンの相手：",
    "notLinked": "未連携（テスト/生徒なし）",
    "hint": "生徒を紐付けると、要約がその生徒に届きます。通話のテスト時は未設定でOKです。"
  },
  "memo": {
    "back15": "15秒戻る",
    "forward15": "15秒進む",
    "seek": "シーク"
  },
  "joinInvalid": {
    "title": "このリンクは無効です",
    "body": "既に使われた可能性や、講師が新しいリンクを発行した可能性があります。再度講師にご確認ください。",
    "goSignIn": "サインイン画面へ"
  },
  "dashboard": {
    "students": "生徒",
    "withLogin": "ログインあり",
    "lessonsRecorded": "録音済みレッスン",
    "noStudents": "生徒がいません",
    "notJoined": "招待済み — まだ参加していません",
    "lessons": "レッスン",
    "overview": "概要"
  },
  "misc": {
    "outOfTen": "10点満点",
    "dashboardBack": "ダッシュボード",
    "backToOverview": "概要に戻る",
    "recapGone": "この要約はもう閲覧できません。",
    "timesShared": "共有回数",
    "languageGroup": "言語",
    "extConfirmReset": "全端末で録音ツールをサインアウトしますか？拡張機能内で再ログインするまで録音は停止します。",
    "extResetFailed": "録音ツールのリセットに失敗しました。",
    "extSigningOut": "サインアウト中…",
    "extSignOutEverywhere": "すべての場所でサインアウト",
    "howTitle": "レッスンが届くまでの流れ",
    "howSteps": [
      {
        "title": "レッスンの録音",
        "body": "ブラウザ録音ツールを使うか、プラットフォームが発行したファイルをアップロードします。"
      },
      {
        "title": "要約を自動生成",
        "body": "トランスクリプトデータから要約・語彙・訂正・練習問題を自動作成。"
      },
      {
        "title": "内容を見直して公開",
        "body": "必要なら編集し、送信。生徒側ポータルに反映されます。"
      }
    ],
    "instrStudentChose": "この言語は生徒自身が選択しました。変更可能ですが、元々は生徒の選択です。",
    "instrHint": "要約・テストで使う説明言語 — クリックで変更",
    "matLinkFailed": "リンクを保存できませんでした",
    "matLinksFailed": "リンクを保存できませんでした",
    "matAddLink": "リンクを追加",
    "confirmDeleteStudent": "この生徒とレッスン記録をすべて削除しますか？元に戻せません。",
    "resetPassword": "パスワード再設定",
    "inviteLink": "招待リンク",
    "uploadFailed": "アップロードに失敗しました",
    "micBlocked": "マイクがブロックされています。ブラウザでマイク許可を確認してください。",
    "micBlockedBar": "マイクがブロックされています。アドレスバーの横から許可の設定を見直してください。",
    "uploadAFile": "ファイルをアップロード",
    "submitToTeacher": "先生に送信",
    "discardRedo": "破棄してやり直す",
    "sendToStudent": "生徒に送信",
    "sendThisAnswer": "この回答を送信",
    "sentTick": "送信済み ✓",
    "vocabByLevelAria": "レベル別語彙一覧",
    "vocabTapHint": "レベル名をタップするとその単語と出現レッスンを表示します。",
    "firstSeenIn": "レッスン{n}で初登場",
    "firstSeen": "初出",
    "wordsIntroduced": "新出単語",
    "fromTheLesson": "このレッスンより",
    "goAgain": "もう一度やる",
    "showWord": "単語を表示",
    "showMeaning": "意味を表示",
    "correction": "訂正",
    "correctionsAria": "訂正事項",
    "noLessonsYet": "レッスンがまだありません"
  }
} as const
