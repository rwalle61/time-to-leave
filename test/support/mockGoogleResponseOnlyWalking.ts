import { irrelevantRouteWarnings } from '../../src/services/getJourney';

const mockGoogleResponseOnlyWalking: google.maps.DirectionsResult = {
  geocoded_waypoints: [
    {
      geocoder_status: 'OK',
      place_id: 'ChIJZYMuBpIadkgRufBpmF0kMxs',
      types: ['establishment', 'lawyer', 'point_of_interest'],
    } as google.maps.DirectionsGeocodedWaypoint,
    {
      geocoder_status: 'OK',
      place_id: 'ChIJZYMuBpIadkgRufBpmF0kMxs',
      types: ['establishment', 'lawyer', 'point_of_interest'],
    } as google.maps.DirectionsGeocodedWaypoint,
  ],
  routes: [
    {
      bounds: {
        zb: {
          g: 51.5461,
          h: 51.546110000000006,
        },
        Qa: {
          g: -0.16994,
          h: -0.16989,
        },
      } as unknown as google.maps.LatLngBounds,
      copyrights: 'Map data ©2021',
      legs: [
        {
          distance: {
            text: '4 m',
            value: 4,
          },
          duration: {
            text: '1 min',
            value: 3,
          },
          end_address: '27 Lancaster Grove, Belsize Park, London NW3 4EX, UK',
          end_location: {} as google.maps.LatLng,
          start_address: '27 Lancaster Grove, Belsize Park, London NW3 4EX, UK',
          start_location: {} as google.maps.LatLng,
          steps: [
            {
              distance: {
                text: '4 m',
                value: 4,
              },
              duration: {
                text: '1 min',
                value: 3,
              },
              end_location: {} as google.maps.LatLng,
              polyline: {
                points: 'erryHbe`@@I',
              },
              start_location: {} as google.maps.LatLng,
              steps: [
                {
                  distance: {
                    text: '4 m',
                    value: 4,
                  },
                  duration: {
                    text: '1 min',
                    value: 3,
                  },
                  end_location: {} as google.maps.LatLng,
                  polyline: {
                    points: 'erryHbe`@@I',
                  },
                  start_location: {} as google.maps.LatLng,
                  travel_mode: 'WALKING',
                  encoded_lat_lngs: 'erryHbe`@@I',
                  path: [{} as google.maps.LatLng, {} as google.maps.LatLng],
                  lat_lngs: [{}, {}],
                  instructions:
                    'Head <b>east</b> on <b>Lancaster Grove</b> toward <b>Strathray Gardens</b>',
                  maneuver: '',
                } as google.maps.DirectionsStep,
              ],
              travel_mode: 'WALKING',
              encoded_lat_lngs: 'erryHbe`@@I',
              path: [{} as google.maps.LatLng, {} as google.maps.LatLng],
              lat_lngs: [{}, {}],
              instructions:
                'Walk to 27 Lancaster Grove, Belsize Park, London NW3 4EX, UK',
              maneuver: '',
              start_point: {},
              end_point: {},
            } as google.maps.DirectionsStep,
          ],
          traffic_speed_entry: [],
          via_waypoint: [],
          via_waypoints: [],
        } as google.maps.DirectionsLeg,
      ],
      overview_polyline: 'erryHbe`@@I',
      summary: 'Lancaster Grove',
      warnings: irrelevantRouteWarnings,
      waypoint_order: [],
      overview_path: [{} as google.maps.LatLng, {} as google.maps.LatLng],
    } as google.maps.DirectionsRoute,
  ],
};

export default mockGoogleResponseOnlyWalking;
