const { Router } = require('express');
const fs = require('fs');

const router = Router();
const filePath = 'src/data/carts.json';

const readCarts = () => {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

const writeCarts = (carts) => {
    fs.writeFileSync(filePath, JSON.stringify(carts, null, 2));
};

// Ruta POST para crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: carts.length + 1,  // Auto-genera el ID
        products: [],
    };
    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});

// Ruta GET para listar productos en un carrito
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
});

// Ruta POST para agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const product = cart.products.find(p => p.product === pid);
    if (product) {
        product.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    writeCarts(carts);
    res.json(cart);
});

module.exports = router;
