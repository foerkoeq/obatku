"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Card, CardContent } from "../ui/card";

interface ProgressBlockProps {
  title?: string,
  className?: string;
  colors?: string[];
  series?: number[];
  labels?: string[];
  height?: number;
  chartType?: 'donut' | 'pie' | 'radialBar';
}

const ProgressBlock = ({
  className,
  height = 200,
  title,
  labels = ["Complete", "Left"],
  series = [70, 30],
  chartType = "donut",
  colors = ["#0CE7FA", "#E2F6FD"] }: ProgressBlockProps) => {
  const { theme: mode } = useTheme();

  const options: any = {
    labels: labels,
    dataLabels: {
      enabled: false,
    },

    colors: [...colors],
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Outfit",
      fontWeight: 400,
      show: false,
    },
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "40%",
          labels: {
            show: true,
            name: {
              show: false,
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Inter",
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit",
              color: mode === "dark" ? "#cbd5e1" : "#0f172a",
              formatter(val: string) {
                return `${parseInt(val)}%`;
              },
            },
            total: {
              show: true,
              fontSize: "10px",
              label: "",
              formatter() {
                return "70";
              }
            }
          }
        }
      }
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="py-[18px] px-4">
        {
          title &&
          <div className="text-default-500 dark:text-default-900  text-sm font-medium mb-3">
            {title}
          </div>
        }
        <Chart
          options={options}
          series={series}
          type={chartType}
          height={height}
          width={"100%"}
        />
      </CardContent>
    </Card>
  );
};

export default ProgressBlock;

