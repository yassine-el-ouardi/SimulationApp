import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import mapValues from 'lodash/mapValues';
import styled from 'styled-components';
import { FlowChart } from '../components/FlowChart';
import * as actions from '../container/actions';
import { Content, Page, Sidebar } from '.';
import { chartSimple } from '../misc/exampleChartState';
import { onUpdateNodeProperty, onUpdateLinkProperty } from '../container/actions';
import { saveState, loadStateFromFile } from '../container/actions';
import '../custom.css';
import { useAppContext } from '../AppContext';
import { IChart } from '../types';
import debounce from 'lodash/debounce';

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
  font-size: smaller;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SimulateButton = styled.button`
  width: 160px;
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
  border-radius: 5px;

  &:hover {
    background-color: #45a049;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.5);
  }

  &:active {
    background-color: #3e8e41;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  }
`;

const SaveStateButton = styled.button`
  background-color: #e74c3c;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  width: 160px;
  transition: background-color 0.3s, box-shadow 0.3s;
  border-radius: 5px;

  &:hover {
    background-color: #d62c1a;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.5);
  }

  &:active {
    background-color: #bf2412;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  }
`;

const LoadStateButton = styled.button`
  background-color: #b5bab8;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  width: 160px;
  transition: background-color 0.3s, box-shadow 0.3s;
  border-radius: 5px;

  &:hover {
    background-color: #a0a5a8;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(181, 186, 184, 0.5);
  }

  &:active {
    background-color: #898d90;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

const SenarioButton = styled.button`
  background-color: #f0ad4e;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  width: 160px;
  transition: background-color 0.3s, box-shadow 0.3s;
  border-radius: 5px;

  &:hover {
    background-color: #e69a45;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(240, 173, 78, 0.5);
  }

  &:active {
    background-color: #cf8c3f;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

export const SelectedSidebar: React.FC = () => {
  const { chartState, setChartState } = useAppContext();
  const chartRef = useRef(chartState);

  useEffect(() => {
    chartRef.current = chartState;
  }, [chartState]);

  const allowedActions = ['onNodeClick', 'onLinkClick', 'onCanvasClick', 'onNodeDoubleClick', 'onDragCanvas', 'onDragCanvasStop'];

  const stateActions = useMemo(
    () =>
      mapValues(actions, (func: any, key: string) => (...args: any) => {
        if (allowedActions.includes(key)) {
          const newState = func(...args)(chartRef.current);
          setChartState({
            ...chartRef.current,
            ...newState,
          });
        }
      }) as typeof actions,
    [setChartState]
  );

  const debouncedUpdateNodeProperty = useCallback(
    debounce((key, value) => {
      const updatedChart = onUpdateNodeProperty(key, value)(chartRef.current);
      setChartState(updatedChart);
    }, 300),
    [setChartState]
  );

  const debouncedUpdateLinkProperty = useCallback(
    debounce((key, value, id) => {
      const updatedChart = onUpdateLinkProperty(key, value, id)(chartRef.current);
      setChartState(updatedChart);
    }, 300),
    [setChartState]
  );

  const handleSave = () => {
    const savedState = JSON.stringify(saveState(chartRef.current));
    const blob = new Blob([savedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chartState.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Saved Chart State:', savedState);
  };

  const handleLoad = () => {
    loadStateFromFile((loadedChart) => {
      setChartState(loadedChart);
      console.log('Loaded Chart State:', loadedChart);
    });
  };

  const handleSimulateClick = async () => {
    const url = 'http://127.0.0.1:5000/process-circuit';
    const chartString = JSON.stringify(chartRef.current);
    console.log('sent json file:', chartString);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chartString),
      });

      if (response.ok) {
        const responseData = await response.json();
        setChartState(responseData);
        console.log('Response from the Flask app:', responseData);
      } else {
        console.error(`Error occurred: ${response.status}, ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleSenario = async () => {
    const dataUrl = 'http://127.0.0.1:5000/fetch-csv-data';

    try {
      const response = await fetch(dataUrl);
      if (response.ok) {
        const jsonData = await response.json();
        for (let index = 0; index < jsonData.length; index++) {
          const dataObject = jsonData[index];
          const updatedChart = { ...chartRef.current }; // Fetch the latest chartState inside the loop
          updatedChart.links.First_Stream_id.feed = dataObject;

          const processCircuitUrl = 'http://127.0.0.1:5000/process-circuit';
          const updatedChartString = JSON.stringify(updatedChart);
          console.log(`sent json for ${index}`, updatedChartString);

          try {
            const response = await fetch(processCircuitUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedChartString),
            });

            if (response.ok) {
              const responseData = await response.json();

              // Fetch the "selected" part from the current chartState
              const { selected } = chartRef.current;
              console.log('selected:', selected);

              // Merge the "selected" part with the responseData
              const mergedData = {
                ...responseData,
                selected,
              };

              setChartState(mergedData);
              await new Promise((resolve) => setTimeout(resolve, 1000));
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
    }
  };

  const selectedNode = chartState.selected.id ? chartState.nodes[chartState.selected.id] : null;
  const selectedLink = chartState.selected.id ? chartState.links[chartState.selected.id] : null;

  return (
    <Page>
      <Content>
        <FlowChart chart={chartState} callbacks={stateActions} />
      </Content>
      <Sidebar>
        {chartState.selected.type ? (
          chartState.selected.type === 'node' ? (
            <>
              <Message>
                <h4>
                  <b>Flotation Cell's Characteristics:</b>
                </h4>
                <h4>
                  <b>(Caractéristiques de la cellule de flottation):</b>
                </h4>
                {selectedNode && (
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
                          {label} <br /> <span className='sublabel'>{sublabel}</span>
                        </label>
                        <input
                          className='styled-input'
                          type='text'
                          value={
                            selectedNode.cellCharacteristics[key] !== null && selectedNode.cellCharacteristics[key] !== undefined
                              ? selectedNode.cellCharacteristics[key].toString()
                              : 'N/A'
                          }
                          onChange={(e) => {
                            const newValue = e.target.value;
                            debouncedUpdateNodeProperty(key, newValue);
                          }}
                        />
                        <span className='unit'>{unit}</span>
                      </div>
                    ))}
                    <h4>
                      <br />
                      <b>Mineralogical Composition Kinetics:</b>
                    </h4>
                    {[
                      { key: 'R_infCcp', label: 'Infinite Recovery Ccp', sublabel: '(Récupération infini Ccp)', unit: '%' },
                      { key: 'k_maxCcp', label: 'K maximal Ccp', sublabel: '(K maximum Ccp)', unit: '' },
                      { key: 'R_infGn', label: 'Infinite Recovery Gn', sublabel: '(Récupération infini Gn)', unit: '%' },
                      { key: 'k_maxGn', label: 'K maximal Gn', sublabel: '(K maximum Gn)', unit: '' },
                      { key: 'R_infPo', label: 'Infinite Recovery Po', sublabel: '(Récupération infini Po)', unit: '%' },
                      { key: 'k_maxPo', label: 'K maximal Po', sublabel: '(K maximum Po)', unit: '' },
                      { key: 'R_infSp', label: 'Infinite Recovery Sph', sublabel: '(Récupération infini Sph)', unit: '%' },
                      { key: 'k_maxSp', label: 'K maximal Sph', sublabel: '(K maximum Sph)', unit: '' },
                      { key: 'EntrainementSavassiparameters', label: 'Entrainment Savassi parameters', sublabel: '(Paramètres d\'entraînement Savassi)', unit: '' },
                    ].map(({ key, label, sublabel, unit }) => (
                      <div key={key} className='styled-input-container-node'>
                        <label>
                          {label} <br /> <span className='sublabel'>{sublabel}</span>
                        </label>
                        <input
                          className='styled-input'
                          type='text'
                          value={
                            selectedNode.cellCharacteristics[key] !== null && selectedNode.cellCharacteristics[key] !== undefined
                              ? selectedNode.cellCharacteristics[key].toString()
                              : 'N/A'
                          }
                          onChange={(e) => {
                            const newValue = e.target.value;
                            debouncedUpdateNodeProperty(key, newValue);
                          }}
                        />
                        <span className='unit'>{unit}</span>
                      </div>
                    ))}
                  </>
                )}
              </Message>
            </>
          ) : chartState.selected.type === 'link' && chartState.selected.id !== 'First_Stream_id' ? (
            <>
              <Message>
                <h4>
                  <b>Stream:</b>
                </h4>
                {selectedLink && (
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
                      { key: 'znPercentage', label: 'Zn%', sublabel: '(Teneur du Zinc)' },
                    ].map(({ key, label, sublabel }) => (
                      <div key={key} className='styled-input-container'>
                        <label>
                          {label}
                          <br />
                          <span className='sublabel'>{sublabel}</span>
                        </label>
                        <span className='value'>
                          {selectedLink.feed[key] !== null && selectedLink.feed[key] !== undefined
                            ? Number(selectedLink.feed[key]).toFixed(2)
                            : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </Message>
            </>
          ) : chartState.selected.type === 'link' && chartState.selected.id === 'First_Stream_id' ? (
            <>
              <Message>
                <h4>
                  <b>Stream:</b>
                </h4>
                {selectedLink && (
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
                      { key: 'znPercentage', label: 'Zn%', sublabel: '(Teneur du Zinc)' },
                    ].map(({ key, label, sublabel }) => (
                      <div key={key} className='styled-input-container'>
                        <label>
                          {label}
                          <br />
                          <span className='sublabel'>{sublabel}</span>
                        </label>
                        <input
                          type='text'
                          className='styled-input'
                          value={selectedLink.feed[key] !== null && selectedLink.feed[key] !== undefined ? selectedLink.feed[key].toString() : ''}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            debouncedUpdateLinkProperty(key, newValue, selectedLink.id);
                          }}
                        />
                      </div>
                    ))}
                  </>
                )}
              </Message>
            </>
          ) : (
            <Message>
              <div>Type: {chartState.selected.type}</div>
              <div>ID: {chartState.selected.id}</div>
            </Message>
          )
        ) : (
          <Message>Click on a Cell, or Stream</Message>
        )}
        <ButtonContainer>
          <SimulateButton onClick={handleSimulateClick}>Simulate</SimulateButton>
        </ButtonContainer>
        <ButtonContainer>
          <SaveStateButton onClick={handleSave}>Save</SaveStateButton>
        </ButtonContainer>
        <ButtonContainer>
          <LoadStateButton onClick={handleLoad}>Load</LoadStateButton>
        </ButtonContainer>
        <ButtonContainer>
          <SenarioButton onClick={handleSenario}>Run senario</SenarioButton>
        </ButtonContainer>
      </Sidebar>
    </Page>
  );
};