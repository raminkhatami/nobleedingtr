const isNode = () => {
  return (
    typeof process !== "undefined" &&
    process.release.name.search(/node|io.js/) !== -1
  )
}

const uncamel = (str, reverse = false) => {
  if (reverse) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, "")
      .trim()
  }

  return str
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim()
}

const formatter = (str, ...args) => {
  let idx = 0

  return str.replace(/\$\$(.+?)\$\$/g, function (match, subgroup) {
    let res
    if (idx < args.length) {
      res = " " + args[idx++]
    } else {
      res = " " + match
    }
    return res
  })
}

const writeObject = (obj: Object, locale) => {
  if (isNode()) {
    const writableObj = {}
    for (let prop in obj) {
      writableObj[prop] =
        typeof obj[prop] === "function" ? obj[prop]() : obj[prop]
    }
    const fs = require("fs")
    const path = require("path")
    const appDir = path.resolve(__dirname);
    const rootPath = path.join(appDir, "locales")

    if (!fs.existsSync(rootPath)) {
      fs.mkdir(rootPath, { recursive: true }, (err) => {
        if (err) console.log(err)
      })
    }

    let textToWrite = ""
    for (const key in writableObj) {
      if (
        !key.startsWith("_") &&
        key !== "default" &&
        key !== "length" &&
        key !== "inspect"
      ) {
        textToWrite += `@_${key} = \n ${writableObj[key]}\n\n\n`
      }
    }
    try {
      fs.writeFile(
        path.join(rootPath, locale + ".locale"),
        textToWrite,
        function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("The file was saved!")
          }
        }
      )
    } catch (err) {
      console.log(err)
    }
  }
}

const readObject = (locale) => {
  const obj = {}

  const regexp = /(\n\n|^)?@_(\$?\w+)\s*=\s*\n([\s\S]+?)(\n\n\n|$)/g
  let txt = ""
  if (isNode()) {
    const fs = require("fs")
    const path = require("path")
    const appDir = path.resolve(__dirname);
    const rootPath = path.join(appDir, "locales")
    txt = fs.readFileSync(path.join(rootPath, locale + ".locale"), {
      encoding: "utf8",
      flag: "r",
    })
  }
  if (txt) {
    const matches = txt.matchAll(regexp)
    for (const match of matches) {
      if (match[2].startsWith("$")) {
        obj[match[2]] = function () {
          return formatter(match[3], ...arguments)
        }
      } else {
        obj[match[2]] = match[3]
      }
    }
  }
  return obj
}

const handler: ProxyHandler<Object> = {
  get(target, prop) {
    if (!(prop in target) && typeof prop === "string") {
      if (prop.startsWith("$")) {
        target[prop] = function () {
          return formatter(uncamel(prop.replace(/$(.+)/, "$1")), ...arguments)
        }
      } else {
        target[prop] = uncamel(prop)
      }
      writeObject(target, "default")
      return target[prop]
    }
    return Reflect.get(target, prop)
  },

  set(target, prop, newVal) {
    if (prop.startsWith("_")) {
      switch (prop) {
        case "_locale":
          const newTarget = readObject(newVal)
          for (let key in newTarget) {
            target[key] = newTarget[key]
          }
          return true
          break
      }
      return false
    } else {
      target[prop] = newVal
      return true
    }
  },
}

const rawObj = { _locale: "default" }
export default tr = new Proxy(rawObj, handler)
