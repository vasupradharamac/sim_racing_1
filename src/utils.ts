/**
 * Parse time string (e.g., "1:22.453", "20:45.320", "1:15:45.320", "45.890") into total seconds.
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  try {
    const parts = timeStr.trim().split(":");
    if (parts.length === 1) {
      // Just seconds (e.g. "45.890")
      return parseFloat(parts[0]) || 0;
    } else if (parts.length === 2) {
      // Minutes and seconds (e.g. "1:22.453")
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // Hours, minutes, and seconds (e.g. "1:15:45.321")
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      const seconds = parseFloat(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch (e) {
    console.error("Error parsing time:", timeStr, e);
  }
  return 0;
}

/**
 * Format total seconds into a elegant race/lap time string.
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (totalSeconds <= 0 || isNaN(totalSeconds)) return "0:00.000";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Format seconds with 3 decimal places
  const secPart = seconds.toFixed(3);
  
  // Ensure double digit seconds if minutes or hours are present
  const hasMinutesOrHours = minutes > 0 || hours > 0;
  const dotIndex = secPart.indexOf(".");
  const integerPart = secPart.substring(0, dotIndex);
  const decimalPart = secPart.substring(dotIndex);
  
  const formattedSeconds = hasMinutesOrHours && parseInt(integerPart, 10) < 10
    ? "0" + secPart
    : secPart;
    
  if (hours > 0) {
    const minStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minStr}:${formattedSeconds}`;
  } else if (minutes > 0) {
    return `${minutes}:${formattedSeconds}`;
  } else {
    return `${formattedSeconds}s`;
  }
}

/**
 * Validates a lap time input string (e.g. "1:22.453")
 */
export function isValidTimeFormat(timeStr: string): boolean {
  if (!timeStr) return false;
  // Allows: SS, SS.mmm, MM:SS, MM:SS.mmm, HH:MM:SS, HH:MM:SS.mmm
  const regex = /^(?:(?:\d+:)?\d+:)?\d+(?:\.\d+)?$/;
  return regex.test(timeStr.trim());
}

