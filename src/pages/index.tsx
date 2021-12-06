import { Loader } from '@googlemaps/js-api-loader';
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import JourneysTable from '../components/JourneysTable';
import { PageHead } from '../components/PageHead';
import {
  IS_PROD_ENV,
  reallyCallGoogleAPI,
  RESTRICTED_API_KEY,
} from '../config';
import logger from '../services/logger';
import { fetchJourneys } from '../services/fetchJourneys';

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

export type Location = google.maps.DirectionsRequest['origin'];

export const Home = (): JSX.Element => {
  const [loadedGoogleMapsSdk, setLoadedGoogleMapsSdk] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [origin, setOrigin] = useState<Location>('Brixton Underground Station');

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

  const fetchAndUpdateJourneys = async () => {
    const journeysInfo = await fetchJourneys(origin, destination);

    logger.log('journeysInfo', journeysInfo);

    setJourneys(journeysInfo);
  };

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
        <button
          type="button"
          className="inline-flex px-2 py-2 bg-blue-300 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
          onClick={() => fetchAndUpdateJourneys()}
          disabled={!loadedGoogleMapsSdk}
        >
          Check
        </button>
      </div>
      {Boolean(journeys.length) && <JourneysTable journeys={journeys} />}
    </div>
  );
};

export default Home;
