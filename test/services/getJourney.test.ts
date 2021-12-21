import { BRIXTON_STATION, HOME } from '../../src/domain/defaultLocations';
import Journey from '../../src/domain/Journey';
import * as getGoogleResponseModule from '../../src/services/getGoogleResponse';
import { getJourney } from '../../src/services/getJourney';
import { mockWarning } from '../../src/services/mockWarnings';
import mockGoogleResponseOnlyWalking from '../support/mockGoogleResponseOnlyWalking';
import mockGoogleResponseTransit from '../support/mockGoogleResponseTransit';

describe('getJourney', () => {
  const origin = BRIXTON_STATION.latLng;
  const destination = HOME.latLng;
  const departureTime = new Date();

  describe('when Google response contains a transit route', () => {
    beforeEach(() => {
      jest
        .spyOn(getGoogleResponseModule, 'getGoogleResponse')
        .mockResolvedValue(mockGoogleResponseTransit);
    });

    it('returns the journey with only transit lines and relevant warnings', async () => {
      const journey = await getJourney(origin, destination, departureTime);

      expect(journey).toMatchObject<Journey>({
        departureTime: expect.any(Date),
        duration: expect.any(Number),
        transitLines: ['Victoria', 'Jubilee'],
        warnings: [mockWarning],
      });
    });
  });

  describe('when Google response contains only a walking route', () => {
    beforeEach(() => {
      jest
        .spyOn(getGoogleResponseModule, 'getGoogleResponse')
        .mockResolvedValue(mockGoogleResponseOnlyWalking);
    });

    it("returns the journey with only walking 'transit line'", async () => {
      const journey = await getJourney(origin, destination, departureTime);

      expect(journey).toMatchObject<Journey>({
        departureTime: expect.any(Date),
        duration: expect.any(Number),
        transitLines: ['WALK'],
        warnings: [],
      });
    });
  });
});
