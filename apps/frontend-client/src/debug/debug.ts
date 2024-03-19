import { Dudes } from '@lib/dudes';

export class Debug {
  constructor(readonly dudes: Dudes) {
    this.generateDudes();
  }

  public generateDudes(): void {
    this.dudes.processMessage({
      userId: '1',
      emotes: [],
      message: 'Привет!',
      info: {
        displayName: 'haha',
        color: 'yellow',
      },
    });

    setTimeout(() => {
      this.dudes.processAction({
        userId: '1',
        cooldown: 0,
        data: {
          scale: 4
        },
        description: '',
        id: 1,
        name: 'grow',
        title: 'Dash',
        info: {
          displayName: 'haha',
          color: 'yellow',
        },
      });
    }, 1000);

    setTimeout(() => {
      this.dudes.processAction({
        userId: '1',
        cooldown: 0,
        data: {
          force: 15
        },
        description: '',
        id: 1,
        name: 'dash',
        title: 'Dash',
        info: {
          displayName: 'haha',
          color: 'yellow',
        },
      });
    }, 6000);
  }
}
