import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreatePollForm } from '@/components/CreatePollForm';
import { PollCard } from '@/components/PollCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, LogOut, Zap, Users, BarChart3 } from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  poll_options: Array<{
    id: string;
    option_text: string;
    vote_count?: number;
  }>;
}

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const fetchPolls = async () => {
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          created_at,
          user_id,
          poll_options (
            id,
            option_text
          )
        `)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Get vote counts for each option
      const pollsWithVotes = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const optionsWithVotes = await Promise.all(
            poll.poll_options.map(async (option) => {
              const { count } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('option_id', option.id);
              
              return { ...option, vote_count: count || 0 };
            })
          );
          
          return { ...poll, poll_options: optionsWithVotes };
        })
      );

      setPolls(pollsWithVotes);
    } catch (error: any) {
      toast({
        title: "Error loading polls",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();

    // Set up real-time subscriptions
    const pollsChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls'
        },
        () => fetchPolls()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => fetchPolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pollsChannel);
    };
  }, []);

  const handlePollCreated = () => {
    setIsCreateModalOpen(false);
    fetchPolls();
  };

  const handlePollDeleted = () => {
    fetchPolls();
  };

  const myPolls = polls.filter(poll => poll.user_id === user?.id);
  const allPolls = polls;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Flash Poll</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Welcome back, {user?.email?.split('@')[0]}
                  </p>
                </div>
              </motion.div>

              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 flex-1 sm:flex-none">
                      <Plus className="w-4 h-4" />
                      <span className="hidden xs:inline">Create Poll</span>
                      <span className="xs:hidden">Create</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
                    <DialogHeader>
                      <DialogTitle>Create New Poll</DialogTitle>
                    </DialogHeader>
                    <CreatePollForm onSuccess={handlePollCreated} />
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={signOut} className="gap-2 flex-1 sm:flex-none">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your Polls</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myPolls.length}</div>
                  <p className="text-xs text-muted-foreground">Polls you've created</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allPolls.length}</div>
                  <p className="text-xs text-muted-foreground">All available polls</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allPolls.reduce((total, poll) => 
                      total + poll.poll_options.reduce((pollTotal, option) => 
                        pollTotal + (option.vote_count || 0), 0
                      ), 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Votes cast across all polls</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Polls Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="your-polls" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="your-polls" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">Your Polls ({myPolls.length})</span>
                  <span className="sm:hidden">Yours ({myPolls.length})</span>
                </TabsTrigger>
                <TabsTrigger value="all-polls" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">All Polls ({allPolls.length})</span>
                  <span className="sm:hidden">All ({allPolls.length})</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="your-polls" className="mt-4 sm:mt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : myPolls.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 sm:py-12">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">No polls yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">You haven't created any polls yet.</p>
                      <Button
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Your First Poll
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {myPolls.map((poll, index) => (
                      <motion.div
                        key={poll.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PollCard poll={poll} isOwner={true} onPollDeleted={handlePollDeleted} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all-polls" className="mt-4 sm:mt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : allPolls.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 sm:py-12">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">No polls available</h3>
                      <p className="text-sm text-muted-foreground">No polls have been created yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {allPolls.map((poll, index) => (
                      <motion.div
                        key={poll.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PollCard 
                          poll={poll} 
                          isOwner={poll.user_id === user?.id} 
                          onPollDeleted={handlePollDeleted}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}