"use client"
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
const Chart = dynamic(() => import("react-apexcharts"));
interface StatsBlock {
  className?: string;
  title: string;
  total?: number | string;
  series?: number[];
  chartColor?: string;
  chartType?: 'area' | 'bar' | 'line' | 'pie' | 'donut' | 'radialBar';
  opacity?: number
}

const defaultData = [800, 600, 1000, 800, 600, 1000, 800, 900];


const StatisticsBlock = ({
  title = " Static Block",
  total,
  className,
  series = defaultData,
  chartColor = "#00EBFF",
  chartType = "area",
  opacity = 0.1

}: StatsBlock) => {
  const { theme: mode } = useTheme();
  const chartSeries = [
    {
      data: series
    }
  ];

  const options: any = {
    chart: {
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: [chartColor],

    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: "solid",
      opacity: [opacity],
    },
    legend: {
      show: false,
    },
    xaxis: {
      low: 0,
      offsetX: 0,
      offsetY: 0,
      show: false,
      labels: {
        low: 0,
        offsetX: 0,
        show: false,
      },
      axisBorder: {
        low: 0,
        offsetX: 0,
        show: false,
      }
    }
  };
  return (
    <Card className={cn("  ", className)}>
      <CardContent className=" py-[18px] px-4 ">

        <div className="flex gap-6">
          <div className="flex-none">
            <Chart
              options={options}
              series={chartSeries}
              type={chartType}
              height={48}
              width={48}
            />
          </div>
          <div className="flex-1">
            <div className="text-default-800  text-sm mb-1 font-medium">
              {title}
            </div>
            <div className="text-default-900  text-lg font-medium">
              {total}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { StatisticsBlock };