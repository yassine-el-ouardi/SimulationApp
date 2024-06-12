import * as React from 'react'
import styled from 'styled-components'
import { FlowChartWithState } from '../container'
import { Content, Page, Sidebar, SidebarItem } from '.'
import { IChart } from '../types'
import { useAppContext } from '../AppContext'

const CellImage = require('./images/Cell.png');
const RougherImage = require('./images/Rougher.png');
const ScanvengerImage = require('./images/Scanvenger.png');
const CleanerImage = require('./images/Cleaner.png');

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  background: rgba(0,0,0,0.05);
`;


interface DragAndDropSidebarProps {
  onStateChange: (chart: IChart) => void;
}

export const DragAndDropSidebar: React.FC<DragAndDropSidebarProps> = ({ onStateChange }) => { 
  const { chartState, setChartState } = useAppContext();

  // Function to check if a type already exists on the canvas
  const checkIfTypeExists = (type: string) => {
    return Object.values(chartState.nodes).some(node => node.type === type);
  };

  return (
    <Page>
      <Content>
        <FlowChartWithState initialValue={chartState} onStateChange={onStateChange} config={{ smartRouting: true }} />
      </Content>
      <Sidebar>
        <Message>Drag and drop</Message>
        <SidebarItem
          type="Rougher"
          ports={{
            port1: { id: 'port1', type: 'left' },
            port3: { id: 'port3', type: 'top' },
            port4: { id: 'port4', type: 'bottom' },
          }}
          image={RougherImage}
          isDraggable={!checkIfTypeExists('Rougher')}
        />
        <SidebarItem
          type="Cell"
          ports={{
            port1: { id: 'port1', type: 'left' },
            port3: { id: 'port3', type: 'top' },
            port4: { id: 'port4', type: 'bottom' },
          }}
          image={CellImage}
          isDraggable={true} // Cells can always be dragged
        />
        <SidebarItem
          type="Scanvenger"
          ports={{
            port1: { id: 'port1', type: 'left' },
            port3: { id: 'port3', type: 'top' },
            port4: { id: 'port4', type: 'bottom' },
          }}
          image={ScanvengerImage}
          isDraggable={!checkIfTypeExists('Scanvenger')}
        />
        <SidebarItem
          type="Cleaner"
          ports={{
            port1: { id: 'port1', type: 'left' },
            port3: { id: 'port3', type: 'top' },
            port4: { id: 'port4', type: 'bottom' },
          }}
          image={CleanerImage}
          isDraggable={!checkIfTypeExists('Cleaner')}
        />
      </Sidebar>
    </Page>
  );
};