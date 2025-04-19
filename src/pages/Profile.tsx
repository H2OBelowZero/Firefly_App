import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Calendar, Clock, FileText, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: 'project' | 'document' | 'meeting';
  title: string;
  timestamp: string;
  description: string;
}

const Profile = () => {
  const { profile, setProfile } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    role: profile?.role || '',
    address: profile?.address || ''
  });

  const [activities] = React.useState<Activity[]>([
    {
      id: '1',
      type: 'project',
      title: 'Updated Project: Warehouse Safety Assessment',
      timestamp: '2024-03-15T10:30:00Z',
      description: 'Completed fire safety inspection and updated compliance report'
    },
    {
      id: '2',
      type: 'document',
      title: 'Created New Template: Emergency Response Plan',
      timestamp: '2024-03-14T15:45:00Z',
      description: 'Developed a new template for emergency response procedures'
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Team Meeting: Safety Protocol Review',
      timestamp: '2024-03-13T09:00:00Z',
      description: 'Attended team meeting to review and update safety protocols'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile?.id);

      if (error) throw error;

      setProfile({
        ...profile,
        ...formData
      });

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'project':
        return <Building2 className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'meeting':
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-fire/10 text-fire text-2xl">
                        {profile?.full_name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{profile?.full_name}</h2>
                    <p className="text-muted-foreground">{profile?.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-secondary/80 transition-all duration-200"
                    >
                      <div className="p-2 rounded-full bg-fire/10 text-fire">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.description}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{profile?.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">{profile?.phone || 'Not set'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Company</div>
                  <div className="text-sm text-muted-foreground">{profile?.company || 'Not set'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground">{profile?.address || 'Not set'}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 