const { createApp } = Vue
const url = 'https://vue3-course-api.hexschool.io'
const path = 'master1386'
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    // validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});
const productModal = {
    //當ＩＤ變動時，取得遠端資料，並呈現modal
    props: ['id', 'addToCart', 'openModal'],
    data() {
        return {
            tempProduct: {},
            modal: {}
        }
    },
    template: `#userProductModal`,
    mounted() {
        this.modal = new bootstrap.Modal(this.$refs.modal)
        this.$refs.modal.addEventListener('hidden.bs.modal', (event) => {
            console.log('openModal關閉了');
            this.openModal('')
        })

    },
    watch: {
        id() {
            if (this.id) {

                axios.get(`${url}/v2/api/${path}/product/${this.id}`)
                    .then(res => {
                        console.log('產品列表', res.data);
                        this.tempProduct = res.data.product
                        this.modal.show()
                    })
                    .catch(err => {
                        console.log(err.data);
                    })
                //console.log(this.id);
            }
        }
    },
    methods: {
        hide() {
            this.modal.hide()
        }
    }
}
const app = createApp({
    data() {
        return {
            products: [],
            productId: '',
            cart: {},
            user: {}
        }
    },
    methods: {
        getProduct() {
            axios.get(`${url}/v2/api/${path}/products/all`)
                .then(res => {
                    //console.log('產品列表', res.data);
                    this.products = res.data.products
                })
                .catch(err => {
                    console.log(err.data);
                })
        },
        openModal(id) {
            this.productId = id
            console.log('外層', id);
        }
        , addToCart(product_id, qty = 1) {
            const data = {
                product_id,
                qty
            }
            axios.post(`${url}/v2/api/${path}/cart`, { data })
                .then(res => {
                    //console.log('加入購物車', res.data);
                    this.$refs.productModal.hide()
                    this.getCarts()
                })


        },
        getCarts() {
            axios.get(`${url}/v2/api/${path}/cart`)
                .then(res => {
                    //console.log('購物車', res.data);
                    this.cart = res.data.data
                })

        },
        updateCartItem(item) {//購物車id 產品id
            const data = {
                "product_id": item.product.id,
                "qty": item.qty
            }
            console.log(data, item.id);
            axios.put(`${url}/v2/api/${path}/cart/${item.id}`, { data })
                .then(res => {
                    //console.log('更新購物車', res.data);
                    this.getCarts()

                })
        },
        deleteItem(item) {
            axios.delete(`${url}/v2/api/${path}/cart/${item.id}`)
                .then(res => {
                    //console.log('刪除購物車', res.data);
                    this.getCarts()

                })
        },
        deleteAllItem() {
            axios.delete(`${url}/v2/api/${path}/carts`)
              .then(() => {
                this.getCarts()
                alert('已清空購物車')
              })
              .catch(err => {
                alert(err.data.message)
              })
          },
        onSubmit() {
            alert('送出成功');
            this.$refs.form.resetForm()
        }


    },
    mounted() {
        this.getProduct()
        this.getCarts()
    },
    components: { productModal }
})
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app')


