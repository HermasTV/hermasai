"""Local SQLite database access for the family graph pipeline."""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "local.db"


def connect() -> sqlite3.Connection:
    """Open a connection to the local SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn
