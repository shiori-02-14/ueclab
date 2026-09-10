<p align="center">
  <img src="web/assets/logo.png" alt="UEC ラボ" width="420" />
</p>

# UEC ラボ（非公式）

電気通信大学の[公式ラボガイド](https://www.uec.ac.jp/arc/laboguide.html)をもとに、オープンラボやオープンキャンパスで**居室がどこにあるか**探しやすくした**非公式**の研究室ブラウザです。

> [!WARNING]
> このプロジェクトは [しおり🔖](https://shiori-02-14.github.io/Homepage/works.html) が作成・運営しており、**大学の公式なプロジェクトではありません。**
> 電気通信大学は運営・監修・後援していません。情報の正確性や完全性は保証しません。連絡・見学・出願の前に、必ず [公式ラボガイド](https://www.uec.ac.jp/arc/laboguide.html) と各研究室のサイトを確認してください。

This is an **unofficial** lab directory for finding rooms at the University of Electro-Communications (UEC) during open lab / open campus. It is not affiliated with the university. Always verify with the [official lab guide](https://www.uec.ac.jp/arc/laboguide.html).

[公開サイト](https://shiori-02-14.github.io/ueclab/) · [このサイトについて / 利用規約](https://shiori-02-14.github.io/ueclab/about.html)

運営ポリシーと利用規約の構成は [UEC Atlas](https://github.com/uec-atlas/uec-atlas) を参考にしました。UEC Atlas とは無関係の別プロジェクトです。

## できること

- 研究室名・教員・分野・キーワード・号館・出身地の全文検索（`/` で検索欄へ）
- 類・教育プログラム・専攻・研究分野・号館・HP / 動画の有無で絞り込み
- リスト / カード / **号館別**の表示切替（オープンラボ・オープンキャンパス向け）
- 掲載順・名前・号館・出身地・更新日・気になる優先での並び替え
- 詳細パネルから研究室 HP・動画・公式ラボガイド・メールへ
- 「気になる」とメモ（この端末のブラウザにだけ保存。サーバには送りません）

公開データは**名前・キーワード・居室・公式ラボガイドに載っている出身地・公開メール・リンク**と、公式ラボガイドの**写真 URL** までにしています。ラボガイドの本文は載せません。写真ファイルはリポジトリに置かず、公式サイト上の画像を参照します。連絡と研究内容の正本は公式ラボガイドと各研究室のサイトを見てください。

## 動かし方

Python 3.9 以降があれば足ります。追加のパッケージは不要です。

```bash
git clone https://github.com/shiori-02-14/ueclab.git
cd ueclab
python3 scripts/server.py
```

ブラウザが http://127.0.0.1:8765/ を開きます。止めるときは `Ctrl+C` です。このサイトについてのページは http://127.0.0.1:8765/about.html です。

| コマンド | 内容 |
| --- | --- |
| `python3 scripts/server.py` | データを組み立ててローカルサーバを起動し、ブラウザを開く |
| `python3 scripts/server.py --no-open` | 起動だけする |
| `python3 scripts/server.py 8080` | ポートを指定する |
| `python3 scripts/server.py --build` | `web/js/labs-data.js` だけ生成して終了する |
| `python3 scripts/server.py --sanitize` | ソースから本文・メッセージを外して再生成する（写真は公式 URL のみ残す） |

macOS では `ラボガイドを開く.command` でも `web/index.html` を開けますが、`file://` だと環境によってデータが読めません。通常は `python3 scripts/server.py` を使ってください。

## 公開（GitHub Pages）

`web/` を GitHub Pages で配信します。ブランチの `/docs` ではなく、Actions から上げます。リポジトリの **Settings → Pages → Source** は **GitHub Actions** です。`main` へ push すると `.github/workflows/pages.yml` が `web/` を公開します。

URL は https://shiori-02-14.github.io/ueclab/ です。手元で静的確認するときは `python3 scripts/server.py --build` のあと `web/` を配信してください。

## 構成

```
ueclab/
├── data/
│   ├── catalog.csv           # 居室・HP など手元のカタログ（本文は含めない）
│   ├── emails.csv            # 公開されている教員メール
│   └── official-labs.json    # 公式 labs.json の要約（本文なし。写真は公式 URL のみ）
├── scripts/
│   ├── server.py             # データ結合 + ローカル HTTP
│   └── fetch_official.py     # 公式 labs.json の取得（間隔・キャッシュ付き）
├── web/
│   ├── index.html            # 研究室ブラウザ
│   ├── about.html            # このサイトについて / 利用規約
│   ├── css/styles.css
│   ├── js/app.js
│   ├── js/labs-data.js       # 生成物。更新は --build
│   └── assets/               # ロゴ・favicon・OGP
├── TERMS.md                  # 利用規約
├── LICENSE                   # ソフトウェアは MIT
├── LICENSE-DATA.md           # 独自メタデータは CC BY-NC-SA 4.0
└── CONTRIBUTING.md
```

`scripts/server.py` は `data/catalog.csv` と `data/official-labs.json` を突き合わせ、公開メールがあれば `data/emails.csv` から足して `web/js/labs-data.js` を書き出します。件数は公式側とカタログで一致している必要があります。ラボガイドの本文は公開データに含めません。写真は公式サイトの URL だけ残します。

## データの出典

手元のデータは、次の公開情報をもとにしています。大学から提供を受けた内部データではありません。更新は公式ラボガイドを参考に定期的に行います。最新の情報は公式ラボガイドを確認してください。

- [公式ラボガイド](https://www.uec.ac.jp/arc/laboguide.html)
- `https://www.uec.ac.jp/arc/assets/labs.json`（タイトル・キーワード・公開 URL・写真 URL。本文は取り込まない）
- 公開シラバス（居室。出典はカタログの備考）

再配布・改変したデータを使うときも、[利用規約](TERMS.md) と各研究室の権利、大学の利用条件に従ってください。負荷の高いクローリングはしないでください。学内限定の連絡先は公開しません。公開されている教員メールは `data/emails.csv` から掲載します。

データを差し替える手順は次のとおりです。

1. `python3 scripts/fetch_official.py` で公式の `labs.json` を取得する（User-Agent 付き、1 秒空けて `.cache/` にも残す。書き出すのは要約。写真は公式 URL のみ）
2. `data/catalog.csv` を必要なら直す（研究室の件数を公式側と揃える。本文は入れない。写真ファイルも置かない）。公開メールは `data/emails.csv` を直す
3. `python3 scripts/server.py --build` で `web/js/labs-data.js` を再生成する

誤りや掲載取り下げは [Issue](https://github.com/shiori-02-14/ueclab/issues) へ。

## ライセンス

- **ソフトウェア**（`scripts/server.py`、`web/` の HTML / CSS / JS など）は [MIT License](LICENSE) です。
- **独自に付与したメタデータとデータ構造**は [CC BY-NC-SA 4.0](LICENSE-DATA.md) です。電気通信大学の学生・教職員の利用は、規約上は非営利とみなします。
- **研究室の本文・写真・ロゴ・連絡先など**は、各権利者および電気通信大学に帰属します。MIT / CC の対象外です。本プロジェクトはそれらを再許諾しません。写真は公式ラボガイドの URL を参照するだけで、ファイル自体はリポジトリに含めません。

利用時の禁止事項と免責は [TERMS.md](TERMS.md) を見てください。

Issue と Pull Request の送り方は [CONTRIBUTING.md](CONTRIBUTING.md) を見てください。

作成・運営: [しおり🔖](https://shiori-02-14.github.io/Homepage/works.html)。
