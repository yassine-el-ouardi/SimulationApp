import * as React from 'react'
import './style.css'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TitleCard from './TitleCard';
import { useEffect, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);
function Chart3() {
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    generateDataPoints();
  }, []);

  const generateDataPoints = () => {
    const currentDate = new Date();
    const generatedData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      return {
        label: formatDateTime(date),
        value: Math.random() * 100,
      };
    });

    const generatedLabels = generatedData.map((entry) => entry.label);
    const generatedValues = generatedData.map((entry) => entry.value);

    setLabels(generatedLabels);
    setDataPoints(generatedValues);
  };

  const formatDateTime = (date:any) => {
    const options = {
      day: '2-digit',
      month: '2-digit',
      // year: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit',
      // second: '2-digit',
    };
    return date.toLocaleDateString(undefined, options);
  };

  // const options = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //   },
  // };

  const data = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: '%',
        data: dataPoints,
        borderColor: 'rgb(255, 178, 102)',
        backgroundColor: 'rgba(255, 178, 102, 0.5)',
      },
    ],
  };

  return (
    <TitleCard title="% of Pb">
      <Line data={data} /*options={options}*/ />
    </TitleCard>
  );
}

export default Chart3;

  