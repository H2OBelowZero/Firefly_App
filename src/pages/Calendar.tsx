import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

interface Deadline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
}

const Calendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [deadlines, setDeadlines] = React.useState<Deadline[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('project_deadlines')
        .select(`
          *,
          projects (
            name
          )
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error: any) {
      console.error('Error fetching deadlines:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Deadline['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Calendar</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 md:col-span-2">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <div key={deadline.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{deadline.title}</h3>
                      <p className="text-sm text-muted-foreground">{deadline.description}</p>
                      <p className="text-sm mt-1">
                        Due: {new Date(deadline.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                      {deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}

              {deadlines.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar; 