import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
