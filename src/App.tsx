"use client";

import * as React from "react";
import { Area, AreaChart, Brush, CartesianGrid, XAxis, YAxis } from "recharts";

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

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  value: {
    label: "Value",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function App() {
  const [data, setData] = React.useState<
    { time: string; value: number; timestamp: number }[]
  >([]);
  const [range, setRange] = React.useState<[number, number] | null>(null);
  const [visibleDomain, setVisibleDomain] = React.useState<[number, number]>();
  // const [chartTransition, setChartTransition] = React.useState(true);
  // const dataChunk = range ? data.slice(...range) : data;
  const chartRef = React.useRef<HTMLDivElement>(null);
  const SCALE_RATIO = 20;

  const handleZoomIn = (e: Parameters<typeof handleWheel>[0]) => {
    if (!range || !chartRef.current) return;
    console.log("zoom in");

    console.log("visibleDomain: ", visibleDomain);

    const { clientX } = e;
    const mainChartBouding = chartRef.current
      .querySelector(".recharts-area")
      ?.getBoundingClientRect();

    if (!mainChartBouding) return;

    const { width, left } = mainChartBouding;
    const widthLeft = clientX - left;
    const leftRatio = widthLeft / width;
    const rightRatio = 1 - leftRatio;
    const currentLength = range[1] - range[0];
    const start = Math.min(
      range[0] + Math.floor((currentLength * leftRatio) / SCALE_RATIO),
      data.length - 2
    );
    const end = Math.max(
      0,
      range[1] - Math.floor((currentLength * rightRatio) / SCALE_RATIO)
    );

    if (start >= end) return;
    setRange([start, end]);
    setVisibleDomain([data[start].timestamp, data[end].timestamp]);
  };

  const handleZoomOut = (e: Parameters<typeof handleWheel>[0]) => {
    if (!range || !chartRef.current) return;
    console.log("zoom out");

    const { clientX } = e;
    const mainChartBouding = chartRef.current
      .querySelector(".recharts-area")
      ?.getBoundingClientRect();

    if (!mainChartBouding) return;

    const { width, left } = mainChartBouding;
    const widthLeft = clientX - left;
    const leftRatio = widthLeft / width;
    const rightRatio = 1 - leftRatio;

    const start = Math.max(
      0,
      range[0] - Math.floor((data.length * leftRatio) / SCALE_RATIO)
    );
    const end = Math.min(
      range[1] + Math.floor((data.length * rightRatio) / SCALE_RATIO),
      data.length - 1
    );

    setRange([start, end]);
    setVisibleDomain([data[start].timestamp, data[end].timestamp]);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // setChartTransition(false);
    if (e.deltaY > 0) {
      handleZoomOut(e);
    } else if (e.deltaY < 0) {
      handleZoomIn(e);
    }
  };

  React.useEffect(() => {
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
                // const date = new Date(Number(value));
                return value;
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
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-value)"
              stackId="a"
              isAnimationActive={true} // <-- FORCES SMOOTH TRANSITION
              animationDuration={500}
            />

            {/* <Brush
              dataKey="time"
              height={30}
              stroke="#8884d8"
              // optional: define initial selection
              // startIndex={0}
              // endIndex={fullData.length - 1}
            /> */}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
