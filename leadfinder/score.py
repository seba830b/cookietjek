"""Step 4: turn audit findings into a 0-100 score, a problem list and a
one-line Danish pitch angle.

Bands:
  95  no website, but active on Facebook/Instagram (wants to be online)
  90  no website at all
  85  website broken (doesn't load, error page, parked/under construction)
  10-80 working website, 10 + points per problem (capped at 80)
"""

from datetime import date

# key: (points, problem text for the sheet, Danish phrase for the pitch)
PROBLEMS = {
    "not_mobile":     (25, "ikke mobilvenlig (mangler viewport)", "er ikke mobilvenlig"),
    "bad_cert":       (20, "ugyldigt HTTPS-certifikat", "har et ugyldigt sikkerhedscertifikat"),
    "no_https":       (20, "ingen HTTPS", "mangler HTTPS"),
    "flash":          (15, "bruger Flash", "bruger Flash, som ingen browsere viser længere"),
    "free_builder":   (15, "gratis {builder}-side med reklame", "ligger på en gratis {builder}-side med reklame"),
    "old_generator":  (10, "lavet i forældet program ({generator})", "er lavet i et forældet program"),
    "table_layout":   (10, "gammelt tabel-layout", "er bygget med et gammeldags tabel-layout"),
    "no_responsive":  (10, "ingen responsiv CSS", "tilpasser sig ikke skærmstørrelsen"),
    "old_copyright":  (10, "forældet (copyright {year})", "ser ikke opdateret ud siden {year}"),
    "slow":           (10, "langsom ({seconds} s)", "er langsom at åbne ({seconds} sekunder)"),
    "no_contact":     (5,  "telefon/mail ikke synlig", "viser ikke telefon eller mail tydeligt"),
    "no_hours":       (5,  "åbningstider ikke synlige", "viser ikke åbningstider"),
}

# Trades usually work by appointment, so missing opening hours is no problem.
NO_HOURS_NEEDED = {"electrician", "plumber", "painter", "carpenter"}


def find_problems(audit, category, current_year=None):
    """List of problem keys for a site that loads."""
    year = current_year or date.today().year
    keys = []
    if not audit.get("viewport"):
        keys.append("not_mobile")
    if audit.get("https") == "ugyldigt certifikat":
        keys.append("bad_cert")
    elif audit.get("https") == "ingen":
        keys.append("no_https")
    if audit.get("flash"):
        keys.append("flash")
    if audit.get("free_builder"):
        keys.append("free_builder")
    if audit.get("old_generator"):
        keys.append("old_generator")
    if audit.get("table_layout"):
        keys.append("table_layout")
    if not audit.get("responsive_css") and not audit.get("viewport"):
        keys.append("no_responsive")
    if audit.get("copyright_year") and audit["copyright_year"] < year - 2:
        keys.append("old_copyright")
    if audit.get("slow"):
        keys.append("slow")
    if not (audit.get("phone_visible") or audit.get("email_visible")):
        keys.append("no_contact")
    if category not in NO_HOURS_NEEDED and not audit.get("hours_visible"):
        keys.append("no_hours")
    return keys


def _fmt(text, audit):
    return text.format(builder=audit.get("free_builder") or "",
                       generator=audit.get("generator") or "",
                       year=audit.get("copyright_year") or "",
                       seconds=str(audit.get("seconds") or "").replace(".", ","))


def score_lead(biz, audit, label_da):
    """Return (score, problems_text, pitch_angle)."""
    town = biz.get("town") or "området"
    has_social = bool(biz.get("socials"))

    if audit is None:  # no website anywhere
        if has_social:
            return (95, "ingen hjemmeside, kun Facebook/Instagram",
                    f"I har kun en side på sociale medier - en rigtig hjemmeside gør jer lette at finde, "
                    f"når folk googler {label_da} i {town}.")
        return (90, "ingen hjemmeside fundet",
                f"I har ingen hjemmeside - kunder der søger {label_da} i {town} på nettet finder jer ikke.")

    if audit.get("robots_blocked"):
        return (30, "ikke tjekket (robots.txt)",
                "Kig selv på hjemmesiden før du ringer - den kunne ikke tjekkes automatisk.")

    if not audit.get("loads"):
        err = audit.get("error") or "fejl"
        return (85, f"hjemmeside virker ikke: {err}",
                f"Jeres hjemmeside virker ikke lige nu ({err}) - kunder møder en fejl i stedet for jer.")

    if audit.get("parked"):
        return (85, "hjemmeside er tom/under opbygning",
                "Jeres domæne viser kun en tom side eller 'under opbygning' - lad os gøre den færdig.")

    keys = sorted(find_problems(audit, biz.get("category")), key=lambda k: -PROBLEMS[k][0])
    points = sum(PROBLEMS[k][0] for k in keys)
    score = min(80, 10 + points)
    problems = "; ".join(_fmt(PROBLEMS[k][1], audit) for k in keys)

    if not keys:
        pitch = "Hjemmesiden er i orden - tilbyd IT-support, drift og opdateringer i stedet."
    else:
        # Mention the two heaviest problems in one sentence.
        phrases = [_fmt(PROBLEMS[k][2], audit) for k in keys[:2]]
        pitch = "Hjemmesiden " + " og ".join(phrases) + "."
        if biz.get("found_website"):
            pitch += " (Fandt siden via søgning, tjek at den er deres.)"
    return score, problems, pitch
