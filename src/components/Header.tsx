import React from 'react';
import Image from 'next/image';
import logo from '../../public/apple-touch-icon.png';

const Header: React.VFC = () => (
  <header className="sticky top-0 z-50 px-2 py-2 bg-white border-b">
    <div className="flex items-center justify-center space-x-1">
      <div className="font-semibold text-center text-m ">Time to Leave</div>
      <div className="relative flex-shrink-0 w-8 h-8 sm:table-cell">
        <Image src={logo} alt={'Logo'} layout="fill" />
      </div>
    </div>
  </header>
);

export default Header;
