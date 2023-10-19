import * as React from 'react'
import { generateCurvePath, generateRightAnglePath, generateSmartPath, IConfig, ILink, IOnLinkClick, IOnLinkMouseEnter, IOnLinkMouseLeave, IPort, IPosition } from '../../'
import { ArrowLink } from './variants'

export interface ILinkDefaultProps {
  className?: string
  config: IConfig
  link: ILink
  startPos: IPosition
  endPos: IPosition
  fromPort?: IPort
  toPort?: IPort
  onLinkMouseEnter: IOnLinkMouseEnter
  onLinkMouseLeave: IOnLinkMouseLeave
  onLinkClick: IOnLinkClick
  isHovered: boolean
  isSelected: boolean
  matrix?: number[][]
}

export const LinkDefault = (props: ILinkDefaultProps) => {
  const { config, startPos, endPos, fromPort, toPort, matrix } = props
  const points = config.smartRouting
    ? !!toPort && !!matrix && !!fromPort
      ? generateSmartPath(matrix, startPos, endPos, fromPort, toPort)
      : generateRightAnglePath(startPos, endPos)
    : generateCurvePath(startPos, endPos)

  const linkColor: string = 'cornflowerblue'

  const linkProps = {
    points,
    linkColor,
    ...props,
  }
  
  return <ArrowLink {...linkProps} />
}
