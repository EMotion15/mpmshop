/* THEME — handled by js/theme.js (auto-wires .theme-toggle) */

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

} else {

    guestActions.style.display = 'flex'
    userMenu.style.display = 'none'

}

if (userProfileBtn) {
    userProfileBtn.onclick = () => {
        profileDropdown.classList.toggle('active')
    }
}

if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.reload()
    }
}

document.addEventListener('click', (e) => {
    if (userMenu && !userMenu.contains(e.target)) {
        profileDropdown?.classList.remove('active')
    }
})
