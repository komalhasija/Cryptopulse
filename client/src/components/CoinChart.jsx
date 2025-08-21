import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Bar,
} from "recharts";

// Format timestamp to short date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const CoinChart = ({ historicalData, currency, timeframe }) => {
  if (!historicalData?.prices) return null;

  // Map for line data
  const lineData = historicalData.prices.map(([time, price]) => ({
    time,
    price,
  }));

  // If candlestick: we need OHLC (open, high, low, close)
  const candleData =
    historicalData.candles?.map(([time, open, high, low, close]) => ({
      time,
      open,
      high,
      low,
      close,
    })) || [];

  const isCandle = timeframe === "1D" || timeframe === "7D";

  return (
    <ResponsiveContainer width="100%" height="100%">
      {isCandle ? (
        <ComposedChart data={candleData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis
            dataKey="time"
            tickFormatter={formatDate}
            minTickGap={20}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => `${currency} ${v.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value) => `${currency} ${value.toLocaleString()}`}
            labelFormatter={(time) => new Date(time).toLocaleString()}
          />

          {/* Candlestick bars */}
          <Bar
            dataKey="high"
            fill="#22c55e"
            shape={(props) => {
              const { x, y, width, height, payload } = props;
              const openY = props.yAxis.scale(payload.open);
              const closeY = props.yAxis.scale(payload.close);
              const highY = props.yAxis.scale(payload.high);
              const lowY = props.yAxis.scale(payload.low);

              const color = payload.close > payload.open ? "#22c55e" : "#ef4444";

              return (
                <g>
                  {/* Wick */}
                  <line
                    x1={x + width / 2}
                    x2={x + width / 2}
                    y1={highY}
                    y2={lowY}
                    stroke={color}
                  />
                  {/* Body */}
                  <rect
                    x={x + width / 4}
                    width={width / 2}
                    y={Math.min(openY, closeY)}
                    height={Math.abs(closeY - openY) || 1}
                    fill={color}
                  />
                </g>
              );
            }}
          />
        </ComposedChart>
      ) : (
        <ReLineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis
            dataKey="time"
            tickFormatter={formatDate}
            minTickGap={20}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => `${currency} ${v.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value) => `${currency} ${value.toLocaleString()}`}
            labelFormatter={(time) => new Date(time).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </ReLineChart>
      )}
    </ResponsiveContainer>
  );
};

export default CoinChart;
