import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import UploadPage from './components/UploadPage';
import RetrievePage from './components/RetrievePage';
import VisualizerPage from './components/VisualizerPage';
import GlobalMapPage from './components/GlobalMapPage';
import Layout from './components/Layout';
import { Node, PageType } from './types';
import { storage } from './lib/storage';

type AppView = 'landing' | 'login' | 'app';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('upload');

  useEffect(() => {
    const savedNode = storage.getCurrentNode();
    if (savedNode) {
      setCurrentNode(savedNode);
      setCurrentView('app');
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleLogin = (node: Node) => {
    setCurrentNode(node);
    setCurrentPage('upload');
    setCurrentView('app');
  };

  const handleLogout = () => {
    storage.setCurrentNode(null);
    setCurrentNode(null);
    setCurrentPage('upload');
    setCurrentView('landing');
  };

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={handleBackToLanding} />;
  }

  if (!currentNode) {
    return null;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      currentNode={currentNode}
    >
      {currentPage === 'upload' && <UploadPage currentNode={currentNode} />}
      {currentPage === 'retrieve' && <RetrievePage />}
      {currentPage === 'visualizer' && <VisualizerPage />}
      {currentPage === 'global-map' && <GlobalMapPage />}
    </Layout>
  );
}

export default App;
