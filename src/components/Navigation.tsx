import React, { useState } from 'react';
import BattleEngineExample from '../utils/effectPipeline/integration/BattleEngineExample';
// @ts-ignore - JavaScript file
import Battle from './Battle';
import AnimationQueueDemo from './AnimationQueueDemo';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  Stack,
  useTheme
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CastleIcon from '@mui/icons-material/Castle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

type Page = 'zustand-battle' | 'legacy-battle' | 'animations';

const Navigation: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('zustand-battle');
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(to bottom right, ${theme.palette.grey[900]}, #311b92, ${theme.palette.grey[900]})`, // Dark slate -> deep purple -> dark slate
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AppBar position="sticky" sx={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-950/80
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.3)', // purple-500/30
        backgroundImage: 'none', // Remove default elevation gradient
        boxShadow: 'none'
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" component="span">
                ⚔️
              </Typography>
              <Typography 
                variant="h6" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #c084fc, #f472b6)', // purple-400 to pink-400
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Squad Battle System
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <NavButton
                active={currentPage === 'zustand-battle'}
                onClick={() => setCurrentPage('zustand-battle')}
                icon={<SportsEsportsIcon />}
              >
                Zustand Battle
              </NavButton>
              <NavButton
                active={currentPage === 'legacy-battle'}
                onClick={() => setCurrentPage('legacy-battle')}
                icon={<CastleIcon />}
              >
                Legacy Battle
              </NavButton>
              <NavButton
                active={currentPage === 'animations'}
                onClick={() => setCurrentPage('animations')}
                icon={<AutoAwesomeIcon />}
              >
                Animations
              </NavButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {currentPage === 'zustand-battle' && <BattleEngineExample />}
        {currentPage === 'legacy-battle' && <Battle />}
        {currentPage === 'animations' && <AnimationQueueDemo />}
      </Box>

      {/* Background Pattern Overlay */}
      <Box sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(147 51 234) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        zIndex: 0
      }} />
    </Box>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, children }) => {
  return (
    <Button
      onClick={onClick}
      startIcon={icon}
      variant={active ? "contained" : "text"}
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        textTransform: 'none',
        transition: 'all 0.2s',
        ...(active ? {
          background: 'linear-gradient(to right, #9333ea, #db2777)', // purple-600 to pink-600
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.5)', // shadow-purple-500/50
          '&:hover': {
            background: 'linear-gradient(to right, #7e22ce, #be185d)',
          }
        } : {
          color: '#d8b4fe', // purple-300
          '&:hover': {
            color: '#f3e8ff', // purple-100
            backgroundColor: 'rgba(88, 28, 135, 0.3)', // purple-900/30
          }
        })
      }}
    >
      {children}
    </Button>
  );
};

export default Navigation
