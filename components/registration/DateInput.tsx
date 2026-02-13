import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Animated, Modal, Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import DatePicker from 'react-native-date-picker'
import { FontAwesome } from '@expo/vector-icons'
import { Theme } from '../../constants/Theme'

export interface DateInputRef {
  open: () => void
}

interface DateInputProps {
  label: string
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  error?: string
  required?: boolean
  onPickerToggle?: (visible: boolean) => void
  onDismiss?: () => void
}

/**
 * Parse a YYYY-MM-DD string to a local Date object
 * Avoids timezone issues by using Date constructor with separate arguments
 */
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns the maximum allowed birth date (18 years ago from today).
 * Anyone born after this date is under 18 and cannot register.
 */
const getMaxBirthDate = (): Date => {
  const today = new Date()
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
}

const TOAST_DURATION = 3000
const TOAST_FADE_IN = 300
const TOAST_FADE_OUT = 400

export const DateInput = forwardRef<DateInputRef, DateInputProps>(({
  label,
  value,
  onChange,
  error,
  required = false,
  onPickerToggle,
  onDismiss,
}, ref) => {
  const [showPicker, setShowPicker] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const toastOpacity = useRef(new Animated.Value(0)).current
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Maximum selectable date: 18 years ago from today
  const maximumDate = getMaxBirthDate()

  // Convert string to Date object using local date to avoid timezone issues
  // Default to 25 years ago for birth date if no value is provided
  const dateValue = value
    ? parseLocalDate(value)
    : new Date(new Date().getFullYear() - 25, 0, 15) // January 15, 25 years ago

  // Temporary date for picker (commit only on Done)
  const [tempDate, setTempDate] = useState<Date>(dateValue)

  // Show toast when the user scrolls to the maximum date boundary
  useEffect(() => {
    if (!showPicker) return
    const isAtBoundary =
      tempDate.getFullYear() === maximumDate.getFullYear() &&
      tempDate.getMonth() === maximumDate.getMonth() &&
      tempDate.getDate() === maximumDate.getDate()
    if (isAtBoundary) {
      triggerToast()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempDate, showPicker])

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const triggerToast = () => {
    // Clear any existing toast animation
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastOpacity.setValue(0)

    setShowToast(true)
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: TOAST_FADE_IN,
      useNativeDriver: true,
    }).start()

    toastTimerRef.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: TOAST_FADE_OUT,
        useNativeDriver: true,
      }).start(() => setShowToast(false))
    }, TOAST_DURATION)
  }

  useImperativeHandle(ref, () => ({
    open: () => {
      setTempDate(dateValue)
      setShowPicker(true)
      onPickerToggle?.(true)
    },
  }))

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date'
    const date = parseLocalDate(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleTempDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate)
    }
  }

  const handlePress = () => {
    setTempDate(dateValue)
    setShowPicker(true)
    onPickerToggle?.(true)
  }

  const handleConfirm = () => {
    onChange(formatDateToString(tempDate))
    setShowPicker(false)
    onPickerToggle?.(false)
    onDismiss?.()
  }

  const handleCancel = () => {
    setShowPicker(false)
    onPickerToggle?.(false)
    onDismiss?.()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.pickerButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={[styles.pickerButton, styles.pickerConfirm]}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Age restriction toast */}
            {showToast && (
              <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]} pointerEvents="none">
                <FontAwesome name="info-circle" size={16} color={Theme.colors.primary[500]} />
                <Text style={styles.toastText}>You must be at least 18 years old to request a service</Text>
              </Animated.View>
            )}

            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleTempDateChange}
                maximumDate={maximumDate}
                textColor={Theme.colors.neutral[900]}
              />
            ) : (
              <DatePicker
                date={tempDate}
                onDateChange={setTempDate}
                mode="date"
                maximumDate={maximumDate}
                {...({ androidVariant: 'iosClone' } as any)}
                theme="light"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
    marginBottom: 8,
  },
  required: {
    color: Theme.colors.error[500],
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.colors.background.primary,
  },
  inputError: {
    borderColor: Theme.colors.error[500],
  },
  inputText: {
    fontSize: 16,
    color: Theme.colors.neutral[900],
  },
  placeholder: {
    color: Theme.colors.neutral[400],
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error[500],
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pickerContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  pickerButton: {
    fontSize: 16,
    color: Theme.colors.primary[500],
  },
  pickerConfirm: {
    fontWeight: '600',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.primary[200],
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.primary[700],
  },
})
