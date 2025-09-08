// src/App.js (FINAL, TWO-VEHICLE, ENHANCED UI & ANIMATION)

import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import bearing from '@turf/bearing';

// --- ACTION REQUIRED: Update these constants with your latest deployment info ---
const contractAddress = "0xD8aBFcC7897b5bf880b3d5BB96bd9e264118e55a";
const contractABI = require("./abi/VehicleRegistry.json").abi; // Ensure this file is in src/abi/
const VEHICLE_1_ID = 1; // The ID for your first vehicle (from registerVehicle.js)
const VEHICLE_2_ID = 2; // The ID for your second vehicle (from registerVehicle2.js)
// ---
// The GPS coordinate for the center of the smart intersection
const INTERSECTION_COORDS = [34.0550, -118.2475];

// --- Helper function to create custom, colored SVG icons for vehicles ---
const getVehicleIcon = (status, rotation = 0) => {
  let color = '#4caf50'; // Default Green for "Moving"
  if (status === 'Waiting') color = '#ffc107'; // Yellow for "Waiting"
  if (status === 'Crossing') color = '#2196f3'; // Blue for "Crossing"
  
  // A top-down car SVG. The 'transform' attribute will rotate it.
  const iconHtml = `
    <div style="transform: rotate(${rotation}deg);">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36px" height="36px" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5));">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>
  `;
  
  return new L.DivIcon({
    html: iconHtml,
    className: 'vehicle-icon', // This class helps with animations
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// --- Custom React component to smoothly animate the Leaflet marker ---
const AnimatedMarker = ({ position, status, tokenId, previousPosition }) => {
  const markerRef = useRef(null);
  
  // Calculate rotation angle. Default to 0 if no previous position.
  let rotation = 0;
  if (previousPosition && (position[0] !== previousPosition[0] || position[1] !== previousPosition[1])) {
    rotation = bearing(previousPosition, position);
  }

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.setLatLng(position);
    }
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={getVehicleIcon(status, rotation)}
    >
      <Popup>Vehicle #{tokenId} <br/> Status: {status}</Popup>
    </Marker>
  );
};

// --- UI Component for displaying a single vehicle's data in the sidebar ---
const VehicleCard = ({ vehicleData }) => {
  if (!vehicleData) {
    return <div className="vehicle-card loading">Awaiting vehicle data...</div>;
  }

  const statusClass = vehicleData.status.toLowerCase();

  return (
    <div className="vehicle-card">
      <h3>
        <span className={`status-dot ${statusClass}`}></span>
        Vehicle #{vehicleData.tokenId}
      </h3>
      <div className="stat-item">
        <span className="icon">📍</span>
        <span>{vehicleData.location}</span>
      </div>
      <div className="stat-item">
        <span className="icon">⚡️</span>
        <span>{vehicleData.speed} km/h</span>
      </div>
       <div className="stat-item">
        <span className="icon">🚦</span>
        <span>Status: <strong>{vehicleData.status}</strong></span>
      </div>
      <a 
        href={`https://sonicscan.org/nft/${contractAddress}/${vehicleData.tokenId}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="nft-link"
      >
        View Live NFT on Explorer
      </a>
    </div>
  );
};

// --- Main Application Component ---
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [discoveredProviders, setDiscoveredProviders] = useState([]);
  const [contract, setContract] = useState(null);
  
  const [vehicle1Data, setVehicle1Data] = useState(null);
  const [vehicle2Data, setVehicle2Data] = useState(null);
  const pollingInterval = useRef(null);
  const [latestBlock, setLatestBlock] = useState(0);
  const prevVehicle1Pos = useRef(null);
  const prevVehicle2Pos = useRef(null);
  const readOnlyProvider = new ethers.JsonRpcProvider("https://rpc.soniclabs.com/");
  const readOnlyContract = new ethers.Contract(contractAddress, contractABI, readOnlyProvider);

  useEffect(() => {
    const onAnnounceProvider = (event) => {
      const announcedProvider = event.detail;
      setDiscoveredProviders((p) => p.find((i) => i.info.uuid === announcedProvider.info.uuid) ? p : [...p, announcedProvider]);
    };
    window.addEventListener('eip6963:announceProvider', onAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return () => window.removeEventListener('eip6963:announceProvider', onAnnounceProvider);
  }, []);

  // Helper function to process raw contract data into a usable state object
  const processData = (data) => {
    if (!data || data.length < 5) return null;
    const tokenId = Number(data[0]);
    const location = data[1];
    const speed = Number(data[2]);
    const statusEnum = Number(data[4]);
    let statusString = "Moving";
    if (statusEnum === 1) statusString = "Waiting";
    if (statusEnum === 2) statusString = "Crossing";
    if (typeof location !== 'string' || !location.includes(',')) return null;
    const [lat, lng] = location.split(',').map(Number);
    return { position: [lat, lng], tokenId, location, speed, status: statusString };
  };

  const fetchAllVehicleData = async () => {
    try {
      const [blockNumber, data1, data2] = await Promise.all([
        readOnlyProvider.getBlockNumber(),
        readOnlyContract.getVehicleState(VEHICLE_1_ID),
        readOnlyContract.getVehicleState(VEHICLE_2_ID)
      ]);
      
      const v1Processed = processData(data1);
      const v2Processed = processData(data2);

      // Store the current position as the "previous" for the next fetch
      if(v1Processed) {
        prevVehicle1Pos.current = vehicle1Data?.position;
        setVehicle1Data(v1Processed);
      }
      if(v2Processed) {
        prevVehicle2Pos.current = vehicle2Data?.position;
        setVehicle2Data(v2Processed);
      }
      
      setLatestBlock(blockNumber);
    } catch (error) {
      console.error("Could not fetch vehicle data:", error.message);
    }
  };
  
  const connectWallet = async (providerInfo) => {
    // This function is now ONLY responsible for connecting the wallet for identity.
    try {
      const browserProvider = new ethers.BrowserProvider(providerInfo.provider);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) { 
      console.error(`Error connecting:`, error); 
    }
  };
  
  // This useEffect now controls the polling loop and starts ON APP LOAD.
  // It no longer depends on the wallet being connected.
  useEffect(() => {
    fetchAllVehicleData(); // Fetch once immediately when the app loads
    pollingInterval.current = setInterval(fetchAllVehicleData, 2000); // Poll every 2 seconds
    
    // Cleanup function to stop polling when we leave the page
    return () => {
      if(pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const mapCenter = vehicle1Data?.position || INTERSECTION_COORDS;

  return (
    <div className="App">
      <div className="sidebar">
        <div className="header">
          <h2>SonicPulse</h2>
          <p>On-Chain Coordination Demo</p>
        </div>
        
        {!walletAddress ? (
           <div className="wallet-selection">
             <h4>Connect a Wallet</h4>
             {discoveredProviders.map((provider) => (
               <button key={provider.info.uuid} onClick={() => connectWallet(provider)}>
                 <img src={provider.info.icon} alt={provider.info.name} />
                 Connect {provider.info.name}
               </button>
             ))}
           </div>
        ) : (
          <div className="vehicle-dashboard">
            <h4>Live Vehicle Status</h4>
            <VehicleCard vehicleData={vehicle1Data} />
            <VehicleCard vehicleData={vehicle2Data} />
            <div className="block-status">
              <span className="live-dot"></span>
              Sonic Block: {latestBlock}
            </div>
          </div>
          
        )}
      </div>

      <MapContainer center={mapCenter} zoom={18} scrollWheelZoom={true} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <CircleMarker center={INTERSECTION_COORDS} radius={20} pathOptions={{ color: '#ff4d4d', fillColor: '#ff4d4d', fillOpacity: 0.2, weight: 1.5 }}>
          <Popup>Smart Intersection (ID: 0)</Popup>
        </CircleMarker>

        {vehicle1Data && <AnimatedMarker position={vehicle1Data.position} status={vehicle1Data.status} tokenId={vehicle1Data.tokenId} previousPosition={prevVehicle1Pos.current} />}
        {vehicle2Data && <AnimatedMarker position={vehicle2Data.position} status={vehicle2Data.status} tokenId={vehicle2Data.tokenId} previousPosition={prevVehicle2Pos.current} />}
      </MapContainer>
    </div>
  );
}

export default App;