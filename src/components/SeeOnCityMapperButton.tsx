import { Launch } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import { ReactElement } from 'react';
import Location from '../domain/Location';
import getCityMapperLink from '../services/getCityMapperLink';

type Props = {
  origin: Location | null;
  destination: Location | null;
  className?: string;
};

const SeeOnCityMapperButton = ({
  origin,
  destination,
  className,
}: Props): ReactElement =>
  origin && destination ? (
    <Link href={getCityMapperLink(origin, destination)} passHref>
      <Button variant="contained" endIcon={<Launch />} className={className}>
        See On CityMapper
      </Button>
    </Link>
  ) : (
    <Button
      variant="contained"
      disabled
      endIcon={<Launch />}
      className={className}
    >
      See On CityMapper
    </Button>
  );

export default SeeOnCityMapperButton;
