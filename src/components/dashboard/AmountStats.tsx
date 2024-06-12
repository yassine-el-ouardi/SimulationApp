import React, { useEffect, useState } from 'react';
import { InfluxDB } from '@influxdata/influxdb-client';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';

interface Stat {
  title: string;
  value: string;
  description: string;
}

const bucket = 'Seconds'; // Change this to your bucket name
const url = 'http://localhost:8086'; // Change this to your InfluxDB URL
const token = 'sUJZaiT1oMfvd0MKraMlw5WYl442Mom46YCLFcReJ3LXX0Ka9NWHF8e6uV6N8euHBY2C_QZph5Q4U78SPTkOLA=='; // Change this to your InfluxDB token
const org = 'Dev team'; // Change this to your org name

const AmountStats: React.FC = () => {
  const { cellId } = useParams<{ cellId: string }>();
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const { chartState } = useAppContext();

  useEffect(() => {
    console.log("chart updated in AmountStats:", chartState);
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
            r["_field"] == "Entrainment: Cell"
          )
          |> sort(columns: ["_time"], desc: true)
          |> limit(n: 1)
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

            const fieldNamesMap = {
              'Air Efficiency': 'Air efficiency Of the cell',
              'Flotation Rate: Cell': 'Flotation rate Of the cell',
              'Entrainment: Cell': 'Entrainment of the cell'
            };
            const fieldDescriptions = {
              'Air Efficiency': 'Kg/m3',
              'Flotation Rate: Cell': '1/min',
              'Entrainment: Cell': 'µm'
            };

            const newStatsData = rows.map((row) => ({
              title: fieldNamesMap[row._field],
              value: row._value.toFixed(2),
              description: fieldDescriptions[row._field],
            }));

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

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="flex-1 overflow-y-auto pt-8 px-6 bg-base-200" style={{ padding: 30 }}>
        {/** ---------------------- Title with Timestamp ------------------------- */}
        <div className="stats bg-base-100 shadow" style={{ marginBottom: 30, float: "right" }}>
          <div className="stat">
            <h1 >
              {timestamp ? formatTimestamp(timestamp) : 'N/A'}
            </h1>
          </div></div>
        {/** ---------------------- Different stats content 1 ------------------------- */}
        <div className="stats bg-base-100 shadow">
          {
            statsData.map((d, k) => (
              <div key={k} className="stat">
                <div className="stat-title">{d.title}</div>
                <div className="stat-value">{d.value}</div>
                <div className="stat-desc">{d.description}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default AmountStats;