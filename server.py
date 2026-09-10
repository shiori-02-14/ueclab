#!/usr/bin/env python3
"""UEC ラボ — index.html を直接開けます。データ更新: python3 server.py --build"""

from __future__ import annotations

import csv
import json
import re
import sys
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
DATA = ROOT / "data"
CATALOG = ROOT / "catalog.csv"
OFFICIAL = DATA / "official-labs.json"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8765
# 公開してよい備考キー。本文・写真・メッセージなど転載リスクのある項目は載せない
BIKO_KEEP = {
    "専攻",
    "ラボガイド番号",
    "ラボガイド更新",
    "出典",
    "居室出典",
    "出張講義",
    "VideoUEC",
    "夢ナビ",
    "追加URL",
}

NUM_PREFIX = re.compile(r"^\d+\.")
BUILDING_RE = re.compile(r"[東西]\d+号館")
# UEC Atlas の people 正規化に合わせた異体字
KANJI_VARIANT = str.maketrans({
    "廣": "広",
    "髙": "高",
    "邉": "辺",
    "邊": "辺",
    "﨑": "崎",
    "𠮷": "吉",
    "萓": "萱",
    "兒": "児",
})


def strip_num(value: str) -> str:
    return NUM_PREFIX.sub("", (value or "").strip())


def clean_field(value: str) -> str:
    text = strip_num(value)
    if text.endswith("分野"):
        text = text[:-2]
    return text.strip()


def norm_name(value: str) -> str:
    text = re.sub(r"[\s　]+", " ", (value or "").strip())
    return text.translate(KANJI_VARIANT)


def parse_biko(raw: str) -> dict[str, str]:
    parsed: dict[str, str] = {}
    for part in (raw or "").split(" ｜ "):
        part = part.strip()
        if not part:
            continue
        if ": " in part:
            key, val = part.split(": ", 1)
        elif ":" in part:
            key, val = part.split(":", 1)
        else:
            parsed.setdefault("_flags", "")
            parsed["_flags"] = (parsed["_flags"] + "｜" + part).strip("｜")
            continue
        parsed[key.strip()] = val.strip()
    return parsed


def slim_catalog_biko(raw: str) -> str:
    kept: list[str] = []
    for part in (raw or "").split(" ｜ "):
        part = part.strip()
        if not part:
            continue
        if ": " in part:
            key, val = part.split(": ", 1)
        elif ":" in part:
            key, val = part.split(":", 1)
        else:
            kept.append(part)
            continue
        if key.strip() in BIKO_KEEP:
            kept.append(f"{key.strip()}: {val.strip()}")
    return " ｜ ".join(kept)


def slim_official_lab(src: dict) -> dict:
    """公式 labs.json から、公開してよい識別情報とリンクだけ残す。"""
    return {
        "order": src.get("order"),
        "guidebook_name": src.get("guidebook_name") or "",
        "name": src.get("name") or "",
        "updatedAt": src.get("updatedAt") or "",
        "group": src.get("group") or "",
        "program": src.get("program") or "",
        "major": src.get("major") or [],
        "title": src.get("title") or "",
        "keywords": src.get("keywords") or [],
        "fields": src.get("fields") or [],
        "url": [u for u in (src.get("url") or []) if u],
        "visiting_url": [u for u in (src.get("visiting_url") or []) if u],
        "yumenabi": [u for u in (src.get("yumenabi") or []) if u],
        "videouec": [u for u in (src.get("videouec") or []) if u],
    }


def split_urls(raw: str) -> list[str]:
    if not raw:
        return []
    parts = re.split(r"[／\s]+", raw)
    return [p for p in parts if p.startswith("http")]


def buildings_of(room: str) -> list[str]:
    found = BUILDING_RE.findall(room or "")
    return list(dict.fromkeys(found))


