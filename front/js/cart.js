// Objet de test
let testObject = {
    name : 'test name',
    price : 12000,
    _id : 123456789,
    imageUrl : "https://via.placeholder.com/150x150",
    varnish : ['red', 'green', 'blue']
};

// inputs html de la section checkout, utilisés dans les fonctions checkitems et regexCheck 
let checkoutName = document.getElementById('checkoutInputName');
let checkoutMail = document.getElementById('checkoutInputMail');
let checkoutTel = document.getElementById('checkoutInputTel');
let checkoutCardNumber = document.getElementById('checkoutInputCardNumber');
let checkoutCardDate = document.getElementById('checkoutInputCardDate');
let checkoutCardCvc = document.getElementById('checkoutInputCardCvc');
let checkoutAdress = document.getElementById('checkoutInputAdress');
let checkoutPostalCode = document.getElementById('checkoutInputPostalCode');
let checkoutCity = document.getElementById('checkoutInputCity');

// Objet de vérification des inputs du formulaire de checkout
let inputChecker = {
    name : false,
    mail : false,
    tel : false,
    cardNumber : false,
    cardDate : false,
    cardCvc : false,
    adress : false,
    postalCode : false,
    city : false 
}

// expressions régulières utilisés pour déterminer si les inputs du checkout sont valides 
const regexName = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
const regexMail = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const regexTel = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
const regexCardNumber = /^[0-9]*$/;
const regexCardDate = /^(0[1-9]|1[0-2])\/?(([0-9]{4}|[0-9]{2})$)/;
const regexCardCvc = /^[0-9]{3,4}$/;
const regexAdress = /\w+(\s\w+){2,}/;
const regexPostalCode = /\d{2}[ ]?\d{3}/;
const regexCity = /^[a-zA-Z',.\s-]{1,25}$/;

// stock et parse l'objet 'cart' du local storage
let cart = JSON.parse(localStorage.getItem('cart'));

// bouton d'envoi du formulaire de checkout
let submitBtn = document.getElementById('CheckoutSubmit');

// le tableau 'prices' va récupérer les prix et les additionner entre eux pour afficher le montant total
let prices = [];

// le tableau 'products' va récupérer les id du 'cart' dans le local storage
// il va en suite être appelé dans l'objet 'orderInfos'
let products = [];
for (let i = 0; i < Object.keys(cart).length; i++) {
    products.push(Object.values(cart)[i].id);
}

// Objet qui va être envoyé dans le POST du fetch API (fonction 'postData')
var orderInfos = {};

// Supprime l'élément sélectionné au clic du bouton

// Au clic du bouton de supression : boucle les valeurs de 'cart' et si l'id d'une de ces valeurs est égale 
// à l'id de l'article en question,supprime cet article du local storage
function removeItem(btn, res, color) {
    btn.addEventListener('click', () => {  
        for (let i = 0; i< Object.values(cart).length; i++) {
            let storageItem = `${Object.values(cart)[i].id}${Object.values(cart)[i].color}`;
            if (`${res._id}${color}` == storageItem) {
                delete cart[`${res._id}${color}`];
                cart = JSON.stringify(cart);
                localStorage.setItem('cart', cart);
            }
        }
        if (cart.length > 2) {  // quand l'objet 'cart' est vide, la longeur de sa string est de 2 et non 0 car les accolades restent tant que l'objet existe 
            window.location.reload();  
        } else {
            localStorage.removeItem('cart');
            window.location.replace("../html/emptyCart.html");
        }
    })   
}

// change la valeur 'quantity' de l'élément sélectionné à la valeur sélectionnée dans l'input

// Au changement de valeur de l'input: boucle les valeurs de 'cart' et si l'id d'une de ces valeurs est égale 
// à l'id de l'article en question,change la valeur 'quantité' de cet article à la valeur séléctionnée dans l'input
function incrementItem(input, res, color) {
    input.addEventListener('input', () => {  
        for (let i = 0; i< Object.values(cart).length; i++) {
            let storageItem = `${Object.values(cart)[i].id}${Object.values(cart)[i].color}`;
            
            if (`${res._id}${color}` == storageItem) {
                cart[`${res._id}${color}`].quantity = input.value;
                cart = JSON.stringify(cart);
                localStorage.setItem('cart', cart);
            }
        }
        if (cart.length > 2) {
            window.location.reload();  
        } else {
            localStorage.removeItem('cart');
            window.location.replace("../html/emptyCart.html");
        }
    })   
}

// Créé les balises html et affiche les éléments (res) dans le panier
// de la page panier (cart.html)
function displayCartItems(res, qtt, color){
    let item = document.createElement('div');
    item.classList.add('cartItem');
    let container = document.querySelector('.cartItems');
    container.appendChild(item);
    
    let imageCtn = document.createElement('div');
    imageCtn.classList.add('cartItemImage');
    item.appendChild(imageCtn);

    let image = document.createElement('img');
    image.src = res.imageUrl;
    image.setAttribute('alt', res.name);
    imageCtn.appendChild(image);

    let name = document.createElement('p');
    name.innerText = res.name;
    name.classList.add('cartItemName');
    item.appendChild(name);

    let selectedColor = document.createElement('div');
    selectedColor.classList.add('cartItemColor');
    selectedColor.style.background = color;
    item.appendChild(selectedColor);

    let price = document.createElement('p');
    price.innerText = ((res.price / 100) * qtt) + ' €'; // le prix est divisé par 100 pour le convertir en €
    price.classList.add('cartItemPrice');
    item.appendChild(price);

    let quantity = document.createElement('input')
    quantity.classList.add('cartItemQtt');
    quantity.setAttribute('type', 'number');
    quantity.setAttribute('min', '1');
    quantity.setAttribute('max', '10');
    quantity.value = qtt;
    item.appendChild(quantity);

    prices.push(qtt * (res.price / 100)); // ajoute le prix de l'article au tableau 'prices'
    const reducer = (acc, cur) => acc +cur;
    let total = prices.reduce(reducer); // total = la somme du prix des articles;

    let deleteCross = document.createElement('button');
    deleteCross.classList.add('cartItemDelete');
    deleteCross.setAttribute('id', 'cartItemDelete');
    item.appendChild(deleteCross);
    removeItem(deleteCross, res, color);
    incrementItem(quantity, res, color);

    // affiche le prix total sur les éléments
    document.querySelector('.cartTotalValue').innerText = total + ' €';
    submitBtn.innerText = `Payer ${total} €`;
}

// Si le panier existe: boucle les données de 'cart' et pour chaque donnée:
// récupère ses éléments depuis l'API et lance la fonction 'displayCartItems'
// avec en paramètres les données récupérées de l'API
function getCart() {
    if (cart) {                                                           
        for (let i = 0; i< Object.keys(cart).length; i++) {   
            fetch(`http://localhost:3000/api/furniture/${Object.values(cart)[i].id}`)
                .then(res => {
                    if(res.ok) {
                        res.json().then(data => {
                            displayCartItems(data, Object.values(cart)[i].quantity, Object.values(cart)[i].color);
                        });
                    } else {
                        console.log('Error');
                    }
                })
        }
    }
}





// Si toutes les valeurs de l'objet 'inputChecker' sont 'true' alors enlève l'attribut 'disabled' au bouton d'envoi de formulaire
function checkInputs() {
    if (inputChecker.name && inputChecker.mail && inputChecker.tel && inputChecker.cardNumber && inputChecker.cardDate &&
        inputChecker.cardCvc && inputChecker.adress && inputChecker.postalCode && inputChecker.city) {
        submitBtn.removeAttribute('disabled');
    }
}

// Vérifie si l'input entré en paramètre correspond au regex entré en paramètre.
function regexCheck(input, regex, check) {
    let selector = 'div' + input.id;                                            // permets de récupérer l'id du conteneur de l'input en question
    input.addEventListener('input', () => {                                     // écoute les évènements de l'input,
        if (input.value.match(regex)) {                                         // si la valeur entrée correspond au regex :
            input.classList.add('validInput');                                  // ajoute des bordures vertes à l'input,
            document.getElementById(selector).classList.remove('invalidInput'); // enlève le message d'erreur au conteneur de l'input
            inputChecker[check] = true;                                         // ajoute la valeur 'true' à la donnée de l'objet inputChecker
            orderInfos = {                                                      // update les informations qui vont être stockées dans le POST de l'API
                contact: {
                    firstName: checkoutName.value,
                    lastName: checkoutName.value,
                    address: checkoutAdress.value,
                    city: checkoutCity.value,
                    email: checkoutMail.value
                  },
                  products: products
            }
            checkInputs();                                                      // lance la fonction checkInputs
        } else {                                                                // sinon
            document.getElementById(selector).classList.add('invalidInput');    // affiche le message d'erreur dans le conteneur de l'input
            input.classList.remove('validInput');                               // enlève les bordures vertes à l'input
        }

    })
}

// Au clic du bouton (triger) fais un fetch de type POST avec l'objet 'orderInfos'
// puis fais une redirection vers la page de validation avec en paramètre l'orderId
function postData(triger) {
    triger.addEventListener('click', () => {
        fetch('http://localhost:3000/api/furniture/order', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(orderInfos)
        })
        .then(res => {return res.json()})
        .then(data => {
            window.location.assign(`validation.html?id=${data.orderId}`);
        });
    })
}

// lance les fonctions au chargement de la page
getCart();
regexCheck(checkoutName, regexName, 'name');
regexCheck(checkoutMail, regexMail, 'mail');
regexCheck(checkoutTel, regexTel, 'tel');
regexCheck(checkoutCardNumber, regexCardNumber, 'cardNumber');
regexCheck(checkoutCardDate, regexCardDate, 'cardDate');
regexCheck(checkoutCardCvc, regexCardCvc, 'cardCvc');
regexCheck(checkoutAdress, regexAdress, 'adress');
regexCheck(checkoutPostalCode, regexPostalCode, 'postalCode');
regexCheck(checkoutCity, regexCity, 'city');
postData(submitBtn);