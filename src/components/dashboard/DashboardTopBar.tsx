import React, { useState } from "react";
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import Datepicker from "react-tailwindcss-datepicker";

interface DashboardTopBarProps {
  updateDashboardPeriod: (newRange: { startDate: Date; endDate: Date }) => void;
}

const periodOptions = [
  { name: "Today", value: "TODAY" },
  { name: "Yesterday", value: "YESTERDAY" },
  { name: "This Week", value: "THIS_WEEK" },
  { name: "Last Week", value: "LAST_WEEK" },
  { name: "This Month", value: "THIS_MONTH" },
  { name: "Last Month", value: "LAST_MONTH" },
];

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ updateDashboardPeriod }) => {
  const [dateValue, setDateValue] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const handleDatePickerValueChange = (newValue: { startDate: Date; endDate: Date }) => {
    console.log("newValue:", newValue);
    setDateValue(newValue);
    updateDashboardPeriod(newValue);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="">
        <Datepicker
          containerClassName="w-72 "
          value={dateValue}
          inputClassName="input input-bordered w-72"
          popoverDirection={"down"}
          toggleClassName="invisible"
          onChange={handleDatePickerValueChange}
          showShortcuts={true}
          primaryColor={"blue"}
        />
      </div>
      <div className="text-right ">
        <button className="btn btn-ghost btn-sm normal-case">
          <ArrowPathIcon className="w-4 mr-2" />Refresh Data
        </button>
        <div className="dropdown dropdown-bottom dropdown-end  ml-2">
          <label tabIndex={0} className="btn btn-ghost btn-sm normal-case btn-square ">
            <EllipsisVerticalIcon className="w-5" />
          </label>
          <ul tabIndex={0} className="dropdown-content menu menu-compact  p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a>
                <ArrowDownTrayIcon className="w-4" />Download
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;