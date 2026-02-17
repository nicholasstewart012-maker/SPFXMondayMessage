export class DateService {
  /**
   * Checks if the current day in the specified timezone is Monday.
   * @param timeZone The IANA timezone string (e.g., 'America/Chicago').
   * @param manualDate Optional date to check (for testing/overrides).
   * @returns True if it is Monday in the target timezone.
   */
  public static isMonday(timeZone: string, manualDate?: Date): boolean {
    try {
      const date = manualDate || new Date();
      // use Intl to get the weekday in the target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: timeZone
      });
      const weekday = formatter.format(date);
      return weekday === 'Monday';
    } catch (e) {
      console.warn(`DateService: Error checking timezone '${timeZone}'. Falling back to local time.`, e);
      // Fallback: check local time
      const date = manualDate || new Date();
      return date.getDay() === 1; // 0=Sun, 1=Mon, etc.
    }
  }
}
