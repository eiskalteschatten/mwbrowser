import React from 'react';

import EventsFromMain from './EventsFromMain';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <>
      <EventsFromMain />
      <MainLayout />
    </>
  );
};

export default App;
