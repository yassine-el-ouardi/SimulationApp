import React, { useState } from 'react';
import { DragAndDropSidebar } from './components/DragAndDropSidebar';
//import { chartSimple } from './misc/exampleChartState';
//import { IChart } from './types/chart';
import SelectedSidebarWrapper from './components/SelectedSidebarWrapper';
import MotherComp from './components/dashboard/MotherComp';
import Concentrate from './components/dashboard/Concentrate';
import Tailing from './components/dashboard/Tailing';
//import { createRoot } from 'react-dom/client';
import './styles/style.css';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components'
import ReactDOM from 'react-dom/client'; // Import for React 18's client API
import { AppProvider } from './AppContext'; // Make sure the path is correct
import { useAppContext } from './AppContext';
import { StrictMode } from 'react';



const MenuStyle = styled.div`
  width: 200px;
  height: 100vh;
  position: fixed;
  background-color: #2C3E50;
  color: white;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
`;

const LogoContainer = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const LogoImg = styled.img`
  max-width: 150px;
`;

const MenuList = styled.ul`
  list-style-type: none;
  padding: 10px;
`;

const MenuItem = styled.li`
  margin-bottom: 10px;
  &:hover {
    background-color: #34495E;
  }
`;

const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  padding: '10px',
  display: 'block',
};

const MenuLink = ({ to, children }) => (
  <Link to={to} style={linkStyle}>
    {children}
  </Link>
);

interface SubMenuProps {
  show: boolean;
}

const SubMenu = styled.div<SubMenuProps>`
display: ${props => props.show ? 'block' : 'none'};
background-color: #3B4C5A;
padding-left: 20px;
`;

const SidebarMenu = () => {
  const location = useLocation();
  const [showFlotationSubMenu, setShowFlotationSubMenu] = useState(false);

  return (
    <MenuStyle>
      <LogoContainer>
        <LogoImg src="/logo.png" alt="Logo" />
      </LogoContainer>
      {location.pathname.startsWith('/Dashboard') || location.pathname.startsWith('/concentra') || location.pathname.startsWith('/tailingte') ? (
        <MenuList>
          <MenuItem>
            <MenuLink to={`/Dashboard${location.pathname.slice(10)}`}>Dashboard</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to={`/concentra${location.pathname.slice(10)}`}>Concentrate</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to={`/tailingte${location.pathname.slice(10)}`}>Tailing</MenuLink>
          </MenuItem>
        </MenuList>
      ) : (
        <MenuList>
          <MenuItem>
            <MenuLink to="/">Flowsheet Drawing</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to="/simulation">Simulation and Data Analytics</MenuLink>
          </MenuItem>
          <MenuItem onClick={() => setShowFlotationSubMenu(!showFlotationSubMenu)}>
            <MenuLink to="#">Flotation cells Dashboards</MenuLink>
            {showFlotationSubMenu && (
              <SubMenu show={showFlotationSubMenu}>
                <MenuItem>
                  <MenuLink to="/dashboard/1">Rougher Dashboard</MenuLink>
                </MenuItem>
              </SubMenu>
            )}
          </MenuItem>
        </MenuList>
      )}
    </MenuStyle>
  );
};

const App = () => {
  //const [chart, setChart] = useState<IChart>(chartSimple);
  const { chartState, setChartState, selection, setSelection } = useAppContext();

  return (
    <BrowserRouter>
      <SidebarMenu />
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/" element={<DragAndDropSidebar
              onStateChange={setChartState}
            />} />
          <Route path="/simulation" element={<SelectedSidebarWrapper />} />
          <Route path="/dashboard/:cellId" element={<MotherComp />} />
          <Route path="/concentra/:cellId" element={<Concentrate chart={chartState}/>} />
          <Route path="/tailingte/:cellId" element={<Tailing />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>
);
