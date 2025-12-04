# Casos de Prueba para TestRigor (DeliveryTrack)

## 🟢 Pruebas Constructivas (Happy Path)

### 1. Registro de Nuevo Usuario y Login
Este caso verifica que un usuario nuevo pueda registrarse y luego entrar al sistema.
```
generate unique email into "newEmail"
click "Regístrate aquí"
type "Test User" into "Nombre Completo"
type stored value "newEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Registrarse"
check that page contains "Usuario registrado exitosamente"
click "OK"
type stored value "newEmail" into "Correo Electrónico"
type "password123" into "Contraseña"
click "Ingresar"
check that page contains "DeliveryTrack"
check that page contains "Lugares"
```

### 2. Flujo de Logout
Verifica que el usuario pueda salir de la sesión correctamente.
```
login
check that page contains "DeliveryTrack"
click "Cerrar sesión"
check that page contains "Iniciar Sesión"
check that url contains "/login"
```

### 3. Navegación entre Pestañas del Dashboard
Verifica que se pueda cambiar entre las diferentes vistas principales.
```
login
click "Clientes"
check that page contains "Dirección"
click "Entregas"
check that page contains "Prioridad"
click "Repartidores"
check that page contains "Vehículo"
click "Lugares"
check that page contains "Descripción"
```

## 🔴 Pruebas Destructivas (Negative Testing)

### 4. Login con Contraseña Incorrecta
Verifica que el sistema rechace credenciales inválidas.
```
type "usuario_existente@test.com" into "Correo Electrónico"
type "wrongpassword" into "Contraseña"
click "Ingresar"
check that page contains "Error al iniciar sesión"
check that url contains "/login"
```

### 5. Registro con Email Inválido
Verifica la validación del formato de correo.
```
click "Regístrate aquí"
type "Test User" into "Nombre Completo"
type "correo-sin-arroba" into "Correo Electrónico"
type "123456" into "Contraseña"
click "Registrarse"
# El navegador suele mostrar un mensaje nativo, pero verificamos que NO avance
check that page contains "Crear Cuenta"
check that url contains "/register"
```

### 6. Registro con Contraseña Corta
Verifica que se respete el mínimo de caracteres (si existe validación en frontend/backend).
```
click "Regístrate aquí"
type "Short Pass User" into "Nombre Completo"
generate unique email into "email"
type stored value "email" into "Correo Electrónico"
type "123" into "Contraseña"
click "Registrarse"
# Asumiendo que hay validación HTML5 minlength o validación de API
check that page contains "Crear Cuenta"
```

## 🧪 Pruebas de Funcionalidad (End-to-End)

### 7. Intentar Agregar un Lugar (Requiere interacción con Mapa)
Esta prueba intenta abrir el modal de creación. Nota: Interactuar con mapas (Canvas/Leaflet) puede requerir coordenadas específicas en TestRigor.
```
login
click "Lugares"
click "Agregar"
# Simular clic en el mapa (ajustar coordenadas según tu vista inicial)
click at 50%, 50%
check that page contains "Nuevo Lugar"
type "Oficina Central" into "Nombre"
type "Sede principal" into "Descripción"
click "Guardar"
# Verificar que se cerró el modal o apareció en la lista
check that page not contains "Nuevo Lugar"
```

### 8. Validación de Dependencias (Crear Entrega sin Clientes)
Si la app valida que existan clientes antes de crear una entrega.
```
login
click "Entregas"
click "Agregar"
click at 50%, 50%
# Si la app muestra alerta o modal vacío
check that page contains "Nueva Entrega"
# Verificar si el dropdown de clientes está vacío o si la app impide guardar
click "Guardar"
check that page contains "Error" or page contains "Requerido"
```
