import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../theme/ThemeContext';

interface GradientCard3DProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const GradientCard3D: React.FC<GradientCard3DProps> = ({
  children,
  style,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
}) => {
  const { gradientColors, isDark, shadow3D } = useAppTheme();

  const activeColors = colors || gradientColors;

  return (
    <View style={[styles.outerContainer, shadow3D, style]}>
      <LinearGradient
        colors={activeColors}
        start={start}
        end={end}
        style={[
          styles.gradientBody,
          {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
          },
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20,
    overflow: 'visible',
  },
  gradientBody: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
});
