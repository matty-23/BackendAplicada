-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(255) NOT NULL,
    "contrasena" TEXT NOT NULL,
    "departamento" VARCHAR(100),
    "rol" VARCHAR(50) DEFAULT 'usuario',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fecha_inicio" TIMESTAMPTZ NOT NULL,
    "fecha_finalizacion" TIMESTAMPTZ NOT NULL,
    "operarios_encargado" TEXT,
    "cantidad_personas" INTEGER,
    "lugar" VARCHAR(255),
    "equipamiento" TEXT,
    "estado" VARCHAR(50) DEFAULT 'pendiente',
    "categoria" VARCHAR(100),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_usuario_solicitante" UUID NOT NULL,
    "persona_encargada" VARCHAR(150),
    "cantidad_persona" INTEGER,
    "lugar" VARCHAR(255),
    "fecha_inicio" TIMESTAMPTZ NOT NULL,
    "fecha_fin" TIMESTAMPTZ NOT NULL,
    "tipo_evento" VARCHAR(100),
    "estado" VARCHAR(50) DEFAULT 'pendiente',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planilla_horas" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" UUID NOT NULL,
    "cantidad_horas" DECIMAL(5,2) NOT NULL,
    "estado" VARCHAR(50) DEFAULT 'registrado',
    "fecha_evento" TIMESTAMPTZ NOT NULL,
    "fecha_horas" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "mes" DATE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planilla_horas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participante" (
    "usuario_id" UUID NOT NULL,
    "evento_id" UUID NOT NULL,

    CONSTRAINT "participante_pkey" PRIMARY KEY ("usuario_id","evento_id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" UUID NOT NULL,
    "id_evento" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "cantidad" INTEGER DEFAULT 0,
    "categoria" VARCHAR(100),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo" (
    "id" BIGSERIAL NOT NULL,
    "id_inventario" BIGINT,
    "fecha_ingreso" DATE DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50) DEFAULT 'disponible',
    "id_categoria" BIGINT,
    "codigo" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantilla_equipo" (
    "id" BIGSERIAL NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantilla_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atributo_plantilla" (
    "id_atributo" BIGSERIAL NOT NULL,
    "id_plantilla" BIGINT NOT NULL,
    "nombre_atributo" VARCHAR(100) NOT NULL,

    CONSTRAINT "atributo_plantilla_pkey" PRIMARY KEY ("id_atributo")
);

-- CreateTable
CREATE TABLE "atributo_valor" (
    "id" BIGSERIAL NOT NULL,
    "id_atributo" BIGINT NOT NULL,
    "id_equipo" BIGINT,
    "valor" TEXT NOT NULL,

    CONSTRAINT "atributo_valor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_log" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" UUID,
    "accion" VARCHAR(255),
    "fecha_log" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_reportes" (
    "id" BIGSERIAL NOT NULL,
    "tipo" VARCHAR(100),
    "estadisticas" JSONB,
    "fecha" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "nombre" VARCHAR(150),
    "contenido" TEXT,

    CONSTRAINT "auditoria_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_solicitud_a_evento" (
    "id" BIGSERIAL NOT NULL,
    "id_solicitud" UUID,
    "id_evento" UUID,
    "fecha_solicitud" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_solicitud_a_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_equipos_por_evento" (
    "id" BIGSERIAL NOT NULL,
    "id_evento" UUID,
    "id_equipo" BIGINT,
    "fecha_auditoria" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_equipos_por_evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "equipo_codigo_key" ON "equipo"("codigo");

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_id_usuario_solicitante_fkey" FOREIGN KEY ("id_usuario_solicitante") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planilla_horas" ADD CONSTRAINT "planilla_horas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo" ADD CONSTRAINT "equipo_id_inventario_fkey" FOREIGN KEY ("id_inventario") REFERENCES "inventario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atributo_plantilla" ADD CONSTRAINT "atributo_plantilla_id_plantilla_fkey" FOREIGN KEY ("id_plantilla") REFERENCES "plantilla_equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atributo_valor" ADD CONSTRAINT "atributo_valor_id_atributo_fkey" FOREIGN KEY ("id_atributo") REFERENCES "atributo_plantilla"("id_atributo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atributo_valor" ADD CONSTRAINT "atributo_valor_id_equipo_fkey" FOREIGN KEY ("id_equipo") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_log" ADD CONSTRAINT "auditoria_log_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_solicitud_a_evento" ADD CONSTRAINT "auditoria_solicitud_a_evento_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "solicitudes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_solicitud_a_evento" ADD CONSTRAINT "auditoria_solicitud_a_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "eventos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_equipos_por_evento" ADD CONSTRAINT "auditoria_equipos_por_evento_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_equipos_por_evento" ADD CONSTRAINT "auditoria_equipos_por_evento_id_equipo_fkey" FOREIGN KEY ("id_equipo") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
