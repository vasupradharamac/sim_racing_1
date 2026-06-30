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
