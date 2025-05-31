import PropTypes from "prop-types";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { Card, CardContent } from "@/components/ui/card";

const chartTypes = {
  bar: (data) => ({
    chart: {
      type: "bar",
    },
    title: {
      text: data.title || "Bar Chart",
    },
    xAxis: {
      categories: data.categories,
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: data.yAxisTitle || "Value",
      },
    },
    series: data.series,
  }),

  pie: (data) => ({
    chart: {
      type: "pie",
    },
    title: {
      text: data.title || "Pie Chart",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
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
  }),

  line: (data) => ({
    chart: {
      type: "line",
    },
    title: {
      text: data.title || "Line Chart",
    },
    xAxis: {
      categories: data.categories,
    },
    yAxis: {
      title: {
        text: data.yAxisTitle || "Value",
      },
    },
    series: data.series,
  }),
};

const InsightsDashboard = (props) => {
  const { charts } = props;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-lg shadow-lg">
      {charts.map((chartConfig, index) => {
        const getOptions = chartTypes[chartConfig.type];
        if (!getOptions) return null;
        const options = getOptions(chartConfig.data);
        const title = chartConfig.data.title || "Chart";

        return (
          <Card
            key={index}
            className="rounded-2xl shadow-md hover:shadow-xl transition-shadow bg-gray-50 border border-gray-200"
          >
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
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