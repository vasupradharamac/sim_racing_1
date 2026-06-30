export interface RaceResult {
  id: string;
  game: "Formula 1" | "Assetto Corsa" | "Auto Mobilista 2";
  track: string;
  carClass: string;
  conditions: "Dry - Day" | "Dry - Night" | "Wet - Day" | "Wet - Night" | "Mixed";
  winner: "Harish" | "Shabesh";
  fastestLap: "Harish" | "Shabesh";
  fastestLapTime: string;
  date: string;
  laps?: number; // Optional lap count
  raceDuration?: string; // Optional total race duration (e.g. "15:45.321")
}

export type GameType = "Formula 1" | "Assetto Corsa" | "Auto Mobilista 2";

export const GAMES_AND_TRACKS: Record<GameType, string[]> = {
  "Formula 1": [
    "Bahrain (Sakhir)", "Saudi Arabia (Jeddah)", "Australia (Melbourne)", "Japan (Suzuka)", 
    "China (Shanghai)", "USA (Miami)", "Italy (Imola)", "Monaco", "Canada (Montreal)", 
    "Spain (Barcelona)", "Austria (Spielberg)", "United Kingdom (Silverstone)", "Hungary (Budapest)", 
    "Belgium (Spa-Francorchamps)", "Netherlands (Zandvoort)", "Italy (Monza)", "Azerbaijan (Baku)", 
    "Singapore (Marina Bay)", "USA (Austin)", "Mexico (Mexico City)", "Brazil (Interlagos)", 
    "USA (Las Vegas)", "Qatar (Lusail)", "Abu Dhabi (Yas Marina)"
  ],
  "Assetto Corsa": [
    "Monza", "Spa", "Nordschleife", "Imola", "Mugello", "Silverstone", 
    "Brands Hatch", "Red Bull Ring", "Barcelona", "Laguna Seca"
  ],
  "Auto Mobilista 2": [
    "Interlagos (Brazil)", "Mount Panorama (Bathurst)", "Donington Park (UK)", "Kyalami (South Africa)", 
    "Long Beach (USA)", "Daytona (USA)", "Hockenheimring (Germany)", "Tarumã (Brazil)", 
    "Nürburgring Nordschleife (Germany)", "Brands Hatch (UK)", "Spielberg (Austria)", 
    "Monza (Italy)", "Spa-Francorchamps (Belgium)", "Imola (Italy)", "Road America (USA)", 
    "Watkins Glen (USA)", "Jerez (Spain)", "Estoril (Portugal)", "Adelaide (Australia)", "Guaporé (Brazil)"
  ]
};

export const CONDITIONS = [
  "Dry - Day",
  "Dry - Night",
  "Wet - Day",
  "Wet - Night",
  "Mixed"
] as const;
