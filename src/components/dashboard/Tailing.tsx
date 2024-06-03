import React from 'react';
import DashboardStats from './DashboardStats';
import Chart1 from './Chart1';
import Chart2 from './Chart2';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IChart } from '../../types/chart';
import { useAppContext } from '../../AppContext';


interface Stat {
  title: string;
  value: string;
  description: string;
}


const Tailing: React.FC = () => {
  const { chartState } = useAppContext();

  useEffect(() => {
    console.log("chart updated in MotherComp:", chartState);
  }, [chartState]);
  const { cellId } = useParams<{ cellId: string }>();
  const [statsData, setStatsData] = useState<Stat[]>([]);
  console.log("Received chart:", chartState);
  console.log("Cell ID:", cellId);

  useEffect(() => {
    // This example assumes 'chart.links' is an object where each key is a link ID and each value is a link object.
    const relevantLink = Object.values(chartState.links).find(
      link => link.from.nodeId === cellId && link.from.portId === 'port4'
    );

    if (relevantLink) {
      const newStatsData = [
        { title: "Total Solids Flow", value: relevantLink.feed.totalSolidFlow.toFixed(2), description: "t/h" },
        { title: "Total Liquid Flow", value: relevantLink.feed.totalLiquidFlow.toFixed(2), description: "t/h" },
        { title: "Pulp Volumetric Flow", value: relevantLink.feed.pulpVolumetricFlow.toFixed(2), description: "m³/h" },
        { title: "Solids SG", value: relevantLink.feed.solidsSG.toFixed(2), description: "g/cm³" },
        { title: "Pulp SG", value: relevantLink.feed.pulpSG.toFixed(2), description: "g/cm³" },
        { title: "Solids Fraction", value: relevantLink.feed.solidsFraction.toFixed(2), description: "%" },
        { title: "Copper Percentage", value: relevantLink.feed.cuPercentage.toFixed(2), description: "%" },
        { title: "Iron Percentage", value: relevantLink.feed.fePercentage.toFixed(2), description: "%" },
        { title: "Zinc Percentage", value: relevantLink.feed.znPercentage.toFixed(2), description: "%" },
        { title: "Lead Percentage", value: relevantLink.feed.pbPercentage.toFixed(2), description: "%" },
      ];
      
      setStatsData(newStatsData);
    }
  }, [cellId, chartState.links]);

  return (
    <div>
      <div style={{marginTop: '0px'}} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
        {statsData.map((d, k) => (
          <DashboardStats key={k} {...d} colorIndex={k} />
        ))}
      </div>
{/*      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <Chart1 />
        <Chart2 />
         Add more charts or components as needed 
      </div>*/}
    </div>
  );
};

export default Tailing;
