/* THEME — handled by js/theme.js (auto-wires .theme-toggle) */

const categoryGrid = document.getElementById('categoryGrid')
const productGrid = document.getElementById('productGrid')
const footerTopupLink = document.getElementById('footerTopupLink')
const footerOrdersLink = document.getElementById('footerOrdersLink')

const categories = JSON.parse(localStorage.getItem('categories')) || []
let products = []

const API_URL = 'http://localhost:5000/api/products'
const ORDER_API_URL = 'http://localhost:5000/api/orders'

categoryGrid.innerHTML = ''

categories.forEach(category => {
    categoryGrid.innerHTML += `
        <div class="category-card category-banner" data-category="${category.name}">
            <div class="category-banner-image">
                <img src="${category.image || '../images/banner.png'}">
            </div>

            <div class="category-banner-info">
                <div>
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </div>

                <span>10.00 - 999.99</span>
            </div>
        </div>
    `
})

async function loadProductsFromAPI() {
    const res = await fetch(API_URL)
    products = await res.json()
    renderShopProducts()
}

function renderShopProducts(categoryName = 'all') {
    productGrid.innerHTML = ''

    const filteredProducts =
        categoryName === 'all'
            ? products
            : products.filter(product => product.category === categoryName)

    filteredProducts.forEach((product, index) => {
        const badge =
            index % 3 === 0 ? 'Best Seller' :
                index % 3 === 1 ? 'Hot' :
                    ''

        productGrid.innerHTML += `
            <div class="product-card premium-product"
                data-id="${product._id}"
                data-price="${Number(product.price || 0)}"
                data-stock="${Number(product.stock || 0)}"
                data-name="${product.name}"
                data-image="${product.image || '../images/no-image.png'}">
                ${badge ? `<div class="product-badge">${badge}</div>` : ''}

                <img src="${product.image || '../images/no-image.png'}" class="product-image">

                <div class="product-content">
                    <h3>${product.name}</h3>

                    <p class="product-desc">
                        ${product.description || 'รายละเอียดสินค้า'}
                    </p>

                    <div class="product-row">
                        <div class="product-price">
                            ฿${product.price}
                        </div>

                        <span class="stock-pill">
                            พร้อมขาย
                        </span>
                    </div>

                    <button class="buy-btn" data-product="${product._id}">
                        สั่งซื้อสินค้า
                    </button>

                    <div class="stock-text">
                        สินค้าคงเหลือ ${product.stock || 0} ชิ้น
                    </div>
                </div>
            </div>
        `
    })
}

loadProductsFromAPI()

footerTopupLink?.addEventListener('click', (e) => {
    e.preventDefault()
    openTopupBtn?.click()
})

footerOrdersLink?.addEventListener('click', (e) => {
    e.preventDefault()
    openHistoryBtn?.click()
})

categoryGrid.onclick = (e) => {
    const card = e.target.closest('.category-card')
    if (!card) return

    document.querySelectorAll('.category-card').forEach(item => {
        item.classList.remove('active')
    })

    card.classList.add('active')

    const categoryName = card.dataset.category
    renderShopProducts(categoryName)
}

/* PRODUCT MODAL */

const productModal = document.getElementById('productModal')
const closeModal = document.getElementById('closeModal')
const modalProductName = document.getElementById('modalProductName')
const modalPrice = document.getElementById('modalPrice')
const modalStock = document.getElementById('modalStock')
const modalQty = document.getElementById('modalQty')
const modalTotal = document.getElementById('modalTotal')
const qtyMinus = document.getElementById('qtyMinus')
const qtyPlus = document.getElementById('qtyPlus')
const modalBuyBtn = document.querySelector('.modal-buy-btn')

let currentProductPrice = 0
let currentProductStock = 0
let currentProductData = null

function getCurrentUserKey(user = JSON.parse(localStorage.getItem('user') || 'null')) {
    if (!user) return 'guest'
    return user.id || user._id || user.email || user.username || 'guest'
}

function getOrderHistoryKey(user) {
    return `mpm_order_history_${getCurrentUserKey(user)}`
}

function readLocalOrderHistory(user) {
    return JSON.parse(localStorage.getItem(getOrderHistoryKey(user)) || '[]')
}

