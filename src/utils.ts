import fs from 'fs'
import path from 'path'

export const getFiles = (pathLike: string): string[] => {
    if (!fs.existsSync(pathLike)) {
        return []
    }
    const stat = fs.statSync(pathLike)
    if (stat.isFile()) {
        return [path.resolve(pathLike)]
    } else if (stat.isDirectory()) {
        const ps = fs.readdirSync(pathLike).filter(n => !/^\./.test(n)).map(n => path.join(pathLike, n))
        const rss = ps.map(getFiles).flat(1)
        return rss
    }
    return []
}

type TProjectConfig = {
    miniprogramRoot: string;
    appid: string;
}

const getProjectConfig = (filePath: string = '../project.config.json') => {
    const file = path.resolve(__dirname, filePath)
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        throw `项目配置文件'project.config.json'不存在: ${file}`
    }
    const jsonStr = fs.readFileSync(file, 'utf-8')
    const config = JSON.parse(jsonStr)
    return config as TProjectConfig
}

const getMiniprogramRoot = () => {
    const { miniprogramRoot = '' } = getProjectConfig()
    const p = path.resolve(__dirname, '..', miniprogramRoot || '')
    return p
}

const COMPONENTS_PATH = 'components'

const getComponentsRoot = () => {
    return path.resolve(getMiniprogramRoot(), COMPONENTS_PATH)
}

export const getComponentList = () => {
    const names = fs.readdirSync(getComponentsRoot()).filter(n => !/^\./.test(n))
    return names
}

const getComponent = (name: string) => {
    name = name.replace(/^[\.\\\/]+/, '')
    const pathLike = path.resolve(getComponentsRoot(), name)
    if (!fs.existsSync(pathLike) || !fs.statSync(pathLike).isDirectory()) {
        throw `组件'${name}'不存在: ${pathLike}`
    }
    return {
        basename: pathLike,
        files: getFiles(pathLike),
    }
}


const getCurrentProjectConfig = () => {
    const cwd = process.cwd()
    const pathLike = path.resolve(cwd, 'project.config.json')
    if (!fs.existsSync(pathLike) || !fs.statSync(pathLike).isFile()) {
        throw `在当前工作目录未找到'project.config.json'文件，当前目录可能不是微信小程序项目目录。`
    }
    const json = fs.readFileSync(pathLike, 'utf-8')
    const config = JSON.parse(json) as TProjectConfig
    return config
}

const getCurrentMiniprogramRoot = () => {
    const { miniprogramRoot = '' } = getCurrentProjectConfig()
    const p = path.resolve(process.cwd(), miniprogramRoot || '')
    return p
}

const COMPONENTS_TARGET_PATH = 'wxmc-components'

const getCurrentComponentsRoot = (subPackage: string) => {
    return path.resolve(getCurrentMiniprogramRoot(), subPackage, COMPONENTS_TARGET_PATH)
}

export const installComponent = (name: string, subPackage: string) => {
    name = name.replace(/^[\.\\\/]+/, '')
    const { basename, files } = getComponent(name)
    const currentProjectRoot = getCurrentMiniprogramRoot()
    const targetPath = path.resolve(getCurrentComponentsRoot(subPackage), name)

    const newFiles: string[] = []

    files.forEach(filename => {
        const relativeName = path.relative(basename, filename)
        const targetFile = path.join(targetPath, relativeName)
        const dirname = path.dirname(targetFile)
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true })
        }
        fs.copyFileSync(filename, targetFile)
        newFiles.push(targetFile)
    })
    return newFiles.map(p => path.relative(currentProjectRoot, p))
}

export const componentNeedInstall = (name: string, subPackage: string) => {
    name = name.replace(/^[\.\\\/]+/, '')
    const comps = getComponentList()
    if (!comps.includes(name)) {
        throw `组件'${name}'不存在`
    }
    const targetPath = path.resolve(getCurrentComponentsRoot(subPackage), name, 'index.wxml')
    return !fs.existsSync(targetPath)
}

export const useComponent = (name: string, route: string, subPackage: string, tag: string = name) => {
    route = route.replace(/^[\.\\\/]+/, '')
    name = name.replace(/^[\.\\\/]+/, '')
    tag = tag.replace(/^[\.\\\/]+/, '')
    const currentProjectRoot = getCurrentMiniprogramRoot()
    const page = path.join(currentProjectRoot, route + '.wxml')
    const pageConf = path.join(currentProjectRoot, route + '.json')
    if (!fs.existsSync(page)) {
        throw `路由'${route}'不存在`
    }
    if (!fs.existsSync(pageConf)) {
        fs.writeFileSync(pageConf, '{}')
    }

    const json = fs.readFileSync(pageConf, 'utf-8')
    const config = JSON.parse(json)
    if (!config.usingComponents) {
        config.usingComponents = {}
    }

    if (!!config.usingComponents[tag]) {
        throw `名为'${tag}'的组件已存在于页面中`
    }

    const importPath = '/' + path.relative(getCurrentMiniprogramRoot(), path.join(getCurrentComponentsRoot(subPackage), name, 'index'))
    config.usingComponents[tag] = importPath
    fs.writeFileSync(pageConf, JSON.stringify(config, null, '    '))
}

