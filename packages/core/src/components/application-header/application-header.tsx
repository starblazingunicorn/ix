/*
 * SPDX-FileCopyrightText: 2023 Siemens AG
 *
 * SPDX-License-Identifier: MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, Element, h, Host, Prop, State } from '@stencil/core';
import { applicationLayoutService } from '../utils/application-layout';
import { Breakpoint } from '../utils/breakpoints';
import { menuController } from '../utils/menu-service/menu-service';
import { Disposable } from '../utils/typed-event';

@Component({
  tag: 'ix-application-header',
  styleUrl: 'application-header.scss',
  shadow: true,
})
export class ApplicationHeader {
  @Element() hostElement!: HTMLIxApplicationHeaderElement;

  /**
   * Application name
   */
  @Prop() name: string;

  @State() breakpoint: Breakpoint = 'lg';
  @State() menuExpanded = false;

  private menuDisposable?: Disposable;
  private modeDisposable?: Disposable;

  componentWillLoad() {
    this.menuDisposable = menuController.expandChange.on((show) => {
      this.menuExpanded = show;
    });

    this.modeDisposable = applicationLayoutService.onChange.on((mode) => {
      this.breakpoint = mode;
    });
    this.breakpoint = applicationLayoutService.breakpoint;
  }

  componentDidLoad() {
    this.attachSiemensLogoIfLoaded();
  }

  disconnectedCallback() {
    this.menuDisposable?.dispose();
    this.modeDisposable?.dispose();
  }

  private isLogoSlotted() {
    const slotElement = this.hostElement.shadowRoot.querySelector(
      'slot[name="logo"]'
    ) as HTMLSlotElement;
    const nodes = slotElement.assignedNodes({
      flatten: true,
    });

    return nodes.length !== 0;
  }

  private async attachSiemensLogoIfLoaded() {
    await window.customElements.whenDefined('ix-siemens-logo');
    const logoElement = document.createElement('ix-siemens-logo');
    if (!this.isLogoSlotted()) {
      this.hostElement.shadowRoot
        .querySelector('.logo')
        .appendChild(logoElement);
    }
  }

  private async onMenuClick() {
    menuController.toggle();
  }

  render() {
    return (
      <Host
        class={{ [`breakpoint-${this.breakpoint}`]: true }}
        slot="application-header"
      >
        {this.breakpoint === 'sm' ? (
          <ix-burger-menu
            onClick={() => this.onMenuClick()}
            expanded={this.menuExpanded}
          ></ix-burger-menu>
        ) : null}
        <div class="logo">
          <slot name="logo"></slot>
        </div>
        <div class="name">{this.name}</div>
        <slot></slot>
      </Host>
    );
  }
}
