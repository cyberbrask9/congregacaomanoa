"use client";
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { PersonAdd, Article } from '@mui/icons-material';
import ListaObjetos from './ListaObjetos';
import LoginIcon from './LoginIcon';
import LeitoresSentinelaFixed from './LeitoresSentinelaFixed';
import TerritorioLista from './TerritorioLista';
import PageTerritorioList from './PageTerritorioList';


const drawerWidth = 240;

// ADICIONE A DEFINIÇÃO DO COMPONENTE MAIN AQUI
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function MenuGaveta() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [componenteAtual, setComponenteAtual] = React.useState('listaObjetos');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuClick = (componente: string) => {
    setComponenteAtual(componente);
    handleDrawerClose();
  };

  const renderizarComponente = () => {
    switch (componenteAtual) {
      case 'listaObjetos':
        return <ListaObjetos />;
      case 'leitorASentinela':
        return <LeitoresSentinelaFixed />;
      case 'opcao1':
        return <div>Opção 1 - Componente em desenvolvimento</div>;
      case 'opcao2':
        return <div>Opção 2 - Componente em desenvolvimento</div>;
      case 'territorio':
        return <PageTerritorioList />;
      case 'teste2':
        return <div>Teste 2 - Componente em desenvolvimento</div>;
      default:
        return <ListaObjetos />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Congregação Manoa
          </Typography>
          <Box sx={{ marginLeft: 'auto' }}>
        {/*     <IconButton color="inherit"> */} 
              <LoginIcon />
{/*    removido para correção </IconButton> */}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleMenuClick('listaObjetos')}>
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Cadastrar Pessoas" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleMenuClick('opcao1')}>
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Opção1" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleMenuClick('opcao2')}>
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Opção2" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleMenuClick('leitorASentinela')}>
              <ListItemIcon>
                <Article />
              </ListItemIcon>
              <ListItemText primary="Leitor A Sentinela" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleMenuClick('territorio')}>
              <ListItemIcon>
                <Article />
              </ListItemIcon>
              <ListItemText primary="Territorios" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleMenuClick('territorio')}>
              <ListItemIcon>
                <Article />
              </ListItemIcon>
              <ListItemText primary="Teste2" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      
      {/* AGORA O COMPONENTE MAIN ESTÁ DEFINIDO E FUNCIONARÁ */}
      <Main open={open}>
        <DrawerHeader />
        {renderizarComponente()}
      </Main>
    </Box>
  );
}