export const TRACK_LENGTHS_KM: Record<string, number> = {
  // Formula 1 Tracks
  "Bahrain (Sakhir)": 5.412,
  "Saudi Arabia (Jeddah)": 6.174,
  "Australia (Melbourne)": 5.278,
  "Japan (Suzuka)": 5.807,
  "China (Shanghai)": 5.451,
  "USA (Miami)": 5.412,
  "Italy (Imola)": 4.909,
  "Monaco": 3.337,
  "Canada (Montreal)": 4.361,
  "Spain (Barcelona)": 4.657,
  "Austria (Spielberg)": 4.318,
  "United Kingdom (Silverstone)": 5.891,
  "Hungary (Budapest)": 4.381,
  "Belgium (Spa-Francorchamps)": 7.004,
  "Netherlands (Zandvoort)": 4.259,
  "Italy (Monza)": 5.793,
  "Azerbaijan (Baku)": 6.003,
  "Singapore (Marina Bay)": 4.940,
  "USA (Austin)": 5.513,
  "Mexico (Mexico City)": 4.304,
  "Brazil (Interlagos)": 4.309,
  "USA (Las Vegas)": 6.201,
  "Qatar (Lusail)": 5.419,
  "Abu Dhabi (Yas Marina)": 5.281,

  // Assetto Corsa Tracks
  "Monza": 5.793,
  "Spa": 7.004,
  "Nordschleife": 20.832,
  "Imola": 4.909,
  "Mugello": 5.245,
  "Silverstone": 5.891,
  "Brands Hatch": 3.908,
  "Red Bull Ring": 4.318,
  "Barcelona": 4.657,
  "Laguna Seca": 3.602,

  // Auto Mobilista 2 Tracks
  "Adelaide (Australia)": 3.780,
  "Ascurra (Brazil)": 1.200,
  "Azure Circuit (Monaco)": 3.337,
  "Barcelona (Circuit de Barcelona-Catalunya) (Spain)": 4.657,
  "Bathurst (Mount Panorama) (Australia)": 6.213,
  "Brands Hatch (United Kingdom)": 3.908,
  "Brasília (Brazil)": 5.475,
  "Buenos Aires (Autódromo Oscar Gálvez) (Argentina)": 4.259,
  "Buskerud (Norway)": 2.100,
  "Cadwell Park (United Kingdom)": 3.477,
  "Campo Grande (Brazil)": 3.433,
  "Cascais (Estoril) (Portugal)": 4.182,
  "Cascavel (Brazil)": 3.058,
  "Cleveland (Burke Lakefront) (USA)": 3.391,
  "Córdoba (Argentina)": 4.045,
  "Curitiba (Brazil)": 3.695,
  "Curvelo (Brazil)": 4.420,
  "Daytona International Speedway (USA)": 5.730,
  "Donington Park (United Kingdom)": 4.020,
  "Fontana (Auto Club Speedway) (USA)": 4.500,
  "Foz (Brazil)": 1.500,
  "Galeo Airport (Fictional)": 4.000,
  "Gateway (WWT Raceway) (USA)": 2.000,
  "Goiânia (Brazil)": 3.835,
  "Granja Viana (Brazil)": 1.200,
  "Guaporé (Brazil)": 3.080,
  "Hockenheimring (Germany)": 4.574,
  "Ibarra (Autódromo Yahuarcocha) (Ecuador)": 3.530,
  "Imola (Italy)": 4.909,
  "Indianapolis Motor Speedway (USA)": 4.192,
  "Interlagos (Brazil)": 4.309,
  "Jacarepaguá (Brazil)": 5.031,
  "Jerez (Spain)": 4.428,
  "Kansai (Japan)": 5.807,
  "Kyalami (South Africa)": 4.529,
  "Laguna Seca (USA)": 3.602,
  "Le Mans (Circuit des 24 Heures du Mans) (France)": 13.626,
  "Londrina (Brazil)": 3.146,
  "Long Beach (USA)": 3.167,
  "Montreal (Canada)": 4.361,
  "Monza (Italy)": 5.793,
  "Mosport (Canada)": 3.957,
  "Nürburgring (GP & Nordschleife) (Germany)": 25.378,
  "Ortona (Italy)": 1.300,
  "Oulton Park (United Kingdom)": 4.307,
  "Pocono Raceway (USA)": 4.000,
  "Road America (USA)": 6.408,
  "Road Atlanta (USA)": 4.088,
  "Salvador Street Circuit (Brazil)": 2.700,
  "Santa Cruz do Sul (Brazil)": 3.531,
  "Sebring (USA)": 6.019,
  "Silverstone (United Kingdom)": 5.891,
  "Snetterton (United Kingdom)": 4.779,
  "Spa-Francorchamps (Belgium)": 7.004,
  "Speedland (Fictional)": 1.200,
  "Spielberg (Red Bull Ring) (Austria)": 4.318,
  "Tarumã (Brazil)": 3.039,
  "Termas de Río Hondo (Argentina)": 4.806,
  "Tykki (Finland)": 2.200,
  "Velo Città (Brazil)": 3.430,
  "Velopark (Brazil)": 2.278,
  "Virginia International Raceway (USA)": 5.260,
  "Watkins Glen (USA)": 5.430
};

export function getTrackLengthKM(trackName: string): number {
  if (!trackName) return 5.0;
  const normalized = trackName.trim();
  if (TRACK_LENGTHS_KM[normalized] !== undefined) {
    return TRACK_LENGTHS_KM[normalized];
  }
  // Try case insensitive match or substring match
  const lowerTrack = normalized.toLowerCase();
  for (const [key, len] of Object.entries(TRACK_LENGTHS_KM)) {
    if (key.toLowerCase() === lowerTrack || lowerTrack.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTrack)) {
      return len;
    }
  }
  return 5.0; // Fallback
}
