import React from 'react';
import DashboardStats from './DashboardStats';
import Chart1 from './Chart1';
import Chart2 from './Chart2';

interface StatsData {
  title: string;
  value: string;
  description: string;
  colorIndex: number;
}

const statsData: StatsData[] = [
            {title : "Total Solids Flow", value : "100", description : "t/h", colorIndex: 0},
            {title : "Total Liquid Flow", value : "48",  description : "t/h", colorIndex: 0},
            {title : "Pulp Mass Flow", value : "148", description : "t/h", colorIndex: 0},
            {title : "Pulp Volumetric Flow", value : "73.82", description : "m3/h", colorIndex: 0},
            {title : "Solids SG", value : "3.9", description : "g/cm3", colorIndex: 0},
            {title : "Pulp SG", value : "2.01", description : "g/cm3", colorIndex: 0},
            {title : "% Solids", value : "67.57", description : "%", colorIndex: 0},
            {title : "Solids Fraction", value : "34.78", description : "%", colorIndex: 0},
];

const Tailing: React.FC = () => {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
        {statsData.map((data, index) => (
          <DashboardStats key={index} {...data} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <Chart1 />
        <Chart2 />
        {/* Add more charts or components as needed */}
      </div>
    </div>
  );
};

export default Tailing;
