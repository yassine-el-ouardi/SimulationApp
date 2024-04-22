import cloneDeep from 'lodash/cloneDeep';
import mapValues from 'lodash/mapValues';
import * as React from 'react'
import styled from 'styled-components'
import { FlowChart } from '../components/FlowChart'
import * as actions from '../container/actions'
import { Content, Page, Sidebar } from '.'
import { chartSimple } from '../misc/exampleChartState'
import { onUpdateNodeProperty, onUpdateLinkProperty } from '../container/actions'
import { saveState, loadStateFromFile } from '../container/actions'
import '../custom.css'
import { InfluxDB, Point } from '@influxdata/influxdb-client';


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
const SenarioButton = styled.button`
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
                          selectedLink && (
                            <>
                              {[
                                { key: 'totalSolidFlow', label: 'Total Solids Flow (Débit total des solides)' },
                                { key: 'totalLiquidFlow', label: 'Total Liquid Flow (Débit total du Liquid)' },
                                { key: 'pulpVolumetricFlow', label: 'Pulp Volumetric Flow (Débit volumétrique de la pulpe)' },
                                { key: 'solidsSG', label: 'Solids SG (Poids Moléculaire des solides)' },
                                { key: 'pulpSG', label: 'Pulp SG (Poids Moléculaire de la pulpe)' },
                                { key: 'solidsFraction', label: 'Solids Fraction (Fraction de solides)' },
                                { key: 'cuPercentage', label: 'Cu% (Teneur du Cuivre)' },
                                { key: 'fePercentage', label: 'Fe% (Teneur du Fer)' },
                                { key: 'pbPercentage', label: 'Pb% (Teneur du Plomb)' },
                                { key: 'znPercentage', label: 'Zn% (Teneur du Zinc)' }
                              ].map(({ key, label }) => (
                                <div key={key} className='styled-input-container'>
                                  <label>{label}: </label>
                                  <span className="value">{selectedLink.feed[key] !== null && selectedLink.feed[key] !== undefined ? selectedLink.feed[key].toString() : 'N/A'}</span>
                                </div>
                              ))}
                            </>
                          )
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
          
          <SaveStateButton onClick={this.handleSave}>
            Save
          </SaveStateButton>

          <LoadStateButton onClick={this.handleLoad}>
            Load
          </LoadStateButton>
          <SenarioButton onClick={this.handleSenario}>
            Run senario
          </SenarioButton>
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


  //------------------------------------------------------------------------------senario


  private handleSenario = async () => {
    const dataUrl = 'http://127.0.0.1:5000/fetch-csv-data';
    const chart = this.state;
  
    try {
      const response = await fetch(dataUrl);
      if (response.ok) {
        const jsonData = await response.json();
  
        // Iterate over the array and log each object
        for (let index = 0; index < jsonData.length; index++) {
          const dataObject = jsonData[index];
          const updatedChart = { ...chart };
          updatedChart.links.First_Stream_id.feed = dataObject;
          // console.log(`chart for ${index}`, updatedChart);
  
          // send request to the backend process-circuit endpoint
          try {
            const processCircuitUrl = 'http://127.0.0.1:5000/process-circuit';
            const updatedChartString = JSON.stringify(updatedChart);
            console.log(`sent json for ${index}`,updatedChartString);
            
  
            const response = await fetch(processCircuitUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedChartString),
            });
  
            if (response.ok) {
              const responseData = await response.json();
              this.setState(responseData);
              //store it also in data base (influxdb):

// Setup your InfluxDB connection
              const token = 'sUJZaiT1oMfvd0MKraMlw5WYl442Mom46YCLFcReJ3LXX0Ka9NWHF8e6uV6N8euHBY2C_QZph5Q4U78SPTkOLA==';
              const org = 'Dev team';
              const bucket = 'Seconds';
              const url = 'http://localhost:8086';

              const client = new InfluxDB({ url, token });
              const writeApi = client.getWriteApi(org, bucket);

              // Create a point and write data to the 'Seconds' bucket
              const point = new Point('flotationCell')
                .tag('cell_id', '1')
                .floatField('feed_rate', 123.45)
                .floatField('concentration', 67.89);

              writeApi.writePoint(point);
              writeApi.close().then(() => console.log('Finished writing.'));


              console.log(`Response from the backend for Object ${index}:`, responseData);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              console.error(`Error occurred: ${response.status}, ${response.statusText}`);
            }
          } catch (error) {
            console.error('Error sending request to process-circuit endpoint:', error);
          }
        }
      } else {
        console.error(`Error occurred: ${response.status}, ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error handling CSV file:', error);
      // Handle error if needed
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
          // console.log(`Port ${portId} on node ${nodeId} is not connected to any link.`);
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