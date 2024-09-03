const { Router } = require('express');
const fs = require('fs');

const router = Router();
const filePath = 'src/data/products.json';

const readProducts = () => {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

const writeProducts = (products) => {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
};

// Ruta GET para listar productos
router.get('/', (req, res) => {
    const limit = req.query.limit;
    const products = readProducts();
    if (limit) {
        return res.json(products.slice(0, limit));
    }
    res.json(products);
});

// Ruta GET para obtener un producto por ID
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const product = products.find(p => p.id === pid);
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
});

// Ruta POST para agregar un nuevo producto
router.post('/', (req, res) => {
    const products = readProducts();
    const newProduct = {
        id: products.length + 1,  // Auto-genera el ID
        ...req.body,
        status: true,
    };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// Ruta PUT para actualizar un producto
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === pid);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const updatedProduct = { ...products[productIndex], ...req.body };
    products[productIndex] = updatedProduct;
    writeProducts(products);
    res.json(updatedProduct);
});

// Ruta DELETE para eliminar un producto
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === pid);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    products.splice(productIndex, 1);
    writeProducts(products);
    res.status(204).end();
});

module.exports = router;
