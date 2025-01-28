//Базовый компонент

export abstract class Component<T> {
  protected constructor(protected readonly container: HTMLElement) {}

  toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  }

  setText(element: HTMLElement, value: unknown): void {
    if (element) {
      element.textContent = String(value);
    }
  }

  setDisabled(element: HTMLElement, state: boolean): void {
    if (state) element.setAttribute('disabled', 'disabled');
    else element.removeAttribute('disabled');
  }

  setImage(element: HTMLImageElement, src: string, alt?: string): void {
    element.src = src;
    if (alt) element.alt = alt;
  }

  protected getElement(selector: string): HTMLElement {
    const element = this.container.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return element as HTMLElement;
  }
}
