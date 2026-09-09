export interface ProjectData {
  name: string;
  progress: number;
  progressChange: string;
  progressTarget: string;
  safetyScore: number;
  safetyChange: string;
  activeWorkers: number;
  workersOnBreak: number;
  activeEquipment: number;
  idleEquipment: number;
  equipmentUtilization: number;
  openViolations: number;
  criticalViolations: number;
  riskScore: number;
  riskLevel: 'Low' | 'Low-Moderate' | 'Medium' | 'High' | 'Critical';
  materialUtilization: number;
  materialTrend: string;
  predictedDelay: number;
  predictedDelayProb: number;
  predictedDelayDriver: string;
  zones: ZoneDetail[];
  violations: Violation[];
  tasks: Task[];
  predictions: Prediction[];
  materials: MaterialDetail[];
  inspections: Inspection[];
  defects: { name: string; value: number }[];
  equipment: EquipmentDetail[];
  weather: WeatherData;
}

export interface ZoneDetail {
  id: string;
  name: string;
  description: string;
  riskScore: number;
  activeWorkers: number;
  equipment: string[];
  openAlerts: number;
}

export interface Violation {
  id: string;
  violation: string;
  zone: string;
  severity: 'Critical' | 'Warning' | 'Resolved';
  detectedTime: string;
  status: 'Active' | 'Resolved';
}

export interface Task {
  id: string;
  name: string;
  zone: string;
  owner: string;
  dueDate: string;
  progress: number;
  status: 'COMPLETED' | 'IN PROGRESS' | 'DELAYED' | 'PENDING';
}

export interface Prediction {
  id: string;
  title: string;
  metric: string;
  subtext: string;
  probability: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
  mitigation: string;
}

export interface MaterialDetail {
  name: string;
  utilization: number;
  status: 'Normal' | 'Shortage Risk' | 'Overstocked';
  trend: 'up' | 'down' | 'stable';
}

export interface Inspection {
  id: string;
  area: string;
  inspector: string;
  date: string;
  result: 'Pass' | 'Fail';
  status: 'Completed' | 'Pending';
}

export interface EquipmentDetail {
  name: string;
  status: 'Active' | 'Idle' | 'Maintenance';
  location: string;
  utilization: number;
  nextMaintenance: string;
}

export interface WeatherData {
  location: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  forecast: { day: string; temp: number; icon: string; rainProb: number }[];
  impacts: { rain: 'Low' | 'Medium' | 'High'; wind: 'Low' | 'Medium' | 'High'; heat: 'Low' | 'Medium' | 'High' };
}

export interface Worker {
  id: string;
  workerId: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  assignedProject: string;
  assignedZone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON SITE' | 'OFF SITE';
  accessStatus: 'AUTHORIZED' | 'REVOKED';
  accessLevel: 'General Access' | 'Zone Specific' | 'Restricted Access';
  accessStartDate: string;
  accessExpiryDate: string;
  registrationDate: string;
  photo: string | null;
  ppeRequirements: {
    helmet: boolean;
    vest: boolean;
    shoes: boolean;
    gloves: boolean;
    badge: boolean;
  };
  isArchived: boolean;
  safetyNotes?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
}

export interface EntryLog {
  id: string;
  workerId: string;
  workerName: string;
  entryDate: string;
  entryTime: string;
  exitDate: string | null;
  exitTime: string | null;
  zone: string;
  ppeScore: number;
  accessResult: 'ALLOWED' | 'DENIED';
  status: 'ON SITE' | 'EXITED' | 'ACCESS DENIED' | 'PENDING';
  denialReason: string | null;
}

export const projectsList = [
  'Skyline Tower – Phase II',
  'Harbour Bridge Retrofit',
  'Metro Line 4 – Depot',
  'Riverside Logistics Park'
];

