// Simple derivation logger used to record leftmost derivation steps.
// Each call to addStep records the next sentential form with an incremented step number.
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

  // Add a formatted derivation step from prefix, middle and suffix pieces.
  addFormatted(prefix: string, middle: string, suffix: string): void {
    this.addStep(prefix + middle + suffix);
  }

  getSteps(): DerivationStep[] {
    return this.steps;
  }

  clear(): void {
    this.steps = [];
    this.stepNumber = 0;
  }
}
