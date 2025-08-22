export class SanitizerUtil {
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[\r\n]/g, ' ') // Replace newlines with spaces for logging
      .trim()
      .substring(0, 1000); // Limit length
  }

  static sanitizeForLog(input: any): string {
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    return this.sanitizeInput(input)
      .replace(/[\r\n\t]/g, ' ') // Remove all control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }
}