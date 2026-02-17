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
    hasTeamsContext
  } = props;

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(defaultCollapsed);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);

  const checkSchedule = (): void => {
    // 1. Manual Override takes precedence
    if (manualOverride === 'ForceShow') {
      setIsVisible(true);
      setIsExpired(false);
      return;
    }
    if (manualOverride === 'ForceHide') {
      setIsVisible(false);
      setIsExpired(false);
      return;
    }

    // 2. Schedule Check
    if (!enableSchedule) {
      setIsVisible(true);
      setIsExpired(false);
      return;
    }

    // Check if it is Monday in target timezone
    // 'visibleDays' is assumed 'Monday' for now based on requirements being simple
    const isTodayMonday = DateService.isMonday(timeZone || 'America/Chicago');

    if (isTodayMonday) {
      setIsVisible(true);
      setIsExpired(false);
    } else {
      // Not Monday
      if (hideMode === 'Hidden') {
        setIsVisible(false);
        setIsExpired(true);
      } else {
        // Collapsed mode
        setIsVisible(true);
        setIsExpired(true);
        setIsCollapsed(true); // Force collapse if expired but showing
      }
    }
  };

  React.useEffect(() => {
    checkSchedule();
  }, [enableSchedule, timeZone, visibleDays, manualOverride]);

  React.useEffect(() => {
    setIsCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);



  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  // If completely hidden, render nothing
  if (!isVisible) {
    return null;
  }

  // Render Expired Banner (if hideMode == Collapsed and isExpired)
  if (isExpired && hideMode === 'Collapsed') {
    return (
      <div className={`${styles.mondayMessage} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.container}>
          <div className={styles.collapsedBanner}>
            <span className={styles.expiredMessage}>
              {titleText || "Monday Message"} (Expired)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Collapsed State (user toggled)
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
        </div>
      </div>
    );
  }

  // Render Full Content
  return (
    <div className={`${styles.mondayMessage} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {headerImageUrl && (
            <img src={headerImageUrl} alt={headerImageAlt || "Header"} className={styles.headerImage} />
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
