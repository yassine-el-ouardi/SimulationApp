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
import { useAppContext } from '../AppContext'
import { IChart } from '../types'
import { InfluxDB, Point } from '@influxdata/influxdb-client';


//const unitsArray = ["m3", "m2", "m2","mm", "m3/min", "%","%", "%", "%","%", "%", "%","%", "%"]

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
  font-size: smaller;
`
const ButtonContainer = styled.div`
  display: flex;        /* Establishes this div as a flex container */
  justify-content: center; /* Centers children along the horizontal axis */
  align-items: center;  /* Centers children along the vertical axis */
`;

const SimulateButton = styled.button`
  width: 160px;
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
  transition: background-color 0.3s, box-shadow 0.3s; /* Smooth transition for hover effect */
  border-radius: 5px; /* Rounded corners */

  &:hover {
    background-color: #45a049; /* Slightly darker green on hover */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Soft shadow for depth */
  }

  &:focus {
    outline: none; /* Removes default focus outline */
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.5); /* Custom focus style to improve accessibility */
  }

  &:active {
    background-color: #3e8e41; /* Even darker green when button is clicked */
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3); /* Deeper shadow to simulate pressing */
  }
`;


const SaveStateButton = styled.button`
  background-color: #E74C3C; /* Red */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  width: 160px; /* Set the width of the button */
  transition: background-color 0.3s, box-shadow 0.3s; /* Smooth transition for hover effect */
  border-radius: 5px; /* Rounded corners for aesthetics */

  &:hover {
    background-color: #D62C1A; /* Slightly darker red on hover */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Soft shadow for depth */
  }

  &:focus {
    outline: none; /* Removes default focus outline */
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.5); /* Custom focus style to improve accessibility */
  }

  &:active {
    background-color: #BF2412; /* Even darker red when button is clicked */
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3); /* Deeper shadow to simulate pressing */
  }
`;

const LoadStateButton = styled.button`
  background-color: #B5BAB8; /* Gray, but you might opt for a more vibrant color */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  width: 160px; /* Fixed width */
  transition: background-color 0.3s, box-shadow 0.3s; /* Smooth transitions for interactive feedback */
  border-radius: 5px; /* Slight rounding of corners */

  &:hover {
    background-color: #A0A5A8; /* Slightly lighter gray for hover state */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
  }

  &:focus {
    outline: none; /* Removing the default focus outline */
    box-shadow: 0 0 0 3px rgba(181, 186, 184, 0.5); /* Custom focus style for better visibility */
  }

  &:active {
    background-color: #898D90; /* Even lighter gray for active/click state */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3); /* Inner shadow for a "pressed" effect */
  }
`;

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
  width: 160px; /* Fixed width */
  transition: background-color 0.3s, box-shadow 0.3s; /* Smooth transitions for interactive feedback */
  border-radius: 5px; /* Slight rounding of corners */

  &:hover {
    background-color: #e69a45; /* Slightly darker shade of orange for hover state */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
  }

  &:focus {
    outline: none; /* Removing the default focus outline */
    box-shadow: 0 0 0 3px rgba(240, 173, 78, 0.5); /* Custom focus style for better visibility */
  }

  &:active {
    background-color: #cf8c3f; /* Even darker shade of orange for active/click state */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3); /* Inner shadow for a "pressed" effect */
  }
`;

interface SelectedSidebarProps {
  onStateChange: (chart: IChart) => void;
}

