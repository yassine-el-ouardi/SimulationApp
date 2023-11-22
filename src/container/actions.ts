import {
  IChart,
  IConfig,
  identity,
  IOnCanvasClick,
  IOnCanvasDrop,
  IOnDeleteKey,
  IOnDragCanvas,
  IOnDragCanvasStop,
  IOnDragNode,
  IOnDragNodeStop,
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
} from '../'
import { rotate } from './utils/rotate'

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
  const { linkId, fromNodeId, fromPortId, toNodeId, toPortId, config = {} } = props

  return (chart: IChart): IChart => {
    if (
      !config.readonly &&
      (config.validateLink ? config.validateLink({ ...props, chart }) : true) &&
      [fromNodeId, fromPortId].join() !== [toNodeId, toPortId].join()
    ) {
      chart.links[linkId].to = {
        nodeId: toNodeId,
        portId: toPortId,
      }
    } else {
      delete chart.links[linkId]
    }
    return chart
  }
}

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
        netVolume: null,
        pulpArea: null,
        frothThickness: null,
        airFlowRate: null,
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
  if (chart.selected.id !== nodeId || chart.selected.type !== 'node') {
    chart.selected = {
      type: 'node',
      id: nodeId,
      cellCharacteristics: {
        netVolume: null,
        pulpArea: null,
        frothThickness: null,
        airFlowRate: null,
      },
    } as ISelectedOrHovered;
  }
  return chart
}

export const onNodeDoubleClick: IStateCallback<IOnNodeDoubleClick> = ({ nodeId }) => (chart: IChart) => {
  if (chart.selected.id !== nodeId || chart.selected.type !== 'node') {
    chart.selected = {
      type: 'node',
      id: nodeId,
      cellCharacteristics: {
        netVolume: null,
        pulpArea: null,
        frothThickness: null,
        airFlowRate: null,
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
    cellCharacteristics: data.cellCharacteristics || {netVolume: null,
    pulpArea: null,
    frothThickness: null,
    airFlowRate: null,},
    
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

    chart.links[newLinkId] = {
      id: newLinkId,
      from: {
        position: targetPosition,
      },
      to: {
        nodeId: id,
        portId: "port1", // Specify the correct port ID
      },
      feed: data.feed || {totalSolidFlow: 1,
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
    };
  } else if(data.type === "Last Cell") {
    // Create a new link
    const newLinkId = "Last_Stream_id"; // Generate a unique ID for the new link
    const newLinkId2 = "Last_Stream_id2"; // Generate a unique ID for the new link

    // Specify the target position for the link
    const targetPosition = {
      x: position.x +200, // For example, 100 pixels to the right of the new node's position
      y: position.y,  // For example, 50 pixels below the new node's position
    };
    const targetPosition2 = {
      x: position.x + 50, // For example, 100 pixels to the right of the new node's position
      y: position.y + 200,  // For example, 50 pixels below the new node's position
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
    };
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
          netVolume: null,
          pulpArea: null,
          frothThickness: null,
          airFlowRate: null,
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

      selectedLink.feed = {
        ...selectedLink.feed,
        [key]: value,
      };
    }
  }

  return chart;
};

