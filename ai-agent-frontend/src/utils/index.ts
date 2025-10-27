
// (运行时实现，配合 env.d.ts 中的类型扩展一起使用)
Date.prototype.format = function a(fmt: any): string {
  if (!fmt) {
    fmt = 'YYYY-MM-DD hh:mm:ss'
  }
  const o: any = {
    'M+': this.getMonth() + 1, // 月份
    'D+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds() // 毫秒
  }

  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      this.getFullYear()
        .toString()
        .substr(4 - RegExp.$1.length)
    )
  }

  Object.keys(o).forEach((k: string) => {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      )
    }
  })
  return fmt
}
