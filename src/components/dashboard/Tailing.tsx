import * as React from 'react'
import DashboardStats from './DashboardStats';
// import Chart1 from './Chart1';
// import Chart2 from './Chart2';


function Tailing() {
    const statsData = [
        { title: "Total Solids Flow", value: " 343.4", description: "t/h" },
        { title: "Total Liquid Flow", value: " 637.7", description: "t/h" },
        { title: "Pulp Mass Flow", value: " 981.2", description: "t/h" },
        { title: "Pulp Volumetric Flow", value: " 707.3", description: "m3/h" },
        { title: "Solids SG", value: "5.08", description: "g/cm3" },
        { title: "Pulp SG", value: "1.39", description: "g/cm3" },
        { title: "% Solids", value: "35", description: "%" },
        { title: "Solids Fraction", value: "9.56", description: "%" },
    ]

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
                {
                    statsData.map((d, k) => {
                        return (
                            <DashboardStats key={k} {...d} />
                        )
                    })
                }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {/* <Chart1 />
                <Chart2 />
                <Chart1 />
                <Chart2 /> */}
            </div>

        </div>
    )
}

export default Tailing