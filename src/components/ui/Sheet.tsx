import { useTheme } from '@/theme/ThemeProvider'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { BackHandler } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SheetProps = {
  open: boolean
  onClose: () => void
  /** Set false to block backdrop-press / swipe / back-button dismissal (e.g. while submitting). */
  dismissable?: boolean
  children: ReactNode
}

/**
 * App-styled bottom sheet (@gorhom/bottom-sheet), sized to its content.
 *
 * Uses the core inline `BottomSheet` (starting closed at index -1) rather than
 * `BottomSheetModal`, so it needs no provider/portal and overlays the screen it is
 * mounted in — including native modal routes (expo-router `presentation: 'modal'`),
 * which would cover sheets hosted by a root-level BottomSheetModalProvider.
 * Place it as a direct child of the screen's root (e.g. after the ScrollView).
 */
export function Sheet({ open, onClose, dismissable = true, children }: SheetProps) {
  const { colors, radii } = useTheme()
  const insets = useSafeAreaInsets()
  const ref = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open) ref.current?.snapToIndex(0)
    else ref.current?.close()
  }, [open])

  // Android hardware back closes the sheet instead of navigating.
  useEffect(() => {
    if (!open) return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dismissable) onClose()
      return true
    })
    return () => sub.remove()
  }, [open, dismissable, onClose])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={dismissable ? 'close' : 'none'} />
    ),
    [dismissable],
  )

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose={dismissable}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.screen, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl }}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 46, height: 5 }}
    >
      <BottomSheetView style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 14) + 22 }}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  )
}
