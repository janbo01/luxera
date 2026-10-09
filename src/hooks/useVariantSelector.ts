import { useState, useMemo } from 'react'
import type { ColorOption, SizeOption } from '../types'
import type { ApiProductColor, ApiProductSize, ApiProductVariant } from '../api/product'

function apiColorsToOptions(apiColors: ApiProductColor[]): ColorOption[] {
  const swatches = ['gold', 'rose', 'white'] as const
  return apiColors.map((c, i) => ({
    id: c.id,
    fa: c.name,
    swatch: swatches[i % swatches.length],
    hex: c.hex_code,
  }))
}

function apiSizesToOptions(apiSizes: ApiProductSize[]): SizeOption[] {
  return apiSizes.map((s) => ({ id: s.id, label: s.value, disabled: false }))
}

export function useVariantSelector(
  apiColors?: ApiProductColor[],
  apiSizes?: ApiProductSize[],
  apiVariants?: ApiProductVariant[],
) {
  const hasVariants = !!apiVariants?.length

  // Only real options from the API — never placeholder colours/sizes, which would
  // offer shoppers choices the product doesn't have.
  const allColorOptions = useMemo(
    () => (apiColors?.length ? apiColorsToOptions(apiColors) : []),
    [apiColors],
  )

  const allSizeOptions = useMemo(
    () => (apiSizes?.length ? apiSizesToOptions(apiSizes) : []),
    [apiSizes],
  )

  const [color, setColor] = useState(allColorOptions[0]?.id ?? '')
  const [size, setSize] = useState(
    allSizeOptions.find((s) => !s.disabled)?.id ?? allSizeOptions[0]?.id ?? '',
  )

  const colorOptions = useMemo((): ColorOption[] => {
    if (!hasVariants) return allColorOptions
    const activeVariants = apiVariants!.filter((v) => v.quantity > 0)
    const validColorIds = new Set(activeVariants.map((v) => v.color_id).filter(Boolean))
    return allColorOptions.map((c) => ({ ...c, disabled: !validColorIds.has(c.id) }))
  }, [hasVariants, apiVariants, allColorOptions])

  const sizeOptions = useMemo((): SizeOption[] => {
    if (!hasVariants) return allSizeOptions
    const relevantVariants = apiVariants!.filter(
      (v) => v.quantity > 0 && (v.color_id === color || v.color_id === null),
    )
    const validSizeIds = new Set(relevantVariants.map((v) => v.size_id).filter(Boolean))
    return allSizeOptions.map((s) => ({
      ...s,
      disabled: validSizeIds.size > 0 ? !validSizeIds.has(s.id) : s.disabled,
    }))
  }, [hasVariants, apiVariants, allSizeOptions, color])

  const selectedSizeAvailable = sizeOptions.find((s) => s.id === size && !s.disabled)
  const effectiveSize = selectedSizeAvailable
    ? size
    : (sizeOptions.find((s) => !s.disabled)?.id ?? size)

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null
    return (
      apiVariants!.find((v) => v.color_id === color && v.size_id === effectiveSize) ??
      apiVariants!.find((v) => v.color_id === color && v.size_id === null) ??
      apiVariants!.find((v) => v.color_id === null && v.size_id === effectiveSize) ??
      apiVariants!.find((v) => v.color_id === null && v.size_id === null) ??
      null
    )
  }, [hasVariants, apiVariants, color, effectiveSize])

  const selectedSize = sizeOptions.find((s) => s.id === effectiveSize)
  const selectedColor = colorOptions.find((c) => c.id === color)
  const variantQuantity = hasVariants ? (selectedVariant?.quantity ?? 0) : undefined
  // Stock lives on variants (the order service sums their quantities), so a product
  // with no variants has nothing to sell.
  const outOfStock = hasVariants ? variantQuantity === 0 : true

  return {
    color,
    setColor,
    colorOptions,
    selectedColor,
    size,
    setSize,
    sizeOptions,
    selectedSize,
    effectiveSize,
    selectedVariant,
    variantQuantity,
    outOfStock,
  }
}
