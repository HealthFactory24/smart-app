Here is the updated and fully optimized version of your `draft.md` file. It consolidates all the hard-earned local-first fixes we just implemented—including the correct `powersync_role` permission bypasses, the database cleanup sequence, and corrected documentation for compiling code trees cleanly.

### Updated `draft.md`

```markdown
# Smart Clinic — Infrastructure & Project Data Drafts

This document serves as a persistent reference sheet for managing local-first development cycles, compiling directory metadata, and configuring PostgreSQL logical replication hooks on the host system.

---

## 📂 Project Context & Tree Generation

### 1. Structure Blueprint Mapping
To export the physical architecture framework while skipping bulky runtimes, binaries, and local data nodes:

```bash
tree -I "node_modules|.git|.next|.turbo|drizzle|dist|data" > packages/data/tree.txt

```

### 2. Multi-Package Source Aggregation (AI Prompt Ingestion)

Use `code2prompt` to compress explicit workspace modules into clean token contexts, explicitly ignoring client interface components:

```bash
# Compile API backend models
code2prompt src \
  --output-file data/src.txt \
  --line-numbers \
  --full-directory-tree \
  --token-format format \
  --encoding cl100k \
  -e "**/ui/**"

# Compile Database schema models
code2prompt src/db \
  --output-file packages/data/database_schema.txt \
  --line-numbers \
  --full-directory-tree


# Compile all
code2prompt src \
  --output-file data/src.txt \
  --line-numbers \
  --full-directory-tree \
  --token-format format \
  --encoding cl100k \
  --exclude "**/ui/**,**/generated/**"
```

---

## 🛠️ Local Database Operations & Resets

### 1. Forced Schema Clean/Wipe

When structural drift happens between local Drizzle state arrays and physical PostgreSQL relations, flush the target tables completely to start pristine:

```bash
sudo -u postgres psql -e -c "
SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname IN ('powersync_data', 'powersync_storage');
DROP DATABASE IF EXISTS powersync_data;
DROP DATABASE IF EXISTS powersync_storage;
CREATE DATABASE powersync_data;
CREATE DATABASE powersync_storage;
"

```

---

## 🔄 PowerSync Replication & Privilege Management

The background replication agent reads raw binary Write-Ahead Logs (WAL) over standard network loops. If new tables cause a `[fatal] permission denied` error, apply these rules directly to your logical database.

### 1. Superuser Privilege Bypass (RLS Override)

Run this single command to refresh table rights, apply schema usage definitions, and allow the replication role to completely bypass Row-Level Security:

```bash
psql "postgres://postgres:HealthF26@localhost:5432/powersync_data?sslmode=disable" -c "
-- 1. Grant replication access and bypass row-level isolation
ALTER ROLE powersync_role WITH REPLICATION BYPASSRLS;

-- 2. Bind default privileges over the public schema cluster
GRANT USAGE ON SCHEMA public TO powersync_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powersync_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO powersync_role;

-- 3. Superuser inheritance link to prevent ownership blockages
GRANT postgres TO powersync_role;
"

```

### 2. Synchronize PostgreSQL Publication Slot

Whenever tables are forcefully dropped and pushed back using Drizzle, recreate the master publication to capture the newly registered schemas:

```bash
psql "postgres://postgres:HealthF26@localhost:5432/powersync_data?sslmode=disable" -c "
DROP PUBLICATION IF EXISTS powersync;
CREATE PUBLICATION powersync FOR ALL TABLES;
"

```

### 3. Cycle Sync Engine Containers

Always cycle the local container services right after changing underlying data access configurations:

```bash
cd /home/hazemali/Apps/smart-app/powersync
docker compose down && docker compose up -d
powersync status

```

```

```

sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
