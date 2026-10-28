import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmirateCode } from '../types/parking';

interface LicensePlateViewProps {
  emirateCode: EmirateCode;
  plateCode: string;
  plateNumber: string;
  scale?: number;
  showShadow?: boolean;
}

export const LicensePlateView: React.FC<LicensePlateViewProps> = ({
  emirateCode,
  plateCode,
  plateNumber,
  scale = 1.0,
  showShadow = true,
}) => {
  const displayCode = plateCode.trim().toUpperCase() || 'A';
  const displayNumber = plateNumber.trim() || '12345';

  // Base dimensions (standard 160 x 78 scaled)
  const baseWidth = 164 * scale;
  const baseHeight = 80 * scale;

  return (
    <View
      style={[
        styles.plateContainer,
        {
          width: baseWidth,
          height: baseHeight,
          borderRadius: 8 * scale,
        },
        showShadow && styles.plateShadow,
      ]}
    >
      {/* Subtle Metallic Corner Rivets */}
      <View style={[styles.rivet, styles.rivetTopLeft, { transform: [{ scale }] }]} />
      <View style={[styles.rivet, styles.rivetTopRight, { transform: [{ scale }] }]} />

      {/* ─── 1. ABU DHABI: Authentic Red Category Box + Qasr Al Hosn Crest ─── */}
      {emirateCode === 'AUH' && (
        <View style={styles.auhContainer}>
          {/* Left Red Category Band with Watchtower Fortress */}
          <View style={[styles.auhRedBand, { width: 44 * scale }]}>
            <Ionicons name="business" size={14 * scale} color="#FFFFFF" />
            <Text style={[styles.auhCategoryText, { fontSize: 18 * scale }]}>
              {displayCode}
            </Text>
          </View>

          {/* Right White Number Area */}
          <View style={styles.auhWhiteSection}>
            <View style={styles.auhHeaderRow}>
              <Text style={[styles.auhEnglishHeader, { fontSize: 8 * scale }]}>
                ABU DHABI
              </Text>
              <Text style={[styles.auhArabicHeader, { fontSize: 9 * scale }]}>
                أبو ظبي
              </Text>
            </View>
            <View style={styles.auhNumberWrapper}>
              <Text
                style={[
                  styles.plateNumberDigits,
                  { fontSize: 26 * scale, letterSpacing: 2 * scale },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {displayNumber}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ─── 2. DUBAI: Official Modern Dubai Brand Calligraphy + Latin Logo ─── */}
      {emirateCode === 'DXB' && (
        <View style={styles.dxbContainer}>
          {/* Top Center Dubai Logo */}
          <View style={styles.dxbHeader}>
            <Text style={[styles.dxbArabicLogo, { fontSize: 10 * scale }]}>دبي</Text>
            <View style={styles.dxbLogoDivider} />
            <Text style={[styles.dxbLatinLogo, { fontSize: 10 * scale }]}>DUBAI</Text>
          </View>

          {/* Main Plate Body: Code on left, Number on right */}
          <View style={styles.dxbBody}>
            <View style={[styles.dxbCodeBadge, { minWidth: 28 * scale }]}>
              <Text style={[styles.dxbCodeText, { fontSize: 24 * scale }]}>
                {displayCode}
              </Text>
            </View>
            <Text
              style={[
                styles.plateNumberDigits,
                { fontSize: 26 * scale, letterSpacing: 3 * scale, flex: 1, textAlign: 'right' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayNumber}
            </Text>
          </View>
        </View>
      )}

      {/* ─── 3. SHARJAH: Orange Shield Emblem + Bilingual Ribbon ─── */}
      {emirateCode === 'SHJ' && (
        <View style={styles.standardEmirateContainer}>
          {/* Top Orange Header with Sharjah Seal */}
          <View style={[styles.shjHeaderBar, { height: 22 * scale }]}>
            <Text style={[styles.emirateArabicHeader, { fontSize: 9 * scale, color: '#D97706' }]}>
              الشارقة
            </Text>
            <View style={styles.shjEmblemCircle}>
              <Ionicons name="ribbon" size={11 * scale} color="#D97706" />
            </View>
            <Text style={[styles.emirateLatinHeader, { fontSize: 8 * scale, color: '#D97706' }]}>
              SHARJAH
            </Text>
          </View>

          {/* Body */}
          <View style={styles.standardBody}>
            <View style={[styles.numericCategoryBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.numericCategoryText, { fontSize: 18 * scale, color: '#D97706' }]}>
                {displayCode}
              </Text>
            </View>
            <Text
              style={[
                styles.plateNumberDigits,
                { fontSize: 26 * scale, letterSpacing: 2.5 * scale, flex: 1, textAlign: 'right' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayNumber}
            </Text>
          </View>
        </View>
      )}

      {/* ─── 4. AJMAN: Burgundy Fortress Crest ─── */}
      {emirateCode === 'AJM' && (
        <View style={styles.standardEmirateContainer}>
          <View style={[styles.ajmHeaderBar, { height: 22 * scale }]}>
            <Text style={[styles.emirateArabicHeader, { fontSize: 9 * scale, color: '#991B1B' }]}>
              عجمان
            </Text>
            <Ionicons name="shield-half" size={11 * scale} color="#991B1B" />
            <Text style={[styles.emirateLatinHeader, { fontSize: 8 * scale, color: '#991B1B' }]}>
              AJMAN
            </Text>
          </View>

          <View style={styles.standardBody}>
            <Text style={[styles.letterCodeText, { fontSize: 24 * scale, color: '#991B1B' }]}>
              {displayCode}
            </Text>
            <Text
              style={[
                styles.plateNumberDigits,
                { fontSize: 26 * scale, letterSpacing: 2.5 * scale, flex: 1, textAlign: 'right' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayNumber}
            </Text>
          </View>
        </View>
      )}

      {/* ─── 5. RAS AL KHAIMAH: Dhayah Fort Tower Emblem ─── */}
      {emirateCode === 'RAK' && (
        <View style={styles.standardEmirateContainer}>
          <View style={[styles.rakHeaderBar, { height: 22 * scale }]}>
            <Text style={[styles.emirateArabicHeader, { fontSize: 9 * scale, color: '#B91C1C' }]}>
              ر.أ.خ
            </Text>
            <Ionicons name="flag" size={11 * scale} color="#B91C1C" />
            <Text style={[styles.emirateLatinHeader, { fontSize: 8 * scale, color: '#B91C1C' }]}>
              R.A.K
            </Text>
          </View>

          <View style={styles.standardBody}>
            <Text style={[styles.letterCodeText, { fontSize: 24 * scale, color: '#0F172A' }]}>
              {displayCode}
            </Text>
            <Text
              style={[
                styles.plateNumberDigits,
                { fontSize: 26 * scale, letterSpacing: 2.5 * scale, flex: 1, textAlign: 'right' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayNumber}
            </Text>
          </View>
        </View>
      )}

      {/* ─── 6. UMM AL QUWAIN: Maritime Dhow & Crossed Flags ─── */}
      {emirateCode === 'UAQ' && (
        <View style={styles.standardEmirateContainer}>
          <View style={[styles.uaqHeaderBar, { height: 22 * scale }]}>
            <Text style={[styles.emirateArabicHeader, { fontSize: 8.5 * scale, color: '#0369A1' }]}>
              أم القيوين
            </Text>
            <Ionicons name="boat" size={11 * scale} color="#0369A1" />
            <Text style={[styles.emirateLatinHeader, { fontSize: 8 * scale, color: '#0369A1' }]}>
              U.A.Q
            </Text>
          </View>

          <View style={styles.standardBody}>
            <Text style={[styles.letterCodeText, { fontSize: 24 * scale, color: '#0369A1' }]}>
              {displayCode}
            </Text>
            <Text
              style={[
                styles.plateNumberDigits,
                { fontSize: 26 * scale, letterSpacing: 2.5 * scale, flex: 1, textAlign: 'right' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayNumber}
            </Text>
          </View>
        </View>
      )}

      {/* ─── 7. FUJAIRAH: Historic Fortress Tower ─── */}
      {emirateCode === 'FUJ' && (
        <View style={styles.standardEmirateContainer}>
          <View style={[styles.fujHeaderBar, { height: 22 * scale }]}>
            <Text style={[styles.emirateArabicHeader, { fontSize: 9 * scale, color: '#7C2D12' }]}>
              الفجيرة
            </Text>
            <Ionicons name="home" size={11 * scale} color="#7C2D12" />
            <Text style={[styles.emirateLatinHeader, { fontSize: 8 * scale, color: '#7C2D12' }]}>
              FUJAIRAH
            </Text>
          </View>

          <View style={styles.standardBody}>
            <Text style={[styles.letterCodeText, { fontSize: 24 * scale, color: '#7C2D12' }]}>
              {displayCode}
            </Text>
            <Text
              style={[
                styles.plateNumberDigits,
                { fontSize: 26 * scale, letterSpacing: 2.5 * scale, flex: 1, textAlign: 'right' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {displayNumber}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  plateContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E293B',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  plateShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rivet: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    borderWidth: 0.5,
    borderColor: '#475569',
    zIndex: 5,
  },
  rivetTopLeft: {
    top: 4,
    left: 4,
  },
  rivetTopRight: {
    top: 4,
    right: 4,
  },

  // ─── Abu Dhabi Styles ───
  auhContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  auhRedBand: {
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  auhCategoryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  auhWhiteSection: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  auhHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 2,
  },
  auhEnglishHeader: {
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  auhArabicHeader: {
    fontWeight: '800',
    color: '#0F172A',
  },
  auhNumberWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // ─── Dubai Styles ───
  dxbContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  dxbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 2,
  },
  dxbArabicLogo: {
    fontWeight: '900',
    color: '#0F172A',
    fontStyle: 'italic',
  },
  dxbLogoDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0F172A',
  },
  dxbLatinLogo: {
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  dxbBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dxbCodeBadge: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dxbCodeText: {
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  // ─── Standard Other Emirates Styles ───
  standardEmirateContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  shjHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#FEF3C7',
    paddingBottom: 2,
  },
  shjEmblemCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ajmHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#FEE2E2',
    paddingBottom: 2,
  },
  rakHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#FEE2E2',
    paddingBottom: 2,
  },
  uaqHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0F2FE',
    paddingBottom: 2,
  },
  fujHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#FFEDD5',
    paddingBottom: 2,
  },
  emirateArabicHeader: {
    fontWeight: '800',
  },
  emirateLatinHeader: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  standardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numericCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  numericCategoryText: {
    fontWeight: '900',
  },
  letterCodeText: {
    fontWeight: '900',
  },
  plateNumberDigits: {
    fontWeight: '900',
    color: '#0F172A',
  },
});
