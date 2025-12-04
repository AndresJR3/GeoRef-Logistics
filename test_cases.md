# Casos de Prueba Destructivos y de Validación (Login & Registro)

Este documento contiene un set exhaustivo de pruebas diseñadas para intentar "romper" o validar robustez en los módulos de autenticación. Copia estos casos a TestRigor.

## 🛡️ Validación de Entradas (Input Validation)

### 1. Registro - Campos Vacíos (Validación HTML5)
Verifica que el navegador o la app impidan enviar el formulario vacío.
```
click "Regístrate aquí"
# No escribimos nada
click "Registrarse"
# La validación 'required' del navegador debería impedir el envío.
# TestRigor puede detectar esto si la URL no cambia.
check that url contains "/register"
check that page not contains "Usuario registrado exitosamente"
```

### 2. Registro - Formato de Email Inválido
Verifica que el campo de tipo email rechace entradas sin formato de correo.
```
click "Regístrate aquí"
type "Usuario Test" into "Nombre Completo"
type "esto-no-es-un-correo" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
# Debería fallar por validación del navegador (type="email")
check that url contains "/register"
```

### 3. Registro - Contraseña Insuficiente (< 6 caracteres)
Verifica la restricción de longitud mínima (`minLength={6}`).
```
click "Regístrate aquí"
type "Usuario Corto" into "Nombre Completo"
generate unique email into "email"
type stored value "email" into "Correo Electrónico"
type "12345" into "Contraseña"
click "Registrarse"
# La validación del navegador debería impedir el envío
check that url contains "/register"
```

### 4. Registro - Espacios en Blanco (Trimming)
Verifica si el sistema acepta nombres o correos que son solo espacios.
```
click "Regístrate aquí"
type "   " into "Nombre Completo"
type "   " into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
# Debería fallar por formato de email o validación de nombre
check that url contains "/register"
```

## 🔐 Pruebas de Seguridad (Security Testing)

### 5. Login - Inyección SQL Básica (Username)
Intenta manipular la consulta de base de datos a través del campo de correo.
```
type "' OR '1'='1" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that page contains "Error" or page contains "inválido"
check that url contains "/login"
check that page not contains "Dashboard"
```

### 6. Login - Inyección SQL (Password Bypass)
Intenta saltar la verificación de contraseña.
```
type "admin@example.com" into "Correo Electrónico"
type "' OR '1'='1" into "Contraseña"
click "Ingresar"
check that page contains "Error" or page contains "inválido"
check that url contains "/login"
```

### 7. Registro - Intento de XSS (Cross-Site Scripting) en Nombre
Intenta inyectar un script en el nombre del usuario para que se ejecute al mostrarse en el Dashboard.
```
click "Regístrate aquí"
type "<script>alert('XSS')</script>" into "Nombre Completo"
generate unique email into "xssEmail"
type stored value "xssEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
click "OK"
# Intentar login con el usuario creado
type stored value "xssEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
# Verificar que NO aparezca una alerta (TestRigor fallaría o detectaría el popup)
check that page not contains "alert"
check that page contains "DeliveryTrack"
```

## 🚫 Lógica de Negocio y Errores

### 8. Registro - Usuario Ya Existente
Verifica que no se puedan crear dos cuentas con el mismo correo.
```
# Paso 1: Crear usuario
click "Regístrate aquí"
generate unique email into "dupeEmail"
type "Usuario Original" into "Nombre Completo"
type stored value "dupeEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
click "OK"

# Paso 2: Intentar registrarlo de nuevo
click "Regístrate aquí"
type "Usuario Duplicado" into "Nombre Completo"
type stored value "dupeEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
check that page contains "Error" or page contains "ya registrado" or page contains "existe"
```

### 9. Login - Usuario No Registrado
Verifica el mensaje de error para cuentas inexistentes.
```
type "usuario_fantasma_12345@test.com" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that page contains "Error" or page contains "no encontrado" or page contains "Credenciales inválidas"
```

### 10. Login - Contraseña Incorrecta
Verifica que no permita el acceso con credenciales erróneas.
```
# Asumiendo que existe un usuario válido (puedes crear uno antes si es necesario)
# O usar un flujo completo:
click "Regístrate aquí"
generate unique email into "validEmail"
type "User Test" into "Nombre Completo"
type stored value "validEmail" into "Correo Electrónico"
type "correctPass" into "Contraseña"
click "Registrarse"
click "OK"

# Intentar login con pass incorrecto
type stored value "validEmail" into "Correo Electrónico"
type "wrongPass" into "Contraseña"
click "Ingresar"
check that page contains "Error" or page contains "inválido"
check that url contains "/login"
```

