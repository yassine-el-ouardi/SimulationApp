import { cloneDeep, mapValues } from 'lodash'
import * as React from 'react'
import styled from 'styled-components'
import { FlowChart } from '../src'
import * as actions from '../src/container/actions'
import { Content, Page, Sidebar } from './components'
import { chartSimple } from './misc/exampleChartState'

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
`



export class SelectedSidebar extends React.Component {
  public state = cloneDeep(chartSimple)
  public render () {
    const chart = this.state
    const selectedNode = chart.selected.id ? chart.nodes[chart.selected.id] : null;
    const stateActions = mapValues(actions, (func: any) =>
      (...args: any) => this.setState(func(...args))) as typeof actions
    
    console.log('selectedNode', selectedNode);
    console.log('id',chart.selected.id);
    return (
      <Page>
        <Content>
          <FlowChart
            chart={chart}
            callbacks={stateActions}
          />
        </Content>
          <Sidebar>
          {
            chart.selected.type 
            ? chart.selected.type === 'node' 
              ? <>
                  <Message>
                    <div>Type: {chart.selected.type}</div>
                    <div>ID: {chart.selected.id}</div>
                  {
                    selectedNode &&
                    <>
                      <h4>Cell Characteristics:</h4>
                      {
                        Object.entries(selectedNode.cellCharacteristics || {}).map(([key, value]) => (
                          <div key={key}>
                            <label>{key}: </label>
                            <input type="text" defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => {
                              // Handle the change here. You may want to update the state with the new value.
                              console.log(e.target.value);
                            }}/>
                          </div>
                        ) )
                      }
                      <h4>Stream:</h4>
                      {
                        Object.entries(selectedNode.feed || {}).map(([key, value]) => (
                          <div key={key}>
                            <label>{key}: </label>
                            <input type="text" defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => {
                              // Handle the change here. You may want to update the state with the new value.
                              console.log(e.target.value);
                            }}/>
                          </div>
                        ) )
                      }
                    </>
                  }
                </Message>
                </>
              : <Message>
                  <div>Type: {chart.selected.type}</div>
                  <div>ID: {chart.selected.id}</div>
                </Message>
            : <Message>Click on a Cell, or Stream</Message>
          }
        </Sidebar>
      </Page>
    )
  }
}
