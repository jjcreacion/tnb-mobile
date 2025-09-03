import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

interface RadioButtonProps {
  selected: boolean
  size?: number
  selectedColor?: string
  unselectedColor?: string
  style?: ViewStyle
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  size = 24,
  selectedColor = '#4CAF50',
  unselectedColor = '#ccc',
  style,
}) => {
  const outerSize = size
  const innerSize = size * 0.5
  const borderWidth = 2

  return (
    <View
      style={[
        {
          width: outerSize,
          height: outerSize,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.outerCircle,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderWidth: borderWidth,
            borderColor: selected ? selectedColor : unselectedColor,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.innerCircle,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                backgroundColor: selectedColor,
              },
            ]}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    // El círculo interior se posiciona automáticamente al centro
  },
})
