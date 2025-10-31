import { DerivationStep } from '../components/types';

export class DerivationLogger {
  private steps: DerivationStep[];
  private stepNumber: i32;

  constructor() {
    this.steps = [];
    this.stepNumber = 0;
  }

  addStep(sententialForm: string): void {
    this.stepNumber++;
    this.steps.push(new DerivationStep(this.stepNumber, sententialForm));
  }

  getSteps(): DerivationStep[] {
    return this.steps;
  }

  clear(): void {
    this.steps = [];
    this.stepNumber = 0;
  }
}
