import React from 'react';
import { Home } from '../../src/pages/index';
import { render, screen } from '../testUtils';

describe('Home page', () => {
  it('loads the page without blowing up', () => {
    render(<Home />);

    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();

    expect(screen.getByText('Leave at')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Time Saved')).toBeInTheDocument();
  });
});
