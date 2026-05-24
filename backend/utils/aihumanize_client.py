import os

import requests

API_URL = os.environ.get("AIHUMANIZE_API_URL", "https://aihumanize.io/api/humanize")
API_KEY = os.environ.get("AIHUMANIZE_API_KEY", "")


def humanize_text(text: str, mode: str = "standard") -> str:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"text": text, "mode": mode}
    resp = requests.post(API_URL, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    return data.get("result") or data.get("output") or data.get("text", "")

