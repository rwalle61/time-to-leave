import { Loader } from '@googlemaps/js-api-loader';
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import JourneysTable from '../components/JourneysTable';
import { PageHead } from '../components/PageHead';
import { IS_PROD_ENV, RESTRICTED_API_KEY } from '../config';
import { extractJourneyInfo } from '../services/extractJourneyInfo';
import logger from '../services/logger';
import mockGoogleResponses from '../services/mockGoogleResponses';

const loader = new Loader({
  apiKey: RESTRICTED_API_KEY,
});

const HOME_ADDRESS = '27 Lancaster Grove, NW3 4EX';

export type Journey = {
  departureTime: string;
  duration: google.maps.Duration | undefined;
  timeSavedComparedToNextJourney: number;
  rank: number;
};

type Location = google.maps.DirectionsRequest['origin'];

const reallyCallGoogleAPI = IS_PROD_ENV;

export const Home = (): JSX.Element => {
  const [loadedGoogleMapsSdk, setLoadedGoogleMapsSdk] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [bestTimeToLeave, setBestTimeToLeave] = useState<string>('Unsure');

  const [origin, setOrigin] = useState<Location | undefined>(
    'Brixton Underground Station'
  );

  const [destination] = useState(HOME_ADDRESS);

  useEffect(() => {
    if (!IS_PROD_ENV) {
      return;
    }
    navigator.geolocation.getCurrentPosition((geolocationPosition) => {
      console.log('[index.tsx] geolocationPosition', geolocationPosition);
      const position: google.maps.LatLngLiteral = {
        lat: geolocationPosition.coords.latitude,
        lng: geolocationPosition.coords.longitude,
      };
      setOrigin(position);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      if (reallyCallGoogleAPI) {
        await loader.load();
      }
      setLoadedGoogleMapsSdk(true);
    };
    load();
  });

  useEffect(() => {
    if (!origin || (reallyCallGoogleAPI && !loadedGoogleMapsSdk)) {
      return;
    }

    const getGoogleResponses = async () => {
      const directionsService = new google.maps.DirectionsService();

      const travelMode = google.maps.TravelMode.TRANSIT;

      const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

      const now = Date.now();

      const departureTimes = [
        new Date(now + 0 * MILLISECONDS_PER_HOUR),
        new Date(now + 1 * MILLISECONDS_PER_HOUR),
        new Date(now + 2 * MILLISECONDS_PER_HOUR),
        new Date(now + 3 * MILLISECONDS_PER_HOUR),
        new Date(now + 4 * MILLISECONDS_PER_HOUR),
        new Date(now + 5 * MILLISECONDS_PER_HOUR),
        new Date(now + 6 * MILLISECONDS_PER_HOUR),
        new Date(now + 7 * MILLISECONDS_PER_HOUR),
        new Date(now + 8 * MILLISECONDS_PER_HOUR),
      ];

      const responses = await Promise.all(
        departureTimes.map(async (departureTime) => {
          const request: google.maps.DirectionsRequest = {
            origin,
            destination,
            travelMode,
            drivingOptions: {
              departureTime,
            },
            transitOptions: {
              departureTime,
            },
          };
          const response = await directionsService.route(request);
          return response;
        })
      );
      return responses;
    };

    const fetchAndUpdateJourneys = async () => {
      const responses = reallyCallGoogleAPI
        ? await getGoogleResponses()
        : mockGoogleResponses;

      const journeysInfo = extractJourneyInfo(responses);

      logger.log('journeysInfo', journeysInfo);

      const [bestJourney] = [...journeysInfo].sort(
        (journeyA, journeyB) => journeyA.rank - journeyB.rank
      );

      setBestTimeToLeave(bestJourney.departureTime);

      setJourneys(journeysInfo);
    };
    fetchAndUpdateJourneys();
  }, [loadedGoogleMapsSdk, origin]);

  return (
    <div>
      <PageHead />
      <Header />
      <div className="container px-2 py-2 mx-auto text-lg text-center">
        <p>
          From:{' '}
          <b>{typeof origin === 'string' ? origin : JSON.stringify(origin)}</b>
        </p>
        <p>
          To: <b>{destination}</b>
        </p>
        <h2>
          Best time to leave: <b>{bestTimeToLeave}</b>
        </h2>
      </div>
      {!journeys.length && <p>Loading...</p>}
      {Boolean(journeys.length) && <JourneysTable journeys={journeys} />}
    </div>
  );
};

export default Home;
