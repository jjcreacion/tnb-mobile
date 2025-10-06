# Checklist de Validación - Refactorización HomeScreen

## ✅ Funcionalidades Core

### Header
- [ ] Se muestra el logo de TNB
- [ ] Botón de menú abre el SideMenu
- [ ] Botón "Get $XX" navega a ShareAndEarn
- [ ] Botón Balance muestra el balance correcto del usuario
- [ ] Botón Balance navega a Billing

### Dirección de Servicio
- [ ] Muestra dirección primaria correctamente
- [ ] Si no hay dirección primaria, muestra mensaje apropiado
- [ ] Al hacer tap abre el AddressModal
- [ ] Contador de direcciones es correcto
- [ ] Cambiar dirección primaria funciona
- [ ] Agregar nueva dirección actualiza la lista

### Carrusel de Campañas
- [ ] Carga campañas activas desde API
- [ ] Muestra loading indicator mientras carga
- [ ] Muestra mensaje de error si falla
- [ ] Auto-scroll cada 5 segundos
- [ ] Manual scroll funciona
- [ ] Tap en campaña abre CampaignModal
- [ ] Express interest se registra correctamente
- [ ] Muestra teléfono y whatsapp en modal

### Búsqueda de Servicios
- [ ] Ícono de búsqueda toggle el input
- [ ] Input de búsqueda aparece con animación
- [ ] Búsqueda filtra por nombre de servicio
- [ ] Búsqueda filtra por descripción
- [ ] Cerrar búsqueda limpia el query
- [ ] Muestra mensaje cuando no hay resultados

### Lista de Servicios
- [ ] Carga categorías desde API
- [ ] Muestra loading indicator mientras carga
- [ ] Muestra mensaje de error si falla
- [ ] Imágenes de servicios cargan correctamente
- [ ] Tap en servicio abre RequestModal
- [ ] RequestModal recibe categoría seleccionada
- [ ] RequestModal recibe dirección primaria
- [ ] RequestModal recibe cities y states

## ✅ Estado Redux

### User State
- [ ] userId se carga de AsyncStorage
- [ ] userName se muestra correctamente
- [ ] userBalance se actualiza
- [ ] userData completa se almacena
- [ ] Estado persiste después de reload

### Address State
- [ ] addresses[] se cargan correctamente
- [ ] primaryAddress se identifica
- [ ] cities[] disponibles
- [ ] states[] disponibles
- [ ] updatePrimaryAddress funciona
- [ ] loadUserAddresses se dispara correctamente

### Campaign State
- [ ] campaigns[] se cargan desde API
- [ ] loading state funciona
- [ ] error state funciona
- [ ] expressInterest se ejecuta

### Category State
- [ ] categories[] se cargan desde API
- [ ] loading state funciona
- [ ] error state funciona

### UI State
- [ ] isMenuVisible controla SideMenu
- [ ] isSearchVisible controla búsqueda
- [ ] serviceSearchQuery filtra servicios
- [ ] modals se abren/cierran correctamente
- [ ] referralReward se actualiza desde API

## ✅ Performance

- [ ] No re-renders innecesarios
- [ ] Scroll suave en listas
- [ ] Transiciones fluidas
- [ ] Carga de imágenes optimizada
- [ ] No memory leaks

## ✅ API Calls

- [ ] GET /user/findOne/:userId
- [ ] GET /mobile-campaigns/active
- [ ] POST /mobile-campaigns/:id/express-interest
- [ ] GET /category/findAll
- [ ] GET /country_city/findAll
- [ ] GET /state/findAll
- [ ] PATCH /person-address
- [ ] GET /app-settings/referral_reward_amount

## ✅ TypeScript

- [ ] No errores de compilación
- [ ] Todos los tipos correctos
- [ ] Props correctamente tipados
- [ ] No uso de 'any' innecesario

## ✅ Navegación

- [ ] Push a ShareAndEarn funciona
- [ ] Push a Billing funciona
- [ ] Todos los modals se abren/cierran

## ✅ Compatibilidad

- [ ] Funciona en iOS
- [ ] Funciona en Android
- [ ] Compatible con Expo Go
- [ ] Compatible con development build

## ✅ Error Handling

- [ ] Errores de red se manejan
- [ ] Errores de API se muestran
- [ ] Alerts apropiados para usuarios
- [ ] Console logs para debugging

## 🔄 Testing Commands

```bash
# Verificar TypeScript
npx tsc --noEmit

# Limpiar y ejecutar
npx expo start -c

# iOS
npx expo start --ios

# Android
npx expo start --android
```

## 📝 Notas Adicionales

- Backup del código original: `app/(tabs)/index.backup.tsx`
- Documentación completa: `REFACTORING.md`
- Verificar que AsyncStorage tenga userId antes de testear
