#!/usr/bin/env python3
"""
Load CSV test data into PostgreSQL tables defined in db/ddl.

Usage examples:
  python db/test/load_test_data.py
  python db/test/load_test_data.py --config db/test/load_test_data_config.yml --truncate
  DATABASE_URL=postgresql://user:pass@localhost:5432/appdb python db/test/load_test_data.py
"""

from __future__ import annotations

import argparse
import csv
import os
from pathlib import Path
from typing import Sequence


DEFAULT_TABLE_LOAD_ORDER = [
    ("users", "users.csv"),
    ("car_listings", "car_listings.csv"),
    ("buyer_preferences", "buyer_preferences.csv"),
    ("car_listing_images", "listing_images.csv"),
]

DEFAULT_TRUNCATE_ORDER = ["car_listing_images", "buyer_preferences", "car_listings", "users"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load CSV test fixtures into PostgreSQL.")
    parser.add_argument(
        "--config",
        default=Path(__file__).resolve().with_name("load_test_data_config.yml"),
        type=Path,
        help="YAML config file path (default: db/test/load_test_data_config.yml).",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        help="Directory containing CSV files. Overrides config.",
    )
    parser.add_argument(
        "--db-url",
        help="Database URL. Overrides config and env values.",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate fixture tables before loading CSV files. Overrides config.",
    )
    return parser.parse_args()


def quote_ident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def normalize_cell(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return None if value == "" else value


def parse_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value != 0
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"1", "true", "yes", "y", "on"}:
            return True
        if normalized in {"0", "false", "no", "n", "off", ""}:
            return False
    raise ValueError(f"Cannot parse boolean value: {value!r}")


def load_config(config_path: Path) -> dict:
    try:
        import yaml
    except ImportError as exc:
        raise RuntimeError(
            "Missing YAML dependency. Install with: `pip install pyyaml`."
        ) from exc

    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with config_path.open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    if config is None:
        return {}
    if not isinstance(config, dict):
        raise ValueError("Config file must contain a YAML mapping at the top level.")
    return config


def resolve_data_dir(args: argparse.Namespace, config: dict) -> Path:
    if args.data_dir:
        return args.data_dir.resolve()

    config_value = config.get("data_dir")
    if config_value:
        config_path = Path(str(config_value))
        if not config_path.is_absolute():
            config_path = args.config.resolve().parent / config_path
        return config_path.resolve()

    return args.config.resolve().parent


def resolve_table_load_order(config: dict) -> list[tuple[str, str]]:
    raw_tables = config.get("tables")
    if raw_tables is None:
        return list(DEFAULT_TABLE_LOAD_ORDER)
    if not isinstance(raw_tables, list):
        raise ValueError("`tables` in config must be a list.")

    resolved: list[tuple[str, str]] = []
    for index, entry in enumerate(raw_tables, start=1):
        if not isinstance(entry, dict):
            raise ValueError(f"`tables[{index}]` must be a mapping.")

        table = entry.get("table") or entry.get("name")
        csv_file = entry.get("csv")

        if not table or not isinstance(table, str):
            raise ValueError(f"`tables[{index}].table` must be a non-empty string.")
        if not csv_file or not isinstance(csv_file, str):
            raise ValueError(f"`tables[{index}].csv` must be a non-empty string.")

        resolved.append((table, csv_file))

    if not resolved:
        raise ValueError("`tables` must not be empty.")
    return resolved


def resolve_truncate_order(config: dict, table_load_order: Sequence[tuple[str, str]]) -> list[str]:
    raw_order = config.get("truncate_order")
    if raw_order is None:
        fallback_order = [table for table, _ in table_load_order]
        fallback_order.reverse()
        return fallback_order or list(DEFAULT_TRUNCATE_ORDER)
    if not isinstance(raw_order, list) or not all(isinstance(x, str) for x in raw_order):
        raise ValueError("`truncate_order` in config must be a list of table names.")
    return list(raw_order)


def build_conn_str(args: argparse.Namespace, config: dict) -> str:
    if args.db_url:
        return args.db_url

    database_config = config.get("database", {})
    if database_config is None:
        database_config = {}
    if not isinstance(database_config, dict):
        raise ValueError("`database` in config must be a mapping.")

    url = os.getenv("DATABASE_URL") or database_config.get("url")
    if url:
        return str(url)

    host = os.getenv("DB_HOST") or str(database_config.get("host", "localhost"))
    port = os.getenv("DB_PORT") or str(database_config.get("port", "5432"))
    dbname = os.getenv("DB_NAME") or str(database_config.get("name", "postgres"))
    user = os.getenv("DB_USER") or str(database_config.get("user", "postgres"))
    password = os.getenv("DB_PASSWORD") or str(database_config.get("password", ""))
    return f"host={host} port={port} dbname={dbname} user={user} password={password}"


def load_csv(cur, table: str, csv_path: Path) -> tuple[int, int]:
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError(f"{csv_path} is missing a header row.")

        columns = reader.fieldnames
        insert_sql = (
            f"INSERT INTO {quote_ident(table)} "
            f"({', '.join(quote_ident(col) for col in columns)}) "
            f"VALUES ({', '.join(['%s'] * len(columns))}) "
            f"ON CONFLICT ({quote_ident('id')}) DO NOTHING"
        )

        total_rows = 0
        inserted_rows = 0
        for row in reader:
            values = [normalize_cell(row.get(col)) for col in columns]
            cur.execute(insert_sql, values)
            total_rows += 1
            inserted_rows += max(cur.rowcount, 0)

    return inserted_rows, total_rows


def truncate_tables(cur, tables: Sequence[str]) -> None:
    stmt = f"TRUNCATE TABLE {', '.join(quote_ident(t) for t in tables)} CASCADE"
    cur.execute(stmt)


def connect(conninfo: str):
    try:
        import psycopg

        return psycopg.connect(conninfo)
    except ImportError:
        try:
            import psycopg2
        except ImportError as exc:
            raise RuntimeError(
                "Missing PostgreSQL driver. Install one of: `pip install psycopg[binary]` "
                "or `pip install psycopg2-binary`."
            ) from exc
        return psycopg2.connect(conninfo)


def resolve_truncate_enabled(args: argparse.Namespace, config: dict) -> bool:
    if args.truncate:
        return True

    options = config.get("options", {})
    if options is None:
        options = {}
    if not isinstance(options, dict):
        raise ValueError("`options` in config must be a mapping.")

    if "truncate_before_load" in options:
        return parse_bool(options["truncate_before_load"])
    if "truncate" in config:
        return parse_bool(config["truncate"])
    return False


def main() -> int:
    args = parse_args()
    config_path = args.config.resolve()
    config = load_config(config_path)
    data_dir = resolve_data_dir(args, config)
    table_load_order = resolve_table_load_order(config)
    truncate_order = resolve_truncate_order(config, table_load_order)
    truncate_enabled = resolve_truncate_enabled(args, config)
    conninfo = build_conn_str(args, config)

    for _, filename in table_load_order:
        path = data_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Missing CSV file: {path}")

    with connect(conninfo) as conn:
        with conn.cursor() as cur:
            if truncate_enabled:
                truncate_tables(cur, truncate_order)
                print("Truncated fixture tables.")

            for table, filename in table_load_order:
                path = data_dir / filename
                inserted, total = load_csv(cur, table, path)
                skipped = total - inserted
                print(
                    f"{table}: processed={total}, inserted={inserted}, skipped_conflicts={skipped}"
                )

        conn.commit()

    print("Fixture load completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
