declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type SettingsData = {
      showAnonymousDudes?: boolean;
      fallingDudes?: boolean;
      fallingRaiders?: boolean;
    };

    type ActionData = Record<string, string | number | undefined>;

    type ActionArgument = {
      name: string;
      isPersistent: boolean;
    };

    type ActionableData = {
      arguments: ActionArgument[];
      action: ActionData;
    };
  }
}

export {};
