export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

export function getAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const diff = now.getTime() - birth.getTime()
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
  
  if (years > 0) {
    return `${years}岁${months > 0 ? months + '个月' : ''}`
  }
  return `${months}个月`
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: unknown[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  } as T
}

export function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastTime = 0
  return function (this: unknown, ...args: unknown[]) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  } as T
}

export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none'): void {
  uni.showToast({ title, icon, duration: 2000 })
}

export function showModal(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => resolve(res.confirm)
    })
  })
}

export function navigateTo(url: string): void {
  uni.navigateTo({ url })
}

export function redirectTo(url: string): void {
  uni.redirectTo({ url })
}

export function navigateBack(delta: number = 1): void {
  uni.navigateBack({ delta })
}

export function switchTab(url: string): void {
  uni.switchTab({ url })
}
