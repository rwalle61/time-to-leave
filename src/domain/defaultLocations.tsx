import Location from './Location';

export const HOME: Location = {
  name: 'Home (27 Lancaster Grove)',
  latLng: {
    lat: 51.5462054,
    lng: -0.169818,
  },
};

export const SWISS_COTTAGE_STATION: Location = {
  name: 'Swiss Cottage Underground Station',
  latLng: {
    lat: 51.5430314,
    lng: -0.1757082,
  },
};

export const PADDINGTON_STATION: Location = {
  name: 'Paddington',
  latLng: {
    lat: 51.515973,
    lng: -0.174943,
  },
};

export const STRATFORD_STATION: Location = {
  name: 'Stratford',
  latLng: {
    lat: 51.5411893,
    lng: -0.003344,
  },
};

export const BOBBY_MOORE_ACADEMY: Location = {
  name: 'Bobby Moore Academy (Primary)',
  latLng: {
    lat: 51.53895350000001,
    lng: -0.0201439,
  },
};

export const BRIXTON_STATION: Location = {
  name: 'Brixton Station',
  latLng: {
    lat: 51.4624597,
    lng: -0.114788,
  },
};

export const WINCHESTER_TRAIN_STATION: Location = {
  name: 'Winchester Train Station',
  latLng: {
    lat: 51.0672703,
    lng: -1.3197025,
  },
};

// In South West
const TAUNTON_LAT_LNG: google.maps.LatLngLiteral = {
  lat: 51.0214619,
  lng: -3.1174915,
};

// In South East
const COLCHESTER_LAT_LNG: google.maps.LatLngLiteral = {
  lat: 51.8861673,
  lng: 0.8685421,
};

export const LONDON_AND_BRISTOL_BOUNDS = [TAUNTON_LAT_LNG, COLCHESTER_LAT_LNG];
