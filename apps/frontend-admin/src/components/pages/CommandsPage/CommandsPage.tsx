import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { CommandForm, CommandFormInput } from './CommandForm';

import {
  useCreateCommandMutation,
  useDeleteCommandMutation,
  useUpdateCommandMutation,
} from '@app/frontend-admin/mutations/commands';
import { useCommndsQuery } from '@app/frontend-admin/queries/commands';
import { Loader } from '../../common/Loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';
import { useActionsQuery } from '@app/frontend-admin/queries/actions';
import { DeleteDialog } from '../../common/DeleteDialog';
import { CommandEntity } from '@shared';

export function CommandsPage() {
  const actionsQuery = useActionsQuery();
  const commandsQuery = useCommndsQuery();

  const commands = commandsQuery.data ?? [];
  const actions = actionsQuery.data ?? [];

  const updateMutation = useUpdateCommandMutation();
  const createMutation = useCreateCommandMutation();
  const deleteMutation = useDeleteCommandMutation();

  if (commandsQuery.isLoading || actionsQuery.isLoading) {
    return <Loader />;
  }

  const handleIsActiveChange = (index: number, value: boolean) => {
    const command = commands[index];

    if (command) {
      updateMutation.mutate({ id: command.id, isActive: value });
    }
  };

  const handleCommandSave = (index: number, data: CommandFormInput) => {
    const command = commands[index];

    if (command) {
      updateMutation.mutate({
        id: command.id,
        text: data.text,
        cooldown: data.cooldown,
        data: data.data,
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleActionClick = (id: number) => {
    const action = actions.find((action) => action.id === id);

    if (action) {
      createMutation.mutate({
        actionId: id,
        text: '!' + action.name,
        isActive: true,
        cooldown: 0,
      });
    }
  };

  const commandForm = (command: CommandEntity, index: number) => {
    const action = actions.find((action) => action.id === command.actionId);

    if (action) {
      return (
        <CommandForm
          text={command.text}
          cooldown={command.cooldown}
          action={action}
          data={command.data}
          onSave={(data) => handleCommandSave(index, data)}
        ></CommandForm>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2" />
                Add new command
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                >
                  {action.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Table>
          <TableCaption>A list of dude commands</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Active</TableHead>
              <TableHead>Command</TableHead>
              <TableHead>Cooldown</TableHead>
              <TableHead className="w-40">Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commands.map((command, index) => (
              <TableRow key={command.id}>
                <TableCell className="font-medium">
                  <Checkbox
                    onCheckedChange={(value: boolean) =>
                      handleIsActiveChange(index, value)
                    }
                    checked={command.isActive}
                    className="block"
                  ></Checkbox>
                </TableCell>
                <TableCell>{command.text}</TableCell>
                <TableCell>{command.cooldown}</TableCell>
                <TableCell>{commandForm(command, index)}</TableCell>
                <TableCell>
                  <DeleteDialog
                    onDelete={() => handleDelete(command.id)}
                  ></DeleteDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
