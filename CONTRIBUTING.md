# 貢献ガイド

Issue と Pull Request を歓迎します。このプロジェクトは [しおり🔖](https://shiori-02-14.github.io/Homepage/works.html) が作成しています。電気通信大学の公式プロジェクトではないので、大学を代表する表現は入れないでください。

ソースコードは MIT、独自メタデータは CC BY-NC-SA 4.0 です。貢献するときは、このライセンスに同意したものとします。詳細は [TERMS.md](TERMS.md) と [このサイトについて](https://shiori-02-14.github.io/ueclab/about.html) を見てください。

運営の考え方は [UEC Atlas](https://github.com/uec-atlas/uec-atlas) を参考にしました。UEC Atlas とは無関係の別プロジェクトです。

## 貢献の方法

### Issue

バグや掲載の誤りは Issue で報告してください。データの取り下げはテンプレート「データの修正・取り下げ」を使ってください。

### Pull Request

変更内容を短く書き、関連 Issue があればリンクしてください。データの追加・修正では**出典 URL** を PR に書いてください。既存の研究室 ID は、必要なとき以外は変えないでください。

画面を変えたら、一覧・検索・絞り込み・詳細・気になる・狭い画面のうち触ったものを確認してください。規約ページを触ったら、トップからのリンクも確認してください。

1. 公式サイトに見える見た目・文言になっていないか確認する
2. 大きなリファクタと機能追加は、できるだけ別 PR にする

## 開発

依存パッケージはありません。Python 3.9 以降があれば動きます。

```bash
python3 scripts/server.py --no-open
```

ブラウザで http://127.0.0.1:8765/ を開いて確認してください。`web/index.html` を直接開くと、CSS やデータが読めないことがあります。About は http://127.0.0.1:8765/about.html です。

## 方針

- **非公式**であることは、注意書き・About・README から外さない
- 公式ラボガイドより新しい・正確だと受け取られる書き方はしない
- 研究室の本文は追加しない。公開シラバス等に載っているメールは `data/emails.csv` に追加してよい。学内限定の連絡先や未公開の個人情報は追加しない。写真は公式 `labs.json` の `image_path`（`https://www.uec.ac.jp/arc/images/`）だけを使い、画像ファイルはリポジトリに置かない
- 大学サイトから取るときは間隔を空け、User-Agent を付け、手元の `.cache/` を使う（`scripts/fetch_official.py`）
- 秘密情報（`.env` や個人のメモ）はコミットしない
- 気になる研究室とメモはブラウザの `localStorage` にだけ保存する（サーバへ送らない）
- ソフトウェアは MIT、独自メタデータは CC BY-NC-SA 4.0。元データの著作権は公開元に残す

## データの更新

掲載データは公式ラボガイドを参考に定期的に更新します。手元で差し替えるときは次のとおりです。

```bash
python3 scripts/fetch_official.py
python3 scripts/server.py --build
```

`data/catalog.csv` の件数は公式の `labs.json` と揃えてください。`web/js/labs-data.js` は生成ファイルです。データ側を直したら必ず再生成してください。
