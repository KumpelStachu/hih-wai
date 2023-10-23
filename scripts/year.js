const e = document.querySelector('#year');
e.textContent = [
    ...new Set([!isNaN(+(e.textContent ?? '')) && +(e.textContent ?? 0), new Date().getFullYear()].filter(Boolean)),
]
    .sort()
    .join(' - ');
export {};
