import json
import os
import time
import urllib.parse
from pathlib import Path

import psycopg2
import psycopg2.extras
import stripe
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

load_dotenv()

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "")
PORT = int(os.environ.get("PORT", "5183"))
DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"

stripe.api_key = STRIPE_SECRET_KEY

BASE_DIR = Path(__file__).resolve().parent
SITE_DIR = BASE_DIR.parent

app = Flask(__name__, static_folder=None)
CORS(app)


def favicon_for(host):
    return f"https://www.google.com/s2/favicons?sz=64&domain={urllib.parse.quote(host)}"


def slug(url):
    try:
        parsed = urllib.parse.urlparse(url if url.startswith("http") else "https://" + url)
        host = parsed.netloc or parsed.path
        return host[4:] if host.startswith("www.") else host
    except Exception:
        return url.lstrip("@")


SEED_LISTINGS = [
    {"url": "https://prufrockcoffee.com", "title": "Prufrock Coffee", "desc": "Wanted for: turning Leather Lane into a laptop-bag queue every single morning.", "category": "Clerkenwell & Farringdon", "amount": 5, "clicks": 18230, "hoursAgo": 40},
    {"url": "https://kaffeine.co.uk", "title": "Kaffeine", "desc": "Wanted for: flat whites so smooth they should be illegal on Great Titchfield Street.", "category": "Soho & Fitzrovia", "amount": 5, "clicks": 9120, "hoursAgo": 60},
    {"url": "https://climpsonandsons.com", "title": "Climpson & Sons", "desc": "Wanted for: roasting so good it starts a stampede at Broadway Market.", "category": "Shoreditch & Hackney", "amount": 5, "clicks": 14310, "hoursAgo": 20},
    {"url": "https://monmouthcoffee.co.uk", "title": "Monmouth Coffee", "desc": "Wanted for: causing a Saturday-morning pile-up outside Borough Market.", "category": "Borough & South Bank", "amount": 6, "clicks": 5230, "hoursAgo": 80},
    {"url": "https://notescoffee.com", "title": "Notes Coffee Roasters", "desc": "Wanted for: making a basement off Trafalgar feel like a proper hideout.", "category": "Covent Garden & Holborn", "amount": 5, "clicks": 7010, "hoursAgo": 30},
    {"url": "https://farmgirluk.com", "title": "Farm Girl", "desc": "Wanted for: acai bowls that out-influence the influencers.", "category": "Notting Hill & Chelsea", "amount": 5, "clicks": 3110, "hoursAgo": 12},
    {"url": "https://departmentofcoffee.com", "title": "Department of Coffee and Social Affairs", "desc": "Wanted for: opening a new branch every time you turn around.", "category": "Camden & Kentish Town", "amount": 5, "clicks": 2870, "hoursAgo": 5},
    {"url": "https://federationcoffee.com", "title": "Federation Coffee", "desc": "Wanted for: a Brixton Village queue that blocks the whole arcade.", "category": "Brixton & Clapham", "amount": 5, "clicks": 1590, "hoursAgo": 3},
    {"url": "https://bermondseystreetcoffee.co.uk", "title": "Bermondsey Street Coffee", "desc": "Wanted for: turning a railway arch into London's best-kept coffee secret.", "category": "Canada Water & Bermondsey", "amount": 5, "clicks": 1650, "hoursAgo": 11},
    {"url": "https://associationcoffee.co.uk", "title": "Association Coffee", "desc": "Wanted for: keeping the trading floor awake through back-to-back meetings.", "category": "Canary Wharf", "amount": 5, "clicks": 2210, "hoursAgo": 22},
    {"url": "https://wappingcoffeeco.com", "title": "Wapping Coffee Co.", "desc": "Wanted for: turning a Wapping warehouse into a flat-white pilgrimage.", "category": "Whitechapel & Wapping", "amount": 5, "clicks": 1740, "hoursAgo": 14},
    {"url": "https://bridgecoffeehouse.co.uk", "title": "Bridge Coffee House", "desc": "Wanted for: out-queuing the Tower Bridge tourists.", "category": "Tower Bridge & Tower Hill", "amount": 5, "clicks": 1980, "hoursAgo": 10},
    {"url": "https://ancoatscoffee.co.uk", "title": "Ancoats Coffee Co.", "desc": "Wanted for: turning a former mill town into flat white territory.", "category": "Manchester", "amount": 5, "clicks": 6210, "hoursAgo": 26},
    {"url": "https://quarterhorsecoffee.com", "title": "Quarter Horse Coffee", "desc": "Wanted for: out-brewing the Bullring one pour-over at a time.", "category": "Birmingham", "amount": 5, "clicks": 4020, "hoursAgo": 45},
    {"url": "https://artisanroast.co.uk", "title": "Artisan Roast", "desc": "Wanted for: fuelling the Fringe on nothing but flat whites.", "category": "Edinburgh", "amount": 5, "clicks": 5480, "hoursAgo": 18},
    {"url": "https://laboratoriocoffee.com", "title": "Laboratorio Coffee", "desc": "Wanted for: running a coffee lab that never sleeps.", "category": "Glasgow", "amount": 5, "clicks": 3340, "hoursAgo": 55},
    {"url": "https://smallstreetespresso.co.uk", "title": "Small Street Espresso", "desc": "Wanted for: hiding the city's best espresso down an alley.", "category": "Bristol", "amount": 5, "clicks": 4670, "hoursAgo": 33},
    {"url": "https://laynesespresso.co.uk", "title": "Laynes Espresso", "desc": "Wanted for: a bar so small the queue forms outside.", "category": "Leeds", "amount": 5, "clicks": 2980, "hoursAgo": 9},
    {"url": "https://boldstreetcoffee.co.uk", "title": "Bold Street Coffee", "desc": "Wanted for: keeping the whole street caffeinated since dawn.", "category": "Liverpool", "amount": 5, "clicks": 2510, "hoursAgo": 15},
    {"url": "https://waterlootea.com", "title": "Waterloo Tea", "desc": "Wanted for: proving Cardiff can out-brew London.", "category": "Cardiff", "amount": 5, "clicks": 1980, "hoursAgo": 7},
    {"url": "https://grind.co.uk", "title": "Grind", "desc": "Wanted for: showing up in every city at once.", "category": "Nationwide", "amount": 5, "clicks": 11400, "hoursAgo": 50},
]


