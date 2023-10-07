// components/page-body/index.ts
Component({
    options: {
        multipleSlots: true,
    },
    /**
     * 组件的属性列表
     */
    properties: {
        showNomore: {
            type: Boolean,
            value: true,
        },
        refresherTriggered: {
            type: Boolean,
            value: false,
        },
        update: {
            type: Number,
            value: 0,
            observer(val) {
                if(val > 0) {
                    this.updateLayout()
                }
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        H: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleReachBottom(e: any) {
            this.triggerEvent('scrollend')
        },
        handleRefresh(e: any) {
            this.triggerEvent('pull')
        },
        updateLayout() {
            this.createSelectorQuery().select('.page-body-scroll').boundingClientRect((rect: any) => {
                if(!rect) {
                    return
                }
                const { top } = rect
                const { windowHeight } = wx.getSystemInfoSync()
                this.setData({ H: Math.max(0, windowHeight - top) })
            }).exec()
        }
    },
    lifetimes: {
        
        attached() {
            this.updateLayout()
        }
    }
})