## 🧨 Pruebas Destructivas y de Inyección Avanzada (Destructive & Injection)

### 11. Login - NoSQL Injection (MongoDB/Mongoose) - Bypass de Autenticación
Intenta manipular consultas de MongoDB inyectando operadores lógicos. Aunque los inputs HTML suelen enviar strings, esto verifica si hay algún middleware que parsee JSON o si la API es vulnerable.
```
type "admin" into "Correo Electrónico"
type "{\" $ne \": null}" into "Contraseña"
click "Ingresar"
check that page not contains "Dashboard"
check that page contains "Error" or page contains "inválido"
```

### 12. Login - NoSQL Injection en URL (Query Params)
Verifica si el backend parsea objetos anidados en la query string (ej. `?email[$ne]=null`).
```
open url "http://localhost:3000/login?email[$ne]=null&password[$ne]=null"
# Si la vulnerabilidad existe, podría loguear automáticamente o mostrar error de base de datos
check that page not contains "Dashboard"
check that url contains "/login"
```

### 13. Registro - XSS Políglota (Polyglot Payload)
Usa una cadena diseñada para escapar de múltiples contextos (HTML, JS, atributos).
Payload: `jaVasCript:/*-/*`/*\"/*\'/*-->&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;`
```
click "Regístrate aquí"
type "jaVasCript:/*-/*`/*\"/*\'/*-->&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;" into "Nombre Completo"
generate unique email into "polyEmail"
type stored value "polyEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
click "OK"
# Login y verificar ejecución
type stored value "polyEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that page not contains "alert"
```

### 14. Registro - Inyección de Atributos HTML
Intenta cerrar el tag del input e inyectar atributos nuevos (ej. `onmouseover`).
Payload: `"><img src=x onerror=alert(1)>`
```
click "Regístrate aquí"
type "\"><img src=x onerror=alert(1)>" into "Nombre Completo"
generate unique email into "attrEmail"
type stored value "attrEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
# Verificar en Dashboard
type stored value "attrEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that page not contains "alert"
```

### 15. Fuzzing - Desbordamiento de Búfer (Buffer Overflow Simulation)
Envía una cadena extremadamente larga para verificar manejo de memoria y límites de base de datos.
```
click "Regístrate aquí"
# Generar string de 5000 caracteres (TestRigor permite scripts o variables)
type "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..." into "Nombre Completo"
generate unique email into "longEmail"
type stored value "longEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
# El sistema debería truncarlo o rechazarlo, no crashear
check that page contains "Error" or page contains "largo" or url contains "/register"
```

### 16. Fuzzing - Caracteres Especiales y Unicode
Verifica el manejo de emojis y caracteres de control que podrían romper la codificación.
Payload: `User 👻 👾 🤖 \u0000`
```
click "Regístrate aquí"
type "User 👻 👾 🤖" into "Nombre Completo"
generate unique email into "unicodeEmail"
type stored value "unicodeEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
click "OK"
# Verificar que se muestren correctamente en el Dashboard
type stored value "unicodeEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that page contains "User 👻 👾 🤖"
```

### 17. Inyección de Comandos (Command Injection)
Aunque es raro en este contexto, prueba si algún input se pasa a `exec()` o `system()`.
Payload: `; cat /etc/passwd` o `| dir`
```
click "Regístrate aquí"
type "; cat /etc/passwd" into "Nombre Completo"
generate unique email into "cmdEmail"
type stored value "cmdEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
# Verificar que no haya output del sistema en la respuesta
check that page not contains "root:"
```

### 18. Validación de Tipos de Archivo (Si aplica subida de imagen)
Si el perfil permite subir foto, intentar subir un ejecutable renombrado.
*(Este caso es hipotético si existe funcionalidad de subida)*
```
# click "Subir Foto"
# upload file "malware.php.jpg"
# check that page contains "Error" or page contains "formato no válido"
```

### 19. Redirección Abierta (Open Redirect)
Si el login tiene un parámetro `redirect` o `returnUrl`.
```
open url "http://localhost:3000/login?redirect=http://malicious-site.com"
type "valid@email.com" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that url not contains "malicious-site.com"
```
