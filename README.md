![Style Dictionary v5 Exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/style-dictionary/resources/header.png)

# Style Dictionary v5 (DTCG) Exporter

This exporter produces semantic DTCG token source files for Style Dictionary v5. It preserves composite values such as typography, shadows, borders, and dimensions so Style Dictionary can transform them independently for CSS, Android, iOS, or other platforms.

## Exporter features

This exporter package takes your design system tokens and converts them to Style Dictionary format in various ways. Here are its key features:

- **Support for all Supernova token types:** Generates Style Dictionary JSON from all token types, including colors, text styles, shadows, dimensions and more.
- **Branding support:** Can generate code for different brands you've defined in Supernova.
- **Theming support:** Can generate code for different themes you've defined in Supernova.
- **Customizable output:** Can be configured to generate Style Dictionary JSON in variety of ways.
- **Semantic values:** Emits `$value`, `$type`, and `$description` instead of CSS shorthand strings.
- **Comment support:** Can include descriptions for each token as metadata, if provided. Can also provide a disclaimer at the top of each file to prevent people from tinkering with the generated code manually.
- **File organization:** Can generate output in various ways, such as separate files for each token type, or a single file with all tokens.

## Example of output

Given the following design system token (meta representation for brevity):

```json
{
  "color": {
    "buttonPrimaryBackground": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0, 0, 0],
        "alpha": 1
      },
      "$description": "Primary button background color"
    }
  }
}
```

With configurations:

```json
{
    "showDescriptions": true,
    "useReferences": true,
    "tokenNameStyle": "constantCase",
    "indent": 2
}
```

The exporter would produce:

```json
{
  "_comment": "This file was generated automatically by Supernova.io and should not be changed manually.",
  "color": {
    "buttonPrimaryBackground": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0, 0, 0],
        "alpha": 1
      },
      "$description": "Primary button background color"
    }
  }
}
```

## Configuration options

Here is a list of all the configuration options this exporter provides:

### Token names
- **tokenNameStructure:** Control what parts are included in the exported token names:
  - `pathAndName` (default): Include path and name (e.g. button-primary-background)
  - `nameOnly`: Only include name (e.g. background)
  - `collectionPathAndName`: Include collection, path, and name (e.g. core-button-primary-background)
- **tokenNameStyle:** Define the naming convention of the exported tokens (camelCase, constantCase, flatCase, pascalCase, or snakeCase)
- **globalNamePrefix:** Prefix all token names (e.g., 'ds_color_primary')
- **useTokenTypePrefixes:** Control whether token names are prefixed with their type (e.g., 'color.primary' vs just 'primary')
- **customizeTokenPrefixes:** Customize the prefixes for each design token type
- **tokenPrefixes:** Define specific prefixes for each token type (when customizeTokenPrefixes is enabled)

### Token values
- **useReferences:** Preserve references to other tokens where applicable.
- **DTCG values:** Composite tokens remain structured objects for downstream transforms.

### Themes
- **exportThemesAs:** Control how themes are exported:
  - Separate files (one file per theme)
  - Applied directly (themes applied to base values)
  - Merged theme (all themes applied together in one file)
  - Nested themes (themes as nested values per token)
- **exportOnlyThemedTokens:** Only include tokens that differ from base values in theme files.
- **exportBaseValues:** Include base token values along with themes.

### Style files
- **generateEmptyFiles:** Generate empty files instead of omitting them.
- **fileStructure:** Control how token styles are organized in files:
  - `separateByType` (default): Generate separate files for each token type
  - `singleFile`: Generate one file containing all token types
- **baseStyleFilePath:** Directory path for files relative to export root.
- **customizeStyleFileNames:** Enable custom file names for each token type.
- **styleFileNames:** Define specific file names for each token type (when customizeStyleFileNames is enabled).
- **tokenSortOrder:** Control how token names are sorted in generated files (default order or alphabetical).

### Other
- **showDescriptions:** Display descriptions for each token as metadata.
- **showGeneratedFileDisclaimer:** Show a disclaimer indicating the file is auto-generated.
- **disclaimer:** Set the text of the auto-generation disclaimer.
- **indent:** Number of spaces used for indentation.

## Possible future improvements

Here are some planned improvements for future versions:

- **Custom Category Support**: Allow custom categorization of tokens beyond the default token types

- **Advanced Reference Resolution**: Enhanced token reference resolution with fallback values and conditional references:
  ```json
  {
    "color": {
      "primary": {
        "value": "{color.brand.primary.value || color.default.primary.value}"
      }
    }
  }
  ```