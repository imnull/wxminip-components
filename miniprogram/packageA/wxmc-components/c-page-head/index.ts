// components/page-head/index.ts
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        gap: {
            type: Number,
            value: 12,
        },
        title: {
            type: String,
            value: '页面标题'
        },
        hideIcon: {
            type: Boolean,
            value: false,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        screenWidth: 0,
        screenHeight: 0,
        backStatus: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleBack() {
            const { backStatus } = this.data
            if(backStatus === 1) {
                wx.switchTab({
                    url: '/pages/index/index'
                })
            } else if(backStatus === 2) {
                wx.navigateBack({})
            }
        }
    },
    lifetimes: {
        attached() {
            const { screenHeight, screenWidth } = wx.getSystemInfoSync()
            const rect = wx.getMenuButtonBoundingClientRect()
            const pages = getCurrentPages()
            
            const { left, top, width, height, right, bottom } = rect
            this.setData({
                left, top, right, bottom, width, height,
                screenHeight, screenWidth,
                backStatus: pages.length > 1 ? 2 : 1,
            })
        }
    }
})
