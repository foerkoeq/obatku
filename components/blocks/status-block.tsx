"use client"
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
const Chart = dynamic(() => import("react-apexcharts"));
import { useTheme } from "next-themes";
interface StatusBlockProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  total?: number | string;
  series?: number[];
  chartColor?: string;
  iconWrapperClass?: string;
  chartType?: 'area' | 'bar' | 'line' | 'pie' | 'donut' | 'radialBar'
  reverse?: boolean
  opacity?: number
}

const StatusBlock = ({
  title,
  total,
  className,
  icon,
  series = [800, 600, 1000, 800, 600, 1000, 800, 900],
  chartColor = "#0ce7fa",
  iconWrapperClass,
  chartType = "area",
  reverse = false,
  opacity = 0.1
}: StatusBlockProps) => {
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
    <Card className={cn('', className,)}>
      <CardContent className="p-4">
        <div className={cn('flex gap-3', {
          'flex-row-reverse': reverse
        })}>
          {
            icon &&
            <div className="flex-none">
              <div
                className={cn("h-12 w-12 rounded-full flex flex-col items-center justify-center text-2xl bg-default/10", iconWrapperClass)}
              >
                {icon}
              </div>
            </div>
          }

          {(title || total) && (
            <div className="flex-1">
              {title && (
                <div className="text-default-600 text-sm font-medium">
                  {title}
                </div>
              )}
              {total && (
                <div className="text-default-900 text-lg font-medium">
                  {total}
                </div>
              )}
            </div>
          )}

        </div>
        <div className="ms-auto max-w-[124px]">
          <Chart
            options={options}
            series={chartSeries}
            type={chartType}
            height={41}
            width={124}
          />
        </div>
      </CardContent>
    </Card >

  );
};

export { StatusBlock };