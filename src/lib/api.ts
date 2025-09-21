import axios from "axios";
import type {
  WaterLevelResponse,
  TidePredictionResponse,
  CurrentPredictionResponse,
  FloodMetrics,
} from "@/types/noaa";

const BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

// Fetch water level data
export async function fetchWaterLevel(
  station: string = "9414290",
  date: string = "latest"
): Promise<WaterLevelResponse> {
  const params = new URLSearchParams({
    station,
    product: "water_level",
    datum: "MLLW",
    units: "metric",
    time_zone: "gmt",
    format: "json",
    date,
    interval: "6min", // Frequent readings
  });
  const { data } = await axios.get(`${BASE_URL}?${params.toString()}`);
  return data;
}

// Fetch tide predictions (high/low)
export async function fetchTidePrediction(
  station: string = "9414290",
  date: string = "today"
): Promise<TidePredictionResponse> {
  const params = new URLSearchParams({
    station,
    product: "predictions",
    datum: "MLLW",
    units: "metric",
    time_zone: "gmt",
    format: "json",
    date,
    interval: "hilo", // High/low only
  });
  const { data } = await axios.get(`${BASE_URL}?${params.toString()}`);
  return data;
}

// Fetch current speed predictions
export async function fetchCurrentSpeed(
  station: string = "cb0102",
  date: string = "latest"
): Promise<CurrentPredictionResponse> {
  const params = new URLSearchParams({
    station,
    product: "currents_predictions",
    units: "metric",
    time_zone: "gmt",
    format: "json",
    date,
    interval: "6",
  });
  const { data } = await axios.get(`${BASE_URL}?${params.toString()}`);
  return data;
}

// Combined fetch for flood metrics (reusable for full dataset)
export async function fetchFloodMetrics(
  station: string = "9414290",
  date: string = "today"
): Promise<FloodMetrics> {
  try {
    const [waterRes, tideRes, currentRes] = await Promise.all([
      fetchWaterLevel(station, date),
      fetchTidePrediction(station, date),
      fetchCurrentSpeed("cb0102", date), // Currents use different station
    ]);

    // Extract latest values
    const latestWaterLevel = parseFloat(waterRes.data[0]?.v || "0");
    const nextHighTide = parseFloat(
      tideRes.predictions.find((p: any) => p.type === "H")?.v || "0"
    );
    const latestCurrentSpeed = parseFloat(
      currentRes.current_predictions.cp[0]?.Velocity_Major || "0"
    );

    // Simple flood risk assessment (thresholds from your contract)
    const isHighRisk =
      latestWaterLevel > 2.0 || nextHighTide > 1.5 || latestCurrentSpeed > 200; // cm/s threshold ~2 m/s

    return {
      waterLevel: latestWaterLevel,
      tidePrediction: nextHighTide,
      currentSpeed: latestCurrentSpeed,
      floodRisk: isHighRisk,
    };
  } catch (error) {
    console.error("Error fetching NOAA data:", error);
    throw new Error("Failed to fetch flood metrics");
  }
}
