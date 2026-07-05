export interface RaceResult {
  id: string;
  game: "Formula 1" | "Assetto Corsa" | "Automobilista 2";
  track: string;
  carClass: string;
  conditions: "Dry - Day" | "Dry - Night" | "Wet - Day" | "Wet - Night" | "Mixed";
  winner: "Harish" | "Shabesh";
  fastestLap: "Harish" | "Shabesh";
  fastestLapTime: string;
  date: string;
  laps?: number; // Optional lap count
  raceDuration?: string; // Optional total race duration (e.g. "15:45.321")
  harishFinishingPos?: number;
  shabeshFinishingPos?: number;
  harishStartingPos?: number;
  shabeshStartingPos?: number;
}

export type GameType = "Formula 1" | "Assetto Corsa" | "Automobilista 2";

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
  "Automobilista 2": [
    "Adelaide (Australia)",
    "Ascurra (Brazil)",
    "Azure Circuit (Monaco)",
    "Barcelona (Circuit de Barcelona-Catalunya) (Spain)",
    "Bathurst (Mount Panorama) (Australia)",
    "Brands Hatch (United Kingdom)",
    "Brasília (Brazil)",
    "Buenos Aires (Autódromo Oscar Gálvez) (Argentina)",
    "Buskerud (Norway)",
    "Cadwell Park (United Kingdom)",
    "Campo Grande (Brazil)",
    "Cascais (Estoril) (Portugal)",
    "Cascavel (Brazil)",
    "Cleveland (Burke Lakefront) (USA)",
    "Córdoba (Argentina)",
    "Curitiba (Brazil)",
    "Curvelo (Brazil)",
    "Daytona International Speedway (USA)",
    "Donington Park (United Kingdom)",
    "Fontana (Auto Club Speedway) (USA)",
    "Foz (Brazil)",
    "Galeo Airport (Fictional)",
    "Gateway (WWT Raceway) (USA)",
    "Goiânia (Brazil)",
    "Granja Viana (Brazil)",
    "Guaporé (Brazil)",
    "Hockenheimring (Germany)",
    "Ibarra (Autódromo Yahuarcocha) (Ecuador)",
    "Imola (Italy)",
    "Indianapolis Motor Speedway (USA)",
    "Interlagos (Brazil)",
    "Jacarepaguá (Brazil)",
    "Jerez (Spain)",
    "Kansai (Japan)",
    "Kyalami (South Africa)",
    "Laguna Seca (USA)",
    "Le Mans (Circuit des 24 Heures du Mans) (France)",
    "Londrina (Brazil)",
    "Long Beach (USA)",
    "Montreal (Canada)",
    "Monza (Italy)",
    "Mosport (Canada)",
    "Nürburgring (GP & Nordschleife) (Germany)",
    "Ortona (Italy)",
    "Oulton Park (United Kingdom)",
    "Pocono Raceway (USA)",
    "Road America (USA)",
    "Road Atlanta (USA)",
    "Salvador Street Circuit (Brazil)",
    "Santa Cruz do Sul (Brazil)",
    "Sebring (USA)",
    "Silverstone (United Kingdom)",
    "Snetterton (United Kingdom)",
    "Spa-Francorchamps (Belgium)",
    "Speedland (Fictional)",
    "Spielberg (Red Bull Ring) (Austria)",
    "Tarumã (Brazil)",
    "Termas de Río Hondo (Argentina)",
    "Tykki (Finland)",
    "Velo Città (Brazil)",
    "Velopark (Brazil)",
    "Virginia International Raceway (USA)",
    "Watkins Glen (USA)"
  ]
};

export const CONDITIONS = [
  "Dry - Day",
  "Dry - Night",
  "Wet - Day",
  "Wet - Night",
  "Mixed"
] as const;
