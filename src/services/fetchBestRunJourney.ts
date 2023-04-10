import { JourneyWithSteps, Step } from '../domain/Journey';
import Location from '../domain/Location';
import { MoveSpeed } from '../domain/MoveSpeed';
import { WALK_METHOD } from './getJourney';
import { getJourneyWithSteps } from './getJourneyWithSteps';
import logger from './logger';
import { MILLISECONDS_PER_MINUTE } from './time.utils';

const RUN_STEP_METHOD = 'RUN';

const LONG_WALK_DURATION = 4 * MILLISECONDS_PER_MINUTE;

const MAX_KM_TO_RUN = 3000;

// Manually tested when:
//  DONE whole journey is faster to run
//  whole journey not faster to run
//  1st half faster to run
//  1st half not faster to run
//  2nd half faster to run
//  2nd half not faster to run

const checkIfRunIsFasterThanTransit = async (
  existingJourney: JourneyWithSteps,
  runSpeed: MoveSpeed
): Promise<JourneyWithSteps> => {
  if (existingJourney.distance < MAX_KM_TO_RUN) {
    const journeyOnlyWalk = await getJourneyWithSteps(
      existingJourney.origin,
      existingJourney.destination,
      existingJourney.departureTime,
      google.maps.TravelMode.WALKING
    );

    logger.debug('journeyOnlyWalk', journeyOnlyWalk);

    const runDuration = journeyOnlyWalk.duration * runSpeed;

    const arrivalTimeAfterRun = new Date(
      existingJourney.departureTime.getTime() + runDuration
    );

    const journeyOnlyRun: JourneyWithSteps = {
      ...journeyOnlyWalk,
      duration: runDuration,
      arrivalTime: arrivalTimeAfterRun,
      steps: [
        {
          ...journeyOnlyWalk.steps[0],
          duration: runDuration,
          arrivalTime: arrivalTimeAfterRun,
          method: RUN_STEP_METHOD,
        },
      ],
    };

    logger.debug('journeyOnlyRun', journeyOnlyRun);

    if (
      journeyOnlyRun.arrivalTime.getTime() <
      existingJourney.arrivalTime.getTime()
    ) {
      return journeyOnlyRun;
    }
  }
  return existingJourney;
};

// Manually tested when:
//  DONE walking step at start
//  DONE walking step at end
//  DONE walking step in middle
//  DONE walking step in all 3
//  DONE no walking steps

const findBestRunJourneyRecursive = async (
  existingJourney: JourneyWithSteps,
  runSpeed: MoveSpeed
): Promise<JourneyWithSteps> => {
  logger.debug('existingJourney', existingJourney);

  const indexOfLongWalkingStep = existingJourney.steps.findIndex(
    (step) => step.method === WALK_METHOD && step.duration > LONG_WALK_DURATION
  );
  const longWalkingStep = existingJourney.steps[indexOfLongWalkingStep];

  logger.debug(
    'indexOfLongWalkingStep',
    indexOfLongWalkingStep,
    '\nlongWalkingStep',
    longWalkingStep
  );

  if (!longWalkingStep) {
    return existingJourney;
  }

  const runningDuration = longWalkingStep.duration * runSpeed;
  logger.debug(
    'runningDuration',
    (runningDuration / 60_000).toFixed(1),
    'mins'
  );

  const arrivalTimeAfterRunning = new Date(
    longWalkingStep.departureTime.getTime() + runningDuration
  );

  const runningStep: Step = {
    ...longWalkingStep,
    duration: runningDuration,
    arrivalTime: arrivalTimeAfterRunning,
    method: RUN_STEP_METHOD,
  };

  const stepsBeforeRunning = existingJourney.steps.slice(
    0,
    indexOfLongWalkingStep
  );
  const stepsUpToRun = [...stepsBeforeRunning, runningStep];
  const stepAfterRunning = existingJourney.steps[indexOfLongWalkingStep + 1];
  if (!stepAfterRunning) {
    const journeyEndingWithRun: JourneyWithSteps = {
      ...existingJourney,
      arrivalTime: runningStep.arrivalTime,
      duration:
        runningStep.arrivalTime.getTime() -
        existingJourney.departureTime.getTime(),
      steps: stepsUpToRun,
    };
    logger.debug('journeyEndingWithRun', journeyEndingWithRun);
    return journeyEndingWithRun;
  }

  const journeyAfterRun = await getJourneyWithSteps(
    runningStep.destination,
    existingJourney.destination,
    runningStep.arrivalTime
  );

  logger.debug('journeyAfterRun', journeyAfterRun);

  const journeyWithRun: JourneyWithSteps = {
    ...existingJourney,
    arrivalTime: journeyAfterRun.arrivalTime,
    duration:
      journeyAfterRun.arrivalTime.getTime() -
      existingJourney.departureTime.getTime(),
    warnings: [...existingJourney.warnings, ...journeyAfterRun.warnings],
    steps: [...stepsUpToRun, ...journeyAfterRun.steps],
  };

  logger.debug('journeyWithRun', journeyWithRun);

  return findBestRunJourneyRecursive(journeyWithRun, runSpeed);
};

export const fetchBestRunJourney = async (
  origin: Location,
  destination: Location,
  searchTime: Date,
  runSpeed: MoveSpeed
): Promise<JourneyWithSteps> => {
  let journey = await getJourneyWithSteps(origin, destination, searchTime);

  if (runSpeed !== MoveSpeed.Walk) {
    journey = await findBestRunJourneyRecursive(journey, runSpeed);
    journey = await checkIfRunIsFasterThanTransit(journey, runSpeed);
  }
  return journey;
};
