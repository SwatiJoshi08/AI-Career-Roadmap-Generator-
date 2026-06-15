import { AppProviders } from './app/providers';
import { AppRouter } from './app/router/AppRouter';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
