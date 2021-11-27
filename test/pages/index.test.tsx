import React from 'react';
import { render, screen } from '../testUtils';
import { Home } from '../../src/pages/index';

describe('Home page', () => {
  it('shows the title', () => {
    render(<Home />);
    expect(screen.getByText('Next.js!')).toBeInTheDocument();
  });
});
