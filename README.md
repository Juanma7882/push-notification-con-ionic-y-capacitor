# Push Notification App — Ionic + Capacitor + Angular

App de ejemplo con notificaciones locales (heads-up style) usando Ionic 7, Angular 21, Capacitor y `@capacitor/local-notifications`.

---

## Requisitos

| Herramienta | Versión usada |
|---|---|
| Java (Temurin) | 21.0.11 LTS |
| Node.js | 22.12.0 |
| npm | 10.9.0 |
| Angular CLI | 21.2.4 |
| Ionic CLI | 7.2.1 |
| Android Studio | Ladybug o superior |
| Android SDK | API 33+ |

---

## Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/Juanma7882/push-notification-con-ionic-y-capacitor.git
cd push-notification

# 2. Instalar dependencias
npm install

# 3. Inicializar Capacitor (solo si no existe capacitor.config.ts)
npx cap init
# Name: nombre-de-tu-app
# Package ID: com.tudominio.app
```

Verificar que `capacitor.config.ts` tenga `webDir: 'www'`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'push-notification',
  webDir: 'www',
};

export default config;
```

---

## Flujo de desarrollo

Cada vez que modifiques código Angular/Ionic, seguir este orden:

```bash
# 1. Compilar el proyecto web
ionic build

# 2. Copiar los assets al proyecto nativo
npx cap sync android

# 3. Abrir Android Studio
npx cap open android
```

Desde Android Studio: esperar que indexe → iniciar emulador → presionar **▶ Run**.

> ⚠️ Nunca presionar Run en Android Studio sin haber hecho `ionic build` + `npx cap sync` antes, o los cambios no se van a reflejar.

---

## Primera vez con Android

Si la carpeta `android/` no existe:

```bash
ionic build
npx cap add android
npx cap sync android
npx cap open android
```

---

## Notificaciones

### Cómo funciona

La app tiene dos botones:

- **Mostrar notificación** → muestra un Toast de Ionic (solo dentro de la app)
- **Push notification** → dispara una notificación local nativa de Android con banner heads-up (aparece sobre cualquier pantalla, como WhatsApp)

### Canal de notificación

Para que aparezca el banner heads-up hay que crear un canal con `importance: 5`. Esto se hace en el constructor de `HomePage`:

```typescript
await LocalNotifications.createChannel({
  id: 'canal-mensajes',
  name: 'Mensajes',
  importance: 5,     // IMPORTANCE_HIGH → activa el heads-up banner
  visibility: 1,     // visible en lock screen
  sound: 'default',
  vibration: true,
});
```

> ⚠️ Si cambiás el canal (id, importance, etc.), desinstalá la app del emulador y reinstalá para que Android tome los cambios. Los canales se crean una sola vez por instalación.

### Permisos

En Android 13+ (API 33) es obligatorio pedir permiso explícito para notificaciones. Esto se hace automáticamente al iniciar la app:

```typescript
await LocalNotifications.requestPermissions();
```

Si el usuario deniega el permiso, las notificaciones no van a aparecer. Podés verificarlo en el emulador en **Settings > Apps > [tu app] > Notifications**.

---

## Solución de problemas frecuentes

### Los cambios no se reflejan en el emulador

Seguir el flujo completo:
```bash
ionic build && npx cap sync android
```
Luego en Android Studio: **Build > Clean Project** → **Build > Rebuild Project** → **▶ Run**.

Si persiste: **File > Invalidate Caches > Invalidate and Restart**.

### Error: `android platform has not been added yet`

```bash
# Asegurarse de estar en la raíz del proyecto (donde está package.json)
npx cap add android
```

### Error: `ADB is unresponsive` / `device not found`

El emulador no estaba corriendo cuando se intentó deployar. Solución: iniciar el emulador desde **Device Manager** en Android Studio, esperar que cargue Android completamente, y volver a correr.

### Error: `Missing appId`

Falta el `capacitor.config.ts` o fue borrado. Correr:
```bash
npx cap init
```

### El banner heads-up no aparece

Posibles causas:
- El canal fue creado con `importance` menor a 5. Desinstalar la app y reinstalar.
- El emulador tiene las notificaciones del canal silenciadas. Verificar en **Settings > Apps > [tu app] > Notifications > canal "Mensajes"** que esté en prioridad "Urgent" o "High".
- Se está probando en el browser (`ionic serve`). `LocalNotifications` solo funciona en dispositivo/emulador nativo.

---

## Estructura relevante

```
push-notification/
├── src/
│   └── app/
│       └── home/
│           ├── home.page.html   # template con los 2 botones
│           ├── home.page.scss   # estilos
│           └── home.page.ts     # lógica de notificaciones
├── android/                     # proyecto nativo (generado por Capacitor)
├── www/                         # build de Angular (generado por ionic build)
├── capacitor.config.ts          # config de Capacitor
└── package.json
```

---

## Plugins utilizados

```bash
npm install @capacitor/local-notifications
npx cap sync
```

| Plugin | Versión | Uso |
|---|---|---|
| `@capacitor/local-notifications` | 8.2.0 | Notificaciones nativas heads-up |
| `@capacitor/app` | 8.1.0 | Ciclo de vida de la app |
| `@capacitor/haptics` | 8.0.2 | Vibración |
| `@capacitor/keyboard` | 8.0.3 | Control del teclado nativo |
| `@capacitor/status-bar` | 8.0.2 | Control de la barra de estado |
