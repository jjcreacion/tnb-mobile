import { Button, Card } from '@/components/common';
import { BillingHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, Platform, StyleSheet, Text, View, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import SideMenu from '../(screens)/SideMenu';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInvoices } from '@/store/slices/invoiceSlice';

// 💡 Tipo Invoice movido aquí para ser usado.
export interface Invoice {
  invoice_id: number;
  fk_user: number;
  invoice_amount: number;
  invoice_status: string; 
  public_link: string;
  invoice_number: string;
  invoice_date: string;
  created_at: string;
  updated_at: string;
}  

// 🚫 ELIMINAMOS los datos mock de Transaction
// interface Transaction { ... }
// const transactions: Transaction[] = [ ... ];


export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const dispatch = useAppDispatch()
  // 1. Obtener la lista de facturas, estado de carga y error desde Redux
  const { invoices, loading, error } = useAppSelector(state => state.invoice);
    
  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

   useEffect(() => {
      dispatch(fetchInvoices())
   }, [dispatch])
  
  // 2. Actualizar el cálculo del balance usando las facturas reales
  const totalBalance = invoices
    .filter(i => i.invoice_status === 'paid') // Asumiendo 'paid' como status de pago
    .reduce((sum, i) => sum + i.invoice_amount, 0);

  // 3. Funciones de acción para los botones
  const handleViewPdf = useCallback((url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleDownloadPdf = useCallback((url: string) => {
    // 💡 Implementación de la lógica de descarga (puede usar Expo FileSystem o RNFS)
    // Por ahora, solo abrimos el enlace como acción de ejemplo
    alert(`Descargando factura desde: ${url}`);
    // Linking.openURL(url); 
  }, []);


  // 4. Nueva función de renderizado para Invoice
  const renderInvoice = ({ item }: { item: Invoice }) => {
    // Mapeamos el estado de la factura a una configuración de ícono/color similar al original
    const getTypeConfig = (status: string) => {
      switch (status) {
        case 'paid':
          return { icon: 'checkmark-circle', color: Theme.colors.success[500] };
        case 'pending':
          return { icon: 'time', color: Theme.colors.warning[500] };
        // Puedes añadir más estados como 'cancelled', 'refunded', etc.
        default:
          return { icon: 'document-text', color: Theme.colors.neutral[500] };
      }
    };

    const config = getTypeConfig(item.invoice_status);

    return (
      <Card variant="outlined" padding="md" style={styles.transactionCard}>
        <View style={styles.transactionContent}>
          {/* Icono de Status */}
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Icon name={config.icon} size={24} color={config.color} />
          </View>

          {/* Detalles de la Factura */}
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceNumber}>
              Factura: <Text style={styles.invoiceNumberValue}>{item.invoice_number}</Text>
            </Text>
            <Text style={styles.invoiceDate}>{item.invoice_date}</Text>
          </View>

          {/* Monto de la Factura */}
          <View style={styles.amountContainer}>
            <Text style={[styles.amountText, { color: config.color }]}>
              ${item.invoice_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* 5. Contenedor de Botones de Acción */}
        <View style={styles.actionButtonsContainer}>
            <Button
                title="Ver PDF"
                variant="outline"
                size="sm"
                icon={<Icon name="open" size={16} color={Theme.colors.primary[500]} />}
                iconPosition="left"
                onPress={() => handleViewPdf(item.public_link)}
                style={styles.actionButton}
            />
            <Button
                title="Descargar"
                size="sm"
                icon={<Icon name="download" size={16} color={Theme.colors.background.primary} />}
                iconPosition="left"
                onPress={() => handleDownloadPdf(item.public_link)}
                style={styles.actionButton}
            />
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {loading ? (
        <Text style={styles.emptyTitle}>Cargando Facturas...</Text>
      ) : error ? (
        <Text style={[styles.emptyTitle, { color: Theme.colors.error[500] }]}>Error al Cargar: {error}</Text>
      ) : (
        <>
          <Icon name="receipt-long" size={80} color={Theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Aún no hay Facturas</Text>
          <Text style={styles.emptyText}>
            Tu historial de facturación aparecerá aquí.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <BillingHeader onMenuPress={handleMenuPress} />

      {/* Balance Card */}
      <Card variant="elevated" padding="lg" style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Gastado</Text>
        <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        <View style={styles.balanceFooter}>
          <Icon name="trending-up" size={16} color={Theme.colors.success[500]} />
          <Text style={styles.balanceFooterText}>Histórico</Text>
        </View>
      </Card>

      {/* Transaction History */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Historial de Facturas</Text>
        <Icon name="funnel" size={20} color={Theme.colors.text.secondary} />
      </View>

      <FlatList
        data={invoices} // 👈 USAR LA LISTA REAL
        renderItem={renderInvoice} // 👈 USAR EL NUEVO RENDERER
        keyExtractor={(item) => item.invoice_id.toString()}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === 'android' && {
            paddingBottom: 70 + insets.bottom + 220,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Estilos existentes) ...
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  
  balanceCard: {
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.primary[50],
    borderWidth: 1,
    borderColor: Theme.colors.primary[100],
  },
  
  balanceLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  
  balanceAmount: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
    marginBottom: Theme.spacing.sm,
  },
  
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  
  balanceFooterText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },
  
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.text.primary,
  },
  
  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 220 : 200,
  },
  
  transactionCard: {
    marginBottom: 12,
  },
  
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.base, // Espacio antes de los botones
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 💡 NUEVOS ESTILOS PARA LA FACTURA (Ajustados de transactionDetails)
  invoiceDetails: {
    flex: 1,
    marginLeft: 12,
  },

  invoiceNumber: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.secondary,
    marginBottom: 2,
  },

  invoiceNumberValue: {
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.text.primary,
  },
  
  invoiceDate: { // Usamos el estilo existente para la fecha
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },
  // 💡 FIN NUEVOS ESTILOS
  
  amountContainer: {
    alignItems: 'flex-end',
  },
  
  amountText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },
  
  // 💡 NUEVO ESTILO para los botones de acción
  actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Theme.spacing.sm, // Espacio entre los botones
      marginTop: Theme.spacing.sm, // Separar del contenido superior
      paddingTop: Theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.neutral[100],
  },

  actionButton: {
    minWidth: 120, // Dar un ancho mínimo para que se vean bien
  },

  // ... (El resto de estilos, como emptyState, etc., se mantienen) ...
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing['3xl'],
    paddingTop: Theme.spacing['5xl'],
  },

  emptyTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.sm,
  },

  emptyText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
  },
});