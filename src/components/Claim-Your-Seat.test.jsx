import { GenPass } from "./Claim-Your-Seat";

describe("GenPass function", () => {
  it("generates a password of at least 8 characters", () => {
    for (let i = 0; i < 10; i++) {
      
      const password = GenPass(8);
      expect(password.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("includes at least one uppercase letter, one lowercase letter, one number, and one special character", () => {
    for (let i = 0; i < 10; i++) {
      
      const password = GenPass(12);
      const patterns = {
        lower: /[a-z]/,
        upper: /[A-Z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*()]/,
      };

      expect(password).toMatch(patterns.lower);
      expect(password).toMatch(patterns.upper);
      expect(password).toMatch(patterns.number);
      expect(password).toMatch(patterns.special);
    }
  });
});
