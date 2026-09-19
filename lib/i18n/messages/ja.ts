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
    "workspace": "先生用ワークスペース",
    "overviewAria": "Lesson Studio概要",
    "navAria": "先生用ワークスペースのナビゲーション",
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
    "calendarConnected": "カレンダー連携中",
    "setupNeeded": "セットアップが必要",
    "recordingsOnly": "録音のみ",
    "studentPortal": "生徒ポータル"
  },
  "auth": {
    "language": "言語",
    "emailLabel": "メールアドレス",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "パスワード",
    "signInTitle": "サインイン",
    "signInSub": "おかえりなさい。レッスン、進捗、要約を見るにはサインインしてください。",
    "signInExpired": "セッションがタイムアウトしました。サインイン後、元の画面に戻ります。",
    "signInAction": "サインイン",
    "signingIn": "サインイン中…",
    "passwordDots": "••••••••",
    "forgotPassword": "パスワードをお忘れですか？",
    "newHere": "初めてご利用ですか？",
    "createAccountLink": "教師アカウント作成",
    "freeToSetUp": "登録無料、すぐに最初の生徒を追加できます。",
    "studentQuestion": "生徒の方ですか？",
    "studentAnswer": "先生から招待リンクが届きます。開いたあと、ご自身のメールアドレスとパスワードを設定してください。その後はこちらからサインインできます。",
    "signInHeadline": "すべてのレッスンが要約で残ります。",
    "signInAside": "Lesson Studioは、各レッスンを要約、進捗チャート、練習問題にまとめます。授業をした先生も、受けた生徒も使えます。",
    "signUpTitle": "教師アカウントの作成",
    "signUpSub": "Koku Libraryワークスペースを作成し、生徒管理、レッスン要約、予約、進捗の記録を始めましょう。",
    "fullNameLabel": "氏名",
    "passwordHint": "6文字以上",
    "createAccount": "アカウント作成",
    "creatingAccount": "アカウント作成中…",
    "createFailed": "アカウントを作成できませんでした。",
    "createdNowSignIn": "アカウントを作成しました。サインインしてください。",
    "haveAccount": "すでにアカウントがありますか？",
    "signUpHeadline": "教える仕事を一ヶ所で管理。",
    "signUpAside": "数分でセットアップできます。生徒を追加し、次のレッスンを録音すると、残りは自動で整理されます。"
  },
  "aside": {
    "slides": [
      {
        "title": "レッスンが自動で要約されます",
        "body": "Chrome拡張が両方の音声を記録します。要約が下書きで届くので、先生は編集して公開します。"
      },
      {
        "title": "進捗が見える形で残ります",
        "body": "スコア、話した時間、語彙を毎レッスン記録。生徒のためのページで確認できます。"
      },
      {
        "title": "どんな言語でも対応",
        "body": "日本語、フランス語、韓国語、スペイン語ほか多数。レッスンの言語で添削し、説明は生徒の母語で書けます。"
      },
      {
        "title": "生徒自身の言葉で練習",
        "body": "レッスンで出てきた語彙から単語カードと会話テストが作られます。"
      },
      {
        "title": "あなたの名前で生徒ポータル",
        "body": "色も言葉も、教える範囲もあなた仕様。"
      }
    ]
  },
  "onboarding": {
    "steps": [
      "あなたのレッスン",
      "受講場所",
      "カレンダー",
      "生徒ビュー",
      "録音ツール"
    ],
    "sideTitle": "スタジオを設定しましょう。",
    "sideBody": "4ステップで生徒ごとのポータルが作れます。",
    "stepCount": "ステップ {n} / {total}",
    "choose": "選択…",
    "continueAction": "続行",
    "finish": "設定完了",
    "finishing": "完了中…",
    "couldNotSave": "保存できませんでした",
    "couldNotFinish": "完了できませんでした",
    "pickTeaching": "教える言語を選んでください。",
    "pickSpoken": "レッスンで使う言語を選んでください。",
    "pickCalendar": "レッスンをカレンダーで管理しているか教えてください。",
    "pickPortalName": "ポータルに名前を付けてください。生徒が最初に見る名前です。",
    "teachAria": "教える言語",
    "iTeach": "私は教えています",
    "teachHint": "要約と練習テストはこの言語向けに作られます。追加する生徒ごとに変更できますが、初期設定はここから反映されます。",
    "spokenAria": "レッスンで使われる言語",
    "spokenIn": "レッスンで主に使う言語",
    "spokenHint": "学ぶ言語ではなく、先生と生徒が共有している言語になることもあります（初級者向けなど）。録音時はこの言語を検出します。",
    "timezone": "タイムゾーン",
    "platformTitle": "生徒とはどこで会いますか？",
    "platformLead": "MeetやZoomなら予約時に自動でリンクを作成します。マーケットプレイスでは部屋が元々あるのでリンク取得のみを行います。",
    "zoomLater": "Zoomは後から設定で連携できます",
    "stayOutTitle": "レッスン自体には介入しません",
    "stayOutBody": "リンク作成やボット参加は行いません。自身で録音し、その音声から要約・語彙・練習が作成されます。生徒に見える仕組みは変わりません。",
    "calendarTitle": "レッスンはどこで管理していますか？",
    "calendarLeadExternal": "一部の{platform}の先生もGoogleカレンダーで予定管理をしています。どちらを選ぶかによってワークスペースの表示が変わります。",
    "calendarLead": "生徒がGoogleカレンダー上にいる場合は週の予定を確認し、予約や録音も対応可能です。別の場所で管理しているなら介入しません。",
    "googleConnected": "Googleカレンダー連携中",
    "googleConnectedSub": "どのカレンダーにレッスンが入っているかは設定で選べます。",
    "connectGoogle": "Googleカレンダー連携",
    "connectGoogleFine": "Googleの同意画面に遷移します。連携せず進めることもできますが、予約・自動録音は有効になりません。",
    "recordTitle": "レッスンを録音",
    "recordBody": "どの教室でも録音し、そのデータをLesson Studioへ渡せます。",
    "reviewTitle": "要約を確認",
    "reviewBody": "録音したレッスンは他と同様にレビュー待ちになります。公開すれば生徒に届きます。",
    "noCalendarFine": "カレンダーを使わない場合は、予約ページやお知らせなしで、レッスンと要約のみが表示されます。設定からいつでも変更できます。",
    "brandTitle": "あなた専用にする",
    "brandLead": "生徒がログインするポータルの色や名前を選べます。細かい調整は後から変更可能です。",
    "portalNameLabel": "生徒ポータル名",
    "portalNamePlaceholder": "例：Sakura Japanese",
    "portalNameFine": "生徒ポータルの上部や招待メールに表示されます。あなたの教室名です。",
    "accent": "アクセント色",
    "previewTagline": "今日学び、明日活かす！",
    "recorderTitle": "録音ツールのインストール",
    "recorderLead": "Chrome拡張がこの役割を果たします：レッスンを録音し、要約を作ります。ボットの参加や生徒側のインストールは不要です。",
    "recorderStep1": "**Chromeウェブストアから追加**します。クリック1回で完了、その後ツールバーにピン留めします。",
    "recorderStep2": "**拡張機能内でサインイン**します。メールアドレスとパスワードは同じでOKです。何かをコピーする必要はありません。",
    "recorderStep3": "**レッスンを録音**：生徒を選び、開始ボタンを押し、終了時に停止します。",
    "addToChrome": "Chromeに追加（無料）↗",
    "recorderFine": "全手順（マイク権限、録音内容など）は{guide}で解説しています。**設定→録音ツール**でも確認できます。",
    "recorderFineLink": "セットアップガイド"
  },
  "overview": {
    "eyebrow": "概要",
    "title": "あなたの予定表",
    "manageConnections": "連携機能の管理",
    "fixInSettings": "設定で修正",
    "summaryAria": "レッスンまとめ",
    "upcoming": "今後のレッスン",
    "drafts": "レビュー待ち",
    "draftsSub": "要約の確認待ち",
    "published": "公開済み要約",
    "publishedSub": "生徒に送信済み",
    "writeUpsLeft": "残り利用可能な要約数",
    "writeUpsAria": "要約残数（追加購入）",
    "usageTrial": "無料分{total}中{used}使用済み",
    "usageBought": "{used}回作成済み · 有効期限なし",
    "lessonCalendar": "レッスンカレンダー",
    "primaryCalendar": "（メイン）"
  },
  "connect": {
    "title": "Googleカレンダー連携",
    "body": "カレンダーを連携することで、Lesson Studioが今後のレッスンの取得、予約、録音に対応します。",
    "notConfigured": "Google OAuthが未設定です。{id}と{secret}を環境変数に追加後、再起動してください。",
    "scopeRead": "**カレンダーを読む** — レッスンと会議リンクの取得",
    "scopeRecord": "**レッスン録音** — Lesson Studio拡張で録音",
    "scopeRecap": "**要約作成** — AIによる要約を生成しレビューへ",
    "continueGoogle": "Googleで続行",
    "fine": "Googleの同意画面が表示されます。連携は設定から管理できます。"
  },
  "settings": {
    "eyebrow": "ワークスペース",
    "title": "設定",
    "recorderTitle": "録音ツール",
    "recorderDesc": "Chrome拡張でレッスンを録音し要約に変換します。{guide}",
    "recorderGuide": "ステップガイド →",
    "replayTourHint": "各ページの使い方がわからなくなった場合は、ここからガイドを再実行できます。",
    "languageTitle": "表示言語",
    "languageDesc": "このワークスペース画面の表示言語です。要約自体の言語は生徒ごとに選べます。",
    "connectionsTitle": "連携",
    "connectionsDesc": "スケジューリング・会議・支払いに使うツールを連携できます。",
    "livesTitle": "レッスン管理方法",
    "livesDesc": "Googleカレンダー管理なら予約や空き時間の管理、自動録音が使えます。別管理なら録音データから運用します。",
    "calendarTitle": "レッスンカレンダー",
    "calendarDesc": "どのカレンダーからLesson Studioがレッスンを読み取るか",
    "primaryCalendar": "メインカレンダー",
    "speakingTitle": "スピーキング演習",
    "speakingDesc": "要約にはスピーキング演習が3問含まれます。生徒が録音し提出できます。無効にすると要約から外れます。",
    "speakingOn": "生徒に録音を許可",
    "speakingOnHint": "提出された録音はレッスンページで確認可能",
    "speakingOff": "演習を外す",
    "speakingOffHint": "要約は筆記7問のみになります",
    "platformTitle": "既定の会議ツール",
    "platformDesc": "新規予約時に作成される会議の種類です。マーケットプレイスで既存リンクを使う場合は一番下を選択。",
    "meetLabel": "Google Meet",
    "meetHint": "カレンダーで作成されます",
    "ownLinkLabel": "自分で会議リンクを共有",
    "ownLinkHint": "Preply・italki・自作会議室など"
  },
  "billing": {
    "leftTitle": "残り要約数",
    "leftDesc": "レッスンごとに1回分消費します。有効期限や自動更新はありません。",
    "ofFree": "無料{total}要約分のうち",
    "ofFreeUsed": "無料{total}要約分中 · {used}使用",
    "builtSoFar": "ここまで{used}回作成済み",
    "emptyTrial": "無料分は使い切りました。下記パック購入で要約を続けられます。定期購読・自動更新はありません。",
    "emptyPaid": "残高がありません。下記パック購入で補充できます。未使用分はそのまま残ります。",
    "addTitle": "要約分の追加購入",
    "addDesc": "一括支払い、更新なし。数が多いほど割安ですが、小さいパックにも割高な設定はありません。買った分は有効期限なく使えます。",
    "lessonsWrittenUp": "要約したレッスン数",
    "save": "{pct}%お得",
    "neverExpires": "有効期限なし",
    "buy": "{n}を購入",
    "paidOnce": "お支払いは1回のみ、Stripeでのクレジットカード決済です。カード情報は保存せず、自動請求もありません。",
    "packTags": [
      "これから始める方向け",
      "安定した予定に",
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
    "tabsAria": "要約の区分",
    "eyebrow": "送信前に確認",
    "title": "{name} · レッスン要約",
    "lessonFallback": "レッスン",
    "sub": "各タブを確認後、{first}に送信してください。",
    "translate": "説明文を翻訳",
    "translateTitle": "生徒の母語で説明文を表示します（教材やスコアはそのまま）",
    "working": "処理中…",
    "rebuild": "録音から再生成",
    "rebuildTitle": "最新のAI・メトリクスで録音から再生成します",
    "rebuilding": "再生成中…",
    "deleteDraft": "下書きを削除",
    "deleting": "削除中…",
    "saveDraft": "下書き保存",
    "approve": "承認して送信",
    "sending": "送信中…",
    "savedTick": "保存済み ✓",
    "confirmRebuild": "この要約を録音データから再生成しますか？まとめ・区分・宿題・流暢さ指標が再作成され、手動編集は破棄されます。",
    "confirmTranslate": "この要約の説明文だけを該当生徒の母語に翻訳しますか？例文・引用・スコアはそのままです。",
    "confirmDelete": "{name}さんの要約下書きを削除しますか？この操作は取り消せません。",
    "promptLanguage": "この生徒にはまだ説明文の言語が設定されていません（生徒ページで設定可能）。どの言語に翻訳しますか？",
    "rebuildFailed": "再生成に失敗しました",
    "translationFailed": "翻訳に失敗しました",
    "deleteFailed": "要約を削除できませんでした",
    "savingEdits": "編集内容を保存中…",
    "uploadingMemo": "音声メモをアップロード中…",
    "uploadingFile": "{name}をアップロード中…",
    "attachingMaterials": "教材を添付中…",
    "attachmentFailed": "要約は送信されましたが、添付ファイルのアップロードに失敗しました。レッスンページから再追加してください。",
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
      "statLessons": "レッスン数",
      "statScore": "平均スコア",
      "statSpeaking": "話した量",
      "lessonsTitle": "あなたのレッスン",
      "progressTitle": "進捗状況",
      "vocabTitle": "語彙",
      "milestoneTitle": "次のマイルストーン",
      "scoresTitle": "最近のスコア",
      "testsTitle": "練習テスト",
      "speakingTitle": "話す習慣",
      "filesTitle": "レッスンファイル",
      "vocabTotalsTitle": "語彙の増加"
    },
    "tabsAria": "ダッシュボードの区分",
    "notLinked": "アカウントが未連携です",
    "askTeacher": "先生にアカウント連携を依頼してください。",
    "climbLed": "聞く側から{em}になりました。",
    "climbLedEm": "会話をリード",
    "climbMore": "始めた時より{em}話しています。",
    "climbMoreEm": "{delta}ポイント増加",
    "climbPlain": "直近のレッスンでは{em}話しました。",
    "youSpoke": "あなたが話したのは",
    "acrossLessons": "{n}回のレッスン合計",
    "acrossOneLesson": "1回のレッスン合計",
    "climbSub": "円弧上の印が開始時点 — {then}。",
    "climbDelta": "初回から{delta}ポイント増加",
    "inLast30": "直近30日で{n}回",
    "totalLessons": "完了したレッスン総数",
    "inAll": "合計{n}回",
    "words": "{n}語",
    "lastN": "最新{n}回",
    "metricPace": "ペース",
    "metricThinking": "考える時間",
    "metricShare": "発話の割合",
    "practiseTitle": "語彙を練習する",
    "practiceHistory": "直近2週間の練習履歴",
    "byKind": "語の種類別",
    "byLesson": "レッスン別",
    "practiseAnything": "どれでも練習",
    "practiseDue": "次に練習すべき語彙",
    "vocabKnown": "習得済み",
    "vocabLearning": "学習中",
    "vocabNew": "未開始",
    "download": "ダウンロード"
  },
  "practice": {
    "emptyTitle": "まだ練習できるものがありません",
    "emptyBody": "レッスン要約が公開されると語彙が表示されます。",
    "howMany": "今日はいくつ？",
    "doneTitle": "完了 — {n}枚",
    "doneOneTitle": "完了 — 1枚",
    "allFirstTime": "すべて初回練習です。数日後に再度出てきます。",
    "someMissed": "{right}枚は初回、{missed}枚は早めに再練習が必要です。",
    "moreLeft": "この山にはあと{n}語残っています。好きなときに練習できます。",
    "oneLeft": "残り1語、この山は好きなときに練習できます。",
    "wholePile": "これが全部です。",
    "nextRound": "あと{n}語",
    "practiseAgain": "もう一度練習",
    "backToPractice": "練習にもどる",
    "tapToSee": "タップで意味を表示",
    "again": "もう一度",
    "knewIt": "わかった",
    "sayOutLoud": "めくる前に声に出してみましょう。"
  },
  "rating": {
    "question": "この内容はレッスンと一致していましたか？",
    "yes": "はい、私のレッスンでした",
    "no": "少し違いました",
    "thanksYes": "一致するとお答えいただきました。ありがとうございます。",
    "thanksNo": "違うとお答えいただきました。ご意見が役立ちます。ありがとうございます。",
    "whatWasOff": "どこが違いましたか？あてはまるものをお選びください。",
    "notePlaceholder": "もしよければどの部分かを書いてください。1文で十分です。",
    "send": "送信",
    "sending": "送信中…",
    "didNotSave": "保存できませんでした。",
    "reasons": [
      "発言していない単語が含まれている",
      "話者が混同されている",
      "スクリプトや言語が違う",
      "自分には簡単/難しすぎる",
      "その他"
    ]
  },
  "recapLanguage": {
    "question": "要約の説明文（表示言語）",
    "hint": "学習中の言語自体は変わりません。ここは周辺の説明文の言語です。",
    "aria": "要約の説明文の言語",
    "saved": "保存済み — 次回の要約より反映されます。",
    "didNotSave": "保存できませんでした。"
  },
  "lesson": {
    "railAria": "レッスン区分",
    "thisLesson": "このレッスン",
    "movements": [
      "話した内容",
      "得意だったこと",
      "直すべきこと",
      "扱った内容",
      "本日の語彙",
      "練習",
      "ファイル・音声"
    ],
    "speakingBalance": "発話バランス",
    "score": "スコア",
    "grammarDensity": "文法密度",
    "corrections": "訂正箇所",
    "homework": "宿題",
    "noHomework": "このレッスンに宿題はありません。",
    "practiceExercises": "練習課題",
    "wordsFromLesson": "このレッスンの語彙",
    "whoTalked": "話者の比率",
    "speakingMeasured": "話した量の記録",
    "yourTeacher": "あなたの先生"
  },
  "join": {
    "setupFailed": "アカウント設定に失敗しました。",
    "acceptFailed": "招待の承認に失敗しました。",
    "joining": "参加中…",
    "joinAs": "{name}として参加",
    "notYou": "ご本人ではありませんか？{signOut}してから再度このリンクを開いてください。",
    "notYouLink": "サインアウト",
    "emailLabel": "メールアドレス",
    "passwordLabel": "パスワードを作成",
    "passwordHint": "8文字以上",
    "settingUp": "設定中…",
    "createAccount": "アカウント作成"
  },
  "speaking": {
    "cta": "回答を録音する",
    "sendFailed": "録音の送信に失敗しました。再試行してください。",
    "recordAgain": "もう一度録音",
    "sendToTeacher": "先生に送信",
    "sending": "送信中…",
    "tryAgain": "再試行",
    "keepSent": "送信済みを保持"
  },
  "exchange": {
    "recording": "録音",
    "download": "ダウンロード",
    "nothingShared": "このレッスンではまだ共有がありません。",
    "noFiles": "まだファイルがありません。プレゼン資料やPDFをアップロードできます。",
    "audioIntro": "この生徒が自主練習として録音した内容です。スピーキング演習の録音は「練習」タブに表示されます。",
    "noAudio": "まだ音声の提出はありません。"
  },
  "charts": {
    "metrics": [
      {
        "label": "スコア",
        "note": "各レッスンが10点満点でどうだったか。"
      },
      {
        "label": "発話割合",
        "note": "話した量の割合。自信がつくほどあなたの比率が上がります。"
      },
      {
        "label": "ペース",
        "note": "話している間の分速単語数。"
      },
      {
        "label": "考える時間",
        "note": "返答までの時間。短いほど言葉がすぐ出ています。"
      },
      {
        "label": "語彙",
        "note": "全レッスンの単語合計。"
      }
    ],
    "nothingYet": "まだ記録がありません。",
    "sinceLesson": "レッスン{n}以降",
    "trendLater": "傾向は次のレッスン後に表示されます。"
  },
  "tests": {
    "saveScoreFailed": "スコア保存に失敗しました。",
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
    "defaultsTitle": "レッスン既定値",
    "defaultsDesc": "レッスンの長さや生徒がどれだけ先まで予約可能かの設定。",
    "lessonName": "レッスン名",
    "lessonNamePlaceholder": "語学レッスン",
    "lessonLength": "レッスン時間（分）",
    "slotInterval": "スロット間隔（分）",
    "minNotice": "最小通知時間（時間）",
    "bufferBefore": "前後の余裕（分）",
    "bufferAfter": "終了後の余裕（分）",
    "maxPerDay": "1日あたり最大レッスン数",
    "bookingWindow": "予約可能期間（日）",
    "title": "空き状況",
    "copyMon": "月曜→平日にコピー",
    "copyMonTitle": "月曜の時間帯を火〜金曜にコピーします",
    "previewBooking": "予約画面をプレビュー ↗",
    "unavailable": "受付不可",
    "dateOverrides": "日付ごとの例外"
  },
  "recordings": {
    "eyebrow": "概要",
    "title": "レッスンと要約",
    "settings": "設定",
    "yourStudents": "あなたの生徒",
    "publishedTitle": "公開済みレッスン",
    "publishedDesc": "生徒が既に見られるもの。新しい順で表示しています。下書きはレビュー待ちにあります。",
    "nothingPublished": "まだ公開されていません",
    "untitled": "タイトル未設定のレッスン",
    "published": "公開済み",
    "draft": "下書き",
    "summaryAria": "レッスンまとめ",
    "students": "生徒",
    "changedMind": "変更しますか？",
    "connectCalendar": "カレンダーを連携"
  },
  "lessonRow": {
    "joinCall": "通話に参加 ↗",
    "viewRecap": "要約を見る",
    "reviewRecap": "要約をレビュー",
    "noLink": "リンクなし",
    "eyebrow": "公開前に確認",
    "recapTitle": "{title} · レッスン要約",
    "closeAria": "要約レビューを閉じる",
    "draftBanner": "AIによる下書きです。生徒に届く前に内容を確認してください。",
    "score": "スコア",
    "studentTalk": "生徒の発話",
    "grammar": "文法",
    "confidence": "自信度",
    "homework": "宿題",
    "memoScript": "音声メモ スクリプト",
    "teacherNote": "先生からのメモ",
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
    "loadFailed": "空き状況の取得に失敗しました。",
    "bookingFailed": "予約に失敗しました。",
    "bookingFailedRetry": "予約に失敗しました — 再試行してください。",
    "eyebrow": "レッスンを予約",
    "title": "都合のいい時間を探す",
    "sub": "日にちを選び、開始時間を指定します。確認メールと会議リンクが届きます。",
    "booked": "予約が確定しました！",
    "invite": "カレンダー招待が{email}に送信されます。",
    "openMeeting": "会議リンクを開く",
    "noCalendar": "空き情報がありません。カレンダー連携されていますか？",
    "noTimes": "今後30日間に空いているレッスン枠はありません。",
    "pickDay": "日付を選択",
    "pickDayHint": "ドットがある日は空きがあります。",
    "yourDetails": "あなたの情報",
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
        "body": "ここが拠点です。要約はここに届き、直近のレッスンも下に並びます。"
      },
      {
        "title": "生徒",
        "body": "生徒ごとに追加できます。各自のレッスン、テスト、進捗管理もここから。全員に専用ポータルが割り当てられます。"
      },
      {
        "title": "ノート",
        "body": "レッスンを教えたらワンクリックで記録できます。カレンダー形式で日誌として使えます。"
      },
      {
        "title": "生徒ビュー",
        "body": "実際の見え方を確認できます。色や名前、区分もカスタマイズ可能。本物ソフトのプレビューです。"
      },
      {
        "title": "支払い",
        "body": "生徒ごとに支払い状況と残回数が見られます。要約の公開と連動して回数が減ります。"
      },
      {
        "title": "設定",
        "body": "カレンダー、録音ツール、アカウント。本ガイドもここから再実行できます。"
      }
    ],
    "skip": "ガイドをスキップ"
  },
  "languages": {
    "couldNotSave": "保存できませんでした",
    "title": "あなたの言語設定",
    "desc": "教える言語、レッスンで使う言語の管理。新規生徒にはここから反映されます。",
    "youTeach": "教える言語",
    "spokenIn": "レッスンで使う言語",
    "fitTitle": "各言語設定の役割",
    "fitDesc": "3つの設定、3つの役割があります。",
    "fitLearning": "**生徒ごとの「学習」言語**が要約やテスト生成の対象となります。日本語・韓国語・スペイン語・アラビア語など{n}言語対応。生徒追加時に設定し、生徒ページで変更可能です。",
    "fitExplained": "**生徒ごとの「説明文」言語**は、要約やテストの設問文等の表示言語です。初期は英語ですが、生徒ページで変更できます。",
    "fitSpoken": "**生徒ごとの「レッスン中の会話」言語**は、録音データ解析時に自動認識される言語です。上記で一度決めれば、以降は都度聞かれません。生徒ページであとから調整可能です。"
  },
  "notes": {
    "pickStudent": "生徒を選択",
    "empty": "ノートは空です",
    "couldNotSave": "ノートの保存に失敗しました",
    "confirmDelete": "このノートを削除しますか？",
    "hoursTaught": "指導時間",
    "recapsPublished": "公開済み要約数",
    "prevMonth": "前の月",
    "nextMonth": "次の月",
    "today": "今日",
    "noStudents": "生徒がいません",
    "student": "生徒",
    "addNote": "ノート追加",
    "newNote": "新しいノート",
    "editNote": "ノートを編集"
  },
  "exercises": {
    "none": "演習はまだありません。下に追加できます。",
    "instruction": "指示文",
    "instructionPlaceholder": "生徒が行う内容",
    "focus": "練習内容",
    "focusPlaceholder": "この文で練習する事項",
    "sentence": "文",
    "meaning": "意味",
    "removeSentence": "この文を削除",
    "removeOption": "選択肢を削除",
    "questionTarget": "設問（ターゲット言語）",
    "question": "設問"
  },
  "payments": {
    "selectStudent": "生徒を選択",
    "amountTooLow": "1以上の金額を入力してください",
    "saveFailed": "保存に失敗しました",
    "thisMonth": "今月",
    "receivedAllTime": "累計受領額",
    "outstanding": "未払い",
    "currency": "通貨",
    "students": "生徒",
    "prevMonth": "前の月",
    "nextMonth": "次の月",
    "today": "今日",
    "noStudents": "生徒がいません",
    "student": "生徒",
    "recent": "最近の支払い",
    "newPayment": "新規支払い",
    "editPayment": "支払いを編集",
    "selectPlaceholder": "選択…",
    "amount": "金額（{symbol}）",
    "status": "ステータス",
    "paid": "支払済み",
    "pending": "未払い",
    "covers": "対象内容",
    "coversPlaceholder": "例：7月パック — 4レッスン分",
    "paymentDate": "支払日",
    "dueDate": "期限日",
    "lessonsCovered": "対象レッスン数",
    "lessonsPlaceholder": "例：4",
    "method": "方法",
    "methodPlaceholder": "銀行振込、現金、PayPalなど",
    "confirmDelete": "この支払い記録を削除しますか？"
  },
  "recapReview": {
    "vocab": "語彙",
    "summary": "まとめ",
    "summaryPlaceholder": "レッスン概要…",
    "sectionTitle": "区分タイトル",
    "sectionContent": "区分内容…",
    "removeSection": "区分を削除",
    "homeworkTask": "宿題内容",
    "noteTitle": "生徒へのメモ",
    "notePlaceholder": "生徒への個別メッセージ…"
  },
  "connectors": {
    "googleName": "Googleカレンダー",
    "googleDesc": "レッスン予定の確認や新規予約を書き込みます。",
    "connect": "連携",
    "permissionNeeded": "権限が必要です",
    "reconnect": "再連携",
    "disconnect": "連携解除",
    "zoomDesc": "予約ごとに専用Zoom会議室を自動作成します。",
    "comingSoon": "近日対応",
    "stripeName": "Stripe",
    "stripeDesc": "レッスンパックのカード支払いを受け取りできます。報酬は直接振込されます。"
  },
  "student": {
    "notJoined": "招待済み — まだ参加していません",
    "avgScore": "平均スコア",
    "latestTalk": "直近の発話",
    "vocabItems": "語彙項目数",
    "creditsLeft": "残{left}回 / {bought}回購入",
    "creditsOneLeft": "残1回 / {bought}回購入",
    "noCredits": "まだレッスンを購入していません",
    "managePayments": "支払い管理 →",
    "lessonsTitle": "レッスンと要約",
    "noLessons": "レッスンがありません",
    "noLessonsSub": "この生徒の録音済みレッスンがここに表示されます。",
    "testsTitle": "練習テスト",
    "noTests": "テストがありません"
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
    "aria": "新しい生徒",
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
    "prev": "前へ",
    "next": "次へ",
    "fixInSettings": "設定で修正",
    "nothingOn": "{day}の予定なし。",
    "noLessonsThatDay": "この日はレッスンが予定されていません。",
    "agendaClear": "予定はありません。",
    "noUpcoming": "今後のレッスンはありません。"
  },
  "forgot": {
    "title": "パスワード再設定",
    "lead": "サインイン中のメールアドレスを入力してください。新しいパスワードの設定リンクをお送りします。",
    "send": "リセットリンク送信",
    "sending": "送信中…",
    "sent": "{email}にアカウントがあれば、リセット用リンクを送信しました。メールを開いて手順に従ってください（1時間で期限切れとなります）。",
    "spam": "届かない場合は迷惑メールフォルダをご確認ください。もしくは、登録時のアドレスで再試行してください。",
    "remembered": "思い出しましたか？",
    "backToSignIn": "サインインに戻る"
  },
  "reset": {
    "tooShort": "新しいパスワードは6文字以上で入力してください。",
    "mismatch": "2つのパスワードが一致しません。再度ご確認ください。",
    "samePassword": "前回と同じパスワードです。別のものにしてください。",
    "saveFailed": "パスワードを保存できませんでした。再試行してください。",
    "title": "新しいパスワードを設定",
    "expired": "リセットリンクの有効期限が切れています。再度リクエストしてください。",
    "noToken": "このページはパスワードリセットメール内のリンクからのみ有効です。リクエストすればメールで送付します。",
    "lead": "アカウント用の新しいパスワードを入力してください。保存されると自動的にサインインされます。",
    "newPassword": "新しいパスワード",
    "repeat": "再入力"
  },
  "classAnalytics": {
    "measures": [
      {
        "label": "平均スコア",
        "sub": "全要約済みレッスンのうち10点満点での平均値"
      },
      {
        "label": "発話シェア",
        "sub": "生徒が会話した割合"
      },
      {
        "label": "話す速さ",
        "sub": "生徒が話していた時の1分あたり単語数。上昇傾向ならスムーズになっています。"
      },
      {
        "label": "考える間",
        "sub": "先生が話し終えてから生徒が話し始めるまで。長い間は努力の証です。"
      },
      {
        "label": "1ターンあたりの単語数",
        "sub": "話し始めるごとの語数。短く早い返事は会話、長い返事は発展的会話に。"
      },
      {
        "label": "フィラー語",
        "sub": "1レッスン当たりの「えーと」「あの」。ペースとセットで見ると、速いがフィラー多い場合と、遅くて無駄がない場合で課題が異なります。"
      }
    ],
    "totalLessons": "レッスン総数",
    "acrossStudents": "{n}生徒分",
    "mostActive": "最も活動的",
    "nLessons": "{n}レッスン",
    "nothingRecorded": "まだ記録がありません",
    "vocabMet": "出会った語彙",
    "wordsAcross": "全レッスンの語数",
    "notSeenLately": "最近進捗なし",
    "everyoneCurrent": "全員進捗中",
    "measureAria": "指標",
    "nothingMeasured": "この項目の記録が未取得です。レッスンが録音されると表示されます。",
    "perStudent": "{measure} － 生徒別",
    "perStudentSub": "生徒ごとのレッスン順序。矢印が初回→最新。",
    "prevMeasure": "前の指標",
    "nextMeasure": "次の指標"
  },
  "test": {
    "heading": "{level}練習テスト",
    "published": "公開済み",
    "draftOnlyYou": "下書き — あなたのみ閲覧可能",
    "basedOn": "元になったレッスン",
    "lessonN": "レッスン{n}",
    "script": "文字種",
    "scriptBeginner": "ひらがな＋ローマ字",
    "scriptHiragana": "ひらがな",
    "scriptKanji": "漢字＋かな",
    "created": "作成日",
    "status": "ステータス",
    "speakingAnswer": "スピーキング回答",
    "unplayable": "録音はありますが再生用サインができませんでした。"
  },
  "trial": {
    "aria": "Lesson Studioへようこそ",
    "kicker": "Lesson Studioへようこそ",
    "title": "最初の{n}回分の要約は無料です。",
    "sub": "録音ツールを使い、レッスンを教えて、要約が自動で届きます。カード登録不要、途中の制約もありません。ご納得いただければプランを選んでください。",
    "showMe": "案内を見る",
    "exploreMyself": "自分で見て回る",
    "setUpFirst": "または録音ツールを先に設定 →"
  },
  "reviewQueue": {
    "title": "レビュー待ち要約",
    "desc": "録音から作成されました。先生が確認・送信するまで生徒には公開されません。",
    "moveFailed": "要約を移動できませんでした",
    "serverUnreachable": "サーバーに接続できませんでした",
    "rebuildFailed": "要約を再生成できませんでした",
    "deleteFailed": "要約を削除できませんでした"
  },
  "recorderMissing": {
    "title": "まず録音ツールを追加してください",
    "body": "Lesson Studioはレッスンから要約を作成しますが、その記録元となるのがChrome拡張です。インストール・サインインが完了するまで録音→要約は届きません。これ以外での登録はできません。"
  },
  "pending": {
    "chooseStudent": "まずどの生徒とのレッスンか選択してください。",
    "fileFailed": "この録音の登録に失敗しました。",
    "confirmDelete": "この録音を削除しますか？音声ファイルも消去されます。",
    "studentAria": "生徒",
    "choosePlaceholder": "生徒を選択",
    "filing": "登録中…",
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
        "sub": "かな（ローマ字なし）"
      },
      {
        "label": "漢字＋かな",
        "sub": "漢字とふりがな"
      }
    ],
    "failed": "自動生成に失敗しました",
    "needLesson": "先にレッスン要約を公開してください",
    "title": "練習テストの自動作成",
    "explanationLanguage": "説明文の言語"
  }
} as const
