import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

/**
 * Hides the CoreUI sidebar while the calling screen is mounted,
 * and restores whatever state it was in before, on unmount.
 *
 * Usage: just call it at the top of any screen component.
 *   const RevenueAnalytics = () => {
 *     useAutoHideSidebar()
 *     ...
 *   }
 */
const useAutoHideSidebar = () => {
    const dispatch = useDispatch()
    const sidebarShow = useSelector((state) => state.sidebarShow)

    useEffect(() => {
        const wasOpen = sidebarShow
        dispatch({ type: 'set', sidebarShow: false })
        return () => {
            dispatch({ type: 'set', sidebarShow: wasOpen })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

export default useAutoHideSidebar