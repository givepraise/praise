import PraisesTable from "@/components/praise/Table";
import React from "react";
import { Link } from "react-router-dom";
const MainPage = () => {
  return (
    <>
      <div className="w-2/3 praise-box">
        <div className="mt-2">
          You can perform quantifications for the following periods:
          <ul className="ml-5 list-disc">
            <li>
              <Link to="/quantify/period/1">Aug-Sep</Link> (17/27 unfinished
              items)
            </li>
            <li>Jun-Jul</li>
          </ul>
        </div>
      </div>

      <div className="praise-box">
        <PraisesTable />
      </div>
    </>
  );
};

export default MainPage;
