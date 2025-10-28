import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Paper,
  Typography,
  Select,
  MenuItem,
  Box,
  Alert,
  LinearProgress,
  Button,
  IconButton,
  ThemeProvider,
  createTheme,
  useTheme
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Configuration
const API_URL = "https://script.google.com/macros/s/AKfycbzyxIqxRSjqwx2iH_2wEYaXRT8PJRhm89w7_0Ig6NUY5tP3x0oXk1a1Vv2PYJc-ybo-/exec";
const SHEET_OPTIONS = ['gateway', 'kioske'];

// Thème MUI personnalisé
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      background: {
        default: '#1e293b',
        paper: '#334155',
      },
    } : {
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
    }),
  },
});

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState('gateway');
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('light');
  const muiTheme = createTheme(getDesignTokens(mode));

  const themeClass = mode === 'dark' ? 'dark bg-slate-800' : 'bg-slate-50';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}?action=read&sheet=${sheet}&limit=100`);
      
      let receivedData = response.data;

      if (!Array.isArray(receivedData)) {
        receivedData = typeof receivedData === 'object' && receivedData !== null 
          ? [receivedData] 
          : [];
      }

      const processedData = sheet === 'gateway' 
        ? processGatewayData(receivedData)
        : processKioskeData(receivedData);
      
      setData(processedData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Erreur: ${errorMessage}`);
      setData([]);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [sheet]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processGatewayData = (rawData) => {
    return rawData.map((row, index) => {
      if (typeof row !== 'object' || row === null) {
        return {
          id: `error-${index}`,
          date: 'N/A',
          device: 'Inconnu',
          battery: 0,
          batteryStatus: 'low',
          rawData: 'Invalid row data'
        };
      }

      const id = row.id || `${row.Date || 'unknown'}-${row.Device || 'unknown'}-${index}`;
      const date = new Date(row.Timestamp);
      const options = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const formattedDate = date.toLocaleString('fr-FR', options);

      const device = row["  Device"] || row[" Device"] || row["Device"] || 'unknown';
      const info = row[" Info"] || row["Info"] || row["Data"] || '';
      const batteryValue = parseFloat(extractBatteryValue(info));
      
      let batteryStatus = 'ok';
      let batteryClass = '';
      
      if (batteryValue < 2) {
        batteryStatus = 'critical';
        batteryClass = 'battery-critical';
      } else if (batteryValue < 3.5) {
        batteryStatus = 'low';
        batteryClass = 'battery-low';
      }

      return {
        id,
        date: formattedDate,
        device: device,
        battery: batteryValue,
        batteryStatus,
        batteryClass,
        rawData: JSON.stringify(row)
      };
    });
  };

  const processKioskeData = (rawData) => {
    return rawData.map((row, index) => {
      if (typeof row !== 'object' || row === null) {
        return {
          id: `error-${index}`,
          DeviceID: 'N/A',
          Tension: '0',
          Date: 'N/A',
          UID: 'N/A',
          Montant: '0',
          Durée: '0',
          batteryStatus: 'ok',
          batteryClass: ''
        };
      }

      const id = row.id || `${row.DeviceID || 'unknown'}-${index}`;
      const date = new Date(row.date);
      const options = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const formattedDate = date.toLocaleString('fr-FR', options);
      
      const tension = parseFloat(row.Tension || row.batt_voltage || '0');
      let batteryStatus = 'ok';
      let batteryClass = '';
      
      if (tension < 2) {
        batteryStatus = 'critical';
        batteryClass = 'battery-critical';
      } else if (tension < 3.5) {
        batteryStatus = 'low';
        batteryClass = 'battery-low';
      }
      return {
        id,
        DeviceID:row.deviceID ,
        Tension: tension,
        Date: formattedDate,
        UID: row.card_UID ,
        Montant: row.Montant ,
        Durée: row.dureeDis ,
        batteryStatus,
        batteryClass
      };
    });
  };

  const extractBatteryValue = (dataString) => {
    if (!dataString) return 0;
    const match = dataString.match(/\bbatterie\s*=\s*([0-9]+\.?[0-9]*)/i);
    return match ? parseFloat(match[1]) : 0;
  };

  const handleSheetChange = (event) => {
    setSheet(event.target.value);
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const formatDate = (value) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
  };

  const formatVoltage = (value) => {
    return value !== undefined ? `${value.toFixed(2)} V` : 'N/A';
  };

  const gatewayColumns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 200,
      valueFormatter: (params) =>params
    },
    { field: 'device', headerName: 'Appareil', width: 150 },
    { 
      field: 'battery', 
      headerName: 'Batterie', 
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <div className={`flex items-center ${params.row.batteryClass}`}>
          {formatVoltage(params.value)}
          {params.row.batteryStatus === 'critical' && (
            <span className="badge-low ml-2">LOW</span>
          )}
        </div>
      )
    }
  ];

  const kioskeColumns = [
    { field: 'DeviceID', headerName: 'ID Appareil', width: 150 },
    { 
      field: 'Tension', 
      headerName: 'Tension', 
      width: 150,
      renderCell: (params) => (
        <div className={`flex items-center ${params.row.batteryClass}`}>
          {formatVoltage(params.value)}
          {params.row.batteryStatus === 'critical' && (
            <span className="badge-low ml-2">LOW</span>
          )}
        </div>
      )
    },
    { 
      field: 'Date', 
      headerName: 'Date', 
      width: 200,
      valueFormatter: (params) => params
    },
    { field: 'UID', headerName: 'UID Carte', width: 150 },
    { field: 'Montant', headerName: 'Montant', width: 100 },
    { field: 'Durée', headerName: 'Durée', width: 100 }
  ];

  const columns = sheet === 'gateway' ? gatewayColumns : kioskeColumns;

  return (
    <ThemeProvider theme={muiTheme}>
<div className={`flex flex-col min-h-screen ${themeClass} p-4`}>
  <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" gutterBottom component="h1">
                Analyse des Données
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Select
                  value={sheet}
                  onChange={handleSheetChange}
                  sx={{ minWidth: 200 }}
                  aria-label="Sélectionner la feuille de données"
                >
                  {SHEET_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                <Button 
                  variant="contained" 
                  onClick={fetchData} 
                  disabled={loading}
                  aria-busy={loading}
                >
                  Rafraîchir
                </Button>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Paper>

          <Paper elevation={3} sx={{ height: 600 }}>
            <DataGrid
              rows={data}
              columns={columns}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              components={{
                LoadingOverlay: LinearProgress
              }}
              getRowId={(row) => row.id}
              aria-label="Tableau des données"
            />
          </Paper>
        </Box>
      </div>
    </ThemeProvider>
  );
}