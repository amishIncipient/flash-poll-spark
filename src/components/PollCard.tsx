import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, Users, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PollOption {
  id: string;
  option_text: string;
  vote_count?: number;
}

interface Poll {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  poll_options: PollOption[];
}

interface PollCardProps {
  poll: Poll;
  isOwner: boolean;
  onPollDeleted?: () => void;
}

export const PollCard = ({ poll, isOwner, onPollDeleted }: PollCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const { user } = useAuth();

  const totalVotes = poll.poll_options.reduce((sum, option) => sum + (option.vote_count || 0), 0);

  // Check if user has already voted
  const checkUserVote = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('option_id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setUserVote(data.option_id);
      }
    } catch (error) {
      console.error('Error checking user vote:', error);
    }
  };

  React.useEffect(() => {
    checkUserVote();
  }, [poll.id, user]);

  const handleVote = async (optionId: string) => {
    if (!user || isVoting) return;

    setIsVoting(true);
    try {
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('votes')
          .update({ option_id: optionId })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('votes')
          .insert({
            poll_id: poll.id,
            option_id: optionId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      setUserVote(optionId);
      toast({
        title: "Vote recorded!",
        description: "Your vote has been recorded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error voting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!user || !isOwner || isDeleting) return;

    setIsDeleting(true);
    try {
      // Delete all votes for this poll first
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('poll_id', poll.id);

      if (votesError) throw votesError;

      // Delete all poll options
      const { error: optionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', poll.id);

      if (optionsError) throw optionsError;

      // Finally delete the poll
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', poll.id)
        .eq('user_id', user.id); // Extra safety check

      if (pollError) throw pollError;

      toast({
        title: "Poll deleted",
        description: "Your poll has been deleted successfully.",
      });

      // Call the callback to refresh the polls list
      onPollDeleted?.();
    } catch (error: any) {
      toast({
        title: "Error deleting poll",
        description: error.message || "Failed to delete the poll.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 pr-2">{poll.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {totalVotes} votes
              </div>
              {isOwner && (
                <span className="text-primary font-medium">Your poll</span>
              )}
            </div>
          </div>
          
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this poll? This action cannot be undone and will permanently remove the poll and all its votes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePoll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Poll"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {poll.poll_options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.vote_count || 0) / totalVotes * 100 : 0;
          const isSelected = userVote === option.id;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <Button
                onClick={() => handleVote(option.id)}
                disabled={isVoting}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-between h-auto p-3"
              >
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="w-4 h-4" />}
                  <span className="text-left flex-1">{option.option_text}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{option.vote_count || 0} votes</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
              </Button>
              
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  '--progress-foreground': isSelected 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--poll-progress))'
                } as React.CSSProperties}
              />
            </motion.div>
          );
        })}
        
        {totalVotes === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            Be the first to vote!
          </p>
        )}
      </CardContent>
    </Card>
  );
};