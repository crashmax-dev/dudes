import { z } from 'zod';
import {
  createCommandDtoSchema,
  updateCommandDtoSchema
} from '../schema/command';
import { Command } from '@prisma/client';

export type UpdateCommandDto = z.infer<typeof updateCommandDtoSchema>;

export type CreateCommandDto = z.infer<typeof createCommandDtoSchema>;

export type CommandEntity = Command;
