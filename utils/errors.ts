export class UserNotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'UserNotFoundError';
    }
  }
  
  export class PuzzleNotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PuzzleNotFoundError';
    }
  }
  
  export class UnauthorizedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  }
  
  export class GeneralError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'GeneralError';
    }
  }