import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
}) => {
  const { theme, isDark, shadow3D } = useAppTheme();

  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
          {title.toUpperCase()}
        </Text>
      ) : null}

      <View
        style={[
          styles.card,
          shadow3D,
          {
            backgroundColor: theme.surfacePrimary,
            borderColor: isDark ? theme.borderDefault : 'rgba(255, 255, 255, 0.9)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
          },
        ]}
      >
        {children}
      </View>

      {description ? (
        <Text style={[styles.footerText, { color: theme.textTertiary }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 6,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    marginLeft: 6,
  },
});
