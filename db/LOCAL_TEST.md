# Local Postgres Test Setup

Run these commands from the repo root (`ECE1779_Team_Project`).

## 1. Start a local Postgres container

This uses the same connection values currently in `db/test/load_test_data_config.yml`.

```bash
docker run --name ece1779-postgres \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=test_db \
  -p 5433:5432 \
  -d postgres:16
```

Wait for Postgres to be ready:

```bash
docker exec ece1779-postgres pg_isready -U test_user -d test_db
```

## 2. Create DB schema

```bash
docker exec -i ece1779-postgres \
  psql -U test_user -d test_db < db/ddl/ddl.sql
```

## 3. Install loader dependencies

Use any Python 3 environment you prefer:

```bash
python3 -m pip install pyyaml psycopg[binary]
```

## 4. Load test CSV data

```bash
python3 db/test/load_test_data.py \
  --config db/test/load_test_data_config.yml
```

Expected output ends with:

```text
Fixture load completed.
```

## 5. Verify data loaded (optional)

```bash
docker exec -it ece1779-postgres psql -U test_user -d test_db -c "SELECT COUNT(*) FROM users;"
docker exec -it ece1779-postgres psql -U test_user -d test_db -c "SELECT COUNT(*) FROM car_listings;"
docker exec -it ece1779-postgres psql -U test_user -d test_db -c "SELECT COUNT(*) FROM buyer_preferences;"
docker exec -it ece1779-postgres psql -U test_user -d test_db -c "SELECT COUNT(*) FROM car_listing_images;"
```

## 6. Cleanup

Stop and remove the container:

```bash
docker rm -f ece1779-postgres
```
