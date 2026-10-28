import { create } from 'zustand';
import { LatLng, ParkingZone, ParkingSession, DetectionState } from '../types/parking';

interface ParkingState {
  currentLocation: LatLng | null;
  detectedZone: ParkingZone | null;
  selectedZone: ParkingZone | null;
  lastNotifiedZoneId: string | null;
  detectionState: DetectionState;
  isMonitoring: boolean;
  activeSession: ParkingSession | null;
  pastSessions: ParkingSession[];
  zonesRevision: number;

  setCurrentLocation: (location: LatLng) => void;
  setDetectedZone: (zone: ParkingZone | null, location?: LatLng) => void;
  setSelectedZone: (zone: ParkingZone | null) => void;
  setDetectionState: (state: DetectionState) => void;
  setIsMonitoring: (active: boolean) => void;
  startSession: (session: ParkingSession) => void;
  endSession: () => void;
  incrementZonesRevision: () => void;
}

export const useParkingStore = create<ParkingState>((set) => ({
  // Default to Dubai Al Karama center if no GPS
  currentLocation: { latitude: 25.2420, longitude: 55.3030 },
  detectedZone: null,
  selectedZone: null,
  lastNotifiedZoneId: null,
  detectionState: 'idle',
  isMonitoring: true,
  activeSession: null,
  pastSessions: [],
  zonesRevision: 0,

  setCurrentLocation: (location) => set({ currentLocation: location }),

  setDetectedZone: (zone, location) =>
    set((state) => ({
      detectedZone: zone,
      selectedZone: zone || state.selectedZone,
      lastNotifiedZoneId: zone ? zone.id : state.lastNotifiedZoneId,
      currentLocation: location || state.currentLocation,
      detectionState: zone ? 'parked' : state.detectionState,
    })),

  setSelectedZone: (zone) => set({ selectedZone: zone }),

  setDetectionState: (detectionState) => set({ detectionState }),

  setIsMonitoring: (isMonitoring) => set({ isMonitoring }),

  startSession: (session) =>
    set((state) => ({
      activeSession: session,
      pastSessions: [session, ...state.pastSessions],
      detectionState: 'activeSession',
    })),

  endSession: () =>
    set((state) => {
      if (state.activeSession) {
        const updated = state.pastSessions.map((s) =>
          s.id === state.activeSession?.id ? { ...s, isActive: false } : s
        );
        return { activeSession: null, pastSessions: updated, detectionState: 'idle' };
      }
      return { activeSession: null, detectionState: 'idle' };
    }),

  incrementZonesRevision: () =>
    set((state) => ({ zonesRevision: state.zonesRevision + 1 })),
}));
