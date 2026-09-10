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
EMAILS = ROOT / "emails.csv"
OFFICIAL = DATA / "official-labs.json"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8765

NUM_PREFIX = re.compile(r"^\d+\.")
BUILDING_RE = re.compile(r"[東西]\d+号館")


def strip_num(value: str) -> str:
    return NUM_PREFIX.sub("", (value or "").strip())


def clean_field(value: str) -> str:
    text = strip_num(value)
    if text.endswith("分野"):
        text = text[:-2]
    return text.strip()


def norm_name(value: str) -> str:
    return re.sub(r"[\s　]+", " ", (value or "").strip())


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


def split_urls(raw: str) -> list[str]:
    if not raw:
        return []
    parts = re.split(r"[／\s]+", raw)
    return [p for p in parts if p.startswith("http")]


def buildings_of(room: str) -> list[str]:
    found = BUILDING_RE.findall(room or "")
    return list(dict.fromkeys(found))


def load_emails() -> dict[tuple[str, str], dict]:
    if not EMAILS.exists():
        return {}
    out: dict[tuple[str, str], dict] = {}
    with EMAILS.open(encoding="utf-8-sig", newline="") as fh:
        for row in csv.DictReader(fh):
            name = norm_name(row.get("研究室名") or "")
            program = (row.get("学科") or "").strip()
            email = (row.get("メールアドレス") or "").strip()
            if not (name and email):
                continue
            out[(name, program)] = {
                "email": email,
                "emailSource": (row.get("出典URL") or "").strip(),
            }
    return out


def load_labs() -> list[dict]:
    official = json.loads(OFFICIAL.read_text(encoding="utf-8"))["labs"]
    emails = load_emails()
    emails_by_name = {}
    for (name, _program), info in emails.items():
        emails_by_name.setdefault(name, info)
    with CATALOG.open(encoding="utf-8-sig", newline="") as fh:
        catalog = list(csv.DictReader(fh))
    if len(official) != len(catalog):
        raise RuntimeError(f"件数不一致: labs.json={len(official)} catalog={len(catalog)}")

    labs = []
    for src, row in zip(official, catalog):
        biko = parse_biko(row.get("備考") or "")
        urls = [u for u in (src.get("url") or []) if u]
        hp = (row.get("公式HP") or "").strip()
        if hp and hp not in urls:
            urls.append(hp)
        extra = split_urls(biko.get("追加URL", ""))
        room = (row.get("号館・部屋") or "").strip()
        majors = [strip_num(m) for m in (src.get("major") or [])]
        lab = {
            "id": int(row["ID"]),
            "order": src.get("order"),
            "name": norm_name(row["研究室名"] or src.get("name") or ""),
            "faculty": (row.get("所属教員") or "").strip(),
            "group": row.get("学部") or src.get("group") or "",
            "program": row.get("学科") or strip_num(src.get("program") or ""),
            "majors": majors,
            "guidebook": src.get("guidebook_name") or biko.get("ラボガイド番号") or "",
            "updatedAt": (src.get("updatedAt") or "")[:10],
            "title": src.get("title") or "",
            "description": src.get("description") or "",
            "keywords": src.get("keywords") or [],
            "fields": [clean_field(f) for f in (src.get("fields") or [])],
            "campus": (row.get("主キャンパス") or "").strip(),
            "room": room,
            "buildings": buildings_of(room),
            "urls": urls,
            "extraUrls": extra,
            "image": src.get("image_path") or "",
            "message": src.get("message") or "",
            "birthplace": [strip_num(x) for x in (src.get("birthplace") or [])],
            "hobbies": src.get("hobbies") or [],
            "visiting": src.get("visiting") or "",
            "visitingUrls": src.get("visiting_url") or [],
            "yumenabi": src.get("yumenabi") or [],
            "videos": src.get("videouec") or [],
            "strength": src.get("strength") or "",
            "trouble": src.get("trouble") or "",
            "resolution": src.get("resolution") or "",
            "roomSource": biko.get("居室出典") or "",
            "reviewStatus": (row.get("口コミステータス") or "").strip(),
            "email": "",
            "emailSource": "",
        }
        mail = emails.get((lab["name"], lab["program"])) or emails_by_name.get(lab["name"])
        if mail:
            lab["email"] = mail["email"]
            lab["emailSource"] = mail["emailSource"]
        labs.append(lab)

    by_faculty: dict[str, list[int]] = {}
    for lab in labs:
        by_faculty.setdefault(lab["faculty"], []).append(lab["id"])
    for lab in labs:
        others = [i for i in by_faculty.get(lab["faculty"], []) if i != lab["id"]]
        lab["alsoIds"] = others
    return labs


def write_labs_js(labs: list[dict] | None = None) -> Path:
    payload = json.dumps({"labs": labs if labs is not None else load_labs()}, ensure_ascii=False)
    dest = WEB / "labs-data.js"
    dest.write_text(
        "/* 自動生成。更新: python3 server.py --build */\n"
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
    dest = write_labs_js()
    if "--build" in sys.argv:
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
