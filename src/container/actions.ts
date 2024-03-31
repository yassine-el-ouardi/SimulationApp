import {
  IChart,
  IConfig,
  IOnCanvasClick,
  IOnCanvasDrop,
  IOnDeleteKey,
  IOnDragCanvas,
  IOnDragCanvasStop,
  IOnDragNode,
  IOnDragNodeStop,
  IOnDragLink,
  IOnDragLinkStop,
  IOnLinkCancel,
  IOnLinkClick,
  IOnLinkComplete,
  IOnLinkMouseEnter,
  IOnLinkMouseLeave,
  IOnLinkMove,
  IOnLinkStart,
  IOnNodeClick,
  IOnNodeDoubleClick,
  IOnNodeMouseEnter,
  IOnNodeMouseLeave,
  IOnNodeSizeChange,
  IOnPortPositionChange,
  IOnZoomCanvas,
  IStateCallback,
} from '../types'
import {  identity,
} from '../utils'
import { rotate } from './utils/rotate'

import { getLinkPosition } from './utils/getLinkPosition'

import { ISelectedOrHovered } from './../types/chart';


function getOffset (config: any, data: any, zoom?: number) {
  let offset = { x: data.x, y: data.y }
  if (config && config.snapToGrid) {
    offset = {
      x: Math.round(data.x / 20) * 20,
      y: Math.round(data.y / 20) * 20,
    }
  }
  if (zoom) {
    offset.x = offset.x / zoom
    offset.y = offset.y / zoom
  }
  return offset
}

/**
 * This file contains actions for updating state after each of the required callbacks
 */

//-------------------------------------
// This function updates the position of a single waypoint or initializes it when dragged
export const onDragLink: IStateCallback<IOnDragLink> = ({ config, event, data, id }) => (chart: IChart) => {
  const link = chart.links[id];

  // This variable should be determined when the drag starts and then used throughout the drag operation
  // For this example, let's assume it's determined elsewhere and passed in with 'data'
  const draggingWaypointIndex = data.waypointIndex;

  if (link && link.waypoints && draggingWaypointIndex != null && link.waypoints[draggingWaypointIndex]) {
    // Update only the position of the waypoint being dragged based on the drag delta
    const updatedWaypoint = {
      x: link.waypoints[draggingWaypointIndex].x + data.deltaX,
      y: link.waypoints[draggingWaypointIndex].y + data.deltaY,
    };

    // Create a new waypoints array with the updated waypoint
    const updatedWaypoints = [...link.waypoints];
    updatedWaypoints[draggingWaypointIndex] = updatedWaypoint;

    // Update the chart with the modified link
    chart.links[id] = {
      ...link,
      waypoints: updatedWaypoints,
    };
  }

  return chart;
};




// This function is called when the dragging stops
export const onDragLinkStop: IStateCallback<IOnDragLinkStop> = ({ config, event, data, id }) => (chart: IChart) => {
  // The onDragLinkStop function can be used to finalize the link dragging action
  // For now, it simply returns the chart unchanged.
  // Add any finalization logic here if necessary
  return chart;
};

//-------------------------------------

export const onDragNode: IStateCallback<IOnDragNode> = ({ config, event, data, id }) => (chart: IChart) => {
  const nodechart = chart.nodes[id]

  if (nodechart) {
    const delta = {
      x: data.deltaX,
      y: data.deltaY,
    }
    chart.nodes[id] = {
      ...nodechart,
      position: {
        x: nodechart.position.x + delta.x,
        y: nodechart.position.y + delta.y,
      },
    }
  }

  return chart
}

export const onDragNodeStop: IStateCallback<IOnDragNodeStop> = () => identity

export const onDragCanvas: IOnDragCanvas = ({ config, data }) => (chart: IChart): IChart => {
  chart.offset = getOffset(config, { x: data.positionX, y: data.positionY })
  return chart
}

export const onDragCanvasStop: IStateCallback<IOnDragCanvasStop> = () => identity

