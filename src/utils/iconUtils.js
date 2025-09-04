import { FaHome } from 'react-icons/fa';

// overview icons
import {
  cafeIcon,
  cameraIcon,
  centralAcIcon,
  conciergeServiceIcon,
  dumpsterIcon,
  lobbyIcon,
  sharedKitchenIcon,
  sharedSpaIcon,
  waterParkIcon,
  babyCarIcon,
  carIcon,
  jetEngineIcon,
  speedIcon,
  warrantyIcon,
} from '../assets';

// Map for overview item icons based on name
export const getOverviewIcon = (name) => {
  const iconMap = {
    horsepower: jetEngineIcon,
    warranty: warrantyIcon,
    'body type': carIcon,
    kilometer: speedIcon,
    'seat capacity': babyCarIcon,
  };

  const normalizedName = name.toLowerCase();

  return iconMap[normalizedName] || FaHome;
};

// Map for amenity icons based on name
export const getAmenityIcon = (name) => {
  const iconMap = {
    'central ac & heating': centralAcIcon,
    'lobby in building': lobbyIcon,
    'concierge service': conciergeServiceIcon,
    dumpster: dumpsterIcon,
    'shared kitchen': sharedKitchenIcon,
    camera: cameraIcon,
    cafe: cafeIcon,
    'water park': waterParkIcon,
    'shared spa': sharedSpaIcon,
  };

  // Convert to lowercase for case-insensitive matching
  const normalizedName = name.toLowerCase();

  // Return the matched icon or a default one
  return iconMap[normalizedName] || FaHome;
};