export const removeComponent = (tag: string, route: string) => {
    route = route.replace(/^[\.\\\/]+/, '')
    tag = tag.replace(/^[\.\\\/]+/, '')
    const currentProjectRoot = getCurrentMiniprogramRoot()
    const page = path.join(currentProjectRoot, route + '.wxml')
    const pageConf = path.join(currentProjectRoot, route + '.json')
    if (!fs.existsSync(page)) {
        throw `页面'${route}'不存在`
    }
    if (!fs.existsSync(pageConf)) {
        throw `页面中没有名为'${tag}'的组件`
    }

    const json = fs.readFileSync(pageConf, 'utf-8')
    const config = JSON.parse(json)
    if (!config.usingComponents || !config.usingComponents[tag]) {
        throw `页面中没有名为'${tag}'的组件`
    }

    delete config.usingComponents[tag]
    fs.writeFileSync(pageConf, JSON.stringify(config, null, '    '))
}

const getAppConfig = () => {
    const appFile = path.join(getCurrentMiniprogramRoot(), 'app.json')
    if (!fs.existsSync(appFile) || !fs.statSync(appFile).isFile()) {
        throw `文件'app.json'不存在`
    }
    const json = fs.readFileSync(appFile, 'utf-8')
    return JSON.parse(json) as {
        pages: string[];
        subPackages?: {
            root: string;
            pages: string[];
        }[];
    }
}

export const getRouteSubPackage = (route: string) => {
    const { subPackages = [] } = getAppConfig()
    const startPath = route.split(/[\/\\]+/).shift() || ''
    if (startPath && Array.isArray(subPackages) && subPackages.some(s => s.root === startPath)) {
        return startPath
    } else {
        return ''
    }
}

export const scanUsing = () => {
    const viewers = getProjectView()
    const components = getComponentList().map(name => ({ name, path: `/${COMPONENTS_TARGET_PATH}/${name}/index` }))
    const baseDir = getCurrentMiniprogramRoot()
    const map: { route: string, component: string; tag: string; path: string }[] = []
    viewers.forEach(view => {
        const dir = path.dirname(view.wxml)
        const json = fs.readFileSync(view.json, 'utf-8')
        const { usingComponents } = JSON.parse(json) as any
        if (!usingComponents) {
            return
        }
        Object.entries(usingComponents).forEach(([tag, key]) => {
            if (typeof key === 'string') {
                const p = key.startsWith('/') ? key : ('/' + path.relative(baseDir, path.resolve(dir, key)))
                const usings = components.filter(comp => p.endsWith(comp.path))
                usings.forEach(using => {
                    map.push({
                        route: view.fullRoute,
                        tag,
                        component: using.name,
                        path: key
                    })
                })
            }
        })
    })

    const routes = Array.from(new Set(map.map(m => m.route)))
    return routes.map(route => ({
        route,
        using: map.filter(it => it.route === route)
    }))
}

export const getUsingCount = (tag: string, route: string) => {
    const reg = new RegExp('<' + tag + '[\\s\\/>]?', 'g')
    const wxml = path.join(getCurrentMiniprogramRoot(), route + '.wxml')
    const content = fs.readFileSync(wxml, 'utf-8')
    const m = content.match(reg)
    return m ? m.length : 0
}

export const getProjectView = () => {
    const baseDir = getCurrentMiniprogramRoot()
    const files = getFiles(baseDir).filter(f => !f.includes(COMPONENTS_TARGET_PATH) && f.endsWith('.json')).filter(f => {
        const wxml = f.replace(/\.json$/, '.wxml')
        return fs.existsSync(wxml)
    }).map(json => {
        const wxml = json.replace(/\.json$/, '.wxml')
        const fullRoute = path.relative(baseDir, json.replace(/\.json$/, ''))
        const config = JSON.parse(fs.readFileSync(json, 'utf-8'))
        const subPackage = getRouteSubPackage(fullRoute)
        return {
            route: path.relative(subPackage, fullRoute),
            fullRoute,
            wxml,
            json,
            component: !!config.component,
            subPackage,
        }
    })
    return files
}

export const scanReffer = () => {

    const viewers = getProjectView()
    const tmp = getComponentList().map(name => ({ name, path: `${COMPONENTS_TARGET_PATH}/${name}/index` }))
    const { subPackages = [] } = getAppConfig()
    const baseDir = getCurrentMiniprogramRoot()
    const items: { name: string; path: string; subPackage: string; pages: { route: string; tag: string; count: number; component: boolean; }[]; }[] = []

    tmp.forEach(t => {
        const wxml = path.join(baseDir, t.path + '.wxml')
        if (fs.existsSync(wxml)) {
            items.push({ name: t.name, path: '/' + t.path, pages: [], subPackage: '', })
        }
    })

    subPackages.forEach(sub => {
        tmp.forEach(t => {
            const wxml = path.join(baseDir, sub.root, t.path + '.wxml')
            if (fs.existsSync(wxml)) {
                items.push({ name: t.name, path: '/' + sub.root + '/' + t.path, pages: [], subPackage: sub.root,})
            }
        })
    })

    viewers.forEach(view => {
        const dir = path.dirname(view.wxml)
        const content = fs.readFileSync(view.json, 'utf-8')
        const { usingComponents } = JSON.parse(content)
        if (!usingComponents) {
            return
        }
        Object.entries(usingComponents).forEach(([tag, key]) => {
            if (typeof key === 'string') {
                const p = key.startsWith('/') ? key : ('/' + path.relative(baseDir, path.resolve(dir, key)))
                const it = items.find(it => it.path === p)
                if (it) {
                    it.pages.push({
                        route: view.fullRoute,
                        tag,
                        count: getUsingCount(tag, view.fullRoute),
                        component: view.component,
                    })
                }
            }
        })
    })

    return items
}