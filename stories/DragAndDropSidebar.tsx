import * as React from 'react'
import styled from 'styled-components'
import { FlowChartWithState } from '../src'
import { Content, Page, Sidebar, SidebarItem } from './components'
import { chartSimple } from './misc/exampleChartState'
import { IChart } from '../src'

const Message = styled.div`
margin: 10px;
padding: 10px;
background: rgba(0,0,0,0.05);
`
interface DragAndDropSidebarProps {
  onStateChange: (chart: IChart) => void;
}

export const DragAndDropSidebar: React.FC<DragAndDropSidebarProps> = ({ onStateChange }) => (
  <Page>
    <Content>
      <FlowChartWithState initialValue={chartSimple} onStateChange={onStateChange}/>
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
    </Sidebar>
  </Page>
)