export const onLinkStart: IStateCallback<IOnLinkStart> = ({ linkId, fromNodeId, fromPortId }) => (
  chart: IChart,
): IChart => {
  //---------------------------waypoints
/*
  const fromNode = chart.nodes[fromNodeId];
  //const fromPort = fromNode.ports[fromPortId];
  const startPos = getLinkPosition(fromNode, fromPortId);
  // Initialize waypoints extending in an arbitrary direction from the start position
  // For demonstration, let's extend them horizontally by an arbitrary amount (e.g., 100 units)
  const waypointOffset = 50; 
  const waypoints = [
    { x: startPos.x + waypointOffset, y: startPos.y },
    { x: startPos.x + 2 * waypointOffset, y: startPos.y }
  ];
*/
  //--------------------------------------
  chart.links[linkId] = {
    id: linkId,
    from: {
      nodeId: fromNodeId,
      portId: fromPortId,
    },
    to: {},
    //waypoints,
    feed: {
      totalSolidFlow: null,
      totalLiquidFlow: null,
      //pulpMassFlow: null,
      pulpVolumetricFlow: null,
      solidsSG: null,
      pulpSG: null,
      //percentSolids: null,
      solidsFraction: null,
      cuPercentage: null,
      fePercentage: null,
      pbPercentage: null,
      znPercentage: null,
    }
  }
  return chart
}

export const onLinkMove: IStateCallback<IOnLinkMove> = ({ linkId, toPosition }) => (chart: IChart): IChart => {
  const link = chart.links[linkId]
  link.to.position = toPosition
  chart.links[linkId] = { ...link }
  return chart
}

export const onLinkComplete: IStateCallback<IOnLinkComplete> = (props) => {
  const { linkId, fromNodeId, fromPortId, toNodeId, toPortId, config = {} } = props;

  return (chart: IChart): IChart => {
    if (
      !config.readonly &&
      (config.validateLink ? config.validateLink({ ...props, chart }) : true) &&
      [fromNodeId, fromPortId].join() !== [toNodeId, toPortId].join()
    ) {
      const fromNode = chart.nodes[fromNodeId];
      const toNode = chart.nodes[toNodeId];

      if (fromNode && toNode) {
        const startPos = getLinkPosition(fromNode, fromPortId);
        const endPos = getLinkPosition(toNode, toPortId);

        // Generate waypoints using the logic similar to the previous version:
        // Create a right angle using a midpoint along the x-axis between the start and end positions
        const midX = (startPos.x + endPos.x) / 2;
        const waypoints = [
          { x: midX, y: startPos.y }, // Midpoint along x, but aligned with startY
          { x: midX, y: endPos.y }   // Midpoint along x, but aligned with endY
        ];

        // Update the link with the 'to' node/port and calculated waypoints
        chart.links[linkId] = {
          ...chart.links[linkId],
          to: {
            nodeId: toNodeId,
            portId: toPortId,
          },
          waypoints
        };
      }
    } else {
      // If the link is not valid, remove it
      delete chart.links[linkId];
    }

    return chart;
  };
};



export const onLinkCancel: IStateCallback<IOnLinkCancel> = ({ linkId }) => (chart: IChart) => {
  delete chart.links[linkId]
  return chart
}

export const onLinkMouseEnter: IStateCallback<IOnLinkMouseEnter> = ({ linkId }) => (chart: IChart) => {
  // Set the link to hover
  const link = chart.links[linkId]
  // Set the connected ports to hover
  if (link.to.nodeId && link.to.portId) {
    if (chart.hovered.type !== 'link' || chart.hovered.id !== linkId) {
      chart.hovered = {
        type: 'link',
        id: linkId,
      }
    }
  }
  return chart
}

export const onLinkMouseLeave: IStateCallback<IOnLinkMouseLeave> = ({ linkId }) => (chart: IChart) => {
  const link = chart.links[linkId]
  // Set the connected ports to hover
  if (link.to.nodeId && link.to.portId) {
    chart.hovered = {}
  }
  return chart
}

