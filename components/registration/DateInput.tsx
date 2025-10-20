import React, { useState } from 'react'
import { Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Theme } from '../../constants/Theme'

interface DateInputProps {
  label: string
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  error?: string
  required?: boolean
}

/**
 * Parse a YYYY-MM-DD string to a local Date object
 * Avoids timezone issues by using Date constructor with separate arguments
 */
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
}) => {
  const [showPicker, setShowPicker] = useState(false)

  // Convert string to Date object using local date to avoid timezone issues
  // Default to 25 years ago for birth date if no value is provided
  const dateValue = value
    ? parseLocalDate(value)
    : new Date(new Date().getFullYear() - 25, 0, 15) // January 15, 25 years ago

  // Format date for display using local date to avoid timezone issues
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date'
    const date = parseLocalDate(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }

    if (selectedDate) {
      // Format as YYYY-MM-DD
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    }
  }

  const handlePress = () => {
    setShowPicker(true)
  }

  const handleIOSConfirm = () => {
    // Save the current date value if no value was previously set
    if (!value) {
      const year = dateValue.getFullYear()
      const month = String(dateValue.getMonth() + 1).padStart(2, '0')
      const day = String(dateValue.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    }
    setShowPicker(false)
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

      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.iosPickerButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={[styles.iosPickerButton, styles.iosPickerConfirm]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor={Theme.colors.neutral[900]}
              />
            </View>
          ) : (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
    </View>
  )
}

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
  iosPickerContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  iosPickerButton: {
    fontSize: 16,
    color: Theme.colors.primary[500],
  },
  iosPickerConfirm: {
    fontWeight: '600',
  },
})
