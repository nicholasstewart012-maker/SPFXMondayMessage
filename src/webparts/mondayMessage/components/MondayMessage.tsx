import * as React from 'react';
import styles from './MondayMessage.module.scss';
import type { IMondayMessageProps } from './IMondayMessageProps';
import { DateService } from '../services/DateService';
import { Icon } from '@fluentui/react/lib/Icon';

const MondayMessage: React.FC<IMondayMessageProps> = (props) => {
  const {
    enableSchedule,
    timeZone,
    visibleDays,
    hideMode,
    manualOverride,
    headerImageUrl,
    headerImageAlt,
    titleText,
    quoteText,
    reflectionHeader,
    reflectionText,
    coreBehaviorText,
    coreBehaviorUrl,
    sigLeftName,
    sigLeftTitle,
    sigRightName,
    sigRightTitle,
    midImageUrl,
    midImageAlt,
    footerImageUrl,
    footerImageAlt,
    allowCollapse,
    defaultCollapsed,
    collapsedLabel,
    hasTeamsContext,
    debug
  } = props;

  // CAST STYLES TO ANY TO BYPASS BUILD ISSUES WITH HEFT/SCSS TYPINGS
  const s: any = styles;

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(defaultCollapsed);
  const [isScheduledVisible, setIsScheduledVisible] = React.useState<boolean>(true); // Does schedule say "Show"?
  const [debugInfo, setDebugInfo] = React.useState<string>("");

  // Helper to normalize SharePoint image URLs
  const normalizeImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    let cleanUrl = url.trim();
    if (!cleanUrl) return undefined;

    // Check for SharePoint rendering patterns (only if not already pointing to a file extension we recognize as image, though SP URLs often don't have them)
    // If it is a /:i:/ or /:u:/ link, or has ?web=1, we might need to force download behavior for it to render in an <img> tag.
    // Simple heuristic: if it looks like a customized viewing link, append ?download=1
    // Avoiding double append if it already exists.

    const hasQuery = cleanUrl.indexOf('?') > -1;
    const isSharingLink = cleanUrl.indexOf('/:i:/') > -1 || cleanUrl.indexOf('/:u:/') > -1 || cleanUrl.indexOf('sharepoint.com') > -1;

    if (isSharingLink && cleanUrl.toLowerCase().indexOf('download=1') === -1) {
      cleanUrl += hasQuery ? '&download=1' : '?download=1';
    }

    return cleanUrl;
  };

  const processedHeaderUrl = normalizeImageUrl(headerImageUrl);

  const checkSchedule = (): void => {
    let visibleBound = true;
    let overrideState = "None";

    // 1. Manual Override logic
    if (manualOverride === 'ForceShow') {
      visibleBound = true;
      overrideState = "ForceShow";
    } else if (manualOverride === 'ForceHide') {
      visibleBound = false;
      overrideState = "ForceHide";
    } else {
      // 2. Schedule Logic
      if (!enableSchedule) {
        visibleBound = true; // Schedule disabled = always show
      } else {
        // Schedule Enabled
        const isTodayMonday = DateService.isMonday(timeZone || 'America/Chicago');
        visibleBound = isTodayMonday;
      }
    }

    setIsScheduledVisible(visibleBound);

    // Initial Collapse State Logic:
    // Only default-collapse if currently visible. 
    // If hidden/expired, we don't care about defaultCollapsed yet (handled in render).
    // We only reset isCollapsed when props change significantly, usually we let user toggle. 
    // However, if we switch from Hidden -> Visible, we might want to respect defaultCollapsed.
    // For now, we rely on the useEffect below to reset state when prefs change.

    // Debug Calculation
    if (debug) {
      const now = new Date();
      const info = `
        Debug Mode: On
        Time (Local): ${now.toLocaleString()}
        TimeZone: ${timeZone}
        Manual Override: ${overrideState}
        Enable Schedule: ${enableSchedule}
        Is Monday (Calc): ${DateService.isMonday(timeZone || 'America/Chicago')}
        -> Scheduled Visible: ${visibleBound}
        Hide Mode: ${hideMode}
        Default Collapsed: ${defaultCollapsed}
        Current Collapsed State: ${isCollapsed}
        Header URL (Raw): ${headerImageUrl}
        Header URL (Norm): ${processedHeaderUrl}
        `;
      setDebugInfo(info);
    }
  };

  React.useEffect(() => {
    checkSchedule();
  }, [enableSchedule, timeZone, visibleDays, manualOverride, debug, headerImageUrl]);

  // Reset collapse state only when the default preference changes
  React.useEffect(() => {
    // Only reset to default if we are visible. 
    // If we are expired-collapsed, that state is forced in render.
    setIsCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  // --- RENDER LOGIC ---

  // 1. Completely Hidden (Scheduled=False AND HideMode=Hidden)
  if (!isScheduledVisible && hideMode === 'Hidden') {
    if (debug) {
      return <div className={s.mondayMessage} style={{ background: 'yellow' }}><pre>{debugInfo}</pre><div style={{ color: 'red' }}>HIDDEN (Debug view)</div></div>;
    }
    return null;
  }

  // 2. Expired Banner (Scheduled=False AND HideMode=Collapsed)
  if (!isScheduledVisible && hideMode === 'Collapsed') {
    return (
      <div className={`${s.mondayMessage} ${hasTeamsContext ? s.teams : ''}`}>
        <div className={s.container}>
          <div className={s.collapsedBanner}>
            <span className={s.expiredMessage}>
              {titleText || "Monday Message"} (Expired)
            </span>
            {debug && <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>{debugInfo}</div>}
          </div>
        </div>
      </div>
    );
  }

  // 3. Visible Content (Scheduled=True)

  // 3a. User Collapsed
  if (isCollapsed && allowCollapse) {
    return (
      <div className={`${s.mondayMessage} ${hasTeamsContext ? s.teams : ''}`}>
        <div className={s.container}>
          <div className={s.header} onClick={toggleCollapse} style={{ cursor: 'pointer' }}>
            <div className={s.title}>{collapsedLabel || titleText || "Monday Message"}</div>
            <button className={s.collapseButton} aria-label="Expand">
              <Icon iconName="ChevronDown" />
            </button>
          </div>
          {debug && <div style={{ fontSize: '10px', background: '#eee', padding: '5px', whiteSpace: 'pre-wrap' }}>{debugInfo}</div>}
        </div>
      </div>
    );
  }

  // 3b. Fully Expanded
  return (
    <div className={`${s.mondayMessage} ${hasTeamsContext ? s.teams : ''}`}>
      <div className={s.container}>
        {debug && <div style={{ fontSize: '10px', background: '#eee', padding: '5px', whiteSpace: 'pre-wrap' }}>{debugInfo}</div>}

        {/* Header */}
        {/* Header - Image Only, No Banner */}
        {processedHeaderUrl ? (
          <div className={s.header}>
            <div className={s.headerImageWrap}>
              <img
                src={processedHeaderUrl}
                alt={headerImageAlt || "Header"}
                className={s.headerImage}
                onError={(e) => {
                  console.warn("MondayMessage: Header image failed to load", processedHeaderUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {allowCollapse && (
              <button className={s.collapseButton} onClick={toggleCollapse} aria-label="Collapse">
                <Icon iconName="ChevronUp" />
              </button>
            )}
          </div>
        ) : (
          /* No image provided: render null for header area per requirements */
          null
        )}

        {/* Body */}
        <div className={s.bodyContent}>
          {quoteText && (
            <div className={s.quote}>
              &quot;{quoteText}&quot;
            </div>
          )}

          {(reflectionHeader || reflectionText) && (
            <div className={s.reflectionSection}>
              {reflectionHeader && <div className={s.reflectionHeader}>{reflectionHeader}</div>}
              {reflectionText && <div className={s.reflectionText}>{reflectionText}</div>}
            </div>
          )}

          {(coreBehaviorText || coreBehaviorUrl) && (
            <div className={s.coreBehavior}>
              {coreBehaviorUrl ? (
                <a href={coreBehaviorUrl} target="_blank" rel="noreferrer">
                  {coreBehaviorText || coreBehaviorUrl}
                </a>
              ) : (
                <span>{coreBehaviorText}</span>
              )}
            </div>
          )}
        </div>

        {/* Signatures */}
        {(sigLeftName || sigRightName) && (
          <div className={s.signatures}>
            {sigLeftName && (
              <div className={s.signatureItem}>
                <span className={s.sigName}>{sigLeftName}</span>
                <span className={s.sigTitle}>{sigLeftTitle}</span>
              </div>
            )}
            {sigRightName && (
              <div className={s.signatureItem}>
                <span className={s.sigName}>{sigRightName}</span>
                <span className={s.sigTitle}>{sigRightTitle}</span>
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {midImageUrl && (
          <div className={s.midImageContainer}>
            <img src={midImageUrl} alt={midImageAlt || ""} className={s.midImage} />
          </div>
        )}

        {footerImageUrl && (
          <div className={s.footerImageContainer}>
            <img src={footerImageUrl} alt={footerImageAlt || ""} className={s.footerImage} />
          </div>
        )}

      </div>
    </div>
  );
};

export default MondayMessage;
