import React, { useEffect, useState } from 'react';
import { InfluxDB } from '@influxdata/influxdb-client';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import OpenAI from 'openai';

// Define the structure of the assistant message content
interface TextContent {
  type: 'text';
  text: {
    value: string;
    annotations: any[];
  };
}

interface AssistantMessage {
  role: string;
  content: TextContent[];
}

interface AssistantResponse {
  data: AssistantMessage[];
}

interface Stat {
  title: string;
  value: string;
  description: string;
}

interface AmountStatsProps {
  setAdvice: (advice: string) => void;
}

const bucket = 'Seconds'; // Change this to your bucket name
const url = 'http://localhost:8086'; // Change this to your InfluxDB URL
const token = 'sUJZaiT1oMfvd0MKraMlw5WYl442Mom46YCLFcReJ3LXX0Ka9NWHF8e6uV6N8euHBY2C_QZph5Q4U78SPTkOLA=='; // Change this to your InfluxDB token
const org = 'Dev team'; // Change this to your org name
const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY; // Your OpenAI API Key

const AmountStats: React.FC<AmountStatsProps> = ({ setAdvice }) => {
  const { cellId } = useParams<{ cellId: string }>();
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const { chartState } = useAppContext();
  const [openai, setOpenai] = useState<OpenAI | null>(null);

  useEffect(() => {
    setOpenai(new OpenAI({ apiKey: openaiApiKey, dangerouslyAllowBrowser: true }));
  }, []);

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
        complete: async () => {
          console.log('Query completed successfully');
          if (rows.length > 0) {
            const latestTimestamp = rows[0]._time;
            setTimestamp(latestTimestamp);
            document.getElementById('timestamp')!.innerText = latestTimestamp ? formatTimestamp(latestTimestamp) : 'N/A';

            const fieldNamesMap = {
              'Air Efficiency': 'Air efficiency',
              'Flotation Rate: Cell': 'Flotation rate',
              'Entrainment: Cell': 'Entrainment',
              'Total Solids Flow_Concentrate': 'Total Solids Flow_Concentrate',
              'Total Liquid Flow_Concentrate': 'Total Liquid Flow_Concentrate',
              'Pulp Volumetric Flow_Concentrate': 'Pulp Volumetric Flow_Concentrate',
              'Solids SG_Concentrate': 'Solids SG_Concentrate',
              'Pulp SG_Concentrate': 'Pulp SG_Concentrate',
              'Solids Fraction_Concentrate': 'Solids Fraction_Concentrate',
              'Total Solids Flow_Tailings': 'Total Solids Flow_Tailings',
              'Total Liquid Flow_Tailings': 'Total Liquid Flow_Tailings',
              'Pulp Volumetric Flow_Tailings': 'Pulp Volumetric Flow_Tailings',
              'Solids SG_Tailings': 'Solids SG_Tailings',
              'Pulp SG_Tailings': 'Pulp SG_Tailings',
              'Solids Fraction_Tailings': 'Solids Fraction_Tailings',
              'Cu_Tails': 'Cu_Tails',
              'Fe_Tails': 'Fe_Tails',
              'Pb_Tails': 'Pb_Tails',
              'Zn_Tails': 'Zn_Tails',
              'Cu_Concentrate': 'Cu_Concentrate',
              'Fe_Concentrate': 'Fe_Concentrate',
              'Pb_Concentrate': 'Pb_Concentrate',
              'Zn_Concentrate': 'Zn_Concentrate'
            };

            const fieldDescriptions = {
              'Air Efficiency': 'Kg/m3',
              'Flotation Rate: Cell': '1/min',
              'Entrainment: Cell': 'µm',
              'Total Solids Flow_Concentrate': 'Kg/h',
              'Total Liquid Flow_Concentrate': 'L/h',
              'Pulp Volumetric Flow_Concentrate': 'm³/h',
              'Solids SG_Concentrate': '',
              'Pulp SG_Concentrate': '',
              'Solids Fraction_Concentrate': '%',
              'Total Solids Flow_Tailings': 'Kg/h',
              'Total Liquid Flow_Tailings': 'L/h',
              'Pulp Volumetric Flow_Tailings': 'm³/h',
              'Solids SG_Tailings': '',
              'Pulp SG_Tailings': '',
              'Solids Fraction_Tailings': '%',
              'Cu_Tails': '%',
              'Fe_Tails': '%',
              'Pb_Tails': '%',
              'Zn_Tails': '%',
              'Cu_Concentrate': '%',
              'Fe_Concentrate': '%',
              'Pb_Concentrate': '%',
              'Zn_Concentrate': '%'
            };

            const newStatsData = rows
              .filter(row => row._field === 'Air Efficiency' || row._field === 'Flotation Rate: Cell' || row._field === 'Entrainment: Cell')
              .map((row) => ({
                title: fieldNamesMap[row._field],
                value: row._value.toFixed(2),
                description: fieldDescriptions[row._field],
              }));

            setStatsData(newStatsData);

            // Prepare data for OpenAI assistant
            const inputData = rows.reduce((acc, row) => {
              acc[row._field] = row._value;
              return acc;
            }, {});

            // Call OpenAI assistant
            if (openai) {
              try {
                const thread = await openai.beta.threads.create();
                await openai.beta.threads.messages.create(thread.id, { role: "user", content: JSON.stringify(inputData) });
                const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: 'asst_LmbAwCNrEh63pUb0qCGw8yuZ' });
                const getAnswer = async (threadId, runId) => {
                  const getRun = await openai.beta.threads.runs.retrieve(threadId, runId);
                  if (getRun.status === "completed") {
                    const messages = await openai.beta.threads.messages.list(threadId) as AssistantResponse;
                    const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
                    if (assistantMessage && assistantMessage.content[0].type === 'text') {
                      const adviceText = (assistantMessage.content[0] as TextContent).text.value;
                      setAdvice(adviceText);
                      document.getElementById('ai-advice')!.innerText = adviceText;
                    }
                  } else {
                    setTimeout(() => getAnswer(threadId, runId), 200);
                  }
                };
                getAnswer(thread.id, run.id);
              } catch (error) {
                console.error('OpenAI API error:', error);
              }
            }
            //setAdvice("Adjust pulp SG for better solid fraction in concentrate. Increase air efficiency to improve flotation rate and decrease entrainment.");
          } else {
            setStatsData([]);
            setTimestamp(null);
          }
        }
      });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 3000);

    return () => clearInterval(intervalId);
  }, [cellId, openai]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
      <div className="flex-1 overflow-y-auto bg-base-200">
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
  );
}

export default AmountStats;