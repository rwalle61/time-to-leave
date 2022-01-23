import Link from 'next/link';
import React, { ReactElement } from 'react';
import Location from '../domain/Location';
import getCityMapperLink from '../services/getCityMapperLink';

type Props = {
  origin: Location | null;
  destination: Location;
};

const SeeOnCityMapperButton = ({ origin, destination }: Props): ReactElement =>
  origin ? (
    <Link href={getCityMapperLink(origin, destination)} passHref>
      <button
        type="button"
        className="inline-flex px-2 py-1 text-white bg-purple-400 rounded-xl hover:bg-black hover:text-white hover:border-transparent"
      >
        See on CityMapper
      </button>
    </Link>
  ) : (
    <div className="inline-flex px-2 py-1 text-white bg-purple-200 rounded-xl">
      See on CityMapper
    </div>
  );

export default SeeOnCityMapperButton;
