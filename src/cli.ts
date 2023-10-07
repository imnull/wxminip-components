#!/usr/bin/env node

import { program } from 'commander'
import { getComponentList, installComponent, componentNeedInstall, useComponent, removeComponent, getRouteSubPackage, scanUsing, getUsingCount, scanReffer } from './utils'
import chalk from 'chalk'

program.command('list').description('列出所有可用组件').action(() => {
    console.log('')
    getComponentList().forEach(name => {
        console.log(chalk.gray(` -`), chalk.greenBright(`${name}`))
    })
    console.log('')
})

program.command('install').description('安装组件到本地小程序项目')
.argument('<component-name>', '组件名称')
.argument('[sub-package]', '小程序分包')
.action((componentName, subPackage: string) => {
    try {
        if(componentNeedInstall(componentName, subPackage || '')) {
            const ps = installComponent(componentName, subPackage || '')
            console.log('')
            console.log(chalk.greenBright(`组件'${componentName}'安装成功！`))
            ps.forEach(p => {
                console.log(chalk.gray(` - ${p}`))
            })
            console.log('')
        } else {
            console.log('')
            console.log(chalk.yellowBright(`组件'${componentName}'已存在，无需安装。`))
            console.log('')
        }
    } catch(err) {
        console.log('')
        console.log(chalk.redBright(`安装组件出错：${err}`))
        console.log('')
    }
})

program.command('use').description('在当前项目中植入组件')
.argument('<component-name>', '组件名称')
.argument('<page-route>', '页面路由')
.argument('[tag-name]', '组件标签名称')
.action((name, route, tag) => {
    tag = tag || name
    const subPackage = getRouteSubPackage(route)
    try {
        if(componentNeedInstall(name, subPackage)) {
            const ps = installComponent(name, subPackage)
            console.log('')
            console.log(chalk.greenBright(`组件'${name}'安装成功！`))
            ps.forEach(p => {
                console.log(chalk.gray(` - ${p}`))
            })
        }
        useComponent(name, route, subPackage, tag)
        console.log('')
        console.log(chalk.greenBright(`页面'${route}'植入组件'${name}:<${tag}>'成功。`))
        console.log('')
    } catch(err) {
        console.log('')
        console.log(chalk.redBright(`植入组件出错：${err}`))
        console.log('')
    }
})

program.command('remove').description('在当前项目页面中移除tag对应组件')
.argument('<tag-name>', '组件标签名称')
.argument('<page-route>', '页面路由')
.action((tag, route) => {
    try {
        removeComponent(tag, route)
        console.log('')
        console.log(chalk.greenBright(`页面'${route}'已移除对标签<${tag}>的引用'。`))
        console.log('')
    } catch(err) {
        console.log('')
        console.log(chalk.redBright(`移除组件出错：${err}`))
        console.log('')
    }
})

program.command('scan').description('扫描当前项目组件使用情况')
.action(() => {
    const items = scanUsing()
    console.log('')
    items.forEach(item => {
        if(item.using.length < 1) {
            return
        }
        console.log(chalk.bold.white(` > ${item.route} `))
        item.using.forEach(using => {
            const c = getUsingCount(using.tag, item.route)
            const counter = c > 0 ? chalk.cyanBright(`(${c})`) : chalk.yellow(`(${c})`)
            console.log(chalk.cyanBright(`  |`), counter, chalk.cyanBright(`${using.component} <${using.tag}>`))
        })
        console.log('')
    })
    console.log('')
})

program.command('ref').description('扫描当前项目已安装组件引用情况')
.action(() => {
    const items = scanReffer()
    console.log('')
    items.forEach(item => {
        const c = item.pages.reduce((r, p) => p.count + r, 0)
        const _c = c > 0 ? chalk.cyanBright(`(${c})`) : chalk.redBright(`(${c})`)
        console.log(chalk.bold.yellow(`[${item.name}]`), chalk.blueBright(`${item.path}`), _c)
        item.pages.forEach(page => {
            const counter = page.count > 0 ? chalk.cyanBright(`(${page.count})`) : chalk.redBright(`(${page.count})`)
            console.log('  ', chalk.greenBright(`<${page.tag}>`), chalk.gray(`${page.route}`), counter)
        })
        console.log('')
    })
    console.log('')
})

program.parse()