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
      bgcolor: 'background.default',
      position: 'relative',
    }}>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h5" component="span">
                ⚔️
              </Typography>
              <Typography 
                variant="h6" 
                component="h1" 
                color="primary"
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
      color={active ? "primary" : "inherit"}
    >
      {children}
    </Button>
  );
};

export default Navigation;
