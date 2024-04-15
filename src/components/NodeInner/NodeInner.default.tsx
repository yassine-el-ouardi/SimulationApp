import * as React from 'react'
import { IConfig, INode } from '../../types'
//import cellImage from './cell.png'

export interface INodeInnerDefaultProps {
  className?: string
  config: IConfig
  node: INode
}



export const NodeInnerDefault = ({ node,className }: INodeInnerDefaultProps) => {
  return (
      <img src='cell.png' alt="Cell" 
      style={{width: '75px'}}/>
  )
}
