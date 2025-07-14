import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }) => <div>{children}</div>, // Mock BrowserRouter
  Routes: ({ children }) => <div>{children}</div>, // Mock Routes
  Route: ({ children }) => <div>{children}</div>, // Mock Route
  Navigate: () => null, // Mock Navigate
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}), // Mock onAuthStateChanged to return an unsubscribe function
  signOut: jest.fn(),
}));

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

// Mock firebase/functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
}));

// Mock the api service
jest.mock('./services/api', () => ({
  get: jest.fn(() => Promise.resolve({})), // Mock get method to return a resolved promise
  post: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve({})),
}));

// Mock the index.js exports
jest.mock('./index', () => ({
  auth: {},
  db: {},
  functions: {},
}));

describe('App', () => {
  test('renders Dashboard heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Dashboard/i);
    expect(headingElement).toBeInTheDocument();
  });
});
