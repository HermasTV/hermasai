"""Arabic name parser for the family graph pipeline.

Arabic naming convention follows: given + father + grandfather + family/tribe.
Example: "محمد أحمد علي النجار"
         given=محمد, father=أحمد, grandfather=علي, family=النجار

Complications this parser handles:
  1. Compound prefix names: "عبد X" (servant-of-X), "ابو X" (father-of-X), etc.
     These are 2 raw tokens that represent 1 logical name unit.
     Example: "فاتن عوض عبد الرحمن شاهين" → 4 logical tokens, not 5.

  2. Compound suffix names: "X الدين" (X-of-religion), "X الله".
     These attach to the preceding token.
     Example: "عماد الدين مصطفى عايش اسليم" → 4 logical tokens, not 5.

  3. Arabic letter normalization: أ/إ/آ → ا, ة → ه, ى → ي.
     Different writers spell the same name with different alif/ya forms.

  4. The family name (last token) often carries the definite article "ال".
     We keep it for now but expose a stripped form as well so we can detect
     "البرش" and "برش" as candidates for the same family later if needed.
"""

from typing import List, Tuple

# Tokens that bind to the FOLLOWING token to form a single logical name unit.
# "عبد الرحمن" = "Servant of the Merciful" -- one name, not two.
ARABIC_PREFIX_COMPOUNDS = {
    "عبد",   # Abdel / Abdul (servant of)
    "أبو",  # Abu (father of)
    "ابو",   # Abu (alternate spelling, no hamza)
    "أم",    # Umm (mother of)
    "ام",    # Umm (alternate spelling)
    "ابن",   # Ibn (son of)
    "بن",    # Bin (son of)
    "بنت",   # Bint (daughter of)
    "ذو",    # Dhu (possessor of)
    "ال",    # Al (the) -- when it's a standalone token (rare; usually attached)
}

# Tokens that bind to the PRECEDING token to form a single logical name unit.
# "عماد الدين" = "Pillar of Religion" -- one name.
ARABIC_SUFFIX_COMPOUNDS = {
    "الدين",   # Al-Din (of religion)
    "الله",    # Allah (of God)
    "الرحمن",  # Al-Rahman (of the Merciful)
    "الاسلام", # Al-Islam (of Islam)
}

# Single-character substitutions for Arabic normalization.
# Different writers and dialects spell the same letter differently.
ARABIC_NORMALIZE_MAP = str.maketrans({
    "أ": "ا",
    "إ": "ا",
    "آ": "ا",
    "ٱ": "ا",
    "ة": "ه",
    "ى": "ي",
    "ؤ": "و",
    "ئ": "ي",
    # Strip diacritics (tashkil)
    "\u064B": "",  # fathatan
    "\u064C": "",  # dammatan
    "\u064D": "",  # kasratan
    "\u064E": "",  # fatha
    "\u064F": "",  # damma
    "\u0650": "",  # kasra
    "\u0651": "",  # shadda
    "\u0652": "",  # sukun
    "\u0670": "",  # superscript alef
})


def normalize_arabic(text: str) -> str:
    """Normalize Arabic text: unify letter forms, strip diacritics, collapse whitespace."""
    if not text:
        return ""
    text = text.translate(ARABIC_NORMALIZE_MAP)
    text = " ".join(text.split())  # collapse whitespace
    return text.strip()


def tokenize_arabic_name(name: str) -> List[str]:
    """Split an Arabic name into its logical name units, merging compound parts.

    Returns a list of logical tokens (typically 3-5 entries).
    """
    if not name:
        return []

    normalized = normalize_arabic(name)
    raw_tokens = normalized.split()

    # Pass 1: merge prefix compounds (عبد X, ابو X, ...)
    merged: List[str] = []
    i = 0
    while i < len(raw_tokens):
        token = raw_tokens[i]
        # Note: prefix set was defined with the original (un-normalized) forms.
        # After normalization, "أبو" → "ابو", "أم" → "ام". The set contains both
        # forms for safety, but only the normalized ones will actually match here.
        if token in ARABIC_PREFIX_COMPOUNDS and i + 1 < len(raw_tokens):
            merged.append(f"{token} {raw_tokens[i + 1]}")
            i += 2
        else:
            merged.append(token)
            i += 1

    # Pass 2: merge suffix compounds (X الدين, X الله)
    final: List[str] = []
    for token in merged:
        if token in ARABIC_SUFFIX_COMPOUNDS and final:
            final[-1] = f"{final[-1]} {token}"
        else:
            final.append(token)

    return final


def strip_al_prefix(token: str) -> str:
    """Return the token with leading 'ال' (definite article) removed.

    Used for fuzzy family-name comparison: "البرش" and "برش" should be
    treated as candidates for the same family.
    """
    if token and token.startswith("ال") and len(token) > 2:
        return token[2:]
    return token


