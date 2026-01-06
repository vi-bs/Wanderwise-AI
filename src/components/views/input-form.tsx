'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, WandSparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  travel_dates: z.object({
    from: z.date({ required_error: 'Please select a start date.' }),
    to: z.date().optional(),
  }),
  budget_range_inr: z.array(z.number()).default([50000]),
  trip_type: z.enum(['informal', 'formal']).default('informal'),
  people_count: z.string().min(1, { message: 'At least one person must be travelling.' }),
  preferences: z.string().optional(),
});

type InputFormValues = z.infer<typeof formSchema>;

interface InputFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const form = useForm<InputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      budget_range_inr: [50000],
      trip_type: 'informal',
      people_count: '2',
      preferences: '',
    },
  });

  const handleSubmit = (values: InputFormValues) => {
    const duration = values.travel_dates.to ? differenceInDays(values.travel_dates.to, values.travel_dates.from) + 1 : 1;
    
    const submittedData = {
        ...values,
        duration_days: duration.toString(),
        budget_range_inr: `Up to ₹${values.budget_range_inr[0].toLocaleString()}`,
        preferences: values.preferences?.split(',').map(p => p.trim()).filter(p => p) || [],
        travel_dates: `From ${format(values.travel_dates.from, "LLL dd, y")} ${values.travel_dates.to ? `to ${format(values.travel_dates.to, "LLL dd, y")}` : ''}`.trim(),
        round_trip: !!values.travel_dates.to
    };
    onSubmit(submittedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6 border rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg">
        <div className="space-y-2 text-center">
            <h2 className="text-2xl font-headline">Tell us your dream trip</h2>
            <p className="text-muted-foreground text-sm">And the genie will make it a reality.</p>
        </div>
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where to?</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Goa, India" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="travel_dates"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>When?</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value?.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, 'LLL dd, y')} -{' '}
                            {format(field.value.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(field.value.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: field.value?.from, to: field.value?.to }}
                    onSelect={field.onChange}
                    numberOfMonths={1}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget_range_inr"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Budget (per person)</FormLabel>
                <FormControl>
                    <div>
                        <Slider
                            min={10000}
                            max={500000}
                            step={5000}
                            value={field.value}
                            onValueChange={field.onChange}
                        />
                        <div className="text-center font-bold text-lg mt-2 text-primary/80">
                            Up to ₹{field.value?.[0]?.toLocaleString()}
                        </div>
                    </div>
                </FormControl>
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="people_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many?</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="trip_type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Trip Type</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4 pt-2"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="informal" />
                            </FormControl>
                            <FormLabel className="font-normal">Informal</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="formal" />
                            </FormControl>
                            <FormLabel className="font-normal">Formal</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    </FormItem>
                )}
            />
        </div>
        <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferences</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., beaches, hiking, quiet cafes, museums" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
            type="submit" 
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground shadow-[0_8px_20px_-10px_hsl(var(--primary))] hover:shadow-[0_10px_25px_-10px_hsl(var(--primary))] transition-all duration-300"
            disabled={isGenerating}
        >
            {isGenerating ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                    Brewing Magic...
                </>
            ) : (
                <>
                    <WandSparkles className="mr-2 h-5 w-5" />
                    Ask the Genie
                </>
            )}
        </Button>
      </form>
    </Form>
  );
}
