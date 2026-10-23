import { create } from 'zustand';
import { Vehicle } from '../types/parking';

interface VehicleState {
  vehicles: Vehicle[];
  defaultVehicle: Vehicle | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
}

const DEFAULT_INITIAL_VEHICLE: Vehicle = {
  id: 'veh_default_1',
  plateCode: 'A',
  plateNumber: '12345',
  emirateCode: 'DXB',
  isDefault: true,
  displayName: 'My Car',
};

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [DEFAULT_INITIAL_VEHICLE],
  defaultVehicle: DEFAULT_INITIAL_VEHICLE,

  addVehicle: (vehicleData) => {
    const newId = `veh_${Date.now()}`;
    const isFirst = get().vehicles.length === 0;
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      isDefault: isFirst || vehicleData.isDefault,
    };

    set((state) => {
      const updatedVehicles = newVehicle.isDefault
        ? state.vehicles.map((v) => ({ ...v, isDefault: false })).concat(newVehicle)
        : [...state.vehicles, newVehicle];

      const newDefault = newVehicle.isDefault ? newVehicle : state.defaultVehicle;
      return { vehicles: updatedVehicles, defaultVehicle: newDefault };
    });
  },

  updateVehicle: (id, updates) => {
    set((state) => {
      const updatedVehicles = state.vehicles.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      );
      const newDefault = updatedVehicles.find((v) => v.isDefault) || state.defaultVehicle;
      return { vehicles: updatedVehicles, defaultVehicle: newDefault };
    });
  },

  deleteVehicle: (id) => {
    set((state) => {
      const remaining = state.vehicles.filter((v) => v.id !== id);
      let newDefault = state.defaultVehicle;
      if (state.defaultVehicle?.id === id) {
        newDefault = remaining[0] || null;
        if (newDefault) newDefault.isDefault = true;
      }
      return { vehicles: remaining, defaultVehicle: newDefault };
    });
  },

  setDefaultVehicle: (id) => {
    set((state) => {
      const updated = state.vehicles.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }));
      const newDefault = updated.find((v) => v.id === id) || null;
      return { vehicles: updated, defaultVehicle: newDefault };
    });
  },
}));
