/* =========================
   MPM SHOP — GLOBAL THEME
   key: mpmTheme  ('dark' | 'light')

   - Single source of truth across every page
   - Migrates from old keys (homeTheme / shopTheme / dashboardTheme)
   - Auto-wires any element with `.theme-toggle`
   - Plays radial reveal animation on `.theme-transition`
   - Cross-tab sync via `storage` event
   - Anti-FOUC: applies class to <html> before <body> parses
========================= */

(function () {

    const KEY = 'mpmTheme'

    /* MIGRATE */

    let saved = localStorage.getItem(KEY)
    if (!saved) {
        saved =
            localStorage.getItem('homeTheme') ||
            localStorage.getItem('shopTheme') ||
            localStorage.getItem('dashboardTheme')

        if (saved) localStorage.setItem(KEY, saved)
    }

    const isDarkInit = saved === 'dark'

    /* APPLY EARLY ON <html> TO AVOID FOUC */

    apply(isDarkInit)

    function apply(isDark) {
        const html = document.documentElement.classList

        if (isDark) {
            html.add('dark-mode')
            /* Anti-FOUC: paint <html> background before <body> parses */
            document.documentElement.style.background = '#0f0f14'
        } else {
            html.remove('dark-mode')
            document.documentElement.style.background = ''
        }

        if (document.body) {
            const body = document.body.classList
            if (isDark) {
                body.add('dark-mode')
            } else {
                body.remove('dark-mode')
            }
        }
    }

    /* OBSERVE FOR <body> SO WE CAN MIRROR CLASS ASAP */

    if (!document.body) {
        const obs = new MutationObserver(() => {
            if (document.body) {
                apply(document.documentElement.classList.contains('dark-mode'))
                obs.disconnect()
                wireAll()
            }
        })
        obs.observe(document.documentElement, { childList: true, subtree: true })
    } else {
        wireAll()
    }

    document.addEventListener('DOMContentLoaded', wireAll)

    /* WIRE TOGGLES */

    function wireAll() {
        const toggles = document.querySelectorAll('.theme-toggle')

        toggles.forEach((btn) => {
            if (btn.dataset.themeBound) return
            btn.dataset.themeBound = '1'

            paintIcon(btn)

            btn.addEventListener('click', (e) => {
                e.preventDefault?.()
                toggle(btn)
            })
        })
    }

    function paintIcon(btn) {
        const isDark = document.documentElement.classList.contains('dark-mode')
        btn.innerHTML = isDark ? '🌙' : '☀️'
        btn.setAttribute('aria-label', isDark ? 'Dark mode' : 'Light mode')
    }

    /* RADIAL REVEAL + RAPID-CLICK GUARD
       - Normal single click: play the radial reveal animation
       - Rapid clicks (< RAPID_MS): kill any in-flight overlay so the
         stale color doesn't flash, and skip starting a new one.
       Theme itself always toggles instantly regardless of guard. */

    let animLock  = false
    let lastClick = 0
    const RAPID_MS = 450

    function killOverlay(trans) {
        if (!trans) return
        trans.classList.remove('active')
        trans.style.opacity = '0'
        setTimeout(() => { trans.style.opacity = '' }, 60)
        animLock = false
    }

    function toggle(originBtn) {
        const now     = Date.now()
        const isRapid = (now - lastClick) < RAPID_MS
        lastClick = now

        const wasDark   = document.documentElement.classList.contains('dark-mode')
        const goingDark = !wasDark

        apply(goingDark)
        localStorage.setItem(KEY, goingDark ? 'dark' : 'light')

        document.querySelectorAll('.theme-toggle').forEach(paintIcon)

        const trans = document.querySelector('.theme-transition')

        if (isRapid) {
            /* user mashing the button — keep theme switch but suppress overlay */
            killOverlay(trans)
        } else if (trans && originBtn && !animLock) {
            animLock = true

            const rect = originBtn.getBoundingClientRect()
            const x = rect.left + rect.width / 2
            const y = rect.top + rect.height / 2

            trans.style.setProperty('--x', x + 'px')
            trans.style.setProperty('--y', y + 'px')
            trans.style.background = goingDark ? '#0f0f14' : '#fff7fb'

            trans.classList.remove('active')
            void trans.offsetWidth
            trans.classList.add('active')

            const release = () => {
                animLock = false
                trans.removeEventListener('animationend',    release)
                trans.removeEventListener('animationcancel', release)
            }
            trans.addEventListener('animationend',    release, { once: true })
            trans.addEventListener('animationcancel', release, { once: true })

            /* safety net in case animationend never fires */
            setTimeout(release, 1800)
        }

        /* HOOKS (dashboard chart relies on this) */

        if (typeof window.refreshChartTheme === 'function') {
            window.refreshChartTheme()
        }

        window.dispatchEvent(new CustomEvent('mpm-theme-change', {
            detail: { theme: goingDark ? 'dark' : 'light' }
        }))
    }

    /* CROSS-TAB SYNC */

    window.addEventListener('storage', (e) => {
        if (e.key !== KEY) return
        apply(e.newValue === 'dark')
        document.querySelectorAll('.theme-toggle').forEach(paintIcon)
        if (typeof window.refreshChartTheme === 'function') {
            window.refreshChartTheme()
        }
    })

    /* PUBLIC API */

    window.MPMTheme = {
        toggle,
        apply,
        get isDark() {
            return document.documentElement.classList.contains('dark-mode')
        },
        set: (mode) => {
            const dark = mode === 'dark'
            apply(dark)
            localStorage.setItem(KEY, dark ? 'dark' : 'light')
            document.querySelectorAll('.theme-toggle').forEach(paintIcon)
        }
    }

})()
