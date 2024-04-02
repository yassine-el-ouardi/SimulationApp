import React from 'react';

interface AmountStatsProps {
  // Define props here if any
}

const AmountStats: React.FC<AmountStatsProps> = (props) => {
  return (
    <div className="stats bg-base-100 shadow">
      <div className="stat">
        <div className="stat-title">Air efficiency Of the cell</div>
        <div className="stat-value">522.4</div>
        <div className="stat-desc">Kg/m3</div>
      </div>

      <div className="stat">
        <div className="stat-title">Flotation rate Of the cell</div>
        <div className="stat-value">0.59</div>
        <div className="stat-desc">1/min</div>
      </div>
      
      <div className="stat">
        <div className="stat-title">Entrainment of the cell</div>
        <div className="stat-value">0.11</div>
        <div className="stat-desc">µm</div>
      </div>
    </div>
  );
}

export default AmountStats;
