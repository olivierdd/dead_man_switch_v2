/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeDisabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBeVisible(): R;
      toBeHidden(): R;
      toHaveFocus(): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveAccessibleName(name: string | RegExp): R;
      toHaveAccessibleDescription(description: string | RegExp): R;
    }
  }
}

export {};