def load_labs() -> list[dict]:
    official = json.loads(OFFICIAL.read_text(encoding="utf-8"))["labs"]
    with CATALOG.open(encoding="utf-8-sig", newline="") as fh:
        catalog = list(csv.DictReader(fh))
    if len(official) != len(catalog):
        raise RuntimeError(f"件数不一致: labs.json={len(official)} catalog={len(catalog)}")

    labs = []
    for src, row in zip(official, catalog):
        src = slim_official_lab(src)
        biko = parse_biko(slim_catalog_biko(row.get("備考") or ""))
        urls = [u for u in (src.get("url") or []) if u]
        hp = (row.get("公式HP") or "").strip()
        if hp and hp not in urls:
            urls.append(hp)
        extra = split_urls(biko.get("追加URL", ""))
        room = (row.get("号館・部屋") or "").strip()
        majors = [strip_num(m) for m in (src.get("major") or [])]
        labs.append({
            "id": int(row["ID"]),
            "order": src.get("order"),
            "name": norm_name(row["研究室名"] or src.get("name") or ""),
            "faculty": norm_name(row.get("所属教員") or ""),
            "group": row.get("学部") or src.get("group") or "",
            "program": row.get("学科") or strip_num(src.get("program") or ""),
            "majors": majors,
            "guidebook": src.get("guidebook_name") or biko.get("ラボガイド番号") or "",
            "updatedAt": (src.get("updatedAt") or "")[:10],
            "title": src.get("title") or "",
            "keywords": src.get("keywords") or [],
            "fields": [clean_field(f) for f in (src.get("fields") or [])],
            "campus": (row.get("主キャンパス") or "").strip(),
            "room": room,
            "buildings": buildings_of(room),
            "urls": urls,
            "extraUrls": extra,
            "visitingUrls": src.get("visiting_url") or [],
            "yumenabi": src.get("yumenabi") or [],
            "videos": src.get("videouec") or [],
            "roomSource": biko.get("居室出典") or "",
        })

    by_faculty: dict[str, list[int]] = {}
    for lab in labs:
        by_faculty.setdefault(lab["faculty"], []).append(lab["id"])
    for lab in labs:
        others = [i for i in by_faculty.get(lab["faculty"], []) if i != lab["id"]]
        lab["alsoIds"] = others
    return labs


def rewrite_public_sources() -> None:
    """手元のソースから本文・写真URL・メッセージを外す。"""
    payload = json.loads(OFFICIAL.read_text(encoding="utf-8"))
    labs = payload.get("labs")
    if not isinstance(labs, list):
        raise RuntimeError("official-labs.json の形が想定と違います")
    slim = {
        "source": payload.get("source") or "https://www.uec.ac.jp/arc/assets/labs.json",
        "note": "本文・写真URL・メッセージ等は含めていません。正本は公式ラボガイドを見てください。",
        "labs": [slim_official_lab(lab) for lab in labs],
    }
    OFFICIAL.write_text(json.dumps(slim, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with CATALOG.open(encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        fieldnames = reader.fieldnames
        if not fieldnames:
            raise RuntimeError("catalog.csv にヘッダがありません")
        rows = list(reader)
    for row in rows:
        row["備考"] = slim_catalog_biko(row.get("備考") or "")
    with CATALOG.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_labs_js(labs: list[dict] | None = None) -> Path:
    payload = json.dumps({"labs": labs if labs is not None else load_labs()}, ensure_ascii=False)
    dest = WEB / "labs-data.js"
    dest.write_text(
        "/* 自動生成。更新: python3 server.py --build\n"
        " * 公開データは識別情報・キーワード・リンクのみ。本文・写真・メールは含めない。 */\n"
        f"window.__LABS_DATA__ = {payload};\n",
        encoding="utf-8",
    )
    return dest


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, payload, code: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._send(code, body, "application/json; charset=utf-8")

    def send_error(self, code: int, message=None, explain=None) -> None:
        if code == 404:
            page = WEB / "404.html"
            if page.exists():
                self._send(404, page.read_bytes(), "text/html; charset=utf-8")
                return
        super().send_error(code, message, explain)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        if path in ("/", "/index.html"):
            html = (WEB / "index.html").read_bytes()
            self._send(200, html, "text/html; charset=utf-8")
            return
        if path == "/api/data":
            try:
                self._send_json({"labs": load_labs()})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)
            return
        super().do_GET()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def main() -> None:
    if not CATALOG.exists():
        sys.exit(f"catalog.csv が見つかりません: {CATALOG}")
    if not OFFICIAL.exists():
        sys.exit(f"公式データが見つかりません: {OFFICIAL}")
    if "--sanitize" in sys.argv:
        rewrite_public_sources()
        print("ソースを公開向けに整えました（本文・写真URL・メッセージを除外）", flush=True)
    dest = write_labs_js()
    if "--build" in sys.argv or "--sanitize" in sys.argv:
        print(f"書き出しました: {dest}", flush=True)
        return
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}"
    print(f"UEC ラボ: {url}", flush=True)
    print("停止: Ctrl+C", flush=True)
    if "--no-open" not in sys.argv:
        webbrowser.open(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n停止しました")
        httpd.server_close()


if __name__ == "__main__":
    main()
