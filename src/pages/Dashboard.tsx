import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreatePollForm } from '@/components/CreatePollForm';
import { PollCard } from '@/components/PollCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
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

  const myPolls = polls.filter(poll => poll.user_id === user?.id);
  const allPolls = polls;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Flash Poll</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Poll
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Poll</DialogTitle>
                    </DialogHeader>
                    <CreatePollForm onSuccess={handlePollCreated} />
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={signOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
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
              <Card>
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
              <Card>
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

          {/* Polls Section */}
          <div className="space-y-8">
            {/* My Polls */}
            <section>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold mb-4"
              >
                Your Polls
              </motion.h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">You haven't created any polls yet.</p>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)} 
                      className="mt-4 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Poll
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPolls.map((poll, index) => (
                    <motion.div
                      key={poll.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PollCard poll={poll} isOwner={true} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* All Polls */}
            <section>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold mb-4"
              >
                All Polls
              </motion.h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No polls available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}