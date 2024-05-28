import * as React from 'react'
import styled from 'styled-components'
import { FlowChartWithState } from '../container'
import { Content, Page, Sidebar, SidebarItem } from '.'
import { chartSimple } from '../misc/exampleChartState'
import { IChart } from '../types'
import { saveState, loadStateFromFile } from '../container/actions'
import { useAppContext } from '../AppContext'

const Message = styled.div`
margin: 10px;
padding: 10px;
background: rgba(0,0,0,0.05);
`


const SaveStateButton = styled.button`
  background-color: #E74C3C; /* red */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
`

const LoadStateButton = styled.button`
  background-color: #B5BAB8; /* gray */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
`

console.log(LoadStateButton, SaveStateButton);

interface DragAndDropSidebarProps {
  onStateChange: (chart: IChart) => void;

}

export const DragAndDropSidebar: React.FC<DragAndDropSidebarProps> = ({ onStateChange }) =>{ 
  
  const { chartState, setChartState} = useAppContext();

  const handleSave = () => {
    // Assuming saveState simply returns the current state without serializing it
    // We need to serialize the chart state to a JSON string
    const savedState = JSON.stringify(saveState(chartState));
  
    // Creating a blob object from the saved state string
    const blob = new Blob([savedState], { type: 'application/json' });
  
    // Creating a URL for the blob object
    const url = URL.createObjectURL(blob);
  
    // Creating a temporary anchor element to initiate the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chartState.json'; // Naming the download file
  
    // Appending the anchor to the body, clicking it to initiate download, and then removing it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  
    // Releasing the created URL
    URL.revokeObjectURL(url);
  
    console.log('Saved Chart State:', savedState); // Log the saved chart state for debugging
  };
  

  const handleLoad = () => {
    // Call the loadStateFromFile function and provide a callback to handle the loaded state
    loadStateFromFile((loadedChart) => {
      setChartState(loadedChart);
      onStateChange(loadedChart); // Ensure onStateChange is called with the loaded state
      console.log('Loaded Chart State:', loadedChart); // Log the loaded chart state for debugging
    });
  };

  
  return(
  <Page>
    <Content>
      <FlowChartWithState initialValue={chartState} onStateChange={onStateChange}
      config={{ smartRouting: true }}/>
    </Content>
    <Sidebar>
      <Message>
        Drag and drop
      </Message>
      <SidebarItem
        type="Cell"
        ports={ {
          port1: {
            id: 'port1',
            type: 'left',

          },

          port3: {
            id: 'port3',
            type: 'top',
          },
          port4: {
            id: 'port4',
            type: 'bottom',
          },
        }}
      />
      <SidebarItem
        type="Rougher"
        ports={ {
          port1: {
            id: 'port1',
            type: 'left',

          },

          port3: {
            id: 'port3',
            type: 'top',
          },
          port4: {
            id: 'port4',
            type: 'bottom',
          },
        }}
      />
      <SidebarItem
        type="Scanvenger"
        ports={ {
          port1: {
            id: 'port1',
            type: 'left',

          },

          port3: {
            id: 'port3',
            type: 'top',
          },
          port4: {
            id: 'port4',
            type: 'bottom',
          },
        }}
      />
      <SidebarItem
        type="Cleaner"
        ports={ {
          port1: {
            id: 'port1',
            type: 'left',

          },

          port3: {
            id: 'port3',
            type: 'top',
          },
          port4: {
            id: 'port4',
            type: 'bottom',
          },
        }}
      />

          <LoadStateButton onClick={handleLoad}>
            Load
          </LoadStateButton>
          <SaveStateButton onClick={handleSave}>Save</SaveStateButton>
    </Sidebar>
  </Page>


)}
