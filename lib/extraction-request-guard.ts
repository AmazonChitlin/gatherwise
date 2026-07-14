export type ExtractionRequestToken = {
  controller: AbortController;
  generation: number;
};

export class ExtractionRequestGuard {
  private activeController: AbortController | null = null;
  private generation = 0;

  start(): ExtractionRequestToken {
    this.invalidate();
    const controller = new AbortController();
    this.activeController = controller;

    return {
      controller,
      generation: this.generation
    };
  }

  invalidate() {
    this.generation += 1;
    this.activeController?.abort();
    this.activeController = null;
  }

  isCurrent(token: ExtractionRequestToken) {
    return (
      token.generation === this.generation &&
      token.controller === this.activeController &&
      !token.controller.signal.aborted
    );
  }

  finish(token: ExtractionRequestToken) {
    if (!this.isCurrent(token)) {
      return false;
    }

    this.activeController = null;
    return true;
  }
}
