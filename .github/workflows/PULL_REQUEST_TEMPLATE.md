# 概要 / Overview
<!--
  Pull Requestについての概要
  エンジニア以外の職種の人が読んでも理解できるよう、機能仕様をメインに書く
  家電の説明書のように、使い方やユースケース、変更内容を説明する
  電気回路の設計のような、エンジニア以外に伝わらない技術的なことは書かない

  Overview of Pull Requests
  Write mainly functional specifications so that non-engineers can read and understand them.
  Explain usage, use cases, and changes, like an instruction manual for a household appliance.
  Do not write about technical matters that cannot be understood by non-engineers, such as the design of electrical circuits.
-->



<!-- ## Issue (Jira) -->
<!--
  Jiraのリンクを貼る
  リンクを複数列挙するときは、PRを複数に分割することを検討する
  複数の機能実装をまとめてレビューすると、レビューの精度が落ちたり、時間がかかる可能性がある

  Link to jira.
  When enumerating more than one link, consider splitting the PR into several.
  This may reduce the accuracy of the review and may take more time.
-->



# Screenshot
<!--
  画面の新規実装や改修があった場合は、スクリーンショットや動画を貼る
  If there are any new screen implementations or modifications, post a screenshot or video.
-->

| before | after |
| --- | --- |
|  |  |



# 技術的な変更点 / Technical changes
<!--
  実装した内容について、具体的な変更点を書く
  内容は技術仕様をメインとし、同僚のエンジニアに引き継ぎをする気持ちで書く

  Write about the specific changes you have made to your implementation.
  The content should be mainly technical specifications, written with the feeling of handing over to your fellow engineers.
-->



# 機能テスト / Feature test
<!--
  実装した機能について、テストをした内容を書く
  レビュアーが実際にテストできるように一文で書く
  Unit testやStorybookなど、コードレベルで動作保証したものについてはここに書かなくても良い

  テスト観点
  - ユースケースシナリオに則った動作確認
    - ex) XXXという操作をしたら、画面がXXXという状態になる
  - 状態遷移テスト
      - ex) ログイン時、XXXが表示される
      - ex) 未ログイン時、XXXが表示される
      - ex) データが0件のとき、XXXが表示される
      - ex) ネットワークエラーのき、XXXが表示される

  Write a description of the functionality you have implemented and tested.
  Write it in one sentence so that reviewers can actually test it.
  Do not have to include a description of any code-level assurances, such as unit tests or storybooks.

  - Confirm the behavior in accordance with the use case scenario
    - ex) If XXX is done, XXX will happen.
  - State transition test
    - ex) When logging in, XXX is displayed.
    - ex) When not logged in, XXX is displayed
    - ex) XXX is displayed when there is no data
    - ex) XXX is displayed when there is a network error.
-->



# その他 / Others
<!--
  レビュワーへの申し送り、重点的に見てほしいところ、などあれば書く

  Write down any remarks to reviewers, areas you would like them to focus on, etc.
-->


