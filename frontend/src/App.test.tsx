import { render, screen } from '@testing-library/react';
import App from './App';

test('renders wishmaker app', () => {
    render(<App />);
    const titleElement = screen.getByText(/WishMaker/i);
    expect(titleElement).toBeInTheDocument();
});
