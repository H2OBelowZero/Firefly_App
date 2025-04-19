import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface Deadline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
}

const Calendar = () => {
  const { profile } = useUser();
  const [deadlines, setDeadlines] = React.useState<Deadline[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', profile?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error: any) {
      console.error('Error fetching deadlines:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.due_date);
      return deadlineDate.toDateString() === date.toDateString();
    });
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Component */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </Card>
          </div>

          {/* Deadlines List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Deadlines</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fire"></div>
              </div>
            ) : selectedDate ? (
              <div className="space-y-4">
                {getDeadlinesForDate(selectedDate).map((deadline) => (
                  <div
                    key={deadline.id}
                    className="p-4 rounded-2xl hover:bg-secondary/80 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{deadline.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                        {deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{deadline.description}</p>
                  </div>
                ))}
                {getDeadlinesForDate(selectedDate).length === 0 && (
                  <p className="text-center text-muted-foreground">No deadlines for this date</p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Select a date to view deadlines</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 