def parse_name(name_ar: str) -> Tuple[str, str, str, str, List[str]]:
    """Parse an Arabic full name into (given, father, grandfather, family, all_tokens).

    Empty string is returned for any position not present.
    The family name is always the LAST logical token.
    """
    tokens = tokenize_arabic_name(name_ar)
    if not tokens:
        return "", "", "", "", []

    given = tokens[0] if len(tokens) >= 1 else ""
    father = tokens[1] if len(tokens) >= 2 else ""
    grandfather = tokens[2] if len(tokens) >= 3 else ""
    family = tokens[-1] if len(tokens) >= 2 else ""

    # Edge case: 1-token name has no family
    if len(tokens) == 1:
        family = ""

    # Edge case: 2-token name → family is the 2nd token, no father/grandfather
    if len(tokens) == 2:
        father = ""
        grandfather = ""

    # Edge case: 3-token name → father exists but no grandfather; last is family
    if len(tokens) == 3:
        grandfather = ""

    return given, father, grandfather, family, tokens


# Same logic for English names so display fields stay aligned with Arabic parse.
# The English transliteration uses the same compound conventions.
ENGLISH_PREFIX_COMPOUNDS = {
    "abdel", "abdul", "abd",
    "abu",
    "umm", "um",
    "ibn", "bin", "ben",
    "bint",
    "al-", "el-",
}


def tokenize_english_name(name: str) -> List[str]:
    """Mirror tokenize_arabic_name for the English transliteration.

    Returns logical tokens, merging "Abdel X", "Abu X", etc.
    """
    if not name:
        return []

    raw_tokens = name.strip().split()
    merged: List[str] = []
    i = 0
    while i < len(raw_tokens):
        token = raw_tokens[i]
        # Compare in lowercase for matching, but preserve original case in output
        if token.lower() in ENGLISH_PREFIX_COMPOUNDS and i + 1 < len(raw_tokens):
            merged.append(f"{token} {raw_tokens[i + 1]}")
            i += 2
        else:
            merged.append(token)
            i += 1

    # Handle "X Al-Din" suffix
    final: List[str] = []
    for token in merged:
        lower = token.lower()
        if lower in {"al-din", "el-din", "al din"} and final:
            final[-1] = f"{final[-1]} {token}"
        else:
            final.append(token)

    return final


def parse_english_name(name_en: str) -> Tuple[str, str, str, str]:
    """Parse an English transliterated name into (given, father, grandfather, family)."""
    tokens = tokenize_english_name(name_en)
    if not tokens:
        return "", "", "", ""

    given = tokens[0] if len(tokens) >= 1 else ""
    father = tokens[1] if len(tokens) >= 2 else ""
    grandfather = tokens[2] if len(tokens) >= 3 else ""
    family = tokens[-1] if len(tokens) >= 2 else ""

    if len(tokens) == 1:
        family = ""
    if len(tokens) == 2:
        father = ""
        grandfather = ""
    if len(tokens) == 3:
        grandfather = ""

    return given, father, grandfather, family


# ---------------------------------------------------------------------------
# Quick smoke test: run `python -m family_graph.name_parser` to see parses.
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    SAMPLES = [
        ("فاتن عوض عبد الرحمن شاهين", "Faten Awad Abdel Rahman Shaheen"),
        ("عبد الحميد سليمان عبد الحميد صبح", "Abdel Hamid Suleiman Abdel Hamid Sobh"),
        ("عماد الدين مصطفى عايش اسليم", "Imad Al-Din Mustafa Ayesh Islim"),
        ("اسماعيل انور عبد القادر الكرد", "Ismail Anwar Abdel Qadir Al-Kurd"),
        ("غزل عيسى نبيل ابو نصر", "Ghazal Issa Nabil Abu Nasr"),
        ("جود محمد منصور عبد الجواد", "Joud Mohammed Mansour Abdel Jawad"),
        ("مريم نور الدين وائل ضبان", "Mariam Nour Al-Din Wael Dabban"),
        ("محمود زكي محمود البكري", "Mahmoud Zaki Mahmoud Al-Bakri"),
        ("أحمد", "Ahmed"),  # 1-token edge case
        ("أحمد محمد", "Ahmed Mohammed"),  # 2-token edge case
    ]

    print(f"{'Arabic':<45} → {'tokens':<6}  given / father / grandfather / family")
    print("-" * 110)
    for ar, en in SAMPLES:
        given, father, grandfather, family, tokens = parse_name(ar)
        print(
            f"{ar:<45} → {len(tokens):>2}     "
            f"{given} / {father} / {grandfather} / {family}"
        )
        en_g, en_f, en_gf, en_fam = parse_english_name(en)
        print(f"{'  EN: ' + en:<45}        {en_g} / {en_f} / {en_gf} / {en_fam}")
