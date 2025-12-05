"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { data as sampleData } from "./data/data";
import { lttbDownsample } from "./utils/downsampling-algorithm";
import { useEffect, useRef, useState } from "react";

export const description = "An interactive area chart";

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function App() {
  const [data, setData] = useState<typeof sampleData & { timestamp: number }[]>(
    []
  );
  const [range, setRange] = useState<[number, number] | null>(null);
  const [visibleDomain, setVisibleDomain] = useState<[number, number]>();
  const chartRef = useRef<HTMLDivElement>(null);
  const SCALE_RATIO = 0.95;

  const handleZoomIn = (e: Parameters<typeof handleWheel>[0]) => {
    if (!range || !chartRef.current) return;

    console.log("zoom in");

    const { clientX } = e;
    const mainChartBouding = chartRef.current
      .querySelector(".recharts-cartesian-grid")
      ?.getBoundingClientRect();

    if (!mainChartBouding) return;

    const { width, left } = mainChartBouding;
    const currentLength = range[1] - range[0];
    const mouseXRatio = Math.abs(clientX - left) / width;
    const currentCursorIdx = Math.floor(currentLength * mouseXRatio) + range[0];
    const newLength = Math.floor(currentLength * SCALE_RATIO); // newLength = current * scale. e.g: newLength = 100 * 0.8 = 80
    const newCursorIdx = Math.floor(newLength * mouseXRatio);
    const newStart = Math.max(0, currentCursorIdx - newCursorIdx);
    const newEnd = Math.min(data.length - 1, newStart + newLength);

    if (newEnd - newStart < 1) return;

    console.log("newStart: ", newStart);
    console.log("newEnd: ", newEnd);

    setRange([newStart, newEnd]);
    setVisibleDomain([data[newStart].timestamp, data[newEnd].timestamp]);
  };

  const handleZoomOut = (e: Parameters<typeof handleWheel>[0]) => {
    if (!range || !chartRef.current) return;

    console.log("zoom out");

    let newStart: number, newEnd: number;
    const { clientX } = e;
    const mainChartBouding = chartRef.current
      .querySelector(".recharts-cartesian-grid")
      ?.getBoundingClientRect();

    if (!mainChartBouding) return;

    const { width, left } = mainChartBouding;
    const currentLength = range[1] - range[0];
    const mouseXRatio = Math.abs(clientX - left) / width;

    const currentCursorIdx = Math.floor(currentLength * mouseXRatio) + range[0];
    const newLength = Math.floor(currentLength / SCALE_RATIO); // newLength = current / scale. e.g: newLength = 80 / 0.8 = 100
    const newCursorIdx = Math.floor(newLength * mouseXRatio);
    newStart = Math.max(0, currentCursorIdx - newCursorIdx);
    newEnd = Math.min(data.length - 1, newStart + newLength);

    if (newEnd - newStart > data.length) return;

    // when too small then scale_ratio can choose correct new chunk.
    // E.g: [10, 11] -> length = 1, scale = 0.8. floor(1 * 0.8) = still 1 [not good]
    // Then we will calculate normally, zoom out max 10 points on each side
    if (newStart === range[0] && newEnd === range[1]) {
      newStart = Math.max(
        0,
        range[0] - Math.min(10, Math.floor(data.length * 0.1))
      );

      newEnd = Math.min(
        data.length - 1,
        range[1] + Math.min(10, Math.floor(data.length * 0.1))
      );
    }

    console.log("newStart: ", newStart);
    console.log("newEnd: ", newEnd);

    setRange([newStart, newEnd]);
    setVisibleDomain([data[newStart].timestamp, data[newEnd].timestamp]);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) {
      handleZoomOut(e);
    } else if (e.deltaY < 0) {
      handleZoomIn(e);
    }
  };

  useEffect(() => {
    const downsampledData = lttbDownsample(sampleData, 1000);
    const process = downsampledData.map((d) => ({
      ...d,
      timestamp: new Date(d.time).getTime(),
    }));

    setData(process);
    setRange([0, process.length]);
    setVisibleDomain([
      process[0].timestamp,
      process[process.length - 1].timestamp,
    ]);

    console.log(process[0].timestamp, process[process.length - 1].timestamp);
  }, []);

  return (
    <Card className="m-5 pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full abc"
          onWheel={handleWheel}
          ref={chartRef}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return new Date(value).toLocaleString();
              }}
              domain={visibleDomain}
              allowDataOverflow={true}
              type="number"
            />
            <YAxis
              dataKey={"value"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleTimeString("en-US");
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="linear"
              fill="url(#fillMobile)"
              stroke="var(--color-value)"
              stackId="a"
            />

            {/* <Brush
              dataKey="timestamp"
              height={30}
              stroke="#8884d8"
              startIndex={range?.[0]}
              endIndex={range?.[1]}
            /> */}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
