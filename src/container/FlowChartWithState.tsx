import * as React from 'react';
import { IChart, IConfig, ISelection } from '../types';
import { FlowChart, IFlowChartComponents } from '../components';
import * as actions from './actions';
import mapValues from './utils/mapValues';

export interface IFlowChartWithStateProps {
  initialValue: IChart;
  selection: ISelection;
  Components?: IFlowChartComponents;
  config?: IConfig;
  onStateChange?: (chart: IChart) => void;
}

/**
 * Flow Chart With State
 */
export class FlowChartWithState extends React.Component<IFlowChartWithStateProps, IChart> {
  public state: IChart;
  private stateActions = mapValues(actions, (func: any) =>
    (...args: any) => {
      const newState = func(...args);
      this.setState(newState, () => {
        if (this.props.onStateChange) {
          this.props.onStateChange(this.state);
        }
      });
    });

  constructor(props: IFlowChartWithStateProps) {
    super(props);
    this.state = props.initialValue;
  }

  componentDidUpdate(prevProps: IFlowChartWithStateProps) {
    // Check if initialValue prop has changed
    if (this.props.initialValue !== prevProps.initialValue) {
      // Update state with new initialValue
      this.setState({ ...this.props.initialValue });
    }
  }

  public render() {
    const { selection, /*setSelection*/ } = this.props;
    const { Components, config } = this.props;
    console.log("selected:",selection.selected)
    return (
      <FlowChart
        chart={this.state}
        selection={selection}
        callbacks={this.stateActions}
        Components={Components}
        config={config}
      />
    );
  }
}