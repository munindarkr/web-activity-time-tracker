import Browser from 'webextension-polyfill';

export interface BadgeState {
  text: string | null;
  color: BadgeColor;
  tabId?: number;
  icon?: BadgeIcon;
}

export enum BadgeIcon {
  default = '/128x128.png',
  pomodoroWorkingTime = '/assets/icons/pomodoro.png',
  pomodoroRestTime = '/assets/icons/pomodoro-rest.png',
}

export enum BadgeColor {
  red = '#fdb8b8',
  green = '#6ec05e',
  blue = '#1a73e8',
  none = '#000',
}

function isNoTabError(e: unknown): boolean {
  return e instanceof Error && e.message.startsWith('No tab with id');
}

export async function useBadge(badge: BadgeState): Promise<void> {
  try {
    await applyBadge(badge);
  } catch (e) {
    // The tab may have been closed between querying it and updating its badge
    if (!isNoTabError(e)) throw e;
  }
}

async function applyBadge(badge: BadgeState): Promise<void> {
  if (badge.color != BadgeColor.none)
    await Browser.action.setBadgeBackgroundColor({ color: badge.color });
  await Browser.action.setBadgeText({
    tabId: badge.tabId,
    text: badge.text,
  });
  if (badge.icon) {
    await Browser.action.setIcon({
      path: badge.icon,
    });
    await Browser.action.setBadgeText({
      tabId: badge.tabId,
      text: badge.text,
    });
  } else
    await Browser.action.setIcon({
      path: BadgeIcon.default,
    });
}
