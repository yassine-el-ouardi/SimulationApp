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
import { InfluxDB } from '@influxdata/influxdb-client';
import { useParams } from 'react-router-dom';
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

const bucket = 'Seconds'; // Change this to your bucket name
const url = 'http://localhost:8086'; // Change this to your InfluxDB URL
const token = 'sUJZaiT1oMfvd0MKraMlw5WYl442Mom46YCLFcReJ3LXX0Ka9NWHF8e6uV6N8euHBY2C_QZph5Q4U78SPTkOLA=='; // Change this to your InfluxDB token
const org = 'Dev team'; // Change this to your org name

const FeLineChartTailing: React.FC = () => {
  const dispatch = useDispatch();
  const { cellId } = useParams<{ cellId: string }>();
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Line Chart' }));
    const intervalId = setInterval(fetchData, 1000); // Fetch data every second
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch, cellId]);

  const fetchData = async () => {
    const influxDB = new InfluxDB({ url, token });
    const queryApi = influxDB.getQueryApi(org);

    const query = `
      from(bucket: "${bucket}")
        |> range(start: -7d)
        |> filter(fn: (r) => r["_measurement"] == "flotationCell" and r["node_id"] == "${cellId}")
        |> filter(fn: (r) => r["_field"] == "Fe_Tails")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 6)
        |> sort(columns: ["_time"], desc: false)
    `;
    console.log(query);

    const rows: any[] = [];

    queryApi.queryRows(query, {
      next: (row, tableMeta) => {
        const obj = tableMeta.toObject(row);
        rows.push(obj);
      },
      error: (error) => {
        console.error('Query error:', error);
      },
      complete: () => {
        console.log('Query completed successfully');
        if (rows.length > 0) {
          const labelsData = rows.map(row => formatDateTime(new Date(row._time)));
          const data = rows.map(row => parseFloat(row._value));
          setLabels(labelsData);
          setDataPoints(data);
        }
      }
    });
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
        borderColor: 'rgb(255, 178, 102)',
        backgroundColor: 'rgba(255, 178, 102, 0.5)',
      },
    ],
  };

  return (
    <TitleCard title={"% of Fe"}>
      <Line data={data} options={options} />
    </TitleCard>
  );
}

export default FeLineChartTailing;