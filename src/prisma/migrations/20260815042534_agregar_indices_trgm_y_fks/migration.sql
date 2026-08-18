-- This is an empty migration.
-- Habilitar la extensión de trigramas
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índices GIN para búsquedas de texto
CREATE INDEX IF NOT EXISTS idx_eventos_titulo_trgm ON "eventos" USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_trgm ON "usuarios" USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_usuarios_apellido_trgm ON "usuarios" USING gin (apellido gin_trgm_ops);

-- Índices B-tree en Claves Foráneas
CREATE INDEX IF NOT EXISTS idx_ocurrencias_id_evento ON "ocurrencias_evento" ("id_evento");
CREATE INDEX IF NOT EXISTS idx_participante_ocurrencia_ids ON "participante" ("id_ocurrencia", "usuario_id");