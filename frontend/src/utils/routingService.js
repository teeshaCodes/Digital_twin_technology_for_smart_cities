/**
 * Geocoding and Road Routing services for Smart City Digital Twin
 */

/**
 * Resolves an address or location name to latitude and longitude using Nominatim
 */
export async function getCoordinates(query) {
  if (!query || !query.trim()) return null;

  // Check if query is already numeric coordinates e.g., "28.6139, 77.2090"
  const coordRegex = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;
  const match = query.match(coordRegex);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lon: parseFloat(match[2]),
      name: `Coordinates (${match[1]}, ${match[2]})`
    };
  }

  // Auto-localize search to Surat city if not specified
  let searchQuery = query;
  if (!query.toLowerCase().includes('surat') && !query.toLowerCase().includes('gujarat')) {
    searchQuery = `${query}, Surat`;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name.split(',').slice(0, 3).join(',')
      };
    }
  } catch (err) {
    console.error('Nominatim Geocoding API failed:', err);
  }

  // Fallback to searching without localization if it failed
  if (searchQuery !== query) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: data[0].display_name.split(',').slice(0, 3).join(',')
        };
      }
    } catch (err) {
      console.error('Fallback Geocoding API failed:', err);
    }
  }

  return null;
}

/**
 * Fetches driving route coordinates from OSRM between two points
 */
export async function fetchOSRMRoute(lat1, lon1, lat2, lon2) {
  try {
    // Format: longitude,latitude;longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM API offline or returned rate limit error');
    
    const data = await response.json();
    if (data && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Convert OSRM GeoJSON coordinates [lon, lat] to Leaflet coordinates [lat, lon]
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      const durationMin = Math.round(route.duration / 60);
      const distanceKm = (route.distance / 1000).toFixed(1);
      return {
        coordinates,
        duration: durationMin,
        distance: distanceKm,
        isFallback: false
      };
    }
  } catch (err) {
    console.warn('OSRM Routing API failed, generating simulated route fallback:', err);
  }

  // --- Simulated Route Fallback ---
  // Generate a multi-segment route between coordinates to look like street traversal
  const coordinates = [];
  const segments = 5;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = lat1 + (lat2 - lat1) * t;
    const lon = lon1 + (lon2 - lon1) * t;
    
    // Add slight offset on intermediate segments to make it follow realistic street shapes
    if (i > 0 && i < segments) {
      const offsetLat = (Math.sin(t * Math.PI) * (Math.random() - 0.5) * 0.004);
      const offsetLon = (Math.cos(t * Math.PI) * (Math.random() - 0.5) * 0.004);
      coordinates.push([lat + offsetLat, lon + offsetLon]);
    } else {
      coordinates.push([lat, lon]);
    }
  }

  // Calculate straight-line distance approximation in km
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const distanceDeg = Math.sqrt(dLat * dLat + dLon * dLon);
  const distanceKm = parseFloat((distanceDeg * 111 * 1.25).toFixed(1)); // ~111km/deg, scaled by 1.25 for driving bends
  const durationMin = Math.round(distanceKm * 2.2); // ~27 km/h avg speed

  return {
    coordinates,
    duration: durationMin,
    distance: distanceKm,
    isFallback: true
  };
}
