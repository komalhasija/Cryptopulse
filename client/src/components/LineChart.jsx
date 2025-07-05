import React, { useEffect, useState } from 'react';
import Chart from 'react-google-charts';

const LineChart = ({ historicalData, currency }) => {
  const [data, setData] = useState([["Date", "Price"]]);


  useEffect(() => {
    console.log("Chart Data:", historicalData?.prices);
    const dataCopy = [["Date", "Price"]];
    if (historicalData?.prices?.length > 0) {
      historicalData.prices.forEach((item) => {
        dataCopy.push([new Date(item[0]), parseFloat(item[1])]);
      });
      setData(dataCopy);
    }
  }, [historicalData]);

  if (!historicalData || !historicalData.prices) {
    return <div className="text-center text-gray-600">Loading chart...</div>;
  }

  return (
    <Chart
      chartType="LineChart"
      data={data}
      width="600px"     // makes chart fill container width
      height="500px"

      options={{
        title: `Price Trend (${currency?.toUpperCase()})`,
        hAxis: {
          title: "Date",
          format: "MMM dd",
          gridlines: { count: 6 },
        },
        vAxis: {
          title: `Price (${currency?.toUpperCase()})`,
        },
        legend: "none",
        colors: ["#1c91c0"],
        curveType: "function",
        pointSize: 4,
      }}
    />
  );
};

export default LineChart;
