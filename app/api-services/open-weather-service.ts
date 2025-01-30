const API_KEY = process.env.WEATHER_API_KEY;
const TEN_MINUTES = 1000 * 60 * 10; // in milliseconds
 
const resultsCache: Record<string, { lastFetch: number; data: unknown }> = {};
 
function getCacheEntry(key: string) {
  return resultsCache[key];
}
 
function setCacheEntry(key: string, data: unknown) {
  resultsCache[key] = { lastFetch: Date.now(), data };
}
 
function isDataStale(lastFetch: number) {
  return Date.now() - lastFetch > TEN_MINUTES;
}
 
interface FetchWeatherDataParams {
  lat: number;
  lon: number;
  units: string;
}
 
/**
 * Fetches current weather data using the OpenWeather /weather endpoint.
 */
export async function fetchWeatherData({
  lat,
  lon,
  units,
}: FetchWeatherDataParams) {
  const baseURL = "https://api.openweathermap.org/data/2.5/weather"; // Updated to /weather
  const queryString = `lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
 
  // Check the cache
  const cacheEntry = getCacheEntry(queryString);
  if (cacheEntry && !isDataStale(cacheEntry.lastFetch)) {
    console.log("Using cached weather data.");
    return cacheEntry.data;
  }
 
  // Fetch data from the API
  const response = await fetch(`${baseURL}?${queryString}`);
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error fetching weather data:", errorData);
    throw new Error(`Failed to fetch weather data: ${errorData.message}`);
  }
 
  const data = await response.json();
 
  // Cache the result
  setCacheEntry(queryString, data);
 
  return data;
}
 
/**
 * Fetches geographic coordinates (latitude, longitude) for a given postal code.
 */
export async function getGeoCoordsForPostalCode(
  postalCode: string,
  countryCode: string
) {
  const baseURL = "http://api.openweathermap.org/geo/1.0/zip";
  const queryString = `zip=${postalCode},${countryCode}&appid=${API_KEY}`;
 
  // Fetch data from the API
  const response = await fetch(`${baseURL}?${queryString}`);
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error fetching geolocation data:", errorData);
    throw new Error(`Failed to fetch geolocation data: ${errorData.message}`);
  }
 
  const data = await response.json();
  return data;
}
 