# NgInputColorPicker

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.0.

## `NgInputColorPickerComponent`

A Material-styled, form-integrated color picker input. It implements `ControlValueAccessor`, so it works with both template-driven (`ngModel`) and reactive (`formControl` / `formControlName`) forms, and emits a `'#RRGGBB'` hex string as its value.

### Peer dependencies

This component depends on the following, which must be installed in the consuming app:

- `@angular/forms`
- `@angular/cdk` (Overlay, Portal)
- `@angular/material` (Form Field, Input)
- `@ngx-translate/core` (labels/errors are passed through the `translate` pipe)

### Usage

```ts
import { NgInputColorPickerComponent } from 'ng-input-color-picker';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgInputColorPickerComponent],
  template: `
    <ng-input-color-picker
      formControlName="brandColor"
      placeholder="Brand color"
      appearance="outline"
      [isRequired]="true">
    </ng-input-color-picker>
  `
})
export class MyFormComponent { }
```

### Inputs

| Input          | Type                     | Default                        | Description                                  |
|----------------|--------------------------|---------------------------------|-----------------------------------------------|
| `placeholder`  | `string`                 | `''`                            | Label / translation key shown on the field.  |
| `isRequired`   | `boolean`                | `false`                         | Marks the field as required.                 |
| `isReadOnly`   | `boolean`                | `false`                         | Disables opening the picker panel.           |
| `isAutoFocus`  | `boolean`                | `false`                         | Opens the picker panel automatically on init.|
| `appearance`   | `MatFormFieldAppearance` | `'outline'`                    | Passed to the underlying `mat-form-field`.   |
| `presetColors` | `string[]`               | 16 built-in swatches            | Hex colors shown in the preset swatch grid.  |

### Theming

The picker's accent color (focus ring, active preset outline, "save" button) resolves automatically in this order — first one defined wins:

1. **`--icp-primary-color`** — set this anywhere above the component (e.g. on `:root` or `body`) in your global styles to theme it explicitly:
   ```css
   :root {
     --icp-primary-color: #6D28D9;
   }
   ```
2. **`--mat-sys-primary`** — if you don't set `--icp-primary-color`, the picker automatically picks up your app's Angular Material color if you're using Material's M3 system-level theming (`mat.theme(...)` / `@include mat.core-theme(...)` in your global styles). No config needed on your end — it just inherits.
3. **`#0B8135`** — hardcoded fallback if neither of the above is present.

If your app uses Material's legacy M2 theming (SCSS `$primary-color`/palette, no `--mat-sys-*` variables), there's no CSS variable to auto-detect — set `--icp-primary-color` once in your global stylesheet as shown above.

## Code scaffolding

Run `ng generate component component-name --project ng-input-color-picker` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ng-input-color-picker`.
> Note: Don't forget to add `--project ng-input-color-picker` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ng-input-color-picker` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ng-input-color-picker`, go to the dist folder `cd dist/ng-input-color-picker` and run `npm publish`.

## Running unit tests

Run `ng test ng-input-color-picker` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
