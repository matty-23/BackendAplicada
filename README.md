
# Documentación de API - NestJS Backend

> **Base URL**: `http://localhost:xxxx`

---

## Índice

1. [Módulo de Notificaciones (`/notificaciones`)](https://www.google.com/search?q=%231-m%C3%B3dulo-de-notificaciones)
2. [Módulo de Eventos (`/api/Eventos`)](https://www.google.com/search?q=%232-m%C3%B3dulo-de-eventos)
3. [Módulo de Solicitudes (`/api/solicitudes`)](https://www.google.com/search?q=%233-m%C3%B3dulo-de-solicitudes)
4. [Módulo de Usuarios (`/api`)](https://www.google.com/search?q=%234-m%C3%B3dulo-de-usuarios)
5. [Tabla Resumen de Rutas](https://www.google.com/search?q=%235-tabla-resumen-de-rutas)

---

## 1. Módulo de Notificaciones

**Controlador**: `CorreoController`

**Ruta Base**: `http://localhost:xxxx/notificaciones`

**Guards Globales**: `AuthGuard`, `PermissionsGuard`

---

### 1.1. Enviar correo de confirmación de solicitud a evento

* **Método**: `POST`
* **URL**: `http://localhost:xxxx/notificaciones/confirmacion`
* **Permisos requeridos**: `LISTAR_USUARIOS`, `RECIBIR_NOTIFICACIONES`
* **Body**: `CorreoDTO`
* **Respuesta**: `200 OK` (Vacío)
* **Descripción**: Envía un correo electrónico notificando la confirmación de una solicitud para un evento. Si falla el envío, retorna un HTTP 403 Forbidden.

---

### 1.2. Enviar correo de confirmación de cuenta

* **Método**: `POST`
* **URL**: `http://localhost:xxxx/notificaciones/cuenta/confirmacion`
* **Permisos requeridos**: `LISTAR_USUARIOS`, `RECIBIR_NOTIFICACIONES`
* **Body**: `CorreoConfirmacionCuentaDTO`
* **Respuesta**: `200 OK` (Vacío)
* **Descripción**: Envía el correo de confirmación para la activación o verificación de la cuenta de un usuario.

---

### 1.3. Enviar correo de notificaciones generales

* **Método**: `POST`
* **URL**: `http://localhost:xxxx/notificaciones`
* **Permisos requeridos**: `LISTAR_USUARIOS`, `RECIBIR_NOTIFICACIONES`
* **Body**: `CorreoDTO`
* **Respuesta**: `200 OK` (Vacío)
* **Descripción**: Envía un correo con notificaciones generales del sistema.

---

## 2. Módulo de Eventos

**Controlador**: `EventoController`

**Ruta Base**: `http://localhost:xxxx/api/Eventos`

**Guards Globales**: `AuthGuard`

---

### 2.1. Obtener todos los eventos (Paginado)

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/Eventos/:page/all`
* **Parámetros de Ruta (`Param`)**:
* `page` (`number`, obligatorio): Número de página.


* **Permisos requeridos**: `LISTAR_EVENTOS`
* **Respuesta**: `200 OK` - Arreglo de eventos mapeados con sus ocurrencias y participantes.
* **Descripción**: Recupera la lista paginada de todos los eventos registrados en el sistema resolviendo sus asociaciones.

---

### 2.2. Buscar / Filtrar eventos

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/Eventos/filtros`
* **Parámetros de Consulta (`Query`)**: `filtrosEventoDto`
* **Permisos requeridos**: `LISTAR_EVENTOS`
* **Respuesta**: `200 OK` - Lista de eventos filtrados con el resumen de sus ocurrencias.
* **Descripción**: Realiza una búsqueda blanda de eventos aplicando criterios de filtrado dinámicos.

---

### 2.3. Obtener evento por ID

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/Eventos/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID del evento a consultar.


* **Permisos requeridos**: `VER_DETALLES_EVENTOS`
* **Respuesta**: `200 OK` - Objeto de evento completo mapeado con sus detalles.
* **Descripción**: Retorna los detalles de un evento específico. Si no se encuentra, retorna HTTP 404.

---

### 2.4. Registrar evento multi-día

* **Método**: `POST`
* **URL**: `http://localhost:xxxx/api/Eventos/multi`
* **Código Estado Éxito**: `201 Created`
* **Permisos requeridos**: `AÑADIR_EVENTOS`, `LISTAR_EVENTOS`
* **Body**: `CrearEventoMultiDTO`
* **Respuesta**: `201 Created` - Evento multi-día creado mapeado a DTO.
* **Descripción**: Crea un evento que abarca múltiples días u ocurrencias.

---

### 2.5. Actualizar evento

* **Método**: `PUT`
* **URL**: `http://localhost:xxxx/api/Eventos/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID del evento a actualizar.


* **Permisos requeridos**: `MODIFICAR_EVENTOS`
* **Body**: `ActualizarEventoDTO`
* **Respuesta**: `200 OK` - `{ message: "Evento actualizado correctamente" }`
* **Descripción**: Actualiza los atributos principales y configuración de un evento existente.

---

### 2.6. Eliminar eventos

* **Método**: `DELETE`
* **URL**: `http://localhost:xxxx/api/Eventos`
* **Permisos requeridos**: `ELIMINAR_EVENTOS`
* **Body**: `string[]` (Arreglo con los IDs de los eventos a eliminar).
* **Respuesta**: `200 OK` (Vacío)
* **Descripción**: Elimina del sistema una lista de eventos recibida en el cuerpo de la petición.

---

### 2.7. Actualizar ocurrencia de un evento

* **Método**: `PATCH`
* **URL**: `http://localhost:xxxx/api/Eventos/:idEvento/ocurrencias/:idOcurrencia`
* **Parámetros de Ruta (`Param`)**:
* `idEvento` (`string`, obligatorio): ID del evento padre.
* `idOcurrencia` (`string`, obligatorio): ID de la ocurrencia específica.


* **Permisos requeridos**: `MODIFICAR_EVENTOS`
* **Body**: `ActualizarOcurrenciaDTO`
* **Respuesta**: `200 OK` - Evento refrescado mapeado a DTO.
* **Descripción**: Modifica la información de una ocurrencia específica perteneciente a un evento.

---

### 2.8. Agregar participantes a una ocurrencia

* **Método**: `PATCH`
* **URL**: `http://localhost:xxxx/api/Eventos/ocurrencias/:idOcurrencia/AParticipantes`
* **Parámetros de Ruta (`Param`)**:
* `idOcurrencia` (`string`, obligatorio): ID de la ocurrencia.


* **Permisos requeridos**: `MODIFICAR_EVENTOS`
* **Body**: `string[]` (Arreglo con los IDs de los participantes a agregar).
* **Respuesta**: `200 OK` - `{ mensaje: "Participantes procesados", advertencia: ... }`
* **Descripción**: Asigna un listado de participantes a una ocurrencia de evento.

---

## 3. Módulo de Solicitudes

**Controlador**: `SolicitudController`

**Ruta Base**: `http://localhost:xxxx/api/solicitudes`

**Guards Globales**: `AuthGuard`

---

### 3.1. Listar mis solicitudes

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/solicitudes/mis`
* **Parámetros de Consulta (`Query`)**:
* `page` (`number`, opcional): Número de página (predeterminado: `1`).


* **Permisos requeridos**: `GENERAR_SOLICITUDES`
* **Respuesta**: `200 OK` - Arreglo de solicitudes pertenecientes al usuario autenticado.
* **Descripción**: Obtiene las solicitudes de reserva/eventos creadas por el usuario activo en la sesión.

---

### 3.2. Listar y filtrar solicitudes

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/solicitudes/filtros`
* **Parámetros de Consulta (`Query`)**:
* `filtros`: `FiltrosSolicitudDto`
* `page` (`number`, opcional): Número de página (predeterminado: `1`).


* **Permisos requeridos**: `LISTAR_SOLICITUDES`
* **Respuesta**: `200 OK` - Listado paginado y filtrado de solicitudes del sistema.
* **Descripción**: Permite explorar y buscar entre todas las solicitudes registradas.

---

### 3.3. Obtener solicitud por ID

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/solicitudes/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID de la solicitud a consultar.


* **Permisos requeridos**: `LISTAR_SOLICITUDES`
* **Respuesta**: `200 OK` - Objeto de solicitud mapeado con sus bloques de fechas/lugares.
* **Descripción**: Obtiene los detalles completos de una solicitud por su ID.

---

### 3.4. Crear solicitud

* **Método**: `POST`
* **URL**: `http://localhost:xxxx/api/solicitudes`
* **Código Estado Éxito**: `201 Created`
* **Permisos requeridos**: `GENERAR_SOLICITUDES`
* **Body**: `CrearSolicitudDto`
* **Respuesta**: `201 Created` - Solicitud creada mapeada a DTO.
* **Descripción**: Registra una nueva solicitud vinculada al usuario autenticado.

---

### 3.5. Modificar solicitud

* **Método**: `PUT`
* **URL**: `http://localhost:xxxx/api/solicitudes/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID de la solicitud a modificar.


* **Permisos requeridos**: `MODIFICAR_SOLICITUD`
* **Body**: `ModificarSolicitudDto`
* **Respuesta**: `200 OK` - `{ message: "Solicitud actualizada correctamente", ok: boolean }`
* **Descripción**: Permite editar los datos de una solicitud enviada previamente.

---

### 3.6. Cancelar solicitud

* **Método**: `DELETE`
* **URL**: `http://localhost:xxxx/api/solicitudes/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID de la solicitud a cancelar.


* **Permisos requeridos**: `CANCELAR_SOLICITUDES`
* **Respuesta**: `200 OK` - `{ message: "Solicitud cancelada correctamente", ok: boolean }`
* **Descripción**: Cancela/elimina una solicitud activa del sistema.

---

### 3.7. Aceptar solicitud

* **Método**: `PATCH`
* **URL**: `http://localhost:xxxx/api/solicitudes/:id/aceptar`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID de la solicitud a aceptar.


* **Permisos requeridos**: `ACEPTAR_SOLICITUD`
* **Body**: `AceptarSolicitudDto`
* **Respuesta**: `200 OK` - `{ message: "Solicitud aceptada y evento generado correctamente", ok: boolean }`
* **Descripción**: Aprueba la solicitud planteada y genera automáticamente el evento resultante.

---

### 3.8. Rechazar solicitud

* **Método**: `PATCH`
* **URL**: `http://localhost:xxxx/api/solicitudes/:id/rechazar`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID de la solicitud a rechazar.


* **Permisos requeridos**: `RECHAZAR_SOLICITUD`
* **Body**: `RechazarSolicitudDto` *(Opcional)*
* **Respuesta**: `200 OK` - `{ message: "Solicitud rechazada correctamente", ok: boolean }`
* **Descripción**: Desestima/rechaza una solicitud especificando opcionalmente el motivo.

---

## 4. Módulo de Usuarios

**Controlador**: `UsuarioController`

**Ruta Base**: `http://localhost:xxxx/api`

**Guards Globales**: `AuthGuard`, `PermissionsGuard`

---

### 4.1. Listar usuarios (Paginado)

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/usuarios`
* **Parámetros de Consulta (`Query`)**: `GetUsuariosQueryDTO`
* **Permisos requeridos**: `LISTAR_USUARIOS`
* **Cabeceras de Respuesta (`Headers`)**:
* `X-Total-Count`: Cantidad total de registros.
* `X-Has-Next-Page`: Indica si existe una página siguiente (`true`/`false`).
* `X-Skip`: Cantidad de registros omitidos.
* `X-Limit`: Límite de registros por página.


* **Respuesta**: `200 OK` - Arreglo de `ObtenerUsuarioDTO`.
* **Descripción**: Obtiene la lista de usuarios devolviendo la información de paginación en las cabeceras HTTP (`headers`).

---

### 4.2. Obtener usuario por ID

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/usuario/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID del usuario.


* **Permisos requeridos**: `LISTAR_USUARIOS`
* **Respuesta**: `200 OK` - Objeto `ObtenerUsuarioDTO`.
* **Descripción**: Retorna la información de un usuario específico según su ID.

---

### 4.3. Obtener usuario por correo electrónico

* **Método**: `GET`
* **URL**: `http://localhost:xxxx/api/usuario/correo/:correo`
* **Parámetros de Ruta (`Param`)**:
* `correo` (`string`, obligatorio): Dirección de email a consultar.


* **Permisos requeridos**: `LISTAR_USUARIOS`
* **Respuesta**: `200 OK` - Objeto `ObtenerUsuarioDTO` o valor booleano.
* **Descripción**: Busca y verifica si existe un usuario asociado a la dirección de correo proporcionada.

---

### 4.4. Actualizar usuario parcialmente

* **Método**: `PATCH`
* **URL**: `http://localhost:xxxx/api/usuario/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID del usuario a modificar.


* **Permisos requeridos**: Requiere al menos uno de los siguientes:
* `MODIFICAR_USUARIO`: Permite actualizar cualquier usuario.
* `MODIFICAR_USUARIO_PROPIO`: Permite modificar únicamente la cuenta propia.
* `MODIFICAR_ROL`: Requerido si el cuerpo incluye modificación del rol.


* **Body**: `ActualizarUsuarioDTO`
* **Respuesta**: `200 OK` - Objeto `ObtenerUsuarioDTO` actualizado.
* **Descripción**: Modifica parcialmente los atributos de un usuario con validaciones para cambio de rol o usuarios ajenos.

---

### 4.5. Reemplazar usuario totalmente

* **Método**: `PUT`
* **URL**: `http://localhost:xxxx/api/usuario/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID del usuario a reemplazar.


* **Permisos requeridos**: `MODIFICAR_USUARIO`
* **Body**: `ActualizarUsuarioCompletoDTO`
* **Respuesta**: `200 OK` - Objeto `ObtenerUsuarioDTO` reemplazado.
* **Descripción**: Reemplaza completamente los datos del usuario especificado.

---

### 4.6. Eliminar usuario

* **Método**: `DELETE`
* **URL**: `http://localhost:xxxx/api/usuario/:id`
* **Parámetros de Ruta (`Param`)**:
* `id` (`string`, obligatorio): ID del usuario a eliminar.


* **Permisos requeridos**: `ELIMINAR_USUARIO`
* **Respuesta**: `200 OK` - `boolean` (`true` si fue eliminado correctamente).
* **Descripción**: Elimina del sistema el usuario correspondiente al ID proporcionado.

---

## 5. Tabla Resumen de Rutas

| Método | URL Completa | Controlador | Permiso(s) Requerido(s) |
| --- | --- | --- | --- |
| **POST** | `http://localhost:xxxx/notificaciones/confirmacion` | `CorreoController` | `LISTAR_USUARIOS`, `RECIBIR_NOTIFICACIONES` |
| **POST** | `http://localhost:xxxx/notificaciones/cuenta/confirmacion` | `CorreoController` | `LISTAR_USUARIOS`, `RECIBIR_NOTIFICACIONES` |
| **POST** | `http://localhost:xxxx/notificaciones` | `CorreoController` | `LISTAR_USUARIOS`, `RECIBIR_NOTIFICACIONES` |
| **GET** | `http://localhost:xxxx/api/Eventos/:page/all` | `EventoController` | `LISTAR_EVENTOS` |
| **GET** | `http://localhost:xxxx/api/Eventos/filtros` | `EventoController` | `LISTAR_EVENTOS` |
| **GET** | `http://localhost:xxxx/api/Eventos/:id` | `EventoController` | `VER_DETALLES_EVENTOS` |
| **POST** | `http://localhost:xxxx/api/Eventos/multi` | `EventoController` | `AÑADIR_EVENTOS`, `LISTAR_EVENTOS` |
| **PUT** | `http://localhost:xxxx/api/Eventos/:id` | `EventoController` | `MODIFICAR_EVENTOS` |
| **DELETE** | `http://localhost:xxxx/api/Eventos` | `EventoController` | `ELIMINAR_EVENTOS` |
| **PATCH** | `http://localhost:xxxx/api/Eventos/:idEvento/ocurrencias/:idOcurrencia` | `EventoController` | `MODIFICAR_EVENTOS` |
| **PATCH** | `http://localhost:xxxx/api/Eventos/ocurrencias/:idOcurrencia/AParticipantes` | `EventoController` | `MODIFICAR_EVENTOS` |
| **GET** | `http://localhost:xxxx/api/solicitudes/mis` | `SolicitudController` | `GENERAR_SOLICITUDES` |
| **GET** | `http://localhost:xxxx/api/solicitudes/filtros` | `SolicitudController` | `LISTAR_SOLICITUDES` |
| **GET** | `http://localhost:xxxx/api/solicitudes/:id` | `SolicitudController` | `LISTAR_SOLICITUDES` |
| **POST** | `http://localhost:xxxx/api/solicitudes` | `SolicitudController` | `GENERAR_SOLICITUDES` |
| **PUT** | `http://localhost:xxxx/api/solicitudes/:id` | `SolicitudController` | `MODIFICAR_SOLICITUD` |
| **DELETE** | `http://localhost:xxxx/api/solicitudes/:id` | `SolicitudController` | `CANCELAR_SOLICITUDES` |
| **PATCH** | `http://localhost:xxxx/api/solicitudes/:id/aceptar` | `SolicitudController` | `ACEPTAR_SOLICITUD` |
| **PATCH** | `http://localhost:xxxx/api/solicitudes/:id/rechazar` | `SolicitudController` | `RECHAZAR_SOLICITUD` |
| **GET** | `http://localhost:xxxx/api/usuarios` | `UsuarioController` | `LISTAR_USUARIOS` |
| **GET** | `http://localhost:xxxx/api/usuario/:id` | `UsuarioController` | `LISTAR_USUARIOS` |
| **GET** | `http://localhost:xxxx/api/usuario/correo/:correo` | `UsuarioController` | `LISTAR_USUARIOS` |
| **PATCH** | `http://localhost:xxxx/api/usuario/:id` | `UsuarioController` | `MODIFICAR_USUARIO`, `MODIFICAR_USUARIO_PROPIO`, `MODIFICAR_ROL` |
| **PUT** | `http://localhost:xxxx/api/usuario/:id` | `UsuarioController` | `MODIFICAR_USUARIO` |
| **DELETE** | `http://localhost:xxxx/api/usuario/:id` | `UsuarioController` | `ELIMINAR_USUARIO` |
