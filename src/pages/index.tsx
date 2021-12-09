import { Loader } from '@googlemaps/js-api-loader';
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import JourneysTable from '../components/JourneysTable';
import { PageHead } from '../components/PageHead';
import {
  IS_PROD_ENV,
  reallyCallGoogleAPI,
  RESTRICTED_API_KEY,
} from '../config';
import { fetchJourneys } from '../services/fetchJourneys';
import logger from '../services/logger';

const loader = new Loader({
  apiKey: RESTRICTED_API_KEY,
});

const HOME_ADDRESS = '27 Lancaster Grove, NW3 4EX';

export type Journey = {
  departureTime: string;
  duration: google.maps.Duration | undefined;
  timeSavedComparedToNextJourney: number;
};

export type Location = google.maps.DirectionsRequest['origin'];

export const Home = (): JSX.Element => {
  const [loadedGoogleMapsSdk, setLoadedGoogleMapsSdk] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [origin, setOrigin] = useState<Location>('Brixton Underground Station');

  const [destination, setDestination] = useState(HOME_ADDRESS);

  const [error, setError] = useState<Error | undefined>();

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
    try {
      const journeysInfo = await fetchJourneys(origin, destination);

      logger.log('journeysInfo', journeysInfo);

      setJourneys(journeysInfo);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err);
        return;
      }
      throw err;
    }
  };

  return (
    <div>
      <PageHead />
      <Header />
      <div className="container px-2 py-2 mx-auto text-lg text-center">
        <p>
          From:{' '}
          <Input
            value={typeof origin === 'string' ? origin : JSON.stringify(origin)}
            onChange={(event) => {
              setOrigin(event.target.value);
            }}
          />
        </p>
        <p>
          To:{' '}
          <Input
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value);
            }}
          />
        </p>
        <button
          type="button"
          className="inline-flex px-2 py-2 bg-blue-300 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
          onClick={() => fetchAndUpdateJourneys()}
          disabled={!loadedGoogleMapsSdk}
        >
          Check
        </button>
        {error && (
          <div className="italic text-red-700">
            <p>{`Oops, I don't know where that is, please try a different place`}</p>
            <p className="text-xs text-left">{`(${error.message}: ${error.stack})`}</p>
          </div>
        )}
      </div>
      {Boolean(journeys.length) && <JourneysTable journeys={journeys} />}
    </div>
  );
};

export default Home;
