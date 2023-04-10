import { Loader } from '@googlemaps/js-api-loader';
import { MyLocation, SwapVert } from '@mui/icons-material';
import { Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useErrorHandler } from 'react-error-boundary';
import JourneysTable from '../components/JourneysTable';
import SeeOnCityMapperButton from '../components/SeeOnCityMapperButton';
import { finishProgressBar, startProgressBar } from '../components/progressBar';
import { RESTRICTED_API_KEY } from '../config';
import Journey from '../domain/Journey';
import Location from '../domain/Location';
import { HOME, LONDON_AND_BRISTOL_BOUNDS } from '../domain/defaultLocations';
import { fetchJourneys } from '../services/fetchJourneys';
import { isGoogleAPIZeroResultsError } from '../services/getGoogleResponse';
import logger from '../services/logger';
import { palette } from '../theme';

export const NoRoutesFoundHelperText =
  'No routes found between these locations';

export enum InputIds {
  Origin = 'origin-input',
  Destination = 'destination-input',
}

export const Home = (): JSX.Element => {
  const [loadedGoogleMapsSdk, setLoadedGoogleMapsSdk] = useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [origin, setOrigin] = useState<Location | null>(null);

  const [originToShow, setOriginToShow] = useState('');

  const [destination, setDestination] = useState<Location | null>(HOME);

  const [destinationToShow, setDestinationToShow] = useState('');

  const [noRoutesFoundError, setNoRoutesFoundError] = useState(false);

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

  const swapOriginAndDestination = () => {
    const currentOrigin = origin;
    const currentDestination = destination;

    setOrigin(currentDestination);
    setDestination(currentOrigin);
  };

  useEffect(() => {
    setOriginToShow(origin?.name || '');
  }, [origin]);

  useEffect(() => {
    setDestinationToShow(destination?.name || '');
  }, [destination]);

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
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  });

  useEffect(() => {
    if (!loadedGoogleMapsSdk || !origin?.latLng || !destination?.latLng) {
      return;
    }
    const updateJourneys = async (): Promise<void> => {
      try {
        startProgressBar();

        const newJourneys = await fetchJourneys(
          origin.latLng,
          destination.latLng
        );

        logger.debug('newJourneys', newJourneys);

        setJourneys(newJourneys);
      } catch (error) {
        if (isGoogleAPIZeroResultsError(error)) {
          setNoRoutesFoundError(true);
          setJourneys([]);
          return;
        }

        handleError(error);
      } finally {
        finishProgressBar();
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
        bounds: new google.maps.LatLngBounds(...LONDON_AND_BRISTOL_BOUNDS),
        fields: placeResultFields,
      }
    );

    logger.debug('autocomplete', autocomplete);

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
      type Place = Pick<
        google.maps.places.PlaceResult,
        typeof placeResultFields[number]
      >;

      const place = autocomplete.getPlace() as Place;

      if (!place.name || !place.geometry?.location) {
        logger.warn('Invalid place:', place);
        return;
      }

      const newPlace = {
        name: place.name,
        latLng: place.geometry.location.toJSON(),
      };

      logger.debug('newPlace', newPlace);

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

  const LocationSelector = (
    <div className="p-2 space-y-3">
      <div>
        <TextField
          id={InputIds.Origin}
          label="From"
          sx={
            originToShow
              ? {}
              : {
                  label: { color: palette.primary.main },
                }
          }
          variant="outlined"
          value={originToShow}
          className="italic"
          onChange={(event) => {
            setNoRoutesFoundError(false);
            setOriginToShow(event.target.value);
          }}
          error={noRoutesFoundError}
          helperText={noRoutesFoundError && NoRoutesFoundHelperText}
        />
      </div>
      <div>
        <TextField
          id={InputIds.Destination}
          label="To"
          sx={
            destinationToShow
              ? {}
              : {
                  label: { color: palette.primary.main },
                }
          }
          value={destinationToShow}
          className="italic"
          variant="outlined"
          onChange={(event) => {
            setNoRoutesFoundError(false);
            setDestinationToShow(event.target.value);
          }}
          error={noRoutesFoundError}
          helperText={noRoutesFoundError && NoRoutesFoundHelperText}
        />
      </div>
    </div>
  );

  return (
    <div className="container px-2 py-2 mx-auto text-lg text-center space-y-2">
      {LocationSelector}
      <div>
        <Button
          variant="contained"
          endIcon={<MyLocation />}
          onClick={setOriginToCurrentLocation}
          className="my-1 mx-0.5"
        >
          From Current Location
        </Button>
        <Button
          variant="contained"
          endIcon={<SwapVert />}
          onClick={swapOriginAndDestination}
          className="my-1 mx-0.5"
        >
          Swap
        </Button>
        <SeeOnCityMapperButton
          origin={origin}
          destination={destination}
          className="my-1 mx-0.5"
        />
      </div>
      {Boolean(journeys.length) && <JourneysTable journeys={journeys} />}
    </div>
  );
};

export default Home;
