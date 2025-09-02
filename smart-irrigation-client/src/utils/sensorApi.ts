export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
}

export interface IoTData {
  type: "state";
  time: number;
  start_time: number;
  deviceId: string;
  valves: number[];
  flows: number[];
  moists: number[];
  volumes: number[];
}

export interface OpenValveCommand {
  deviceId: string;
  command: "OPEN_VALVE";
  valve: number;
}

export interface CloseValveCommand {
  deviceId: string;
  command: "CLOSE_VALVE";
  valve: number;
}

export interface OpenValvesCommand {
  deviceId: string;
  command: "OPEN_VALVES";
  valves: number[];
}

export interface CommandAckMessage {
  type: "command_ack";
  deviceId: string;
  command: string; // The command that was acknowledged, as a JSON string
}

export interface Zone {
  id: string;
  name: string;
  wateringRequirementLiters: number;
  wateringIntervalHours: number;
  valveNumber: number;
}

export type WebSocketCommand = OpenValvesCommand | OpenValveCommand | CloseValveCommand;

export type WebSocketIncomingMessage = IoTData | CommandAckMessage;

const WS_URL = 'ws://192.168.0.17:8080/ws';

let ws: WebSocket | null = null;

export const connectWebSocket = (onMessage: (data: WebSocketIncomingMessage) => void, onError: (error: Event) => void) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === "state") {
        const iotDataWithVolume: IoTData = {
          ...parsedData,
          time: parsedData.time + parsedData.start_time,
          flows: parsedData.flows || [],
          moists: parsedData.moists || [],
          volumes: (parsedData.flows || []).map((flow: number) => flow / 396.0),
        };
        onMessage(iotDataWithVolume as IoTData);
      } else if (parsedData.type === "command_ack") {
        onMessage(parsedData as CommandAckMessage);
      } else {
        console.warn("Unknown WebSocket message type:", parsedData.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect after a delay
    setTimeout(() => connectWebSocket(onMessage, onError), 5000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    onError(error);
    ws?.close(); // Close the connection on error to trigger reconnect
  };
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};

export const sendWebSocketMessage = (message: WebSocketCommand) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.warn('WebSocket is not open. Message not sent:', message);
  }
};
