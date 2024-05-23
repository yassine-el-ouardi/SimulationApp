import {
  IChart,
  ISelection,
  IConfig,
  IOnCanvasClick,
  IOnCanvasDrop,
  IOnDeleteKey,
  IOnDragCanvas,
  IOnDragCanvasStop,
  IOnDragNode,
  IOnDragNodeStop,
  IOnDragLinkWayPoint,
  IOnDragLinkWayPointStop,
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
export const onDragLinkWayPoint: IStateCallback<IOnDragLinkWayPoint> = ({ config, event, data, id }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  const link = chart.links[id];
  const draggingWaypointIndex = data.waypointIndex;
  if (link && link.waypoints && draggingWaypointIndex != null && link.waypoints[draggingWaypointIndex]) {
    const updatedWaypoint = {
      x: link.waypoints[draggingWaypointIndex].x + data.deltaX,
      y: link.waypoints[draggingWaypointIndex].y + data.deltaY,
    };
    const updatedWaypoints = [...link.waypoints];
    updatedWaypoints[draggingWaypointIndex] = updatedWaypoint;
    chart.links[id] = {
      ...link,
      waypoints: updatedWaypoints,
    };
  }
  return { chart, selection };
};
// This function is called when the dragging stops
export const onDragLinkWayPointStop: IStateCallback<IOnDragLinkWayPointStop> = () => identity

//-------------------------------------

export const onDragNode: IStateCallback<IOnDragNode> = ({ config, event, data, id }) => (chart: IChart, selection: ISelection) => {
  const node = chart.nodes[id];

  if (node) {
    const delta = {
      x: data.deltaX,
      y: data.deltaY,
    };
    chart.nodes[id] = {
      ...node,
      position: {
        x: node.position.x + delta.x,
        y: node.position.y + delta.y,
      },
    };

    if (node.type === "Rougher") {
      const link = chart.links['First_Stream_id'];
      if (link && link.from.position) {
        link.from.position = {
          x: link.from.position.x + delta.x,
          y: link.from.position.y + delta.y,
        };
      }
    } else if (node.type === "Scanvenger") {
      const link = chart.links['Scanvenger_Stream_id'];
      if (link && link.to.position) {
        link.to.position = {
          x: link.to.position.x + delta.x,
          y: link.to.position.y + delta.y,
        };
      }
    } else if (node.type === "Cleaner") {
      const link = chart.links['Cleaner_Stream_id'];
      if (link && link.to.position) {
        link.to.position = {
          x: link.to.position.x + delta.x,
          y: link.to.position.y + delta.y,
        };
      }
    }
  }

  return { chart, selection };
};

export const onDragNodeStop: IStateCallback<IOnDragNodeStop> = () => identity

export const onDragCanvas: IOnDragCanvas = ({ config, data }) => (chart: IChart): IChart => {
  chart.offset = getOffset(config, { x: data.positionX, y: data.positionY })
  return chart
}

export const onDragCanvasStop: IStateCallback<IOnDragCanvasStop> = () => identity

export const onLinkStart: IStateCallback<IOnLinkStart> = ({ linkId, fromNodeId, fromPortId }) => (
  chart: IChart,
  selection: ISelection,
): { chart: IChart; selection: ISelection } => {
  chart.links[linkId] = {
    id: linkId,
    from: {
      nodeId: fromNodeId,
      portId: fromPortId,
    },
    to: {},
    feed: {
      totalSolidFlow: null,
      totalLiquidFlow: null,
      pulpVolumetricFlow: null,
      solidsSG: null,
      pulpSG: null,
      solidsFraction: null,
      cuPercentage: null,
      fePercentage: null,
      pbPercentage: null,
      znPercentage: null,
    }
  };
  return { chart, selection };
}

export const onLinkMove: IStateCallback<IOnLinkMove> = ({ linkId, toPosition }) => (
  chart: IChart,
  selection: ISelection
): { chart: IChart; selection: ISelection } => {
  const link = chart.links[linkId];
  link.to.position = toPosition;
  chart.links[linkId] = { ...link };
  return { chart, selection };
}

export const onLinkComplete: IStateCallback<IOnLinkComplete> = (props) => {
  const { linkId, fromNodeId, fromPortId, toNodeId, toPortId, config = {} } = props;

  return (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
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

    return { chart, selection };
  };
};

export const onLinkCancel: IStateCallback<IOnLinkCancel> = ({ linkId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  delete chart.links[linkId];
  return { chart, selection };
}

export const onLinkMouseEnter: IStateCallback<IOnLinkMouseEnter> = ({ linkId }) => (chart: IChart, selection: ISelection) => {
  const link = chart.links[linkId];

  let updatedSelection = { ...selection };

  if (link.to.nodeId && link.to.portId) {
    if (selection.hovered?.type !== 'link' || selection.hovered?.id !== linkId) {
      updatedSelection = {
        ...selection,
        hovered: {
          type: 'link',
          id: linkId,
        },
      };
    }
  }

  return { chart, selection: updatedSelection };
};

export const onLinkMouseLeave: IStateCallback<IOnLinkMouseLeave> = ({ linkId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  const link = chart.links[linkId];
  let updatedSelection = { ...selection };

  if (link.to.nodeId && link.to.portId) {
    updatedSelection.hovered = {};
  }

  return { chart, selection: updatedSelection };
}

export const onLinkClick: IStateCallback<IOnLinkClick> = ({ linkId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  let updatedSelection = { ...selection };

  if (updatedSelection.selected?.id !== linkId || updatedSelection.selected?.type !== 'link') {
    updatedSelection.selected = {
      type: 'link',
      id: linkId,
      feed: {
        totalSolidFlow: null,
        totalLiquidFlow: null,
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      }
    };
  }

  return { chart, selection: updatedSelection };
}

export const onCanvasClick: IStateCallback<IOnCanvasClick> = () => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  let updatedSelection = { ...selection };

  if (updatedSelection.selected?.id) {
    updatedSelection.selected = {};
  }

  return { chart, selection: updatedSelection };
}

export const onNodeMouseEnter: IStateCallback<IOnNodeMouseEnter> = ({ nodeId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  let updatedSelection = { ...selection };

  updatedSelection.hovered = {
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
  };

  return { chart, selection: updatedSelection };
}

export const onNodeMouseLeave: IStateCallback<IOnNodeMouseLeave> = ({ nodeId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  let updatedSelection = { ...selection };

  if (updatedSelection.hovered?.type === 'node' && updatedSelection.hovered?.id === nodeId) {
    updatedSelection.hovered = {};
  }

  return { chart, selection: updatedSelection };
}

export const onDeleteKey: IStateCallback<IOnDeleteKey> = ({ config }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  if (config.readonly) {
    return { chart, selection };
  }
  if (selection.selected?.type === 'node' && selection.selected?.id) {
    const node = chart.nodes[selection.selected?.id];
    if (node.readonly) {
      return { chart, selection };
    }
    // Delete the connected links
    Object.keys(chart.links).forEach((linkId) => {
      const link = chart.links[linkId];
      if (link.from.nodeId === node.id || link.to.nodeId === node.id) {
        delete chart.links[link.id];
      }
    });
    // Delete the node
    delete chart.nodes[selection.selected?.id];
  } else if (selection.selected?.type === 'link' && selection.selected?.id) {
    delete chart.links[selection.selected?.id];
  }
  if (selection.selected) {
    selection.selected = {};
  }
  return { chart, selection };
}

export const onNodeClick: IStateCallback<IOnNodeClick> = ({ nodeId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  console.log("Before update:", selection);

  const updatedSelection: ISelection = {
    ...selection,
    selected: {
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
    },
  };

  console.log("After update:", updatedSelection);

  return { chart, selection: updatedSelection };
};

export const onNodeDoubleClick: IStateCallback<IOnNodeDoubleClick> = ({ nodeId }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  console.log(selection.selected?.id);
  window.open(`/Dashboard/${nodeId}`, '_blank');
  
  if (selection.selected?.id !== nodeId || selection.selected?.type !== 'node') {
    selection.selected = {
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
  // Store the chart state in local storage
  localStorage.setItem('chartState', JSON.stringify(chart));

  return { chart, selection };
}

export const onNodeSizeChange: IStateCallback<IOnNodeSizeChange> = ({ nodeId, size }) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  chart.nodes[nodeId] = {
    ...chart.nodes[nodeId],
    size,
  };
  return { chart, selection };
}

export const onPortPositionChange: IStateCallback<IOnPortPositionChange> = ({
  node: nodeToUpdate,
  port,
  el,
  nodesEl,
}) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
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
    const node = chart.nodes[nodeToUpdate.id]
    node.ports[port.id].position = {
      x: position.x,
      y: position.y,
    }

    chart.nodes[nodeToUpdate.id] = { ...node }
  }

  return { chart, selection };
}

export const onCanvasDrop: IStateCallback<IOnCanvasDrop> = ({
  config,
  data,
  position,
  id,
}) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
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
    cellCharacteristics: data.cellCharacteristics || {
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
    properties: data.properties,
  }
  if (data.type === "Rougher") {
    // Create a new link
    const newLinkId = "First_Stream_id"; // Generate a unique ID for the new link

    // Specify the target position for the link
    const targetPosition = {
      x: position.x - 100, // For example, 100 pixels to the right of the new node's position
      y: position.y + 40,  // For example, 50 pixels below the new node's position
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
      feed: data.feed || {
        totalSolidFlow: null,
        totalLiquidFlow: null,
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      },
    };
  } else if (data.type === "Scanvenger") {
    const newLinkId2 = "Scanvenger_Stream_id"; // Generate a unique ID for the new link
    const targetPosition2 = {
      x: position.x + 200, // For example, 100 pixels to the right of the new node's position
      y: position.y + 50,  // For example, 50 pixels below the new node's position
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
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      },
    };
  } else if (data.type === "Cleaner") {
    // Create a new link
    const newLinkId = "Cleaner_Stream_id"; // Generate a unique ID for the new link
    // Specify the target position for the link
    const targetPosition = {
      x: position.x + 200, // For example, 100 pixels to the right of the new node's position
      y: position.y + 20,  // For example, 50 pixels below the new node's position
    };
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
        pulpVolumetricFlow: null,
        solidsSG: null,
        pulpSG: null,
        solidsFraction: null,
        cuPercentage: null,
        fePercentage: null,
        pbPercentage: null,
        znPercentage: null,
      },
    };
  }
  return { chart, selection };
}

export const onZoomCanvas: IOnZoomCanvas = ({ config, data }) => (chart: IChart): IChart => {
  chart.offset = getOffset(config, { x: data.positionX, y: data.positionY })
  chart.scale = data.scale
  return chart
}

export const onUpdateNodeProperty = (key: string, value: string | number) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  const { selected } = selection;
  if (selected?.type === 'node' && selected?.id) {
    const selectedNode = chart.nodes[selected?.id];
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

  return { chart, selection };
};



export const onUpdateLinkProperty = (key: string, value: string | number, linkId: string) => (chart: IChart, selection: ISelection): { chart: IChart; selection: ISelection } => {
  const { selected } = selection;

  if (selected?.type === 'link' && selected?.id === linkId) {
    const selectedLink = chart.links[linkId];

    if (selectedLink) {
      if (!selectedLink.feed) {
        selectedLink.feed = {
          totalSolidFlow: null,
          totalLiquidFlow: null,
          pulpVolumetricFlow: null,
          solidsSG: null,
          pulpSG: null,
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

  return { chart, selection };
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