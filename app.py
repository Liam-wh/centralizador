"""Centra · Centralizador académico ESAM El Alto."""
import json
import os
from pathlib import Path
from flask import Flask, render_template, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)
with (BASE_DIR / "links.json").open(encoding="utf-8") as source:
    LINKS = json.load(source)
CATEGORIES = ["Académico", "Participantes", "Documentación", "Administración", "Plataformas"]

@app.get("/")
def index():
    return render_template("index.html", links=LINKS, categories=CATEGORIES)

@app.get("/health")
def health():
    return {"status": "ok", "resources": len(LINKS)}

# Vercel sirve public/ desde su CDN; estas rutas permiten lo mismo en local.
@app.get("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(BASE_DIR / "public" / "assets", filename)

@app.get("/vendor/<path:filename>")
def vendor(filename):
    return send_from_directory(BASE_DIR / "public" / "vendor", filename)

@app.after_request
def response_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    return response

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
