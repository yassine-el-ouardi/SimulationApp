import styled, { css } from 'styled-components'
import { IConfig } from '../../'

export interface IPortsGroupDefaultProps {
  className?: string
  config: IConfig
  side: 'top' | 'bottom' | 'left' | 'right'
}

export const PortsGroupDefault = styled.div<IPortsGroupDefaultProps>`
  position: absolute;
  display: flex;
  justify-content: center;

  ${(props) => {
    if (props.side === 'top') {
      return css`
        min-width: 142px;
        left: -20px;
        top: 17px;
        flex-direction: row;
        > div {
          margin: 0 3px;
        }
      `
    } else if (props.side === 'bottom') {
      return css`
        min-width: 142px;
        left: 10px;
        bottom: 25px;
        flex-direction: row;
        > div {
          margin: 0 3px;
        }
      `
    } else if (props.side === 'left') {
      return css`
        min-height: 100%;
        top: 0;
        left: -12px;
        flex-direction: column;
        > div {
          margin: 3px 0;
        }
      `
    } else {
      return css`
        min-height: 100%;
        top: 0;
        right: -12px;
        flex-direction: column;
        > div {
          margin: 3px 0;
        }
      `
    }
  }}
`