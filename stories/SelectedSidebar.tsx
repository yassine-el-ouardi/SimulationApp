import { cloneDeep, mapValues } from 'lodash'
import * as React from 'react'
import styled from 'styled-components'
import { FlowChart } from '../src'
import * as actions from '../src/container/actions'
import { Content, Page, Sidebar } from './components'
import { chartSimple } from './misc/exampleChartState'
import { onUpdateNodeProperty, onUpdateLinkProperty } from '../src/container/actions'

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
`
const SimulateButton = styled.button`
  background-color: #4CAF50; /* Green */
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


export class SelectedSidebar extends React.Component {
  public state = cloneDeep(chartSimple)
  public render() {
    const chart = this.state
    const selectedNode = chart.selected.id ? chart.nodes[chart.selected.id] : null;
    const selectedLink = chart.selected.id ? chart.links[chart.selected.id] : null;
    const stateActions = mapValues(actions, (func: any) =>
      (...args: any) => this.setState(func(...args))) as typeof actions

    
    console.log('from outside', selectedLink);
    
    // console.log('selectedNode', selectedNode);
    //console.log('id', chart.selected.id);
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
                              <input type="text" 
                                value={value !== null && value !== undefined ? value.toString() : ''}                              onChange={(e) => {
                                const newValue = e.target.value;
                                const propertyKey = key; // The property name (e.g., 'netVolume', 'pulpArea', etc.)

                                // Call the action function to update the state
                                this.setState(onUpdateNodeProperty(propertyKey, newValue));

                                
                              }} />
                            </div>
                          ))
                        }

                      </>
                    }
                  </Message>
                </>


                : chart.selected.type === 'link'
                  ? (
                    // New link type handling
                    <>
                      <Message>
                        <div>Type: {chart.selected.type}</div>
                        <div>ID: {chart.selected.id}</div>
                        <h4>Stream:</h4>
                        {

                          selectedLink && Object.entries(selectedLink.feed || {}).map(([key, value]) => (
                            <div key={key}>
                              <label>{key}: </label>
                              <input type="text" 
                                value={value !== null && value !== undefined ? value.toString() : ''}                              onChange={(e) => {
                                const newValue = e.target.value;
                                const propertyKey = key; // The property name (e.g., 'netVolume', 'pulpArea', etc.)

                                // Call the action function to update the state
                                this.setState(onUpdateLinkProperty(propertyKey, newValue, selectedLink.id));


                              }} />
                            </div>
                          ))
                        }

                      </Message>
                    </>
                  )

                  : <Message>
                    <div>Type: {chart.selected.type}</div>
                    <div>ID: {chart.selected.id}</div>
                  </Message>
              : <Message>Click on a Cell, or Stream</Message>
          }
          <SimulateButton onClick={this.handleSimulateClick}>
            Simulate
          </SimulateButton>
        </Sidebar>
      </Page>
    )
  }

  private handleSimulateClick = () => {
    const updatedChart = cloneDeep(this.state);
  
    const updateLinkFlowSequentially = (linkIds: string[]) => {
      if (linkIds.length === 0) {
        this.setState(updatedChart);
        console.log('All links have been updated');
        return;
      }
  
      const currentLinkId = linkIds[0];
      const currentLink = updatedChart.links[currentLinkId];
  
      let previousTotalSolidFlow = 0;
      const sourceNodeId = currentLink.from.nodeId;
      if (sourceNodeId) {
        const incomingLinks = Object.values(updatedChart.links).filter(
          l => l.to && l.to.nodeId === sourceNodeId && l.to.portId === 'port1'
        );
        if (incomingLinks.length > 0) {
          const incomingLink = incomingLinks[0];
          // Check if feed and totalSolidFlow exists without using optional chaining
          if (incomingLink.feed && typeof incomingLink.feed.totalSolidFlow === 'number') {
            previousTotalSolidFlow = incomingLink.feed.totalSolidFlow;
          }
        }
      }
  
      if (!currentLink.feed) {
        currentLink.feed = {
          totalSolidFlow: null,
          totalLiquidFlow: null,
          pulpMassFlow: null,
          pulpVolumetricFlow: null,
          solidsSG: null,
          pulpSG: null,
          percentSolids: null,
          solidsFraction: null,
          cuPercentage: null,
          fePercentage: null,
          znPercentage: null,
          pbPercentage: null,
        };
      }
      currentLink.feed.totalSolidFlow = previousTotalSolidFlow + 1;
  
      this.setState({ ...updatedChart }, () => {
        console.log(`Link ${currentLinkId} updated`);
        updateLinkFlowSequentially(linkIds.slice(1));
      });
    };
  
    const allLinkIds = Object.keys(updatedChart.links);
    updateLinkFlowSequentially(allLinkIds);
  }
  
  

  
  
}
