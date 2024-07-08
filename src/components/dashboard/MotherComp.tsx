import React, { useEffect, useState } from 'react';
import PbLineChart from './PbLineChart';
import CuLineChart from './CuLineChart';
import ZnLineChart from './ZnLineChart';
import FeLineChart from './FeLineChart';
import AmountStats from './AmountStats';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';

const MotherComp: React.FC = () => {
  const { chartState } = useAppContext();
  const [advice, setAdvice] = useState<string>('');

  useEffect(() => {
    console.log("chart updated in MotherComp:", chartState);
  }, [chartState]);

  console.log("chart in dashboard:", chartState);
  const { cellId } = useParams();

  // You can now use cellId to fetch or display specific data
  console.log("Displaying data for cell:", cellId);

  return (
    <div className="flex-1 overflow-y-auto pt-8 px-6 bg-base-200" style={{ padding: 30 }}>
      <div className="container mx-auto mt-8">
        <div className="flex flex-row items-center justify-center">
          <div className="flex flex-col items-center justify-center w-1/3">
            <div className="rounded p-2">
              <img 
                src="/AI_Agent.png" 
                alt="AI Agent" 
                className="mx-auto"
                style={{ height: '120px' }} 
              />
              <p className="text-center">AI Agent</p>
              <div className="bg-white rounded p-2 mt-2">
                <p id="ai-advice" className="text-center">{advice || 'AI advice will be displayed here...'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-1/3">
            <img src="/FlotCellBrut.png" alt="Flotation Cell" />
            <div className="bg-gray-200 rounded p-2 mt-2">
              <p className="text-center">Cell name: FB</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-1/3">
          <div className="stats bg-base-100 shadow mb-8">
              <div className="stat">
                <h1 id="timestamp">Timestamp will be displayed here...</h1>
              </div>
          </div>
            <AmountStats setAdvice={setAdvice} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
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