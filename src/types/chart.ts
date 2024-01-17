import { IPosition, ISize } from './generics'

export type IChart<
  ChartProps = undefined,
  NodeProps = undefined,
  LinkProps = undefined,
  PortProps = undefined
  > = {
    offset: IPosition
    nodes: {//aka cell
      [id: string]: INode<NodeProps, PortProps>;
    }
    links: {// aka arrows or stream
      [id: string]: ILink<LinkProps>;
    }
    scale: number
    /** System Temp */
    selected: ISelectedOrHovered
    hovered: ISelectedOrHovered,
  } & (ChartProps extends undefined ? {
    properties?: any,
  } : {
    properties: ChartProps,
  })

export interface ISelectedOrHovered {
  type?: 'link' | 'node' | 'port'
  id?: string
  cellCharacteristics?: {
    netVolume: number| null
    pulpArea: number| null
    frothSurfaceArea: number|null
    frothThickness: number| null
    airFlowRate: number| null
    R_infCcp: number| null,
    R_infGn: number| null,
    R_infPo: number| null,
    R_infSp: number| null,
    k_maxCcp: number| null,
    k_maxGn: number| null,
    k_maxPo: number| null,
    k_maxSp: number| null,
    EntrainementSavassiparameters: number| null
  }
  feed?: {
    totalSolidFlow: number| null
    totalLiquidFlow: number| null
    //pulpMassFlow: number| null
    pulpVolumetricFlow: number| null
    solidsSG: number| null
    pulpSG: number| null
    //percentSolids: number| null
    solidsFraction: number| null
    cuPercentage: number| null
    fePercentage: number| null
    pbPercentage: number| null
    znPercentage: number| null
  }
}

export type INode<NodeProps = undefined, PortProps = undefined> = {
  id: string
  type: string
  position: IPosition
  orientation?: number
  readonly?: boolean
  cellCharacteristics: {
    netVolume: number| null
    pulpArea: number| null
    frothSurfaceArea: number|null
    frothThickness: number| null
    airFlowRate: number| null
    R_infCcp: number| null,
    R_infGn: number| null,
    R_infPo: number| null,
    R_infSp: number| null,
    k_maxCcp: number| null,
    k_maxGn: number| null,
    k_maxPo: number| null,
    k_maxSp: number| null,
    EntrainementSavassiparameters: number| null
  }| null
  ports: {
    [id: string]: IPort<PortProps>;
  }
  /** System Temp */
  size?: ISize,
} & (NodeProps extends undefined ? {
  properties?: any,
} : {
  properties: NodeProps,
})

export type IPort<PortProps = undefined> = {
  id: string
  type: string
  value?: string
  /** System Temp */
  position?: IPosition,
} & (PortProps extends undefined ? {
  properties?: any,
} : {
  properties: PortProps,
})

export type ILink<LinkProps = undefined> = {//add way points like achik diagram also first last cell should not have a fixed position for its from or to link
  id: string
  from: {
    nodeId?: string;
    portId?: string;
    //-----
    position?: IPosition;
  }
  to: {
    nodeId?: string;
    portId?: string;
    /** System Temp */
    position?: IPosition;
  },
  feed: { //the feed data should actually be displayed when selecting a stream, only first stream feed should be editable by the user 
    totalSolidFlow: number| null
    totalLiquidFlow: number| null
    //pulpMassFlow: number| null
    pulpVolumetricFlow: number| null
    solidsSG: number| null
    pulpSG: number| null
    //percentSolids: number| null
    solidsFraction: number| null
    cuPercentage: number| null
    fePercentage: number| null
    pbPercentage: number| null
    znPercentage: number| null
  }| null
} & (LinkProps extends undefined ? {
  properties?: any,
} : {
  properties: LinkProps,
})