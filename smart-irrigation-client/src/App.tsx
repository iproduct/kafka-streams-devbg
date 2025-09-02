import { AppBar, Toolbar, Typography, IconButton, Box, Card, CardContent, Grid, Button, LinearProgress, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, type IoTData, type WebSocketIncomingMessage } from './utils/sensorApi';
import EchartsReact from 'echarts-for-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import ZoneManagement from './pages/ZoneManagement';
import { getZones } from './utils/zoneApi';
import { type Zone } from './utils/sensorApi';

const MAX_HISTORY_POINTS = 500; // Limit historical data points
const MAX_VOLUME_DISPLAY = 100; // Max volume for display in liters, adjust as needed

function App() {
  const [iotData, setIotData] = useState<IoTData | null>(null);
  const [commandAck, setCommandAck] = useState<string | null>(null);
  const historicalDataRef = useRef<IoTData[]>([]);
  const [, setHistoricalDataTrigger] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesByValve, setZonesByValve] = useState<Map<number, Zone>>(new Map());

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

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
        data: historicalDataRef.current.map(data => data.volumes[0]),
      },
      {
        name: 'Flow 2',
        type: 'line',
        data: historicalDataRef.current.map(data => data.volumes[1]),
      },
      {
        name: 'Flow 3',
        type: 'line',
        data: historicalDataRef.current.map(data => data.volumes[2]),
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
    series: iotData?.moists.map((_, index) => ({
      name: `Moisture ${index + 1}`,
      type: 'line',
      data: historicalDataRef.current.map(data => data.moists[index]),
    })) || [],
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

  useEffect(() => {
    const fetchZonesData = async () => {
      try {
        const zonesData = await getZones();
        setZones(zonesData);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    };
    fetchZonesData();
  }, []);

  useEffect(() => {
    const mapZonesByValve = () => {
      const newMap = new Map<number, Zone>();
      zones.forEach(zone => {
        newMap.set(zone.valveNumber, zone);
      });
      setZonesByValve(newMap);
    };
    mapZonesByValve();
  }, [zones]);

  const handleValveControl = (valve: number, newState: boolean) => {
    if (newState) {
      sendWebSocketMessage({ deviceId: "IR_CONTROLLER_01", command: "OPEN_VALVE", valve: valve });
    } else {
      sendWebSocketMessage({ deviceId: "IR_CONTROLLER_01", command: "CLOSE_VALVE", valve: valve });
    }
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ width: '100%' }}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Smart Irrigation
            </Typography>
            {/* Removed direct links from AppBar */}
          </Toolbar>
        </AppBar>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/">
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/zones">
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Zone Management" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ p: 3, mt: 8 }}> {/* Added mt for spacing below AppBar */}
          <Routes>
            <Route path="/" element={(
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
                      {iotData?.volumes.map((volume, index) => {
                        const wateringRequirement = zonesByValve.get(index)?.wateringRequirementLiters || 100;
                        return (
                          <Typography variant="body2" sx={{ mt: 1 }} key={`flow-${index}`}>
                            Flow Volume {index + 1}: {volume?.toFixed(2)} L / {wateringRequirement} L
                            <LinearProgress
                              variant="determinate"
                              value={((volume || 0) / wateringRequirement) * 100}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Typography>
                        );
                      })}
                      {iotData?.moists.map((moist, index) => (
                        <Typography variant="body2" sx={{ mt: 1 }} key={`moist-${index}`}>
                          Moisture {index + 1}: {moist}<br />
                        </Typography>
                      ))}
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
                      <EchartsReact option={flowChartOptions} style={{ height: '300px', width: '100%', marginBottom: '20px' }} />
                      <EchartsReact option={moistureChartOptions} style={{ height: '300px', width: '100%' }} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Last Update: {iotData?.time ? new Date(iotData.time).toLocaleTimeString() : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )} />
            <Route path="/zones" element={<ZoneManagement />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
