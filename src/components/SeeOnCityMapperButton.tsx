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
}: Props): ReactElement => (
  <Link href={getCityMapperLink(origin, destination)} passHref>
    <Button variant="contained" endIcon={<Launch />} className={className}>
      See On CityMapper
    </Button>
  </Link>
);

export default SeeOnCityMapperButton;
