import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, CheckCircle, Utensils, ArrowUpRight, ArrowDownRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const dashboardTooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  color: "#111827",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.16)",
};
const dashboardTooltipLabelStyle = { color: "#374151", fontWeight: 600 };
const dashboardTooltipItemStyle = { color: "#111827" };

// Shape of the data returned by GET /api/dashboard/stats
interface DashboardStats {
  todaySales: number;
  salesChange: number;
  todayOrders: number;
  ordersChange: number;
  todayCustomers: number;
  customersChange: number;
  avgOrderValue: number;
  hourlyData: { hour: string; orders: number; revenue: number }[];
  weeklyData: { day: string; sales: number; orders: number }[];
  categoryData: { name: string; value: number }[];
  paymentData: { name: string; value: number; color: string }[];
  topItems: { name: string; orders: number; revenue: number }[];
  quickStats: {
    completed: number;
    pending: number;
    occupiedTables: number;
    totalTables: number;
    avgPrepTime: number;
  };
  recentOrders: { invoiceNumber: string; table: string; createdAt: string; status: string; total: number }[];
}

// Browser's UTC offset in minutes east of UTC (positive east). The server uses
// this so "today" means the same day the cashier is looking at.
const tzOffset = -new Date().getTimezoneOffset();

export default function DashboardPage() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats', tzOffset],
    queryFn: () =>
      fetch(`/api/dashboard/stats?tzOffset=${tzOffset}`).then((r) => r.json()),
    refreshInterval: 30000,
  });

  const todaysSales = stats?.todaySales ?? 0;
  const todayOrders = stats?.todayOrders ?? 0;
  const todayCustomers = stats?.todayCustomers ?? 0;
  const avgOrderValue = stats?.avgOrderValue ?? 0;
  const quick = stats?.quickStats;

  const hourlyData = stats?.hourlyData ?? [];
  const weeklyData = stats?.weeklyData ?? [];
  const categoryData = (stats?.categoryData ?? []).map((c, i) => ({
    ...c,
    color: COLORS[i % COLORS.length],
  }));
  const paymentData = stats?.paymentData ?? [];
  const topItems = stats?.topItems ?? [];
  const recentOrders = (stats?.recentOrders ?? []).map((o) => ({
    ...o,
    time: getTimeAgo(o.createdAt),
    table: o.table,
  }));

  function getTimeAgo(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-red-500 text-white',
      preparing: 'bg-amber-500 text-white',
      ready: 'bg-green-500 text-white',
      served: 'bg-blue-500 text-white',
      completed: 'bg-gray-500 text-white',
      paid: 'bg-gray-500 text-white',
      sent_to_kitchen: 'bg-amber-500 text-white',
      ready_to_bill: 'bg-green-500 text-white',
      billed: 'bg-blue-500 text-white',
    };
    const label: Record<string, string> = {
      new: 'New',
      preparing: 'Preparing',
      ready: 'Ready',
      served: 'Served',
      completed: 'Completed',
      paid: 'Paid',
      sent_to_kitchen: 'New',
      ready_to_bill: 'Ready',
      billed: 'Billed',
    };
    return (
      <Badge className={styles[status] || 'bg-gray-500 text-white'}>
        {label[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const ChangeBadge = ({ value, invert = false }: { value: number; invert?: boolean }) => {
    const up = value >= 0;
    const good = invert ? !up : up;
    const Icon = up ? ArrowUpRight : ArrowDownRight;
    return (
      <div className={`flex items-center gap-1 mt-2 text-sm ${good ? 'text-emerald-100' : 'text-red-100'}`}>
        <Icon className={`h-4 w-4 ${up ? '' : 'rotate-0'}`} />
        <span>{Math.abs(value).toFixed(1)}% from yesterday</span>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <AppHeader title="Dashboard" showSearch={false} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Today's Sales</p>
                  <h3 className="text-3xl font-bold mt-1">₹{todaysSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                  <ChangeBadge value={stats?.salesChange ?? 0} />
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Today's Orders</p>
                  <h3 className="text-3xl font-bold mt-1">{todayOrders}</h3>
                  <ChangeBadge value={stats?.ordersChange ?? 0} />
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <ShoppingCart className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Total Customers</p>
                  <h3 className="text-3xl font-bold mt-1">{todayCustomers}</h3>
                  <ChangeBadge value={stats?.customersChange ?? 0} />
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                  <h3 className="text-3xl font-bold mt-1">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                  <div className="flex items-center gap-1 mt-2 text-purple-100">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Per bill today</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Hourly Orders & Revenue Chart */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                Hourly Orders & Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#3B82F6" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={12} />
                  <Tooltip 
                    contentStyle={dashboardTooltipStyle}
                    labelStyle={dashboardTooltipLabelStyle}
                    itemStyle={dashboardTooltipItemStyle}
                    formatter={(value: number, name: string) =>
                      name === 'Revenue (₹)' ? [`₹${value.toLocaleString()}`, name] : [value, name]
                    }
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">Completed</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{quick?.completed ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">Pending</span>
                </div>
                <span className="text-2xl font-bold text-amber-600">{quick?.pending ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Utensils className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">Tables Occupied</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{quick?.occupiedTables ?? 0}/{quick?.totalTables ?? 0}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Preparation Time</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{quick?.avgPrepTime ?? 0} min</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Sales Bar Chart */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                Weekly Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={dashboardTooltipStyle}
                    labelStyle={dashboardTooltipLabelStyle}
                    itemStyle={dashboardTooltipItemStyle}
                    formatter={(value: number) => [`₹${Math.round(value).toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={dashboardTooltipStyle}
                    labelStyle={dashboardTooltipLabelStyle}
                    itemStyle={dashboardTooltipItemStyle}
                    formatter={(value: number) => [`₹${Math.round(value).toLocaleString()}`, 'Sales']}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    iconSize={8}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={dashboardTooltipStyle}
                    labelStyle={dashboardTooltipLabelStyle}
                    itemStyle={dashboardTooltipItemStyle}
                    formatter={(value: number) => [`₹${Math.round(value).toLocaleString()}`, 'Sales']}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    iconSize={8}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No sales yet</p>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                          'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.orders} units</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">₹{Math.round(item.revenue).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Invoice</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Table</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Time</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Status</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.invoiceNumber} className="border-b last:border-0">
                        <td className="py-2 px-3 font-medium">{order.invoiceNumber}</td>
                        <td className="py-2 px-3">{order.table}</td>
                        <td className="py-2 px-3 text-muted-foreground text-sm">{order.time}</td>
                        <td className="py-2 px-3">{getStatusBadge(order.status)}</td>
                        <td className="py-2 px-3 text-right font-semibold">₹{Number(order.total).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No orders yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
