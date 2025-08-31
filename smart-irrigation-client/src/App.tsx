import { AppBar, Toolbar, Typography, IconButton, Box, Card, CardContent, Grid, Button, LinearProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, type IoTData, type WebSocketIncomingMessage } from './utils/sensorApi';
import EchartsReact from 'echarts-for-react';

const MAX_HISTORY_POINTS = 500; // Limit historical data points
const MAX_VOLUME_DISPLAY = 100; // Max volume for display in liters, adjust as needed

function App() {
  const [iotData, setIotData] = useState<IoTData | null>(null);
  const [commandAck, setCommandAck] = useState<string | null>(null);
  const historicalDataRef = useRef<IoTData[]>([]);
  const [, setHistoricalDataTrigger] = useState(0); // Dummy state to trigger re-renders

  const flowChartOptions = {
    title: {
      text: 'Flow Meter Data',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: historicalDataRef.current.map(data => new Date(data.time).toLocaleTimeString()),
    },
    yAxis: {
      type: 'value',
      name: 'Flow Volume (L)',
    },
    series: [
      {
        name: 'Flow 1',
        type: 'line',
        data: historicalDataRef.current.map(data => data.volume1),
      },
      {
        name: 'Flow 2',
        type: 'line',
        data: historicalDataRef.current.map(data => data.volume2),
      },
      {
        name: 'Flow 3',
        type: 'line',
        data: historicalDataRef.current.map(data => data.volume3),
      },
    ],
  };

  const moistureChartOptions = {
    title: {
      text: 'Moisture Sensor Data',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: historicalDataRef.current.map(data => new Date(data.time).toLocaleTimeString()),
    },
    yAxis: {
      type: 'value',
      name: 'Moisture Level',
    },
    series: [
      {
        name: 'Moisture 1',
        type: 'line',
        data: historicalDataRef.current.map(data => data.moist01),
      },
      {
        name: 'Moisture 2',
        type: 'line',
        data: historicalDataRef.current.map(data => data.moist02),
      },
    ],
  };

  useEffect(() => {
    connectWebSocket((message: WebSocketIncomingMessage) => {
      if (message.type === "state") {
        setIotData(message);
        historicalDataRef.current = [...historicalDataRef.current, message].slice(-MAX_HISTORY_POINTS);
        setHistoricalDataTrigger(prev => prev + 1); // Trigger re-render
      } else if (message.type === "command_ack") {
        setCommandAck(`Command ACK for: ${message.command}`);
        // Optionally clear the ack message after some time
        setTimeout(() => setCommandAck(null), 5000);
      }
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => disconnectWebSocket();
  }, []);

  const handleValveControl = (valve: number, newState: boolean) => {
    if (newState) {
      sendWebSocketMessage({ deviceId: "IR_CONTROLLER_01", command: "OPEN_VALVE", valve: valve });
    } else {
      sendWebSocketMessage({ deviceId: "IR_CONTROLLER_01", command: "CLOSE_VALVE", valve: valve });
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Irrigation Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Sensor Data
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Current Readings
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Flow Volume 1: {iotData?.volume1?.toFixed(2)} L
                  <LinearProgress variant="determinate" value={((iotData?.volume1 || 0) / MAX_VOLUME_DISPLAY) * 100} sx={{ height: 10, borderRadius: 5 }} />
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Flow Volume 2: {iotData?.volume2?.toFixed(2)} L
                  <LinearProgress variant="determinate" value={((iotData?.volume2 || 0) / MAX_VOLUME_DISPLAY) * 100} sx={{ height: 10, borderRadius: 5 }} />
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Flow Volume 3: {iotData?.volume3?.toFixed(2)} L
                  <LinearProgress variant="determinate" value={((iotData?.volume3 || 0) / MAX_VOLUME_DISPLAY) * 100} sx={{ height: 10, borderRadius: 5 }} />
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Moisture 1: {iotData?.moist01}<br />
                  Moisture 2: {iotData?.moist02}<br />
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Irrigation Control
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Valves Status
                </Typography>
                {iotData?.valves.map((valveState, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">Valve {index}: {valveState ? 'Open' : 'Closed'}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={() => handleValveControl(index, true)}
                      disabled={!!valveState}
                    >
                      Open Valve {index}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleValveControl(index, false)}
                      disabled={!valveState}
                    >
                      Close Valve {index}
                    </Button>
                  </Box>
                ))}
                {commandAck && <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>{commandAck}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Charts & Analytics
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Data Visualization
                </Typography>
                <Typography variant="body2">
                  (Placeholder for charts)
                </Typography>
                <EchartsReact option={flowChartOptions} style={{ height: '300px', width: '100%', marginBottom: '20px' }} />
                <EchartsReact option={moistureChartOptions} style={{ height: '300px', width: '100%' }} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Last Update: {iotData?.time ? new Date(iotData.time).toLocaleTimeString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App;
