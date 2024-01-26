import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTwitchRewardFormSchema } from '@shared';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Form, FormField } from '../../ui/form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export type EditRewardFormInput = {
  title: string;
  cost: number;
};

export type EditRewardFormProps = {
  onSave: (data: EditRewardFormInput) => void;
} & EditRewardFormInput;

export function EditRewardForm(props: EditRewardFormProps) {
  const { title, cost, onSave } = props;

  const [open, setOpen] = useState(false);

  const form = useForm<EditRewardFormInput>({
    resolver: zodResolver(updateTwitchRewardFormSchema),
    values: {
      title,
      cost,
    },
  });

  const uuid = nanoid();

  const onSubmit = (data: EditRewardFormInput) => {
    onSave(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form id={uuid} name={uuid} onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit reward</DialogTitle>
              <DialogDescription>
                Make changes to reward here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <>
                      <Label htmlFor="reward-text" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="reward-text"
                        className="col-span-3"
                        {...field}
                      />
                      <ErrorMessage
                        errors={form.formState.errors}
                        name="title"
                        render={({ message }) => (
                          <p className="col-start-2 col-span-3 text-sm mb-2 text-destructive">
                            {message}
                          </p>
                        )}
                      />
                    </>
                  )}
                ></FormField>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <>
                      <Label htmlFor="reward-cost" className="text-right">
                        Cost
                      </Label>
                      <Input
                        id="reward-cost"
                        className="col-span-3"
                        {...field}
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
                      />
                      <ErrorMessage
                        errors={form.formState.errors}
                        name="cost"
                        render={({ message }) => (
                          <p className="col-start-2 col-span-3 text-sm mb-2 text-destructive">
                            {message}
                          </p>
                        )}
                      />
                    </>
                  )}
                ></FormField>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