export const mockProjectData: Record<string, ProjectData> = {
  'Skyline Tower – Phase II': {
    name: 'Skyline Tower – Phase II',
    progress: 68,
    progressChange: '+4.2% vs plan',
    progressTarget: 'Target 72% by Friday',
    safetyScore: 91,
    safetyChange: '+3 pts this week',
    activeWorkers: 124,
    workersOnBreak: 8,
    activeEquipment: 18,
    idleEquipment: 2,
    equipmentUtilization: 76,
    openViolations: 7,
    criticalViolations: 3,
    riskScore: 24,
    riskLevel: 'Low-Moderate',
    materialUtilization: 84,
    materialTrend: 'Steel trending short',
    predictedDelay: 3,
    predictedDelayProb: 72,
    predictedDelayDriver: 'First-floor structural',
    zones: [
      { id: 'Zone A', name: 'Zone A – Foundation', description: 'Deep excavation and pouring base columns', riskScore: 15, activeWorkers: 24, equipment: ['Concrete Mixer', 'Pump Truck'], openAlerts: 0 },
      { id: 'Zone B', name: 'Zone B – Structural', description: 'First and second floor reinforced framework', riskScore: 78, activeWorkers: 42, equipment: ['Tower Crane', 'Forklift'], openAlerts: 3 },
      { id: 'Zone C', name: 'Zone C – Material Storage', description: 'Rebar, cement, and safety inventory yards', riskScore: 22, activeWorkers: 12, equipment: ['Forklift'], openAlerts: 1 },
      { id: 'Zone D', name: 'Zone D – Equipment Area', description: 'Heavy machinery parking and maintenance shop', riskScore: 35, activeWorkers: 8, equipment: ['Excavator', 'Generator'], openAlerts: 1 },
      { id: 'Zone E', name: 'Zone E – Worker Entry', description: 'Access control gate and safety briefing zone', riskScore: 12, activeWorkers: 15, equipment: [], openAlerts: 0 },
      { id: 'Zone F', name: 'Zone F – Restricted Area', description: 'High-voltage substation and dangerous chemical stores', riskScore: 85, activeWorkers: 3, equipment: ['Generator'], openAlerts: 2 }
    ],
    violations: [
      { id: 'V-1024', violation: 'Missing Safety Helmet', zone: 'Zone B', severity: 'Critical', detectedTime: '06:12', status: 'Active' },
      { id: 'V-1025', violation: 'Restricted Area Access', zone: 'Zone F', severity: 'Critical', detectedTime: '07:45', status: 'Active' },
      { id: 'V-1026', violation: 'Unsafe Equipment Operation', zone: 'Zone D', severity: 'Warning', detectedTime: '08:20', status: 'Active' },
      { id: 'V-1027', violation: 'Missing Safety Gloves', zone: 'Zone C', severity: 'Warning', detectedTime: '09:05', status: 'Active' },
      { id: 'V-1021', violation: 'No Protective Glasses', zone: 'Zone B', severity: 'Warning', detectedTime: '05:30', status: 'Resolved' },
      { id: 'V-1022', violation: 'Unsecured Harness at Height', zone: 'Zone B', severity: 'Critical', detectedTime: '05:45', status: 'Resolved' },
      { id: 'V-1023', violation: 'Blocked Emergency Exit', zone: 'Zone E', severity: 'Warning', detectedTime: '06:00', status: 'Resolved' }
    ],
    tasks: [
      { id: 'T-101', name: 'Foundation Pouring', zone: 'Zone A', owner: 'Concrete Team', dueDate: '10 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-102', name: 'Structural Column Casting', zone: 'Zone B', owner: 'Structural Team', dueDate: '14 Aug', progress: 95, status: 'IN PROGRESS' },
      { id: 'T-103', name: 'Ground Floor Slab', zone: 'Zone B', owner: 'Formwork Crew', dueDate: '20 Aug', progress: 80, status: 'IN PROGRESS' },
      { id: 'T-104', name: 'First Floor Pillars', zone: 'Zone B', owner: 'Structural Team', dueDate: '28 Aug', progress: 45, status: 'DELAYED' },
      { id: 'T-105', name: 'Electrical Grid Layout', zone: 'Zone A', owner: 'Electrical Sub', dueDate: '05 Sep', progress: 10, status: 'PENDING' },
      { id: 'T-106', name: 'Final Safety Inspection', zone: 'Zone E', owner: 'Safety Auditor', dueDate: '15 Sep', progress: 0, status: 'PENDING' }
    ],
    predictions: [
      { id: 'P-1', title: 'PROJECT DELAY', metric: '3 Days', subtext: '72% probability', probability: '72%', severity: 'Medium', details: 'Delay in structural column concrete curing on the first floor due to localized high moisture levels.', mitigation: 'Deploy industrial dehumidifiers and adjust scheduling coordinates to proceed with Zone A ground work.' },
      { id: 'P-2', title: 'SAFETY INCIDENT RISK', metric: '18%', subtext: 'PPE Non-compliance driven', probability: '18%', severity: 'Low', details: 'Higher risk level in Zone B due to elevated fatigue levels detected via micro-behavior shift analysis.', mitigation: 'Enforce an extra 10-minute shift break and run safety visor checks at entry gates.' },
      { id: 'P-3', title: 'MATERIAL SHORTAGE', metric: '6 Days', subtext: 'Steel reinforcement short', probability: '85%', severity: 'High', details: 'Global logistics delay has pushed back structural rebar deliveries. Stock will deplete in 6 days.', mitigation: 'Source emergency contingency stock from local Riverside warehouse partner.' },
      { id: 'P-4', title: 'EQUIPMENT FAILURE', metric: 'Tower Crane', subtext: 'Maintenance recommended', probability: '64%', severity: 'Medium', details: 'Vibration monitoring on motor assembly shows slight deviation from normal operating baseline.', mitigation: 'Schedule bearing lubrication inspection tonight at 20:00 (no-impact window).' }
    ],
    materials: [
      { name: 'Cement', utilization: 78, status: 'Normal', trend: 'stable' },
      { name: 'Steel Reinforcement', utilization: 92, status: 'Shortage Risk', trend: 'down' },
      { name: 'Sand & Gravel', utilization: 65, status: 'Normal', trend: 'up' },
      { name: 'Concrete Mix', utilization: 84, status: 'Normal', trend: 'stable' },
      { name: 'Safety PPE Kits', utilization: 95, status: 'Normal', trend: 'up' }
    ],
    inspections: [
      { id: 'I-501', area: 'Zone A Foundation', inspector: 'M. Tanveer', date: '26 Aug', result: 'Pass', status: 'Completed' },
      { id: 'I-502', area: 'Zone B Rebar Cage', inspector: 'S. Al-Mutawa', date: '27 Aug', result: 'Fail', status: 'Completed' },
      { id: 'I-503', area: 'Zone D Site Cabinets', inspector: 'J. Smith', date: '28 Aug', result: 'Pass', status: 'Completed' },
      { id: 'I-504', area: 'Zone F Power Intake', inspector: 'A. Rehman', date: '28 Aug', result: 'Pass', status: 'Pending' }
    ],
    defects: [
      { name: 'Structural', value: 4 },
      { name: 'Electrical', value: 1 },
      { name: 'Finishing', value: 2 },
      { name: 'Materials', value: 3 }
    ],
    equipment: [
      { name: 'Tower Crane 01', status: 'Active', location: 'Zone B', utilization: 82, nextMaintenance: '12 hrs' },
      { name: 'Crawler Excavator', status: 'Active', location: 'Zone D', utilization: 75, nextMaintenance: '36 hrs' },
      { name: 'Concrete Transit Mixer', status: 'Idle', location: 'Zone A', utilization: 40, nextMaintenance: '72 hrs' },
      { name: 'Rough-Terrain Forklift', status: 'Active', location: 'Zone C', utilization: 90, nextMaintenance: '8 hrs' },
      { name: 'Diesel Generator 02', status: 'Maintenance', location: 'Zone F', utilization: 0, nextMaintenance: 'Immediate' }
    ],
    weather: {
      location: 'Skyline Tower Construction Site',
      temp: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 14,
      rainProb: 15,
      forecast: [
        { day: 'Fri', temp: 28, icon: 'CloudSun', rainProb: 15 },
        { day: 'Sat', temp: 30, icon: 'Sun', rainProb: 5 },
        { day: 'Sun', temp: 31, icon: 'Sun', rainProb: 5 },
        { day: 'Mon', temp: 27, icon: 'CloudRain', rainProb: 60 },
        { day: 'Tue', temp: 26, icon: 'CloudLightning', rainProb: 80 },
        { day: 'Wed', temp: 28, icon: 'Cloud', rainProb: 20 },
        { day: 'Thu', temp: 29, icon: 'CloudSun', rainProb: 10 }
      ],
      impacts: { rain: 'Medium', wind: 'Low', heat: 'Medium' }
    }
  },
  'Harbour Bridge Retrofit': {
    name: 'Harbour Bridge Retrofit',
    progress: 41,
    progressChange: '+1.5% vs plan',
    progressTarget: 'Target 45% by mid-September',
    safetyScore: 88,
    safetyChange: '-2 pts this week',
    activeWorkers: 98,
    workersOnBreak: 4,
    activeEquipment: 12,
    idleEquipment: 3,
    equipmentUtilization: 68,
    openViolations: 11,
    criticalViolations: 5,
    riskScore: 48,
    riskLevel: 'Medium',
    materialUtilization: 72,
    materialTrend: 'Marine sealant short',
    predictedDelay: 7,
    predictedDelayProb: 84,
    predictedDelayDriver: 'High tide wind alerts',
    zones: [
      { id: 'Zone A', name: 'Zone A – West Arch Foundation', description: 'Under-deck anchoring systems', riskScore: 30, activeWorkers: 15, equipment: ['Generator', 'Water Pump'], openAlerts: 1 },
      { id: 'Zone B', name: 'Zone B – Suspension Suspender Cables', description: 'High-altitude rope-access inspection', riskScore: 92, activeWorkers: 20, equipment: ['Tower Crane'], openAlerts: 4 },
      { id: 'Zone C', name: 'Zone C – Steel Storage Barge', description: 'Floating pontoon steel dock', riskScore: 40, activeWorkers: 25, equipment: ['Forklift'], openAlerts: 2 },
      { id: 'Zone D', name: 'Zone D – Maintenance Yard (Shore)', description: 'Staging, fabrication and administrative site', riskScore: 18, activeWorkers: 12, equipment: ['Excavator'], openAlerts: 0 },
      { id: 'Zone E', name: 'Zone E – Boarding Terminal', description: 'Worker check-in and launch vessel terminal', riskScore: 10, activeWorkers: 16, equipment: [], openAlerts: 0 },
      { id: 'Zone F', name: 'Zone F – Restricted High Voltage Area', description: 'Grid line feeds running underwater', riskScore: 90, activeWorkers: 10, equipment: ['Generator'], openAlerts: 4 }
    ],
    violations: [
      { id: 'V-2001', violation: 'Missing Harness Connection', zone: 'Zone B', severity: 'Critical', detectedTime: '08:12', status: 'Active' },
      { id: 'V-2002', violation: 'No Life Vest in Under-Deck Area', zone: 'Zone A', severity: 'Critical', detectedTime: '08:45', status: 'Active' },
      { id: 'V-2003', violation: 'Hatch left open on barge platform', zone: 'Zone C', severity: 'Warning', detectedTime: '09:30', status: 'Active' },
      { id: 'V-2004', violation: 'Working past limits (fatigue risk)', zone: 'Zone B', severity: 'Warning', detectedTime: '10:05', status: 'Active' },
      { id: 'V-2005', violation: 'Improper mooring line ties', zone: 'Zone C', severity: 'Warning', detectedTime: '10:20', status: 'Active' }
    ],
    tasks: [
      { id: 'T-201', name: 'West Arch Pier Grouting', zone: 'Zone A', owner: 'Marine Sub', dueDate: '15 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-202', name: 'Cable Tension Testing', zone: 'Zone B', owner: 'Cable Tech Team', dueDate: '25 Aug', progress: 90, status: 'IN PROGRESS' },
      { id: 'T-203', name: 'Anchor Bolt Retrofitting', zone: 'Zone A', owner: 'Structural Team', dueDate: '02 Sep', progress: 40, status: 'IN PROGRESS' },
      { id: 'T-204', name: 'Deck Joint Weldings', zone: 'Zone B', owner: 'Welding Crew', dueDate: '10 Sep', progress: 15, status: 'DELAYED' },
      { id: 'T-205', name: 'Pontoon Deck Reinforcement', zone: 'Zone C', owner: 'Marine Sub', dueDate: '20 Sep', progress: 0, status: 'PENDING' }
    ],
    predictions: [
      { id: 'P-201', title: 'PROJECT DELAY', metric: '7 Days', subtext: '84% probability', probability: '84%', severity: 'High', details: 'Forthcoming gale-force maritime wind warnings will suspend crane and barge works next Monday.', mitigation: 'Accelerate critical weld connections in Zone B before Sunday and shift crews to onshore staging work.' },
      { id: 'P-202', title: 'SAFETY INCIDENT RISK', metric: '38%', subtext: 'High-Altitude Wind Exposure', probability: '38%', severity: 'High', details: 'Wind speed forecasts on deck approach 35 knots, increasing safety vulnerability for suspended technicians.', mitigation: 'Initiate wind safety automatic shut-offs on crane lines and move rigging activities below deck level.' }
    ],
    materials: [
      { name: 'Cement', utilization: 60, status: 'Normal', trend: 'stable' },
      { name: 'Steel Reinforcement', utilization: 85, status: 'Normal', trend: 'up' },
      { name: 'Marine Protective Paint', utilization: 95, status: 'Shortage Risk', trend: 'down' },
      { name: 'Cable Clamps', utilization: 50, status: 'Normal', trend: 'stable' },
      { name: 'Safety Harness Kits', utilization: 100, status: 'Normal', trend: 'stable' }
    ],
    inspections: [
      { id: 'I-601', area: 'Zone B Cable Tension', inspector: 'S. Al-Mutawa', date: '25 Aug', result: 'Pass', status: 'Completed' },
      { id: 'I-602', area: 'Zone A Anchor Bolts', inspector: 'M. Tanveer', date: '27 Aug', result: 'Fail', status: 'Completed' },
      { id: 'I-603', area: 'Zone C Barge Hull', inspector: 'A. Rehman', date: '28 Aug', result: 'Pass', status: 'Pending' }
    ],
    defects: [
      { name: 'Structural', value: 8 },
      { name: 'Electrical', value: 0 },
      { name: 'Finishing', value: 1 },
      { name: 'Materials', value: 6 }
    ],
    equipment: [
      { name: 'Marine Barge Crane', status: 'Active', location: 'Zone C', utilization: 88, nextMaintenance: '4 hrs' },
      { name: 'High-Pressure Water Pump', status: 'Active', location: 'Zone A', utilization: 65, nextMaintenance: '12 hrs' },
      { name: 'Deck Generator', status: 'Maintenance', location: 'Zone F', utilization: 0, nextMaintenance: 'Immediate' },
      { name: 'Rope Winch 01', status: 'Idle', location: 'Zone B', utilization: 30, nextMaintenance: '50 hrs' }
    ],
    weather: {
      location: 'Harbour Retrofit Site (Over Water)',
      temp: 21,
      condition: 'Windy & Showers',
      humidity: 82,
      windSpeed: 29,
      rainProb: 65,
      forecast: [
        { day: 'Fri', temp: 21, icon: 'CloudRain', rainProb: 65 },
        { day: 'Sat', temp: 23, icon: 'CloudWind', rainProb: 40 },
        { day: 'Sun', temp: 22, icon: 'CloudSun', rainProb: 20 },
        { day: 'Mon', temp: 18, icon: 'CloudRain', rainProb: 85 },
        { day: 'Tue', temp: 19, icon: 'CloudRain', rainProb: 70 },
        { day: 'Wed', temp: 21, icon: 'Cloud', rainProb: 30 },
        { day: 'Thu', temp: 22, icon: 'Sun', rainProb: 10 }
      ],
      impacts: { rain: 'High', wind: 'High', heat: 'Low' }
    }
  },
  'Metro Line 4 – Depot': {
    name: 'Metro Line 4 – Depot',
    progress: 89,
    progressChange: '+6.1% vs plan',
    progressTarget: 'Target 92% (Final Handover)',
    safetyScore: 94,
    safetyChange: '+1 pt this week',
    activeWorkers: 156,
    workersOnBreak: 18,
    activeEquipment: 24,
    idleEquipment: 5,
    equipmentUtilization: 80,
    openViolations: 3,
    criticalViolations: 0,
    riskScore: 12,
    riskLevel: 'Low',
    materialUtilization: 95,
    materialTrend: 'Tracks & cables fully stocked',
    predictedDelay: 0,
    predictedDelayProb: 10,
    predictedDelayDriver: 'None - on schedule',
    zones: [
      { id: 'Zone A', name: 'Zone A – Main Terminal Building', description: 'Internal fit-outs, drywall, and ceilings', riskScore: 12, activeWorkers: 40, equipment: ['Forklift'], openAlerts: 0 },
      { id: 'Zone B', name: 'Zone B – Track Integration Shed', description: 'Railway switch installation and power feeds', riskScore: 25, activeWorkers: 55, equipment: ['Diesel Generator', 'Track Loader'], openAlerts: 1 },
      { id: 'Zone C', name: 'Zone C – Maintenance Pit Area', description: 'Concrete pits and heavy jacks assembly', riskScore: 20, activeWorkers: 25, equipment: ['Forklift'], openAlerts: 0 },
      { id: 'Zone D', name: 'Zone D – Storage Yard', description: 'Rolling stock bogies and track steel', riskScore: 15, activeWorkers: 10, equipment: ['Crawler Crane'], openAlerts: 0 },
      { id: 'Zone E', name: 'Zone E – Main Entrance Gate', description: 'Biometric gates, inductions room', riskScore: 5, activeWorkers: 18, equipment: [], openAlerts: 0 },
      { id: 'Zone F', name: 'Zone F – Substation Box', description: 'High voltage main depot feeder transformer', riskScore: 40, activeWorkers: 8, equipment: [], openAlerts: 0 }
    ],
    violations: [
      { id: 'V-3001', violation: 'Blocked Electrical Panel Access', zone: 'Zone B', severity: 'Warning', detectedTime: '11:20', status: 'Active' },
      { id: 'V-3002', violation: 'Improper ladder placement', zone: 'Zone A', severity: 'Warning', detectedTime: '13:05', status: 'Active' },
      { id: 'V-3003', violation: 'Spill not cleaned in pit', zone: 'Zone C', severity: 'Warning', detectedTime: '14:00', status: 'Active' }
    ],
    tasks: [
      { id: 'T-301', name: 'Depot Shell Erection', zone: 'Zone A', owner: 'Civil Sub', dueDate: '01 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-302', name: 'Track Alignments (Pit 1-4)', zone: 'Zone B', owner: 'Railway Engineering', dueDate: '10 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-303', name: 'Switch Line Testing', zone: 'Zone B', owner: 'Signals Team', dueDate: '22 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-304', name: 'Traction Power Cabling', zone: 'Zone F', owner: 'Power Sub', dueDate: '02 Sep', progress: 92, status: 'IN PROGRESS' },
      { id: 'T-305', name: 'Interior Drywall & Trim', zone: 'Zone A', owner: 'Fit-out Sub', dueDate: '08 Sep', progress: 80, status: 'IN PROGRESS' },
      { id: 'T-306', name: 'Final Sign-off Auditing', zone: 'Zone E', owner: 'Agency Auditor', dueDate: '20 Sep', progress: 0, status: 'PENDING' }
    ],
    predictions: [
      { id: 'P-301', title: 'PROJECT DELAY', metric: '0 Days', subtext: '10% probability', probability: '10%', severity: 'Low', details: 'All milestones completed early. Substation activation is on schedule for Sept 3rd.', mitigation: 'None required. Maintain current shifts.' },
      { id: 'P-302', title: 'SAFETY INCIDENT RISK', metric: '6%', subtext: 'Safe site track record', probability: '6%', severity: 'Low', details: 'High PPE adherence rate (98%) and clean record since last audit.', mitigation: 'Host celebratory toolbox lunch to maintain high morale and safety engagement.' }
    ],
    materials: [
      { name: 'Cement', utilization: 98, status: 'Normal', trend: 'stable' },
      { name: 'Steel Tracks', utilization: 100, status: 'Normal', trend: 'stable' },
      { name: 'Copper Cables', utilization: 90, status: 'Normal', trend: 'stable' },
      { name: 'Ballast Stone Bags', utilization: 80, status: 'Normal', trend: 'stable' },
      { name: 'Safety PPE Kits', utilization: 92, status: 'Normal', trend: 'stable' }
    ],
    inspections: [
      { id: 'I-701', area: 'Zone B Track Switches', inspector: 'A. Rehman', date: '22 Aug', result: 'Pass', status: 'Completed' },
      { id: 'I-702', area: 'Zone F Traction Box', inspector: 'S. Al-Mutawa', date: '27 Aug', result: 'Pass', status: 'Completed' }
    ],
    defects: [
      { name: 'Structural', value: 1 },
      { name: 'Electrical', value: 2 },
      { name: 'Finishing', value: 3 },
      { name: 'Materials', value: 0 }
    ],
    equipment: [
      { name: 'Track Laying Car', status: 'Active', location: 'Zone B', utilization: 95, nextMaintenance: '48 hrs' },
      { name: 'Crawler Crane', status: 'Idle', location: 'Zone D', utilization: 60, nextMaintenance: '100 hrs' },
      { name: 'Tractor Tug', status: 'Active', location: 'Zone A', utilization: 80, nextMaintenance: '24 hrs' }
    ],
    weather: {
      location: 'Metro Line Depot Site',
      temp: 26,
      condition: 'Sunny',
      humidity: 50,
      windSpeed: 10,
      rainProb: 0,
      forecast: [
        { day: 'Fri', temp: 26, icon: 'Sun', rainProb: 0 },
        { day: 'Sat', temp: 27, icon: 'Sun', rainProb: 0 },
        { day: 'Sun', temp: 28, icon: 'Sun', rainProb: 5 },
        { day: 'Mon', temp: 29, icon: 'CloudSun', rainProb: 10 },
        { day: 'Tue', temp: 27, icon: 'Cloud', rainProb: 15 },
        { day: 'Wed', temp: 26, icon: 'Sun', rainProb: 5 },
        { day: 'Thu', temp: 28, icon: 'Sun', rainProb: 0 }
      ],
      impacts: { rain: 'Low', wind: 'Low', heat: 'Low' }
    }
  },
  'Riverside Logistics Park': {
    name: 'Riverside Logistics Park',
    progress: 74,
    progressChange: '+3.1% vs plan',
    progressTarget: 'Target 77% by Friday',
    safetyScore: 92,
    safetyChange: '+0.5 pts this week',
    activeWorkers: 112,
    workersOnBreak: 6,
    activeEquipment: 14,
    idleEquipment: 1,
    equipmentUtilization: 78,
    openViolations: 4,
    criticalViolations: 1,
    riskScore: 18,
    riskLevel: 'Low',
    materialUtilization: 86,
    materialTrend: 'Roof sheets arriving',
    predictedDelay: 1,
    predictedDelayProb: 30,
    predictedDelayDriver: 'Roof trusses erection',
    zones: [
      { id: 'Zone A', name: 'Zone A – Warehouse Foundation', description: 'Completed concrete floor slab', riskScore: 10, activeWorkers: 12, equipment: [], openAlerts: 0 },
      { id: 'Zone B', name: 'Zone B – Portal Frame Structure', description: 'Erection of structural steel frame portals', riskScore: 60, activeWorkers: 38, equipment: ['Mobile Crane', 'Scissor Lift'], openAlerts: 1 },
      { id: 'Zone C', name: 'Zone C – Steel & Cladding Yard', description: 'Panels storage and loading bay layout', riskScore: 20, activeWorkers: 22, equipment: ['Forklift'], openAlerts: 1 },
      { id: 'Zone D', name: 'Zone D – Heavy Machinery Yard', description: 'Equipment parking, fuel storage depot', riskScore: 30, activeWorkers: 6, equipment: ['Excavator'], openAlerts: 0 },
      { id: 'Zone E', name: 'Zone E – Main Entrance & Office', description: 'Modular site offices, gate entry portal', riskScore: 8, activeWorkers: 24, equipment: [], openAlerts: 0 },
      { id: 'Zone F', name: 'Zone F – Restricted Power Vault', description: 'HV transformers and site panels', riskScore: 70, activeWorkers: 10, equipment: ['Generator'], openAlerts: 2 }
    ],
    violations: [
      { id: 'V-4001', violation: 'Failure to hook scissor lift harness', zone: 'Zone B', severity: 'Critical', detectedTime: '07:15', status: 'Active' },
      { id: 'V-4002', violation: 'Improper storage of gas cylinder', zone: 'Zone C', severity: 'Warning', detectedTime: '08:40', status: 'Active' },
      { id: 'V-4003', violation: 'Litter blocking loading path', zone: 'Zone C', severity: 'Warning', detectedTime: '10:00', status: 'Resolved' },
      { id: 'V-4004', violation: 'No chin strap on helmet at height', zone: 'Zone B', severity: 'Warning', detectedTime: '10:45', status: 'Active' }
    ],
    tasks: [
      { id: 'T-401', name: 'Excavation & Backfill', zone: 'Zone A', owner: 'Excavation Crew', dueDate: '02 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-402', name: 'Steel Anchor Bolt Fixing', zone: 'Zone A', owner: 'Structural Sub', dueDate: '12 Aug', progress: 100, status: 'COMPLETED' },
      { id: 'T-403', name: 'Steel Frame Erection', zone: 'Zone B', owner: 'Structural Sub', dueDate: '25 Aug', progress: 90, status: 'IN PROGRESS' },
      { id: 'T-404', name: 'Roof Truss Laying', zone: 'Zone B', owner: 'Cladding Team', dueDate: '01 Sep', progress: 50, status: 'IN PROGRESS' },
      { id: 'T-405', name: 'Wall Insulated Cladding', zone: 'Zone C', owner: 'Cladding Team', dueDate: '08 Sep', progress: 0, status: 'PENDING' },
      { id: 'T-406', name: 'Storm Water Drainage Install', zone: 'Zone D', owner: 'Plumbing Crew', dueDate: '12 Sep', progress: 0, status: 'PENDING' }
    ],
    predictions: [
      { id: 'P-401', title: 'PROJECT DELAY', metric: '1 Day', subtext: '30% probability', probability: '30%', severity: 'Low', details: 'Minor layout adjustment needed on roof truss brackets for loading docks.', mitigation: 'Adjust pre-fab templates in local shop prior to crane lift.' },
      { id: 'P-402', title: 'SAFETY INCIDENT RISK', metric: '12%', subtext: 'Safe site record', probability: '12%', severity: 'Low', details: 'Regular inspections have minimized violations, though wind shear risk exists in afternoon.', mitigation: 'Monitor local wind anemometer and pause crane lifts if winds exceed 20 mph.' }
    ],
    materials: [
      { name: 'Cement', utilization: 50, status: 'Normal', trend: 'stable' },
      { name: 'Steel Frame Girders', utilization: 90, status: 'Normal', trend: 'stable' },
      { name: 'Roof Cladding Sheets', utilization: 88, status: 'Normal', trend: 'up' },
      { name: 'Sand & Base Rock', utilization: 60, status: 'Normal', trend: 'stable' },
      { name: 'Safety Harness Kits', utilization: 95, status: 'Normal', trend: 'stable' }
    ],
    inspections: [
      { id: 'I-801', area: 'Zone A Floor Finish', inspector: 'J. Smith', date: '18 Aug', result: 'Pass', status: 'Completed' },
      { id: 'I-802', area: 'Zone B Steel Bolts', inspector: 'A. Rehman', date: '25 Aug', result: 'Pass', status: 'Completed' },
      { id: 'I-803', area: 'Zone B Portal Align', inspector: 'S. Al-Mutawa', date: '28 Aug', result: 'Pass', status: 'Pending' }
    ],
    defects: [
      { name: 'Structural', value: 2 },
      { name: 'Electrical', value: 0 },
      { name: 'Finishing', value: 1 },
      { name: 'Materials', value: 1 }
    ],
    equipment: [
      { name: 'Mobile Crane 04', status: 'Active', location: 'Zone B', utilization: 80, nextMaintenance: '16 hrs' },
      { name: 'Articulated Scissor Lift', status: 'Active', location: 'Zone B', utilization: 72, nextMaintenance: '40 hrs' },
      { name: 'Counterbalanced Forklift', status: 'Active', location: 'Zone C', utilization: 85, nextMaintenance: '10.5 hrs' }
    ],
    weather: {
      location: 'Riverside Logistics Park Site',
      temp: 29,
      condition: 'Sunny',
      humidity: 58,
      windSpeed: 11,
      rainProb: 5,
      forecast: [
        { day: 'Fri', temp: 29, icon: 'Sun', rainProb: 5 },
        { day: 'Sat', temp: 31, icon: 'Sun', rainProb: 0 },
        { day: 'Sun', temp: 32, icon: 'Sun', rainProb: 0 },
        { day: 'Mon', temp: 30, icon: 'CloudSun', rainProb: 15 },
        { day: 'Tue', temp: 28, icon: 'Cloud', rainProb: 20 },
        { day: 'Wed', temp: 28, icon: 'CloudRain', rainProb: 40 },
        { day: 'Thu', temp: 30, icon: 'Sun', rainProb: 10 }
      ],
      impacts: { rain: 'Low', wind: 'Low', heat: 'Medium' }
    }
  }
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export const mockAgentReplies: Record<string, string> = {
  "how many safety violations happened today?": "Today, there have been a total of 7 active and resolved safety violations across our site. Currently, there are 4 active safety violations: 2 critical (Missing Safety Helmet in Zone B and Restricted Area Access in Zone F) and 2 warnings (Unsafe Equipment Operation in Zone D and Missing Safety Gloves in Zone C).",
  "what is causing the current project risk?": "The main risk drivers are the delayed first-floor column casting in Zone B (due to higher concrete curing moisture levels), material tightness for steel reinforcements (depleting in 6 days), and the critical safety harness violation in Zone B.",
  "which equipment needs maintenance?": "The Diesel Generator 02 in Zone F is currently under scheduled maintenance. Additionally, the Rough-Terrain Forklift in Zone C is at high utilization (90%) and requires scheduled oil/filter maintenance in 8 hours.",
  "will the project be delayed?": "Yes, our predictive model flags a 3-Day structural delay warning (72% probability) for Skyline Tower Phase II, driven by casting curing times. We recommend deploying industrial dehumidifiers to accelerate structural casting.",
  "generate today's safety report.": "Generating Site Sentinel Safety Report for August 28, 2026...\n\n- Safety Score: 91% (PPE compliance driven)\n- Inspected Zones: Zone A, Zone B, Zone D, Zone F\n- Active Violations: 4 (2 Critical, 2 Warnings)\n- PPE Adherence: 80% at Worker Entry gate scanner.\n\nYou can preview and download the official PDF under the 'Reports' module."
};

export const defaultAgentGreeting = "Hello! I am Site Sentinel's Agentic AI. I monitor structural telemetry, video safety feeds, and timeline dependencies. How can I assist you with site operations today?";

// Seeding 20 workers datasets
export const initialWorkers: Worker[] = [
  { id: 'w-1', workerId: 'WRK-1001', name: 'Ramesh Kumar', role: 'Construction Worker', phone: '+91 98765 43210', email: 'ramesh@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false, safetyNotes: 'First floor casting crew lead. No harness issues.' },
  { id: 'w-2', workerId: 'WRK-1002', name: 'Suresh Patel', role: 'Safety Supervisor', phone: '+91 98765 43211', email: 'suresh@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone E', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false, safetyNotes: 'Carries secondary radio. Checked for gate override permissions.' },
  { id: 'w-3', workerId: 'WRK-1003', name: 'Arjun Singh', role: 'Electrician', phone: '+91 98765 43212', email: 'arjun@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone C', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'Zone Specific', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false, safetyNotes: 'Handles structural grid routing.' },
  { id: 'w-4', workerId: 'WRK-1004', name: 'Mahesh Kumar', role: 'Machine Operator', phone: '+91 98765 43213', email: 'mahesh@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone D', status: 'INACTIVE', accessStatus: 'REVOKED', accessLevel: 'Restricted Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-08-20', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: false, badge: true }, isArchived: false, safetyNotes: 'Crane license renewal pending. Access suspended.' },
  { id: 'w-5', workerId: 'WRK-1005', name: 'Rishik Kamala', role: 'Project Manager', phone: '+91 98765 43214', email: 'rishik@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone A', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2027-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: false, badge: true }, isArchived: false },
  { id: 'w-6', workerId: 'WRK-1006', name: 'Sarah Al-Mutawa', role: 'Engineer', phone: '+91 98765 43215', email: 'sarah@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-02-15', accessExpiryDate: '2026-12-31', registrationDate: '2026-02-15', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: false, badge: true }, isArchived: false },
  { id: 'w-7', workerId: 'WRK-1007', name: 'John Manager', role: 'Project Manager', phone: '+91 98765 43216', email: 'manager@example.com', assignedProject: 'Harbour Bridge Retrofit', assignedZone: 'Zone D', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2027-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: false, badge: true }, isArchived: false },
  { id: 'w-8', workerId: 'WRK-1008', name: 'Tanveer Ahmed', role: 'Supervisor', phone: '+91 98765 43217', email: 'tanveer@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone A', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-03-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-03-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-9', workerId: 'WRK-1009', name: 'Jacob Smith', role: 'Engineer', phone: '+91 98765 43218', email: 'jacob@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone F', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'Restricted Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-10', workerId: 'WRK-1010', name: 'Ahmed Rehman', role: 'Supervisor', phone: '+91 98765 43219', email: 'ahmed@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-11', workerId: 'WRK-1011', name: 'Devendra Prasad', role: 'Construction Worker', phone: '+91 98765 43220', email: 'devendra@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone A', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-12', workerId: 'WRK-1012', name: 'Ling Wu', role: 'Machine Operator', phone: '+91 98765 43221', email: 'ling@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'Zone Specific', accessStartDate: '2026-04-10', accessExpiryDate: '2026-12-31', registrationDate: '2026-04-10', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-13', workerId: 'WRK-1013', name: 'Chen Wei', role: 'Electrician', phone: '+91 98765 43222', email: 'chen@example.com', assignedProject: 'Metro Line 4 – Depot', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: false, badge: true }, isArchived: false },
  { id: 'w-14', workerId: 'WRK-1014', name: 'Ali Hassan', role: 'Construction Worker', phone: '+91 98765 43223', email: 'ali@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-15', workerId: 'WRK-1015', name: 'Omar Farooq', role: 'Safety Officer', phone: '+91 98765 43224', email: 'omar@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone E', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-16', workerId: 'WRK-1016', name: 'Sanjay Dutt', role: 'Construction Worker', phone: '+91 98765 43225', email: 'sanjay@example.com', assignedProject: 'Riverside Logistics Park', assignedZone: 'Zone C', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-02-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-02-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-17', workerId: 'WRK-1017', name: 'Fatima Zahra', role: 'Engineer', phone: '+91 98765 43226', email: 'fatima@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone A', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-05-15', accessExpiryDate: '2026-12-31', registrationDate: '2026-05-15', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: false, badge: true }, isArchived: false },
  { id: 'w-18', workerId: 'WRK-1018', name: 'Chloe Bennett', role: 'Visitor', phone: '+91 98765 43227', email: 'chloe@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone E', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'Restricted Access', accessStartDate: '2026-08-28', accessExpiryDate: '2026-08-28', registrationDate: '2026-08-28', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: false, gloves: false, badge: true }, isArchived: false },
  { id: 'w-19', workerId: 'WRK-1019', name: 'Lucas Martinez', role: 'Construction Worker', phone: '+91 98765 43228', email: 'lucas@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone D', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false },
  { id: 'w-20', workerId: 'WRK-1020', name: 'Mia Johansson', role: 'Engineer', phone: '+91 98765 43229', email: 'mia@example.com', assignedProject: 'Skyline Tower – Phase II', assignedZone: 'Zone B', status: 'ACTIVE', accessStatus: 'AUTHORIZED', accessLevel: 'General Access', accessStartDate: '2026-01-01', accessExpiryDate: '2026-12-31', registrationDate: '2026-01-01', photo: null, ppeRequirements: { helmet: true, vest: true, shoes: true, gloves: true, badge: true }, isArchived: false }
];

