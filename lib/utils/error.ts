export default class VueNavTabError extends Error {

  constructor(message: string) {

    super(message);

    Object.setPrototypeOf(this, VueNavTabError.prototype);
    this.name = "VueNavTabError";
  }
}

export const MISSING_REQUIRED_PROPS = "Some properties of the tab are missing";