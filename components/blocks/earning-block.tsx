"use client"
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
interface EarningBlockProps {
  title?: string,
  className?: string;
  colors?: string[];
  series?: number[];
  labels?: string[];
  height?: number;
  chartType?: 'donut' | 'pie' | 'radialBar';
  total?: number | string;
  percentage?: string;
}

const EarningBlock = ({
  title = "Earnings",
  total = "$0",
  percentage = "+08%",
  series = [70, 30],
  chartType = "donut",
  height = 150,
  labels = ["Success", "Return"],
  colors = ["#ffbf99", "#5cffff"],
  className = "",
}: EarningBlockProps) => {
  const { theme: mode } = useTheme();
  const options: any = {
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    colors: [...colors],
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Outfit",
      fontWeight: 400,
      labels: {
        colors: mode === "dark" ? "#cbd5e1" : "#0f172a",
    }
    },

    plotOptions: {
      pie: {
        donut: {
          size: "70%",
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
    const t = useTranslations("EcommerceDashboard");
  return (
    <Card className={cn("", className)}>
      <CardContent className="py-3 px-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <div className="text-sm md:text-base text-default-600 mb-1.5">{title}</div>
            <div className="text-lg md:text-xl text-default-900 font-medium mb-1.5">
              {total}
            </div>
            <div className="font-normal text-xs md:text-sm text-default-600 whitespace-nowrap">
              <span className="text-primary me-1">{percentage}</span>
              {t("statistics_graph_desc")}
            </div>
          </div>

          <div className="flex-none w-full md:w-[120px]">
            <Chart options={options} series={series} type={chartType} height={height} width={"100%"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningBlock;