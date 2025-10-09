import { Theme } from '@/constants/Theme';
import React from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  style,
}) => {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const viewStyles = [
    styles.base,
    styles[size],
    style,
  ];

  // Para Image, necesitamos crear estilos compatibles con ImageStyle
  const imageStyles: StyleProp<ImageStyle> = [
    {
      width: styles[size].width,
      height: styles[size].height,
      borderRadius: styles[size].borderRadius,
    },
    // Solo extraer propiedades compatibles con ImageStyle del style prop
    style && {
      width: (style as any)?.width,
      height: (style as any)?.height,
      borderRadius: (style as any)?.borderRadius,
      opacity: (style as any)?.opacity,
    },
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
  ];

  if (source) {
    return <Image source={source} style={imageStyles} />;
  }

  return (
    <View style={viewStyles}>
      <Text style={textStyles}>{name ? getInitials(name) : '?'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  sm: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  md: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  lg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  xl: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  text: {
    color: Theme.colors.primary[700],
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  smText: {
    fontSize: Theme.typography.fontSize.sm,
  },

  mdText: {
    fontSize: Theme.typography.fontSize.base,
  },

  lgText: {
    fontSize: Theme.typography.fontSize.xl,
  },

  xlText: {
    fontSize: Theme.typography.fontSize['2xl'],
  },
});
