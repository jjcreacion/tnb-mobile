import React, { useState } from 'react'
import { Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { COUNTRY_CODES, type CountryCodeOption } from '../../types/registration'
import { Theme } from '../../constants/Theme'

interface CountryCodeSelectorProps {
  selectedCode: string
  onSelect: (code: string) => void
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCode,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  const selectedOption = COUNTRY_CODES.find((c) => c.value === selectedCode) || COUNTRY_CODES[0]

  const handleSelect = (option: CountryCodeOption) => {
    onSelect(option.value)
    setModalVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flagText}>{selectedOption.flag}</Text>
        <Text style={styles.codeText}>{selectedOption.value}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {COUNTRY_CODES.map((option) => (
                <TouchableOpacity
                  key={option.value + option.label}
                  style={[
                    styles.optionItem,
                    selectedCode === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionFlag}>{option.flag}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionValue}>{option.value}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: 8,
    backgroundColor: Theme.colors.background.primary,
    minWidth: 100,
  },
  flagText: {
    fontSize: 20,
    marginRight: 6,
  },
  codeText: {
    fontSize: 16,
    color: Theme.colors.neutral[900],
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
  },
  closeButton: {
    fontSize: 24,
    color: Theme.colors.neutral[600],
    fontWeight: '400',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  optionItemSelected: {
    backgroundColor: Theme.colors.primary[50],
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.neutral[900],
  },
  optionValue: {
    fontSize: 16,
    color: Theme.colors.neutral[600],
    fontWeight: '500',
  },
})
