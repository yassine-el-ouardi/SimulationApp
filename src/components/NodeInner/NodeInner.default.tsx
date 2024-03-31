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
      <img src='https://cdn.discordapp.com/attachments/1118115066500370525/1160863833515098163/cell.png?ex=660a7731&is=65f80231&hm=10434790b16e4e07f1950789e592e13fc6c5e01d587d2e1d9bf4686cf3582c48&' alt="Cell" 
      style={{width: '75px'}}/>
  )
}
