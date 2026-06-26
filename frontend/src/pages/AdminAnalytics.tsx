import { useEvents } from '../context/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminAnalytics() {
  const { events, registrations } = useEvents();

  // Prepare data for events attendance
  const eventAttendanceData = events.map(event => {
    const eventRegs = registrations.filter(r => r.event_id === event.id);
    const attended = eventRegs.filter(r => r.attended).length;
    return {
      name: event.title.substring(0, 15) + (event.title.length > 15 ? '...' : ''),
      registered: eventRegs.length,
      attended: attended
    };
  }).filter(d => d.registered > 0).slice(0, 5); // Top 5

  // Prepare data for categories
  const categoryCount: Record<string, number> = {};
  events.forEach(e => {
    categoryCount[e.category || 'Other'] = (categoryCount[e.category || 'Other'] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCount).map(k => ({
    name: k,
    value: categoryCount[k]
  }));

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Insights into event performance and user engagement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Attendance vs Registration (Top Events)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventAttendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="registered" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Registered" />
                  <Bar dataKey="attended" fill="#10b981" radius={[4, 4, 0, 0]} name="Attended" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Categories Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
