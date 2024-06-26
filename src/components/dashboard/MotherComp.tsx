import React, { useEffect } from 'react';
import PbLineChart from './PbLineChart';
import CuLineChart from './CuLineChart';
import ZnLineChart from './ZnLineChart';
import FeLineChart from './FeLineChart';
import AmountStats from './AmountStats';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';

const MotherComp: React.FC = () => {
  const { chartState } = useAppContext();

  useEffect(() => {
    console.log("chart updated in MotherComp:", chartState);
  }, [chartState]);

  console.log("chart in dashboard:", chartState);
  const { cellId } = useParams();

  // You can now use cellId to fetch or display specific data
  console.log("Displaying data for cell:", cellId);

  return (
    <div className="flex-1 overflow-y-auto pt-8 px-6 bg-base-200" style={{ padding: 30 }}>
      <div style={{ marginTop: '0px' }} className="container mx-auto mt-8">
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
          <CuLineChart />
          <FeLineChart />
          <PbLineChart />
          <ZnLineChart />
        </div>
      </div>
    </div>
  );
}

export default MotherComp;