/* THEME — handled by js/theme.js (auto-wires .theme-toggle) */

/* ADMIN PROFILE DROPDOWN */

(function initAdminProfileDropdown() {
    const profile = document.querySelector('.topbar-right .profile')
    if (!profile || profile.querySelector('.admin-profile-dropdown')) return

    const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    const name = savedUser?.username || 'ADMIN'
    const role = savedUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'หลังบ้าน'
    const balance = Number(savedUser?.balance || 0).toLocaleString()
    const avatar = savedUser?.avatar || '../../images/logo.gif'

    profile.setAttribute('tabindex', '0')
    profile.innerHTML = `
        <img src="${avatar}" alt="profile">
        <div class="admin-profile-dropdown" id="adminProfileDropdown">
            <div class="admin-dropdown-header">
                <img src="${avatar}" alt="profile">
                <div>
                    <h4>${name}</h4>
                    <p>${role}</p>
                </div>
            </div>
            <div class="admin-dropdown-panel">
                <div>
                    <span>ยอดเครดิต</span>
                    <b>฿${balance}</b>
                </div>
                <div>
                    <span>สถานะ</span>
                    <b>Online</b>
                </div>
            </div>
            <a href="../shop.html">
                <i class="fa-solid fa-store"></i>
                กลับหน้าร้านค้า
            </a>
            <a href="../home.html">
                <i class="fa-solid fa-house"></i>
                กลับหน้าแรก
            </a>
            <a href="settings.html">
                <i class="fa-solid fa-gear"></i>
                ตั้งค่าร้าน
            </a>
            <button type="button" id="adminDropdownLogout">
                <i class="fa-solid fa-right-from-bracket"></i>
                ออกจากระบบ
            </button>
        </div>
    `

    const dropdown = profile.querySelector('.admin-profile-dropdown')
    profile.addEventListener('click', (e) => {
        e.stopPropagation()
        dropdown.classList.toggle('active')
    })
    document.addEventListener('click', () => dropdown.classList.remove('active'))
    profile.querySelector('#adminDropdownLogout')?.addEventListener('click', (e) => {
        e.stopPropagation()
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '../home.html'
    })
})()

/* =========================
   DASHBOARD ANALYTICS
========================= */

const THAI_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

function last7Days() {
    const labels = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        labels.push(THAI_DAYS[d.getDay()])
    }
    return labels
}

function getStoredSeries(key, generator) {
    try {
        const cached = localStorage.getItem(key)
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed.date === new Date().toDateString() && Array.isArray(parsed.data)) {
                return parsed.data
            }
        }
    } catch (e) {}

    const data = generator()
    try {
        localStorage.setItem(key, JSON.stringify({
            date: new Date().toDateString(),
            data
        }))
    } catch (e) {}
    return data
}

const revenueData = getStoredSeries('mpm_revenue_7d', () => {
    const arr = []
    for (let i = 0; i < 7; i++) {
        arr.push(Math.floor(8000 + Math.random() * 18000))
    }
    return arr
})

const lossData = getStoredSeries('mpm_loss_7d', () => {
    const arr = []
    for (let i = 0; i < 7; i++) {
        arr.push(Math.floor(1000 + Math.random() * 5500))
    }
    return arr
})

const visitorData = getStoredSeries('mpm_visitors_7d', () => {
    const arr = []
    for (let i = 0; i < 7; i++) {
        arr.push(Math.floor(200 + Math.random() * 800))
    }
    return arr
})

const todayVisitors = visitorData[visitorData.length - 1]
const elViews = document.getElementById('statViews')
if (elViews) elViews.textContent = todayVisitors.toLocaleString()

/* CHARTS */

let revenueChart, visitorChart

function chartTextColor() {
    return document.body.classList.contains('dark-mode') ? '#ccc' : '#555'
}

function chartGridColor() {
    return document.body.classList.contains('dark-mode')
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.06)'
}

function buildGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 280)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)
    return gradient
}

function initCharts() {
    const labels = last7Days()

    const revenueCanvas = document.getElementById('revenueChart')
    const visitorCanvas = document.getElementById('visitorChart')

    if (revenueCanvas) {
        const ctx = revenueCanvas.getContext('2d')

        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'รายได้',
                        data: revenueData,
                        borderColor: '#ff4da6',
                        backgroundColor: buildGradient(ctx, 'rgba(255,77,166,0.35)', 'rgba(255,77,166,0)'),
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ff4da6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'ขาดทุน',
                        data: lossData,
                        borderColor: '#4da6ff',
                        backgroundColor: buildGradient(ctx, 'rgba(77,166,255,0.25)', 'rgba(77,166,255,0)'),
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4da6ff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(20,20,28,0.95)',
                        padding: 12,
                        cornerRadius: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: (c) => ` ${c.dataset.label}: ฿${c.parsed.y.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: chartTextColor() },
                        grid: { color: chartGridColor() }
                    },
                    y: {
                        ticks: {
                            color: chartTextColor(),
                            callback: (v) => '฿' + v.toLocaleString()
                        },
                        grid: { color: chartGridColor() }
                    }
                }
            }
        })
    }

    if (visitorCanvas) {
        const ctx = visitorCanvas.getContext('2d')

        visitorChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'ผู้ชม',
                    data: visitorData,
                    backgroundColor: buildGradient(ctx, '#aa64ff', '#ff7cc8'),
                    borderRadius: 10,
                    barThickness: 22
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(20,20,28,0.95)',
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                            label: (c) => ` ${c.parsed.y.toLocaleString()} คน`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: chartTextColor() },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: chartTextColor(),
                            callback: (v) => v.toLocaleString()
                        },
                        grid: { color: chartGridColor() }
                    }
                }
            }
        })
    }
}

window.refreshChartTheme = () => {
    const charts = [revenueChart, visitorChart]
    charts.forEach((c) => {
        if (!c) return
        const scales = c.options.scales
        scales.x.ticks.color = chartTextColor()
        scales.y.ticks.color = chartTextColor()
        scales.x.grid.color = chartGridColor()
        if (scales.y.grid) scales.y.grid.color = chartGridColor()
        c.update()
    })
}

/* ONLINE USERS — heartbeat via localStorage */

const SESSION_KEY = 'mpm_session_id'
const ONLINE_KEY = 'mpm_online_users'
const HEARTBEAT_MS = 5000
const ONLINE_TIMEOUT_MS = 15000

let sessionId = sessionStorage.getItem(SESSION_KEY)
if (!sessionId) {
    sessionId = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    sessionStorage.setItem(SESSION_KEY, sessionId)
}

function readOnlineMap() {
    try {
        return JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}')
    } catch (e) {
        return {}
    }
}

function writeOnlineMap(map) {
    try {
        localStorage.setItem(ONLINE_KEY, JSON.stringify(map))
    } catch (e) {}
}

function heartbeat() {
    const now = Date.now()
    const map = readOnlineMap()
    map[sessionId] = now

    for (const k of Object.keys(map)) {
        if (now - map[k] > ONLINE_TIMEOUT_MS) delete map[k]
    }

    writeOnlineMap(map)
    renderOnline(Object.keys(map).length)
}

function renderOnline(realCount) {
    const el = document.getElementById('onlineCount')
    if (!el) return

    const simulated = 4 + Math.floor(Math.random() * 9)
    const total = realCount + simulated
    el.textContent = total.toLocaleString()
}

heartbeat()
setInterval(heartbeat, HEARTBEAT_MS)

window.addEventListener('beforeunload', () => {
    const map = readOnlineMap()
    delete map[sessionId]
    writeOnlineMap(map)
})

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts)
} else {
    initCharts()
}
