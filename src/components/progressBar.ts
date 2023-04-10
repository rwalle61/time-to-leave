import ProgressBar from '@badrap/bar-of-progress';
import { palette } from '../theme';

const progress = new ProgressBar({ size: 3, color: palette.primary.main });

export const startProgressBar = () => progress.start();

export const finishProgressBar = () => progress.finish();
