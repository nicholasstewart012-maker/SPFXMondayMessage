import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'MondayMessageWebPartStrings';
import MondayMessage from './components/MondayMessage';
import { IMondayMessageProps } from './components/IMondayMessageProps';

export interface IMondayMessageWebPartProps {
  // Group A
  enableSchedule: boolean;
  timeZone: string;
  visibleDays: 'Monday' | 'Always' | 'Custom';
  hideMode: 'Hidden' | 'Collapsed';
  manualOverride: 'Auto' | 'ForceShow' | 'ForceHide';

  // Group B
  headerImageUrl: string;
  headerImageAlt: string;
  titleText: string;

  // Group C
  quoteText: string;
  reflectionHeader: string;
  reflectionText: string;
  coreBehaviorText: string;
  coreBehaviorUrl: string;

  // Group D
  sigLeftName: string;
  sigLeftTitle: string;
  sigRightName: string;
  sigRightTitle: string;

  // Group E
  midImageUrl: string;
  midImageAlt: string;
  footerImageUrl: string;
  footerImageAlt: string;

  // Group F
  allowCollapse: boolean;
  defaultCollapsed: boolean;
  collapsedLabel: string;

  // Debug
  debug: boolean;
}

export default class MondayMessageWebPart extends BaseClientSideWebPart<IMondayMessageWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IMondayMessageProps> = React.createElement(
      MondayMessage,
      {
        ...this.properties,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // ... (unchanged methods) ...

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const timeZoneOptions: IPropertyPaneDropdownOption[] = [
      { key: 'America/Chicago', text: 'Central Time (America/Chicago)' },
      { key: 'America/New_York', text: 'Eastern Time (America/New_York)' },
      { key: 'America/Denver', text: 'Mountain Time (America/Denver)' },
      { key: 'America/Los_Angeles', text: 'Pacific Time (America/Los_Angeles)' },
      { key: 'UTC', text: 'UTC' }
    ];

    const visibleDaysOptions: IPropertyPaneDropdownOption[] = [
      { key: 'Monday', text: 'Monday Only' },
      { key: 'Always', text: 'Always Visible' },
      { key: 'Custom', text: 'Custom (Not Implemented)' }
    ];

    const hideModeOptions: IPropertyPaneDropdownOption[] = [
      { key: 'Hidden', text: 'Completely Hidden' },
      { key: 'Collapsed', text: 'Show Collapsed Banner' }
    ];

    const manualOverrideOptions: IPropertyPaneDropdownOption[] = [
      { key: 'Auto', text: 'Auto (Follow Schedule)' },
      { key: 'ForceShow', text: 'Force Show' },
      { key: 'ForceHide', text: 'Force Hide' }
    ];

    return {
      pages: [
        {
          header: {
            description: "Configure Monday Message Settings"
          },
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName: "Visibility / Schedule",
              groupFields: [
                PropertyPaneToggle('enableSchedule', {
                  label: "Enable Schedule",
                  checked: true
                }),
                PropertyPaneDropdown('timeZone', {
                  label: "Time Zone",
                  options: timeZoneOptions,
                  selectedKey: 'America/Chicago'
                }),
                PropertyPaneDropdown('visibleDays', {
                  label: "Visible Days",
                  options: visibleDaysOptions,
                  selectedKey: 'Monday'
                }),
                PropertyPaneDropdown('hideMode', {
                  label: "Hide Mode",
                  options: hideModeOptions,
                  selectedKey: 'Hidden'
                }),
                PropertyPaneDropdown('manualOverride', {
                  label: "Manual Override",
                  options: manualOverrideOptions,
                  selectedKey: 'Auto'
                })
              ]
            },
            {
              groupName: "Header",
              groupFields: [
                PropertyPaneTextField('headerImageUrl', {
                  label: "Header Image URL"
                }),
                PropertyPaneTextField('headerImageAlt', {
                  label: "Header Image Alt Text"
                }),
                PropertyPaneTextField('titleText', {
                  label: "Main Title"
                })
              ]
            },
            {
              groupName: "Body Content",
              groupFields: [
                PropertyPaneTextField('quoteText', {
                  label: "Quote Text",
                  multiline: true
                }),
                PropertyPaneTextField('reflectionHeader', {
                  label: "Reflection Header"
                }),
                PropertyPaneTextField('reflectionText', {
                  label: "Reflection Text",
                  multiline: true
                }),
                PropertyPaneTextField('coreBehaviorText', {
                  label: "Core Behavior Text"
                }),
                PropertyPaneTextField('coreBehaviorUrl', {
                  label: "Core Behavior Link URL"
                })
              ]
            },
            {
              groupName: "Signatures",
              groupFields: [
                PropertyPaneTextField('sigLeftName', { label: "Left Signature Name" }),
                PropertyPaneTextField('sigLeftTitle', { label: "Left Signature Title" }),
                PropertyPaneTextField('sigRightName', { label: "Right Signature Name" }),
                PropertyPaneTextField('sigRightTitle', { label: "Right Signature Title" })
              ]
            },
            {
              groupName: "Bottom Images",
              groupFields: [
                PropertyPaneTextField('midImageUrl', { label: "Middle Image URL" }),
                PropertyPaneTextField('midImageAlt', { label: "Middle Image Alt" }),
                PropertyPaneTextField('footerImageUrl', { label: "Footer Image URL" }),
                PropertyPaneTextField('footerImageAlt', { label: "Footer Image Alt" })
              ]
            },
            {
              groupName: "Collapse UI",
              groupFields: [
                PropertyPaneToggle('allowCollapse', {
                  label: "Allow Collapse when Visible",
                  checked: true
                }),
                PropertyPaneToggle('defaultCollapsed', {
                  label: "Default to Collapsed",
                  checked: false
                }),
                PropertyPaneTextField('collapsedLabel', {
                  label: "Collapsed Label"
                }),
                PropertyPaneToggle('debug', {
                  label: "Debug Mode",
                  checked: false
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
