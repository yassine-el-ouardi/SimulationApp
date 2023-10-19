import { storiesOf } from '@storybook/react'
import * as React from 'react'
import { DragAndDropSidebar } from './DragAndDropSidebar'
import { SelectedSidebar } from './SelectedSidebar'
import CheckPortsButton from './CheckPortsButton'
import { chartSimple } from './misc/exampleChartState'
import { IChart } from '../'

const StoryWrapper = () => {
  const [chart, setChart] = React.useState(chartSimple);

  const onStateChange = (newChart: IChart) => {
    setChart(newChart);
  }

  return (
    <>
      <DragAndDropSidebar onStateChange={onStateChange} />
      <SelectedSidebar />
      <CheckPortsButton chart={chart} />
    </>
  );
}

storiesOf('Sidebar', module)
  .add('Drag and Drop', () => <StoryWrapper />)
  .add('Selected Sidebar', () => <SelectedSidebar />)
storiesOf('Buttons', module)
  .add('Check Ports Button', () => <StoryWrapper />);
