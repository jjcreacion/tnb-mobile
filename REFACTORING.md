# Refactorización del HomeScreen

## Resumen de Cambios

Se refactorizó completamente el archivo `app/(tabs)/index.tsx` que originalmente tenía **1014 líneas** en un solo archivo, dividiéndolo en múltiples componentes modulares y implementando Redux Toolkit para la gestión de estado.

## Estructura Nueva

### 📁 Carpetas Creadas

```
├── types/                          # Tipos TypeScript centralizados
│   ├── user.types.ts
│   ├── campaign.types.ts
│   ├── category.types.ts
│   ├── address.types.ts
│   └── index.ts
│
├── services/api/                   # Servicios API centralizados
│   ├── apiClient.ts               # Cliente HTTP base
│   ├── userService.ts
│   ├── campaignService.ts
│   ├── categoryService.ts
│   ├── addressService.ts
│   ├── settingsService.ts
│   └── index.ts
│
├── store/                          # Redux Store
│   ├── index.ts                   # Configuración principal
│   ├── hooks.ts                   # Hooks tipados
│   └── slices/
│       ├── userSlice.ts           # Estado de usuario
│       ├── addressSlice.ts        # Estado de direcciones
│       ├── campaignSlice.ts       # Estado de campañas
│       ├── categorySlice.ts       # Estado de categorías
│       └── uiSlice.ts             # Estado de UI (modals, search, etc)
│
├── components/home/                # Componentes del Home
│   ├── HomeHeader/
│   │   ├── index.tsx
│   │   └── styles.ts
│   ├── AddressSelector/
│   │   ├── index.tsx
│   │   └── styles.ts
│   ├── CampaignCarousel/
│   │   ├── index.tsx
│   │   ├── CampaignCard.tsx
│   │   └── styles.ts
│   ├── ServicesExplorer/
│   │   ├── index.tsx
│   │   ├── ServiceCard.tsx
│   │   └── styles.ts
│   └── index.ts
│
└── hooks/home/                     # Custom hooks
    └── useReferralReward.ts
```

## Comparación Antes/Después

### Antes
```
app/(tabs)/index.tsx                1014 líneas
```

### Después
```
app/(tabs)/index.tsx                ~230 líneas (orquestación principal)

Componentes:
  components/home/HomeHeader/        ~90 líneas
  components/home/AddressSelector/   ~65 líneas
  components/home/CampaignCarousel/  ~150 líneas
  components/home/ServicesExplorer/  ~180 líneas

Redux Slices:
  store/slices/userSlice.ts          ~95 líneas
  store/slices/addressSlice.ts       ~130 líneas
  store/slices/campaignSlice.ts      ~60 líneas
  store/slices/categorySlice.ts      ~50 líneas
  store/slices/uiSlice.ts            ~90 líneas

API Services:
  services/api/ (7 archivos)         ~250 líneas

Types:
  types/ (5 archivos)                ~120 líneas

Total: ~1470 líneas distribuidas en ~30 archivos modulares
```

## Tecnologías Implementadas

### Redux Toolkit
- ✅ Gestión de estado centralizada
- ✅ Redux Persist con AsyncStorage
- ✅ createAsyncThunk para operaciones asíncronas
- ✅ Immer integrado (mutaciones inmutables)
- ✅ Typed hooks (useAppDispatch, useAppSelector)

### Optimizaciones de Rendimiento
- ✅ React.memo en todos los componentes
- ✅ useCallback para todos los handlers
- ✅ useMemo para filtrado de categorías
- ✅ Separación de concerns

## Estados Manejados

### 1. User State (userSlice)
- userId
- userName
- userBalance
- userData

### 2. Address State (addressSlice)
- addresses[]
- primaryAddress
- cities[]
- states[]
- loading/error

### 3. Campaign State (campaignSlice)
- campaigns[]
- loading/error

### 4. Category State (categorySlice)
- categories[]
- loading/error

### 5. UI State (uiSlice)
- isMenuVisible
- isSearchVisible
- serviceSearchQuery
- isRequestModalVisible
- selectedServiceData
- isCampaignModalVisible
- selectedCampaignData
- isAddressModalVisible
- referralReward

## API Endpoints Centralizados

Todos los endpoints ahora están centralizados en `services/api/`:

```typescript
// User
GET /user/findOne/:userId

// Campaigns
GET /mobile-campaigns/active
POST /mobile-campaigns/:id/express-interest

// Categories
GET /category/findAll

// Addresses
GET /country_city/findAll
GET /state/findAll
GET /country/findAll
PATCH /person-address

// Settings
GET /app-settings/referral_reward_amount
```

## Componentes Creados

### 1. HomeHeader
Maneja el header con gradiente, logo, botones de balance y referral reward.

**Props:**
- onMenuPress: () => void
- referralReward: string
- userBalance: number | null

### 2. AddressSelector
Muestra y permite seleccionar la dirección primaria de servicio.

**Props:**
- primaryAddress: Address | null
- addressCount: number
- onPress: () => void

### 3. CampaignCarousel
Carrusel automático de campañas con FlatList horizontal.

**Props:**
- campaigns: Campaign[]
- loading: boolean
- error: string | null
- onCampaignPress: (campaign) => void
- apiBaseUrl: string

### 4. ServicesExplorer
Lista de servicios con búsqueda filtrada.

**Props:**
- categories: Category[]
- loading: boolean
- error: string | null
- searchQuery: string
- isSearchVisible: boolean
- onServicePress: (category) => void
- onToggleSearch: () => void
- onSearchChange: (text) => void
- apiBaseUrl: string

## Migrations Necesarias

### 1. Provider Setup
El Redux Provider fue agregado en `app/_layout.tsx`:

```tsx
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    {/* App content */}
  </PersistGate>
</Provider>
```

## Backup

El archivo original fue respaldado en:
```
app/(tabs)/index.backup.tsx
```

## Dependencias Agregadas

```json
{
  "@reduxjs/toolkit": "^2.9.0",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0"
}
```

## Testing

Para probar los cambios:

```bash
# Limpiar caché
npx expo start -c

# Ejecutar en iOS
npx expo start --ios

# Ejecutar en Android
npx expo start --android
```

## Beneficios de la Refactorización

1. **Mantenibilidad**: Código organizado en módulos pequeños y específicos
2. **Reutilización**: Componentes y servicios reutilizables
3. **Testing**: Fácil de testear componentes aislados
4. **Performance**: Optimizado con React.memo y useCallback
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades
6. **Type Safety**: TypeScript strict con tipos centralizados
7. **Estado Global**: Accesible desde cualquier componente
8. **DevTools**: Redux DevTools para debugging
9. **Persistencia**: Estado de usuario persistido automáticamente

## Próximos Pasos Sugeridos

1. ✅ Implementar tests unitarios para slices
2. ✅ Implementar tests de componentes con React Testing Library
3. ✅ Agregar error boundaries
4. ✅ Implementar retry logic en API calls
5. ✅ Agregar loading skeletons
6. ✅ Implementar offline support completo

## Compatibilidad

- ✅ Compatible con Expo SDK 54
- ✅ Compatible con React Native 0.81.4
- ✅ Compatible con TypeScript 5.3.3
- ✅ Compatible con iOS y Android
- ✅ Sin breaking changes en funcionalidad
