// export interface WaterLevelData {
//   t: string; // Timestamp, e.g., "2025-09-20 13:30"
//   v: string; // Value in meters, e.g., "0.306"
//   s: string; // Sigma
//   f: string; // Flags
//   q: string; // Quality
// }

// export interface WaterLevelResponse {
//   data: WaterLevelData[];
//   metadata: {
//     id: string;
//     name: string;
//     lat: string;
//     lon: string;
//   };
// }

// export interface TidePrediction {
//   t: string; // Timestamp, e.g., "2025-09-20 05:42"
//   v: string; // Value in meters, e.g., "1.765"
//   type: "H" | "L"; // High or Low
// }

// export interface TidePredictionResponse {
//   predictions: TidePrediction[];
//   metadata: {
//     id: string;
//     name: string;
//     lat: string;
//     lon: string;
//   };
// }

// export interface CurrentPrediction {
//   Time: string; // Timestamp, e.g., "2025-09-20 13:40"
//   Depth: string; // Depth in meters, e.g., "16.8"
//   Velocity_Major: string; // Speed in cm/s, e.g., "43.5"
//   meanFloodDir: string; // Degrees
//   meanEbbDir: string; // Degrees
//   Bin: string;
// }

// export interface CurrentPredictionResponse {
//   current_predictions: {
//     units: string;
//     cp: CurrentPrediction[];
//   };
// }

// export interface FloodMetrics {
//   waterLevel: number; // Latest in meters (e.g., 0.306)
//   tidePrediction: number; // Next high tide in meters (e.g., 1.765)
//   currentSpeed: number; // Latest in cm/s (e.g., 43.5)
//   floodRisk: boolean; // Simple assessment
// }

// export interface APIError {
//   error: string;
// }


// Types for NOAA flood prediction data
export interface FloodMetrics {
  waterLevel: number; // Current water level in meters
  tidePrediction: number; // Next high tide prediction in meters  
  currentSpeed: number; // Current water speed in cm/s
  floodRisk: boolean; // Calculated flood risk based on thresholds
  timestamp?: string; // ISO timestamp of data collection
  location?: string; // Station location
}

export interface NOAAStationData {
  stationId: string;
  stationName: string;
  waterLevel?: number;
  predictions?: TidePrediction[];
  currentData?: CurrentData;
}

export interface TidePrediction {
  time: string; // ISO timestamp
  value: number; // Predicted tide height in meters
  type: 'H' | 'L'; // High or Low tide
}

export interface CurrentData {
  speed: number; // Current speed in cm/s
  direction: number; // Direction in degrees
  timestamp: string;
}

export interface NOAAResponse {
  success: boolean;
  data?: FloodMetrics;
  error?: string;
  rawData?: any; // For debugging NOAA API responses
}

// NOAA API endpoints and parameters
export interface NOAAApiParams {
  station?: string; // Station ID (default: 8518750 for The Battery, NY)
  product?: string; // Data product type
  datum?: string; // Vertical datum reference
  units?: string; // Measurement units
  timeZone?: string; // Time zone for data
  format?: string; // Response format
  begin_date?: string; // Start date for data range
  end_date?: string; // End date for data range
  interval?: string; // Data interval
}

// Default configuration for NOAA requests
export const DEFAULT_NOAA_CONFIG: NOAAApiParams = {
  station: '8518750', // The Battery, New York Harbor
  datum: 'MLLW', // Mean Lower Low Water
  units: 'metric',
  timeZone: 'gmt',
  format: 'json'
};

// Flood risk thresholds (should match contract values)
export const FLOOD_THRESHOLDS = {
  WATER_LEVEL: 2.00, // 2.00 meters
  TIDE_PREDICTION: 1.50, // 1.50 meters  
  CURRENT_SPEED: 2.00 // 2.00 cm/s
} as const;