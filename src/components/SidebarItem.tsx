import * as React from 'react';
import styled from 'styled-components';
import { INode } from '../types';
import { REACT_FLOW_CHART } from '../constants';

const Outer = styled.div<{ isDraggable: boolean }>`
  padding: 20px;
  font-size: 14px;
  background: white;
  cursor: ${props => (props.isDraggable ? 'move' : 'not-allowed')};
  opacity: ${props => (props.isDraggable ? 1 : 0.5)};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img<{ type: string }>`
  max-width: 100%;
  max-height: 100%;
  height: ${props => (props.type === 'Cleaner' ? '90px' : '70px')};
`;

const Label = styled.div`
  text-align: center;
  margin-top: 10px;
`;

export interface ISidebarItemProps {
  type: string;
  ports: INode['ports'];
  properties?: any;
  image: string;
  isDraggable: boolean; // New prop for draggable status
}

export const SidebarItem = ({ type, ports, properties, image, isDraggable }: ISidebarItemProps) => {
  return (
    <Outer
      isDraggable={isDraggable}
      draggable={isDraggable}
      onDragStart={(event) => {
        if (!isDraggable) {
          event.preventDefault(); // Prevent drag if not draggable
          return;
        }
        event.dataTransfer.setData(REACT_FLOW_CHART, JSON.stringify({ type, ports, properties }));
      }}
    >
      <Image src={image} alt={type} type={type} />
      <Label>{type}</Label>
    </Outer>
  );
};