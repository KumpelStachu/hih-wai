document
	.querySelectorAll<HTMLAnchorElement>('a[data-back]')
	.forEach(
		e => document.referrer && document.referrer != location.href && (e.href = document.referrer)
	)
