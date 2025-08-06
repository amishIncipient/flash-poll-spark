import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Plus, X } from 'lucide-react';

const createPollSchema = z.object({
  title: z.string().min(1, 'Poll title is required').max(200, 'Title must be less than 200 characters'),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text is required').max(100, 'Option must be less than 100 characters'),
      })
    )
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed'),
});

type CreatePollForm = z.infer<typeof createPollSchema>;

interface CreatePollFormProps {
  onSuccess: () => void;
}

export const CreatePollForm = ({ onSuccess }: CreatePollFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<CreatePollForm>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      options: [{ text: '' }, { text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const handleSubmit = async (data: CreatePollForm) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create the poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: data.title,
          user_id: user.id,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create the poll options
      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(
          data.options.map((option) => ({
            poll_id: pollData.id,
            option_text: option.text,
          }))
        );

      if (optionsError) throw optionsError;

      toast({
        title: "Poll created!",
        description: "Your poll has been created successfully.",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error creating poll",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Title</FormLabel>
              <FormControl>
                <Input placeholder="What's your question?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Poll Options</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: '' })}
              disabled={fields.length >= 10}
              className="gap-2"
            >
              <Plus className="w-3 h-3" />
              Add Option
            </Button>
          </div>

          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-2"
              >
                <FormField
                  control={form.control}
                  name={`options.${index}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Option ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Poll"}
        </Button>
      </form>
    </Form>
  );
};