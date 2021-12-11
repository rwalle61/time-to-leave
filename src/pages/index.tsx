import { Loader } from '@googlemaps/js-api-loader';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import JourneysTable from '../components/JourneysTable';
import PageHead from '../components/PageHead';
import { RESTRICTED_API_KEY } from '../config';
import { BRIXTON_STATION, HOME } from '../domain/defaultLocations';
import Journey from '../domain/Journey';
import Location from '../domain/Location';
import { fetchJourneys } from '../services/fetchJourneys';
import getCityMapperLink from '../services/getCityMapperLink';
import logger from '../services/logger';

enum InputIds {
  Origin = 'origin-input',
  Destination = 'destination-input',
}

export const Home = (): JSX.Element => {
  const [loadedGoogleMapsSdk, setLoadedGoogleMapsSdk] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [origin, setOrigin] = useState<Location>(BRIXTON_STATION);

  const [destination, setDestination] = useState<Location>(HOME);

  const [autocompletedPlace, setAutocompletedPlace] = useState(false);

  const [error, setError] = useState<Error | undefined>();

  const setOriginToCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((geolocationPosition) => {
      const latLng: google.maps.LatLngLiteral = {
        lat: geolocationPosition.coords.latitude,
        lng: geolocationPosition.coords.longitude,
      };
      setOrigin({ name: 'Here', latLng });
    });
  };

  useEffect(() => {
    const load = async () => {
      const loader = new Loader({
        apiKey: RESTRICTED_API_KEY,
        libraries: ['places'],
      });
      await loader.load();
      setLoadedGoogleMapsSdk(true);
    };
    load();
  });

  const fetchAndUpdateJourneys = async () => {
    try {
      if (!origin.latLng || !destination.latLng) {
        throw new Error(
          `Missing latLng: origin.latLng=${JSON.stringify(
            origin.latLng
          )}, destination.latLng=${JSON.stringify(destination.latLng)}`
        );
      }
      const newJourneys = await fetchJourneys(
        origin.latLng,
        destination.latLng
      );

      logger.log('newJourneys', newJourneys);

      setJourneys(newJourneys);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err);
        return;
      }
      throw err;
    }
  };

  useEffect(() => {
    if (!autocompletedPlace) {
      return;
    }
    const fetchAndUpdateJourneysAfterAutocompletedPlace = async () => {
      await fetchAndUpdateJourneys();
      setAutocompletedPlace(false);
    };
    fetchAndUpdateJourneysAfterAutocompletedPlace();
  }, [autocompletedPlace]);

  const setupPlaceChangedListener = (
    inputElementId: InputIds,
    setPlace: typeof setOrigin | typeof setDestination
  ) => {
    const input = document.getElementById(inputElementId);
    if (!input) {
      throw new Error(`Input element not found. Id: ${inputElementId}`);
    }

    const placeResultFields: ['geometry', 'name'] = ['geometry', 'name'];

    const autocomplete = new google.maps.places.Autocomplete(
      input as HTMLInputElement,
      {
        fields: placeResultFields,
      }
    );

    logger.log('autocomplete', autocomplete);

    if (
      (
        autocomplete as typeof autocomplete & {
          __e3_?: { place_changed: unknown };
        }
      ).__e3_?.place_changed
    ) {
      return;
    }

    autocomplete.addListener('place_changed', () => {
      type Place = Required<
        Pick<google.maps.places.PlaceResult, typeof placeResultFields[number]>
      >;

      const place = autocomplete.getPlace() as Place;

      const newPlace = {
        name: place.name,
        latLng: place.geometry.location?.toJSON(),
      };

      logger.log('newPlace', newPlace);

      setPlace(newPlace);
      setAutocompletedPlace(true);
    });
  };

  useEffect(() => {
    if (!loadedGoogleMapsSdk) {
      return;
    }
    setupPlaceChangedListener(InputIds.Origin, setOrigin);

    setupPlaceChangedListener(InputIds.Destination, setDestination);
  }, [loadedGoogleMapsSdk]);

  return (
    <div>
      <PageHead />
      <Header />
      <div className="container px-2 py-2 mx-auto text-lg text-center">
        <p>
          From:{' '}
          <input
            id={InputIds.Origin}
            value={origin.name}
            onChange={(event) => {
              setOrigin({ name: event.target.value });
            }}
            className="italic"
          />
        </p>
        <p>
          To:{' '}
          <input
            id={InputIds.Destination}
            value={destination.name}
            onChange={(event) => {
              setDestination({ name: event.target.value });
            }}
            className="italic"
          />
        </p>
        <div className="space-x-1 space-y-1">
          <button
            type="button"
            className="inline-flex px-2 py-1 text-white bg-purple-400 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
            onClick={() => setOriginToCurrentLocation()}
          >
            Use current location
          </button>
          <button
            type="button"
            className="inline-flex px-2 py-1 text-white bg-purple-400 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
            onClick={() => fetchAndUpdateJourneys()}
            disabled={!loadedGoogleMapsSdk}
          >
            Check
          </button>
          <Link href={getCityMapperLink(origin, destination)}>
            <button
              type="button"
              className="inline-flex px-2 py-1 text-white bg-purple-400 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
            >
              See on CityMapper
            </button>
          </Link>
        </div>
        {error && (
          <div className="italic text-red-700">
            <p>{`You found a bug! 🥳. Please refresh`}</p>
            <p className="text-xs text-left">{`(${error.message}: ${error.stack})`}</p>
          </div>
        )}
      </div>
      {Boolean(journeys.length) && <JourneysTable journeys={journeys} />}
    </div>
  );
};

export default Home;
