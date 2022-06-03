const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

const createProductImageElement = (imageSource) => {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
};

const createCustomElement = (element, className, innerText) => {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
};

const createProductItemElement = ({ sku, name, image }) => {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'),
  );

  return section;
};

const getCartItemData = (string) => {
  const formattedString = string
    .replace('SKU:', '')
    .replace('NAME:', '')
    .replace('PRICE:', '')
    .replace('$', '');

  const [sku, name, salePrice] = formattedString
    .split('|')
    .map((info) => info.trim());

  return { sku, name, salePrice };
};

const getAllItemsFromCart = () => JSON.parse(getSavedCartItems()) || [];

const totalPrice = () => {
  let value = 0;

  getAllItemsFromCart().forEach(({ salePrice }) => {
    value += parseFloat(salePrice);
  });

  value = Math.round(value * 100) / 100;
  qs('.total-price').innerText = value;
};

const localStorageUpdate = () => {
  const itemsOnCart = qsa('.cart__item');
  const itemsData = [];

  for (let index = 0; index < itemsOnCart.length; index += 1) {
    const formattedString = getCartItemData(itemsOnCart[index].innerText);
    itemsData.push(formattedString);
  }

  saveCartItems(JSON.stringify(itemsData));
  totalPrice();
};

const getSkuFromProductItem = (item) =>
  item.querySelector('span.item__sku').innerText;

const cartItemClickListener = (event) => {
  event.target.remove();
  localStorageUpdate();
};

const createCartItemElement = ({ sku, name, salePrice }) => {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
};

const addItemsToSection = async () => {
  const itemsSection = qs('.items');

  const allSearchedProductsFromAPI = await fetchProducts('computador');
  allSearchedProductsFromAPI.results.forEach((item) => {
    const { id: sku, title: name, thumbnail: image } = item;

    const itemElement = createProductItemElement({ sku, name, image });
    itemsSection.appendChild(itemElement);
  });
};

const CART_ITEMS = '.cart__items';

const addItemsToCart = async () => {
  const addButtons = qsa('.item__add');

  addButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const myParent = button.parentElement;
      const queryId = getSkuFromProductItem(myParent);

      const getItemFromAPI = await fetchItem(queryId);

      const { id: sku, title: name, price: salePrice } = getItemFromAPI;

      const itemToAdd = createCartItemElement({ sku, name, salePrice });
      qs(CART_ITEMS).appendChild(itemToAdd);

      localStorageUpdate();
    });
  });
};

const clearCart = () => {
  qs(CART_ITEMS).innerText = '';
  localStorageUpdate();
};

const loading = (load) => {
  if (load) {
    const element = createCustomElement('p', 'loading', 'carregando...');
    qs('.items').appendChild(element);
  } else {
    qs('.loading').remove();
  }
};

window.onload = async () => {
  loading(true);
  await addItemsToSection();
  loading(false);
  
  await addItemsToCart();

  getAllItemsFromCart().forEach((item) => {
    qs(CART_ITEMS).appendChild(createCartItemElement(item));
  });

  totalPrice();

  qs('.empty-cart').onclick = clearCart;
};
