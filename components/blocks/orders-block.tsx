"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"));
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
interface OrdersnBlockProps {
  className?: string;
  series?: number[];
  chartColor?: string;
  chartType?: 'area' | 'bar' | 'line' | 'pie' | 'donut' | 'radialBar'
  opacity?: number,
  title?: string,
  total?: number | string,
  height?: number,
  percentageContent?: React.ReactNode
}

const OrdersBlock = ({
  series = [15, 30, 15, 30, 20, 35],
  chartColor = "#0f172a",
  chartType = "bar",
  opacity = 1,
  className,
  title = "Order Block",
  total,
  height = 42,
  percentageContent = <span className="text-warning">-60% </span>
}: OrdersnBlockProps) => {
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
      }
    },

    plotOptions: {
      bar: {
        columnWidth: "60%",
        barHeight: "100%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      curve: "straight",
    },
    markers: {
      size: 3,
      colors: chartColor,
      strokeColors: chartColor,
      strokeWidth: 2,
      shape: "circle",
      radius: 2,
      hover: {
        sizeOffset: 1,
      },
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
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 ">
        {
          title && (
            <div className="text-sm text-default-600 mb-1.5">
              {title}
            </div>
          )
        }
        {total && (
          <div className="text-lg text-default-900 font-medium mb-1.5">
            {total}
          </div>
        )
        }
        <div className="font-normal text-xs text-default-600">
          {percentageContent}
        <span className="ms-1">From last Week</span>
        </div>
        <div className="mt-5">
          <Chart
            options={options}
            series={chartSeries}
            type={chartType}
            height={height}
            width={"100%"}
          />
        </div>
      </CardContent>
    </Card >
  );
};

export default OrdersBlock;