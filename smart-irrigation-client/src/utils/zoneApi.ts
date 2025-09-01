import { type Zone } from './sensorApi';

// let mockZones: Zone[] = [
//   { id: 'zone01', name: 'Front Lawn', wateringRequirementLiters: 100, wateringIntervalHours: 24, valveNumber: 0 },
//   { id: 'zone02', name: 'Backyard Garden', wateringRequirementLiters: 50, wateringIntervalHours: 12, valveNumber: 1 },
// ];

const BASE_URL = 'http://192.168.0.17:8080/api/zones';

export const getZones = async (): Promise<Zone[]> => {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`Error fetching zones: ${response.statusText}`);
  }
  return response.json();
};

export const getZoneById = async (id: string): Promise<Zone> => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching zone by ID: ${response.statusText}`);
  }
  return response.json();
};

export const createZone = async (newZone: Omit<Zone, 'id'>): Promise<Zone> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newZone),
  });
  if (!response.ok) {
    throw new Error(`Error creating zone: ${response.statusText}`);
  }
  return response.json();
};

export const updateZone = async (updatedZone: Zone): Promise<Zone> => {
  const response = await fetch(`${BASE_URL}/${updatedZone.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedZone),
  });
  if (!response.ok) {
    throw new Error(`Error updating zone: ${response.statusText}`);
  }
  return response.json();
};

export const deleteZone = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Error deleting zone: ${response.statusText}`);
  }
  // No content expected for successful delete
};
