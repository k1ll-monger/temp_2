import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Edit, LogOut, User, Camera, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:3000/user/${userId}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setFormData({ username: data.username, email: data.email });
        } else {
          console.error('Failed to fetch user:', data.message);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const res = await fetch('http://localhost:3000/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setIsEditing(false);
        toast({
          title: 'Profile updated',
          description: 'Your profile information has been updated successfully.',
        });
      } else {
        console.error('Update failed:', data.message);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUser((prev: any) => ({
        ...prev,
        profileImage: objectUrl,
      }));
      setIsProfileImageDialogOpen(false);
      toast({
        title: 'Profile image updated',
        description: 'Your profile image has been updated successfully.',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <Layout requireAuth>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Profile
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit size={16} />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {/* Profile Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.username} />
                    ) : (
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={() => setIsProfileImageDialogOpen(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
  
                {/* Profile Info / Edit */}
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ username: user.username, email: user.email });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="text-center">
                      <h3 className="text-xl font-medium">{user.username}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex justify-center space-x-6 w-full">
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <p className="text-yellow-500 font-bold">
                            {user.requestorRating?.toFixed(1) || 0}
                          </p>
                          <Star className="h-4 w-4 text-yellow-500 ml-1" />
                        </div>
                        <p className="text-xs text-muted-foreground">Requestor Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <p className="text-green-500 font-bold">
                            {user.doerRating?.toFixed(1) || 0}
                          </p>
                          <Star className="h-4 w-4 text-green-500 ml-1" />
                        </div>
                        <p className="text-xs text-muted-foreground">Doer Rating</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
  
          {/* Tabs Section */}
          <div className="md:col-span-2">
            <Tabs defaultValue="tasks">
              <TabsList>
                <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>
  
              <TabsContent value="tasks" className="mt-4">
                <h3 className="text-lg font-medium mb-4">Your Active Tasks</h3>
                <div className="text-muted-foreground">Task listing coming soon...</div>
              </TabsContent>
  
              <TabsContent value="stats" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Tasks Created', value: 12 },
                    { title: 'Tasks Completed', value: 8 },
                    { title: 'Total Rewards Earned', value: '₹4,500' },
                    { title: 'Total Rewards Paid', value: '₹7,200' },
                  ].map((stat, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base">{stat.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  
      {/* Dialog for Profile Image Upload */}
      <Dialog open={isProfileImageDialogOpen} onOpenChange={setIsProfileImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageChange}
              className="hidden"
            />
            <Button onClick={triggerFileInput}>
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
  