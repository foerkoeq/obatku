"use client"

import { useConfig } from "@/hooks/use-config";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RevenueBarChartProps {
  height?: number;
  chartType?: "bar" | "area";
  series?: any[];
  chartColors?: string[]
}
const defaultSeries = [{
  name: "Net Profit",
  data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
},
{
  name: "Revenue",
  data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
},
{
  name: "Free Cash Flow",
  data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
}]
const RevenueBarChart = ({
  height = 400,
  chartType = "bar",
  series = defaultSeries,
  chartColors = ["#4669FA", "#0CE7FA", "#FA916B"]

}: RevenueBarChartProps) => {
  const [config] = useConfig();
  const { isRtl } = config;
  const t = useTranslations("AnalyticsDashboard");
  const { theme: mode } = useTheme();
  const options: any = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "45%",
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontFamily: "Inter",
      offsetY: -30,
      markers: {
        width: 8,
        height: 8,
        offsetY: -1,
        offsetX: -5,
        radius: 12,
      },
      labels: {
        colors: mode === "dark" ? "#CBD5E1" : "#475569",
      },
      itemMargin: {
        horizontal: 18,
        vertical: 0,
      },
    },
    title: {
      text: `${t("revenue_report")}`,
      align: "left",
      offsetY: 13,
      offsetX: isRtl ? "0%" : 0,
      floating: false,
      style: {
        fontSize: "20px",
        fontWeight: "500",
        fontFamily: "Inter",
        color: mode === "dark" ? "#fff" : "#0f172a",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      labels: {
        style: {
          colors: mode === "dark" ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
    xaxis: {
      categories: [
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
      ],
      labels: {
        style: {
          colors: mode === "dark" ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },

    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return "$ " + val + " thousands";
        },
      },
    },
    colors: chartColors,
    grid: {
      show: false,
      borderColor: mode === "dark" ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
      position: "back",
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: "bottom",
            offsetY: 8,
            horizontalAlign: "center",
          },
          plotOptions: {
            bar: {
              columnWidth: "80%",
            },
          },
        },
      },
    ],
  };
  return (
    <Chart
      options={options}
      series={series}
      type={chartType}
      height={height}
      width={"100%"}
    />
  );
};

export default RevenueBarChart;
