import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Calendar, FileText, Users } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'project_start' | 'project_end' | 'deadline' | 'review';
  date: string;
  project_id: string;
  project_name: string;
  description: string;
}

const Dashboard = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { profile } = useUser();
  const [upcomingEvents, setUpcomingEvents] = React.useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUpcomingEvents();
  }, [projects]);

  const fetchUpcomingEvents = async () => {
    try {
      // Get project start and end dates
      const projectEvents = projects.map(project => ({
        id: `start-${project.id}`,
        title: `${project.name} - Project Start`,
        type: 'project_start' as const,
        date: project.start_date,
        project_id: project.id,
        project_name: project.name,
        description: `Project ${project.name} is starting`
      })).concat(projects.map(project => ({
        id: `end-${project.id}`,
        title: `${project.name} - Project End`,
        type: 'project_end' as const,
        date: project.end_date,
        project_id: project.id,
        project_name: project.name,
        description: `Project ${project.name} is ending`
      })));

      // Get deadlines only if profile exists
      let deadlineEvents: UpcomingEvent[] = [];
      if (profile?.id) {
        const { data: deadlines, error: deadlinesError } = await supabase
          .from('deadlines')
          .select('*')
          .eq('user_id', profile.id)
          .gte('due_date', new Date().toISOString())
          .order('due_date', { ascending: true })
          .limit(5);

        if (deadlinesError) throw deadlinesError;

        deadlineEvents = deadlines.map(deadline => {
          const project = projects.find(p => p.id === deadline.project_id);
          return {
            id: `deadline-${deadline.id}`,
            title: `${project ? project.name : 'Unknown Project'} - ${deadline.title}`,
            type: 'deadline' as const,
            date: deadline.due_date,
            project_id: deadline.project_id,
            project_name: project ? project.name : 'Unknown Project',
            description: deadline.description
          };
        });
      }

      // Combine and sort all events
      const allEvents = [...projectEvents, ...deadlineEvents]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setUpcomingEvents(allEvents);
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'project_start':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'project_end':
        return <Calendar className="w-4 h-4 text-red-500" />;
      case 'deadline':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      default:
        return <Calendar className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link to="/projects">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fire"></div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-2xl bg-fire/10 flex items-center justify-center">
                        <span className="font-bold text-fire">FF</span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-2">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground">
                Create your first project to get started
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-fire/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-fire" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <h3 className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'active').length}
                  </h3>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-fire/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-fire" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <h3 className="text-2xl font-bold">12</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-fire/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-fire" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  <h3 className="text-2xl font-bold">{upcomingEvents.length}</h3>
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fire"></div>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/projects/${event.project_id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-2xl hover:bg-secondary/80 transition-all duration-200">
                        <div className="flex items-start space-x-4">
                          {getEventIcon(event.type)}
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-1">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-center text-muted-foreground">No upcoming events</p>
                  )}
                </div>
              </ScrollArea>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
