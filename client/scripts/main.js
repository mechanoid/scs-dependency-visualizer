/* global mermaid */
mermaid.initialize({ startOnLoad: true })

const filters = document.querySelector('.filters')

filters.addEventListener('change', () => {
  filters.submit()
})

filters.querySelector('input[type="submit"]').remove()
