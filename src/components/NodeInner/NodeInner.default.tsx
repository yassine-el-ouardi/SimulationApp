import * as React from 'react'
import { IConfig, INode } from '../../'
//import cellImage from './cell.png'

export interface INodeInnerDefaultProps {
  className?: string
  config: IConfig
  node: INode
}



export const NodeInnerDefault = ({ node,className }: INodeInnerDefaultProps) => {
  return (
      <img src='https://cdn.discordapp.com/attachments/1118115066500370525/1160863833515098163/cell.png?ex=65eec7b1&is=65dc52b1&hm=f300c5268ee2d09432065edc640bf8e56bd4f07f43a4679a7ec1fc01a70e5d47&' alt="Cell" 
      style={{width: '75px'}}/>
  )
}
