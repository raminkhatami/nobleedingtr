# No Bleeding Tranlation

This package provides a utility to do internationalization without much effert! having non Roman language like Japanese, Thai,... and/or RTL language support in mind!


## Background

It is very difficult to write non-English language texts inside JS codes and too much work is involved to use availabke internatinalization modules for small projects.  This package is a small module to address above isseu in a simple format.

The way this package work is that during the coding you write whatever you like in english as object members in camelcase and it appears as it is in your app and it creates a default.locale file in locales directory at root of your app. Once you are done with developement, you grab the content of default.locale, translate it to the language of your choice and place it right beside default.locale at locales directory (such as ja.locale ) and set tr._locale to the name of that file. 

## TLDR Documentation

```js
//import package
import tr from "nobleedingtr"

// tr._locale = "ja" // uncomment this after you are done with translating

// Write your code and start using your text as camel case member of tr object without defining it anywhere in your code.


console.log(tr.whyYouAreNotCarefull)
//↑ prints---> why you are not carefull
console.log(tr.expiryDateIsTwoMonthAfterOpenning)
//↑ prints---> expiry dateI is two month after openning
console.log(tr.youAre$YearsOld("31")) 
//↑ prints--->you are 31 years old
console.log(tr.youWillBe$YearsOld$MonthFromNow("31","two")) 
//↑ prints---> you will be 31 years old two month from now.

//the above code defines 4 variables at /locaels/default.locale during 
//developement. Once you are done with developement translate default.locale
//to any language you like: for example Japanese and place the contents in 
//ja.locale  and uncomment tr._locale at the top of the code.

```

## Guide

You can easily internationalize your app without much effort.

You can place `tr.(any variable name you like in camel case)` inside your code and it appears as uncamel case of the same variable inside your app without doing anytging.

for example:

- **helloWorld** becomes **hello world**

or

- **youAreTheBestDoctor** becomes: **you are the best docter**

once your are done with your program you can go to `/locales/default.locale` and translate the content to the language of your choice and place it inside `/locales/language_code.locale` and set `tr._locale = "language_code"` and enjoy your app.

### Usage

1. Install this package by your package manager (npm, yarn, pnpm,...)

```bash
npm install nobleedingtr
```

2. Load this package default object into your project.

```js
import tr from "nobleedingtr"
```

Or if you use commonjs

```js
const tr = require("nobleedingtr")
```

1. Start using it!

You can then start treating  `tr` as an object and add your text by adding it as a camel case object member to it.

So for example you can use it in your javascript code like below:

```js
console.log(tr.helloWorld)
// or 
let myVar = tr.greetingMessage 
```


> Remember you do not need (cannot) set variable name inside your code!
so for example ~~ tr.variableName='some translation'~~ is  not accpeted!


You can use this package any node enabled environment such as React, ReactNative, Svelte, or SvelteKit project. for example in SvelteKit project:

```svelte
<script>
import tr from "nobleedingtr"
//....rest of your code
</script>

...
<h1>{tr.topHeading}</h1>
...

```

The only requiremnt is that your apps developement is done in nodejs so that the locale file can be saved and read from disk during developement.

### Advanced Usage

**You can treat tr object as function and pass variable to them!**

The requirement is you need to have dollar sign: $ as a variable placeholder inside your object member name.

for example

```js
let a = tr.hello$welcomeToOurPage("Jack")
```

The above item gets saved to `default.locale` as :

```txt
@hello$welcomeToOurPage = 
hello $ welcome to our page

```

The $ characters are placeholders for variables you want to pass to the  tr object members. For example you can translate the above sentence in de.locale as below

```txt
//de.locale
@hello$welcomeToOurPage = 
hallo $! willkommen auf unserer Seite

```

And you can call it in your js code as `tr.hello$welcomeToOurPage("Daniel")` and it becomes `hallo Daniel! willkommen auf unserer Seite` in your app.

You can use as many $ as place holder inside your variable and use it as you wish.

### Numbering the Arguements

There are cases that variable name and the translated variable location differs. In those cases, you can number your variable inside the translation by adding a number without space to the dollar sign. For instance:

```txt
//fa.locale

@hello$welcomeToOurPageForThe$times = 
سلام «$1». به سایت ما برای «$2» بار خوش آمدید.
```

Can be called your in your code as below:

```js
let name = "مجتبی"
let time = "سومین"
tr.hello$welcomeToOurPageForThe$times(name,time)
```

The `name` replaces `$1` and the `time` replaces `$2` and shows:

```txt
سلام «مجتبی». به سایت ما برای «سومین» بار خوش آمدید.
```

Remember the package will not complain if you pass less/more than the required variable in your translation and it only shows dollar sign instead!

So that for example if you call the above code as below

```js
let name = "مجتبی"
tr.hello$welcomeToOurPageForThe$times(name)
```

It shows as

```txt
سلام «مجتبی». به سایت ما برای «$2» بار خوش آمدید.
```

Or if you call it:

```js
let name = "مجتبی"
let time = "سومین"
let additional = "چرا"
tr.hello$welcomeToOurPageForThe$times(name,time, additional)
```

It still shows:

```txt
سلام «مجتبی». به سایت ما برای «سومین» بار خوش آمدید.
```

## Default setting

By default this package create a directory named `locale` at top directory of your project (where your package.json file is located) and put `default.locale` which includes each of the object members as variable and uncameled variable as it's value!

so for example `tr.helloWorld` becomes:

```txt
@helloWorld= 
hello world


```

inside `default.locale` file.

---

remember the lanuage code you set on `tr._locale` variable, must match the name of the localized file inside locales directory:

```javascript
//for example
tr._locale = "fa"
//grabs the content of file from /locales/fa.locale 
```

If you set the `tr._locale` and start adding members that do not exist in locale version, the new members gets added to default.locale and  unlocalized version starts apearing in your app.

## Design Consideration

- **@ character behind variable name**
  
  It is there so that you can easily copy paste the file content to translate service such as google and prevent translate engine from translating the variable name as they treat them as email address etc..

- **The locale file format**

  the variable is written on one line and the content is written below it to make it easy to read and write specially for  Right-to-Left (RTL) languages (Persian, Arabic, Hebrew) working in unsupported text editors! 
  
  There is always two line distance between last line of the translation text and the next variable

  ```txt
  @oneVariable= 
  some translation
  
  more translation  for the above variable


 @anotherVariable=
   some translation for another variable
  
  more translation  for the another variable
```

  **locale file format**
    1. Each variable after two  new line (or no new line if at the begining of the file) starting with `@` sign and then variable name (in camel case format) and ending with `=`
    2. Each translation in a new line immediately after `=`

- Small Apps

   I found it so trouble some to localize a small apps with conventianal internationalization packages.
   1. you needed to master a translation package
   2. you needed to follow the strict convention
   3. you could not pass variable and all contetn should have been either static or you needed to do lots of work to pass a signle variable.

    Altough this package is not for a large app it made my life so easy for creation of small-to-medium size (PoC) apps and I could quickly internationalize it.
