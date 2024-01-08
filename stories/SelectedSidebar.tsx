import { cloneDeep, mapValues } from 'lodash'
import * as React from 'react'
import styled from 'styled-components'
import { FlowChart } from '../src'
import * as actions from '../src/container/actions'
import { Content, Page, Sidebar } from './components'
import { chartSimple } from './misc/exampleChartState'
import { onUpdateNodeProperty, onUpdateLinkProperty } from '../src/container/actions'
import { saveState, loadStateFromFile } from '../src/container/actions'
import '../src/custom.css'


const unitsArray = ["m3", "m2", "m2","mm", "m3/min", "%","%", "%", "%","%", "%", "%","%", "%"]

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
const CheckPortsButton = styled.button`
  background-color: #f0ad4e; /* Orange */
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
console.log(CheckPortsButton);

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
export class SelectedSidebar extends React.Component {
  public state = cloneDeep(chartSimple)


  public render() {
    const chart = this.state
    // console.log('selected item', chart);
    const selectedNode = chart.selected.id ? chart.nodes[chart.selected.id] : null;
    const selectedLink = chart.selected.id ? chart.links[chart.selected.id] : null;
    const stateActions = mapValues(actions, (func: any) =>
      (...args: any) => this.setState(func(...args))) as typeof actions

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
                          Object.entries(selectedNode.cellCharacteristics || {}).map(([key, value], index) => (
                            <div key={key} className='styled-input-container'>
                              <label>{key}: </label>
                              <div className="input-unit-container">
                                <input
                                  className="styled-input"
                                  type="text"
                                  value={value !== null && value !== undefined ? value.toString() : ''}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    const propertyKey = key;
                                
                                    // Call the action function to update the state
                                    this.setState(onUpdateNodeProperty(propertyKey, newValue));
                                  }}
                                />
                                <span className="unit">{unitsArray[index]}</span>
                              </div>
                            </div>
                          ))
                        }

                      </>
                    }
                  </Message>
                </>
                : chart.selected.type === 'link' && chart.selected.id !== 'First_Stream_id'
                  ? (
                    // New link type handling
                    <>
                      <Message>
                        <div>Type: {chart.selected.type}</div>
                        <div>ID: {chart.selected.id}</div>
                        <h4>Stream:</h4>
                        {
                          selectedLink && Object.entries(selectedLink.feed || {}).map(([key, value]) => (
                            <div key={key} className='styled-input-container'>
                              <label>{key}: </label>
                              <span className="value">{value !== null && value !== undefined ? value.toString() : 'N/A'}</span>
                            </div>
                          ))
                        }

                      </Message>
                    </>
                  )

                  : chart.selected.type === 'link' && chart.selected.id === 'First_Stream_id'
                    ? (
                      // New link type handling
                      <>
                        <Message>
                          <div>Type: {chart.selected.type}</div>
                          <div>ID: {chart.selected.id}</div>
                          <h4>Stream:</h4>
                          {
                            selectedLink && Object.entries(selectedLink.feed || {}).map(([key, value]) => (
                              <div key={key} className='styled-input-container'>
                                <label>{key}: </label>
                                <input type="text" className='styled-input'
                                  value={value !== null && value !== undefined ? value.toString() : ''} onChange={(e) => {
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
          
          {/* <CheckPortsButton onClick={this.handleCheckPorts}>
            Check Ports
          </CheckPortsButton> */}

          <SaveStateButton onClick={this.handleSave}>
            Save
          </SaveStateButton>

          <LoadStateButton onClick={this.handleLoad}>
            Load
          </LoadStateButton>
          <Message>{this.handleCheckPorts()}</Message>
        </Sidebar>
      </Page>
    )
  }

  handleSave = () => {

    this.setState(saveState(this.state));
  }

  handleLoad = () => {
    // Call the loadStateFromFile function and provide a callback to handle the loaded state
    loadStateFromFile((loadedChart) => {
      this.setState(loadedChart);
    });
  }



  //----------------------------------------------------------------------

  private handleSimulateClick = async () => {

    const url = 'http://127.0.0.1:5000/process-circuit';

    // Assuming you have the data available as a JavaScript object
    // If you need to read from a file, you'll have to handle that differently in a browser context
    const chart = this.state;
    const chartString = JSON.stringify(chart);
    const parsedData = chartString;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });
  
      if (response.ok) {
        const responseData = await response.json();

        this.setState(responseData);

        console.log("Response from the Flask app:", responseData);
      } else {
        console.error(`Error occurred: ${response.status}, ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }


  }


  //----------------------------------------------
  private handleCheckPorts = () => {
    const { nodes, links } = this.state;
    let allPortsLinked = true;
  
    for (const nodeId in nodes) {
      const node = nodes[nodeId];
      for (const portId in node.ports) {
        // Initialize as not linked
        let isLinked = false;
        
        // Check if the portId is found in any 'from' or 'to' of the links
        for (const linkId in links) {
          const link = links[linkId];
          if ((link.from.nodeId === nodeId && link.from.portId === portId) ||
              (link.to.nodeId === nodeId && link.to.portId === portId)) {
            isLinked = true;
            break; // Stop checking if we found a link
          }
        }
  
        if (!isLinked) {
          allPortsLinked = false;
          console.log(`Port ${portId} on node ${nodeId} is not connected to any link.`);
          break; // Stop checking other ports if one is already found not linked
        }
      }
      if (!allPortsLinked) {
        break; // Stop checking other nodes if one port is already found not linked
      }
    }
  
    if (allPortsLinked) {
      return 'All ports are connected to links.';
    } else {
      return 'Some ports are not connected to links.';
    }
  }
  

}