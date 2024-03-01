import * as React from 'react'
function AmountStats({Air_efficiency, Flotation_rate, Entrainment_of_the_cell}:{Air_efficiency:Number, Flotation_rate:Number, Entrainment_of_the_cell:Number}){
    return(
        <div className="stats bg-base-100 shadow">
            <div className="stat">
                <div className="stat-title">Air efficiency Of the cell</div>
                <div className="stat-value"> {Air_efficiency}</div>
                <div className="stat-desc">Kg/m3</div>
            </div>

            <div className="stat">
                <div className="stat-title">Flotation rate Of the cell</div>
                <div className="stat-value">{Flotation_rate}</div>
                <div className="stat-desc">1/min</div>
            </div>
            
          
            <div className="stat">
                <div className="stat-title">Entrainment of the cell</div>
                <div className="stat-value">{Entrainment_of_the_cell}</div>
                <div className="stat-desc">µm</div>
            </div>
        </div>
    )
}

export default AmountStats