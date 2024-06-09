import React from 'react';
import Subtitle from './Typography/Subtitle';

interface TitleCardProps {
  title: string;
  children: React.ReactNode;
  topMargin?: string;
  TopSideButtons?: React.ReactNode;
}

const TitleCard: React.FC<TitleCardProps> = ({ title, children, topMargin, TopSideButtons }) => {
  return (
    <div className={"card w-full p-6 bg-base-100 shadow-xl " + (topMargin || "mt-6")}>
      <Subtitle styleClass={TopSideButtons ? "inline-block" : ""}>
        {title}
        {TopSideButtons && <div className="inline-block float-right">{TopSideButtons}</div>}
      </Subtitle>
      <div className="divider mt-2"></div>
      <div className='h-full w-full pb-6 bg-base-100'>
        {children}
      </div>
    </div>
  );
}

export default TitleCard;