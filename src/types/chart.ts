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
    links: {// aka arrows
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
    netVolume?: number| null
    pulpArea?: number| null
    frothThickness?: number| null
    airFlowRate?: number| null
  }
  feed?: {
    totalSolidFlow?: number| null
    totalLiquidFlow?: number| null
    pulpMassFlow?: number| null
    pulpVolumetricFlow?: number| null
    solidsSG?: number| null
    pulpSG?: number| null
    percentSolids?: number| null
    solidsFraction?: number| null
    cuPercentage?: number| null
    fePercentage?: number| null
    znPercentage?: number| null
    pbPercentage?: number| null
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
    frothThickness: number| null
    airFlowRate: number| null
  }| null
  feed: { //the feed data should actually be displayed when selecting a stream, only first stream feed should be editable by the user 
    totalSolidFlow: number| null
    totalLiquidFlow: number| null
    pulpMassFlow: number| null
    pulpVolumetricFlow: number| null
    solidsSG: number| null
    pulpSG: number| null
    percentSolids: number| null
    solidsFraction: number| null
    cuPercentage: number| null
    fePercentage: number| null
    znPercentage: number| null
    pbPercentage: number| null
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

export type ILink<LinkProps = undefined> = {
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
} & (LinkProps extends undefined ? {
  properties?: any,
} : {
  properties: LinkProps,
})
