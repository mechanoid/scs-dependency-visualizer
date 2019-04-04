/* global mermaid */
mermaid.initialize({ startOnLoad: true })

const filters = document.querySelector('.filters')

filters.addEventListener('change', () => {
  filters.submit()
})

filters.querySelector('input[type="submit"]').remove()

const mainNav = document.querySelector('.component-definitions')

mainNav.addEventListener('click', () => {
  mainNav.classList.toggle('open')
})

const mainNavLinks = mainNav.querySelector('a[href]')

mainNavLinks.addEventListener('click', () => {
  mainNav.classList.remove('open')
})
