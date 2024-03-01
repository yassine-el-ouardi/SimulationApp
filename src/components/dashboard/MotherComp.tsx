import * as React from 'react'
// import Chart1 from './Chart1';
// import Chart2 from './Chart2';
// import DashboardStats from './DashboardStats';
import AmountStats from './AmountStats';
// import { chartSimple } from '../../../stories/misc/exampleChartState';
// import { cloneDeep/*, mapValues*/ } from 'lodash';


function MotherComp() {
    const state = ""
    console.log('from mother', state);
    const Air_efficiency = 552.5
    const Flotation_rate=0.59
    const Entrainment_of_the_cell=0.11
    
    // const statsData = [
    //     {title : "Total Solids Flow", value : "100", description : "t/h"},
    //     {title : "Total Liquid Flow", value : "48",  description : "t/h"},
    //     {title : "Pulp Mass Flow", value : "148", description : "t/h"},
    //     {title : "Pulp Volumetric Flow", value : "73.82", description : "m3/h"},
    //     {title : "Solids SG", value : "3.9", description : "g/cm3"},
    //     {title : "Pulp SG", value : "2.01", description : "g/cm3"},
    //     {title : "% Solids", value : "67.57", description : "%"},
    //     {title : "Solids Fraction", value : "34.78", description : "%"},
    // ]

  return (
    <div className="container mx-auto mt-8">

       <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="https://cdn.discordapp.com/attachments/931330325433442374/1212737964556423218/FlotCellBrut.png?ex=65f2ed3e&is=65e0783e&hm=0cb7ff9fb2ca1e1e7224d8014e1acddad78436247b93808a7b62b156ccbea0b5&" alt="" style={{ marginTop: '20px' }} />
                <div className="bg-gray-200 rounded p-2 mt-2">
                    <p className="text-center">Cell name: FB</p>
                </div>
            </div>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', marginLeft: '20px', alignItems: 'center' }}>
                <AmountStats Air_efficiency={Air_efficiency} Flotation_rate={Flotation_rate} Entrainment_of_the_cell={Entrainment_of_the_cell} />
            </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        charts will be added here
        {/* <Chart1 />
        <Chart1 />
        <Chart1 />
        <Chart2 /> */}
      </div>
    </div>
  );
}

export default MotherComp;
