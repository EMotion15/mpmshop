/* =========================
   MPM SHOP — SITE CONFIG
   key: mpm_site_config

   {
     siteName:      'MPMSHOP',
     bannerUrl:     '../images/banner.png',
     announcements: ['🎀 ...', '✨ ...']
   }

   - Read from localStorage on every page load
   - Apply to elements with these markers:
       .site-name          → text replaced with siteName
       .site-banner        → img src replaced with bannerUrl
       .site-announcements → inner replaced with marquee items
   - Updates broadcast to other tabs via `storage` event
========================= */

(function () {

    const KEY = 'mpm_site_config'

    const DEFAULT = {
        siteName:  'MPMSHOP',
        bannerUrl: '',
        announcements: [],
        tenantTheme: 'pink'
    }

    function read() {
        try {
            const s = JSON.parse(localStorage.getItem(KEY))
            if (s) return { ...DEFAULT, ...s }
        } catch (e) {}
        return DEFAULT
    }

    function write(cfg) {
        localStorage.setItem(KEY, JSON.stringify(cfg))
        apply(cfg)
        /* notify within same tab too */
        window.dispatchEvent(new CustomEvent('mpm-site-config-change', { detail: cfg }))
    }

    function apply(cfg) {
        cfg = cfg || read()

        /* SITE NAME */

        document.querySelectorAll('.site-name').forEach(el => {
            el.textContent = cfg.siteName
        })

        /* BANNER */

        if (cfg.bannerUrl) {
            document.querySelectorAll('img.site-banner').forEach(img => {
                img.src = cfg.bannerUrl
            })
        }

        /* ANNOUNCEMENTS */

        const announceContainers = document.querySelectorAll('.site-announcements')
        const list = cfg.announcements || []

        const items = list
            .map(t => `<span>${escapeHtml(t)}</span>`)
            .join('')

        announceContainers.forEach(el => {
            el.innerHTML = items

            /* hide the whole announcement bar when empty */
            const bar = el.closest('.announcement-bar, .home-announce')
            if (bar) bar.style.display = list.length ? '' : 'none'
        })

        document.body.classList.forEach(name => {
            if (name.startsWith('tenant-theme-')) document.body.classList.remove(name)
        })
        document.body.classList.add('tenant-theme-' + (cfg.tenantTheme || 'pink'))
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
        })[c])
    }

    /* APPLY ON LOAD */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => apply())
    } else {
        apply()
    }

    /* CROSS-TAB SYNC */

    window.addEventListener('storage', (e) => {
        if (e.key === KEY) apply()
    })

    /* PUBLIC API */

    window.MPMSite = { read, write, apply, KEY }

})()

