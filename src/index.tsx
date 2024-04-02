import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { DragAndDropSidebar } from './components/DragAndDropSidebar';
//import CheckPortsButton from './components/CheckPortsButton';
import { chartSimple } from './misc/exampleChartState';
import { IChart } from './types/chart';
import { SelectedSidebar } from './components/SelectedSidebar';
import MotherComp from './components/dashboard/MotherComp';
import Concentrate from './components/dashboard/Concentrate';
import Tailing from './components/dashboard/Tailing';

import './styles/style.css';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components'

// Styled components outside of the SidebarMenu function
const MenuStyle = styled.div`
  width: 200px;
  height: 100vh;
  position: fixed;
  background-color: #2C3E50; // A more muted color
  color: white;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; // A modern font-family
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

/*const MenuHeading = styled.h3`
  text-align: center;
  color: #61dafb;
`;
*/
const MenuList = styled.ul`
  list-style-type: none;
  padding: 10px;
`;

const MenuItem = styled.li`
  margin-bottom: 10px;
  &:hover {
    background-color: #34495E; // Slightly highlighting the item on hover
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

const SubMenuItem = styled(MenuLink)`
  padding-left: 20px;
`;

/*const ThreeDotMenu = styled.div`
  cursor: pointer;
  font-size: 24px;
  text-align: center;
`;*/

const DeveloperOptions = styled.div`
  background-color: #444;
  padding: 10px;
  margin-top: 10px;
  transition: all 0.3s ease;
`;

const SidebarMenu = () => {
  const [showDevelopers/*, setShowDevelopers*/] = useState(false);
  const [showFlotationSubMenu, setShowFlotationSubMenu] = useState(false);


  return (
    <MenuStyle>
      <LogoContainer>
        {/* Logo Placeholder */}
        <LogoImg src="logo.png" alt="managem logo"  />
      </LogoContainer>

      {/*<MenuHeading>Menu</MenuHeading>*/}

      <MenuList>

        <MenuItem>
          <MenuLink to="/">Flowsheet Drawing</MenuLink>
        </MenuItem>
        <MenuItem>
          <MenuLink to="/simulation">Simulation and Data Analytics</MenuLink>
        </MenuItem>
        <MenuItem onClick={() => setShowFlotationSubMenu(!showFlotationSubMenu)}>
        {/*rough... */}
          <MenuLink to="#">Flotation cells Dashboards</MenuLink>
          
        </MenuItem>{/*sub menu 
        <MenuItem onClick={() => setShowDevelopers(!showDevelopers)}>
          <ThreeDotMenu>⋮</ThreeDotMenu>
        </MenuItem>*/}
        <SubMenu show={showFlotationSubMenu}>
        <MenuItem>
          <SubMenuItem to="/dashboard">Rougher Dashboard</SubMenuItem>
          <SubMenuItem to="/concentrate">Rougher concentrate</SubMenuItem>
          <SubMenuItem to="/tailing">Rougher tailing</SubMenuItem>
        </MenuItem>


      </SubMenu>
      </MenuList>

      {showDevelopers && (
        <DeveloperOptions>
          <MenuLink to="/dev-settings">Developer Settings</MenuLink>
          <MenuLink to="/api-docs">API Documentation</MenuLink>
          {/* More developer links as needed */}
        </DeveloperOptions>
      )}
    </MenuStyle>
  );
};

// Assume the rest of your App component stays the same.


const App = () => {
  const [/*chart*/, setChart] = useState<IChart>(chartSimple);

  const onStateChange = (newChart: IChart) => {
    setChart(newChart);
  };

  return (
    <BrowserRouter>
      <SidebarMenu />
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/" element={<DragAndDropSidebar onStateChange={onStateChange} />} />
          <Route path="/simulation" element={<SelectedSidebar />} />
          <Route path="/dashboard" element={<MotherComp />} />
          <Route path="/concentrate" element={<Concentrate />} />
          <Route path="/tailing" element={<Tailing />} />
          {/* More routes as needed */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
