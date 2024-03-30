import * as React from 'react'
import styled from 'styled-components'
import { FlowChartWithState } from '..'
import { Content, Page, Sidebar, SidebarItem } from '.'
import { chartSimple } from '../misc/exampleChartState'
import { IChart } from '..'
import { /*saveState,*/ loadStateFromFile } from '../container/actions'

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
  
  const [chartState, setChartState] = React.useState(chartSimple);

  const handleLoad = () => {
    // Call the loadStateFromFile function and provide a callback to handle the loaded state
    loadStateFromFile((loadedChart) => {
      setChartState(loadedChart);
      onStateChange(loadedChart); // Ensure onStateChange is called with the loaded state
      console.log('Loaded Chart State:', loadedChart); // Log the loaded chart state for debugging
    });
  };
  handleLoad
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
        type="First Cell"
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
          {/* <SaveStateButton /*onClick={this.handleSave}>
            Save
          </SaveStateButton>
          <LoadStateButton onClick={handleLoad}>
            Load
          </LoadStateButton> */}
    </Sidebar>
  </Page>


)}
