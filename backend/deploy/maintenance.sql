-- PostgreSQL cron/maintenance işlemiyle günlük çalıştır.
DELETE FROM sessions WHERE expires_at < now() OR last_seen_at < now() - interval '30 minutes';
DELETE FROM login_challenges WHERE expires_at < now();
DELETE FROM rate_limits WHERE expires_at < now();
-- Audit saklama süresini kurumun politikasıyla belirle; varsayılan silme yok.
