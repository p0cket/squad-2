import { render } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  const { container } = render(<App />);
  // Just verify the app renders without errors
  expect(container).toBeTruthy();
});