function writeLocalOrderHistory(list, user) {
    localStorage.setItem(getOrderHistoryKey(user), JSON.stringify(list.slice(0, 100)))
}

function updateModalTotal() {
    const qty = Number(modalQty.value) || 1
    modalTotal.innerText = (currentProductPrice * qty).toLocaleString()
}

productGrid.onclick = (e) => {
    if (e.target.classList.contains('buy-btn')) {
        const card = e.target.closest('.premium-product')

        const id = card.dataset.id
        const name = card.dataset.name || card.querySelector('h3').innerText
        const price = Number(card.dataset.price || 0)
        const description = card.querySelector('.product-desc').innerText
        const image = card.dataset.image || card.querySelector('.product-image').src
        const stock = Number(card.dataset.stock || 0)

        modalProductName.innerText = name
        modalPrice.innerText = price
        modalStock.innerText = stock

        document.querySelector('.modal-description').innerText = description
        document.querySelector('.modal-image').src = image
        currentProductData = { id, name, price, description, image }

        currentProductPrice = price
        currentProductStock = stock

        modalQty.value = 1
        modalQty.max = currentProductStock

        updateModalTotal()
        if (modalBuyBtn) {
            modalBuyBtn.innerHTML = token && savedUser
                ? '<i class="fa-solid fa-wallet"></i> ชำระด้วยเครดิตในเว็บ'
                : '<i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบเพื่อสั่งซื้อ'
        }
        productModal.classList.add('active')
    }
}

closeModal.onclick = () => {
    productModal.classList.remove('active')
}

productModal.onclick = (e) => {
    if (e.target === productModal) {
        productModal.classList.remove('active')
    }
}

qtyPlus.onclick = () => {
    if (Number(modalQty.value) < currentProductStock) {
        modalQty.value = Number(modalQty.value) + 1
        updateModalTotal()
    }
}

qtyMinus.onclick = () => {
    if (Number(modalQty.value) > 1) {
        modalQty.value = Number(modalQty.value) - 1
        updateModalTotal()
    }
}

modalQty.oninput = () => {
    if (Number(modalQty.value) < 1) {
        modalQty.value = 1
    }

    if (Number(modalQty.value) > currentProductStock) {
        modalQty.value = currentProductStock
    }

    updateModalTotal()
}

