"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  FolderOpen, 
  Target, 
  Award,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Building2,
  Globe,
  LineChart
} from "lucide-react";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import {
  AnalyticsLineChart,
  AnalyticsBarChart,
  AnalyticsPieChart,
  ActivityTimelineChart,
  ChartContainer,
  ChartHeader,
  ChartEmptyState,
  ChartLoadingState
} from "@/components/charts/ChartComponents";

const AdminAnalyticsNew = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const { data: analyticsData, loading, error } = useAnalytics(selectedTimeRange);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer><ChartLoadingState /></ChartContainer>
          <ChartContainer><ChartLoadingState /></ChartContainer>
          <ChartContainer><ChartLoadingState /></ChartContainer>
          <ChartContainer><ChartLoadingState /></ChartContainer>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartEmptyState 
          icon={BarChart3}
          title="Failed to load analytics"
          description={error}
        />
      </ChartContainer>
    );
  }

  const timeRanges = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-rscm-dark-purple mb-2">
              Analytics & Reports
            </h1>
            <p className="text-gray-600">
              System insights and performance trends
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-rscm-violet/10 text-rscm-violet rounded-lg hover:bg-rscm-violet/20 transition-colors">
              <Download size={16} />
              Export Report
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedTimeRange === range.value
                      ? "bg-rscm-violet text-white"
                      : "text-gray-600 hover:text-rscm-violet"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rscm-violet/10">
              <Users size={20} className="text-rscm-violet" />
            </div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {analyticsData?.summary?.totalUsers || 0}
            </div>
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rscm-plum/10">
              <FolderOpen size={20} className="text-rscm-plum" />
            </div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {analyticsData?.summary?.totalProjects || 0}
            </div>
          </div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rscm-lilac/10">
              <Award size={20} className="text-rscm-lilac" />
            </div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {analyticsData?.summary?.totalSkills || 0}
            </div>
          </div>
          <div className="text-sm text-gray-600">Skills Tracked</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rscm-dark-purple/10">
              <Target size={20} className="text-rscm-dark-purple" />
            </div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {analyticsData?.summary?.avgUtilization || 0}%
            </div>
          </div>
          <div className="text-sm text-gray-600">Avg Utilization</div>
        </div>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Growth Timeline */}
        <ChartContainer>
          <ChartHeader 
            title="User Growth Over Time" 
            subtitle="New user registrations"
            actions={<LineChart size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.userGrowthData ? (
            <AnalyticsLineChart 
              data={analyticsData.userGrowthData}
              height={300}
              showLegend={false}
            />
          ) : (
            <ChartEmptyState 
              icon={LineChart}
              title="No user data available"
              description="User growth data will appear here as users register"
            />
          )}
        </ChartContainer>

        {/* Project Creation Timeline */}
        <ChartContainer>
          <ChartHeader 
            title="Project Creation Timeline" 
            subtitle="New projects over time"
            actions={<BarChart3 size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.projectTimelineData ? (
            <AnalyticsLineChart 
              data={analyticsData.projectTimelineData}
              height={300}
              showLegend={false}
            />
          ) : (
            <ChartEmptyState 
              icon={BarChart3}
              title="No project data available"
              description="Project timeline will appear here as projects are created"
            />
          )}
        </ChartContainer>

        {/* Skills Distribution Bar Chart */}
        <ChartContainer>
          <ChartHeader 
            title="Top Skills Distribution" 
            subtitle="Most in-demand skills (current vs desired)"
            actions={<BarChart3 size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.skillsChartData?.labels?.length > 0 ? (
            <AnalyticsBarChart 
              data={analyticsData.skillsChartData}
              height={350}
              showLegend={true}
            />
          ) : (
            <ChartEmptyState 
              icon={Award}
              title="No skills data available"
              description="Skills distribution will appear here as users add skills to their profiles"
            />
          )}
        </ChartContainer>

        {/* Skills by Category Pie Chart */}
        <ChartContainer>
          <ChartHeader 
            title="Skills by Category" 
            subtitle="Distribution across skill categories"
            actions={<PieChart size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.skillsCategoryData?.labels?.length > 0 ? (
            <AnalyticsPieChart 
              data={analyticsData.skillsCategoryData}
              height={350}
              showLegend={true}
            />
          ) : (
            <ChartEmptyState 
              icon={PieChart}
              title="No category data available"
              description="Skills categories will appear here as skills are organized"
            />
          )}
        </ChartContainer>

        {/* Department Distribution */}
        <ChartContainer>
          <ChartHeader 
            title="Users by Department" 
            subtitle="Team distribution across departments"
            actions={<Building2 size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.departmentData?.labels?.length > 0 ? (
            <AnalyticsPieChart 
              data={analyticsData.departmentData}
              height={350}
              showLegend={true}
              doughnut={true}
            />
          ) : (
            <ChartEmptyState 
              icon={Building2}
              title="No department data available"
              description="Department distribution will appear here as users are assigned to departments"
            />
          )}
        </ChartContainer>

        {/* Project Status Distribution */}
        <ChartContainer>
          <ChartHeader 
            title="Project Status Overview" 
            subtitle="Current project status distribution"
            actions={<Target size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.projectStatusData?.labels?.length > 0 ? (
            <AnalyticsPieChart 
              data={analyticsData.projectStatusData}
              height={350}
              showLegend={true}
            />
          ) : (
            <ChartEmptyState 
              icon={Target}
              title="No project status data available"
              description="Project status distribution will appear here as projects are created"
            />
          )}
        </ChartContainer>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Request Processing Efficiency */}
        <ChartContainer>
          <ChartHeader 
            title="Request Processing Efficiency" 
            subtitle="Time to process resource requests"
            actions={<Activity size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.requestEfficiencyData?.labels?.length > 0 ? (
            <AnalyticsBarChart 
              data={analyticsData.requestEfficiencyData}
              height={300}
              showLegend={false}
            />
          ) : (
            <ChartEmptyState 
              icon={Activity}
              title="No request data available"
              description="Request processing times will appear here as requests are processed"
            />
          )}
        </ChartContainer>

        {/* System Activity Timeline */}
        <ChartContainer>
          <ChartHeader 
            title="System Activity Timeline" 
            subtitle="Daily activity across the system"
            actions={<TrendingUp size={20} className="text-rscm-violet" />}
          />
          {analyticsData?.activityTimelineData?.labels?.length > 0 ? (
            <ActivityTimelineChart 
              data={analyticsData.activityTimelineData}
              height={300}
            />
          ) : (
            <ChartEmptyState 
              icon={TrendingUp}
              title="No activity data available"
              description="System activity will appear here as users interact with the platform"
            />
          )}
        </ChartContainer>
      </div>

      {/* User Utilization Chart */}
      <ChartContainer>
        <ChartHeader 
          title="Team Utilization Overview" 
          subtitle="Individual user utilization levels (based on current allocations)"
          actions={<Target size={20} className="text-rscm-violet" />}
        />
        {analyticsData?.utilizationData?.labels?.length > 0 ? (
          <>
            <AnalyticsBarChart 
              data={analyticsData.utilizationData}
              height={380}
              showLegend={false}
            />
            {/* RSCM Color Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rscm-dark-purple"></div>
                  <span className="text-gray-600">Low (&lt;60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rscm-violet"></div>
                  <span className="text-gray-600">Optimal (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rscm-lilac"></div>
                  <span className="text-gray-600">High (80-90%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rscm-plum"></div>
                  <span className="text-gray-600">Overloaded (90%+)</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ChartEmptyState 
            icon={Target}
            title="No utilization data available"
            description="User utilization will appear here as allocations are created"
          />
        )}
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      </div>

      {/* Google Analytics Placeholder */}
      <ChartContainer>
        <ChartHeader 
          title="Website Traffic Analytics" 
          subtitle="Google Analytics integration placeholder"
          actions={<Globe size={20} className="text-rscm-violet" />}
        />
        <ChartEmptyState 
          icon={Globe}
          title="Google Analytics Integration"
          description="Website traffic data, page views, user sessions, and conversion metrics will appear here when Google Analytics is integrated"
        />
      </ChartContainer>
    </div>
  );
};

export default AdminAnalyticsNew;