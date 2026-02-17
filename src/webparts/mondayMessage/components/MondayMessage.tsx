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
      return <div className={styles.mondayMessage} style={{ background: 'yellow' }}><pre>{debugInfo}</pre><div style={{ color: 'red' }}>HIDDEN (Debug view)</div></div>;
    }
    return null;
  }

  // 2. Expired Banner (Scheduled=False AND HideMode=Collapsed)
  if (!isScheduledVisible && hideMode === 'Collapsed') {
    return (
      <div className={`${styles.mondayMessage} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.container}>
          <div className={styles.collapsedBanner}>
            <span className={styles.expiredMessage}>
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
      <div className={`${styles.mondayMessage} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.container}>
          <div className={styles.header} onClick={toggleCollapse} style={{ cursor: 'pointer' }}>
            <div className={styles.title}>{collapsedLabel || titleText || "Monday Message"}</div>
            <button className={styles.collapseButton} aria-label="Expand">
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
    <div className={`${styles.mondayMessage} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.container}>
        {debug && <div style={{ fontSize: '10px', background: '#eee', padding: '5px', whiteSpace: 'pre-wrap' }}>{debugInfo}</div>}

        {/* Header */}
        <div className={styles.header}>
          {processedHeaderUrl ? (
            <img
              src={processedHeaderUrl}
              alt={headerImageAlt || ""}
              className={styles.headerImage}
              onError={(e) => {
                console.warn("MondayMessage: Header image failed to load", processedHeaderUrl);
                e.currentTarget.style.display = 'none'; // Hide broken image
                // Optional: Show error placeholder in debug only?
              }}
            />
          ) : (
            /* No image provided: render nothing or placeholder only if debug/edit? For now render nothing */
            null
          )}

          <div className={styles.title}>{titleText || "Monday Message"}</div>
          {allowCollapse && (
            <button className={styles.collapseButton} onClick={toggleCollapse} aria-label="Collapse">
              <Icon iconName="ChevronUp" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className={styles.bodyContent}>
          {quoteText && (
            <div className={styles.quote}>
              &quot;{quoteText}&quot;
            </div>
          )}

          {(reflectionHeader || reflectionText) && (
            <div className={styles.reflectionSection}>
              {reflectionHeader && <div className={styles.reflectionHeader}>{reflectionHeader}</div>}
              {reflectionText && <div className={styles.reflectionText}>{reflectionText}</div>}
            </div>
          )}

          {(coreBehaviorText || coreBehaviorUrl) && (
            <div className={styles.coreBehavior}>
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
          <div className={styles.signatures}>
            {sigLeftName && (
              <div className={styles.signatureItem}>
                <span className={styles.sigName}>{sigLeftName}</span>
                <span className={styles.sigTitle}>{sigLeftTitle}</span>
              </div>
            )}
            {sigRightName && (
              <div className={styles.signatureItem}>
                <span className={styles.sigName}>{sigRightName}</span>
                <span className={styles.sigTitle}>{sigRightTitle}</span>
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {midImageUrl && (
          <div className={styles.midImageContainer}>
            <img src={midImageUrl} alt={midImageAlt || ""} className={styles.midImage} />
          </div>
        )}

        {footerImageUrl && (
          <div className={styles.footerImageContainer}>
            <img src={footerImageUrl} alt={footerImageAlt || ""} className={styles.footerImage} />
          </div>
        )}

      </div>
    </div>
  );
};

export default MondayMessage;
