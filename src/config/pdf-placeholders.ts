interface PlaceholderPosition {
  x: number;
  y: number;
  fontSize: number;
  page: number;
}

export const placeholderPositions: Record<string, PlaceholderPosition> = {
  company_name: {
    x: 100,
    y: 700,
    fontSize: 12,
    page: 1
  },
  client_name: {
    x: 100,
    y: 680,
    fontSize: 12,
    page: 1
  },
  facility_process: {
    x: 100,
    y: 660,
    fontSize: 12,
    page: 1
  },
  construction_year: {
    x: 100,
    y: 640,
    fontSize: 12,
    page: 1
  },
  town: {
    x: 100,
    y: 620,
    fontSize: 12,
    page: 1
  },
  province: {
    x: 100,
    y: 600,
    fontSize: 12,
    page: 1
  },
  // Add more placeholder positions as needed
}; 