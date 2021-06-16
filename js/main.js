const productLayout = document.querySelector('.product-layout'),
    navigationLink = document.querySelectorAll('.navbar-item'),
    basketContent = document.querySelector('.basket-content'),
    createOrder = document.querySelector('.create-order'),
    close = document.querySelector('.close'),
    basket = document.querySelector('.basket'),
    basketIcon = document.querySelectorAll('.header-bag'),
    badge = document.querySelectorAll('.badge'),
    modal = document.querySelector('.modal'),
    modalBody = document.querySelector('.modal-body'),
    btnOrder = document.querySelector('.btn-order')



let cartContainer = []
let cart = []
/// Dispatch Products
class Products {
    async getProducts() {
        try {
            const result = await fetch('db/db.json')
            const data = await result.json();
            return data;
        } catch (e) {
            console.log(e)
        }

    }

}

//RENDER
class Render {
    //Рендер карточек товара
    displayProducts(products) {
        let productCart = '';
        products.forEach(_product => {
            productCart += `
            <div class="col-lg-3 pb-3">
            <div class="goods-card" data-id = "${_product.id}">
                <div class="goods-card_title">
                    <h2>${_product.name}</h2>
                    <div class="goods-card__img">
                        <img src="${_product.img}" alt="${_product.name}">
                    </div>
                    <div class="goods-card_price">
                        <span>${_product.weight}гр</span>
                        <p>ЦЕНА: ${_product.price}грн </p>
                    </div>
                    <button class="main-button goods-card__button">
                        <img src="img/btn_border_white.png" alt="order">
                        <span>В корзину</span>
                    </button>
                    
                </div>
            </div>
            
        </div>
            `
        });
        productLayout.innerHTML = productCart;
        this.productsButtons()
    };
    //Фильтрация по категориям
    filterProducts(data) {
        navigationLink.forEach((el) => {

            el.addEventListener('click', (e) => {
                navigationLink.forEach(element => {
                    element.classList.remove('active')
                });
                const result = e.target.closest('.navbar-item').dataset.field
                e.target.closest('.navbar-item').classList.add('active')
                if (result) {
                    const filteredGoods = data.filter((good) => {
                        return good.category === result
                    })
                    this.displayProducts(filteredGoods)

                }
            })
        })
    }
    //Рендер корзины
    renderCart(cartItem) {
        if (cartItem) {
            basketContent.innerHTML = ''
            cartItem.forEach(cartItems => {
                const notEmpty = document.createElement('div');
                notEmpty.classList.add('basket-item')
                notEmpty.innerHTML = `
                <button class="remove-product" data-remove = "${cartItems.id}">+</button>
                <div class="basket-item__img">
                    <img src=".${cartItems.img}" alt="${cartItems.name}">
                </div>
                <div class="basket-item__content" data-id = "${cartItems.id}">
                    <div class="basket-item__content-top">
                        <p class="content-top__title">${cartItems.name}</p>
                        <span>вес: ${cartItems.weight}</span>
                    </div>
                    <div class="basket-item__content-bottom">
                        <div class="content-bottom__count">
                            <label for="count">Количество:</label>
                            <div class="content-bottom_quantity">
                            <button type="button" class="btn-quantity minus">-</button>
                            <input class="count-product" name="count" readonly="" disabled="" type="text" min="1"
                                max="99" step="1" value="${cartItems.count}">
                            <button type="button" class="btn-quantity plus">+</button>
                            </div>
                        </div>
                        <div class="content-bottom__cost">
                            <div class="cost-product">
                                <p class="label-unit">
                                    Цена <span class="cost">${cartItems.price}</span>
                                    грн.
                                </p>
                            </div>
                            <div class="total-cost-product">
                                <p class="label-unit">Всего <span class="total-cost">${cartItems.price * cartItems.count}</span>
                                    грн.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                basketContent.append(notEmpty)
                createOrder.style.display = 'block';
                let total = 0;
                cartItem.map(item => {
                    total += item.price * item.count;
                })

            });
            badge.forEach(el => {
                el.innerHTML = cartItem.length
            })
            if (cartItem.length == 0) {
                const empty = document.createElement('div');
                empty.classList.add('empty-basket')
                empty.innerHTML = `
                <div class="empty-basket_title">В корзине ничего нет!</div>
					<img src="img/bag.svg" alt="empty basket" class="p-5">
                `
                basketContent.append(empty)
                createOrder.style.display = 'none';
            }
        }
    }
    //Активация кнопок карточек товаров
    productsButtons() {
        const cartButtons = [...document.querySelectorAll('.goods-card')]
        cartButtons.forEach((el) => {
            el.addEventListener('click', (e) => {

                let item = e.target
                let id = item.closest('.goods-card').dataset.id

                if (item.closest('.goods-card__button')) {
                    this.addCart(id)
                    console.log(id)
                } else if (item.closest('.goods-card__img')) {
                    basket.classList.remove('active')
                    this.openModal(id)
                }
            })
        })
    }
    //Добавление в корзину
    addCart(id) {
        let productItem = cart.find(product => product.id === id)
        productItem = { ...productItem, count: 1 }
        cartContainer = Storage.getCart()
        let cartItem = cartContainer.find(item => item.id === id)

        if (!cartItem) {
            cartContainer = [...cartContainer, productItem]
        } else {
            const newCartContainer = cartContainer.map(el => {
                if (el.id === id) {
                    el.count++;
                }
                return el
            })
            cartContainer = newCartContainer
            console.log(newCartContainer)
        }
        Storage.saveCart(cartContainer)
        this.renderCart(cartContainer)
        cartContainer = [];
    }
    //Вычитание товара
    minusCart(id) {
        let newCartContainer = Storage.getCart()
        newCartContainer.map(el => {
            if (el.id === id && el.count > 1) {
                el.count -= 1;
            }
            return el
        })
        Storage.saveCart(newCartContainer)
        this.renderCart(newCartContainer)
    }
    //Удаление товара из корзины
    removeItemCart(id) {
        let basket = Storage.getCart()
        basket = basket.filter(item => item.id !== id)
        Storage.saveCart(basket)
        this.renderCart(basket)
    }
    //Функционал кнопок корзинЫ
    cartLogic() {
        basketContent.addEventListener('click', e => {

            if (e.target.classList.contains('remove-product')) {
                let removeItem = e.target;
                let id = removeItem.dataset.remove;
                this.removeItemCart(id)
            } else if (e.target.classList.contains('plus')) {
                let plus = e.target.closest('.basket-item__content').dataset.id
                this.addCart(plus)
            } else if (e.target.classList.contains('minus')) {
                let minus = e.target.closest('.basket-item__content').dataset.id
                this.minusCart(minus)

            }
        })
        btnOrder.addEventListener('click', () => {
            this.openModal();
            basket.classList.remove('active')
        })


    }
    //Связка функций
    populateCart(data) {
        cartContainer = Storage.getCart()
        this.displayProducts(data)
        this.filterProducts(data)
        this.renderCart(cartContainer)
        cart = data



    }
    //Модальное окно
    openModal(id) {
        document.body.style.overflow = "hidden"
        modal.classList.add('open')
        modal.addEventListener('click', e => {

            if (e.target.classList.contains('close-modal')) {
                modal.classList.remove('open')
                document.body.style.overflow = ""
            } else if (e.target === modal) {
                modal.classList.remove('open')
                document.body.style.overflow = ""
            }


        })

        if (id) {

            let modalCartItem = cart.find(item => item.id === id)
            let modalCart = `
            <div class="row px-2">
            <div class="col-10 col-md-6 d-flex flex-column ">
                <h2 class="modal-body__title">${modalCartItem.name}</h2>
                <div class="modal-body_wheight">
                    <p>Вес:</p>
                    <span class="modal-body_wheight-icon">${modalCartItem.weight}гр</span>
                </div>
                <div class="modal-body_bottom">
                    <span class="modal-body_price">Цена:<span class="currency"> ${modalCartItem.price}грн</span> </span>
                
                    <button class="main-button modal-body_button" data-id="${modalCartItem.id}">
                    <img src="img/btn_border_white.png" alt="order">
                    <span>В корзину</span>
                </button>
                </div>
            </div>
            <div class="col-2 col-md-6">
                <div class="thumbnail">
                    <img src=".${modalCartItem.img}" alt="${modalCartItem.name}">
                </div>
            </div>
            <div class="col-12 pt-3">
                <p class="modal-body_description">${modalCartItem.description}</p>
            </div>

        </div>
                  `;
            modalBody.innerHTML = modalCart
            const modalButton = document.querySelector('.modal-body_button')
            const idx = modalButton.dataset.id
            modalButton.addEventListener('click', () => {
                this.addCart(idx)
            })
        } 


    }
    Animation(){
        let main = document.querySelector('main')
       
      
    
       for(let i =0; i<=3; i++){
       let random = Math.floor(Math.random() * (360 - 1 + 1)) + 1;
        let leaves = document.createElement('div');
       leaves.classList.add('leaves')
       leaves.innerHTML = `<img src="img/Subtract.png" alt="leaves" data="${i}">`
        /* leaves.style.transform = 'rotate(' + random + 'deg)'; */
        main.append(leaves)
       
       }
       window.addEventListener('scroll',()=>{
        document.querySelectorAll('.leaves').forEach(element => {
            element.style.transform = 'rotate(' + Math.round(window.pageYOffset)/10+ 'deg)';
        });
        
        
        
       })
    }
}
//Storage

class Storage {
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

    }
}
//-----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const render = new Render();
    products.getProducts().then(data => {
        render.populateCart(data)
        render.cartLogic()
        render.Animation()
    })
    close.addEventListener('click', () => {
        basket.classList.remove('active')
    })
    basketIcon.forEach(el => {
        el.addEventListener('click', () => {
            basket.classList.add('active')
        })
    })
})