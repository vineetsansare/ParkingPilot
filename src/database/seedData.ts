import { ParkingZone } from "../types/parking";
import rawParkingZones from "./dubaiParkingZones.json";

/**
 * Official high-fidelity parking zone polygon dataset across Dubai and UAE emirates,
 * verified against Dubai Municipality GIS boundaries and Parkin PJSC official definitions.
 *
 * Each zone polygon contains exact boundary coordinates derived from official municipal GIS layers.
 */
export const SEED_PARKING_ZONES: ParkingZone[] = rawParkingZones as ParkingZone[];
