import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Zone } from '../utils/sensorApi'; // Assuming Zone is still defined here
import { getZones, createZone, updateZone, deleteZone } from '../utils/zoneApi';

const ZoneManagement: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await getZones();
      setZones(data);
    } catch (err) {
      setError('Failed to fetch zones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (zone: Zone | null = null) => {
    setCurrentZone(zone);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentZone(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const name = formData.get('name') as string;
    const wateringRequirementLiters = parseFloat(formData.get('wateringRequirementLiters') as string);
    const wateringIntervalHours = parseInt(formData.get('wateringIntervalHours') as string, 10);
    const valveNumber = parseInt(formData.get('valveNumber') as string, 10);

    if (isNaN(wateringRequirementLiters) || isNaN(wateringIntervalHours) || isNaN(valveNumber)) {
      setError('Please enter valid numbers for watering requirements, interval, and valve number.');
      return;
    }

    try {
      if (currentZone) {
        await updateZone({ ...currentZone, name, wateringRequirementLiters, wateringIntervalHours, valveNumber });
        setSnackbarMessage('Zone updated successfully!');
        setSnackbarSeverity('success');
      } else {
        await createZone({ name, wateringRequirementLiters, wateringIntervalHours, valveNumber });
        setSnackbarMessage('Zone created successfully!');
        setSnackbarSeverity('success');
      }
      fetchZones();
      handleCloseDialog();
    } catch (err) {
      setSnackbarMessage(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
      setSnackbarSeverity('error');
      console.error(err);
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteZone(id);
      fetchZones();
      setSnackbarMessage('Zone deleted successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
      setSnackbarSeverity('error');
      console.error(err);
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Irrigation Zone Management</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add New Zone
      </Button>

      {loading ? (
        <Typography>Loading zones...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : zones.length === 0 ? (
        <Typography>No zones found. Add a new one!</Typography>
      ) : (
        <List>
          {zones.map((zone) => (
            <ListItem key={zone.id} divider>
              <ListItemText
                primary={zone.name}
                secondary={
                  `Watering: ${zone.wateringRequirementLiters}L every ${zone.wateringIntervalHours}h | Valve: ${zone.valveNumber}`
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(zone)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(zone.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
        <DialogTitle>{currentZone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Zone Name"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={currentZone?.name || ''}
            required
          />
          <TextField
            margin="dense"
            name="wateringRequirementLiters"
            label="Watering Requirement (Liters)"
            type="number"
            fullWidth
            variant="standard"
            defaultValue={currentZone?.wateringRequirementLiters || ''}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            name="wateringIntervalHours"
            label="Watering Interval (Hours)"
            type="number"
            fullWidth
            variant="standard"
            defaultValue={currentZone?.wateringIntervalHours || ''}
            required
          />
          <TextField
            margin="dense"
            name="valveNumber"
            label="Valve Number"
            type="number"
            fullWidth
            variant="standard"
            defaultValue={currentZone?.valveNumber || ''}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button type="submit">{currentZone ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ZoneManagement;
