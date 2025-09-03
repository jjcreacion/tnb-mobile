import React from 'react'
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { RadioButton } from './RadioButton'

export interface RadioOption {
  value: any
  label: string
  disabled?: boolean
}

interface RadioGroupProps {
  options: RadioOption[]
  selectedValue: any
  onValueChange: (value: any) => void
  size?: number
  selectedColor?: string
  unselectedColor?: string
  style?: ViewStyle
  optionStyle?: ViewStyle
  labelStyle?: TextStyle
  disabled?: boolean
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedValue,
  onValueChange,
  size = 24,
  selectedColor = '#4CAF50',
  unselectedColor = '#ccc',
  style,
  optionStyle,
  labelStyle,
  disabled = false,
}) => {
  return (
    <View style={style}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={`${option.value}_${index}`}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: index < options.length - 1 ? 12 : 0,
            },
            optionStyle,
          ]}
          onPress={() => onValueChange(option.value)}
          disabled={disabled || option.disabled}
          activeOpacity={0.7}
        >
          <RadioButton
            selected={selectedValue === option.value}
            size={size}
            selectedColor={selectedColor}
            unselectedColor={unselectedColor}
          />
          <Text
            style={[
              {
                marginLeft: 12,
                fontSize: 16,
                color: disabled || option.disabled ? '#999' : '#333',
              },
              labelStyle,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
