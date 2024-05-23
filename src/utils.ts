import { IChart, ISelection } from './types';

export const noop = () => null

export const identity = (chart: IChart, selection: ISelection) => {
  return { chart, selection };
};