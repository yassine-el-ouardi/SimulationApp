import React from 'react';

interface AmountStatsProps {
  // Define props here if any
}

const generateRandomValue = (min: number, max: number) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

const AmountStats: React.FC<AmountStatsProps> = (props) => {
  const airEfficiency = generateRandomValue(472.4, 572.4);
  const flotationRate = generateRandomValue(0.5, 0.7);
  const entrainment = generateRandomValue(0.15, 0.30);

  return (
    <div className="stats bg-base-100 shadow">
      <div className="stat">
        <div className="stat-title">Air efficiency Of the cell</div>
        <div className="stat-value">{airEfficiency}</div>
        <div className="stat-desc">Kg/m3</div>
      </div>

      <div className="stat">
        <div className="stat-title">Flotation rate Of the cell</div>
        <div className="stat-value">{flotationRate}</div>
        <div className="stat-desc">1/min</div>
      </div>
      
      <div className="stat">
        <div className="stat-title">Entrainment of the cell</div>
        <div className="stat-value">{entrainment}</div>
        <div className="stat-desc">µm</div>
      </div>
    </div>
  );
}

export default AmountStats;
