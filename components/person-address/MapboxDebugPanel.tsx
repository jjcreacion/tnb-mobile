/**
 * Mapbox Debug Panel
 * Development tool for monitoring Mapbox integration
 */

import React, { useEffect, useState } from 'react'
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import type { MapboxTelemetry } from './mapbox'
import { MAPBOX_CONFIG, isMapboxAvailable, mapboxSearchService } from './mapbox'
import { addressStyles } from './styles'

interface MapboxDebugPanelProps {
  isVisible: boolean
  onClose: () => void
}

export const MapboxDebugPanel: React.FC<MapboxDebugPanelProps> = ({ isVisible, onClose }) => {
  const [telemetryData, setTelemetryData] = useState<MapboxTelemetry[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isVisible) {
      const data = mapboxSearchService.getTelemetryData()
      setTelemetryData(data)
    }
  }, [isVisible, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleClearData = () => {
    mapboxSearchService.clearTelemetryData()
    setTelemetryData([])
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'search': return 'search'
      case 'selection': return 'touch-app'
      case 'error': return 'error'
      case 'fallback': return 'edit'
      default: return 'info'
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'search': return '#007AFF'
      case 'selection': return '#34C759'
      case 'error': return '#FF3B30'
      case 'fallback': return '#FF9500'
      default: return '#8E8E93'
    }
  }

  const renderTelemetryItem = (item: MapboxTelemetry, index: number) => (
    <View key={index} style={[addressStyles.telemetryItem, { borderLeftColor: getEventColor(item.eventType) }]}>
      <View style={addressStyles.telemetryHeader}>
        <Icon name={getEventIcon(item.eventType)} size={16} color={getEventColor(item.eventType)} />
        <Text style={addressStyles.telemetryEventType}>{item.eventType.toUpperCase()}</Text>
        <Text style={addressStyles.telemetryTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      
      {item.query && (
        <Text style={addressStyles.telemetryText}>Query: "{item.query}"</Text>
      )}
      
      {item.resultCount !== undefined && (
        <Text style={addressStyles.telemetryText}>Results: {item.resultCount}</Text>
      )}
      
      {item.responseTime && (
        <Text style={addressStyles.telemetryText}>Response: {item.responseTime}ms</Text>
      )}
      
      {item.errorMessage && (
        <Text style={[addressStyles.telemetryText, { color: '#FF3B30' }]}>
          Error: {item.errorMessage}
        </Text>
      )}
      
      {item.selectedSuggestionIndex !== undefined && (
        <Text style={addressStyles.telemetryText}>
          Selected: #{item.selectedSuggestionIndex}
        </Text>
      )}
    </View>
  )

  const calculateStats = () => {
    const total = telemetryData.length
    const searches = telemetryData.filter(d => d.eventType === 'search').length
    const selections = telemetryData.filter(d => d.eventType === 'selection').length
    const errors = telemetryData.filter(d => d.eventType === 'error').length
    const fallbacks = telemetryData.filter(d => d.eventType === 'fallback').length
    
    const avgResponseTime = telemetryData
      .filter(d => d.responseTime)
      .reduce((acc, d) => acc + (d.responseTime || 0), 0) / searches || 0

    return { total, searches, selections, errors, fallbacks, avgResponseTime }
  }

  const stats = calculateStats()

  if (!__DEV__) {
    return null // Only show in development
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={addressStyles.debugContainer}>
        {/* Header */}
        <View style={addressStyles.debugHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={addressStyles.debugTitle}>Mapbox Debug Panel</Text>
          <TouchableOpacity onPress={handleRefresh} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Configuration Status */}
        <View style={addressStyles.debugSection}>
          <Text style={addressStyles.debugSectionTitle}>Configuration</Text>
          <View style={addressStyles.debugConfigRow}>
            <Text style={addressStyles.debugConfigLabel}>Mapbox Available:</Text>
            <Text style={[addressStyles.debugConfigValue, { color: isMapboxAvailable() ? '#34C759' : '#FF3B30' }]}>
              {isMapboxAvailable() ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={addressStyles.debugConfigRow}>
            <Text style={addressStyles.debugConfigLabel}>Enabled:</Text>
            <Text style={addressStyles.debugConfigValue}>{MAPBOX_CONFIG.enabled ? 'Yes' : 'No'}</Text>
          </View>
          <View style={addressStyles.debugConfigRow}>
            <Text style={addressStyles.debugConfigLabel}>Debounce:</Text>
            <Text style={addressStyles.debugConfigValue}>{MAPBOX_CONFIG.debounceMs}ms</Text>
          </View>
          <View style={addressStyles.debugConfigRow}>
            <Text style={addressStyles.debugConfigLabel}>Min Chars:</Text>
            <Text style={addressStyles.debugConfigValue}>{MAPBOX_CONFIG.minChars}</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={addressStyles.debugSection}>
          <Text style={addressStyles.debugSectionTitle}>Statistics</Text>
          <View style={addressStyles.debugStatsGrid}>
            <View style={addressStyles.debugStatItem}>
              <Text style={addressStyles.debugStatValue}>{stats.searches}</Text>
              <Text style={addressStyles.debugStatLabel}>Searches</Text>
            </View>
            <View style={addressStyles.debugStatItem}>
              <Text style={addressStyles.debugStatValue}>{stats.selections}</Text>
              <Text style={addressStyles.debugStatLabel}>Selections</Text>
            </View>
            <View style={addressStyles.debugStatItem}>
              <Text style={[addressStyles.debugStatValue, { color: '#FF3B30' }]}>{stats.errors}</Text>
              <Text style={addressStyles.debugStatLabel}>Errors</Text>
            </View>
            <View style={addressStyles.debugStatItem}>
              <Text style={[addressStyles.debugStatValue, { color: '#FF9500' }]}>{stats.fallbacks}</Text>
              <Text style={addressStyles.debugStatLabel}>Fallbacks</Text>
            </View>
          </View>
          {stats.avgResponseTime > 0 && (
            <Text style={addressStyles.debugAvgResponse}>
              Avg Response: {Math.round(stats.avgResponseTime)}ms
            </Text>
          )}
        </View>

        {/* Telemetry Data */}
        <View style={[addressStyles.debugSection, { flex: 1 }]}>
          <View style={addressStyles.debugSectionHeader}>
            <Text style={addressStyles.debugSectionTitle}>Telemetry ({telemetryData.length})</Text>
            <TouchableOpacity onPress={handleClearData} style={addressStyles.debugClearButton}>
              <Text style={addressStyles.debugClearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={addressStyles.debugTelemetryList} showsVerticalScrollIndicator={false}>
            {telemetryData.length === 0 ? (
              <Text style={addressStyles.debugEmptyState}>No telemetry data available</Text>
            ) : (
              telemetryData.slice().reverse().map(renderTelemetryItem) // Show newest first
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
