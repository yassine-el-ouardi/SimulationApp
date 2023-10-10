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
      <img src='https://cdn.discordapp.com/attachments/1118115066500370525/1160863833515098163/cell.png?ex=653635b1&is=6523c0b1&hm=9f48dc5d6c458eeebf9ba8cc61ac37bbc20b5d1c0b17b4647af3b1b403f89472&' alt="Cell" 
      style={{width: '75px'}}/>
  )
}
