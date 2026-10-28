import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  disabled?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  badge,
  badgeColor,
  badgeTextColor,
  rightElement,
  onPress,
  isLast = false,
  disabled = false,
}) => {
  const { theme } = useAppTheme();

  const content = (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Squircle Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>

        {/* Content text */}
        <View style={styles.textContainer}>
          <View style={styles.titleLine}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
            {badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: badgeColor || theme.surfaceSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: badgeTextColor || theme.textSecondary },
                  ]}
                >
                  {badge}
                </Text>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right Element or default chevron */}
        {rightElement !== undefined ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.textTertiary}
            style={styles.chevron}
          />
        ) : null}
      </View>

      {!isLast && (
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.divider, marginLeft: 56 },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  rightElement: {
    marginLeft: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chevron: {
    marginLeft: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
