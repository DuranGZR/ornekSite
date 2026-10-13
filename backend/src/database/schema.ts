export const migration = `
CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admins (
 id uuid PRIMARY KEY, username text NOT NULL UNIQUE, password_hash text NOT NULL,
 mfa_secret text NOT NULL, mfa_enabled boolean NOT NULL DEFAULT false, last_totp_step bigint NOT NULL DEFAULT -1,
 disabled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY, admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
 csrf_token text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 last_seen_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_admin_idx ON sessions(admin_id);
CREATE TABLE IF NOT EXISTS login_challenges (
 token_hash text PRIMARY KEY, admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
 attempts integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS recovery_codes (
 admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE, code_hash text NOT NULL,
 PRIMARY KEY(admin_id, code_hash)
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS content_items (
 id uuid PRIMARY KEY, kind text NOT NULL CHECK (kind IN ('events','articles','team')),
 slug text NOT NULL, draft jsonb NOT NULL, published jsonb,
 version integer NOT NULL DEFAULT 1, published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(kind, slug)
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id uuid PRIMARY KEY, admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
 action text NOT NULL, target text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at DESC);
CREATE TABLE IF NOT EXISTS publication_state (
 id integer PRIMARY KEY CHECK (id=1), revision integer NOT NULL DEFAULT 0,
 exported_revision integer NOT NULL DEFAULT 0, published_at timestamptz
);
INSERT INTO publication_state(id) VALUES(1) ON CONFLICT(id) DO NOTHING;
INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT(version) DO NOTHING;
`;
export const visualsMigration = `
ALTER TABLE content_items DROP CONSTRAINT content_items_kind_check;
ALTER TABLE content_items ADD CONSTRAINT content_items_kind_check CHECK (kind IN ('events','articles','team','visuals'));
INSERT INTO schema_migrations(version) VALUES(2);
`;
