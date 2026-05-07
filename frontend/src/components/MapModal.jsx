import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.1)'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#1d2c4d" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8ec3b9" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#1a3646" }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#4b6878" }]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#334e62" }]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry",
      "stylers": [{ "color": "#023e58" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#283d6a" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#6f9ba5" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#304a7d" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#98a5be" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#2c6675" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#0e1626" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#4e6d70" }]
    }
  ]
};

export default function MapModal({ target, onClose }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState(null);
  const [userPos, setUserPos] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setError("Location access denied. Showing target location only.");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isLoaded && userPos && target) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userPos,
          destination: target,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            setDistance(result.routes[0].legs[0].distance.text);
            setDuration(result.routes[0].legs[0].duration.text);
          } else {
            setError("Could not find a route to the destination.");
          }
        }
      );
    }
  }, [isLoaded, userPos, target]);

  if (!isLoaded) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="glass" style={{ width: '90%', maxWidth: '900px', padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>📍 Route to Destination</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{target}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ minWidth: '40px', height: '40px', borderRadius: '50%', padding: 0 }}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={userPos || { lat: 20.5937, lng: 78.9629 }}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
              >
                {directions && <DirectionsRenderer directions={directions} />}
                {!directions && userPos && <Marker position={userPos} label="You" />}
              </GoogleMap>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass" style={{ padding: '16px', background: 'rgba(0,212,255,0.05)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Distance</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00d4ff' }}>{distance || '---'}</div>
              </div>

              <div className="glass" style={{ padding: '16px', background: 'rgba(16,185,129,0.05)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Est. Travel Time</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{duration || '---'}</div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                  * Driving directions and times are estimates and depend on traffic conditions.
                </p>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  🚀 Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
