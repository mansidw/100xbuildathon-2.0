import PropTypes from "prop-types";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { Card, CardContent } from "@/components/ui/card";

const chartTypes = {
  bar: (data) => ({
    chart: {
      type: "bar",
      backgroundColor: "transparent",
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    title: {
      text: data.title || "Bar Chart",
      style: {
        color: "#FFFFFF",
      },
    },
    xAxis: {
      categories: data.categories,
      title: {
        text: null,
      },
      labels: {
        style: {
          color: "#808080",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: data.yAxisTitle || "Value",
        style: {
          color: "#808080",
        },
      },
      labels: {
        style: {
          color: "#808080",
        },
      },
      gridLineColor: "#80808020",
    },
    series: data.series,
    legend: {
      itemStyle: {
        color: "#808080",
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          style: {
            color: "#FFFFFF",
          },
        },
      },
    },
  }),

  pie: (data) => ({
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    title: {
      text: data.title || "Pie Chart",
      style: {
        color: "#FFFFFF",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          style: {
            color: "#FFFFFF",
          },
        },
      },
    },
    series: [
      {
        name: data.seriesName || "Share",
        colorByPoint: true,
        data: data.data,
      },
    ],
    legend: {
      itemStyle: {
        color: "#808080",
      },
    },
  }),

  line: (data) => ({
    chart: {
      type: "line",
      backgroundColor: "transparent",
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    title: {
      text: data.title || "Line Chart",
      style: {
        color: "#FFFFFF",
      },
    },
    xAxis: {
      categories: data.categories,
      labels: {
        style: {
          color: "#808080",
        },
      },
    },
    yAxis: {
      title: {
        text: data.yAxisTitle || "Value",
        style: {
          color: "#808080",
        },
      },
      labels: {
        style: {
          color: "#808080",
        },
      },
      gridLineColor: "#80808020",
    },
    series: data.series,
    legend: {
      itemStyle: {
        color: "#808080",
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          style: {
            color: "#FFFFFF",
          },
        },
      },
    },
  }),
};

const InsightsDashboard = (props) => {
  const { charts } = props;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {charts.map((chartConfig, index) => {
        const getOptions = chartTypes[chartConfig.type];
        if (!getOptions) return null;
        const options = getOptions(chartConfig.data);
        const title = chartConfig.data.title || "Chart";

        return (
          <Card
            key={index}
            className="rounded-2xl shadow-md hover:shadow-xl transition-shadow bg-[#000000] border border-[#808080]/20"
          >
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-[#FFFFFF] mb-4">
                {title}
              </h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  ...options,
                  title: { text: null }, // Remove the chart title
                  credits: { enabled: false }, // Hide Highcharts.com label
                }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

InsightsDashboard.propTypes = {
  charts: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      data: PropTypes.shape({
        title: PropTypes.string,
        categories: PropTypes.arrayOf(PropTypes.string),
        yAxisTitle: PropTypes.string,
        series: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string,
            data: PropTypes.arrayOf(PropTypes.number),
          })
        ),
        seriesName: PropTypes.string,
        data: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string,
            y: PropTypes.number,
          })
        ),
      }).isRequired,
    })
  ).isRequired,
};

export default InsightsDashboard;