import { Injectable } from '@nestjs/common';
import Bottleneck from 'bottleneck';

const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  maxConcurrent: 1,
};

@Injectable()
export class HookmutextService {
  private readonly mutex: Bottleneck;
  constructor() {
    this.mutex = new Bottleneck(LIMITER_OPTIONS);
  }

  public getMutex(): Bottleneck {
    return this.mutex;
  }
}
