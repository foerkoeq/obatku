export const getYAxisConfig = (colors: any) => ({
  labels: getLabel(colors),
});



export const getXAxisConfig = (colors: string): { } => ({
  categories: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  labels: getLabel(colors),
  axisBorder: {
    show: false,
  },
  axisTicks: {
    show: false,
  },
});

export const getLabel = (colors:any): {  } => ({
  style: {
    colors: colors,
    fontFamily: "Inter",
  },
});


export const getGridConfig = (): { show: boolean; borderColor: string; strokeDashArray: number; position: string; } => ({
  show: false,
  borderColor: 'transparent',
  strokeDashArray: 10,
  position: "back",
});