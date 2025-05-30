import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { AiOutlinePlus } from 'react-icons/ai';

const mockData = {
  campaigns: [
    {
      name: "Summer Campaign",
      description: "Summer sales promotion",
      targetedAudience: "Youth 18-25",
      category: ["retail", "fashion"],
      isActive: true,
      tweets: ["tweet1", "tweet2"]
    },
    // ...add more mock campaigns
  ],
  stats: [
    { name: 'Jan', followers: 400 },
    { name: 'Feb', followers: 600 },
    { name: 'Mar', followers: 800 },
    { name: 'Apr', followers: 1000 },
  ],
  complaints: [
    { id: 1, name: "Issue #1", description: "Service complaint" },
    { id: 2, name: "Issue #2", description: "Content complaint" },
  ]
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-purple-500/30">
        <h1 className="text-2xl font-bold text-purple-100 flex items-center gap-2">
          <span>🎯 Campaign Dashboard</span>
        </h1>
      </div>

      {/* Upper Section - Campaigns */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold text-purple-100 mb-4 flex items-center gap-2">
          <span>📢 Active Campaigns</span>
          <span className="text-sm text-purple-400 bg-purple-950 px-3 py-1 rounded-full">
            {mockData.campaigns.length} Active
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {mockData.campaigns.map((campaign, index) => (
            <Card 
              key={index}
              className="hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer bg-gray-900 border border-purple-500/20 group"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-purple-100 group-hover:text-purple-300 transition-colors">
                    {campaign.name}
                  </h3>
                  <span className="text-xl">🚀</span>
                </div>
                <p className="text-sm text-gray-400">{campaign.description}</p>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span>👥</span> {campaign.targetedAudience}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-purple-300 flex items-center gap-2">
                    <span>⚡</span> Status
                  </span>
                  <Switch checked={campaign.isActive} />
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer bg-gray-900/50 border border-purple-500/20 flex items-center justify-center group">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <AiOutlinePlus size={40} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="text-sm text-purple-300">Add Campaign</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lower Section */}
      <div className="flex-1 p-6 flex gap-6">
        {/* Statistics Section */}
        <div className="flex-1">
          <Card className="bg-gray-900 border border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-purple-100 flex items-center gap-2">
                <span>📊</span> Performance Analytics
              </h3>
              <LineChart width={500} height={300} data={mockData.stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827',
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                    borderRadius: '6px'
                  }}
                />
                <Line type="monotone" dataKey="followers" stroke="#8B5CF6" />
              </LineChart>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Followers</p>
                  <p className="text-xl text-purple-300">👥 1,000</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Reach</p>
                  <p className="text-xl text-purple-300">🎯 5,000</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Engagement</p>
                  <p className="text-xl text-purple-300">⚡ 3.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Section */}
        <div className="flex-1">
          <Card className="bg-gray-900 border border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-purple-100 flex items-center gap-2">
                <span>🔔</span> Recent Issues
              </h3>
              {mockData.complaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className="mt-2 p-4 border border-purple-500/20 rounded-md bg-gray-800 hover:bg-gray-800/80 transition-colors group"
                >
                  <h4 className="font-medium text-purple-200 flex items-center gap-2">
                    <span>⚠️</span> {complaint.name}
                  </h4>
                  <p className="text-sm text-gray-400 mt-2">{complaint.description}</p>
                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-purple-400 bg-purple-950/50 px-2 py-1 rounded-full">
                      Pending Review
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;