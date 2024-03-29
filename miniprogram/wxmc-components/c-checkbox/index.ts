// components/checkbox/index.ts
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        checked: {
            type: Boolean,
            value: false,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleCheckTap() {
            const { checked } = this.properties
            this.triggerEvent('change', checked)
        }
    }
})
