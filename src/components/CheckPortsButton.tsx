import * as React from 'react';
import { IChart } from '../types';
interface Props {
  chart: IChart;
  }

const CheckPortsButton: React.FC<Props> = ({ chart }) => {
  const handleCheckPorts = () => {
    let allPortsConnected = true;

    // Iterate over all nodes
    Object.values(chart.nodes).forEach(node => {
      // Iterate over all ports of the node
      Object.keys(node.ports).forEach(portId => {
        const isPortConnected = Object.values(chart.links).some(link => 
          (link.from.nodeId === node.id && link.from.portId === portId) ||
          (link.to.nodeId === node.id && link.to.portId === portId)
        );
  
        if (!isPortConnected) {
          allPortsConnected = false;
        }
      });
    });
  
    if (allPortsConnected) {
      alert("All ports are connected!");
    } else {
      alert("Not all ports are connected.");
    }
  };

  return (
    <div>
      <h3>Check Ports Button Demo</h3>
      <button onClick={handleCheckPorts}>Check Ports</button>
    </div>
  );
};

export default CheckPortsButton;
