import * as React from 'react'
import { IConfig, ILink, IOnLinkClick, IOnLinkMouseEnter, IOnLinkMouseLeave, IPosition } from '../../../types'
import { getDirectional } from '../utils'

export const calculateAdjustedEndPos = (startPos: IPosition, endPos: IPosition): IPosition => {
  const { leftToRight, topToBottom, isHorizontal } = getDirectional(startPos, endPos);
  const adjustedEnd = { ...endPos };

  if (leftToRight && isHorizontal) {
      adjustedEnd.x -= 10;
  } else if (!leftToRight && isHorizontal) {
      adjustedEnd.x += 10;
  } else if (topToBottom && !isHorizontal) {
      adjustedEnd.y -= 10;
  } else {
      adjustedEnd.y += 10;
  }

  return adjustedEnd;
};


export interface IArrowLinkProps {
  className?: string
  link: ILink
  config: IConfig
  linkColor: string
  points: string
  isHovered: boolean
  isSelected: boolean
  startPos: IPosition
  endPos: IPosition
  onLinkMouseEnter: IOnLinkMouseEnter
  onLinkMouseLeave: IOnLinkMouseLeave
  onLinkClick: IOnLinkClick
  onWaypointMouseDown?: (event: React.MouseEvent<SVGCircleElement, MouseEvent>, index: number) => void;
}

export const ArrowLink = ({
  className,
  link,
  config,
  linkColor,
  points,
  isHovered,
  isSelected,
  startPos,
  endPos,
  onLinkMouseEnter,
  onLinkMouseLeave,
  onLinkClick,
  onWaypointMouseDown,
}: IArrowLinkProps) => {




  const marker = { markerEnd: `url(#arrowHead-${linkColor})` };

  return (
    <svg
      style={{
        overflow: 'visible',
        position: 'absolute',
        cursor: 'pointer',
        left: 0,
        right: 0,
        display:'block',
        //width:'100%',
        //height:'100%',
      }}
      className={className}
    >
      <defs>
      <marker
        id={`arrowHead-${linkColor}`}
        orient="auto-start-reverse"
        markerWidth="4"  // Doubled from 2 to 4
        markerHeight="8" // Doubled from 4 to 8
        refX="8"
        refY="4"         // Adjusted from 2 to 4
      >
          <path d="M0,0 V8 L4,4 Z" fill={linkColor} />
        </marker>
      </defs>
      {/* Main line */}
      <path
        d={points}
        stroke={linkColor}
        strokeWidth="1.5"
        fill="none"
        {...marker}
      />
      {/* Thick line to make selection easier */}
      <path
        d={points}
        stroke={linkColor}
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
        strokeOpacity={isHovered || isSelected ? 0.1 : 0}
        onMouseEnter={() => onLinkMouseEnter({ config, linkId: link.id })}
        onMouseLeave={() => onLinkMouseLeave({ config, linkId: link.id })}
        onClick={(e) => {
          onLinkClick({ config, linkId: link.id })
          e.stopPropagation()
        }}
      />
       {/* Waypoints */}
       {link.waypoints && link.waypoints.map((waypoint, index) => (
        <circle
          key={index}
          cx={waypoint.x}
          cy={waypoint.y}
          r={3} // Radius of the waypoint handle
          fill="black" // Color of the waypoint handle
          stroke="none"
          style={{ cursor: 'move' }} // Cursor indicates the waypoint can be moved
          onMouseDown={(event) => onWaypointMouseDown && onWaypointMouseDown(event, index)}
        />
        ))}
    </svg>
  )
}