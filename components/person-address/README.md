# Person Address Module

Este módulo contiene toda la funcionalidad relacionada con la gestión de direcciones de personas en la aplicación TNB.

## Estructura de Archivos

```
person-address/
├── AddressModal.tsx          # Componente modal principal
├── AddressList.tsx           # Componente lista de direcciones
├── AddressForm.tsx           # Componente formulario para nueva dirección
├── CitySelector.tsx          # Componente selector de ciudades
├── StateSelector.tsx         # Componente selector de estados
├── useAddressModal.ts        # Hook personalizado para lógica del modal
├── AddressService.ts         # Servicio para API calls y utilities
├── types.ts                  # Interfaces y tipos TypeScript
├── styles.ts                 # Estilos compartidos
├── index.ts                  # Exportaciones del módulo
└── README.md                 # Documentación del módulo
```

## Componentes

### AddressModal
El componente principal que orquesta todo el flujo de selección y creación de direcciones. Incluye:
- Lista de direcciones existentes
- Formulario para agregar nueva dirección
- Selectores de ciudad y estado
- Animaciones horizontales fluidas entre pantallas

### AddressList
Muestra la lista de direcciones del usuario con:
- Indicador de dirección primaria
- Botón para agregar nueva dirección
- Estado vacío cuando no hay direcciones

### AddressForm
Formulario para crear nueva dirección con campos:
- Dirección principal
- Dirección secundaria (opcional)
- Ciudad (selector)
- Estado (selector)
- Código postal

### CitySelector
Selector de ciudades con:
- Búsqueda en tiempo real
- Filtrado por estado seleccionado
- Lista optimizada con FlatList

### StateSelector
Selector de estados con:
- Búsqueda en tiempo real
- Lista de todos los estados disponibles

## Servicios

### AddressService
Clase estática que contiene:
- **API Calls**: `loadCountries()`, `loadCities()`, `loadStates()`, `saveAddress()`
- **Utilities**: `findUSACountry()`, `filterCitiesByState()`, `filterCitiesBySearch()`, etc.

## Hooks

### useAddressModal
Hook personalizado que encapsula toda la lógica del modal:
- Estado del formulario
- Animaciones entre pantallas
- Manejo de búsquedas
- Validación y guardado

## Tipos

### Interfaces Principales
- `Address`: Dirección del usuario
- `City`: Ciudad disponible
- `State`: Estado disponible
- `AddressFormData`: Datos del formulario
- `AddressModalProps`: Props del modal principal

## Uso

```typescript
import { AddressModal, Address } from './person-address'

// En tu componente
<AddressModal
  isVisible={showModal}
  onClose={() => setShowModal(false)}
  addresses={userAddresses}
  onAddressSelect={handleAddressSelect}
  primaryAddress={primaryAddress}
  onAddNewAddress={() => console.log('Adding new address')}
  onAddressAdded={refreshAddresses}
/>
```

## Características

- **Modularidad**: Cada componente tiene una responsabilidad específica
- **Reutilización**: Componentes pueden ser usados independientemente
- **Mantenibilidad**: Código organizado y bien documentado
- **Performance**: Optimizaciones para listas grandes
- **UX**: Animaciones fluidas y feedback visual
- **Tipado**: Full TypeScript para mayor seguridad

## Animaciones

El modal utiliza un sistema de animaciones basado en:
- `Animated.Value` para transiciones suaves
- Valores de animación: 0 (lista), 1 (formulario), 2 (selectores)
- Interpolaciones con `extrapolate: 'clamp'` para evitar valores fuera de rango
- `requestAnimationFrame` para mejor sincronización
