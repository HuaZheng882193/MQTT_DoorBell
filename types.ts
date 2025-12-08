export interface SimulationState {
  // Device Power States
  doorbellPower: boolean;
  
  // Network/Server States
  serverOnline: boolean;
  serverLogs: string[];
  
  // Connection States
  phoneConnected: boolean; // Phone is subscribed to topic
  
  // Activity States
  isPressing: boolean;
  isRinging: boolean; // Phone notification active
  
  // Animation States
  packetLocation: 'idle' | 'doorbell-to-server' | 'processing' | 'server-to-phone';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface LabStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}