def get_conn():
    return psycopg2.connect(DATABASE_URL, sslmode="require")


def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS listings (
                    id TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    category TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    clicks INTEGER NOT NULL DEFAULT 0,
                    claimed_at BIGINT NOT NULL,
                    logo TEXT
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS meta (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
            """)
            cur.execute("SELECT COUNT(*) FROM listings;")
            (count,) = cur.fetchone()
            if count == 0:
                now_ms = int(time.time() * 1000)
                for i, s in enumerate(SEED_LISTINGS):
                    claimed_at = now_ms - s["hoursAgo"] * 3600 * 1000
                    cur.execute(
                        """INSERT INTO listings (id, url, title, description, category, amount, clicks, claimed_at, logo)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (id) DO NOTHING;""",
                        (f"seed-{i}", s["url"], s["title"], s["desc"], s["category"], s["amount"],
                         s["clicks"], claimed_at, favicon_for(slug(s["url"]))),
                    )
                cur.execute(
                    "INSERT INTO meta (key, value) VALUES ('visitors', %s) ON CONFLICT (key) DO NOTHING;",
                    (str(68412),),
                )
        conn.commit()


def get_state():
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, url, title, description AS desc, category, amount, clicks, claimed_at AS "claimedAt", logo
                FROM listings ORDER BY amount DESC, claimed_at ASC;
            """)
            listings = [dict(r) for r in cur.fetchall()]

            cur.execute("""
                SELECT id, url, title, amount, claimed_at AS ts, logo
                FROM listings ORDER BY claimed_at ASC;
            """)
            activity = [dict(r) for r in cur.fetchall()]

            cur.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM listings;")
            total_earned = cur.fetchone()["total"]

            cur.execute("SELECT value FROM meta WHERE key = 'visitors';")
            row = cur.fetchone()
            visitors = int(row["value"]) if row else 68412

            # nudge the visitor counter up a little on every read, just for flavour
            visitors += 1
            cur.execute("UPDATE meta SET value = %s WHERE key = 'visitors';", (str(visitors),))
        conn.commit()

    return {
        "listings": listings,
        "activity": activity,
        "totalEarned": int(total_earned),
        "visitors": visitors,
    }


def add_listing(listing_id, url, title, desc, category, amount, logo):
    now_ms = int(time.time() * 1000)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO listings (id, url, title, description, category, amount, clicks, claimed_at, logo)
                   VALUES (%s,%s,%s,%s,%s,%s,0,%s,%s)
                   ON CONFLICT (id) DO NOTHING;""",
                (listing_id, url, title, desc, category, amount, now_ms, logo),
            )
        conn.commit()


@app.get("/api/state")
def api_state():
    state = get_state()
    return jsonify({
        "listings": state["listings"],
        "activity": state["activity"],
        "totalEarned": state["totalEarned"],
        "visitors": state["visitors"],
        "stripeConfigured": bool(STRIPE_SECRET_KEY),
    })


@app.post("/api/checkout")
def api_checkout():
    if not STRIPE_SECRET_KEY:
        return jsonify({"error": "Payments aren't configured on this server yet."}), 503

    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()[:60]
    url = (body.get("url") or "").strip()
    category = (body.get("category") or "").strip()
    desc = (body.get("desc") or "").strip()[:140]
    try:
        amount = int(body.get("amount"))
    except (TypeError, ValueError):
        amount = 0

    if not name:
        return jsonify({"error": "Enter the coffeeshop's name."}), 400
    if not url:
        return jsonify({"error": "Enter a link."}), 400
    if not category:
        return jsonify({"error": "Choose a region."}), 400
    if amount < 5:
        return jsonify({"error": "Minimum bounty is £5."}), 400

    origin = request.headers.get("Origin") or request.host_url.rstrip("/")

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "gbp",
                "product_data": {"name": f"coffeebid.lol bounty — {name}"},
                "unit_amount": amount * 100,
            },
            "quantity": 1,
        }],
        metadata={"name": name, "url": url, "category": category, "desc": desc},
        success_url=f"{origin}/?bounty=success",
        cancel_url=f"{origin}/?bounty=cancelled",
    )
    return jsonify({"url": session.url})


@app.post("/webhook")
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return "", 400

    if event["type"] == "checkout.session.completed":
        # stripe-python returns StripeObject instances here, not plain dicts
        # (no .get()) — re-parse the verified raw payload instead.
        session = json.loads(payload)["data"]["object"]
        meta = session.get("metadata") or {}
        amount = (session.get("amount_total") or 0) // 100
        name = meta.get("name") or "Unknown"
        url = meta.get("url") or "#"
        category = meta.get("category") or "Nationwide"
        desc = meta.get("desc") or ""
        logo = favicon_for(slug(url))

        add_listing(session.get("id"), url, name, desc, category, amount, logo)

    return "", 200


@app.get("/")
@app.get("/<path:path>")
def static_files(path="index.html"):
    if not (SITE_DIR / path).exists():
        path = "index.html"
    return send_from_directory(SITE_DIR, path)


init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
