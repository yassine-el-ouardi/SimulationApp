import * as React from 'react'
import './dashstyle.css';
import Subtitle from './Typography/Subtitle';

function TitleCard({ title, children}:{ title:any, children:any}) {
  return (
    <div className={"card w-full p-6 bg-base-100 shadow-xl " + ("mt-6")}>

      {/* Title for Card */}
      <Subtitle styleClass="inline-block">
        {title}

        {/* Top side button, show only if present */}
        {
        <div className="inline-block float-right"></div>
        }
      </Subtitle>

      <div className="divider mt-2"></div>

      {/** Card Body */}
      <div className='h-full w-full pb-6 bg-base-100'>
        {children}
      </div>
    </div>

  )
}


export default TitleCard