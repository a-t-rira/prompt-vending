（↓ここから下をCodexにそのまま貼る）

このリポジトリに「プロンプト自販機」という静的Webアプリを作ってください。仕様は SPEC.md、プロンプトのデータは prompts.json にあります。必ず両方を最初に読んでから作業してください。

守ってほしいこと：
- HTML / CSS / JavaScript だけで作る。ビルドツールやフレームワークは使わない。外部ライブラリは紙吹雪用の canvas-confetti（CDN）のみ可
- GitHub Pages でそのまま公開できる構成にする（index.html がルート）。独自ドメイン vending.chipshokai.com を使うので、ルートに CNAME ファイル（中身は vending.chipshokai.com の1行）を置く
- フッターと結果画面に、チップ商会の公式サイト（https://chipshokai.com）、X（https://x.com/chip_shokai）、note（https://note.com/chip_shokai）へのリンクを必ず入れる
- 画像は assets/machine.png、assets/clerk.png、assets/can.png を使う。画像がまだない場合でも、仮の図形で動くようにしておく
- prompts.json は fetch で読み込む。プロンプトの文章は書き換えない
- アニメーションはこのアプリの一番の売りなので、SPEC.md の「2-2 購入演出」「2-3 当たり演出」を省略せず全部実装する
- スマホ縦画面を最優先にする
- prefers-reduced-motion への対応を入れる
- シェア画面（SPEC.md の 2-5）は X・LINE・Facebook・Threads・その他（navigator.share）・URLコピーを実装する。各SNSのシェア用URLは最新の公式仕様で確認してから使う
- 当たり確率は app.js の先頭に定数（RARE_RATE = 0.1）で置く

作業の進め方：
1. まず実装方針と、ファイルごとの役割を短く説明してから書き始める
2. 完成したら、ローカルで確認する方法と、仕様どおりにできていない箇所があればそれを報告する
