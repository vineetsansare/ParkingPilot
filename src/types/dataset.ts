import { ParkingZone } from './parking';

export type SyncStatus = 'idle' | 'checking' | 'downloading' | 'up-to-date' | 'updated' | 'error';

export interface DatasetManifest {
  version: string;
  releaseDate: string;
  totalZones: number;
  legalNoticeLastUpdated: string;
  changelog: string;
  checksum?: string;
  zones?: ParkingZone[];
}

export interface DatasetSyncState {
  currentVersion: string;
  currentReleaseDate: string;
  availableVersion: string | null;
  status: SyncStatus;
  lastChecked: string | null;
  totalZones: number;
  errorMessage: string | null;
  hasUpdateAvailable: boolean;
  legalNoticeLastUpdated: string;
}

export interface RemoteLegalDisclosure {
  id: string;
  title: string;
  badge: string;
  icon: string;
  summary: string;
  detail: string;
  lastVerified: string;
}
