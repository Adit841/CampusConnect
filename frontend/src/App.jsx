import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          {/* Chat module — ayushman-feature */}
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
