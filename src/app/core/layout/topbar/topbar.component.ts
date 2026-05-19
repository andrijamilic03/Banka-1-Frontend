import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { Theme, ThemeService } from '../../services/theme.service';
import { WatchlistService } from '../../../features/watchlist/services/watchlist.service';
import { WatchlistSecurity } from '../../../features/watchlist/models/watchlist.model';

type ThemeIcon = 'sun' | 'moon' | 'monitor';

const THEME_ICONS: Record<Theme, ThemeIcon> = {
  dark: 'moon',
  light: 'sun',
  system: 'monitor',
};

const THEME_LABELS: Record<Theme, string> = {
  dark: 'Tamna',
  light: 'Svetla',
  system: 'Sistem',
};

const COMMAND_PALETTE_EVENT = 'banka:open-command-palette';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  breadcrumb: string[] = [];
  themeMenuOpen = false;
  avatarMenuOpen = false;
  watchlistMenuOpen = false;

  userInitials = '';
  watchlistPreview: WatchlistSecurity[] = [];

  private sub?: Subscription;
  private watchlistSub?: Subscription;

  readonly themes: Theme[] = ['system', 'light', 'dark'];

  constructor(
    public theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private watchlistService: WatchlistService,
  ) {}

  ngOnInit(): void {
    this.refreshBreadcrumb(this.router.url);
    this.userInitials = this.computeInitials();

    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.refreshBreadcrumb((e as NavigationEnd).urlAfterRedirects);
      });

    this.watchlistSub = this.watchlistService.watchlists$.subscribe((watchlists) => {
      this.watchlistPreview = watchlists
        .flatMap((watchlist) => watchlist.securities)
        .slice(0, 4);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.watchlistSub?.unsubscribe();
  }

  setTheme(t: Theme): void {
    this.theme.setTheme(t);
    this.themeMenuOpen = false;
  }

  openCommandPalette(): void {
    window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENT));
  }

  toggleWatchlistMenu(): void {
    const next = !this.watchlistMenuOpen;
    this.closeMenus();
    this.watchlistMenuOpen = next;
  }

  toggleThemeMenu(): void {
    const next = !this.themeMenuOpen;
    this.closeMenus();
    this.themeMenuOpen = next;
  }

  toggleAvatarMenu(): void {
    const next = !this.avatarMenuOpen;
    this.closeMenus();
    this.avatarMenuOpen = next;
  }

  closeMenus(): void {
    this.themeMenuOpen = false;
    this.avatarMenuOpen = false;
    this.watchlistMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
  }

  iconForTheme(t: Theme): ThemeIcon {
    return THEME_ICONS[t];
  }

  themeLabel(t: Theme): string {
    return THEME_LABELS[t];
  }

  formatHeaderPrice(security: WatchlistSecurity): string {
    const currency = security.currency ?? 'USD';

    return `${this.formatNumber(security.price)} ${currency}`;
  }

  formatHeaderChange(security: WatchlistSecurity): string {
    const sign = security.dailyChangePercent >= 0 ? '+' : '';

    return `${sign}${this.formatNumber(security.dailyChangePercent)}%`;
  }

  getHeaderChangeClass(security: WatchlistSecurity): string {
    if (security.dailyChangePercent > 0) {
      return 'quick-change-positive';
    }

    if (security.dailyChangePercent < 0) {
      return 'quick-change-negative';
    }

    return 'quick-change-neutral';
  }

  formatHeaderVolume(security: WatchlistSecurity): string {
    return new Intl.NumberFormat('sr-RS').format(security.volume);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.openCommandPalette();
    }

    if (e.key === 'Escape') {
      this.closeMenus();
    }
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private refreshBreadcrumb(url: string): void {
    const segments = url.split('?')[0].split('#')[0].split('/').filter(Boolean);
    this.breadcrumb = segments;
  }

  private computeInitials(): string {
    const user = this.auth.getLoggedUser();

    if (!user?.email) {
      return '?';
    }

    const local = user.email.split('@')[0] ?? '';

    if (!local) {
      return '?';
    }

    const parts = local.split(/[._-]+/).filter(Boolean);

    if (parts.length >= 2) {
      return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase() || '?';
    }

    return local.slice(0, 2).toUpperCase() || '?';
  }
}