modalBuyBtn?.addEventListener('click', async () => {
    const latestUser = JSON.parse(localStorage.getItem('user') || 'null')
    const latestToken = localStorage.getItem('token')

    if (!latestUser || !latestToken) {
        toast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ')
        setTimeout(() => { window.location.href = 'login.html' }, 700)
        return
    }

    if (!currentProductData?.id) {
        toast('ไม่พบรหัสสินค้า กรุณารีเฟรชหน้าแล้วลองใหม่')
        return
    }

    const qty = Number(modalQty.value) || 1
    modalBuyBtn.disabled = true
    const oldButtonText = modalBuyBtn.innerHTML
    modalBuyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังสั่งซื้อ...'

    try {
        const res = await fetch(ORDER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${latestToken}`
            },
            body: JSON.stringify({
                productId: currentProductData.id,
                quantity: qty
            })
        })

        const data = await res.json()

        if (!res.ok) {
            toast(data.message || 'สั่งซื้อไม่สำเร็จ')
            return
        }

        localStorage.setItem('user', JSON.stringify(data.user))
        if (dropdownBalance) dropdownBalance.innerText = Number(data.user.balance || 0).toLocaleString()

        const order = {
            id: data.order._id,
            name: data.order.productName,
            image: data.order.productImage || currentProductData.image,
            qty: data.order.quantity,
            total: data.order.total,
            status: data.order.status,
            time: data.order.createdAt || new Date().toISOString(),
            rentalKeys: data.order.rentalKeys || []
        }

        const orders = readLocalOrderHistory(data.user)
        orders.unshift(order)
        writeLocalOrderHistory(orders, data.user)

        const txs = JSON.parse(localStorage.getItem('mpm_transactions') || '[]')
        txs.unshift({
            id: 'TX' + Date.now(),
            type: 'purchase',
            method: 'balance',
            user: data.user.username || latestUser.username || 'User',
            userId: data.user.id || latestUser.id || latestUser._id || '-',
            amount: data.order.total,
            status: 'approved',
            time: order.time,
            note: order.name
        })
        localStorage.setItem('mpm_transactions', JSON.stringify(txs.slice(0, 250)))
        localStorage.removeItem('mpm_active_coupon')

        toast(`สั่งซื้อสำเร็จ หักเครดิต ฿${Number(data.order.total).toLocaleString()}`)
        productModal.classList.remove('active')
        await loadProductsFromAPI()
    } catch (err) {
        toast('เชื่อมต่อระบบสั่งซื้อไม่ได้ กรุณาตรวจสอบ backend')
    } finally {
        modalBuyBtn.disabled = false
        modalBuyBtn.innerHTML = oldButtonText
    }
})
/* LOGIN STATE */

const guestActions = document.getElementById('guestActions')
const userMenu = document.getElementById('userMenu')
const userProfileBtn = document.getElementById('userProfileBtn')
const profileDropdown = document.getElementById('profileDropdown')
const logoutBtn = document.getElementById('logoutBtn')

const profileName = document.getElementById('profileName')
const dropdownName = document.getElementById('dropdownName')
const dropdownRole = document.getElementById('dropdownRole')
const dropdownBalance = document.getElementById('dropdownBalance')
const adminLink = document.getElementById('adminLink')

const savedUser = JSON.parse(localStorage.getItem('user'))
const token = localStorage.getItem('token')

if (token && savedUser) {

    guestActions.style.display = 'none'
    userMenu.style.display = 'flex'

    profileName.innerText = savedUser.username
    dropdownName.innerText = savedUser.username
    dropdownBalance.innerText = savedUser.balance || 0

    dropdownRole.innerText =
        savedUser.role === 'admin'
            ? 'ผู้ดูแลระบบ'
            : 'สมาชิกทั่วไป'

    if (adminLink) {
        adminLink.style.display =
            savedUser.role === 'admin' ? 'flex' : 'none'
    }

    refreshCurrentUser()

} else {

    guestActions.style.display = 'flex'
    userMenu.style.display = 'none'

}

async function refreshCurrentUser() {
    try {
        const res = await fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) return

        localStorage.setItem('user', JSON.stringify(data))
        if (profileName) profileName.innerText = data.username
        if (dropdownName) dropdownName.innerText = data.username
        if (dropdownBalance) dropdownBalance.innerText = Number(data.balance || 0).toLocaleString()
    } catch (err) {}
}

userProfileBtn.onclick = () => {
    profileDropdown.classList.toggle('active')
}

logoutBtn.onclick = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('mpm_active_coupon')

    window.location.reload()
}

document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        profileDropdown.classList.remove('active')
    }
})

/* =========================
   TOPUP MODAL
========================= */

const topupModal     = document.getElementById('topupModal')
const openTopupBtn   = document.getElementById('openTopupBtn')
const closeTopup     = document.getElementById('closeTopup')
const topupAmountIn  = document.getElementById('topupAmount')
const topupTotal     = document.getElementById('topupTotal')
const selectedName   = document.getElementById('selectedMethodName')
const topupDetail    = document.getElementById('topupDetail')
const nextBtn        = document.getElementById('topupNextBtn')
const confirmBtn     = document.getElementById('topupConfirmBtn')

const DEFAULT_PAYMENTS = {
    promptpay: {
        enabled: true,
        name:    'พร้อมเพย์ (PromptPay)',
        number:  '094-XXX-XXXX',
        holder:  'MPM SHOP CO., LTD.'
    },
    truewallet: {
        enabled: true,
        name:    'True Money Wallet',
        phone:   '094-XXX-XXXX',
        holder:  'MPM SHOP'
    },
    card: {
        enabled: true,
        name:    'บัตรเครดิต / เดบิต',
        fee:     '2.5%'
    },
    banking: {
        enabled: true,
        name:    'Internet Banking',
        banks:   ['scb', 'kbk', 'bay', 'ktb']
    }
}

function getPayConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem('mpm_payments_config'))
        if (saved) return { ...DEFAULT_PAYMENTS, ...saved }
    } catch (e) {}
    return DEFAULT_PAYMENTS
}

let currentMethod = null
let currentAmount = 0

const methodLabels = {
    promptpay:  'พร้อมเพย์',
    truewallet: 'True Money Wallet',
    card:       'บัตรเครดิต/เดบิต',
    banking:    'อินเทอร์เน็ต แบงค์กิ้ง'
}

const REF_IMG = {
    overview:   '../images/pay/91593_0.jpg',
    card:       '../images/pay/91594_0.jpg',
    qr:         '../images/pay/91595_0.jpg',
    promptpay:  '../images/pay/91596_0.jpg',
    qrcode:     '../images/pay/91597_0.jpg',
    walletList: '../images/pay/91598_0.jpg',
    truewallet: '../images/pay/91599_0.jpg',
    banking:    '../images/pay/91600_0.jpg',
    kbank:      '../images/pay/91601_0.jpg'
}

/* OPEN / CLOSE */

if (openTopupBtn) {
    openTopupBtn.addEventListener('click', (e) => {
        e.preventDefault()
        openTopup()
    })
}

if (closeTopup) {
    closeTopup.addEventListener('click', closeTopupModal)
}

if (topupModal) {
    topupModal.addEventListener('click', (e) => {
        if (e.target === topupModal) closeTopupModal()
    })
}

function openTopup() {
    if (!topupModal) return
    topupModal.classList.add('active')
    goToStep(1)
    currentMethod = null
    currentAmount = 0
    topupTotal.textContent = '0.00'
    topupAmountIn.value = ''
    document.querySelectorAll('.quick-amounts button').forEach(b => b.classList.remove('active'))
}

function closeTopupModal() {
    topupModal.classList.remove('active')
}

/* STEPS */

function goToStep(n) {
    document.querySelectorAll('.topup-step').forEach(s => s.classList.remove('active'))
    const target = document.querySelector(`.topup-step[data-step="${n}"]`)
    if (target) target.classList.add('active')
}

document.querySelectorAll('.topup-back').forEach(btn => {
    btn.addEventListener('click', () => goToStep(btn.dataset.back))
})

/* METHOD PICK */

document.querySelectorAll('.topup-method').forEach(card => {
    card.addEventListener('click', () => {
        currentMethod = card.dataset.method
        selectedName.textContent = methodLabels[currentMethod] || '-'
        goToStep(2)
    })
})

/* QUICK AMOUNT */

document.querySelectorAll('.quick-amounts button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.quick-amounts button').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        topupAmountIn.value = btn.dataset.amt
        topupTotal.textContent = Number(btn.dataset.amt).toLocaleString('en-US', { minimumFractionDigits: 2 })
    })
})

topupAmountIn?.addEventListener('input', () => {
    const v = parseFloat(topupAmountIn.value) || 0
    topupTotal.textContent = v.toLocaleString('en-US', { minimumFractionDigits: 2 })
    document.querySelectorAll('.quick-amounts button').forEach(b => b.classList.remove('active'))
})

/* NEXT */

nextBtn?.addEventListener('click', () => {
    const amt = parseFloat(topupAmountIn.value)
    if (!amt || amt < 20) {
        toast('กรุณาระบุจำนวนเงินขั้นต่ำ 20 บาท')
        return
    }
    if (amt > 50000) {
        toast('จำนวนเงินสูงสุดไม่เกิน 50,000 บาท')
        return
    }
    currentAmount = amt
    topupTotal.textContent = amt.toLocaleString('en-US', { minimumFractionDigits: 2 })
    renderDetail()
    goToStep(3)
})

/* RENDER DETAIL BY METHOD */

function renderDetail() {
    const cfg = getPayConfig()
    const amtTxt = currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })

    if (currentMethod === 'promptpay') {
        topupDetail.innerHTML = `
            <h5 style="color:#ff4fa0;margin-bottom:6px">
                <i class="fa-solid fa-qrcode"></i> สแกน QR เพื่อชำระเงิน
            </h5>
            <p style="font-size:13px;color:#888;margin-bottom:8px">
                กรุณาแคปหน้าจอ QR Code นี้ <br>
                เพื่อสแกนจ่ายผ่านแอปธนาคารของท่าน
            </p>
            <img src="${REF_IMG.qrcode}" class="qr-img" alt="QR PromptPay">
            <div class="pay-info">
                <i class="fa-solid fa-clock"></i>
                หมดอายุใน 10:00 นาที
            </div>
            <div class="detail-row">
                <span class="detail-label">หมายเลขพร้อมเพย์</span>
                <span class="detail-value">${cfg.promptpay.number}
                    <button class="copy-btn" data-copy="${cfg.promptpay.number}">คัดลอก</button>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ชื่อบัญชี</span>
                <span class="detail-value">${cfg.promptpay.holder}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">จำนวนเงิน</span>
                <span class="detail-value">฿${amtTxt}</span>
            </div>
        `
    }
    else if (currentMethod === 'truewallet') {
        topupDetail.innerHTML = `
            <h5 style="color:#ff8200;margin-bottom:6px">
                <i class="fa-solid fa-wallet"></i> ทรูมันนี่ วอลเล็ท
            </h5>
            <p style="font-size:13px;color:#888;margin-bottom:8px">
                โอนผ่านเบอร์ TrueMoney Wallet ด้านล่าง<br>
                หรือสแกน QR ในแอป TrueMoney
            </p>
            <div class="qr-placeholder" style="border-color:#ff8200;color:#ff8200">
                <i class="fa-solid fa-mobile-screen-button"></i>
                <span>เบอร์รับเงิน TrueMoney</span>
                <b style="font-size:18px;color:#ff8200">${cfg.truewallet.phone}</b>
            </div>
            <div class="pay-info" style="background:#fff5e6;color:#ff8200">
                <i class="fa-solid fa-circle-info"></i>
                กรุณาเก็บสลิปไว้เป็นหลักฐาน
            </div>
            <div class="detail-row">
                <span class="detail-label">เบอร์ TrueWallet</span>
                <span class="detail-value">${cfg.truewallet.phone}
                    <button class="copy-btn" data-copy="${cfg.truewallet.phone}">คัดลอก</button>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ชื่อผู้รับ</span>
                <span class="detail-value">${cfg.truewallet.holder}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">จำนวนเงิน</span>
                <span class="detail-value">฿${amtTxt}</span>
            </div>
        `
    }
    else if (currentMethod === 'card') {
        topupDetail.innerHTML = `
            <h5 style="color:#4d70ff;margin-bottom:6px">
                <i class="fa-solid fa-credit-card"></i> บัตรเครดิต / เดบิต
            </h5>
            <p style="font-size:13px;color:#888;margin-bottom:14px">
                รองรับ VISA · MasterCard · JCB · American Express
            </p>

            <div class="card-form">
                <div class="topup-input-group">
                    <label>หมายเลขบัตร</label>
                    <div class="topup-input-wrap">
                        <i class="fa-solid fa-credit-card"></i>
                        <input type="text" placeholder="0000 - 0000 - 0000 - 0000" maxlength="19">
                    </div>
                </div>
                <div class="card-form-row">
                    <div class="topup-input-group">
                        <label>วันหมดอายุ</label>
                        <div class="topup-input-wrap">
                            <i class="fa-solid fa-calendar"></i>
                            <input type="text" placeholder="MM/YY" maxlength="5">
                        </div>
                    </div>
                    <div class="topup-input-group">
                        <label>CVV</label>
                        <div class="topup-input-wrap">
                            <i class="fa-solid fa-lock"></i>
                            <input type="text" placeholder="•••" maxlength="3">
                        </div>
                    </div>
                </div>
                <div class="topup-input-group">
                    <label>ชื่อหน้าบัตร</label>
                    <div class="topup-input-wrap">
                        <i class="fa-solid fa-user"></i>
                        <input type="text" placeholder="NAME ON CARD">
                    </div>
                </div>
            </div>

            <div class="pay-info" style="background:#eef3ff;color:#4d70ff">
                <i class="fa-solid fa-shield-halved"></i>
                ข้อมูลบัตรของคุณเข้ารหัสตามมาตรฐาน PCI-DSS
            </div>
            <div class="detail-row">
                <span class="detail-label">ยอดที่ชำระ</span>
                <span class="detail-value">฿${amtTxt}</span>
            </div>
        `
    }
    else if (currentMethod === 'banking') {
        topupDetail.innerHTML = `
            <h5 style="color:#00c882;margin-bottom:6px">
                <i class="fa-solid fa-building-columns"></i> เลือกธนาคาร
            </h5>
            <p style="font-size:13px;color:#888;margin-bottom:14px">
                ระบบจะเปลี่ยนไปยังหน้าธนาคารของท่าน
            </p>

            <div class="bank-list">
                <div class="bank-item" data-bank="scb">
                    <div class="bank-icon scb">SCB</div>
                    <div class="bank-name">ไทยพาณิชย์</div>
                </div>
                <div class="bank-item" data-bank="kbk">
                    <div class="bank-icon kbk">K+</div>
                    <div class="bank-name">กสิกรไทย</div>
                </div>
                <div class="bank-item" data-bank="bay">
                    <div class="bank-icon bay">BAY</div>
                    <div class="bank-name">กรุงศรี</div>
                </div>
                <div class="bank-item" data-bank="ktb">
                    <div class="bank-icon ktb">KTB</div>
                    <div class="bank-name">กรุงไทย</div>
                </div>
            </div>

            <div class="pay-info" style="background:#e6fff5;color:#00a86b;margin-top:14px">
                <i class="fa-solid fa-circle-info"></i>
                ยอดน้อยกว่า 1,000 บาท คิดค่าธรรมเนียม 15 บาท
            </div>
            <div class="detail-row">
                <span class="detail-label">ยอดที่ชำระ</span>
                <span class="detail-value">฿${amtTxt}</span>
            </div>
        `
    }

    /* attach copy buttons */
    topupDetail.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard?.writeText(btn.dataset.copy)
            toast('คัดลอกแล้ว ✨')
        })
    })

    /* attach bank pick */
    topupDetail.querySelectorAll('.bank-item').forEach(b => {
        b.addEventListener('click', () => {
            toast(`เลือก ${b.querySelector('.bank-name').textContent} แล้ว — กำลังไปยังหน้าธนาคาร...`)
        })
    })
}

/* CONFIRM */

confirmBtn?.addEventListener('click', () => {
    /* บันทึกรายการ topup รอตรวจสอบ */
    const list = JSON.parse(localStorage.getItem('mpm_topup_history') || '[]')
    list.unshift({
        id:      'TX' + Date.now(),
        method:  currentMethod,
        amount:  currentAmount,
        status:  'pending',
        time:    new Date().toISOString()
    })
    localStorage.setItem('mpm_topup_history', JSON.stringify(list.slice(0, 200)))

    toast('ส่งคำขอเติมเงินแล้ว — รอตรวจสอบ ✓')
    setTimeout(closeTopupModal, 1200)
})

/* MINI TOAST */

function toast(msg) {
    let t = document.querySelector('.mini-toast')
    if (!t) {
        t = document.createElement('div')
        t.className = 'mini-toast'
        document.body.appendChild(t)
    }
    t.textContent = msg
    t.classList.add('show')
    clearTimeout(toast._h)
    toast._h = setTimeout(() => t.classList.remove('show'), 2200)
}

/* ESC TO CLOSE */

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && topupModal?.classList.contains('active')) {
        closeTopupModal()
    }
})

/* =========================
   PROFILE MODAL
========================= */

const USERS_API = 'http://localhost:5000/api/users'

const profileModal      = document.getElementById('profileModal')
const closeProfile      = document.getElementById('closeProfile')
const openProfileBtn    = document.getElementById('openProfileBtn')
const avatarInput       = document.getElementById('avatarInput')
const avatarPreview     = document.getElementById('avatarPreview')
const profileUsername   = document.getElementById('profileUsername')
const saveProfileBtn    = document.getElementById('saveProfileBtn')
const oldPasswordIn     = document.getElementById('oldPassword')
const newPasswordIn     = document.getElementById('newPassword')
const confirmPasswordIn = document.getElementById('confirmPassword')
const savePasswordBtn   = document.getElementById('savePasswordBtn')

let pendingAvatarUrl = null

function openProfileModal() {
    if (!profileModal) return

    const u = JSON.parse(localStorage.getItem('user')) || {}

    profileUsername.value = u.username || ''
    avatarPreview.src     = u.avatar || '../images/logo.gif'

    oldPasswordIn.value     = ''
    newPasswordIn.value     = ''
    confirmPasswordIn.value = ''
    pendingAvatarUrl        = null

    profileModal.classList.add('active')
}

function closeProfileModal() {
    profileModal?.classList.remove('active')
}

openProfileBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    profileDropdown?.classList.remove('active')
    openProfileModal()
})

closeProfile?.addEventListener('click', closeProfileModal)

profileModal?.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfileModal()
})

/* AVATAR UPLOAD */

avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
        toast('รูปต้องไม่เกิน 5MB')
        return
    }

    const reader = new FileReader()
    reader.onload = (ev) => { avatarPreview.src = ev.target.result }
    reader.readAsDataURL(file)

    const fd = new FormData()
    fd.append('avatar', file)

    try {
        const res = await fetch(`${USERS_API}/upload-avatar`, {
            method: 'POST',
            body:   fd
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        pendingAvatarUrl = data.avatarUrl
        avatarPreview.src = data.avatarUrl
        toast('อัปโหลดรูปสำเร็จ ✨')
    } catch (err) {
        toast('อัปโหลดรูปไม่สำเร็จ: ' + err.message)
    }
})

/* SAVE PROFILE */

saveProfileBtn?.addEventListener('click', async () => {
    const u = JSON.parse(localStorage.getItem('user'))
    if (!u) {
        toast('กรุณาเข้าสู่ระบบ')
        return
    }

    const newName = profileUsername.value.trim()
    if (!newName) {
        toast('กรุณาระบุชื่อผู้ใช้')
        return
    }

    const body = { username: newName }
    if (pendingAvatarUrl) body.avatar = pendingAvatarUrl

    try {
        const res = await fetch(`${USERS_API}/${u.id}/profile`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        const merged = { ...u, username: data.user.username, avatar: data.user.avatar }
        localStorage.setItem('user', JSON.stringify(merged))

        if (profileName)  profileName.innerText  = merged.username
        if (dropdownName) dropdownName.innerText = merged.username

        toast('บันทึกโปรไฟล์แล้ว ✓')
    } catch (err) {
        toast('บันทึกไม่สำเร็จ: ' + err.message)
    }
})

/* CHANGE PASSWORD */

savePasswordBtn?.addEventListener('click', async () => {
    const u = JSON.parse(localStorage.getItem('user'))
    if (!u) {
        toast('กรุณาเข้าสู่ระบบ')
        return
    }

    const oldP = oldPasswordIn.value
    const newP = newPasswordIn.value
    const cfP  = confirmPasswordIn.value

    if (!oldP || !newP || !cfP) {
        toast('กรอกรหัสผ่านให้ครบทุกช่อง')
        return
    }
    if (newP.length < 6) {
        toast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัว')
        return
    }
    if (newP !== cfP) {
        toast('ยืนยันรหัสผ่านไม่ตรงกัน')
        return
    }

    try {
        const res = await fetch(`${USERS_API}/${u.id}/change-password`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ oldPassword: oldP, newPassword: newP })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        oldPasswordIn.value = ''
        newPasswordIn.value = ''
        confirmPasswordIn.value = ''

        toast('เปลี่ยนรหัสผ่านสำเร็จ ✓')
    } catch (err) {
        toast(err.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    }
})

/* =========================
   ORDER HISTORY MODAL
========================= */

const historyModal   = document.getElementById('historyModal')
const closeHistory   = document.getElementById('closeHistory')
const openHistoryBtn = document.getElementById('openHistoryBtn')
const historyList    = document.getElementById('historyList')
const historyEmpty   = document.getElementById('historyEmpty')
const historyCount   = document.getElementById('historyCount')
const historyTotal   = document.getElementById('historyTotal')

function paintHistory(list) {
    if (!historyCount || !historyTotal || !historyList || !historyEmpty) return

    historyCount.textContent = list.length
    const total = list.reduce((sum, o) => sum + Number(o.total || 0), 0)
    historyTotal.textContent =
        '฿' + total.toLocaleString('en-US', { minimumFractionDigits: 2 })

    if (!list.length) {
        historyList.innerHTML = ''
        historyList.style.display = 'none'
        historyEmpty.style.display = 'flex'
        return
    }

    historyEmpty.style.display = 'none'
    historyList.style.display = 'flex'

    historyList.innerHTML = list.map(o => `
        <div class="history-card">
            <img src="${o.image || '../images/logo.gif'}" alt="${o.name}">
            <div class="history-info">
                <h4>${o.name || 'สินค้า'}</h4>
                <p>
                    <i class="fa-regular fa-clock"></i>
                    ${o.time ? new Date(o.time).toLocaleString('th-TH') : '-'}
                </p>
                <span class="history-qty">x${o.qty || 1}</span>
                ${(o.rentalKeys || []).map(key => `
                    <div class="history-key">
                        <code>${key}</code>
                        <a href="create-site.html?key=${encodeURIComponent(key)}">สร้างเว็บไซต์</a>
                    </div>
                `).join('')}
            </div>
            <div class="history-amount">
                <b>฿${Number(o.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>
                <span class="history-status ${o.status || 'success'}">${
                    o.status === 'pending' ? 'รอตรวจสอบ' :
                    o.status === 'failed'  ? 'ล้มเหลว' :
                    'สำเร็จ'
                }</span>
            </div>
        </div>
    `).join('')
}

async function renderHistory() {
    const latestUser = JSON.parse(localStorage.getItem('user') || 'null')
    const latestToken = localStorage.getItem('token')
    let list = readLocalOrderHistory(latestUser)

    if (latestToken) {
        try {
            const res = await fetch(`${ORDER_API_URL}/me`, {
                headers: { Authorization: `Bearer ${latestToken}` }
            })
            const data = await res.json()

            if (res.ok && Array.isArray(data)) {
                list = data.map(o => ({
                    id: o._id,
                    name: o.productName,
                    image: o.productImage,
                    qty: o.quantity,
                    total: o.total,
                    status: o.status,
                    time: o.createdAt,
                    rentalKeys: o.rentalKeys || []
                }))
                writeLocalOrderHistory(list, latestUser)
            }
        } catch (err) {
            list = readLocalOrderHistory(latestUser)
        }
    }

    paintHistory(list)
}

openHistoryBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    profileDropdown?.classList.remove('active')
    renderHistory()
    historyModal?.classList.add('active')
})

closeHistory?.addEventListener('click', () => {
    historyModal?.classList.remove('active')
})

historyModal?.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.remove('active')
})

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    profileModal?.classList.remove('active')
    historyModal?.classList.remove('active')
})
/* =========================
   SHOP COUPON MODAL
========================= */

const openCouponBtn = document.getElementById('openCouponBtn')
const couponModal = document.getElementById('couponModal')
const closeCoupon = document.getElementById('closeCoupon')
const couponCodeInput = document.getElementById('couponCodeInput')
const applyCouponBtn = document.getElementById('applyCouponBtn')
const couponResult = document.getElementById('couponResult')
const availableCoupons = document.getElementById('availableCoupons')

function readShopCoupons() {
    try { return JSON.parse(localStorage.getItem('mpm_coupons') || '[]') } catch (e) { return [] }
}

function renderAvailableCoupons() {}

openCouponBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    profileDropdown?.classList.remove('active')
    couponResult.innerHTML = ''
    couponCodeInput.value = ''
    couponModal?.classList.add('active')
})
closeCoupon?.addEventListener('click', () => couponModal?.classList.remove('active'))
couponModal?.addEventListener('click', (e) => { if (e.target === couponModal) couponModal.classList.remove('active') })

applyCouponBtn?.addEventListener('click', () => {
    const code = couponCodeInput.value.trim().toUpperCase().replace(/\s+/g, '')
    const coupon = readShopCoupons().find(c => c.code === code && c.enabled !== false)
    if (!coupon) {
        couponResult.innerHTML = '<div class="coupon-message error"><i class="fa-solid fa-circle-xmark"></i> ไม่พบคูปองนี้ หรือคูปองถูกปิดใช้งาน</div>'
        return
    }
    if (Number(coupon.used || 0) >= Number(coupon.limit || 1)) {
        couponResult.innerHTML = '<div class="coupon-message error"><i class="fa-solid fa-circle-xmark"></i> คูปองนี้ถูกใช้ครบจำนวนแล้ว</div>'
        return
    }
    localStorage.setItem('mpm_active_coupon', JSON.stringify(coupon))
    couponResult.innerHTML = `<div class="coupon-message success"><i class="fa-solid fa-circle-check"></i> ใช้คูปอง ${coupon.code} สำเร็จ · ${coupon.type === 'percent' ? `ลด ${coupon.value}%` : `ลด ฿${Number(coupon.value).toLocaleString()}`}</div>`
})


