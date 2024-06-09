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
  import { useDispatch } from 'react-redux';
  import { setPageTitle } from './headerSlice';
  import React from 'react';

  
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
  
  const PbLineChart: React.FC = () => {
    const dispatch = useDispatch();
    const [dataPoints, setDataPoints] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
  
    useEffect(() => {
      dispatch(setPageTitle({ title: 'Line Chart' }));
      generateDataPoints();
    }, [dispatch]);
  
    const generateDataPoints = () => {
      const currentDate = new Date();
      const labelsData: string[] = [];
      const data: number[] = [];
  
      // Generate data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        labelsData.push(formatDateTime(date));
        data.push(Math.random() * 100);
      }
  
      setLabels(labelsData);
      setDataPoints(data);
    };
  
    const formatDateTime = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString(undefined, options);
    };
  
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0, // Prevents rotation of labels
            minRotation: 0,
          },
        },
      },
      layout: {
        padding: {
          right: 30, // Adds padding to the right
        },
      },
    };
  
    const data = {
      labels: labels,
      datasets: [
        {
          fill: true,
          label: '%',
          data: dataPoints,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
  
    return (
      <TitleCard title={"% of Pb"}>
        <Line data={data} options={options} />
      </TitleCard>
    );
  }
  
  export default PbLineChart;  