# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
## tnb-mobile


## 🚀 Publicar la app en Expo (Cloud) con EAS

Este proyecto utiliza [Expo Application Services (EAS)](https://docs.expo.dev/eas/) para compilar y distribuir la aplicación en la nube. A continuación se detallan los pasos para preparar, actualizar y construir la app para Android e iOS en el entorno de desarrollo.

```bash
# 1. Verificar información del proyecto
eas project:info

# 2. Precompilar el proyecto
npx expo prebuild

# 3. Configurar EAS Build
eas build:configure

# 4. Publicar actualizaciones OTA (Over-the-Air)
# esto generará los códigos QR para que los usuarios puedan probarlo cualquier momento
eas update --platform android --branch development --message ""
eas update --platform ios --branch development --message ""




## Opcional
# 5. Compilar la app en la nube
eas build --platform android --profile development
eas build --platform ios --profile development
```

### Generar Build (apk e ipa) local (Sin usar los servidores de EAS)
```bash
# 1. Verificar proyecto
eas project:info

# 2. Precompilar (solo si usas prebuild)
npx expo prebuild

# 3. Configurar build
eas build:configure

# 4. Generar APK (para probar)
eas build -p android --profile preview --output-format apk

# 5. Generar IPA (para TestFlight/App Store)
eas build -p ios --profile production
```

