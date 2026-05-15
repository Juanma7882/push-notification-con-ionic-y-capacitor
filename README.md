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
# Name: ionic-app-base
# Package ID: com.example.app
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
<img width="1934" height="769" alt="Captura de pantalla 2026-05-15 165201" src="https://github.com/user-attachments/assets/ed16ef71-9e40-4f70-b0a6-fc28f6d4036d" />


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

# ¿Por qué necesitamos Java?

Gradle (el sistema de build de Android) tiene requisitos específicos de compatibilidad con Java.

Cada versión de Gradle soporta un rango determinado de versiones de Java:

| Gradle | Java mínimo | Java máximo recomendado |
|---|---|---|
| 8.x | Java 8 | Java 21 |
| 7.x | Java 8 | Java 17 |
| 6.x | Java 8 | Java 15 |

En este proyecto usamos **Java 21** porque es compatible con **Gradle 8.x**, que es la versión utilizada por Capacitor moderno.

Si usás Java 22, 23 o superior, el build puede fallar porque Gradle todavía no tiene soporte completo para esas versiones.

---

# Cadena de herramientas

```text
Android Studio
    └── Gradle (build system)
            └── necesita Java en un rango específico
                    └── compila el código nativo Java/Kotlin de Capacitor
```

---

# ¿Cómo interactúan Ionic, Angular y Capacitor?

## Flujo general

```text
┌─────────────────────────────────────────────────────────────────┐
│                         DESARROLLO                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Angular + Ionic    →    ionic build    →    Carpeta www/     │
│   (TypeScript/HTML)        (compila)         (HTML/CSS/JS)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                         CAPACITOR                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   www/    →    npx cap sync    →    android/app/src/main/assets│
│   (web)          (copia)                     /public/           │
│                                                                 │
│   Capa de puente:                                               │
│   - Expone APIs nativas (notificaciones, cámara, GPS)          │
│   - Convierte llamadas JS → Java (Android) / Swift (iOS)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PROYECTO NATIVO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   android/                                                      │
│   ├── app/src/main/java/    (código nativo Kotlin/Java)        │
│   ├── app/src/main/assets/  (tu app web compilada)             │
│   └── build.gradle          (configuración de Gradle + Java)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ANDROID STUDIO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Gradle (Java)    →    compila    →    APK / AAB              │
│                          (JDK)                                  │
│                                                                 │
│   Emulador / Dispositivo físico → App instalada corriendo      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Explicación detallada

## 1. Angular

Angular maneja la lógica de la aplicación y la interfaz de usuario.

Todo se escribe en:

- TypeScript
- HTML
- SCSS

---

## 2. Ionic

Ionic proporciona:

- Componentes visuales (`ion-button`, `ion-toast`, etc.)
- Estilos móviles
- Herramientas de compilación

Cuando ejecutás:

```bash
ionic build
```

Ionic:

1. Ejecuta Angular CLI
2. Compila TypeScript → JavaScript
3. Genera archivos estáticos
4. Guarda todo en `www/`

---

## 3. Capacitor

Capacitor funciona como un puente entre la aplicación web y Android/iOS.

### Funciones principales

- Copia `www/` al proyecto Android
- Expone APIs nativas
- Traduce llamadas JavaScript → código nativo

Ejemplo:

```ts
LocalNotifications.schedule()
```

Capacitor convierte esa llamada en código Java/Kotlin que utiliza el sistema de notificaciones de Android.

### Comando importante

```bash
npx cap sync android
```

Este comando:

- copia los archivos web
- actualiza plugins nativos
- sincroniza el proyecto Android

---

## 4. Gradle + Java

Gradle es el sistema de build de Android.

### Responsabilidades

- Leer `build.gradle`
- Descargar dependencias
- Compilar código Java/Kotlin
- Generar el APK final

Java JDK es necesario porque Gradle y Android usan Java internamente para compilar el proyecto nativo.

---

# Flujo típico de desarrollo

## Compilar la aplicación web

```bash
ionic build
```

---

## Sincronizar con Android

```bash
npx cap sync android
```

---

## Ejecutar en emulador/dispositivo

```bash
npx cap run android
```

---

# Notificaciones locales

Instalación del plugin:

```bash
npm install @capacitor/local-notifications
```

Sincronizar:

```bash
npx cap sync android
```

Ejemplo:

```ts
await LocalNotifications.schedule({
  notifications: [
    {
      id: 1,
      title: 'Nueva notificación 🚀',
      body: 'Hola desde Ionic + Capacitor',
      schedule: {
        at: new Date(Date.now() + 1000)
      }
    }
  ]<img width="1219" height="1053" alt="Captura de pantalla 2026-05-15 170930" src="https://github.com/user-attachments/assets/1dbded16-54a7-4c5d-a212-3428bed8a4a3" />

});
```

---

# Resultado final

El resultado final es un:

- APK
- AAB

que puede instalarse en:

- emulador Android
- dispositivo físico
- Google Play Store



## Botones importantes

- El botón **Play ▶** ejecuta la aplicación.
- Podés reiniciar o detener el emulador desde Android Studio.
- El celular/emulador y la aplicación son cosas diferentes:
  - El emulador puede iniciarse desde consola.
  - La app se ejecuta desde el botón **Play ▶** de Android Studio.

<div align="center">

<table>
<tr>
<td align="center">
<img width="475" alt="Captura 1" src="https://github.com/user-attachments/assets/7a62550b-fdf5-4c3e-991c-0af8ac5519bd" />
</td>

<td align="center">
<img width="475" alt="Captura 2" src="https://github.com/user-attachments/assets/217b9834-a2d7-4f35-aaaf-327dd0048555" />
</td>
</tr>

<tr>
<td colspan="2" align="center">
<img width="900" alt="Captura 3" src="https://github.com/user-attachments/assets/03f04559-9966-4e6d-b20a-c99bc891f626" />
</td>
</tr>
</table>

</div>



