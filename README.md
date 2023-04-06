## Installation
1. Download archive from the repository
2. Open Figma → Plugins → Development → Import plugin form manifest
3. Choose manifest.json

### Plugin works in two modes:
* Combine as Variants
* Export Selected

### Combine icons into variants
Select component icons or the whole artboard with component icons that you are going to combine and choose «Combine as Variants» option from the plugin menu. Then you’ll receive a success notification.
All the components that have names pair like «name» and «name_dark» will be combined. Component icons without pair and other objects will be ignored. If there are no suitable components you’ll receive a «Nothing to combine…» notification.

### Export variants
Select variants with paired icons that you are going to export and choose «Export Selected». Then select the directory for export. After confirmation an Exported Variants.zip will be created.
If you choose some inappropriate icons only variants with paired icons will be exported. If there are no variant with paired icons you’ll receive a «Nothing to export…» notification.