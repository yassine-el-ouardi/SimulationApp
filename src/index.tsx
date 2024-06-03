import React, { useState } from 'react';
import { DragAndDropSidebar } from './components/DragAndDropSidebar';
import { chartSimple } from './misc/exampleChartState';
import { IChart } from './types/chart';
import { SelectedSidebar } from './components/SelectedSidebar';
import MotherComp from './components/dashboard/MotherComp';
import Concentrate from './components/dashboard/Concentrate';
import Tailing from './components/dashboard/Tailing';
import './styles/style.css';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components'
import ReactDOM from 'react-dom/client';
import { AppProvider } from './AppContext';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '700px',  // Adjust width to accommodate side-by-side layout
    borderRadius: '10px',
    padding: '20px',
  },
};


const MenuStyle = styled.div`
  width: 200px;
  height: 100vh;
  position: fixed;
  background-color: #484B53;
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

const ModalHeader = styled.h2`
  font-weight: bold;
  text-align: center;
  font-size: 25px;
  margin-bottom: 10px;
`;

const ModalSectionTitle = styled.p`
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 5px;
`;

const ModalList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 15px 0;
`;

const ModalListItem = styled.li`
  margin: 0 0 5px 0;
`;

const CloseButton = styled.button`
  background-color: #2C3E50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;
  float: right;
`;

/*const SubMenuItem = styled(MenuLink)`
  padding-left: 20px;
`;

const ThreeDotMenu = styled.div`
  cursor: pointer;
  font-size: 24px;
  text-align: center;
`;

const DeveloperOptions = styled.div`
  background-color: #444;
  padding: 10px;
  margin-top: 10px;
  transition: all 0.3s ease;
`;*/
const ModalContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ModalSection = styled.div`
  width: 45%;
`;

const SidebarMenu = () => {
  const location = useLocation();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

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
          <MenuItem>
            <button style={linkStyle} onClick={openModal}>Show Info</button>
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Example Modal"
            >
              <ModalHeader>Simulation Twin</ModalHeader>
              <ModalContent>
                <ModalSection>
                <ModalSectionTitle>Professors:</ModalSectionTitle>
                <ModalList>
                  <ModalListItem>Prof. El Hassan ABDELWAHED</ModalListItem>
                  <ModalListItem>Prof. Aimad QAZDAR</ModalListItem>
                </ModalList>
                <ModalSectionTitle>Researchers:</ModalSectionTitle>
                <ModalList>
                  <ModalListItem>Oussama HASIDI, PhD</ModalListItem>
                </ModalList>
                <ModalSectionTitle>Software Developers:</ModalSectionTitle>
                <ModalList>
                  <ModalListItem>Yassine El-Ouardi</ModalListItem>
                  <ModalListItem>Achik Aznag</ModalListItem>
                  <ModalListItem>Oualid Charaf</ModalListItem>
                  <ModalListItem>Bouchra Boufous</ModalListItem>
                </ModalList>
                </ModalSection>
                <ModalSection>
                <ModalSectionTitle>Industrials Experts:</ModalSectionTitle>
                <ModalList>
                  <ModalListItem>Mme. Intissar BENZAKOUR</ModalListItem>
                  <ModalListItem>M. Moulay Abdellah EL ALAOUI-CHRIFI</ModalListItem>
                  <ModalListItem>M. Abdelmalek BOUSSETTA</ModalListItem>
                  <ModalListItem>Mme. Rachida CHAHID</ModalListItem>
                  <ModalListItem>M. Mohamed Achraf AMADDAH</ModalListItem>
                  <ModalListItem>M. Halim ABDELLATIF</ModalListItem>
                  <ModalListItem>M. Driss ASKOUR</ModalListItem>
                </ModalList>
                </ModalSection>
              </ModalContent>
              <CloseButton onClick={closeModal}>Close</CloseButton>
            </Modal>
          </MenuItem>
        </MenuList>
      )}
    </MenuStyle>
  );
};

const App = () => {
  const [chart, setChart] = useState<IChart>(chartSimple);

  return (
    <BrowserRouter>
      <SidebarMenu />
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/" element={<DragAndDropSidebar onStateChange={(newChart) => setChart(newChart)} />} />
          <Route path="/simulation" element={<SelectedSidebar onStateChange={(newChart) => setChart(newChart)}/>} />
          <Route path="/dashboard/:cellId" element={<MotherComp />} />
          <Route path="/concentra/:cellId" element={<Concentrate/>} />
          <Route path="/tailingte/:cellId" element={<Tailing/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
    <AppProvider>
      <App />
    </AppProvider>
);
