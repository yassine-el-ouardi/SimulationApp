import * as React from 'react';
import { IConfig, ILink, INode, IOnLinkClick, IOnLinkMouseEnter, IOnLinkMouseLeave, IOnDragLink } from '../../';
import { noop } from '../../utils';
import { ILinkDefaultProps, LinkDefault } from './Link.default';
import { getLinkPosition } from './utils';

export interface ILinkWrapperProps {
  config: IConfig;
  link: ILink;
  isSelected: boolean;
  isHovered: boolean;
  fromNode: INode | undefined;
  toNode: INode | undefined;
  onLinkMouseEnter: IOnLinkMouseEnter;
  onLinkMouseLeave: IOnLinkMouseLeave;
  onLinkClick: IOnLinkClick;
  Component?: React.FunctionComponent<ILinkDefaultProps>;
  matrix?: number[][];
  onDragLink:IOnDragLink;
}

export const LinkWrapper = React.memo(
  ({
    config,
    Component = LinkDefault, // Default to LinkDefault if no component is provided
    link,
    onLinkMouseEnter,
    onLinkMouseLeave,
    onLinkClick,
    isSelected,
    isHovered,
    fromNode,
    toNode,
    matrix,
    onDragLink,
  }: ILinkWrapperProps) => {
    const startPos = fromNode && link.from.portId ? getLinkPosition(fromNode, link.from.portId) : link.from.position;
    const endPos = toNode && link.to.portId ? getLinkPosition(toNode, link.to.portId) : link.to.position;

    // Early return if we don't have valid start or end positions
    if (!startPos || !endPos) {
      return null;
    }

    return (
      <Component
        config={config}
        link={link}
        matrix={matrix}
        startPos={startPos}
        endPos={endPos}
        onLinkMouseEnter={config.readonly ? noop : onLinkMouseEnter}
        onLinkMouseLeave={config.readonly ? noop : onLinkMouseLeave}
        onLinkClick={config.readonly && !config.selectable ? noop : onLinkClick}
        isSelected={isSelected}
        isHovered={isHovered}
        onDragLink={onDragLink}
      />
    );
  }
);