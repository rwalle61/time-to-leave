import Journey from '../domain/Journey';
import { mockWarning, mockWarning2 } from './mockWarnings';

const mockJourneysFromBrixtonToHome: Journey[] = [
  {
    departureTime: new Date(1639951320000),
    duration: 1809000,
    transitLines: ['Victoria', 'Jubilee'],
    warnings: [mockWarning, mockWarning2],
  },
  {
    departureTime: new Date(1639956960000),
    duration: 1879000,
    transitLines: ['Victoria', 'Jubilee'],
    warnings: [],
  },
  {
    departureTime: new Date(1639957560000),
    duration: 1759000,
    transitLines: ['Victoria', 'Jubilee'],
    warnings: [],
  },
  {
    departureTime: new Date(1639957920000),
    duration: 2911000,
    transitLines: ['Victoria', 'N5'],
    warnings: [mockWarning],
  },
  {
    departureTime: new Date(1639958641000),
    duration: 3670000,
    transitLines: ['59', '168'],
    warnings: [],
  },
  {
    departureTime: new Date(1639959691000),
    duration: 3730000,
    transitLines: ['N3', '24'],
    warnings: [],
  },
  {
    departureTime: new Date(1639962327000),
    duration: 3299000,
    transitLines: ['N2', 'N113'],
    warnings: [],
  },
  {
    departureTime: new Date(1639973101000),
    duration: 3325000,
    transitLines: ['N109', 'N113'],
    warnings: [],
  },
];

export default mockJourneysFromBrixtonToHome;
