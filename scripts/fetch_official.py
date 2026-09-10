#!/usr/bin/env python3
"""公式ラボガイドの labs.json を、間隔とキャッシュを付けて手元へ置く。"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server import slim_official_lab  # noqa: E402

CACHE = ROOT / ".cache"
DEST = ROOT / "data" / "official-labs.json"
URL = "https://www.uec.ac.jp/arc/assets/labs.json"
UA = "UEC-Lab/1.0 (+https://github.com/shiori-02-14/ueclab)"
WAIT_SEC = 1.0


def main() -> None:
    CACHE.mkdir(exist_ok=True)
    cached = CACHE / "labs.json"
    DEST.parent.mkdir(exist_ok=True)

    if "--from-cache" in sys.argv and cached.exists():
        payload = json.loads(cached.read_text(encoding="utf-8"))
    else:
        time.sleep(WAIT_SEC)
        req = urllib.request.Request(URL, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                raw = res.read()
        except urllib.error.URLError as exc:
            sys.exit(f"取得できませんでした: {exc}")
        cached.write_bytes(raw)
        payload = json.loads(raw.decode("utf-8"))

    labs = payload.get("labs") if isinstance(payload, dict) else None
    if not isinstance(labs, list):
        sys.exit("labs.json の形が想定と違います")

    slim = {
        "source": URL,
        "note": "本文・写真URL・メッセージ等は含めていません。正本は公式ラボガイドを見てください。",
        "labs": [slim_official_lab(lab) for lab in labs],
    }
    DEST.write_text(json.dumps(slim, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"書き出しました: {DEST}（{len(labs)} 件、要約のみ）")
    print("続けて python3 server.py --build を実行してください。")


if __name__ == "__main__":
    main()
