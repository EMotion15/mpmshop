(function () {
    const host = document.getElementById('dashboardSidebar')
    if (!host) return

    const active = host.dataset.active || 'dashboard'
    const items = [
        ['index.html', 'แดชบอร์ด', 'fa-house', 'dashboard'],
        ['transactions.html', 'รายการเติม', 'fa-receipt', 'transactions'],
        ['credit.html', 'เติมเครดิต', 'fa-coins', 'credit'],
        ['users.html', 'ลูกค้า', 'fa-users', 'users'],
        ['products.html', 'จัดการสินค้า', 'fa-box', 'products'],
        ['categories.html', 'หมวดหมู่', 'fa-layer-group', 'categories'],
        ['news.html', 'ข่าวสาร', 'fa-newspaper', 'news'],
        ['coupons.html', 'คูปองส่วนลด', 'fa-percent', 'coupons'],
        ['payments.html', 'การเงิน', 'fa-wallet', 'payments'],
        ['reports.html', 'รายงาน', 'fa-chart-column', 'reports'],
        ['settings.html', 'ตั้งค่า', 'fa-gear', 'settings']
    ]

    host.outerHTML = `
        <aside class="sidebar">
            <div class="sidebar-top">
                <div class="logo">
                    <img src="../../images/logo.gif" alt="MPMSHOP">
                    <span class="site-name">MPMSHOP</span>
                </div>
            </div>
            <div class="menu">
                ${items.map(([href, label, icon, key]) => `
                    <a href="${href}" class="menu-item${key === active ? ' active' : ''}">
                        <i class="fa-solid ${icon}"></i>
                        <span>${label}</span>
                    </a>
                `).join('')}
            </div>
            <div class="sidebar-bottom sidebar-return">
                <a href="../shop.html" class="menu-item">
                    <i class="fa-solid fa-store"></i>
                    <span>กลับหน้าร้านค้า</span>
                </a>
                <a href="../home.html" class="menu-item">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>กลับหน้าแรก</span>
                </a>
            </div>
        </aside>
    `
})()
