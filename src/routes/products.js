const { Router } = require('express');
const fs = require('fs').promises;  // Usamos promesas para trabajar de forma asincrónica
const { body, validationResult } = require('express-validator');

const router = Router();
const filePath = 'src/data/products.json';

// Funciones para leer y escribir productos
const readProducts = async () => {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
};

const writeProducts = async (products) => {
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
};

// Ruta GET para listar productos
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit;
        const products = await readProducts();
        if (limit) {
            return res.json(products.slice(0, limit));
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los productos' });
    }
});

// Ruta GET para obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const products = await readProducts();
        const product = products.find(p => p.id === pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los productos' });
    }
});

// Ruta POST para agregar un nuevo producto con validaciones
router.post(
    '/',
    [
        body('title').notEmpty().withMessage('El título es obligatorio'),
        body('description').notEmpty().withMessage('La descripción es obligatoria'),
        body('code').notEmpty().withMessage('El código es obligatorio'),
        body('price').isNumeric().withMessage('El precio debe ser un número'),
        body('stock').isInt().withMessage('El stock debe ser un número entero'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const products = await readProducts();
            const newProduct = {
                id: products.length + 1,  // Auto-genera el ID
                ...req.body,
                status: req.body.status || true,
            };

            products.push(newProduct);
            await writeProducts(products);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error al escribir el producto' });
        }
    }
);

// Ruta PUT para actualizar un producto
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const products = await readProducts();
        const productIndex = products.findIndex(p => p.id === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const updatedProduct = { ...products[productIndex], ...req.body };
        products[productIndex] = updatedProduct;
        await writeProducts(products);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Ruta DELETE para eliminar un producto
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const products = await readProducts();
        const productIndex = products.findIndex(p => p.id === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        products.splice(productIndex, 1);
        await writeProducts(products);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;
