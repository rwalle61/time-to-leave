import { Loader } from '@googlemaps/js-api-loader';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useErrorHandler } from 'react-error-boundary';
import JourneysTable from '../components/JourneysTable';
import { RESTRICTED_API_KEY } from '../config';
import {
  BRIXTON_STATION,
  COLCHESTER_LAT_LNG,
  HOME,
  TAUNTON_LAT_LNG,
} from '../domain/defaultLocations';
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

  const handleError = useErrorHandler();

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
      try {
        await loader.load();
      } catch (error) {
        handleError(error);
      }
      setLoadedGoogleMapsSdk(true);
    };
    load();
  });

  useEffect(() => {
    if (!loadedGoogleMapsSdk || !origin.latLng || !destination.latLng) {
      return;
    }
    const updateJourneys = async (): Promise<void> => {
      try {
        const newJourneys = await fetchJourneys(
          origin.latLng,
          destination.latLng
        );

        logger.log('newJourneys', newJourneys);

        setJourneys(newJourneys);
      } catch (error) {
        handleError(error);
      }
    };
    updateJourneys();
  }, [loadedGoogleMapsSdk, origin, destination, handleError]);

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
        bounds: new google.maps.LatLngBounds(
          TAUNTON_LAT_LNG,
          COLCHESTER_LAT_LNG
        ),
        fields: placeResultFields,
      }
    );

    logger.log('autocomplete', autocomplete);

    if (
      // eslint-disable-next-line no-underscore-dangle
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        latLng: place.geometry.location!.toJSON(),
      };

      logger.log('newPlace', newPlace);

      setPlace(newPlace);
    });
  };

  useEffect(() => {
    if (!loadedGoogleMapsSdk) {
      return;
    }
    try {
      setupPlaceChangedListener(InputIds.Origin, setOrigin);

      setupPlaceChangedListener(InputIds.Destination, setDestination);
    } catch (error) {
      handleError(error);
    }
  }, [handleError, loadedGoogleMapsSdk]);

  return (
    <div className="container px-2 py-2 mx-auto text-lg text-center">
      <p>
        From:{' '}
        <input
          id={InputIds.Origin}
          defaultValue={origin.name}
          className="italic"
        />
      </p>
      <p>
        To:{' '}
        <input
          id={InputIds.Destination}
          defaultValue={destination.name}
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
        <Link href={getCityMapperLink(origin, destination)} passHref>
          <button
            type="button"
            className="inline-flex px-2 py-1 text-white bg-purple-400 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
          >
            See on CityMapper
          </button>
        </Link>
      </div>
      {Boolean(journeys.length) && <JourneysTable journeys={journeys} />}
    </div>
  );
};

export default Home;
