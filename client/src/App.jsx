import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import SelectRole from './pages/SelectRole.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';

export default function App() {
  const [role, setRole] = useState(null); // 'client' | 'agent' | null

  return (
    <Routes>
      <Route
        path="/"
        element={
          role ? (
            <Navigate to="/chat" replace />
          ) : (
            <SelectRole onSelectRole={setRole} />
          )
        }
      />
      <Route
        path="/chat"
        element={
          role ? (
            <ChatPage role={role} onChangeRole={() => setRole(null)} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/articles/:slug" element={<ArticlePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
