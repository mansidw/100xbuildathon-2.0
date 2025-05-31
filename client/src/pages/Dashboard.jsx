import InsightsDashboard from "@/components/InsightsDashboard/InsightsDashboard";

const mockChartData = [
  {
    type: "bar",
    data: {
      title: "Revenue by Region",
      categories: ["North", "South", "East", "West"],
      yAxisTitle: "Revenue (in millions)",
      series: [
        {
          name: "2023",
          data: [29.9, 71.5, 106.4, 129.2],
        },
      ],
    },
  },
  {
    type: "pie",
    data: {
      title: "Market Share",
      seriesName: "Brands",
      data: [
        { name: "Brand A", y: 61.41 },
        { name: "Brand B", y: 11.84 },
        { name: "Brand C", y: 10.85 },
        { name: "Others", y: 15.9 },
      ],
    },
  },

  {
    type: "line",
    data: {
      title: "Monthly Sales",
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
      yAxisTitle: "Sales (in units)",
      series: [
        {
          name: "Product A",
          data: [150, 200, 170, 220, 190],
        },
        {
          name: "Product B",
          data: [100, 140, 110, 160, 130],
        },
      ],
    },
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Insights Dashboard
      </h1>
      <InsightsDashboard charts={mockChartData} />
    </div>
  );
};

export default Dashboard;
