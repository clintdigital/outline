// @flow
import { v4 } from 'uuid';
import { orderBy } from 'lodash';
import { observable, action, autorun, computed } from 'mobx';
import Document from 'models/Document';
import Collection from 'models/Collection';
import type { Toast } from '../types';

const UI_STORE = 'UI_STORE';

class UiStore {
  @observable theme: 'light' | 'dark';
  @observable activeModalName: ?string;
  @observable activeModalProps: ?Object;
  @observable activeDocumentId: ?string;
  @observable activeCollectionId: ?string;
  @observable progressBarVisible: boolean = false;
  @observable editMode: boolean = false;
  @observable tocVisible: boolean = false;
  @observable mobileSidebarVisible: boolean = false;
  @observable toasts: Map<string, Toast> = new Map();

  constructor() {
    // Rehydrate
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(UI_STORE) || '{}');
    } catch (_) {
      // no-op Safari private mode
    }

    // persisted keys
    this.tocVisible = data.tocVisible;
    this.theme = data.theme || 'light';

    autorun(() => {
      try {
        localStorage.setItem(UI_STORE, this.asJson);
      } catch (_) {
        // no-op Safari private mode
      }
    });
  }

  @action
  toggleDarkMode = () => {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';

    if (window.localStorage) {
      window.localStorage.setItem('theme', this.theme);
    }
  };

  @action
  setActiveModal = (name: string, props: ?Object): void => {
    this.activeModalName = name;
    this.activeModalProps = props;
  };

  @action
  clearActiveModal = (): void => {
    this.activeModalName = undefined;
    this.activeModalProps = undefined;
  };

  @action
  setActiveDocument = (document: Document): void => {
    this.activeDocumentId = document.id;

    if (document.publishedAt && !document.isArchived && !document.isDeleted) {
      this.activeCollectionId = document.collectionId;
    }
  };

  @action
  setActiveCollection = (collection: Collection): void => {
    this.activeCollectionId = collection.id;
  };

  @action
  clearActiveCollection = (): void => {
    this.activeCollectionId = undefined;
  };

  @action
  clearActiveDocument = (): void => {
    this.activeDocumentId = undefined;
    this.activeCollectionId = undefined;
  };

  @action
  showTableOfContents = () => {
    this.tocVisible = true;
  };

  @action
  hideTableOfContents = () => {
    this.tocVisible = false;
  };

  @action
  enableEditMode() {
    this.editMode = true;
  }

  @action
  disableEditMode() {
    this.editMode = false;
  }

  @action
  enableProgressBar() {
    this.progressBarVisible = true;
  }

  @action
  disableProgressBar() {
    this.progressBarVisible = false;
  }

  @action
  toggleMobileSidebar() {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  @action
  hideMobileSidebar() {
    this.mobileSidebarVisible = false;
  }

  @action
  showToast = (
    message: string,
    options?: {
      type?: 'warning' | 'error' | 'info' | 'success',
      timeout?: number,
      action?: {
        text: string,
        onClick: () => void,
      },
    }
  ) => {
    if (!message) return;

    const id = v4();
    const createdAt = new Date().toISOString();
    this.toasts.set(id, { message, createdAt, id, ...options });
    return id;
  };

  @action
  removeToast = (id: string) => {
    this.toasts.delete(id);
  };

  @computed
  get orderedToasts(): Toast[] {
    return orderBy(Array.from(this.toasts.values()), 'createdAt', 'desc');
  }

  @computed
  get asJson(): string {
    return JSON.stringify({
      tocVisible: this.tocVisible,
      theme: this.theme,
    });
  }
}

export default UiStore;
