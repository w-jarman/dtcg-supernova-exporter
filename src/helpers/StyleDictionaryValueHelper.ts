import {
  AnyDimensionTokenValue,
  AnyOptionTokenValue,
  AnyStringTokenValue,
  ColorTokenValue,
  GradientTokenValue,
  ShadowTokenValue,
  Token,
  TokenType,
  TypographyTokenValue,
  Unit,
} from "@supernovaio/sdk-exporters"
import { normalizeTextWeight, sureOptionalReference } from "@supernovaio/export-utils"

export type StyleDictionaryValue = string | number | Record<string, unknown> | Array<unknown>

export type StyleDictionaryValueOptions = {
  allowReferences: boolean
  tokenToReference: (token: Token) => string
}

function referenceValue(
  referenceId: string | null | undefined,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): string | undefined {
  const reference = sureOptionalReference(referenceId, allTokens, options.allowReferences)
  return reference ? options.tokenToReference(reference) : undefined
}

function dimensionValue(
  dimension: AnyDimensionTokenValue,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  return (
    referenceValue(dimension.referencedTokenId, allTokens, options) || {
      value: dimension.measure,
      unit: unitName(dimension.unit),
    }
  )
}

function unitName(unit: Unit): string {
  switch (unit) {
    case Unit.pixels:
      return "px"
    case Unit.rem:
      return "rem"
    case Unit.percent:
      return "%"
    case Unit.ms:
      return "ms"
    case Unit.raw:
      return "raw"
    default:
      return String(unit)
  }
}

function optionValue(
  option: AnyOptionTokenValue,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  return referenceValue(option.referencedTokenId, allTokens, options) || option.value
}

function stringValue(
  value: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  return referenceValue(value.referencedTokenId, allTokens, options) || value.text
}

function colorValue(
  color: ColorTokenValue,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  const reference = referenceValue(color.referencedTokenId, allTokens, options)
  if (reference) return reference

  const opacity = color.opacity
  return {
    colorSpace: "srgb",
    components: [color.color.r / 255, color.color.g / 255, color.color.b / 255],
    alpha: opacity.measure,
  }
}

function typographyValue(
  typography: TypographyTokenValue,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  const reference = referenceValue(typography.referencedTokenId, allTokens, options)
  if (reference) return reference

  const value: Record<string, unknown> = {
    fontFamily: stringValue(typography.fontFamily, allTokens, options),
    fontWeight:
      referenceValue(typography.fontWeight.referencedTokenId, allTokens, options) ||
      normalizeTextWeight(typography.fontWeight.text),
    fontSize: dimensionValue(typography.fontSize, allTokens, options),
    letterSpacing: dimensionValue(typography.letterSpacing, allTokens, options),
    textCase: optionValue(typography.textCase, allTokens, options),
    textDecoration: optionValue(typography.textDecoration, allTokens, options),
    paragraphIndent: dimensionValue(typography.paragraphIndent, allTokens, options),
    paragraphSpacing: dimensionValue(typography.paragraphSpacing, allTokens, options),
  }

  if (typography.lineHeight) {
    value.lineHeight = dimensionValue(typography.lineHeight, allTokens, options)
  }

  return value
}

function shadowValue(
  shadows: Array<ShadowTokenValue>,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  return shadows.map((shadow) => {
    const reference = referenceValue(shadow.referencedTokenId, allTokens, options)
    if (reference) return reference

    return {
      color: colorValue(shadow.color, allTokens, options),
      offsetX: { value: shadow.x, unit: "px" },
      offsetY: { value: shadow.y, unit: "px" },
      blur: { value: shadow.radius, unit: "px" },
      spread: { value: shadow.spread, unit: "px" },
      type: String(shadow.type),
    }
  })
}

function gradientValue(
  gradients: Array<GradientTokenValue>,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  return gradients.map((gradient) => {
    const reference = referenceValue(gradient.referencedTokenId, allTokens, options)
    if (reference) return reference

    return {
      type: String(gradient.type),
      stops: gradient.stops.map((stop) => ({
        color: colorValue(stop.color, allTokens, options),
        position: stop.position,
      })),
    }
  })
}

export function tokenToStyleDictionaryValue(
  token: Token,
  allTokens: Map<string, Token>,
  options: StyleDictionaryValueOptions
): StyleDictionaryValue {
  const tokenValue = (token as any).value

  switch (token.tokenType) {
    case TokenType.color:
      return colorValue(tokenValue, allTokens, options)
    case TokenType.typography:
      return typographyValue(tokenValue, allTokens, options)
    case TokenType.shadow:
      return shadowValue(tokenValue, allTokens, options)
    case TokenType.gradient:
      return gradientValue(tokenValue, allTokens, options)
    case TokenType.border:
      return {
        color: colorValue(tokenValue.color, allTokens, options),
        width: dimensionValue(tokenValue.width, allTokens, options),
        style: String(tokenValue.style),
        position: String(tokenValue.position),
      }
    case TokenType.blur:
      return {
        type: String(tokenValue.type),
        radius: dimensionValue(tokenValue.radius, allTokens, options),
      }
    case TokenType.fontWeight:
      return stringValue(tokenValue, allTokens, options) === tokenValue.text
        ? normalizeTextWeight(tokenValue.text)
        : stringValue(tokenValue, allTokens, options)
    case TokenType.fontFamily:
    case TokenType.productCopy:
    case TokenType.string:
      return stringValue(tokenValue, allTokens, options)
    case TokenType.textCase:
    case TokenType.textDecoration:
    case TokenType.visibility:
      return optionValue(tokenValue, allTokens, options)
    case TokenType.dimension:
    case TokenType.size:
    case TokenType.space:
    case TokenType.opacity:
    case TokenType.fontSize:
    case TokenType.lineHeight:
    case TokenType.letterSpacing:
    case TokenType.paragraphSpacing:
    case TokenType.borderWidth:
    case TokenType.radius:
    case TokenType.duration:
    case TokenType.zIndex:
      return dimensionValue(tokenValue, allTokens, options)
    default:
      return String(tokenValue)
  }
}