// Seeding 50 entry & exit logs datasets
export const initialEntryLogs: EntryLog[] = [
  // 10 On site
  { id: 'log-1', workerId: 'WRK-1001', workerName: 'Ramesh Kumar', entryDate: '2026-08-28', entryTime: '08:42 AM', exitDate: null, exitTime: null, zone: 'Zone B', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-2', workerId: 'WRK-1002', workerName: 'Suresh Patel', entryDate: '2026-08-28', entryTime: '08:15 AM', exitDate: null, exitTime: null, zone: 'Zone E', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-3', workerId: 'WRK-1003', workerName: 'Arjun Singh', entryDate: '2026-08-28', entryTime: '09:15 AM', exitDate: null, exitTime: null, zone: 'Zone C', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-5', workerId: 'WRK-1005', workerName: 'Rishik Kamala', entryDate: '2026-08-28', entryTime: '07:30 AM', exitDate: null, exitTime: null, zone: 'Zone A', ppeScore: 80, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-6', workerId: 'WRK-1006', workerName: 'Sarah Al-Mutawa', entryDate: '2026-08-28', entryTime: '08:00 AM', exitDate: null, exitTime: null, zone: 'Zone B', ppeScore: 80, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-8', workerId: 'WRK-1008', workerName: 'Tanveer Ahmed', entryDate: '2026-08-28', entryTime: '07:15 AM', exitDate: null, exitTime: null, zone: 'Zone A', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-9', workerId: 'WRK-1009', workerName: 'Jacob Smith', entryDate: '2026-08-28', entryTime: '08:10 AM', exitDate: null, exitTime: null, zone: 'Zone F', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-10', workerId: 'WRK-1010', workerName: 'Ahmed Rehman', entryDate: '2026-08-28', entryTime: '07:05 AM', exitDate: null, exitTime: null, zone: 'Zone B', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-11', workerId: 'WRK-1011', workerName: 'Devendra Prasad', entryDate: '2026-08-28', entryTime: '08:20 AM', exitDate: null, exitTime: null, zone: 'Zone A', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },
  { id: 'log-12', workerId: 'WRK-1012', workerName: 'Ling Wu', entryDate: '2026-08-28', entryTime: '08:50 AM', exitDate: null, exitTime: null, zone: 'Zone B', ppeScore: 100, accessResult: 'ALLOWED', status: 'ON SITE', denialReason: null },

  // 4 Denied logs today
  { id: 'log-4', workerId: 'WRK-1004', workerName: 'Mahesh Kumar', entryDate: '2026-08-28', entryTime: '10:02 AM', exitDate: null, exitTime: null, zone: 'Zone D', ppeScore: 60, accessResult: 'DENIED', status: 'ACCESS DENIED', denialReason: 'Access Revoked' },
  { id: 'log-21', workerId: 'WRK-1018', workerName: 'Chloe Bennett', entryDate: '2026-08-28', entryTime: '11:15 AM', exitDate: null, exitTime: null, zone: 'Zone E', ppeScore: 40, accessResult: 'DENIED', status: 'ACCESS DENIED', denialReason: 'PPE not compliant' },
  { id: 'log-22', workerId: 'WRK-1004', workerName: 'Mahesh Kumar', entryDate: '2026-08-28', entryTime: '07:20 AM', exitDate: null, exitTime: null, zone: 'Zone B', ppeScore: 80, accessResult: 'DENIED', status: 'ACCESS DENIED', denialReason: 'Access Expired' },
  { id: 'log-23', workerId: 'WRK-1004', workerName: 'Mahesh Kumar', entryDate: '2026-08-28', entryTime: '09:00 AM', exitDate: null, exitTime: null, zone: 'Zone F', ppeScore: 60, accessResult: 'DENIED', status: 'ACCESS DENIED', denialReason: 'Restricted zone' },

  // 36 Exited logs (spanning last 3 days)
  { id: 'log-101', workerId: 'WRK-1001', workerName: 'Ramesh Kumar', entryDate: '2026-08-27', entryTime: '08:30 AM', exitDate: '2026-08-27', exitTime: '05:30 PM', zone: 'Zone B', ppeScore: 100, accessResult: 'ALLOWED', status: 'EXITED', denialReason: null },
  { id: 'log-102', workerId: 'WRK-1002', workerName: 'Suresh Patel', entryDate: '2026-08-27', entryTime: '08:00 AM', exitDate: '2026-08-27', exitTime: '05:00 PM', zone: 'Zone E', ppeScore: 100, accessResult: 'ALLOWED', status: 'EXITED', denialReason: null },
  { id: 'log-103', workerId: 'WRK-1003', workerName: 'Arjun Singh', entryDate: '2026-08-27', entryTime: '09:00 AM', exitDate: '2026-08-27', exitTime: '06:00 PM', zone: 'Zone C', ppeScore: 100, accessResult: 'ALLOWED', status: 'EXITED', denialReason: null },
  ...Array.from({ length: 33 }).map((_, i) => {
    const day = 25 + (i % 3); // 25, 26, 27 Aug
    const names = ['Ali Hassan', 'Lucas Martinez', 'Mia Johansson', 'Sarah Al-Mutawa', 'Tanveer Ahmed', 'Ahmed Rehman', 'Devendra Prasad', 'Ling Wu'];
    const selectedName = names[i % names.length];
    const wrkId = `WRK-10${10 + (i % names.length)}`;
    return {
      id: `log-seed-${i}`,
      workerId: wrkId,
      workerName: selectedName,
      entryDate: `2026-08-${day}`,
      entryTime: `07:${10 + (i * 2) % 45} AM`,
      exitDate: `2026-08-${day}`,
      exitTime: `05:${10 + (i * 3) % 45} PM`,
      zone: `Zone ${(i % 3) === 0 ? 'A' : (i % 3) === 1 ? 'B' : 'C'}`,
      ppeScore: 80 + ((i * 5) % 21),
      accessResult: 'ALLOWED' as const,
      status: 'EXITED' as const,
      denialReason: null
    };
  })
];
