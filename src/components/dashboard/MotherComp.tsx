import React, { useEffect } from 'react';
import Chart1 from './Chart1';
import Chart2 from './Chart2';
//import DashboardStats from './DashboardStats';
import AmountStats from './AmountStats';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';


/*
interface StatsData {
  title: string;
  value: string;
  description: string;
}
*/
const MotherComp: React.FC = () => {
  const { chart } = useAppContext();

  useEffect(() => {
    console.log("chart updated in MotherComp:", chart);
  }, [chart]);

  console.log("chart in dashboard:", chart)
  const { cellId } = useParams();

  // You can now use cellId to fetch or display specific data
  console.log("Displaying data for cell:", cellId);
  /*const statsData: StatsData[] = [
    { title: "Air efficiency Of the cell", value: "522.4", description: "Kg/m3" },
    { title: "Flotation rate Of the cell", value: "0.59", description: "1/min" },
    { title: "Entrainment of the cell", value: "0.11", description: "µm" },
  ];*/

  return (
    <div style={{marginTop: '0px'}} className="container mx-auto mt-8" >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/FlotCellBrut.png" alt="" style={{ marginTop: '20px' }} />
          <div className="bg-gray-200 rounded p-2 mt-2">
            <p className="text-center">Cell name: FB</p>
          </div>
        </div>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', marginLeft: '20px', alignItems: 'center' }}>
          <AmountStats />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Chart1 />
        <Chart1 />
        <Chart1 />
        <Chart2 />
      </div>
    </div>
  );
}

export default MotherComp;
