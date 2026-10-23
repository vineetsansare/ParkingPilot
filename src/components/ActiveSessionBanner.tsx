import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useParkingStore } from '../store/parkingStore';
import { MessagingService } from '../services/messagingService';

export const ActiveSessionBanner: React.FC = () => {
  const activeSession = useParkingStore((state) => state.activeSession);
  const endSession = useParkingStore((state) => state.endSession);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(activeSession.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const handleExtend = async () => {
    if (activeSession.paymentMethod === 'whatsapp') {
      await MessagingService.launchWhatsApp(
        activeSession.vehicle,
        activeSession.zone,
        1
      );
    } else {
      await MessagingService.launchSms(
        activeSession.vehicle,
        activeSession.zone,
        1
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ACTIVE TICKET</Text>
        </View>
        <Text style={styles.zoneText}>Zone {activeSession.zone.zoneCode}</Text>
        <Text style={styles.timerText}>⏳ {timeLeft}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.extendButton} onPress={handleExtend}>
          <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.extendText}>Extend</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={endSession}>
          <Text style={styles.endText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  leftContent: {
    flex: 1,
  },
  badge: {
    backgroundColor: '#22C55E',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '800',
  },
  zoneText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timerText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  extendButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  extendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  endButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  endText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
