import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InfluxDB } from '@influxdata/influxdb-client';
import DashboardStats from './DashboardStats';
import DashboardTopBar from './DashboardTopBar';
import { useAppContext } from '../../AppContext';
import { useDispatch } from 'react-redux';
import { showNotification } from './headerSlice';
import CircleStackIcon  from '@heroicons/react/24/outline/CircleStackIcon'
import PbLineChart from './PbLineChart'
import CuLineChart from './CuLineChart'
import ZnLineChart from './ZnLineChart'
import FeLineChart from './FeLineChart'

interface Stat {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
}

const bucket = 'Seconds'; // Change this to your bucket name
const url = 'http://localhost:8086'; // Change this to your InfluxDB URL
const token = 'sUJZaiT1oMfvd0MKraMlw5WYl442Mom46YCLFcReJ3LXX0Ka9NWHF8e6uV6N8euHBY2C_QZph5Q4U78SPTkOLA=='; // Change this to your InfluxDB token
const org = 'Dev team'; // Change this to your org name

const Concentrate: React.FC = () => {
  const { chartState } = useAppContext();
  const { cellId } = useParams<{ cellId: string }>();
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("chart updated in Concentrate:", chartState);
  }, [chartState]);

  useEffect(() => {
    const fetchData = async () => {
      const influxDB = new InfluxDB({ url, token });
      const queryApi = influxDB.getQueryApi(org);

      const query = `
        from(bucket: "${bucket}")
          |> range(start: 0)
          |> filter(fn: (r) => r["_measurement"] == "flotationCell" and r["node_id"] == "${cellId}")
          |> filter(fn: (r) =>
            r["_field"] == "Air Efficiency" or
            r["_field"] == "Flotation Rate: Cell" or
            r["_field"] == "Entrainment: Cell" or
            r["_field"] == "Total Solids Flow_Concentrate" or
            r["_field"] == "Total Liquid Flow_Concentrate" or
            r["_field"] == "Pulp Volumetric Flow_Concentrate" or
            r["_field"] == "Solids SG_Concentrate" or
            r["_field"] == "Pulp SG_Concentrate" or
            r["_field"] == "Solids Fraction_Concentrate" or
            r["_field"] == "Total Solids Flow_Tailings" or
            r["_field"] == "Total Liquid Flow_Tailings" or
            r["_field"] == "Pulp Volumetric Flow_Tailings" or
            r["_field"] == "Solids SG_Tailings" or
            r["_field"] == "Pulp SG_Tailings" or
            r["_field"] == "Solids Fraction_Tailings" or
            r["_field"] == "Cu_Tails" or
            r["_field"] == "Fe_Tails" or
            r["_field"] == "Pb_Tails" or
            r["_field"] == "Zn_Tails" or
            r["_field"] == "Cu_Concentrate" or
            r["_field"] == "Fe_Concentrate" or
            r["_field"] == "Pb_Concentrate" or
            r["_field"] == "Zn_Concentrate"
          )
          |> sort(columns: ["_time"], desc: true)
          |> limit(n: 23)
      `;

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
            const latestTimestamp = rows[0]._time;
            setTimestamp(latestTimestamp);

            const fieldNames = [
              'Air Efficiency', 'Flotation Rate: Cell', 'Entrainment: Cell',
              'Total Solids Flow_Concentrate', 'Total Liquid Flow_Concentrate', 'Pulp Volumetric Flow_Concentrate',
              'Solids SG_Concentrate', 'Pulp SG_Concentrate', 'Solids Fraction_Concentrate',
              'Total Solids Flow_Tailings', 'Total Liquid Flow_Tailings', 'Pulp Volumetric Flow_Tailings',
              'Solids SG_Tailings', 'Pulp SG_Tailings', 'Solids Fraction_Tailings',
              'Cu_Tails', 'Fe_Tails', 'Pb_Tails', 'Zn_Tails',
              'Cu_Concentrate', 'Fe_Concentrate', 'Pb_Concentrate', 'Zn_Concentrate'
            ];

            const fieldDescriptions = [
              'N/A', 'N/A', 'N/A',
              't/h', 't/h', 'm³/h',
              'g/cm³', 'g/cm³', '%',
              't/h', 't/h', 'm³/h',
              'g/cm³', 'g/cm³', '%',
              '%', '%', '%', '%',
              '%', '%', '%', '%'
            ];

            const newStatsData = fieldNames.map((fieldName, index) => {
              const row = rows.find(r => r._field === fieldName);
              return {
                title: fieldName,
                value: row ? row._value.toFixed(2) : 'N/A',
                description: fieldDescriptions[index],
                icon: <CircleStackIcon className='w-8 h-8' />,
              };
            });

            setStatsData(newStatsData);
          } else {
            setStatsData([]);
            setTimestamp(null);
          }
        }
      });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, [cellId]);

  const updateDashboardPeriod = (newRange) => {
    // Dashboard range changed, write code to refresh your values
    dispatch(showNotification({ message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status: 1 }));
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
    <div className="flex-1 overflow-y-auto pt-8 px-6  bg-base-200" style={{padding: 30 }}>
      {/** ---------------------- Title with Timestamp ------------------------- */}
      <h1 className="text-2xl font-semibold ml-2" style={{paddingBottom: 30}}>Concentrate at: ( {timestamp ? formatTimestamp(timestamp) : 'N/A'})</h1>

      {/** ---------------------- Select Period Content ------------------------- */}
      <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />



      {/** ---------------------- Different stats content 1 ------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
        {
          statsData.map((d, k) => (
            <DashboardStats key={k} {...d} colorIndex={k} />
          ))
        }
      </div>

      {/** ---------------------- Different charts 1------------------------- */}
      <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
        <CuLineChart />
        <FeLineChart />
      </div>

      {/** ---------------------- Different charts 2 -------------------------*/}
      <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
        <PbLineChart />
        <ZnLineChart />
      </div> 
    </div>
    </>
  );
};

export default Concentrate;