export const onLinkClick: IStateCallback<IOnLinkClick> = ({ linkId }) => (chart: IChart) => {
  if (chart.selected.id !== linkId || chart.selected.type !== 'link') {
    chart.selected = {
      type: 'link',
      id: linkId,
      feed: {
        totalSolidFlow: null,
        totalLiquidFlow: null,
        //pulpMassFlow: null,
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        //percentSolids: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      }
    }
  }
  return chart
}

export const onCanvasClick: IStateCallback<IOnCanvasClick> = () => (chart: IChart) => {
  if (chart.selected.id) {
    chart.selected = {}
  }
  return chart
}

export const onNodeMouseEnter: IStateCallback<IOnNodeMouseEnter> = ({ nodeId }) => (chart: IChart) => {
  return {
    ...chart,
    hovered: {
      type: 'node',
      id: nodeId,
      cellCharacteristics: {
        netVolume: 100,
        pulpArea: 28.3,
        frothSurfaceArea: 20,
        frothThickness: 250,
        airFlowRate: 18,
        R_infCcp: 28.83,
        R_infGn: 80.38,
        R_infPo: 21.07,
        R_infSp: 14.32,
        k_maxCcp: 1.92,
        k_maxGn: 0.73,
        k_maxPo: 2.07,
        k_maxSp: 1.94,
        EntrainementSavassiparameters: 65.59,
      }
    } as ISelectedOrHovered,
  }
}

export const onNodeMouseLeave: IStateCallback<IOnNodeMouseLeave> = ({ nodeId }) => (chart: IChart) => {
  if (chart.hovered.type === 'node' && chart.hovered.id === nodeId) {
    return { ...chart, hovered: {} }
  }
  return chart
}

export const onDeleteKey: IStateCallback<IOnDeleteKey> = ({ config }: IConfig) => (chart: IChart) => {
  if (config.readonly) {
    return chart
  }
  if (chart.selected.type === 'node' && chart.selected.id) {
    const node = chart.nodes[chart.selected.id]
    if (node.readonly) {
      return chart
    }
    // Delete the connected links
    Object.keys(chart.links).forEach((linkId) => {
      const link = chart.links[linkId]
      if (link.from.nodeId === node.id || link.to.nodeId === node.id) {
        delete chart.links[link.id]
      }
    })
    // Delete the node
    delete chart.nodes[chart.selected.id]
  } else if (chart.selected.type === 'link' && chart.selected.id) {
    delete chart.links[chart.selected.id]
  }
  if (chart.selected) {
    chart.selected = {}
  }
  return chart
}

export const onNodeClick: IStateCallback<IOnNodeClick> = ({ nodeId }) => (chart: IChart) => {
  //const dashboardUrl = 'http://localhost:3000/app/InternalState'
  //window.open(dashboardUrl, '_blank');
  //front end will keep sending cell data from moment its dashboard is opened when closed everything is deleted
  //add help with names of devs or teachers fetched from json
  if (chart.selected.id !== nodeId || chart.selected.type !== 'node') {
    chart.selected = {
      type: 'node',
      id: nodeId,
      cellCharacteristics: {
        netVolume: 100,
        pulpArea: 28.3,
        frothSurfaceArea: 20,
        frothThickness: 250,
        airFlowRate: 18,
        R_infCcp: 28.83,
        R_infGn: 80.38,
        R_infPo: 21.07,
        R_infSp: 14.32,
        k_maxCcp: 1.92,
        k_maxGn: 0.73,
        k_maxPo: 2.07,
        k_maxSp: 1.94,
        EntrainementSavassiparameters: 65.59,
      },
    } as ISelectedOrHovered;
  }
  return chart
}

export const onNodeDoubleClick: IStateCallback<IOnNodeDoubleClick> = ({ nodeId }) => (chart: IChart) => {
  console.log(chart.selected.id);
  
  if (chart.selected.id !== nodeId || chart.selected.type !== 'node') {
    chart.selected = {
      type: 'node',
      id: nodeId,
      cellCharacteristics: {
        netVolume: 100,
        pulpArea: 28.3,
        frothSurfaceArea: 20,
        frothThickness: 250,
        airFlowRate: 18,
        R_infCcp: 28.83,
        R_infGn: 80.38,
        R_infPo: 21.07,
        R_infSp: 14.32,
        k_maxCcp: 1.92,
        k_maxGn: 0.73,
        k_maxPo: 2.07,
        k_maxSp: 1.94,
        EntrainementSavassiparameters: 65.59,
      }
    } as ISelectedOrHovered;
  }
  return chart
}

export const onNodeSizeChange: IStateCallback<IOnNodeSizeChange> = ({ nodeId, size }) => (chart: IChart) => {
  chart.nodes[nodeId] = {
    ...chart.nodes[nodeId],
    size,
  }
  return chart
}

export const onPortPositionChange: IStateCallback<IOnPortPositionChange> = ({
  node: nodeToUpdate,
  port,
  el,
  nodesEl,
}) => (chart: IChart): IChart => {
  if (nodeToUpdate.size) {
    // rotate the port's position based on the node's orientation prop (angle)
    const center = {
      x: nodeToUpdate.size.width / 2,
      y: nodeToUpdate.size.height / 2,
    }
    const current = {
      x: el.offsetLeft + nodesEl.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + nodesEl.offsetTop + el.offsetHeight / 2,
    }
    const angle = nodeToUpdate.orientation || 0
    const position = rotate(center, current, angle)
/*
    if(port.id == "port3"){
      position.x -= 25;
      position.y += 30;
    }
    if(port.id == "port4"){
      position.x += 8;
      position.y -= 38;
    }
*/
    const node = chart.nodes[nodeToUpdate.id]
    node.ports[port.id].position = {
      x: position.x,
      y: position.y,
    }

    chart.nodes[nodeToUpdate.id] = { ...node }
  }

  return chart
}

export const onCanvasDrop: IStateCallback<IOnCanvasDrop> = ({
  config,
  data,
  position,
  id,
}) => (chart: IChart): IChart => {
  //console.log('onCanvasDrop data:', data);
  chart.nodes[id] = {
    id,
    position:
      config && config.snapToGrid
        ? {
          x: Math.round(position.x / 20) * 20,
          y: Math.round(position.y / 20) * 20,
        }
        : { x: position.x, y: position.y },
    orientation: data.orientation || 0,
    type: data.type,
    ports: data.ports,
    cellCharacteristics: data.cellCharacteristics || {netVolume: 100,
    pulpArea: 28.3,
    frothSurfaceArea: 20,
    frothThickness: 250,
    airFlowRate: 18,
    R_infCcp: 28.83,
    R_infGn: 80.38,
    R_infPo: 21.07,
    R_infSp: 14.32,
    k_maxCcp: 1.92,
    k_maxGn: 0.73,
    k_maxPo: 2.07,
    k_maxSp: 1.94,
    EntrainementSavassiparameters: 65.59,
    },
    
    properties: data.properties,
  }
  if (data.type === "First Cell") {
    // Create a new link
    const newLinkId = "First_Stream_id"; // Generate a unique ID for the new link

    // Specify the target position for the link
    const targetPosition = {
      x: position.x - 100, // For example, 100 pixels to the right of the new node's position
      y: position.y + 50,  // For example, 50 pixels below the new node's position
    };

    const targetPosition1 = {
      x: position.x - 75,
      y: position.y + 25,
    };

    const targetPosition2 = {
      x: position.x - 50,
      y: position.y + 10,
    };

    chart.links[newLinkId] = {
      id: newLinkId,
      from: {
        position: targetPosition,
      },
      to: {
        nodeId: id,
        portId: "port1", // Specify the correct port ID
      },
      waypoints: [targetPosition1,targetPosition2],
      feed: data.feed || {
        totalSolidFlow: null,
        totalLiquidFlow: null,
        //pulpMassFlow: null,
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        //percentSolids: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      },
    };
  } else if(data.type === "Scanvenger") {//scanvenger port 4 --- Cleaner port 3
    // Create a new link
    //const newLinkId = "Scanvanger_Stream_id"; // Generate a unique ID for the new link
    const newLinkId2 = "Scanvanger_Stream_id"; // Generate a unique ID for the new link

    // Specify the target position for the link
    /*const targetPosition = {
      x: position.x +200, // For example, 100 pixels to the right of the new node's position
      y: position.y,  // For example, 50 pixels below the new node's position
    };*/
    const targetPosition2 = {
      x: position.x + 50, // For example, 100 pixels to the right of the new node's position
      y: position.y + 200,  // For example, 50 pixels below the new node's position
    };


    chart.links[newLinkId2] = {
      id: newLinkId2,
      from: {
        nodeId: id,
        portId: "port4", // Specify the correct port ID
      },
      to: {
        position: targetPosition2,
      },
      feed: data.feed || {
        totalSolidFlow: null,
        totalLiquidFlow: null,
        //pulpMassFlow: null,
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        //percentSolids: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      },
    };
  } else if(data.type === "Cleaner") {//scanvenger port 4 --- Cleaner port 3
    // Create a new link
    const newLinkId = "Cleaner_Stream_id"; // Generate a unique ID for the new link
    //const newLinkId2 = "Last_Stream_id2"; // Generate a unique ID for the new link

    // Specify the target position for the link
    const targetPosition = {
      x: position.x +200, // For example, 100 pixels to the right of the new node's position
      y: position.y,  // For example, 50 pixels below the new node's position
    };
    /*const targetPosition2 = {
      x: position.x + 50, // For example, 100 pixels to the right of the new node's position
      y: position.y + 200,  // For example, 50 pixels below the new node's position
    };*/

    chart.links[newLinkId] = {
      id: newLinkId,
      from: {
        nodeId: id,
        portId: "port3", // Specify the correct port ID
      },
      to: {
        position: targetPosition,
      },
      feed: data.feed || {
        totalSolidFlow: null,
        totalLiquidFlow: null,
        //pulpMassFlow: null,
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        //percentSolids: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      },
    };
    /*chart.links[newLinkId2] = {
      id: newLinkId2,
      from: {
        nodeId: id,
        portId: "port4", // Specify the correct port ID
      },
      to: {
        position: targetPosition2,
      },
      feed: data.feed || {totalSolidFlow: null,
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
      },
    };*/
  }
  return chart
}

export const onZoomCanvas: IOnZoomCanvas = ({ config, data }) => (chart: IChart): IChart => {
  chart.offset = getOffset(config, { x: data.positionX, y: data.positionY })
  chart.scale = data.scale
  return chart
}

export const onUpdateNodeProperty = (key: string, value: string | number) => (chart: IChart) => {

  const { selected } = chart;
  if (selected.type === 'node' && selected.id) {
    const selectedNode = chart.nodes[selected.id];
    if (selectedNode) {
      if (!selectedNode.cellCharacteristics) {
        selectedNode.cellCharacteristics = {
          netVolume: 100,
          pulpArea: 28.3,
          frothSurfaceArea: 20,
          frothThickness: 250,
          airFlowRate: 18,
          R_infCcp: 28.83,
          R_infGn: 80.38,
          R_infPo: 21.07,
          R_infSp: 14.32,
          k_maxCcp: 1.92,
          k_maxGn: 0.73,
          k_maxPo: 2.07,
          k_maxSp: 1.94,
          EntrainementSavassiparameters: 65.59,
        };
      }
      selectedNode.cellCharacteristics = {
        ...selectedNode.cellCharacteristics,
        [key]: value,
      };
    }
  }

  return chart;
};



export const onUpdateLinkProperty = (key: string, value: string | number, linkId: string) => (chart: IChart) => {
  const { selected } = chart;

  if (selected.type === 'link' && selected.id === linkId) {
    const selectedLink = chart.links[linkId];

    if (selectedLink) {
      if (!selectedLink.feed) {
        selectedLink.feed = {
          totalSolidFlow: null,
          totalLiquidFlow: null,
          //pulpMassFlow: null,
          pulpVolumetricFlow: null,
          solidsSG: null,
          pulpSG: null,
          //percentSolids: null,
          solidsFraction: null,
          cuPercentage: null,
          fePercentage: null,
          pbPercentage: null,
          znPercentage: null,
        };
      }

      selectedLink.feed = {
        ...selectedLink.feed,
        [key]: value,
      };
    }
  }

  return chart;
};

export const saveState = (chart: IChart) => {
  // Here, you can implement the logic to save the state to disk or perform any other necessary actions
  // For now, I'm just logging the chart to the console
  console.log('Saving state:', chart);

  try {
    const chartString = JSON.stringify(chart);
    const blob = new Blob([chartString], { type: 'application/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'chart_state.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('State saved to file successfully:', chart);
  } catch (error) {
    console.error('Error saving state to file:', error);
  }

  return chart;
}


// actions.ts

// actions.ts

export const loadStateFromFile = (onLoad: (chart: IChart) => void) => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.addEventListener('change', (event: Event) => {
      const fileInput = event.target as HTMLInputElement;
      const file = fileInput.files ? fileInput.files[0] : null;

      if (file) {
        const reader = new FileReader();

        reader.onload = (loadEvent) => {
          try {
            const chartString = (loadEvent.target as FileReader).result as string;
            const chart = JSON.parse(chartString) as IChart;
            onLoad(chart);
            console.log('State loaded successfully:', chart);
          } catch (error) {
            console.error('Error parsing loaded state:', error);
          }
        };

        reader.readAsText(file);
      }
    });

    input.click();
  } catch (error) {
    console.error('Error loading state from file:', error);
  }
};