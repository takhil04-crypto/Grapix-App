import type { MapRef, MapProps } from 'react-map-gl';

import MapGL from 'react-map-gl';
import { forwardRef } from 'react';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const allowedLogoPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export const Map = forwardRef<MapRef, MapProps>(({ projection, logoPosition, terrain, ...other }, ref) => (
  <MapGL
    ref={ref}
    mapboxAccessToken={CONFIG.mapboxApiKey}
    projection={typeof projection === 'string' ? undefined : projection}
    logoPosition={
      allowedLogoPositions.includes(logoPosition as any)
        ? (logoPosition as typeof allowedLogoPositions[number])
        : undefined
    }
    terrain={terrain === null ? undefined : terrain}
    {...other}
  />
));
