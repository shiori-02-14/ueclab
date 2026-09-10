<p align="center">
  <img src="web/logo.png" alt="UEC ラボ" width="420" />
</p>

# UEC ラボ（非公式）

電気通信大学の[公式ラボガイド](https://www.uec.ac.jp/arc/laboguide.html)を、配属先探し向けに検索しやすくした**非公式**の研究室ブラウザです。

> [!WARNING]
> このプロジェクトは [しおり](https://shiori-02-14.github.io/Homepage/works.html) が作成・運営しており、**大学の公式なプロジェクトではありません。**
> 電気通信大学は運営・監修・後援していません。情報の正確性や完全性は保証しません。連絡・見学・出願の前に、必ず [公式ラボガイド](https://www.uec.ac.jp/arc/laboguide.html) と各研究室のサイトを確認してください。

This is an **unofficial** lab directory for the University of Electro-Communications (UEC). It is not affiliated with the university. Always verify with the [official lab guide](https://www.uec.ac.jp/arc/laboguide.html).

公開サイト（GitHub Pages を有効にしたあと）: https://shiori-02-14.github.io/ueclab/

[このサイトについて / 利用規約](web/about.html) · [TERMS.md](TERMS.md)

運営ポリシーと利用規約の構成は、同じ大学コミュニティの [UEC Atlas](https://github.com/uec-atlas/uec-atlas) を参考にしています。

## できること

- 研究室名・教員・分野・キーワード・号館の全文検索（`/` で検索欄へ）
- 類・教育プログラム・専攻・研究分野・号館・HP / 動画の有無で絞り込み
- リスト / カード / 号館別の表示切替
- 掲載順・名前・号館・更新日・気になる優先での並び替え
- 詳細パネルから研究室 HP・動画・公式ラボガイドへ
- 「気になる」とメモ（この端末のブラウザにだけ保存。サーバには送りません）

公開データは**名前・キーワード・居室・リンク**までにしています。ラボガイドの本文、教員の顔写真、メールアドレスは載せません。連絡と研究内容の正本は公式ラボガイドと各研究室のサイトを見てください。

## 動かし方

Python 3.9 以降があれば足ります。追加のパッケージは不要です。

```bash
git clone https://github.com/shiori-02-14/ueclab.git
cd ueclab
python3 server.py
```

ブラウザが http://127.0.0.1:8765/ を開きます。止めるときは `Ctrl+C` です。このサイトについてのページは http://127.0.0.1:8765/about.html です。

| コマンド | 内容 |
| --- | --- |
| `python3 server.py` | データを組み立ててローカルサーバを起動し、ブラウザを開く |
| `python3 server.py --no-open` | 起動だけする |
| `python3 server.py 8080` | ポートを指定する |
| `python3 server.py --build` | `web/labs-data.js` だけ生成して終了する |
| `python3 server.py --sanitize` | ソースから本文・写真 URL・メッセージを外して再生成する |

macOS では `ラボガイドを開く.command` でも `web/index.html` を開けますが、`file://` だと環境によってデータが読めません。通常は `python3 server.py` を使ってください。

## 公開（GitHub Pages）

`web/` を GitHub Pages で配信します。ブランチの `/docs` ではなく、Actions から上げます。

1. GitHub のリポジトリで **Settings → Pages → Source** を **GitHub Actions** にする
2. `main` へ push する（ワークフロー `.github/workflows/pages.yml` が `web/` を公開する）

URL は `https://shiori-02-14.github.io/ueclab/` になります。手元で静的確認するときは `python3 server.py --build` のあと `web/` を配信してください。

## 構成

```
ueclab/
├── server.py                 # データ結合 + ローカル HTTP
├── scripts/fetch_official.py # 公式 labs.json の取得（間隔・キャッシュ付き）
├── catalog.csv               # 居室・HP など手元のカタログ（本文・写真は含めない）
├── data/official-labs.json   # 公式 labs.json の要約コピー（本文・写真なし）
├── web/
│   ├── index.html            # 研究室ブラウザ
│   ├── about.html            # このサイトについて / 利用規約
│   ├── logo.png
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── robots.txt
│   ├── app.js
│   └── labs-data.js          # 生成物。更新は --build
├── TERMS.md                  # 利用規約
├── LICENSE                   # ソフトウェアは MIT
├── LICENSE-DATA.md           # 独自メタデータは CC BY-NC-SA 4.0
└── CONTRIBUTING.md
```

`server.py` は `catalog.csv` と `data/official-labs.json` を突き合わせ、`web/labs-data.js` を書き出します。件数は一致している必要があります。ラボガイドの本文・顔写真・メールは公開データに含めません。

## データの出典

手元のデータは、次の公開情報を 2026-09-10 時点で集めたものです。大学から提供を受けた内部データではありません。

- [公式ラボガイド](https://www.uec.ac.jp/arc/laboguide.html)
- `https://www.uec.ac.jp/arc/assets/labs.json`（タイトル・キーワード・公開 URL など。本文と写真は取り込まない）
- 公開シラバス（居室。出典 URL はカタログの備考）

再配布・改変したデータを使うときも、[利用規約](TERMS.md) と各研究室の権利、大学の利用条件に従ってください。負荷の高いクローリングはしないでください。メールアドレスの一覧は公開しません。手元に `emails.csv` があっても git の対象外です。

データを差し替える手順は次のとおりです。

1. `python3 scripts/fetch_official.py` で公式の `labs.json` を取得する（User-Agent 付き、1 秒空けて `.cache/` にも残す。書き出すのは要約のみ）
2. `catalog.csv` を必要なら直す（研究室の件数を公式側と揃える。本文・写真 URL は入れない）
3. `python3 server.py --build` で `web/labs-data.js` を再生成する

誤りや掲載取り下げは [Issue](https://github.com/shiori-02-14/ueclab/issues) へ。

## ライセンス

- **ソフトウェア**（`server.py`、`web/` の HTML / CSS / JS など）は [MIT License](LICENSE) です。
- **独自に付与したメタデータとデータ構造**は [CC BY-NC-SA 4.0](LICENSE-DATA.md) です。電気通信大学の学生・教職員の利用は、規約上は非営利とみなします。
- **研究室の本文・写真・ロゴ・連絡先など**は、各権利者および電気通信大学に帰属します。MIT / CC の対象外です。本プロジェクトはそれらを再許諾せず、公開データにも含めません。

利用時の禁止事項と免責は [TERMS.md](TERMS.md) を見てください。

Issue と Pull Request の送り方は [CONTRIBUTING.md](CONTRIBUTING.md) を見てください。

作成・運営: [しおり](https://shiori-02-14.github.io/Homepage/works.html)。関連プロジェクト: 大学データを Linked Open Data として公開している [UEC Atlas](https://github.com/uec-atlas/uec-atlas)。
