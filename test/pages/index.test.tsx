import React from 'react';
import { Home } from '../../src/pages/index';
import { render, screen } from '../testUtils';

describe('Home page', () => {
  it('loads the page without blowing up', () => {
    render(<Home />);

    expect(screen.getAllByText('From')[0]).toBeInTheDocument();
    expect(screen.getAllByText('To')[0]).toBeInTheDocument();
  });
});
