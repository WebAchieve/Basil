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
    btnOrder = document.querySelector('.btn-order'),
    totalPrice = document.querySelector('.total-price')
   



let cartContainer = [];
let cart = [];
let modalTotal = '';
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
            <div class="col-lg-3 col-6 pb-3">
            <div class="goods-card" data-id = "${_product.id}">
                <div class="goods-card_title">
                    <h2>${_product.name}</h2>
                    <div class="goods-card__img">
                        <img src=".${_product.img}" alt="${_product.name}">
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
                modalTotal = total
                totalPrice.innerHTML = total;
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
            this.Chips(productItem.name)
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
            <div class="col-8 col-md-6 d-flex flex-column ">
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
            <div class="col-4 col-md-6">
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
        } else {

            const order = `
            <div class="modal-order">
            <h2 class="modal-body_title">Оформление заказа</h2>
            <div class="row">
            <div class="col-lg-5 col-12">
                <div class="modal-goods">
                    
                </div>
            </div>
            <div class="col-lg-7 col-12">
                <form class="modal-form">
                    <div class="total-information">
                        <input class="modal-input" type="text" name="phone" autocomplete="off" value=""
                            placeholder="Телефон" required>
                        <input class="modal-input" type="text" name="name" autocomplete="off" value=""
                            placeholder="Имя" required>
                    </div>
                    <div class="total-information">
                        <input class="modal-input" type="text" name="shipping_street" autocomplete="off"
                            placeholder="Улица" required>
                        <div class="d-flex">
                            <input class="modal-input" type="text" name="shipping_house" autocomplete="off"
                                placeholder="Дом">
                            <input class="modal-input" type="text" name="shipping_entrance"
                                autocomplete="off" value="" placeholder="Подъезд">
                            <input class="modal-input" type="text" name="shipping_apartment"
                                autocomplete="off" value="" placeholder="Квартира">
                        </div>


                    </div>
                    <ul class="modal-list">
                        <li><input type="radio">Оплата курьеру</li>
                        <li><input type="radio">Оплата на карту</li>
                    </ul>
                    <textarea class="modal-textarea" name="comment" autocomplete="off"
                        placeholder="Комментарий" rows="1"></textarea>
                    <div class="total-order">
                        <div class="total-list">
                            <div class="total-list_item">
                                <p>Заказ:</p>
                                <span>${modalTotal} грн</span>
                            </div>
                            <div class="total-list_item">
                                <p>Скидка:</p>
                                <span>0 грн</span>
                            </div>
                            <div class="total-list_item">
                                <p>К оплате:</p>
                                <span>${modalTotal} грн</span>
                            </div>
                        </div>
                        <button class="main-button confirm" type="submit">
                            <img src="img/btn_border_white.png" alt="order">
                            <span>Оформить заказ</span>
                        </button>
                    </div>


                </form>
            </div>
        </div>
        </div>
            `;

            modalBody.innerHTML = order;
            const orderContainer = document.querySelector('.modal-goods')
            const orderCart = Storage.getCart()
            orderCart.forEach(el => {
                const orderItem = document.createElement('div');
                orderItem.classList.add('modal-goods__item')
                orderItem.innerHTML = `
                <div class="modal-goods_img">
                    <img src=".${el.img}" alt="${el.name}">
                </div>
                <div class="modal-goods_info">
                    <div class="modal-goods_info--title">
                        <h3>${el.name}</h3>
                        <span>${el.price * el.count}гр</span>
                    </div>
                    <div class="modal-goods_info--weight">
                        <small>${el.weight}гр</small>
                        <span>Количество: ${el.count}</span>
                    </div>
                </div>
            `;
                orderContainer.append(orderItem)
            })
            const confirmButton =  document.querySelector('.confirm')
           confirmButton.addEventListener('click',()=>{
                const confirm = `
                <div class="confirm-box">
                <div class="confirm-box_item">
                <img src="img/check.svg" alt="check">
                </div>
                <div class="confirm-box_item">
                <h4>Ваш заказ передан в доставку</h4>
                <p>Приятного аппетита!</p>
                </div>
                </div>
                `
                modalBody.innerHTML = confirm
            })

        }


    }
    //Добаление листьев
    Animation(){
        let main = document.querySelector('main')
       
      
    
       for(let i =0; i<=3; i++){
       let random = Math.floor(Math.random() * (360 - 1 + 1)) + 1;
        let leaves = document.createElement('div');
       leaves.classList.add('leaves')
       leaves.innerHTML = `<img src="img/Subtract.png" alt="leaves">`
        /* leaves.style.transform = 'rotate(' + random + 'deg)'; */
        main.append(leaves)
       
       }
       window.addEventListener('scroll',()=>{
        document.querySelectorAll('.leaves').forEach(element => {
            element.style.transform = 'rotate(' + Math.round(window.pageYOffset)/10+ 'deg)';
        });
        let navbar = document.querySelector('.navbar');
        let header = document.querySelector('.header-menu')
        let stickyFix = document.querySelectorAll('.sticky-fix')
       let sticky = header.offsetTop;
       console.log(sticky)
        if (window.pageYOffset >= sticky) {
            navbar.classList.add("sticky")
            stickyFix.forEach(element => {
               element.classList.add("sticky")
            }); 
        } else {
            navbar.classList.remove("sticky");
            stickyFix.forEach(element => {
                element.classList.remove("sticky")
             }); 
        }
        
       })
    }
    //Всплывающие сообщения
    Chips(name){
        const chipsBox = document.querySelector('.chips')
        const chips = document.createElement('div');
        chips.classList.add('chips-item')
        chips.innerHTML = `<p>${name} добавлен в корзину</p> <img src="img/check.svg" alt="chips">`
        chipsBox.appendChild(chips)
        setTimeout(
            ()=>{
                chips.remove()
            },
            3000
        )
        

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
    basketIcon.forEach(element => {
            element.addEventListener('click', () => {
                basket.classList.add('active')
            })
    }); 
   
})