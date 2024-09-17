# bar-app
ChatGPTと作るモバイルオーダーアプリ

# dir構成について

'''
bar-app/
│
├── src/
│   └── firebase/    # ユーティリティ関数
│   ├── components/  # UI コンポーネント
│   ├── hooks/       # カスタムフック
│   ├── pages/       # 各ページ (ログイン、メインメニュー、管理者ダッシュボード等)
│   ├── services/    # Firebaseなどの外部サービス連携
│   ├── styles/      # 共通スタイル
│   ├── types/       # 型定義
│   └── utils/       # ユーティリティ関数
├── public/          # 公開ファイル
└── firebase.json    # Firebaseの設定ファイル
'''