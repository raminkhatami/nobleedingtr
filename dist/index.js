import * as fs from "fs";
import * as path from "path";
let _intialSave = true;
const _isNode = () => {
    return (typeof process !== "undefined" &&
        process.release.name.search(/node|io.js/) !== -1);
};
const _uncamel = (str, reverse = false) => {
    if (reverse) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
            .trim();
    }
    return str
        .replace(/([A-Z\$])/g, " $1")
        .toLowerCase()
        .replace(/(\$\d*)([A-z])/g, " $1 $2")
        .toLowerCase()
        .trim();
};
const _formatter = (str, ...args) => {
    let foundIdx = 0;
    return str.replace(/\$(\d*)/g, function (match, subgroup) {
        let targetIdx = typeof Number.parseInt(subgroup) === "number" &&
            !Number.isNaN(Number.parseInt(subgroup))
            ? Number.parseInt(subgroup)
            : foundIdx;
        foundIdx += 1;
        if (targetIdx < args.length) {
            return args[targetIdx];
        }
        return match;
    });
};
const _writeObject = (obj, locale = "default", rootPath = "./", localeDirName = "locales") => {
    if (_isNode()) {
        const writableObj = {};
        for (let prop in obj) {
            writableObj[prop] =
                typeof obj[prop] === "function" ? obj[prop]() : obj[prop];
        }
        const appDir = path.resolve(rootPath);
        const rPath = path.join(appDir, localeDirName);
        if (!fs.existsSync(rPath)) {
            try {
                fs.mkdirSync(rPath, { recursive: true });
            }
            catch (err) {
                console.log(err);
            }
        }
        let textToWrite = "";
        for (const key in writableObj) {
            if (!key.startsWith("_") &&
                key !== "default" &&
                key !== "length" &&
                key !== "inspect") {
                textToWrite += `@${key}=\n${writableObj[key]}\n\n\n`;
            }
        }
        try {
            fs.writeFileSync(path.join(rPath, locale + ".locale"), textToWrite);
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        throw "can not write to file in non Node environment!";
    }
};
let lastModifiedDate;
const _modificationDate = (locale = "default", rootPath = "./", localeDirName = "locales") => {
    let lmf = undefined;
    if (_isNode()) {
        const appDir = path.resolve(rootPath);
        const rPath = path.join(appDir, localeDirName);
        if (fs.existsSync(path.join(rPath, locale + ".locale"))) {
            const stats = fs.statSync(path.join(rPath, locale + ".locale"));
            lmf = stats.mtime;
        }
    }
    else {
        throw "this is not server! nobleeding tr works on node!";
    }
    return lmf;
};
const _readObject = (locale = "default", rootPath = "./", localeDirName = "locales") => {
    const obj = {};
    const regexp = /(\n?\s*\n?\s*|^)?@([\w\$]+)\s*=\s*\n([\s\S]+?)(\n(\n\n)|$)/g;
    let txt = "";
    if (_isNode()) {
        const appDir = path.resolve(rootPath);
        const rPath = path.join(appDir, localeDirName);
        if (!fs.existsSync(path.join(rPath, locale + ".locale"))) {
            return {};
        }
        txt = fs.readFileSync(path.join(rPath, locale + ".locale"), {
            encoding: "utf-8",
            flag: "r",
        });
    }
    else {
        throw "this is not server! nobleeding tr works on node!";
    }
    if (txt) {
        const matches = txt.matchAll(regexp);
        for (const match of matches) {
            if (/.*\$.*/.test(match[2])) {
                obj[match[2]] = function () {
                    return _formatter(match[3], ...arguments);
                };
            }
            else {
                obj[match[2]] = match[3];
            }
        }
    }
    return obj;
};
const _handler = {
    get(target, prop) {
        if (prop != "_locale" &&
            lastModifiedDate !== _modificationDate(target["_locale"])) {
            const locale = target["_locale"];
            const newTarget = Object.assign({ _locale: locale, _writeLocale: true }, _readObject(locale));
            for (let key in newTarget) {
                target[key] = newTarget[key];
            }
        }
        if (!(prop in target) && typeof prop === "string") {
            if (/.*\$.*/.test(prop)) {
                target[prop] = function () {
                    return _formatter(_uncamel(prop), ...arguments);
                };
            }
            else {
                target[prop] = _uncamel(prop);
            }
            if (target._writeLocale) {
                _writeObject(target, "default");
            }
            return target[prop];
        }
        else {
            return target[prop];
        }
        return Reflect.get(target, prop);
    },
    set(target, prop, newVal) {
        if (prop.startsWith("_")) {
            switch (prop) {
                case "_locale":
                    const newTarget = Object.assign({ _locale: newVal, _writeLocale: true }, _readObject(newVal));
                    for (let key in newTarget) {
                        target[key] = newTarget[key];
                    }
                    return true;
                    break;
                case "_writeLocale":
                    target[prop] = newVal;
                    return true;
                    break;
            }
            return false;
        }
        else {
            target[prop] = newVal;
            return true;
        }
    },
};
const _rawObj = Object.assign({ _locale: "default", _writeLocale: true }, _readObject("default"));
lastModifiedDate = _modificationDate("default", "./", "locales");
const tr = new Proxy(_rawObj, _handler);
export default tr;
//# sourceMappingURL=index.js.map