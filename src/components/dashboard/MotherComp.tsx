// MotherComp.jsx

import React from 'react';
import Chart1 from './Chart1';
import Chart2 from './Chart2';
import DashboardStats from './DashboardStats';
import AmountStats from './AmountStats';


function MotherComp() {
    const statsData = [
        {title : "Total Solids Flow", value : "100", description : "t/h"},
        {title : "Total Liquid Flow", value : "48",  description : "t/h"},
        {title : "Pulp Mass Flow", value : "148", description : "t/h"},
        {title : "Pulp Volumetric Flow", value : "73.82", description : "m3/h"},
        {title : "Solids SG", value : "3.9", description : "g/cm3"},
        {title : "Pulp SG", value : "2.01", description : "g/cm3"},
        {title : "% Solids", value : "67.57", description : "%"},
        {title : "Solids Fraction", value : "34.78", description : "%"},
    ]

  return (
    <div className="container mx-auto mt-8">

        {/* Dashboard header */}
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/FlotCellBrut.png" alt="" style={{ marginTop: '20px' }} />
                <div className="bg-gray-200 rounded p-2 mt-2">
                    <p className="text-center">Cell name: FB</p>
                </div>
            </div>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', marginLeft: '20px', alignItems: 'center' }}>
                <AmountStats />
                    <button className="btn bg-base-100 btn-outline" style={{ marginTop: '10px', marginLeft: '10px' }}>
                        Advanced Analytics
                    </button>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
            {
                statsData.map((d, k) => {
                    return (
                        <DashboardStats key={k} {...d} colorIndex={k}/>
                    )
                })
            }
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Chart1 />
        <Chart1 />
        <Chart1 />
        <Chart1 />
        <Chart2 />
        {/* Add more charts or components as needed */}
      </div>
    </div>
  );
}

export default MotherComp;
