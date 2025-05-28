import axios from 'axios';
import { animals } from './animals.js';
import fs from 'fs';

const apiKey = 'AIzaSyC-2Bp_8USjVDsN0BLd-IRPJFd-BD4AyZ8';
const endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';

async function geocodeLocation(location) {
  const url = `${endpoint}?address=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn(`Geocoding failed for "${location}": ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching location for "${location}":`, error.message);
    return null;
  }
}

async function generateCoordinates() {
  const results = [];

  for (const animal of animals) {
    const coordinates = await geocodeLocation(animal.location);

    results.push({
      ...animal,
      coordinates: coordinates || { lat: null, lng: null }
    });

    // Add a small delay to avoid rate limiting
    await new Promise((res) => setTimeout(res, 100));
  }

  fs.writeFileSync('./animal-coordinates.json', JSON.stringify(results, null, 2));
  console.log('Finished writing coordinates to animal-coordinates.json');
}

generateCoordinates();
