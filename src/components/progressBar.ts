import ProgressBar from '@badrap/bar-of-progress';

const progress = new ProgressBar({ size: 3, color: '#a78bfa' });

export const startProgressBar = () => progress.start();

export const finishProgressBar = () => progress.finish();
