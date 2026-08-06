import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { getStoredJarId } from './hooks/useJar';
import LandingPage from './pages/LandingPage';
import CreateJarPage from './pages/CreateJarPage';
import JoinJarPage from './pages/JoinJarPage';
import JarPage from './pages/JarPage';
import LoadingScreen from './components/LoadingScreen';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const jarId = getStoredJarId();
  if (!jarId) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/create" element={<PageWrapper><CreateJarPage /></PageWrapper>} />
        <Route path="/join" element={<PageWrapper><JoinJarPage /></PageWrapper>} />
        <Route
          path="/jar/:jarId"
          element={
            <ProtectedRoute>
              <PageWrapper><JarPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
