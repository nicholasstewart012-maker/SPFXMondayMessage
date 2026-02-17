export interface IMondayMessageProps {
  // Standard SPFx props
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;

  // Group A - Visibility
  enableSchedule: boolean;
  timeZone: string;
  visibleDays: 'Monday' | 'Always' | 'Custom';
  hideMode: 'Hidden' | 'Collapsed';
  manualOverride: 'Auto' | 'ForceShow' | 'ForceHide';

  // Group B - Header
  headerImageUrl: string; // Image 1
  headerImageAlt: string;
  titleText: string;

  // Group C - Body
  quoteText: string;
  reflectionHeader: string;
  reflectionText: string;
  coreBehaviorText: string;
  coreBehaviorUrl: string;

  // Group D - Signatures
  sigLeftName: string;
  sigLeftTitle: string;
  sigRightName: string;
  sigRightTitle: string;

  // Group E - Bottom Images
  midImageUrl: string; // Image 2
  midImageAlt: string;
  footerImageUrl: string; // Image 3
  footerImageAlt: string;

  // Group F - Collapse UI
  allowCollapse: boolean;
  defaultCollapsed: boolean;
  collapsedLabel: string;

  // Debug
  debug: boolean;
}
