import * as React from 'react';
import { IPort, IConfig, ILink, IOnLinkClick, IOnLinkMouseEnter, IOnLinkMouseLeave, IPosition, IOnDragLink } from '../../types';
import { ArrowLink, IArrowLinkProps } from './variants/ArrowLink';

import { throttle } from 'lodash';

//import {IExtendedDraggableData} from '../../types/functions'


export interface ILinkDefaultProps {
  className?: string;
  config: IConfig;
  link: ILink;
  startPos: IPosition;
  endPos: IPosition;
  fromPort?: IPort;
  toPort?: IPort;
  onLinkMouseEnter: IOnLinkMouseEnter;
  onLinkMouseLeave: IOnLinkMouseLeave;
  onLinkClick: IOnLinkClick;
  isHovered: boolean;
  isSelected: boolean;
  matrix?: number[][];
  onDragLink: IOnDragLink;
}

export const LinkDefault = ({
  className,
  config,
  link,
  startPos,
  endPos,
  isHovered,
  isSelected,
  onLinkMouseEnter,
  onLinkMouseLeave,
  onLinkClick,
  onDragLink
}: ILinkDefaultProps) => {
  //const { startPos, endPos, link, onDragLink,config } = props;

  //--------------------------------------
  const onWaypointMouseDown = React.useCallback((event: React.MouseEvent<SVGCircleElement, MouseEvent>, waypointIndex: number) => {
    event.preventDefault();
    event.stopPropagation();

    const svgElement = event.currentTarget.ownerSVGElement;

    if (!svgElement) {
      console.error('SVG element or CTM not found');
      return;
  }

    const CTM = svgElement.getScreenCTM();

    if (!CTM) {
        console.error('SVG element or CTM not found');
        return;
    }
    const transformPoint = (x: number, y: number) => {
        let point = svgElement.createSVGPoint();
        point.x = x;
        point.y = y;
        return point.matrixTransform(CTM.inverse());
    };

    let start = transformPoint(event.clientX, event.clientY); // 'start' needs to be 'let' since it's updated in 'handleMouseMove'

    const handleMouseMove = throttle((moveEvent: MouseEvent) => {
        const current = transformPoint(moveEvent.clientX, moveEvent.clientY);
        const deltaX = current.x - start.x;
        const deltaY = current.y - start.y;

        if (link.waypoints && link.waypoints[waypointIndex]) { // Ensure 'link.waypoints' and the waypoint at 'waypointIndex' are defined
            link.waypoints[waypointIndex].x += deltaX;
            link.waypoints[waypointIndex].y += deltaY;

            // Update the state here to reflect changes (e.g., using setState in a React component)
        }

        // Update 'start' for the next movement
        start = current;
    }, 100);

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // Finalize the waypoint movement here
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}, [link, config]); // 'waypointIndex' does not need to be in the dependency array as it's a parameter to the callback



  //--------------------------------------

  // Start the path at the starting position
  let points = `M${startPos.x},${startPos.y} `;

  // If waypoints are provided, include them in the path
  if (link.waypoints && link.waypoints.length > 0) {
    link.waypoints.forEach((waypoint) => {
      points += `L${waypoint.x},${waypoint.y} `;
    });
  }

  // End the path at the ending position
  points += `L${endPos.x},${endPos.y}`;

  const arrowLinkProps: IArrowLinkProps = {
    className: className,
    link: link,
    config: config,
    linkColor: 'black', // Default to black, or use a dynamic value if needed
    points, // Pass the generated path data
    isHovered: isHovered,
    isSelected: isSelected,
    startPos: startPos,
    endPos: endPos,
    onLinkMouseEnter: onLinkMouseEnter,
    onLinkMouseLeave: onLinkMouseLeave,
    onLinkClick: onLinkClick,
  };

  const extendedArrowLinkProps = {
    ...arrowLinkProps,
    onWaypointMouseDown: onWaypointMouseDown,
  };

  return <ArrowLink {...extendedArrowLinkProps} />;
};