export const SelectedSidebar: React.FC<SelectedSidebarProps> = ({ onStateChange }) => {
  const { chartState, setChartState } = useAppContext();
  const chart = chartState;

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

  //----------------------------------------------------------------------

  const handleSimulateClick = async () => {

    const url = 'http://127.0.0.1:5000/process-circuit';

    // Assuming you have the data available as a JavaScript object
    // If you need to read from a file, you'll have to handle that differently in a browser context
    const chart = chartState;
    const chartString = JSON.stringify(chart);
    const parsedData = chartString;
    console.log("sent json file:",parsedData);
  
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

        setChartState(responseData);

        console.log("Response from the Flask app:", responseData);
      } else {
        console.error(`Error occurred: ${response.status}, ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  }

    //------------------------------------------------------------------------------senario


    const handleSenario = async () => {
      const dataUrl = 'http://127.0.0.1:5000/fetch-csv-data';
      const chart = chartState;
    
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
                setChartState(responseData);
                //store it also in data base (influxdb):
  
  // Setup your InfluxDB connection
  /*
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
  
  
                console.log(`Response from the backend for Object ${index}:`, responseData);*/
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
  
  const selectedNode = chart.selected.id ? chart.nodes[chart.selected.id] : null;
  const selectedLink = chart.selected.id ? chart.links[chart.selected.id] : null;
  
  const stateActions = mapValues(actions, (func: any) =>
    (...args: any) => setChartState(func(...args))) as typeof actions;

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
                    <h4><b>Flotation Cell's Characteristics:</b></h4>
                    <h4><b>(Caractéristiques de la cellule de flottation):</b></h4>
                    {
                      selectedNode && (
                        <>
                          {[
                            { key: 'netVolume', label: 'Net Volume', sublabel: '(Volume Net de la cellule de flottation)', unit: 'm3' },
                            { key: 'pulpArea', label: 'Pulp Area', sublabel: '(Surface de la zone pulpe)', unit: 'm2' },
                            { key: 'frothSurfaceArea', label: 'Froth Surface Area', sublabel: '(Surface de la zone de la mousse)', unit: 'm2' },
                            { key: 'frothThickness', label: 'Froth Thickness', sublabel: '(Niveau de la mousse)', unit: 'mm' },
                            { key: 'airFlowRate', label: 'Air Flow Rate', sublabel: '(Débit de l\'air injecté dans la cellule)', unit: 'm3/min' },
                            
                          ].map(({ key, label, sublabel, unit }) => (
                            <div key={key} className='styled-input-container-node'>
                              <label>
                                {label} <br /> <span className="sublabel">{sublabel}</span>
                              </label>
                              <input
                                className="styled-input"
                                type="text"
                                value={selectedNode.cellCharacteristics[key] !== null && selectedNode.cellCharacteristics[key] !== undefined ? selectedNode.cellCharacteristics[key].toString() : 'N/A'}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  const updatedChart = onUpdateNodeProperty(key, newValue)(chart);
                                  setChartState(updatedChart);
                                }}
                              />
                              <span className="unit">{unit}</span>
                            </div>
                          ))}

                          {/* Additional headings and values as necessary */}
                          <h4><br /><b>Mineralogical Composition Kinetics:</b></h4>
                          {[
                            { key: 'R_infCcp', label: 'Infinite Recovery Ccp', sublabel: '(Récupération infini Ccp)', unit: '%' },
                            { key: 'k_maxCcp', label: 'K maximal Ccp', sublabel: '(K maximum Ccp)', unit: '' },
                            { key: 'R_infGn', label: 'Infinite Recovery Gn', sublabel: '(Récupération infini Gn)', unit: '%' },
                            { key: 'k_maxGn', label: 'K maximal Gn', sublabel: '(K maximum Gn)', unit: '' },
                            { key: 'R_infPo', label: 'Infinite Recovery Po', sublabel: '(Récupération infini Po)', unit: '%' },
                            { key: 'k_maxPo', label: 'K maximal Po', sublabel: '(K maximum Po)', unit: '' },
                            { key: 'R_infSp', label: 'Infinite Recovery Sph', sublabel: '(Récupération infini Sph)', unit: '%' },
                            { key: 'k_maxSp', label: 'K maximal Sph', sublabel: '(K maximum Sph)', unit: '' },
                            { key: 'EntrainementSavassiparameters', label: 'Entrainment Savassi parameters', sublabel: '(Paramètres d\'entraînement Savassi)', unit: '' }
                          ].map(({ key, label, sublabel, unit }) => (
                            <div key={key} className='styled-input-container-node'>
                              <label>
                                {label} <br /> <span className="sublabel">{sublabel}</span>
                              </label>
                              <input
                                className="styled-input"
                                type="text"
                                value={selectedNode.cellCharacteristics[key] !== null && selectedNode.cellCharacteristics[key] !== undefined ? selectedNode.cellCharacteristics[key].toString() : 'N/A'}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  const updatedChart = onUpdateNodeProperty(key, newValue)(chart);
                                  setChartState(updatedChart);
                                }}
                              />
                              <span className="unit">{unit}</span>
                            </div>
                          ))}
                        </>
                      )
                    }
                  </Message>



                </>
                : chart.selected.type === 'link' && chart.selected.id !== 'First_Stream_id'
                  ? (
                    // New link type handling
                    <>
                      <Message>
                        {/*<div>Type: {chart.selected.type}</div>
                        <div>ID: {chart.selected.id}</div>*/}
                        <h4><b>Stream:</b></h4>
                        {
                          selectedLink && (
                            <>
                              {[
                                { key: 'totalSolidFlow', label: 'Total Solids Flow', sublabel: '(Débit total des solides)' },
                                { key: 'totalLiquidFlow', label: 'Total Liquid Flow', sublabel: '(Débit total du Liquid)' },
                                { key: 'pulpVolumetricFlow', label: 'Pulp Volumetric Flow', sublabel: '(Débit volumétrique de la pulpe)' },
                                { key: 'solidsSG', label: 'Solids SG', sublabel: '(Poids Moléculaire des solides)' },
                                { key: 'pulpSG', label: 'Pulp SG', sublabel: '(Poids Moléculaire de la pulpe)' },
                                { key: 'solidsFraction', label: 'Solids Fraction', sublabel: '(Fraction de solides)' },
                                { key: 'cuPercentage', label: 'Cu%', sublabel: '(Teneur du Cuivre)' },
                                { key: 'fePercentage', label: 'Fe%', sublabel: '(Teneur du Fer)' },
                                { key: 'pbPercentage', label: 'Pb%', sublabel: '(Teneur du Plomb)' },
                                { key: 'znPercentage', label: 'Zn%', sublabel: '(Teneur du Zinc)' }
                              ].map(({ key, label, sublabel }) => (
                                <div key={key} className='styled-input-container'>
                                  <label>
                                    {label}
                                    <br />
                                    <span className="sublabel">{sublabel}</span>
                                  </label>
                                  <span className="value">
                                    {selectedLink.feed[key] !== null && selectedLink.feed[key] !== undefined
                                      ? Number(selectedLink.feed[key]).toFixed(2)
                                      : 'N/A'}
                                  </span>
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
                          <h4><b>Stream:</b></h4>
                          {
                            selectedLink && (
                              <>
                                {[
                                  { key: 'totalSolidFlow', label: 'Total Solids Flow', sublabel: '(Débit total des solides)' },
                                  { key: 'totalLiquidFlow', label: 'Total Liquid Flow', sublabel: '(Débit total du Liquid)' },
                                  { key: 'pulpVolumetricFlow', label: 'Pulp Volumetric Flow', sublabel: '(Débit volumétrique de la pulpe)' },
                                  { key: 'solidsSG', label: 'Solids SG', sublabel: '(Poids Moléculaire des solides)' },
                                  { key: 'pulpSG', label: 'Pulp SG', sublabel: '(Poids Moléculaire de la pulpe)' },
                                  { key: 'solidsFraction', label: 'Solids Fraction', sublabel: '(Fraction de solides)' },
                                  { key: 'cuPercentage', label: 'Cu%', sublabel: '(Teneur du Cuivre)' },
                                  { key: 'fePercentage', label: 'Fe%', sublabel: '(Teneur du Fer)' },
                                  { key: 'pbPercentage', label: 'Pb%', sublabel: '(Teneur du Plomb)' },
                                  { key: 'znPercentage', label: 'Zn%', sublabel: '(Teneur du Zinc)' }
                                ].map(({ key, label, sublabel }) => (
                                  <div key={key} className='styled-input-container'>
                                    <label>
                                      {label}
                                      <br />
                                      <span className="sublabel">{sublabel}</span>
                                    </label>
                                    <input
                                      type="text"
                                      className='styled-input'
                                      value={selectedLink.feed[key] !== null && selectedLink.feed[key] !== undefined ? selectedLink.feed[key].toString() : ''}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        // Call the action function to update the state
                                        const updatedChart = onUpdateLinkProperty(key, newValue, selectedLink.id)(chart);
                                        setChartState(updatedChart);
                                      }}
                                    />
                                  </div>
                                ))}
                              </>
                            )
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
          <ButtonContainer>
          <SimulateButton onClick={handleSimulateClick}>
            Simulate
          </SimulateButton>
          </ButtonContainer>
          <ButtonContainer>
          <SaveStateButton onClick={handleSave}>
            Save
          </SaveStateButton>
          </ButtonContainer>
          <ButtonContainer>
          <LoadStateButton onClick={handleLoad}>
            Load
          </LoadStateButton>
          </ButtonContainer>
          <ButtonContainer>
          <SenarioButton onClick={handleSenario}>
            Run senario
          </SenarioButton>
          </ButtonContainer>
          {/*<Message>{this.handleCheckPorts()}</Message>*/}
        </Sidebar>
      </Page>
    )
  }